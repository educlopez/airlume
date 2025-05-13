import { NextRequest } from "next/server";
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

export const runtime = "edge";

function isErrorWithMessage(err: unknown): err is { message: string } {
  return (
    typeof err === "object" &&
    err !== null &&
    "message" in err &&
    typeof (err as { message?: unknown }).message === "string"
  );
}

export async function POST(req: NextRequest) {
  try {
    const {
      prompt,
      apiKey,
      model = "gpt-4o",
      temperature = 1,
      maxTokens = 512,
      systemPrompt,
      presencePenalty,
      frequencyPenalty,
      topP,
    } = await req.json();
    if (!prompt || !apiKey) {
      return new Response(JSON.stringify({ error: "Missing prompt or API key" }), { status: 400 });
    }
    const result = await streamText({
      model: openai(model),
      prompt,
      temperature,
      maxTokens,
      system: systemPrompt || undefined,
      presencePenalty,
      frequencyPenalty,
      topP,
    });
    return result.toDataStreamResponse();
  } catch (err: unknown) {
    let message = "Internal error";
    if (isErrorWithMessage(err)) {
      const errMsg = err.message;
      if (errMsg.includes("401") || errMsg.toLowerCase().includes("key")) {
        message = "Invalid or unauthorized OpenAI API key.";
      } else if (errMsg.includes("429")) {
        message = "You are being rate limited by OpenAI. Try again later.";
      } else {
        message = errMsg;
      }
    }
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}