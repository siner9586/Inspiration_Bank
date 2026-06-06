import { startOfWeek } from "date-fns";
import { toTagList } from "@/lib/utils/text";
import { recommendTodayActions, type ActionIdea } from "@/lib/actions/recommend";

export type WeeklyIdea = ActionIdea & { tags: string; type: string; initialValue: number };

export function buildWeeklyReportData(ideas: WeeklyIdea[], now = new Date()) {
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const thisWeek = ideas.filter((idea) => idea.createdAt >= weekStart);
  const topIdeas = [...thisWeek].sort((a, b) => b.currentValue - a.currentValue).slice(0, 5);
  const converted = thisWeek.filter((idea) => idea.status === "converted");
  const skippedOrArchived = thisWeek.filter((idea) => idea.status === "archived" || idea.archivedAt);
  const allTags = thisWeek.flatMap((idea) => toTagList(idea.tags || idea.recommendedPlatforms));
  const keywordMap = new Map<string, number>();
  for (const tag of allTags) keywordMap.set(tag, (keywordMap.get(tag) ?? 0) + 1);
  const keywords = Array.from(keywordMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 12);
  const valueDelta = thisWeek.reduce((sum, idea) => sum + (idea.currentValue - (idea.initialValue || 0)), 0);
  const nextActions = recommendTodayActions(ideas, 5);

  return {
    weekStart,
    newCount: thisWeek.length,
    valueDelta,
    topIdeas,
    converted,
    skippedOrArchived,
    keywords,
    nextActions
  };
}
