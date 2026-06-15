import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { SYSTEM_PROMPT } from "@/lib/ai/prompts";

export async function POST(req: Request) {
  try {
    const { prompt } = (await req.json()) as { prompt: string };
    console.debug("API /api/chat received prompt:", prompt?.slice(0, 100));

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Prompt is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error("OPENROUTER_API_KEY not set");
      return new Response(
        JSON.stringify({
          error:
            "OpenRouter API key not configured. Set OPENROUTER_API_KEY in your environment.",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    const openai = createOpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey,
    });

    console.debug("Calling streamText with model google/gemma-4-31b-it:free");
    const result = streamText({
      model: openai("google/gemma-4-31b-it:free"),
      system: SYSTEM_PROMPT,
      prompt,
      maxOutputTokens: 4096,
      temperature: 0.7,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to generate project brief";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
