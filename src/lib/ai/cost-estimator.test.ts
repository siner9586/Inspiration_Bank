import { describe, expect, it } from "vitest";
import {
  estimateAiCost,
  estimateMonthlyCost,
  estimateSavedCost,
  getModelPricing
} from "@/lib/ai/cost-estimator";

describe("cost estimator", () => {
  it("returns zero API cost for zero-cost and mock providers", () => {
    expect(estimateAiCost(1000, 1000, "zero-cost", "zero-cost-rule-engine")).toMatchObject({
      known: true,
      totalCost: 0
    });
    expect(estimateAiCost(1000, 1000, "mock", "mock-model")).toMatchObject({
      known: true,
      totalCost: 0
    });
  });

  it("returns zero API cost for Ollama with a note", () => {
    const estimate = estimateAiCost(1000, 1000, "ollama", "qwen2.5:7b");
    expect(estimate.known).toBe(true);
    if (estimate.known) {
      expect(estimate.totalCost).toBe(0);
      expect(estimate.note).toContain("不包含本地硬件");
    }
  });

  it("returns unknown for unknown models", () => {
    const estimate = estimateAiCost(1000, 1000, "unknown", "unknown-model");
    expect(estimate.known).toBe(false);
    expect(getModelPricing("unknown", "unknown-model")).toBeNull();
  });

  it("estimates monthly cost and saved cost", () => {
    const monthly = estimateMonthlyCost({
      ideasPerDay: 10,
      analyzeRatio: 1,
      interestRatio: 0.3,
      outputRatio: 0.7,
      avgInputTokens: 900,
      avgOutputTokens: 700,
      provider: "openai",
      model: "gpt-4o-mini"
    });
    const saved = estimateSavedCost({
      baselineProvider: "openai",
      baselineModel: "gpt-4o-mini",
      zeroCostRuns: 100
    });

    expect(monthly.monthlyRuns).toBeGreaterThan(0);
    expect(saved.savedCost).toBeGreaterThan(0);
  });
});
