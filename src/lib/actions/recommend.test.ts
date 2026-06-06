import { describe, expect, it } from "vitest";
import { buildEmptyActionState, recommendTodayActions, type ActionIdea } from "@/lib/actions/recommend";

function idea(overrides: Partial<ActionIdea> = {}): ActionIdea {
  return {
    id: overrides.id ?? "idea-1",
    title: overrides.title ?? "AI 内容复盘工具",
    summary: overrides.summary ?? "把灵感转为行动",
    status: overrides.status ?? "actionable",
    type: overrides.type ?? "tool_idea",
    priority: overrides.priority ?? "高",
    currentValue: overrides.currentValue ?? 1800,
    nextMinimalAction: overrides.nextMinimalAction ?? "用 30 分钟写出一个 README 大纲",
    recommendedPlatforms: overrides.recommendedPlatforms ?? JSON.stringify(["X", "公众号"]),
    contentValue: overrides.contentValue ?? 80,
    productizationScore: overrides.productizationScore ?? 70,
    viralityScore: overrides.viralityScore ?? 65,
    createdAt: overrides.createdAt ?? new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    archivedAt: overrides.archivedAt,
    outputs: overrides.outputs ?? [],
    actionLogs: overrides.actionLogs ?? []
  };
}

describe("recommendTodayActions", () => {
  it("能推荐今日行动", () => {
    const actions = recommendTodayActions([idea()]);
    expect(actions).toHaveLength(1);
    expect(actions[0].actionText).toContain("30 分钟");
  });

  it("archived 不推荐", () => {
    expect(recommendTodayActions([idea({ status: "archived" })])).toHaveLength(0);
    expect(recommendTodayActions([idea({ archivedAt: new Date() })])).toHaveLength(0);
  });

  it("converted 不推荐", () => {
    expect(recommendTodayActions([idea({ status: "converted" })])).toHaveLength(0);
  });

  it("无行动时返回空状态数据", () => {
    const empty = buildEmptyActionState();
    expect(empty.title).toContain("今天");
  });
});
