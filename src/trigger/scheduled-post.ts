import { schedules } from "@trigger.dev/sdk/v3";
import { supabaseAdmin } from "@/lib/supabase-admin";

type Platform = "twitter" | "bluesky" | "linkedin";

const PLATFORM_ENDPOINTS: Record<Platform, string> = {
  twitter: "/api/twitter/publish",
  bluesky: "/api/bluesky/publish",
  linkedin: "/api/linkedin/publish",
};

function getEndpoint(platform: string): string | null {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "";
  const path = PLATFORM_ENDPOINTS[platform as Platform];
  return path ? `${base}${path}` : null;
}

async function convertImageToBase64(imageUrl: string): Promise<string | null> {
  try {
    const imageRes = await fetch(imageUrl);
    const blob = await imageRes.blob();
    const arrayBuffer = await blob.arrayBuffer();
    return Buffer.from(arrayBuffer).toString("base64");
  } catch (err) {
    console.error("Failed to convert image to base64 for Bluesky:", err);
    return null;
  }
}

interface PublishPayload {
  id: string;
  imageBase64?: string | null;
  imageUrl?: string | null;
  postContent: string;
  userId: string;
}

async function buildPayload(
  platform: string,
  post: {
    response: string;
    id: string;
    user_id: string;
    image_url?: string | null;
  }
): Promise<PublishPayload> {
  const payload: PublishPayload = {
    postContent: post.response,
    id: post.id,
    userId: post.user_id,
  };

  if (platform === "linkedin") {
    payload.imageUrl = post.image_url || null;
  } else if (platform === "bluesky" && post.image_url) {
    payload.imageBase64 = await convertImageToBase64(post.image_url);
  }

  return payload;
}

async function publishPost(row: {
  id: string;
  platform: string;
  generation: {
    response: string;
    id: string;
    user_id: string;
    image_url?: string | null;
  } | null;
}) {
  const post = row.generation;
  if (!post) {
    console.error("No generation found for row", row.id);
    return;
  }

  const endpoint = getEndpoint(row.platform);
  if (!endpoint) {
    console.warn("Unknown platform:", row.platform);
    return;
  }

  const payload = await buildPayload(row.platform, post);

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  console.log(
    `${row.platform.toUpperCase()} PUBLISH RESPONSE:`,
    JSON.stringify(json)
  );

  if (res.ok) {
    await supabaseAdmin
      .from("generations_platforms")
      .update({
        status: "sent",
        published_post_id: json?.data?.data?.id || null,
        error_message: null,
      })
      .eq("id", row.id);
    console.log(`Published post to ${row.platform}:`, post.id);
  } else {
    console.error(`Failed to publish to ${row.platform}:`, json);
    await supabaseAdmin
      .from("generations_platforms")
      .update({
        status: "failed",
        error_message: json.error || JSON.stringify(json),
      })
      .eq("id", row.id);
  }
}

export const scheduledPostTask = schedules.task({
  id: "scheduled-post-task",
  run: async () => {
    const now = new Date().toISOString();

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
      try {
        await publishPost(row);
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
