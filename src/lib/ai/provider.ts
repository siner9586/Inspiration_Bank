import type { Idea, UserSettings } from "@prisma/client";
import { mockAiProvider } from "@/lib/ai/mock-provider";
import { openaiProvider } from "@/lib/ai/openai-provider";
import { openaiCompatibleProvider } from "@/lib/ai/openai-compatible-provider";
import { ollamaProvider } from "@/lib/ai/ollama-provider";
import { zeroCostProvider } from "@/lib/ai/zero-cost-provider";
import type { AiCallOptions } from "@/lib/ai/ai-call-logger";
import type { AnalysisResult, InterestResult, OutputResult } from "@/types/analysis";
import type { CreateIdeaInput } from "@/lib/ai/schemas";
import type { OutputType } from "@/types/idea";

export type AiIdeaInput = CreateIdeaInput & {
  createdAt?: Date;
};

export type AiIdeaRecord = Idea & {
  titles?: Array<{ title: string; platform: string; score: number }>;
};

export type AiProviderName = "mock" | "zero-cost" | "openai" | "openai-compatible" | "ollama";

export type AiProvider = {
  analyzeIdea(
    input: AiIdeaInput,
    settings: UserSettings | null,
    options?: AiCallOptions
  ): Promise<AnalysisResult>;
  generateInterest(
    idea: AiIdeaRecord,
    settings: UserSettings | null,
    options?: AiCallOptions
  ): Promise<InterestResult>;
  generateOutput(
    idea: AiIdeaRecord,
    outputType: OutputType,
    settings: UserSettings | null,
    options?: AiCallOptions
  ): Promise<OutputResult>;
  revalueIdea(
    idea: AiIdeaRecord,
    settings: UserSettings | null,
    options?: AiCallOptions
  ): Promise<AnalysisResult>;
};

export function normalizeProviderName(value?: string | null): AiProviderName {
  const normalized = value?.toLowerCase().trim();
  if (normalized === "zero-cost" || normalized === "zerocost" || normalized === "zero") return "zero-cost";
  if (normalized === "openai") return "openai";
  if (normalized === "openai-compatible") return "openai-compatible";
  if (normalized === "ollama") return "ollama";
  return "zero-cost";
}

export function getProviderByName(providerName: string | undefined | null): AiProvider {
  switch (normalizeProviderName(providerName)) {
    case "zero-cost":
      return zeroCostProvider;
    case "openai":
      return process.env.OPENAI_API_KEY ? openaiProvider : getFallbackProvider();
    case "openai-compatible":
      return openaiCompatibleProvider;
    case "ollama":
      return ollamaProvider;
    case "mock":
      return mockAiProvider;
    default:
      return zeroCostProvider;
  }
}

export function getFallbackProvider(): AiProvider {
  const fallbackName = normalizeProviderName(process.env.AI_FALLBACK_PROVIDER || "mock");
  if (fallbackName === "zero-cost") return zeroCostProvider;
  if (fallbackName === "mock") return mockAiProvider;
  if (fallbackName === "openai" && process.env.OPENAI_API_KEY) return openaiProvider;
  if (fallbackName === "openai-compatible") return openaiCompatibleProvider;
  if (fallbackName === "ollama") return ollamaProvider;
  return mockAiProvider;
}

export function getAiProvider(): AiProvider {
  return getProviderByName(process.env.AI_PROVIDER || "zero-cost");
}

export function getActiveProviderName() {
  return normalizeProviderName(process.env.AI_PROVIDER);
}
