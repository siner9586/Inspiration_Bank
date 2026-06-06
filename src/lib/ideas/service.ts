import type { Idea, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { getModelRoutedProvider } from "@/lib/ai/model-router";
import { mockAiProvider } from "@/lib/ai/mock-provider";
import type { AnalysisResult } from "@/types/analysis";
import { calculateInspirationValue, getDaysSinceCreated } from "@/lib/scoring/valuation";
import { inferPriority, inferStatusAfterAnalysis } from "@/lib/scoring/priority";
import type { CreateIdeaInput } from "@/lib/ai/schemas";
import type { OutputType } from "@/types/idea";
import { stringifyArray, stringifyObject, toTagList } from "@/lib/utils/text";

export const ideaInclude = {
  titles: {
    orderBy: [{ score: "desc" as const }]
  },
  interests: {
    orderBy: [{ createdAt: "desc" as const }]
  },
  outputs: {
    orderBy: [{ createdAt: "desc" as const }]
  }
};

export type IdeaWithRelations = Prisma.IdeaGetPayload<{
  include: typeof ideaInclude;
}>;

export async function getOrCreateUserSettings() {
  const existing = await prisma.userSettings.findFirst({
    orderBy: { createdAt: "asc" }
  });

  if (existing) return existing;

  return prisma.userSettings.create({
    data: {
      focusDirections: "AI 产品、个人知识管理、内容资产化",
      platforms: stringifyArray(["微信公众号", "X", "小红书", "即刻"]),
      contentStyle: "清晰、务实、有案例感",
      resources: "可投入晚上和周末时间，具备基础产品设计和开发能力",
      skills: "产品设计、全栈开发、AI 应用、内容写作",
      conversionGoal: "内容 / 产品 / 商业项目"
    }
  });
}

export function analysisToIdeaUpdate(
  analysis: AnalysisResult,
  idea: Pick<Idea, "createdAt">,
  isInitial: boolean
): Prisma.IdeaUpdateInput {
  const priority = inferPriority({
    commercialValue: analysis.commercialValue,
    contentValue: analysis.contentValue,
    productizationScore: analysis.productizationScore,
    viralityScore: analysis.viralityScore,
    feasibilityLevel: analysis.feasibilityLevel,
    nextMinimalAction: analysis.nextMinimalAction
  });

  const valuation = calculateInspirationValue({
    commercialValue: analysis.commercialValue,
    contentValue: analysis.contentValue,
    viralityScore: analysis.viralityScore,
    productizationScore: analysis.productizationScore,
    feasibilityLevel: analysis.feasibilityLevel,
    shortVideoFit: analysis.shortVideoFit,
    longTermFit: analysis.longTermFit,
    personalFitScore: analysis.personalFitScore,
    riskLevel: analysis.riskLevel,
    daysSinceCreated: getDaysSinceCreated(idea.createdAt)
  });

  const status = inferStatusAfterAnalysis(priority, analysis.nextMinimalAction);

  return {
    summary: analysis.summary,
    status,
    initialValue: isInitial ? valuation.value : undefined,
    currentValue: valuation.value,
    valueTier: valuation.valueTier,
    valueExplanation: `${analysis.valueExplanation}\n\n${valuation.explanation}`,
    valueComponents: stringifyObject(valuation.components),
    feasibilityLevel: analysis.feasibilityLevel,
    commercialValue: analysis.commercialValue,
    contentValue: analysis.contentValue,
    viralityLevel: analysis.viralityLevel,
    viralityScore: analysis.viralityScore,
    productizationLevel: analysis.productizationLevel,
    productizationScore: analysis.productizationScore,
    shortVideoFit: analysis.shortVideoFit,
    longTermFit: analysis.longTermFit,
    personalFitScore: analysis.personalFitScore,
    riskLevel: analysis.riskLevel,
    priority,
    targetUsers: stringifyArray(analysis.targetUsers),
    monetizationMethods: stringifyArray(analysis.monetizationMethods),
    risks: stringifyArray(analysis.risks),
    requiredResources: stringifyArray(analysis.requiredResources),
    nextMinimalAction: analysis.nextMinimalAction,
    recommendedPlatforms: stringifyArray(analysis.recommendedPlatforms),
    productSuggestions: stringifyArray(analysis.productSuggestions)
  };
}

export async function applyAnalysisToIdea(
  ideaId: string,
  analysis: AnalysisResult,
  options: { isInitial?: boolean } = {}
) {
  const idea = await prisma.idea.findUniqueOrThrow({ where: { id: ideaId } });
  const updateData = analysisToIdeaUpdate(analysis, idea, options.isInitial ?? false);

  await prisma.$transaction([
    prisma.ideaTitle.deleteMany({ where: { ideaId } }),
    prisma.idea.update({
      where: { id: ideaId },
      data: updateData
    }),
    prisma.ideaTitle.createMany({
      data: analysis.spreadableTitles.map((item) => ({
        ideaId,
        title: item.title,
        platform: item.platform,
        score: item.score
      }))
    })
  ]);

  return prisma.idea.findUniqueOrThrow({
    where: { id: ideaId },
    include: ideaInclude
  });
}

export async function createIdeaAndAnalyze(input: CreateIdeaInput) {
  const settings = await getOrCreateUserSettings();
  const idea = await prisma.idea.create({
    data: {
      title: input.title,
      rawContent: input.rawContent,
      type: input.type,
      tags: stringifyArray(input.tags),
      source: input.source,
      status: "analyzing"
    }
  });

  try {
    const analysis = await getModelRoutedProvider().analyzeIdea(input, settings, {
      inputPayload: input
    });
    return applyAnalysisToIdea(idea.id, analysis, { isInitial: true });
  } catch (error) {
    console.error("createIdeaAndAnalyze failed", error);
    const fallback = await mockAiProvider.analyzeIdea(input, settings);
    return applyAnalysisToIdea(idea.id, fallback, { isInitial: true });
  }
}

export async function analyzeExistingIdea(ideaId: string) {
  const settings = await getOrCreateUserSettings();
  const idea = await prisma.idea.findUniqueOrThrow({
    where: { id: ideaId },
    include: { titles: true }
  });

  await prisma.idea.update({
    where: { id: ideaId },
    data: { status: "analyzing" }
  });

  const analysis = await getModelRoutedProvider().revalueIdea(idea, settings, {
    ideaId
  });
  return applyAnalysisToIdea(ideaId, analysis, { isInitial: idea.initialValue === 0 });
}

export async function generateInterestForIdea(ideaId: string) {
  const settings = await getOrCreateUserSettings();
  const idea = await prisma.idea.findUniqueOrThrow({
    where: { id: ideaId },
    include: { titles: true }
  });
  const result = await getModelRoutedProvider().generateInterest(idea, settings, {
    ideaId
  });
  const daysSinceCreated = getDaysSinceCreated(idea.createdAt);

  await prisma.ideaInterest.createMany({
    data: result.interests.map((item) => ({
      ideaId,
      daysSinceCreated,
      interestType: item.interestType,
      content: item.content,
      suggestedAction: item.suggestedAction,
      milestone: item.milestone,
      generatedBy: "manual",
      engineType: item.milestone ? "zero-cost" : undefined,
      estimatedValueChange: item.estimatedValueChange
    }))
  });

  return prisma.idea.findUniqueOrThrow({
    where: { id: ideaId },
    include: ideaInclude
  });
}

export async function generateOutputForIdea(ideaId: string, outputType: OutputType) {
  const settings = await getOrCreateUserSettings();
  const idea = await prisma.idea.findUniqueOrThrow({
    where: { id: ideaId },
    include: { titles: true }
  });
  const result = await getModelRoutedProvider().generateOutput(idea, outputType, settings, {
    ideaId
  });

  const output = await prisma.ideaOutput.create({
    data: {
      ideaId,
      outputType: result.outputType,
      title: result.title,
      content: result.content
    }
  });

  return output;
}

export async function listIdeas(params: {
  query?: string;
  tag?: string;
  type?: string;
  status?: string;
  sort?: string;
}) {
  const where: Prisma.IdeaWhereInput = {};
  if (params.query) {
    where.OR = [
      { title: { contains: params.query } },
      { rawContent: { contains: params.query } },
      { summary: { contains: params.query } }
    ];
  }
  if (params.type && params.type !== "all") where.type = params.type;
  if (params.status && params.status !== "all") where.status = params.status;

  const orderBy: Prisma.IdeaOrderByWithRelationInput[] = (() => {
    switch (params.sort) {
      case "value":
        return [{ currentValue: "desc" }];
      case "priority":
        return [{ priority: "desc" }, { currentValue: "desc" }];
      case "oldest":
        return [{ createdAt: "asc" }];
      default:
        return [{ createdAt: "desc" }];
    }
  })();

  const ideas = await prisma.idea.findMany({
    where,
    include: ideaInclude,
    orderBy
  });

  if (!params.tag) return ideas;
  return ideas.filter((idea) => toTagList(idea.tags).includes(params.tag!));
}

export async function getIdeaTags() {
  const ideas = await prisma.idea.findMany({ select: { tags: true } });
  const tagSet = new Set<string>();
  for (const idea of ideas) {
    for (const tag of toTagList(idea.tags)) {
      tagSet.add(tag);
    }
  }
  return Array.from(tagSet).sort((a, b) => a.localeCompare(b, "zh-CN"));
}
