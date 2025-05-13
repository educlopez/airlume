import { NextRequest } from "next/server"
import { createOpenAI, openai } from "@ai-sdk/openai"
import { streamText } from "ai"

export const runtime = "edge"

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

    // Use env key in development, otherwise use user-provided key
    const isDev = process.env.NODE_ENV === "development"
    const envApiKey = process.env.OPENAI_KEY
    const apiKey = isDev && envApiKey ? envApiKey : userApiKey

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
  // Used by the generator page to detect if the local OpenAI key is set
  const isDev = process.env.NODE_ENV === "development"
  const envApiKey = process.env.OPENAI_KEY
  return new Response(
    JSON.stringify({ hasLocalApiKey: Boolean(isDev && envApiKey) }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  )
}
