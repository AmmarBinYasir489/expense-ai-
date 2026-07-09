import OpenAI from "openai";

// Google Gemini via its OpenAI-compatible endpoint, so we can keep using the
// OpenAI SDK unchanged. The model names in the routes are Gemini models
// (e.g. gemini-2.5-flash / gemini-2.0-flash).
export const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});
