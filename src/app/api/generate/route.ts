import { NextRequest } from "next/server";
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { prompt, apiKey } = await req.json();
    if (!prompt || !apiKey) {
      return new Response(JSON.stringify({ error: "Missing prompt or API key" }), { status: 400 });
    }
    const result = await streamText({
      model: openai("gpt-4o", { apiKey }),
      prompt,
    });
    return result.toAIStreamResponse();
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Internal error" }), { status: 500 });
  }
}