import { describe, expect, it } from "vitest";
import { ideaToMarkdown, type ExportIdea } from "@/lib/export/markdown";
import { exportIdeaForPlatform } from "@/lib/export/platforms";

const idea: ExportIdea = {
  title: "灵感导出测试",
  rawContent: "原始内容",
  summary: "摘要",
  status: "actionable",
  priority: "高",
  currentValue: 1000,
  nextMinimalAction: "用 30 分钟写出草稿",
  tags: JSON.stringify(["导出"])
};

describe("export templates", () => {
  it("能导出 Markdown", () => {
    expect(ideaToMarkdown(idea)).toContain("# 灵感导出测试");
  });

  it("能生成 X thread", () => {
    expect(exportIdeaForPlatform(idea, "x_thread")).toContain("1/");
  });

  it("能生成 README", () => {
    expect(exportIdeaForPlatform(idea, "readme")).toContain("## MVP Scope");
  });
});
