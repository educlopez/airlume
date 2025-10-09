import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has Twitter OAuth 1.0a tokens
    const { data, error } = await supabaseAdmin
      .from("twitter_tokens")
      .select("screen_name, twitter_user_id")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "no rows returned"
      console.error("Error checking Twitter connection:", error);
      return NextResponse.json({ connected: false, error: error.message });
    }

    if (!data) {
      return NextResponse.json({ connected: false });
    }

    return NextResponse.json({
      connected: true,
      screen_name: data.screen_name,
      twitter_user_id: data.twitter_user_id,
    });
  } catch (error) {
    console.error("Twitter status error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

