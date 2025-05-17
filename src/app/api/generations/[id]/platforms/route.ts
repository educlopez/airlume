import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseClient";

export async function GET(req: NextRequest) {
  // Extract id from the URL
  const url = new URL(req.url!);
  const id = url.pathname.split("/").at(-2); // /api/generations/[id]/platforms
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("generations_platforms")
    .select("platform, status, scheduled_at, error_message, published_post_id")
    .eq("generation_id", id)
    .order("platform");
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ platforms: data });
}