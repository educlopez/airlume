import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseClient";

// See: https://clerk.com/docs/authentication/social-connections/overview#get-an-oauth-access-token-for-a-social-provider

export async function POST(req: NextRequest) {
  try {
    const { postContent, id } = await req.json();
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the Clerk client
    const client = await clerkClient();

    // Get the user and their external accounts from Clerk
    const user = await client.users.getUser(userId);
    const externalAccounts: Array<{ provider: string }> = user.externalAccounts || [];

    // Debug: log external accounts

    // Dynamically find the correct Twitter/X provider key
    const twitterAccount = externalAccounts.find(
      acc =>
        acc.provider === "oauth_twitter" ||
        acc.provider === "twitter" ||
        acc.provider === "x" ||
        acc.provider?.includes("twitter") ||
        acc.provider?.includes("x")
    );

    if (!twitterAccount) {
      return NextResponse.json({ error: "No Twitter/X connection found in Clerk.", accounts: externalAccounts }, { status: 400 });
    }


    // Use the provider key without the oauth_ prefix (per Clerk deprecation warning)
    let providerKey = twitterAccount.provider;
    if (providerKey.startsWith("oauth_")) {
      providerKey = providerKey.replace(/^oauth_/, "");
    }
    // Only use allowed provider keys for Clerk
    let tokensResponse;
    if (providerKey === "oauth_x" || providerKey === "x") {
      tokensResponse = await client.users.getUserOauthAccessToken(userId, "oauth_x");
    } else if (providerKey === "oauth_twitter" || providerKey === "twitter") {
      tokensResponse = await client.users.getUserOauthAccessToken(userId, "oauth_twitter");
    } else {
      return NextResponse.json({ error: `Unsupported Twitter provider key: ${providerKey}` }, { status: 400 });
    }
    const accessToken = tokensResponse.data[0]?.token;

    if (!accessToken) {
      return NextResponse.json({ error: "No Twitter/X access token found.", accounts: externalAccounts, provider: twitterAccount.provider, tokens: tokensResponse }, { status: 400 });
    }

    // Post the tweet (text only) using fetch
    const twitterRes = await fetch("https://api.twitter.com/2/tweets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: postContent }),
    });
    const tweetText = await twitterRes.text();
    let data;
    try {
      data = JSON.parse(tweetText);
    } catch {
      return NextResponse.json({ error: "Failed to parse Twitter tweet post response", raw: tweetText }, { status: 500 });
    }
    if (!twitterRes.ok) {
      return NextResponse.json({ error: data }, { status: 400 });
    }

    // Update Supabase status to 'sent'
    if (id) {
      const supabase = createServerSupabaseClient();
      const { error: updateError } = await supabase
        .from("generations")
        .update({ status: "sent" })
        .eq("id", id)
        .select(); // Get the updated row for debugging

      if (updateError) {
        console.error("Failed to update post status in Supabase:", updateError);
        return NextResponse.json({ error: "Tweet posted, but failed to update status in Supabase", supabaseError: updateError.message }, { status: 500 });
      }

    } else {
      console.warn("No post ID provided for status update.");
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Twitter publish error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error instanceof Error ? error.message : error },
      { status: 500 }
    );
  }
}