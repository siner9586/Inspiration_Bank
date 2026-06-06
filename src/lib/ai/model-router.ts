import {
  getProviderByName,
  normalizeProviderName,
  type AiProvider,
  type AiProviderName
} from "@/lib/ai/provider";
import type { AiTaskType } from "@/lib/ai/ai-call-logger";

export type TaskRoute = {
  providerName: AiProviderName;
  model: string;
};

function defaultModel(providerName: AiProviderName) {
  if (providerName === "zero-cost") return process.env.AI_MODEL || "zero-cost-rule-engine";
  if (providerName === "openai") return process.env.OPENAI_MODEL || process.env.AI_MODEL || "gpt-4o-mini";
  if (providerName === "ollama") return process.env.AI_MODEL || "qwen2.5:7b";
  return process.env.AI_MODEL || "mock-model";
}

export function getTaskRoute(taskType: AiTaskType): TaskRoute {
  const providerEnv =
    taskType === "interest"
      ? process.env.AI_INTEREST_PROVIDER
      : taskType === "output"
        ? process.env.AI_OUTPUT_PROVIDER
        : process.env.AI_ANALYZE_PROVIDER;

  const modelEnv =
    taskType === "interest"
      ? process.env.AI_INTEREST_MODEL
      : taskType === "output"
        ? process.env.AI_OUTPUT_MODEL
        : process.env.AI_ANALYZE_MODEL;

  const providerName = normalizeProviderName(providerEnv || process.env.AI_PROVIDER || "zero-cost");
  return {
    providerName,
    model: modelEnv || defaultModel(providerName)
  };
}

export function getTaskProvider(taskType: AiTaskType): {
  provider: AiProvider;
  route: TaskRoute;
} {
  const route = getTaskRoute(taskType);
  return {
    provider: getProviderByName(route.providerName),
    route
  };
}

export function getModelRoutedProvider(): AiProvider {
  return {
    analyzeIdea(input, settings, options) {
      const { provider, route } = getTaskProvider("analyze");
      return provider.analyzeIdea(input, settings, {
        ...options,
        providerName: route.providerName,
        model: route.model,
        taskType: "analyze"
      });
    },
    revalueIdea(idea, settings, options) {
      const { provider, route } = getTaskProvider("analyze");
      return provider.revalueIdea(idea, settings, {
        ...options,
        providerName: route.providerName,
        model: route.model,
        taskType: "revalue",
        ideaId: options?.ideaId ?? idea.id
      });
    },
    generateInterest(idea, settings, options) {
      const { provider, route } = getTaskProvider("interest");
      return provider.generateInterest(idea, settings, {
        ...options,
        providerName: route.providerName,
        model: route.model,
        taskType: "interest",
        ideaId: options?.ideaId ?? idea.id
      });
    },
    generateOutput(idea, outputType, settings, options) {
      const { provider, route } = getTaskProvider("output");
      return provider.generateOutput(idea, outputType, settings, {
        ...options,
        providerName: route.providerName,
        model: route.model,
        taskType: "output",
        ideaId: options?.ideaId ?? idea.id
      });
    }
  };
}
