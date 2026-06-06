import { estimateAiCost, estimateMonthlyCost, estimateSavedCost } from "@/lib/ai/cost-estimator";

export function buildCostSavingSnapshot(params: {
  currentProvider: string;
  currentModel?: string | null;
  localRunsThisMonth?: number;
  baselineProvider?: string;
  baselineModel?: string;
}) {
  const baselineProvider = params.baselineProvider ?? "openai";
  const baselineModel = params.baselineModel ?? "gpt-4o-mini";
  const one = estimateSavedCost({ baselineProvider, baselineModel, zeroCostRuns: 1 });
  const tenPerDay = estimateSavedCost({ baselineProvider, baselineModel, zeroCostRuns: 10 });
  const hundredPerDay = estimateSavedCost({ baselineProvider, baselineModel, zeroCostRuns: 100 });
  const thousandMonthly = estimateSavedCost({ baselineProvider, baselineModel, zeroCostRuns: 1000 });
  const localRunsThisMonth = params.localRunsThisMonth ?? 0;
  const monthlySaved = estimateSavedCost({
    baselineProvider,
    baselineModel,
    zeroCostRuns: localRunsThisMonth
  });
  const currentCost = estimateAiCost(900, 700, params.currentProvider, params.currentModel);
  const monthlyExternal = estimateMonthlyCost({
    ideasPerDay: 10,
    analyzeRatio: 1,
    interestRatio: 0.35,
    outputRatio: 0.65,
    avgInputTokens: 900,
    avgOutputTokens: 700,
    provider: baselineProvider,
    model: baselineModel
  });

  return {
    currentProvider: params.currentProvider,
    currentModel: params.currentModel,
    currentCost,
    oneIdeaSaved: one,
    tenPerDaySaved: tenPerDay,
    hundredPerDaySaved: hundredPerDay,
    thousandMonthlySaved: thousandMonthly,
    localRunsThisMonth,
    monthlySaved,
    monthlyExternal,
    note: "成本节省为估算值，不代表真实账单；zero-cost 当前设计不调用付费 AI API。"
  };
}
