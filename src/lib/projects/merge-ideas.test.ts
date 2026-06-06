import { describe, expect, it } from "vitest";
import { mergeIdeasToProject } from "@/lib/projects/merge-ideas";

function idea(id: string, title: string, tags: string[]) {
  return {
    id,
    title,
    tags: JSON.stringify(tags),
    type: "tool_idea",
    summary: `${title} 摘要`,
    rawContent: `${title} 原始内容`,
    currentValue: 1000,
    targetUsers: JSON.stringify(["个人创作者"]),
    status: "actionable",
    priority: "高",
    initialValue: 0,
    valueTier: "",
    valueExplanation: "",
    valueComponents: "{}",
    source: "",
    feasibilityLevel: "中",
    commercialValue: 50,
    contentValue: 60,
    viralityLevel: "中",
    viralityScore: 60,
    productizationLevel: "中",
    productizationScore: 70,
    shortVideoFit: "中",
    longTermFit: "中",
    personalFitScore: 60,
    riskLevel: "中",
    monetizationMethods: "[]",
    risks: "[]",
    requiredResources: "[]",
    nextMinimalAction: "",
    recommendedPlatforms: "[]",
    productSuggestions: "[]",
    createdAt: new Date(),
    updatedAt: new Date(),
    archivedAt: null
  };
}

describe("mergeIdeasToProject", () => {
  it("相关灵感能合并", () => {
    const project = mergeIdeasToProject([idea("1", "AI 灵感工具", ["AI", "灵感"]), idea("2", "AI 复盘系统", ["AI", "复盘"])] as never);
    expect(project.weakRelation).toBe(false);
    expect(project.mvpScope.length).toBeGreaterThan(0);
  });

  it("不相关灵感提示弱相关", () => {
    const project = mergeIdeasToProject([idea("1", "AI 工具", ["AI"]), idea("2", "庭院设计", ["园林"])] as never);
    expect(project.warning).toBeTruthy();
  });

  it("能生成 MVP scope", () => {
    const project = mergeIdeasToProject([idea("1", "AI 灵感工具", ["AI"]), idea("2", "AI 项目种子", ["AI"])] as never);
    expect(project.mvpScope.join(" ")).toContain("README");
  });
});
