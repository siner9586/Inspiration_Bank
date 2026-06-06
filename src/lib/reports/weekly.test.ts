import { describe, expect, it } from "vitest";
import { buildWeeklyReportData, type WeeklyIdea } from "@/lib/reports/weekly";
import { generateWeeklyMarkdown } from "@/lib/reports/markdown";

function idea(overrides: Partial<WeeklyIdea> = {}): WeeklyIdea {
  return {
    id: overrides.id ?? "idea-1",
    title: overrides.title ?? "周报灵感",
    summary: overrides.summary ?? "本周新增灵感",
    status: overrides.status ?? "actionable",
    type: overrides.type ?? "content_topic",
    priority: overrides.priority ?? "高",
    currentValue: overrides.currentValue ?? 1200,
    initialValue: overrides.initialValue ?? 900,
    nextMinimalAction: overrides.nextMinimalAction ?? "用 30 分钟写出周报",
    recommendedPlatforms: overrides.recommendedPlatforms ?? JSON.stringify(["公众号"]),
    contentValue: overrides.contentValue ?? 75,
    productizationScore: overrides.productizationScore ?? 60,
    viralityScore: overrides.viralityScore ?? 60,
    createdAt: overrides.createdAt ?? new Date(),
    archivedAt: overrides.archivedAt,
    outputs: overrides.outputs ?? [],
    actionLogs: overrides.actionLogs ?? [],
    tags: overrides.tags ?? JSON.stringify(["AI", "复盘"])
  };
}

describe("weekly report", () => {
  it("能统计本周新增", () => {
    const data = buildWeeklyReportData([idea()]);
    expect(data.newCount).toBe(1);
  });

  it("能统计已转化", () => {
    const data = buildWeeklyReportData([idea({ status: "converted" })]);
    expect(data.converted).toHaveLength(1);
  });

  it("能生成 Markdown", () => {
    const markdown = generateWeeklyMarkdown(buildWeeklyReportData([idea()]));
    expect(markdown).toContain("# 灵感银行周报");
    expect(markdown).toContain("## 高价值灵感");
  });
});
