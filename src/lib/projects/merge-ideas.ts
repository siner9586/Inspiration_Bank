import type { Idea } from "@prisma/client";
import { toTagList } from "@/lib/utils/text";

export type ProjectDraft = {
  name: string;
  description: string;
  positioning: string;
  targetUsers: string[];
  problem: string;
  solution: string;
  mvpScope: string[];
  roadmap: string[];
  relatedIdeaIds: string[];
  weakRelation: boolean;
  warning?: string;
};

function topTerms(ideas: Idea[]) {
  const map = new Map<string, number>();
  for (const idea of ideas) {
    for (const tag of toTagList(idea.tags)) map.set(tag, (map.get(tag) ?? 0) + 3);
    for (const word of `${idea.title} ${idea.summary}`.split(/[\s,，。；：、/|]+/).filter((item) => item.length >= 2)) {
      map.set(word, (map.get(word) ?? 0) + 1);
    }
  }
  return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([word]) => word);
}

export function mergeIdeasToProject(ideas: Idea[]): ProjectDraft {
  const terms = topTerms(ideas);
  const tagSets = ideas.map((idea) => new Set(toTagList(idea.tags)));
  const commonTags = tagSets.length ? Array.from(tagSets[0]).filter((tag) => tagSets.every((set) => set.has(tag))) : [];
  const averageValue = Math.round(ideas.reduce((sum, idea) => sum + idea.currentValue, 0) / Math.max(ideas.length, 1));
  const weakRelation = ideas.length < 2 || commonTags.length === 0;
  const name = terms[0] ? `${terms[0]}灵感转化项目` : "灵感转化项目";
  const mainIdea = [...ideas].sort((a, b) => b.currentValue - a.currentValue)[0];

  return {
    name,
    description: `由 ${ideas.length} 条灵感合并生成的项目种子，平均启发性估值 ${averageValue}。`,
    positioning: mainIdea?.summary || "把一组相关灵感收束为一个小而可验证的项目。",
    targetUsers: Array.from(new Set(ideas.flatMap((idea) => toTagList(idea.targetUsers)))).slice(0, 5),
    problem: mainIdea?.rawContent.slice(0, 240) || "用户有反复出现但尚未被系统解决的小痛点。",
    solution: `围绕“${terms.slice(0, 3).join(" / ") || "高频主题"}”做一个轻量 MVP，先验证真实需求，再决定是否扩大。`,
    mvpScope: [
      "写出 1 页项目 README 和目标用户假设",
      "做一个可以演示核心价值的最小页面或流程",
      "邀请 3 位潜在用户反馈，记录是否愿意继续使用"
    ],
    roadmap: [
      "Day 1：收束定位、README、MVP checklist",
      "Day 2-3：完成最小原型，不增加非必要功能",
      "Day 4-5：找 3 个真实反馈",
      "Day 6-7：复盘是否继续、暂停或转成内容"
    ],
    relatedIdeaIds: ideas.map((idea) => idea.id),
    weakRelation,
    warning: weakRelation ? "这些灵感相关性偏弱，不建议强行合并为大项目；可以先拆成内容或单点验证。" : undefined
  };
}
