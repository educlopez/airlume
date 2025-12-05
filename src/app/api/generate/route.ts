
import { NextRequest } from "next/server"
import { createOpenAI } from "@ai-sdk/openai"
import { streamText } from "ai"
import { auth } from "@clerk/nextjs/server"
import { createServerSupabaseClient } from "@/lib/supabaseClient"
import crypto from "crypto"

const ALGO = "aes-256-gcm"
const IV_LENGTH = 12
const KEY = process.env.OPENAI_SECRET_KEY
if (!KEY || KEY.length !== 32) throw new Error("OPENAI_SECRET_KEY must be 32 chars")

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

export const runtime = "nodejs"

function isErrorWithMessage(err: unknown): err is { message: string } {
  return (
    typeof err === "object" &&
    err !== null &&
    "message" in err &&
    typeof (err as { message?: unknown }).message === "string"
  )
}

export async function POST(req: NextRequest) {
  try {
    const {
      prompt,
      apiKey: userApiKey,
      model = "gpt-4o",
      temperature = 1,
      maxTokens = 512,
      systemPrompt,
      presencePenalty,
      frequencyPenalty,
      topP,
    } = await req.json()

    let apiKey = userApiKey
    // Si el usuario está autenticado, intenta buscar clave guardada
    const { userId } = await auth()
    if (userId) {
      const supabase = createServerSupabaseClient()
      const { data } = await supabase
        .from("user_openai_keys")
        .select("openai_key_encrypted")
        .eq("user_id", userId)
        .single()
      if (data && data.openai_key_encrypted) {
        try {
          apiKey = decrypt(data.openai_key_encrypted)
        } catch {
          // Si falla la desencriptación, el usuario debe proporcionar su propia clave
        }
      }
    }

    if (!prompt || !apiKey) {
      return new Response(
        JSON.stringify({ error: "Missing prompt or API key" }),
        { status: 400 }
      )
    }

    // Create a provider instance with the correct key
    const openaiProvider = createOpenAI({ apiKey })

    const result = await streamText({
      model: openaiProvider(model),
      prompt,
      temperature,
      maxTokens,
      system: systemPrompt || undefined,
      presencePenalty,
      frequencyPenalty,
      topP,
    })
    return result.toDataStreamResponse()
  } catch (err: unknown) {
    let message = "Internal error"
    if (isErrorWithMessage(err)) {
      const errMsg = err.message
      if (errMsg.includes("401") || errMsg.toLowerCase().includes("key")) {
        message = "Invalid or unauthorized OpenAI API key."
      } else if (errMsg.includes("429")) {
        message = "You are being rate limited by OpenAI. Try again later."
      } else {
        message = errMsg
      }
    }
    return new Response(JSON.stringify({ error: message }), { status: 500 })
  }
}

export async function OPTIONS() {
  // No longer checking for local API key - users must provide their own
  return new Response(
    JSON.stringify({ hasLocalApiKey: false }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  )
}
