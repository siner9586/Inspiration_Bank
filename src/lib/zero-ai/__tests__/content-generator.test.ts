import { describe, expect, it } from "vitest";
import { generateContentDraftZeroCost } from "@/lib/zero-ai/content-generator";
import type { OutputType } from "@/types/idea";

const idea = {
  title: "AI 面试复盘助手",
  rawContent: "面试结束后输入问题和回答，分析表达结构、遗漏点、可改进答案，并生成下一次练习清单。",
  summary: "把面试复盘拆成可行动练习清单。",
  nextMinimalAction: "用 30 分钟写出 3 个面试问题和一次改进答案。",
  productSuggestions: JSON.stringify(["Web 工具", "执行清单"]),
  targetUsers: JSON.stringify(["求职者", "转岗人群"])
};

describe("generateContentDraftZeroCost", () => {
  it("generates platform-specific drafts", () => {
    const types: OutputType[] = ["x_tweet", "wechat_outline", "xiaohongshu_post", "short_video_script"];
    for (const outputType of types) {
      const result = generateContentDraftZeroCost({ idea, outputType });
      expect(result.outputType).toBe(outputType);
      expect(result.content).toContain("模板生成");
      expect(result.content.length).toBeGreaterThan(80);
    }
  });
});
