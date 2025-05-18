import { auth } from "@clerk/nextjs/server"
import { NextRequest } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabaseClient"
import crypto from "crypto"

const ALGO = "aes-256-gcm"
const IV_LENGTH = 12
const KEY = process.env.OPENAI_SECRET_KEY
if (!KEY || KEY.length !== 32) throw new Error("OPENAI_SECRET_KEY must be 32 chars")

function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGO, Buffer.from(KEY as string), iv)
  let encrypted = cipher.update(text, "utf8")
  encrypted = Buffer.concat([encrypted, cipher.final()])
  const tag = cipher.getAuthTag()
  return Buffer.concat([iv, tag, encrypted]).toString("base64")
}

function decrypt(enc: string): string {
  const b = Buffer.from(enc, "base64")
  const iv = b.slice(0, IV_LENGTH)
  const tag = b.slice(IV_LENGTH, IV_LENGTH + 16)
  const encrypted = b.slice(IV_LENGTH + 16)
  const decipher = crypto.createDecipheriv(ALGO, Buffer.from(KEY as string), iv)
  decipher.setAuthTag(tag)
  let decrypted = decipher.update(encrypted)
  decrypted = Buffer.concat([decrypted, decipher.final()])
  return decrypted.toString("utf8")
}

export async function GET() {
  const { userId } = await auth()
  if (!userId) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
  const supabase = createServerSupabaseClient()
  const { data } = await supabase
    .from("user_openai_keys")
    .select("user_id, openai_key_encrypted")
    .eq("user_id", userId)
    .single()
  if (!data || !data.openai_key_encrypted) {
    return new Response(JSON.stringify({ hasKey: false }), { status: 200 })
  }
  let last4 = null
  try {
    const key = decrypt(data.openai_key_encrypted)
    last4 = key.slice(-4)
  } catch {
    last4 = null
  }
  return new Response(JSON.stringify({ hasKey: true, last4 }), { status: 200 })
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
  const { openai_key } = await req.json()
  if (!openai_key) return new Response(JSON.stringify({ error: "Missing key" }), { status: 400 })
  const supabase = createServerSupabaseClient()
  const encrypted = encrypt(openai_key)
  // Upsert key
  const { error } = await supabase
    .from("user_openai_keys")
    .upsert({ user_id: userId, openai_key_encrypted: encrypted }, { onConflict: "user_id" })
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  return new Response(JSON.stringify({ success: true }), { status: 200 })
}

export async function DELETE() {
  const { userId } = await auth()
  if (!userId) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
  const supabase = createServerSupabaseClient()
  const { error } = await supabase
    .from("user_openai_keys")
    .delete()
    .eq("user_id", userId)
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  return new Response(JSON.stringify({ success: true }), { status: 200 })
}