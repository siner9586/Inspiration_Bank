import { describe, expect, it } from "vitest";
import { analyzePortfolio } from "@/lib/insights/analyze-portfolio";

function idea(status = "actionable") {
  return {
    id: status,
    title: "AI 灵感复盘",
    summary: "关键词统计",
    tags: JSON.stringify(["AI", "复盘"]),
    type: "content_topic",
    status,
    currentValue: 1000,
    contentValue: 80,
    productizationScore: 70,
    createdAt: new Date(),
    archivedAt: null,
    rawContent: "",
    source: "",
    initialValue: 0,
    valueTier: "",
    valueExplanation: "",
    valueComponents: "{}",
    feasibilityLevel: "中",
    commercialValue: 50,
    viralityLevel: "中",
    viralityScore: 60,
    productizationLevel: "中",
    shortVideoFit: "中",
    longTermFit: "中",
    personalFitScore: 60,
    riskLevel: "中",
    priority: "高",
    targetUsers: "[]",
    monetizationMethods: "[]",
    risks: "[]",
    requiredResources: "[]",
    nextMinimalAction: "",
    recommendedPlatforms: "[]",
    productSuggestions: "[]",
    updatedAt: new Date()
  };
}

describe("analyzePortfolio", () => {
  it("能统计关键词", () => {
    const data = analyzePortfolio([idea()] as never);
    expect(data.themes[0][0]).toBe("AI");
  });

  it("能统计类型分布", () => {
    const data = analyzePortfolio([idea()] as never);
    expect(data.typeDistribution[0][0]).toBe("content_topic");
  });

  it("能统计转化率", () => {
    const data = analyzePortfolio([idea("converted"), idea()] as never);
    expect(data.conversionRate).toBe(50);
  });
});
