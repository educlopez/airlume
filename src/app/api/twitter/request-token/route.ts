import { NextResponse } from "next/server";
import OAuth from "oauth-1.0a";
import crypto from "crypto";
import fetch from "node-fetch";

const twitterConfig = {
  consumerKey: process.env.TWITTER_KEY_MEDIA!,
  consumerSecret: process.env.TWITTER_SECRET_MEDIA!,
  callbackUrl: process.env.TWITTER_AUTH_CALLBACK_URL_MEDIA!,
};

export async function GET() {
  const oauth = new OAuth({
    consumer: { key: twitterConfig.consumerKey, secret: twitterConfig.consumerSecret },
    signature_method: "HMAC-SHA1",
    hash_function(base_string, key) {
      return crypto.createHmac("sha1", key).update(base_string).digest("base64");
    },
  });

  const request_data = {
    url: "https://api.twitter.com/oauth/request_token",
    method: "POST",
    data: { oauth_callback: twitterConfig.callbackUrl },
  };

  const headers = oauth.toHeader(oauth.authorize(request_data));
  const body = new URLSearchParams({ oauth_callback: twitterConfig.callbackUrl });

  const response = await fetch(request_data.url, {
    method: "POST",
    headers: {
      ...headers,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const text = await response.text();
  const params = new URLSearchParams(text);
  const oauth_token = params.get("oauth_token");

  if (!oauth_token) {
    return NextResponse.json({ error: "Failed to get oauth_token", raw: text }, { status: 500 });
  }

  return NextResponse.redirect(
    `https://api.twitter.com/oauth/authorize?oauth_token=${oauth_token}`
  );
}