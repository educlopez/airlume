import { auth } from "@clerk/nextjs/server"
import { NextRequest } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabaseClient"

export async function GET() {
  const { userId } = await auth()
  if (!userId) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
  const supabase = createServerSupabaseClient()
  const { data } = await supabase
    .from("user_openai_keys")
    .select("user_id")
    .eq("user_id", userId)
    .single()
  return new Response(JSON.stringify({ hasKey: !!data }), { status: 200 })
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
  const { openai_key } = await req.json()
  if (!openai_key) return new Response(JSON.stringify({ error: "Missing key" }), { status: 400 })
  const supabase = createServerSupabaseClient()
  // Upsert key
  const { error } = await supabase
    .from("user_openai_keys")
    .upsert({ user_id: userId, openai_key }, { onConflict: "user_id" })
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