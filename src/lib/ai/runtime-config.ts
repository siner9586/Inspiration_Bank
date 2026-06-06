import { normalizeProviderName } from "@/lib/ai/provider";

const paidProviders = ["openai", "openai-compatible"];

function hasExternalKey(provider: string) {
  if (provider === "openai") return Boolean(process.env.OPENAI_API_KEY);
  if (provider === "openai-compatible") return Boolean(process.env.AI_API_KEY && process.env.AI_BASE_URL);
  return false;
}

function providerLabel(value?: string | null) {
  return normalizeProviderName(value || "zero-cost");
}

export function getAiRuntimeConfig() {
  const currentProvider = providerLabel(process.env.AI_PROVIDER);
  const analyzeProvider = providerLabel(process.env.AI_ANALYZE_PROVIDER || process.env.AI_PROVIDER);
  const interestProvider = providerLabel(process.env.AI_INTEREST_PROVIDER || process.env.AI_PROVIDER);
  const outputProvider = providerLabel(process.env.AI_OUTPUT_PROVIDER || process.env.AI_PROVIDER);
  const cronProvider = providerLabel(process.env.CRON_AI_PROVIDER || "zero-cost");
  const providers = [currentProvider, analyzeProvider, interestProvider, outputProvider, cronProvider];
  const externalApiEnabled = providers.some((provider) => paidProviders.includes(provider) && hasExternalKey(provider));
  const warnings: string[] = [];

  if (currentProvider === "openai" && !process.env.OPENAI_API_KEY) {
    warnings.push("AI_PROVIDER=openai 但未配置 OPENAI_API_KEY，运行时会 fallback。");
  }
  if (currentProvider === "openai-compatible" && !hasExternalKey("openai-compatible")) {
    warnings.push("AI_PROVIDER=openai-compatible 但 AI_BASE_URL 或 AI_API_KEY 不完整。");
  }
  if (paidProviders.includes(cronProvider)) {
    warnings.push("Cron 被配置为外部 provider，后台自动运行可能产生 API 费用。");
  }
  if (!process.env.CRON_AI_PROVIDER) {
    warnings.push("CRON_AI_PROVIDER 未设置，系统默认使用 zero-cost。");
  }

  return {
    currentProvider,
    analyzeProvider,
    interestProvider,
    outputProvider,
    cronProvider,
    externalApiEnabled,
    zeroCostEnabled: providers.includes("zero-cost"),
    apiCostMode: currentProvider === "zero-cost" || currentProvider === "mock" || currentProvider === "ollama" ? "zero-api-cost" : "external-estimated",
    allowCronPaidProvider: paidProviders.includes(cronProvider),
    ollamaBaseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
    warnings
  };
}
