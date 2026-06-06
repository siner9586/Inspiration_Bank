export type ModelPricing = {
  provider: string;
  model: string;
  inputPer1MTokens: number;
  outputPer1MTokens: number;
  currency: "USD" | "CNY";
  note?: string;
  updatedAt: string;
};

export type CostEstimate =
  | {
      known: true;
      provider: string;
      model: string;
      inputTokens: number;
      outputTokens: number;
      inputCost: number;
      outputCost: number;
      totalCost: number;
      currency: "USD" | "CNY";
      note?: string;
    }
  | {
      known: false;
      provider: string;
      model: string;
      totalCost: null;
      currency: "USD";
      note: string;
    };

const zeroCostPricing: ModelPricing[] = [
  {
    provider: "zero-cost",
    model: "zero-cost-rule-engine",
    inputPer1MTokens: 0,
    outputPer1MTokens: 0,
    currency: "USD",
    note: "当前设计不调用外部付费 AI API。",
    updatedAt: "2026-06-06"
  },
  {
    provider: "mock",
    model: "mock-model",
    inputPer1MTokens: 0,
    outputPer1MTokens: 0,
    currency: "USD",
    note: "mock provider 本地生成，API 成本为 0。",
    updatedAt: "2026-06-06"
  },
  {
    provider: "ollama",
    model: "qwen2.5:7b",
    inputPer1MTokens: 0,
    outputPer1MTokens: 0,
    currency: "USD",
    note: "Ollama API 成本按 0 估算，不包含本地硬件、电费和时间成本。",
    updatedAt: "2026-06-06"
  }
];

const externalPricing: ModelPricing[] = [
  {
    provider: "openai",
    model: "gpt-4o-mini",
    inputPer1MTokens: 0.15,
    outputPer1MTokens: 0.6,
    currency: "USD",
    note: "仅用于估算，价格可能变化，请以官方价格页为准。",
    updatedAt: "2026-06-06"
  },
  {
    provider: "openai",
    model: "gpt-4o",
    inputPer1MTokens: 5,
    outputPer1MTokens: 15,
    currency: "USD",
    note: "仅用于估算，价格可能变化，请以官方价格页为准。",
    updatedAt: "2026-06-06"
  },
  {
    provider: "openai-compatible",
    model: "baseline-external-estimate",
    inputPer1MTokens: 0.15,
    outputPer1MTokens: 0.6,
    currency: "USD",
    note: "通用外部模型估算基线，不代表任一兼容平台真实价格。",
    updatedAt: "2026-06-06"
  }
];

const pricingTable = [...zeroCostPricing, ...externalPricing];

function normalize(value: string) {
  return value.toLowerCase().trim();
}

export function listKnownPricing() {
  return pricingTable;
}

export function getModelPricing(provider: string, model?: string | null): ModelPricing | null {
  const normalizedProvider = normalize(provider);
  if (normalizedProvider === "zero-cost") return zeroCostPricing[0];
  if (normalizedProvider === "mock") return zeroCostPricing[1];
  if (normalizedProvider === "ollama") {
    return {
      ...zeroCostPricing[2],
      model: model || zeroCostPricing[2].model
    };
  }

  const normalizedModel = normalize(model || "");
  return (
    pricingTable.find(
      (item) => normalize(item.provider) === normalizedProvider && normalize(item.model) === normalizedModel
    ) ??
    (normalizedProvider === "openai-compatible"
      ? pricingTable.find((item) => item.provider === "openai-compatible")
      : null) ??
    null
  );
}

export function estimateAiCost(inputTokens: number, outputTokens: number, provider: string, model?: string | null): CostEstimate {
  const pricing = getModelPricing(provider, model);
  if (!pricing) {
    return {
      known: false,
      provider,
      model: model || "unknown",
      totalCost: null,
      currency: "USD",
      note: "unknown model，无法估算，不报错。"
    };
  }

  const inputCost = (Math.max(0, inputTokens) / 1_000_000) * pricing.inputPer1MTokens;
  const outputCost = (Math.max(0, outputTokens) / 1_000_000) * pricing.outputPer1MTokens;
  return {
    known: true,
    provider,
    model: model || pricing.model,
    inputTokens,
    outputTokens,
    inputCost,
    outputCost,
    totalCost: inputCost + outputCost,
    currency: pricing.currency,
    note: pricing.note
  };
}

export function estimateMonthlyCost(params: {
  ideasPerDay: number;
  analyzeRatio: number;
  interestRatio: number;
  outputRatio: number;
  avgInputTokens: number;
  avgOutputTokens: number;
  provider: string;
  model?: string | null;
}) {
  const monthlyRuns =
    Math.max(0, params.ideasPerDay) *
    30 *
    (Math.max(0, params.analyzeRatio) + Math.max(0, params.interestRatio) + Math.max(0, params.outputRatio));
  const estimate = estimateAiCost(
    monthlyRuns * params.avgInputTokens,
    monthlyRuns * params.avgOutputTokens,
    params.provider,
    params.model
  );

  return {
    monthlyRuns,
    estimate
  };
}

export function estimateSavedCost(params: {
  baselineProvider: string;
  baselineModel?: string | null;
  zeroCostRuns: number;
  avgInputTokens?: number;
  avgOutputTokens?: number;
}) {
  const avgInputTokens = params.avgInputTokens ?? 900;
  const avgOutputTokens = params.avgOutputTokens ?? 700;
  const baseline = estimateAiCost(
    params.zeroCostRuns * avgInputTokens,
    params.zeroCostRuns * avgOutputTokens,
    params.baselineProvider,
    params.baselineModel
  );

  return {
    zeroCostRuns: params.zeroCostRuns,
    avgInputTokens,
    avgOutputTokens,
    savedCost: baseline.known ? baseline.totalCost : 0,
    currency: baseline.currency,
    baseline
  };
}
