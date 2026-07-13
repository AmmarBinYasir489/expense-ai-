import OpenAI from "openai";
import type { ChatCompletionCreateParamsNonStreaming } from "openai/resources/chat/completions";

// Google Gemini via its OpenAI-compatible endpoint, so we can keep using the
// OpenAI SDK unchanged. The model names in the routes are Gemini models
// (e.g. gemini-2.5-flash / gemini-2.5-flash-lite).
export const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

// Gemini's free tier intermittently returns 429/500/503 (transient overload).
// Retry a couple of times with backoff so these blips don't reach the user.
export async function createChatCompletion(
  params: ChatCompletionCreateParamsNonStreaming,
  retries = 2
) {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await openai.chat.completions.create(params);
    } catch (err) {
      lastError = err;
      const status = (err as { status?: number })?.status;
      const retryable =
        status === 429 || status === 500 || status === 502 || status === 503;
      if (!retryable || attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
    }
  }
  throw lastError;
}
