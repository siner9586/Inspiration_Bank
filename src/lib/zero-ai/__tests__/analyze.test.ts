import { subDays } from "date-fns";
import { describe, expect, it } from "vitest";
import { analysisResultSchema } from "@/lib/ai/schemas";
import { analyzeIdeaZeroCost } from "@/lib/zero-ai/analyze";

describe("analyzeIdeaZeroCost", () => {
  it("returns a complete schema-compatible analysis", () => {
    const result = analyzeIdeaZeroCost({
      title: "Chrome 插件：把网页划线保存为选题卡",
      rawContent: "读网页时划线，一键保存成选题卡，自动提取观点、反方观点、可写标题和引用来源。",
      type: "tool_idea",
      tags: ["Chrome 插件", "内容工具"],
      createdAt: subDays(new Date(), 2)
    });

    expect(analysisResultSchema.safeParse(result).success).toBe(true);
    expect(result.spreadableTitles.length).toBeGreaterThanOrEqual(5);
    expect(result.nextMinimalAction).toContain("30 分钟");
    expect(result.zeroAi.ruleHitCount).toBeGreaterThan(0);
  });

  it("scores commercial ideas higher", () => {
    const result = analyzeIdeaZeroCost({
      title: "给中小团队的 AI SOP 生成器",
      rawContent: "很多企业客户想用 AI 但不知道怎么落地。输入业务场景，生成岗位 SOP、付费模板、检查清单和培训材料，适合 SaaS 订阅。",
      type: "product_idea",
      tags: ["B2B", "SaaS", "自动化"]
    });

    expect(result.commercialValue).toBeGreaterThanOrEqual(65);
    expect(result.productizationScore).toBeGreaterThanOrEqual(65);
  });

  it("scores content ideas higher", () => {
    const result = analyzeIdeaZeroCost({
      title: "公众号选题：为什么你的收藏夹没有复利",
      rawContent: "收藏不是资产，只有被整理、复盘、输出和使用的内容才会产生复利。可以写一篇很有共鸣的文章。",
      type: "wechat_article",
      tags: ["公众号", "复盘", "知识管理"]
    });

    expect(result.contentValue).toBeGreaterThanOrEqual(66);
    expect(result.recommendedPlatforms).toContain("微信公众号");
  });

  it("does not overestimate vague ideas", () => {
    const result = analyzeIdeaZeroCost({
      title: "做点什么",
      rawContent: "最近感觉 AI 很火，想搞个东西，但还没想清楚方向。",
      type: "other",
      tags: ["模糊想法"]
    });

    expect(result.commercialValue).toBeLessThan(60);
    expect(result.productizationScore).toBeLessThan(60);
    expect(result.priority).not.toBe("高");
  });
});
