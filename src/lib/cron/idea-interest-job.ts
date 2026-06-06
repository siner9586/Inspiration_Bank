import { differenceInCalendarDays } from "date-fns";
import { getProviderByName, normalizeProviderName, type AiProviderName } from "@/lib/ai/provider";
import { getOrCreateUserSettings } from "@/lib/ideas/service";
import {
  findIdeasDueForInterest,
  markInterestMilestone,
  type InterestMilestone
} from "@/lib/scoring/interest-scheduler";

function cronModel(providerName: AiProviderName) {
  if (providerName === "zero-cost") return process.env.CRON_AI_MODEL || process.env.AI_MODEL || "zero-cost-rule-engine";
  if (providerName === "ollama") return process.env.CRON_AI_MODEL || process.env.AI_MODEL || "qwen2.5:7b";
  if (providerName === "openai") return process.env.CRON_AI_MODEL || process.env.OPENAI_MODEL || process.env.AI_MODEL || "gpt-4o-mini";
  return process.env.CRON_AI_MODEL || process.env.AI_MODEL || "mock-model";
}

export async function runIdeaInterestJob(params: {
  dryRun?: boolean;
  limit?: number;
  provider?: string | null;
} = {}) {
  const providerName = normalizeProviderName(params.provider || process.env.CRON_AI_PROVIDER || "zero-cost");
  const model = cronModel(providerName);
  const due = await findIdeasDueForInterest({ limit: params.limit ?? 20 });

  if (params.dryRun) {
    return {
      dryRun: true,
      provider: providerName,
      model,
      limit: params.limit ?? 20,
      processed: 0,
      success: 0,
      failed: 0,
      candidates: due.map((item) => ({
        ideaId: item.idea.id,
        title: item.idea.title,
        createdAt: item.idea.createdAt,
        daysSinceCreated: differenceInCalendarDays(new Date(), item.idea.createdAt),
        milestones: item.milestones
      }))
    };
  }

  const provider = getProviderByName(providerName);
  const settings = await getOrCreateUserSettings();
  const results: Array<{
    ideaId: string;
    title: string;
    milestone: InterestMilestone;
    status: "created" | "skipped" | "error";
    createdCount: number;
    errorMessage?: string;
  }> = [];

  for (const item of due) {
    for (const milestone of item.milestones) {
      try {
        const result = await provider.generateInterest(item.idea, settings, {
          ideaId: item.idea.id,
          providerName,
          model,
          taskType: "interest",
          inputPayload: {
            ideaId: item.idea.id,
            milestone,
            reason: "cron idea interest"
          }
        });
        const daysSinceCreated = differenceInCalendarDays(new Date(), item.idea.createdAt);
        const marked = await markInterestMilestone({
          ideaId: item.idea.id,
          milestone,
          daysSinceCreated,
          interests: result.interests.map((interest) => ({
            interestType: interest.interestType,
            content: interest.content,
            suggestedAction: interest.suggestedAction,
            estimatedValueChange: interest.estimatedValueChange
          })),
          generatedBy: "cron",
          engineType: providerName
        });
        results.push({
          ideaId: item.idea.id,
          title: item.idea.title,
          milestone,
          status: marked.skipped ? "skipped" : "created",
          createdCount: marked.created
        });
      } catch (error) {
        results.push({
          ideaId: item.idea.id,
          title: item.idea.title,
          milestone,
          status: "error",
          createdCount: 0,
          errorMessage: error instanceof Error ? error.message : String(error)
        });
      }
    }
  }

  return {
    dryRun: false,
    provider: providerName,
    model,
    limit: params.limit ?? 20,
    processed: results.length,
    success: results.filter((item) => item.status === "created" || item.status === "skipped").length,
    failed: results.filter((item) => item.status === "error").length,
    createdInterests: results.reduce((sum, item) => sum + item.createdCount, 0),
    results
  };
}
