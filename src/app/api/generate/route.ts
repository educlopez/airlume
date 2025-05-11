import { NextRequest } from "next/server";
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { prompt, apiKey, model = "gpt-4o", temperature = 1, maxTokens = 512 } = await req.json();
    if (!prompt || !apiKey) {
      return new Response(JSON.stringify({ error: "Missing prompt or API key" }), { status: 400 });
    }
    const result = await streamText({
      model: openai(model, { apiKey }),
      prompt,
      temperature,
      maxTokens,
    });
    return result.toAIStreamResponse();
  } catch (err: any) {
    let message = "Internal error";
    if (err?.message?.includes("401") || err?.message?.toLowerCase().includes("key")) {
      message = "Invalid or unauthorized OpenAI API key.";
    } else if (err?.message?.includes("429")) {
      message = "You are being rate limited by OpenAI. Try again later.";
    } else if (err?.message) {
      message = err.message;
    }
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}