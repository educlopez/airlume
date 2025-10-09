import { schedules } from "@trigger.dev/sdk/v3";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const scheduledPostTask = schedules.task({
  id: "scheduled-post-task",
  run: async () => {
    const now = new Date().toISOString();

    // 1. Buscar TODOS los posts en queue que ya deben publicarse (multi-plataforma)
    const { data: rows, error } = await supabaseAdmin
      .from("generations_platforms")
      .select("*, generation:generations(*)")
      .eq("status", "queue")
      .lte("scheduled_at", now);

    if (error) {
      console.error("Supabase fetch error:", error);
      return;
    }

    if (!rows || rows.length === 0) {
      console.log("No scheduled posts to publish");
      return;
    }

    for (const row of rows) {
      const post = row.generation;
      if (!post) {
        console.error("No generation found for row", row.id);
        continue;
      }
      try {
        let endpoint = null;
        if (row.platform === "twitter") {
          endpoint = `${process.env.NEXT_PUBLIC_BASE_URL}/api/twitter/publish`;
        } else if (row.platform === "bluesky") {
          endpoint = `${process.env.NEXT_PUBLIC_BASE_URL}/api/bluesky/publish`;
        } else if (row.platform === "linkedin") {
          endpoint = `${process.env.NEXT_PUBLIC_BASE_URL}/api/linkedin/publish`;
        } else {
          console.warn("Unknown platform:", row.platform);
          continue;
        }
        // LOG: payload for debugging
        if (row.platform === "bluesky") {
          console.log("BLUESKY PUBLISH PAYLOAD:", {
            postContent: post.response,
            id: post.id,
            userId: post.user_id,
          });
        }
        if (row.platform === "linkedin") {
          console.log("LINKEDIN PUBLISH PAYLOAD:", {
            postContent: post.response,
            id: post.id,
            userId: post.user_id,
          });
        }
        // Prepare payload based on platform
        const payload: {
          postContent: string;
          id: string;
          userId: string;
          imageUrl?: string | null;
          imageBase64?: string | null;
        } = {
          postContent: post.response,
          id: post.id,
          userId: post.user_id,
        };

        // Note: Twitter doesn't support images with OAuth 2.0 (API limitation)
        // For Bluesky, need to convert to base64
        // For LinkedIn, send imageUrl directly
        if (row.platform === "linkedin") {
          payload.imageUrl = post.image_url || null;
        } else if (row.platform === "bluesky" && post.image_url) {
          // Convert image to base64 for Bluesky
          try {
            const imageRes = await fetch(post.image_url);
            const blob = await imageRes.blob();
            const arrayBuffer = await blob.arrayBuffer();
            const base64 = Buffer.from(arrayBuffer).toString("base64");
            payload.imageBase64 = base64;
          } catch (err) {
            console.error("Failed to convert image to base64 for Bluesky:", err);
          }
        }
        // Twitter: Don't send image data (not supported with OAuth 2.0)

        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        console.log(`${row.platform.toUpperCase()} PUBLISH RESPONSE:`, JSON.stringify(json));
        if (!res.ok) {
          console.error(`Failed to publish to ${row.platform}:`, json);
          // Opcional: puedes guardar el error en error_message y marcar como failed
          await supabaseAdmin
            .from("generations_platforms")
            .update({ status: "failed", error_message: json.error || JSON.stringify(json) })
            .eq("id", row.id);
        } else {
          // Marcar como sent
          await supabaseAdmin
            .from("generations_platforms")
            .update({ status: "sent", published_post_id: json?.data?.data?.id || null, error_message: null })
            .eq("id", row.id);
          console.log(`Published post to ${row.platform}:`, post.id);
        }
      } catch (err) {
        console.error(`Error publishing post to ${row.platform}:`, err);
        await supabaseAdmin
          .from("generations_platforms")
          .update({ status: "failed", error_message: String(err) })
          .eq("id", row.id);
      }
    }
  },
});
