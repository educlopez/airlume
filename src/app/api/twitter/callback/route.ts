import { NextRequest, NextResponse } from "next/server";
import OAuth from "oauth-1.0a";
import crypto from "crypto";
import fetch from "node-fetch";
import { auth } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/lib/supabaseClient";

const twitterConfig = {
  consumerKey: process.env.TWITTER_KEY_MEDIA!,
  consumerSecret: process.env.TWITTER_SECRET_MEDIA!,
  callbackUrl: process.env.TWITTER_AUTH_CALLBACK_URL_MEDIA!,
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const oauth_token = searchParams.get("oauth_token");
  const oauth_verifier = searchParams.get("oauth_verifier");

  if (!oauth_token || !oauth_verifier) {
    return NextResponse.json({ error: "Missing oauth_token or oauth_verifier" }, { status: 400 });
  }

  const oauth = new OAuth({
    consumer: { key: twitterConfig.consumerKey, secret: twitterConfig.consumerSecret },
    signature_method: "HMAC-SHA1",
    hash_function(base_string, key) {
      return crypto.createHmac("sha1", key).update(base_string).digest("base64");
    },
  });

  const request_data = {
    url: "https://api.twitter.com/oauth/access_token",
    method: "POST",
    data: { oauth_verifier },
  };

  const headers = oauth.toHeader(oauth.authorize(request_data));

  const response = await fetch(request_data.url + `?oauth_token=${oauth_token}&oauth_verifier=${oauth_verifier}`, {
    method: "POST",
    headers: {
      ...headers,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: null, // Twitter expects params in query string
  });

  const text = await response.text();
  const params = new URLSearchParams(text);
  const access_token = params.get("oauth_token");
  const access_token_secret = params.get("oauth_token_secret");
  const screen_name = params.get("screen_name");
  const twitter_user_id = params.get("user_id");

  if (!access_token || !access_token_secret) {
    return NextResponse.json({ error: "Failed to get access_token", raw: text }, { status: 500 });
  }

  // Obtener usuario Clerk
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Guardar tokens en Supabase
  const supabase = createServerSupabaseClient();
  const { error } = await supabase.from("twitter_tokens").upsert({
    user_id: userId,
    oauth_token: access_token,
    oauth_token_secret: access_token_secret,
    screen_name,
    twitter_user_id,
  }, { onConflict: "user_id" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Redirigir a dashboard o mostrar éxito
  return NextResponse.redirect(new URL("/dashboard?twitter=connected", req.nextUrl.origin));
}