import { differenceInCalendarDays } from "date-fns";
import { prisma } from "@/lib/db/client";

export type InterestMilestone = "7d" | "30d" | "90d";

export type IdeaForInterestSchedule = {
  id: string;
  title: string;
  createdAt: Date;
  status: string;
  archivedAt?: Date | null;
};

export type ExistingInterestForSchedule = {
  milestone?: string | null;
  interestType: string;
  daysSinceCreated: number;
};

const milestoneDays: Record<InterestMilestone, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90
};

export function getInterestMilestones(
  idea: IdeaForInterestSchedule,
  options: { now?: Date; allowConverted?: boolean } = {}
): InterestMilestone[] {
  if (idea.archivedAt || idea.status === "archived") return [];
  if (idea.status === "converted" && !options.allowConverted) return [];
  const days = differenceInCalendarDays(options.now ?? new Date(), idea.createdAt);
  return (Object.entries(milestoneDays) as Array<[InterestMilestone, number]>)
    .filter(([, threshold]) => days >= threshold)
    .map(([milestone]) => milestone);
}

function normalizeMilestone(interest: ExistingInterestForSchedule): InterestMilestone | null {
  if (interest.milestone === "7d" || interest.milestone === "30d" || interest.milestone === "90d") {
    return interest.milestone;
  }
  if (/7\s*天|7d/i.test(interest.interestType) || interest.daysSinceCreated >= 7 && interest.daysSinceCreated < 30) {
    return "7d";
  }
  if (/30\s*天|30d/i.test(interest.interestType) || interest.daysSinceCreated >= 30 && interest.daysSinceCreated < 90) {
    return "30d";
  }
  if (/90\s*天|90d/i.test(interest.interestType) || interest.daysSinceCreated >= 90) {
    return "90d";
  }
  return null;
}

export function shouldGenerateMilestoneInterest(
  idea: IdeaForInterestSchedule,
  existingInterests: ExistingInterestForSchedule[],
  options: { now?: Date; allowConverted?: boolean } = {}
) {
  const due = getInterestMilestones(idea, options);
  const existing = new Set(existingInterests.map(normalizeMilestone).filter(Boolean));
  return due.filter((milestone) => !existing.has(milestone));
}

export async function findIdeasDueForInterest(params: {
  limit?: number;
  now?: Date;
  allowConverted?: boolean;
} = {}) {
  const limit = params.limit ?? 20;
  const candidates = await prisma.idea.findMany({
    where: {
      archivedAt: null,
      status: params.allowConverted ? { not: "archived" } : { notIn: ["archived", "converted"] }
    },
    include: {
      titles: true,
      interests: true
    },
    orderBy: { createdAt: "asc" },
    take: Math.max(limit * 5, limit)
  });

  return candidates
    .map((idea) => ({
      idea,
      milestones: shouldGenerateMilestoneInterest(idea, idea.interests, {
        now: params.now,
        allowConverted: params.allowConverted
      })
    }))
    .filter((item) => item.milestones.length > 0)
    .slice(0, limit);
}

export async function markInterestMilestone(params: {
  ideaId: string;
  milestone: InterestMilestone;
  daysSinceCreated: number;
  interests: Array<{
    interestType: string;
    content: string;
    suggestedAction: string;
    estimatedValueChange?: number;
  }>;
  generatedBy: string;
  engineType: string;
}) {
  const existing = await prisma.ideaInterest.findFirst({
    where: {
      ideaId: params.ideaId,
      milestone: params.milestone
    }
  });
  if (existing) {
    return { created: 0, skipped: true };
  }

  await prisma.ideaInterest.createMany({
    data: params.interests.map((interest) => ({
      ideaId: params.ideaId,
      daysSinceCreated: params.daysSinceCreated,
      interestType: interest.interestType,
      content: interest.content,
      suggestedAction: interest.suggestedAction,
      milestone: params.milestone,
      generatedBy: params.generatedBy,
      engineType: params.engineType,
      estimatedValueChange: interest.estimatedValueChange
    }))
  });

  return { created: params.interests.length, skipped: false };
}
