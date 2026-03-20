import { auth, clerkClient } from "@clerk/nextjs/server";
import crypto from "crypto";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { TwitterApi } from "twitter-api-v2";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createServerSupabaseClient } from "@/lib/supabase-client";

const ALGO = "aes-256-gcm";
const IV_LENGTH = 12;
const KEY = process.env.TWITTER_ENCRYPTION_KEY;

if (KEY && KEY.length !== 32) {
  throw new Error("TWITTER_ENCRYPTION_KEY must be 32 chars");
}

function decrypt(enc: string): string {
  if (!KEY) {
    throw new Error("TWITTER_ENCRYPTION_KEY is not set");
  }
  const b = Buffer.from(enc, "base64");
  const iv = b.slice(0, IV_LENGTH);
  const tag = b.slice(IV_LENGTH, IV_LENGTH + 16);
  const encrypted = b.slice(IV_LENGTH + 16);
  const decipher = crypto.createDecipheriv(ALGO, Buffer.from(KEY), iv);
  decipher.setAuthTag(tag);
  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString("utf8");
}

const OAUTH_PREFIX_REGEX = /^oauth_/;

async function updateTwitterPostStatus(id: string) {
  const supabase = createServerSupabaseClient();
  const { data: updated, error: updateError } = await supabase
    .from("generations_platforms")
    .update({ status: "sent" })
    .eq("generation_id", id)
    .eq("platform", "twitter")
    .select();
  if (updateError) {
    console.error("Failed to update post status in Supabase:", updateError);
    return {
      error: "Tweet posted, but failed to update status in Supabase",
      supabaseError: updateError.message,
    };
  }
  if (!updated || updated.length === 0) {
    const { error: genError } = await supabase
      .from("generations")
      .update({ status: "sent" })
      .eq("id", id);
    if (genError) {
      console.error("Failed to update post status in generations:", genError);
      return {
        error: "Tweet posted, but failed to update status in generations",
        supabaseError: genError.message,
      };
    }
  }
  return null;
}

async function uploadImageToTwitter(
  twitterClient: TwitterApi,
  imageUrl: string | undefined,
  imageBase64: string | undefined
): Promise<{ mediaId?: string; error?: NextResponse }> {
  let imageBuffer: Buffer;
  if (imageBase64) {
    imageBuffer = Buffer.from(imageBase64, "base64");
  } else if (imageUrl) {
    console.log("[TWITTER PUBLISH] Fetching image from:", imageUrl);
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
    }
    const arrayBuffer = await imageResponse.arrayBuffer();
    imageBuffer = Buffer.from(arrayBuffer);
  } else {
    throw new Error("No image data provided");
  }
  console.log("[TWITTER PUBLISH] Image size:", imageBuffer.byteLength, "bytes");
  const mediaId = await twitterClient.v1.uploadMedia(imageBuffer, {
    mimeType: "image/png",
  });
  console.log(
    "[TWITTER PUBLISH] Media uploaded successfully, media_id:",
    mediaId
  );
  return { mediaId };
}

// See: https://clerk.com/docs/authentication/social-connections/overview#get-an-oauth-access-token-for-a-social-provider

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: multi-step OAuth flow with media upload
export async function POST(req: NextRequest) {
  try {
    console.log(">>> /api/twitter/publish endpoint HIT <<<");
    const {
      postContent,
      id,
      userId: userIdFromBody,
      imageUrl,
      imageBase64,
    } = await req.json();
    let userId = userIdFromBody;

    // Si no viene en el body, intenta obtenerlo de Clerk (para el caso manual)
    if (!userId) {
      const authResult = await auth();
      userId = authResult.userId;
    }

    // LOG: userId recibido
    console.log("[TWITTER PUBLISH] userId:", userId);

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized", debug: {} },
        { status: 401 }
      );
    }

    // Get the Clerk client
    const client = await clerkClient();

    // Get the user and their external accounts from Clerk
    const user = await client.users.getUser(userId);
    const externalAccounts = user.externalAccounts || [];

    // LOG: externalAccounts
    console.log(
      "[TWITTER PUBLISH] externalAccounts:",
      JSON.stringify(externalAccounts)
    );

    // Dinámicamente encuentra el provider correcto de Twitter/X
    const twitterAccount = externalAccounts.find(
      (acc) =>
        acc.provider === "oauth_twitter" ||
        acc.provider === "twitter" ||
        acc.provider === "x" ||
        acc.provider?.includes("twitter") ||
        acc.provider?.includes("x")
    );

    // LOG: twitterAccount
    console.log(
      "[TWITTER PUBLISH] twitterAccount:",
      JSON.stringify(twitterAccount)
    );

    if (!twitterAccount) {
      return NextResponse.json(
        {
          error: "No Twitter/X connection found in Clerk.",
          debug: { userId, externalAccounts },
        },
        { status: 400 }
      );
    }

    let providerKey = twitterAccount.provider;
    if (providerKey.startsWith("oauth_")) {
      providerKey = providerKey.replace(OAUTH_PREFIX_REGEX, "");
    }
    // LOG: providerKey
    console.log("[TWITTER PUBLISH] providerKey:", providerKey);

    // Solo usa provider keys permitidos por Clerk
    let tokensResponse: Awaited<
      ReturnType<typeof client.users.getUserOauthAccessToken>
    >;
    if (providerKey === "oauth_x" || providerKey === "x") {
      tokensResponse = await client.users.getUserOauthAccessToken(
        userId,
        "oauth_x"
      );
    } else if (providerKey === "oauth_twitter" || providerKey === "twitter") {
      tokensResponse = await client.users.getUserOauthAccessToken(
        userId,
        "oauth_twitter"
      );
    } else {
      return NextResponse.json(
        {
          error: `Unsupported Twitter provider key: ${providerKey}`,
          debug: { userId, providerKey },
        },
        { status: 400 }
      );
    }
    const accessToken = tokensResponse.data[0]?.token;

    // LOG: accessToken (parcial)
    console.log(
      "[TWITTER PUBLISH] accessToken:",
      accessToken ? `${accessToken.slice(0, 8)}...` : null
    );

    if (!accessToken) {
      return NextResponse.json(
        {
          error: "No Twitter/X access token found.",
          debug: { userId, externalAccounts, providerKey, tokensResponse },
        },
        { status: 400 }
      );
    }

    // Check if user has OAuth 1.0a tokens for media upload
    let twitterClient: TwitterApi | null = null;
    const mediaIds: string[] = [];

    if (imageUrl || imageBase64) {
      // Try to get OAuth 1.0a tokens for media upload
      const { data: oauth1Data, error: oauth1Error } = await supabaseAdmin
        .from("twitter_tokens")
        .select("oauth_token, oauth_token_secret")
        .eq("user_id", userId)
        .single();

      if (oauth1Error || !oauth1Data) {
        console.log(
          "[TWITTER PUBLISH] No OAuth 1.0a tokens found for media upload"
        );
        return NextResponse.json(
          {
            error: "Image uploads require Twitter OAuth 1.0a connection",
            details:
              "Please connect your Twitter account via Settings to enable image uploads.",
            needsOAuth1: true,
          },
          { status: 400 }
        );
      }

      try {
        const decryptedToken = decrypt(oauth1Data.oauth_token);
        const decryptedSecret = decrypt(oauth1Data.oauth_token_secret);
        const apiKey = process.env.TWITTER_API_KEY;
        const apiSecret = process.env.TWITTER_API_SECRET;
        if (!(apiKey && apiSecret)) {
          throw new Error("Twitter API credentials not configured");
        }
        twitterClient = new TwitterApi({
          appKey: apiKey,
          appSecret: apiSecret,
          accessToken: decryptedToken,
          accessSecret: decryptedSecret,
        });
        console.log("[TWITTER PUBLISH] Using OAuth 1.0a for media upload");
        const { mediaId } = await uploadImageToTwitter(
          twitterClient,
          imageUrl,
          imageBase64
        );
        if (mediaId) {
          mediaIds.push(mediaId);
        }
      } catch (error) {
        console.error("[TWITTER PUBLISH] Error during image upload:", error);
        return NextResponse.json(
          {
            error: "Failed to process image for Twitter",
            details: error instanceof Error ? error.message : String(error),
          },
          { status: 500 }
        );
      }
    }

    // Post the tweet with optional media
    const tweetBody: { text: string; media?: { media_ids: string[] } } = {
      text: postContent,
    };
    if (mediaIds.length > 0) {
      tweetBody.media = { media_ids: mediaIds };
    }

    const twitterRes = await fetch("https://api.twitter.com/2/tweets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(tweetBody),
    });
    const tweetText = await twitterRes.text();
    // LOG: respuesta cruda de Twitter
    console.log("[TWITTER PUBLISH] Twitter API response:", tweetText);
    let data: unknown;
    try {
      data = JSON.parse(tweetText);
    } catch {
      return NextResponse.json(
        {
          error: "Failed to parse Twitter tweet post response",
          raw: tweetText,
          debug: { userId, postContent },
        },
        { status: 500 }
      );
    }
    if (!twitterRes.ok) {
      return NextResponse.json(
        { error: data, debug: { userId, postContent, twitterApi: tweetText } },
        { status: 400 }
      );
    }

    if (id) {
      const statusError = await updateTwitterPostStatus(id);
      if (statusError) {
        return NextResponse.json(
          {
            ...statusError,
            debug: { userId, postContent, twitterApi: tweetText },
          },
          { status: 500 }
        );
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
        accessToken: accessToken ? `${accessToken.slice(0, 8)}...` : null,
        postContent,
        twitterApi: tweetText,
      },
    });
  } catch (error) {
    console.error("ERROR in /api/twitter/publish:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : error,
      },
      { status: 500 }
    );
  }
}
