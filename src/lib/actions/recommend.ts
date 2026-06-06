import { differenceInCalendarDays } from "date-fns";
import { toTagList } from "@/lib/utils/text";

export type ActionCandidateIdea = {
  id: string;
  title: string;
  summary: string;
  rawContent: string;
  type: string;
  tags: string;
  status: string;
  priority: string;
  currentValue: number;
  contentValue: number;
  productizationScore: number;
  viralityScore: number;
  nextMinimalAction: string;
  recommendedPlatforms: string;
  createdAt: Date;
  archivedAt?: Date | null;
  outputs?: { id: string }[];
};

export type TodayAction = {
  ideaId: string;
  title: string;
  inspirationValue: number;
  reason: string;
  actionText: string;
  outputFormat: string;
  score: number;
};

const priorityScore: Record<string, number> = { 高: 36, 中: 18, 低: 4 };

function isUnavailable(idea: ActionCandidateIdea) {
  return Boolean(idea.archivedAt) || idea.status === "archived" || idea.status === "converted";
}

function hasDraft(idea: ActionCandidateIdea) {
  return Boolean(idea.outputs?.length);
}

export function normalizeThirtyMinuteAction(idea: ActionCandidateIdea) {
  const action = idea.nextMinimalAction.trim();
  if (action.length >= 8) return action.startsWith("30 分钟") ? action : `30 分钟内：${action}`;
  if (idea.type === "short_video") return "30 分钟内：写出 3 个短视频开头，并拍一个 30 秒口播样片。";
  if (idea.type === "tool_idea" || idea.type === "product_idea") return "30 分钟内：写下 1 个目标用户、1 个核心痛点和 3 个 MVP 功能边界。";
  if (idea.type === "research_idea") return "30 分钟内：列出 3 个可验证问题和 5 条资料线索。";
  return "30 分钟内：整理成 5 条要点，并输出一个内容草稿标题。";
}

export function recommendOutputFormat(idea: ActionCandidateIdea) {
  const platforms = toTagList(idea.recommendedPlatforms).join(" ");
  if (platforms.includes("小红书")) return "小红书";
  if (platforms.includes("公众号") || idea.type === "wechat_article") return "公众号";
  if (platforms.includes("短视频") || idea.type === "short_video") return "短视频";
  if (idea.productizationScore >= 70 || idea.type === "tool_idea") return "GitHub README";
  if (idea.type === "product_idea" || idea.type === "business_opportunity") return "项目";
  return "X";
}

export function scoreIdeaForAction(idea: ActionCandidateIdea, now = new Date()) {
  if (isUnavailable(idea)) return Number.NEGATIVE_INFINITY;
  const days = Math.max(0, differenceInCalendarDays(now, idea.createdAt));
  const milestone = days >= 90 ? 24 : days >= 30 ? 18 : days >= 7 ? 10 : 0;
  const statusBonus = idea.status === "actionable" ? 26 : idea.status === "incubating" ? 8 : 0;
  const draftPenalty = hasDraft(idea) ? -8 : 8;
  const valueScore = Math.min(40, Math.round(idea.currentValue / 80));
  const directionScore = Math.round(Math.max(idea.contentValue, idea.productizationScore, idea.viralityScore) / 5);
  const actionBonus = idea.nextMinimalAction.trim().length >= 8 ? 16 : -10;
  return valueScore + directionScore + (priorityScore[idea.priority] ?? 10) + statusBonus + milestone + draftPenalty + actionBonus;
}

export function buildActionReason(idea: ActionCandidateIdea, now = new Date()) {
  const days = Math.max(0, differenceInCalendarDays(now, idea.createdAt));
  const reasons = [`启发性估值较高（￥${idea.currentValue}）`, `优先级为${idea.priority || "中"}`];
  if (idea.status === "actionable") reasons.push("已进入可行动状态");
  if (days >= 90) reasons.push("已沉淀 90 天以上，适合做取舍");
  else if (days >= 30) reasons.push("已沉淀 30 天以上，适合验证价值");
  else if (days >= 7) reasons.push("已沉淀 7 天以上，可以轻量试做");
  if (!hasDraft(idea)) reasons.push("尚未生成内容草稿");
  return reasons.slice(0, 4).join("；");
}

export function recommendTodayActions(ideas: ActionCandidateIdea[], options: { limit?: number; now?: Date } = {}) {
  const now = options.now ?? new Date();
  const limit = options.limit ?? 5;
  return ideas
    .map((idea) => ({ idea, score: scoreIdeaForAction(idea, now) }))
    .filter((item) => Number.isFinite(item.score) && item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map<TodayAction>(({ idea, score }) => ({
      ideaId: idea.id,
      title: idea.title,
      inspirationValue: idea.currentValue,
      reason: buildActionReason(idea, now),
      actionText: normalizeThirtyMinuteAction(idea),
      outputFormat: recommendOutputFormat(idea),
      score
    }));
}

export function buildEmptyActionState() {
  return {
    title: "今天没有必须推进的灵感",
    description: "当前灵感要么已归档、已转化，要么缺少明确的 30 分钟行动。先存入一个具体问题，或回到灵感列表补充下一步动作。"
  };
}
