import OpenAI from "openai";
import type { ChatCompletionCreateParamsNonStreaming } from "openai/resources/chat/completions";

let geminiClient: OpenAI | null = null;
let groqClient: OpenAI | null = null;

function getGeminiClient(): OpenAI {
  if (!geminiClient) {
    geminiClient = new OpenAI({
      apiKey: process.env.GEMINI_API_KEY,
      baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
    });
  }
  return geminiClient;
}

function getGroqClient(): OpenAI {
  if (!groqClient) {
    groqClient = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    });
  }
  return groqClient;
}

const RETRYABLE_STATUS = new Set([429, 500, 502, 503]);

async function retryRequest(
  client: OpenAI,
  params: ChatCompletionCreateParamsNonStreaming,
  retries = 2
) {
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await client.chat.completions.create(params);
    } catch (err) {
      lastError = err;

      const status = (err as { status?: number })?.status;

      if (!RETRYABLE_STATUS.has(status ?? 0) || attempt === retries) {
        throw err;
      }

      await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
    }
  }

  throw lastError;
}

export async function createChatCompletion(
  params: ChatCompletionCreateParamsNonStreaming
) {
  try {
    // Try Gemini first
    return await retryRequest(getGeminiClient(), params);
  } catch (err) {
    const status = (err as { status?: number })?.status;

    // Only fall back on transient failures
    if (
      process.env.GROQ_API_KEY &&
      RETRYABLE_STATUS.has(status ?? 0)
    ) {
      console.warn("Gemini unavailable, falling back to Groq");

      return retryRequest(getGroqClient(), {
        ...params,

        // Replace Gemini model with a Groq model
        model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      });
    }

    throw err;
  }
}
