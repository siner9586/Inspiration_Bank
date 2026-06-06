import { describe, expect, it } from "vitest";
import { calculateInspirationValue } from "@/lib/scoring/valuation";

describe("calculateInspirationValue", () => {
  it("handles low value ideas", () => {
    const result = calculateInspirationValue({
      commercialValue: 5,
      contentValue: 10,
      viralityScore: 8,
      productizationScore: 6,
      feasibilityLevel: "低",
      shortVideoFit: "低",
      longTermFit: "低",
      personalFitScore: 20,
      riskLevel: "高",
      daysSinceCreated: 0
    });

    expect(result.value).toBeLessThan(200);
    expect(result.valueTier).toBe("闪念");
  });

  it("values content-heavy ideas without overpricing commercial potential", () => {
    const result = calculateInspirationValue({
      commercialValue: 18,
      contentValue: 92,
      viralityScore: 84,
      productizationScore: 28,
      feasibilityLevel: "高",
      shortVideoFit: "高",
      longTermFit: "中",
      personalFitScore: 72,
      riskLevel: "低",
      daysSinceCreated: 0
    });

    expect(result.value).toBeGreaterThan(1000);
    expect(result.value).toBeLessThan(2000);
  });

  it("discounts high commercial value with low feasibility", () => {
    const result = calculateInspirationValue({
      commercialValue: 95,
      contentValue: 35,
      viralityScore: 40,
      productizationScore: 90,
      feasibilityLevel: "低",
      shortVideoFit: "低",
      longTermFit: "高",
      personalFitScore: 55,
      riskLevel: "高",
      daysSinceCreated: 0
    });

    expect(result.components.riskPenalty).toBeLessThan(0.7);
    expect(result.value).toBeLessThan(1500);
  });

  it("applies a 30-day time bonus", () => {
    const base = calculateInspirationValue({
      commercialValue: 50,
      contentValue: 50,
      viralityScore: 50,
      productizationScore: 50,
      feasibilityLevel: "中",
      shortVideoFit: "中",
      longTermFit: "中",
      personalFitScore: 50,
      riskLevel: "中",
      daysSinceCreated: 0
    });

    const matured = calculateInspirationValue({
      commercialValue: 50,
      contentValue: 50,
      viralityScore: 50,
      productizationScore: 50,
      feasibilityLevel: "中",
      shortVideoFit: "中",
      longTermFit: "中",
      personalFitScore: 50,
      riskLevel: "中",
      daysSinceCreated: 30
    });

    expect(matured.components.timeBonus).toBe(1.1);
    expect(matured.value).toBeGreaterThan(base.value);
  });

  it("penalizes high risk", () => {
    const lowRisk = calculateInspirationValue({
      commercialValue: 70,
      contentValue: 70,
      viralityScore: 70,
      productizationScore: 70,
      feasibilityLevel: "高",
      shortVideoFit: "中",
      longTermFit: "中",
      personalFitScore: 70,
      riskLevel: "低",
      daysSinceCreated: 0
    });
    const highRisk = calculateInspirationValue({
      commercialValue: 70,
      contentValue: 70,
      viralityScore: 70,
      productizationScore: 70,
      feasibilityLevel: "高",
      shortVideoFit: "中",
      longTermFit: "中",
      personalFitScore: 70,
      riskLevel: "高",
      daysSinceCreated: 0
    });

    expect(highRisk.value).toBeLessThan(lowRisk.value);
  });
});
