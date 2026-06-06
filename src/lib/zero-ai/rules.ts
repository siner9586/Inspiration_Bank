import type { UserSettings } from "@prisma/client";
import type { ZeroAiInput } from "@/lib/zero-ai/types";
import { toTagList } from "@/lib/utils/text";

export function normalizeText(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

export function getIdeaText(input: Pick<ZeroAiInput, "title" | "rawContent" | "tags">) {
  return `${input.title} ${input.rawContent} ${(input.tags ?? []).join(" ")}`;
}

export function uniqueItems(items: string[], limit = items.length) {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const item of items) {
    const normalized = item.trim();
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    result.push(normalized);
    if (result.length >= limit) break;
  }
  return result;
}

export function matchTerms(text: string, terms: string[]) {
  const normalized = normalizeText(text);
  return terms.filter((term) => normalized.includes(term.toLowerCase()));
}

export function hasAny(text: string, terms: string[]) {
  return matchTerms(text, terms).length > 0;
}

export function clampScore(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function scoreToSimpleLevel(score: number): "低" | "中" | "高" {
  if (score >= 72) return "高";
  if (score >= 45) return "中";
  return "低";
}

export function scoreToLevel(score: number): "低" | "中" | "中高" | "高" {
  if (score >= 82) return "高";
  if (score >= 68) return "中高";
  if (score >= 42) return "中";
  return "低";
}

export function safeTopic(title: string, rawContent = "") {
  const candidate = title.trim() || rawContent.trim().slice(0, 28) || "这个想法";
  return candidate
    .replace(/[“”"']/g, "")
    .replace(/\s+/g, " ")
    .slice(0, 34);
}

export function summarizeIdea(title: string, rawContent: string) {
  const firstSentence =
    rawContent
      .split(/[。！？!?；;\n]/)
      .map((item) => item.trim())
      .find((item) => item.length >= 8) ?? rawContent.trim();
  const core = firstSentence.slice(0, 72);
  return `${safeTopic(title)}的核心是：${core || "把一个闪念转成可复盘、可行动的思想资产"}。`;
}

export function inferKeywords(input: Pick<ZeroAiInput, "title" | "rawContent" | "tags">, limit = 6) {
  const tags = input.tags ?? [];
  const words = `${input.title} ${input.rawContent}`
    .split(/[\s,，。！？!?:：；;\n、/｜|（）()【】[\]{}<>《》]+/)
    .map((item) => item.trim())
    .filter((item) => item.length >= 2 && item.length <= 16);

  return uniqueItems(
    [
      ...tags,
      ...words.filter((word) => /AI|SaaS|MVP|Chrome|GitHub|X|B2B|SOP/i.test(word)),
      ...words.filter((word) => /产品|工具|内容|公众号|短视频|小红书|用户|复盘|自动|工作流|模板|看板/.test(word)),
      ...words
    ],
    limit
  );
}

export function hasConcreteUser(text: string) {
  return /给|面向|针对|帮助|用户|客户|团队|企业|老师|学生|创作者|开发者|运营|普通人|人群/.test(text);
}

export function hasTimeBoxedAction(text: string) {
  return /30\s*分钟|半小时|今天|第一步|先|找\s*\d|问\s*\d|写\s*\d|画|录|发/.test(text);
}

export function hasConflictOrContrast(text: string) {
  return /不是.+而是|以为.+其实|真正|反常识|反差|冲突|为什么|别再|没有.+只有/.test(text);
}

export function hasStorySignal(text: string) {
  return /我|朋友|案例|真实|一次|经历|复盘|项目|从 0|从0|过程|墓地/.test(text);
}

export function settingsText(settings?: UserSettings | null) {
  if (!settings) return "";
  return [
    settings.focusDirections,
    toTagList(settings.platforms).join(" "),
    settings.contentStyle,
    settings.resources,
    settings.skills,
    settings.conversionGoal
  ].join(" ");
}

export function settingsPlatforms(settings?: UserSettings | null) {
  return settings ? toTagList(settings.platforms) : [];
}

export function countOverlap(a: string[], bText: string) {
  const normalized = normalizeText(bText);
  return a.filter((item) => normalized.includes(item.toLowerCase())).length;
}

export function estimatedSavedCostForRuns(runs: number) {
  return Math.round(runs * 0.003 * 10000) / 10000;
}
