import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { TwitterApi } from "twitter-api-v2";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiKey = process.env.TWITTER_API_KEY;
    const apiSecret = process.env.TWITTER_API_SECRET;

    if (!apiKey || !apiSecret) {
      return NextResponse.json(
        { error: "Twitter API credentials not configured" },
        { status: 500 }
      );
    }

    const client = new TwitterApi({
      appKey: apiKey,
      appSecret: apiSecret,
    });

    // Generate auth link
    const authLink = await client.generateAuthLink(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/twitter/oauth/callback`,
      { linkMode: "authorize" }
    );

    // Store temporary oauth_token_secret in database
    const { error } = await supabaseAdmin.from("twitter_oauth_temp").insert({
      user_id: userId,
      oauth_token: authLink.oauth_token,
      oauth_token_secret: authLink.oauth_token_secret,
      expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
    });

    if (error) {
      console.error("Failed to store temp OAuth data:", error);
      return NextResponse.json(
        { error: "Failed to initiate OAuth" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: authLink.url });
  } catch (error) {
    console.error("Twitter OAuth initiate error:", error);
    return NextResponse.json(
      { error: "Failed to initiate OAuth", details: error },
      { status: 500 }
    );
  }
}

