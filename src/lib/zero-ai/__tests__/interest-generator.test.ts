import { subDays } from "date-fns";
import { describe, expect, it } from "vitest";
import { generateIdeaInterestZeroCost } from "@/lib/zero-ai/interest-generator";

const baseIdea = {
  title: "个人年度项目墓地",
  rawContent: "把一年中放弃的项目整理成墓地，记录为什么放弃、学到什么、哪些组件可以复用，降低失败浪费。",
  type: "life_reflection" as const,
  tags: ["复盘", "项目"]
};

describe("generateIdeaInterestZeroCost", () => {
  it("generates 7 day interest", () => {
    const result = generateIdeaInterestZeroCost({ ...baseIdea, createdAt: subDays(new Date(), 7) });
    expect(result.interests.length).toBeGreaterThanOrEqual(3);
    expect(result.interests.every((item) => item.milestone === "7d")).toBe(true);
  });

  it("generates 30 day interest", () => {
    const result = generateIdeaInterestZeroCost({ ...baseIdea, createdAt: subDays(new Date(), 30) });
    expect(result.interests.every((item) => item.milestone === "30d")).toBe(true);
    expect(result.interests.some((item) => item.interestType.includes("MVP"))).toBe(true);
  });

  it("generates 90 day interest", () => {
    const result = generateIdeaInterestZeroCost({ ...baseIdea, createdAt: subDays(new Date(), 90) });
    expect(result.interests.every((item) => item.milestone === "90d")).toBe(true);
    expect(result.interests.some((item) => item.interestType.includes("长期主题"))).toBe(true);
  });
});
