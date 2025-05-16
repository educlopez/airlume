import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseClient";

export async function GET(req: Request) {
  // Security check for Vercel Cron
  if (
    req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerSupabaseClient();

  // 1. Fetch queued posts ready to publish
  const { data: posts, error } = await supabase
    .from("generations")
    .select("*")
    .eq("status", "queue")
    .lte("scheduled_at", new Date().toISOString());

  if (error) return NextResponse.json({ error: "Error fetching posts" }, { status: 500 });

  for (const post of posts ?? []) {
    // 2. TODO: Publish logic (call your publish API or logic here)
    // await publishToTwitterOrBluesky(post);

    // 3. Mark as sent
    await supabase
      .from("generations")
      .update({ status: "sent" })
      .eq("id", post.id);
  }

  return NextResponse.json({ message: "Queue processed", count: posts?.length ?? 0 });
}