import { describe, expect, it } from "vitest";
import { analysisResultSchema, interestResultSchema, outputResultSchema } from "@/lib/ai/schemas";

const validAnalysis = {
  summary: "把灵感存成可复盘的思想资产。",
  feasibilityLevel: "高",
  commercialValue: 62,
  contentValue: 78,
  viralityLevel: "中高",
  viralityScore: 72,
  productizationLevel: "高",
  productizationScore: 76,
  shortVideoFit: "中",
  longTermFit: "高",
  personalFitScore: 80,
  riskLevel: "中",
  spreadableTitles: [
    { title: "标题 1", platform: "微信公众号", score: 80 },
    { title: "标题 2", platform: "X", score: 76 },
    { title: "标题 3", platform: "即刻", score: 70 },
    { title: "标题 4", platform: "小红书", score: 68 },
    { title: "标题 5", platform: "知乎", score: 66 }
  ],
  productSuggestions: ["轻量工作台"],
  recommendedPlatforms: ["微信公众号", "X"],
  requiredResources: ["原型"],
  nextMinimalAction: "用 30 分钟写出目标用户和验证问题。",
  targetUsers: ["创作者"],
  monetizationMethods: ["订阅"],
  risks: ["需求需要验证"],
  priority: "高",
  valueExplanation: "启发性估值，不代表真实市场价格。"
};

describe("AI schemas", () => {
  it("accepts valid structured analysis output", () => {
    expect(analysisResultSchema.parse(validAnalysis).summary).toContain("思想资产");
  });

  it("rejects analysis with too few titles", () => {
    const invalid = {
      ...validAnalysis,
      spreadableTitles: validAnalysis.spreadableTitles.slice(0, 2)
    };
    expect(() => analysisResultSchema.parse(invalid)).toThrow();
  });

  it("validates interest output", () => {
    const parsed = interestResultSchema.parse({
      interests: [
        { interestType: "升级为内容", content: "可以扩展为文章。", suggestedAction: "写 5 个小标题。" },
        { interestType: "改造成推文", content: "可以压缩为观点。", suggestedAction: "发一条测试。" },
        { interestType: "现在适合行动", content: "可做用户访谈。", suggestedAction: "问 1 位用户。" }
      ]
    });
    expect(parsed.interests).toHaveLength(3);
  });

  it("validates generated output", () => {
    const parsed = outputResultSchema.parse({
      outputType: "x_tweet",
      title: "一条 X 推文",
      content: "灵感需要进入系统，才能持续复利。"
    });
    expect(parsed.outputType).toBe("x_tweet");
  });
});
