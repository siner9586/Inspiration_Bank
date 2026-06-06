import type { Idea } from "@prisma/client";
import { extractThemes } from "@/lib/insights/theme-clustering";
import { rate } from "@/lib/insights/stats";

export function analyzePortfolio(ideas: Idea[]) {
  const themes = extractThemes(ideas);
  const typeMap = new Map<string, number>();
  for (const idea of ideas) typeMap.set(idea.type, (typeMap.get(idea.type) ?? 0) + 1);
  const typeDistribution = Array.from(typeMap.entries()).sort((a, b) => b[1] - a[1]);
  const converted = ideas.filter((idea) => idea.status === "converted").length;
  const archived = ideas.filter((idea) => idea.status === "archived" || idea.archivedAt).length;
  const highestValue = [...ideas].sort((a, b) => b.currentValue - a.currentValue).slice(0, 5);
  const contentDirections = [...ideas].sort((a, b) => b.contentValue - a.contentValue).slice(0, 5);
  const productDirections = [...ideas].sort((a, b) => b.productizationScore - a.productizationScore).slice(0, 5);
  const dormant = ideas
    .filter((idea) => !["converted", "archived"].includes(idea.status))
    .filter((idea) => Date.now() - idea.createdAt.getTime() > 30 * 24 * 60 * 60 * 1000)
    .sort((a, b) => b.currentValue - a.currentValue)
    .slice(0, 5);

  return {
    total: ideas.length,
    themes,
    typeDistribution,
    highestValue,
    contentDirections,
    productDirections,
    dormant,
    conversionRate: rate(converted, ideas.length),
    noiseRate: rate(archived, ideas.length),
    trend: themes.length ? `近期反复出现“${themes[0][0]}”等主题，可先做小步验证。` : "数据较少，先持续存入灵感再观察趋势。"
  };
}
