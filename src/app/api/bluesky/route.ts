import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabaseClient"
import crypto from "crypto"

const ALGO = "aes-256-gcm"
const IV_LENGTH = 12
const KEY = process.env.BLUESKY_SECRET_KEY
if (!KEY || KEY.length !== 32) throw new Error("BLUESKY_SECRET_KEY must be 32 chars")

function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGO, Buffer.from(KEY as string), iv)
  let encrypted = cipher.update(text, "utf8")
  encrypted = Buffer.concat([encrypted, cipher.final()])
  const tag = cipher.getAuthTag()
  return Buffer.concat([iv, tag, encrypted]).toString("base64")
}

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from("user_bluesky_accounts")
    .select("id, handle, created_at, extra_info")
    .eq("user_id", userId)
    .single()
  if (error && error.code !== "PGRST116") return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({})
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { handle, appPassword, extraInfo } = await req.json()
  if (!handle || !appPassword) return NextResponse.json({ error: "Missing handle or appPassword" }, { status: 400 })
  const encrypted = encrypt(appPassword)
  const supabase = createServerSupabaseClient()
  // Upsert by user_id
  const { error } = await supabase
    .from("user_bluesky_accounts")
    .upsert({ user_id: userId, handle, app_password_encrypted: encrypted, extra_info: extraInfo || null }, { onConflict: "user_id" })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function DELETE() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const supabase = createServerSupabaseClient()
  const { error } = await supabase
    .from("user_bluesky_accounts")
    .delete()
    .eq("user_id", userId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}