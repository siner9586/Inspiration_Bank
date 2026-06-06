import { createOpenAiCompatibleProvider } from "@/lib/ai/openai-compatible-provider";

export const openaiProvider = createOpenAiCompatibleProvider({
  providerName: "openai",
  apiKey: process.env.OPENAI_API_KEY,
  model: process.env.OPENAI_MODEL ?? process.env.AI_MODEL ?? "gpt-4o-mini",
  requireApiKey: true
});
