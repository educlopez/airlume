import { BskyAgent } from "@atproto/api";
import { auth } from "@clerk/nextjs/server";
import crypto from "crypto";
import { type NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

const ALGO = "aes-256-gcm";
const IV_LENGTH = 12;
const KEY = process.env.BLUESKY_SECRET_KEY;
if (!KEY) {
  throw new Error("BLUESKY_SECRET_KEY is not set");
}
if (KEY.length !== 32) {
  throw new Error("BLUESKY_SECRET_KEY must be 32 chars");
}

function decrypt(enc: string): string {
  const b = Buffer.from(enc, "base64");
  const iv = b.slice(0, IV_LENGTH);
  const tag = b.slice(IV_LENGTH, IV_LENGTH + 16);
  const encrypted = b.slice(IV_LENGTH + 16);
  const decipher = crypto.createDecipheriv(
    ALGO,
    Buffer.from(KEY as string),
    iv
  );
  decipher.setAuthTag(tag);
  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString("utf8");
}

async function updatePostStatus(id: string) {
  const { data: updated, error: updateError } = await supabaseAdmin
    .from("generations_platforms")
    .update({ status: "sent" })
    .eq("generation_id", id)
    .eq("platform", "bluesky")
    .select();
  if (updateError) {
    console.error(
      "Failed to update post status in generations_platforms:",
      updateError
    );
    return {
      error:
        "Bluesky post sent, but failed to update status in generations_platforms",
      supabaseError: updateError.message,
    };
  }
  if (!updated || updated.length === 0) {
    const { error: genError } = await supabaseAdmin
      .from("generations")
      .update({ status: "sent" })
      .eq("id", id);
    if (genError) {
      console.error("Failed to update post status in generations:", genError);
      return {
        error: "Bluesky post sent, but failed to update status in generations",
        supabaseError: genError.message,
      };
    }
  }
  return null;
}

async function resolveCredentials(
  reqHandle: string | undefined,
  reqAppPassword: string | undefined,
  userId: string
): Promise<{ handle: string; appPassword: string } | NextResponse> {
  if (reqHandle && reqAppPassword) {
    return { handle: reqHandle, appPassword: reqAppPassword };
  }
  const { data, error } = await supabaseAdmin
    .from("user_bluesky_accounts")
    .select("handle, app_password_encrypted")
    .eq("user_id", userId)
    .single();
  console.log("[BLUESKY PUBLISH] bluesky account data:", data, "error:", error);
  if (error || !data) {
    return NextResponse.json(
      { error: "Missing Bluesky credentials" },
      { status: 400 }
    );
  }
  return {
    handle: data.handle,
    appPassword: decrypt(data.app_password_encrypted),
  };
}

export async function POST(req: NextRequest) {
  try {
    const {
      postContent,
      imageBase64,
      imageAlt,
      id,
      handle: reqHandle,
      appPassword: reqAppPassword,
      userId: userIdFromBody,
    } = await req.json();
    let userId = userIdFromBody;

    if (!userId) {
      const authResult = await auth();
      userId = authResult.userId;
    }
    console.log("[BLUESKY PUBLISH] userId:", userId);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!postContent) {
      return NextResponse.json(
        { error: "Missing post content" },
        { status: 400 }
      );
    }

    const creds = await resolveCredentials(reqHandle, reqAppPassword, userId);
    if (creds instanceof NextResponse) {
      return creds;
    }
    const { handle, appPassword } = creds;

    const agent = new BskyAgent({ service: "https://bsky.social" });
    await agent.login({ identifier: handle, password: appPassword });

    let embed:
      | {
          $type: string;
          images: Array<{
            alt: string;
            image: unknown;
            aspectRatio: { width: number; height: number };
          }>;
        }
      | undefined;
    if (imageBase64) {
      const imageBuffer = Buffer.from(imageBase64, "base64");
      const { data } = await agent.uploadBlob(imageBuffer, {
        encoding: "image/png",
      });
      embed = {
        $type: "app.bsky.embed.images",
        images: [
          {
            alt: imageAlt || "Image",
            image: data.blob,
            aspectRatio: { width: 1000, height: 500 },
          },
        ],
      };
    }

    const post = await agent.post({
      text: postContent,
      embed,
      createdAt: new Date().toISOString(),
    });

    if (id) {
      const statusError = await updatePostStatus(id);
      if (statusError) {
        return NextResponse.json(statusError, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, post });
  } catch (error) {
    console.error("Bluesky publish error:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : error,
      },
      { status: 500 }
    );
  }
}
