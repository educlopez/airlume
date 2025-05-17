import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseClient";

// See: https://clerk.com/docs/authentication/social-connections/overview#get-an-oauth-access-token-for-a-social-provider

export async function POST(req: NextRequest) {
  try {
    console.log(">>> /api/twitter/publish endpoint HIT <<<");
    const { postContent, id, userId: userIdFromBody } = await req.json();
    let userId = userIdFromBody;

    // Si no viene en el body, intenta obtenerlo de Clerk (para el caso manual)
    if (!userId) {
      const authResult = await auth();
      userId = authResult.userId;
    }

    // LOG: userId recibido
    console.log("[TWITTER PUBLISH] userId:", userId);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized", debug: {} }, { status: 401 });
    }

    // Get the Clerk client
    const client = await clerkClient();

    // Get the user and their external accounts from Clerk
    const user = await client.users.getUser(userId);
    const externalAccounts = user.externalAccounts || [];

    // LOG: externalAccounts
    console.log("[TWITTER PUBLISH] externalAccounts:", JSON.stringify(externalAccounts));

    // Dinámicamente encuentra el provider correcto de Twitter/X
    const twitterAccount = externalAccounts.find(
      acc =>
        acc.provider === "oauth_twitter" ||
        acc.provider === "twitter" ||
        acc.provider === "x" ||
        acc.provider?.includes("twitter") ||
        acc.provider?.includes("x")
    );

    // LOG: twitterAccount
    console.log("[TWITTER PUBLISH] twitterAccount:", JSON.stringify(twitterAccount));

    if (!twitterAccount) {
      return NextResponse.json({ error: "No Twitter/X connection found in Clerk.", debug: { userId, externalAccounts } }, { status: 400 });
    }

    // Usa el provider key sin el prefijo oauth_ (por deprecación de Clerk)
    let providerKey = twitterAccount.provider;
    if (providerKey.startsWith("oauth_")) {
      providerKey = providerKey.replace(/^oauth_/, "");
    }
    // LOG: providerKey
    console.log("[TWITTER PUBLISH] providerKey:", providerKey);

    // Solo usa provider keys permitidos por Clerk
    let tokensResponse;
    if (providerKey === "oauth_x" || providerKey === "x") {
      tokensResponse = await client.users.getUserOauthAccessToken(userId, "oauth_x");
    } else if (providerKey === "oauth_twitter" || providerKey === "twitter") {
      tokensResponse = await client.users.getUserOauthAccessToken(userId, "oauth_twitter");
    } else {
      return NextResponse.json({ error: `Unsupported Twitter provider key: ${providerKey}`, debug: { userId, providerKey } }, { status: 400 });
    }
    const accessToken = tokensResponse.data[0]?.token;

    // LOG: accessToken (parcial)
    console.log("[TWITTER PUBLISH] accessToken:", accessToken ? accessToken.slice(0, 8) + "..." : null);

    if (!accessToken) {
      return NextResponse.json({ error: "No Twitter/X access token found.", debug: { userId, externalAccounts, providerKey, tokensResponse } }, { status: 400 });
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
    // LOG: respuesta cruda de Twitter
    console.log("[TWITTER PUBLISH] Twitter API response:", tweetText);
    let data;
    try {
      data = JSON.parse(tweetText);
    } catch {
      return NextResponse.json({ error: "Failed to parse Twitter tweet post response", raw: tweetText, debug: { userId, postContent } }, { status: 500 });
    }
    if (!twitterRes.ok) {
      return NextResponse.json({ error: data, debug: { userId, postContent, twitterApi: tweetText } }, { status: 400 });
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
        return NextResponse.json({ error: "Tweet posted, but failed to update status in Supabase", supabaseError: updateError.message, debug: { userId, postContent, twitterApi: tweetText } }, { status: 500 });
      }

    } else {
      console.warn("No post ID provided for status update.");
    }

    // Devuelve toda la info relevante para debug
    return NextResponse.json({
      success: true,
      data,
      debug: {
        userId,
        externalAccounts,
        providerKey,
        accessToken: accessToken ? accessToken.slice(0, 8) + "..." : null,
        postContent,
        twitterApi: tweetText,
      },
    });
  } catch (error) {
    console.error("ERROR in /api/twitter/publish:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error instanceof Error ? error.message : error },
      { status: 500 }
    );
  }
}