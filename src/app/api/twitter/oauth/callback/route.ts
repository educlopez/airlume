import { auth } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { TwitterApi } from "twitter-api-v2";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import crypto from "crypto";

const ALGO = "aes-256-gcm";
const IV_LENGTH = 12;
const KEY = process.env.TWITTER_ENCRYPTION_KEY;

if (!KEY) throw new Error("TWITTER_ENCRYPTION_KEY is not set");
if (KEY.length !== 32)
  throw new Error("TWITTER_ENCRYPTION_KEY must be 32 chars");

function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGO, Buffer.from(KEY as string), iv);
  let encrypted = cipher.update(text, "utf8");
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.redirect(
        new URL("/sign-in?error=unauthorized", req.url)
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const oauthToken = searchParams.get("oauth_token");
    const oauthVerifier = searchParams.get("oauth_verifier");

    if (!oauthToken || !oauthVerifier) {
      return NextResponse.redirect(
        new URL("/?error=missing_oauth_params", req.url)
      );
    }

    // Get the oauth_token_secret from Supabase temporary storage
    const { data: tempData, error: tempError } = await supabaseAdmin
      .from("twitter_oauth_temp")
      .select("oauth_token_secret")
      .eq("oauth_token", oauthToken)
      .eq("user_id", userId)
      .single();

    if (tempError || !tempData) {
      console.error("Failed to get temp OAuth data:", tempError);
      return NextResponse.redirect(
        new URL("/?error=oauth_state_missing", req.url)
      );
    }

    // Create a Twitter client with temporary credentials
    const apiKey = process.env.TWITTER_API_KEY;
    const apiSecret = process.env.TWITTER_API_SECRET;

    if (!apiKey || !apiSecret) {
      return NextResponse.redirect(
        new URL("/?error=missing_twitter_credentials", req.url)
      );
    }

    const client = new TwitterApi({
      appKey: apiKey,
      appSecret: apiSecret,
      accessToken: oauthToken,
      accessSecret: tempData.oauth_token_secret,
    });

    try {
      // Exchange for access tokens
      const { client: loggedClient, accessToken, accessSecret } = await client.login(oauthVerifier);

      // Get user info
      const user = await loggedClient.v2.me();

      // Encrypt and store the tokens
      const encryptedToken = encrypt(accessToken);
      const encryptedSecret = encrypt(accessSecret);

      // Store in database
      const { error: insertError } = await supabaseAdmin
        .from("twitter_tokens")
        .upsert({
          user_id: userId,
          oauth_token: encryptedToken,
          oauth_token_secret: encryptedSecret,
          twitter_user_id: user.data.id,
          screen_name: user.data.username,
        }, {
          onConflict: "user_id",
        });

      if (insertError) {
        console.error("Failed to store Twitter tokens:", insertError);
        throw insertError;
      }

      // Clean up temp data
      await supabaseAdmin
        .from("twitter_oauth_temp")
        .delete()
        .eq("oauth_token", oauthToken);

      // Redirect to settings with success
      return NextResponse.redirect(
        new URL("/?twitter_connected=true", req.url)
      );
    } catch (error) {
      console.error("OAuth exchange error:", error);
      return NextResponse.redirect(
        new URL("/?error=oauth_exchange_failed", req.url)
      );
    }
  } catch (error) {
    console.error("Twitter OAuth callback error:", error);
    return NextResponse.redirect(new URL("/?error=oauth_error", req.url));
  }
}

