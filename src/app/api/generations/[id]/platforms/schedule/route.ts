import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseClient";

export async function POST(req: NextRequest) {
  // Extract id from the URL
  const url = new URL(req.url!);
  const id = url.pathname.split("/").at(-3); // /api/generations/[id]/platforms/schedule
  const { platform, scheduled_at } = await req.json();
  if (!platform || !scheduled_at || !id) {
    return NextResponse.json({ error: "Missing platform, scheduled_at, or id" }, { status: 400 });
  }
  const supabase = createServerSupabaseClient();
  const { error } = await supabase
    .from("generations_platforms")
    .update({ scheduled_at })
    .eq("generation_id", id)
    .eq("platform", platform);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}