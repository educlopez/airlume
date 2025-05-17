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
        } else {
          console.warn("Unknown platform:", row.platform);
          continue;
        }
        // LOG: payload para Bluesky
        if (row.platform === "bluesky") {
          console.log("BLUESKY PUBLISH PAYLOAD:", {
            postContent: post.response,
            id: post.id,
            userId: post.user_id,
          });
        }
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postContent: post.response, id: post.id, userId: post.user_id }),
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
