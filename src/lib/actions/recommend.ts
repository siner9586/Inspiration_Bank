import { differenceInCalendarDays } from "date-fns";
import { toTagList } from "@/lib/utils/text";

export type ActionIdea = {
  id: string;
  title: string;
  summary: string;
  status: string;
  type?: string;
  priority: string;
  currentValue: number;
  nextMinimalAction: string;
  recommendedPlatforms: string;
  contentValue: number;
  productizationScore: number;
  viralityScore: number;
  createdAt: Date;
  archivedAt?: Date | null;
  outputs?: { id: string }[];
  actionLogs?: { status: string; createdAt: Date }[];
};

export type TodayAction = {
  ideaId: string;
  title: string;
  value: number;
  reason: string;
  actionText: string;
  outputForm: string;
  score: number;
};

const platformFallbacks = ["X", "公众号", "小红书", "短视频", "README", "项目"];

function daysSince(date: Date) {
  return Math.max(0, differenceInCalendarDays(new Date(), date));
}

function buildActionText(idea: ActionIdea) {
  const text = idea.nextMinimalAction?.trim();
  if (text && text.length >= 6) return text;
  if (idea.type === "tool_idea" || idea.productizationScore >= 70) return "用 30 分钟写出 MVP 的 3 个核心功能与第一个 README 小节。";
  if (idea.contentValue >= 70) return "用 30 分钟写出 5 个标题、1 段开头和 3 个要点。";
  return "用 30 分钟补充问题、目标用户、下一步验证动作各 1 条。";
}

function pickOutputForm(idea: ActionIdea) {
  const platforms = toTagList(idea.recommendedPlatforms);
  if (idea.productizationScore >= 75) return "README / 项目";
  if (idea.viralityScore >= 75) return "X / 短视频";
  if (idea.contentValue >= 70) return platforms[0] || "公众号";
  return platforms[0] || platformFallbacks[0];
}

export function recommendTodayActions(ideas: ActionIdea[], limit = 5) {
  const today = new Date().toDateString();
  return ideas
    .filter((idea) => !idea.archivedAt)
    .filter((idea) => !["archived", "converted"].includes(idea.status))
    .filter((idea) => !idea.actionLogs?.some((log) => log.createdAt.toDateString() === today && ["done", "skipped", "converted"].includes(log.status)))
    .map((idea) => {
      const days = daysSince(idea.createdAt);
      const hasOutput = (idea.outputs?.length ?? 0) > 0;
      const score =
        idea.currentValue +
        (idea.priority === "高" ? 700 : idea.priority === "中" ? 220 : 0) +
        (idea.nextMinimalAction ? 280 : -160) +
        (idea.status === "actionable" ? 500 : 0) +
        (days >= 90 ? 260 : days >= 30 ? 180 : days >= 7 ? 100 : 0) +
        (hasOutput ? -80 : 120);

      const reasonParts = [
        idea.priority === "高" ? "优先级高" : "优先级适中",
        `启发性估值 ${idea.currentValue}`,
        days >= 30 ? `已沉淀 ${days} 天` : "仍在新鲜窗口期",
        hasOutput ? "已有草稿，可继续推进" : "尚未形成内容草稿"
      ];

      return {
        ideaId: idea.id,
        title: idea.title,
        value: idea.currentValue,
        reason: reasonParts.join(" · "),
        actionText: buildActionText(idea),
        outputForm: pickOutputForm(idea),
        score
      };
    })
    .filter((item) => item.actionText.length >= 6)
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.max(3, Math.min(limit, 5)));
}

export function buildEmptyActionState() {
  return {
    title: "今天没有必须推进的灵感",
    description: "可以新增灵感，或去灵感列表中把某条灵感标记为可行动。"
  };
}
