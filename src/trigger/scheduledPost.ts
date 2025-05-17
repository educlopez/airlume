import { schedules } from "@trigger.dev/sdk/v3";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const scheduledPostTask = schedules.task({
  id: "scheduled-post-task",
  run: async () => {
    const now = new Date().toISOString();

    // 1. Buscar TODOS los posts en queue que ya deben publicarse
    const { data: posts, error } = await supabaseAdmin
      .from("generations")
      .select("*")
      .eq("status", "queue")
      .lte("scheduled_at", now);

    if (error) {
      console.error("Supabase fetch error:", error);
      return;
    }

    if (!posts || posts.length === 0) {
      console.log("No scheduled posts to publish");
      return;
    }

    for (const post of posts) {
      try {
        // 2. Publicar en Twitter (o donde corresponda)
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/twitter/publish`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postContent: post.response, id: post.id, userId: post.user_id }),
        });
        const json = await res.json();
        console.log("TWITTER PUBLISH RESPONSE:", JSON.stringify(json));
        if (!res.ok) {
          console.error("Failed to publish to Twitter:", json);
        } else {
          console.log("Published post to Twitter:", post.id);
        }
      } catch (err) {
        console.error("Error publishing post to Twitter:", err);
      }

      // 3. Marcar como sent
      const { error: updateError } = await supabaseAdmin
        .from("generations")
        .update({ status: "sent" })
        .eq("id", post.id);
      if (updateError) {
        console.error("Failed to mark post as sent:", updateError);
      }
    }
  },
});
