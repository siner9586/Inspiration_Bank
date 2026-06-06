import { describe, expect, it } from "vitest";
import { generateTitleCandidates } from "@/lib/zero-ai/title-generator";

describe("generateTitleCandidates", () => {
  it("generates at least five safe titles", () => {
    const titles = generateTitleCandidates({
      title: "把热点新闻拆成一周公众号选题",
      rawContent: "每天看到很多新闻，但不知道怎么转成自己的选题。想做一个流程，把热点拆成观点、案例、反常识问题和适合公众号的结构。",
      type: "content_topic",
      tags: ["内容选题", "公众号"]
    });

    expect(titles.length).toBeGreaterThanOrEqual(5);
    expect(titles.some((item) => item.title.startsWith("为什么"))).toBe(true);
    expect(titles.some((item) => item.title.includes("如何"))).toBe(true);
    expect(titles.join(" ")).not.toMatch(/夸大收益|灰产|赌博/);
  });
});
