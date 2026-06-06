import type { CreateIdeaInput } from "@/lib/ai/schemas";

export const demoIdeas: CreateIdeaInput[] = [
  {
    title: "灵感银行：把人的奇思妙想存成资产",
    rawContent:
      "很多想法只是被写进备忘录，但没有估值、复盘和转化机制。可以做一个像银行账户一样管理灵感的系统，自动拆解价值、生成下一步行动、提醒复盘。",
    type: "product_idea",
    tags: ["AI 产品", "知识管理", "思想资产"],
    source: "产品构想"
  },
  {
    title: "AI 论文简报自动生成网站",
    rawContent:
      "订阅 arXiv 或指定领域论文，AI 自动生成中文简报、关键贡献、适合谁读、与已有工作的差异，并支持每周邮件或公众号草稿。",
    type: "research_idea",
    tags: ["AI", "论文", "内容自动化"],
    source: "研究阅读"
  },
  {
    title: "个人认知框架复盘系统",
    rawContent:
      "把一个人的判断、方法论、失败案例和复盘记录结构化，定期提示更新认知框架，并能把旧观点与新经历关联起来。",
    type: "tool_idea",
    tags: ["个人成长", "复盘", "认知框架"],
    source: "自我管理"
  }
];
