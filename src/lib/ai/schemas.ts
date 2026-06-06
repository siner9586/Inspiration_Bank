import { z } from "zod";
import {
  ideaStatuses,
  ideaTypes,
  levelLabels,
  outputTypes,
  priorityLabels,
  riskLevels,
  simpleLevelLabels
} from "@/types/idea";

const boundedScore = z.coerce.number().int().min(0).max(100);
const textArray = z.array(z.string().min(1)).default([]);

export const userSettingsSchema = z.object({
  focusDirections: z.string().default(""),
  platforms: z.array(z.string()).default([]),
  contentStyle: z.string().default(""),
  resources: z.string().default(""),
  skills: z.string().default(""),
  conversionGoal: z.string().default("content")
});

export const createIdeaSchema = z.object({
  title: z.string().trim().min(1, "请填写标题").max(120),
  rawContent: z.string().trim().min(1, "请填写灵感正文").max(6000),
  type: z.enum(ideaTypes).default("other"),
  tags: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((value) => {
      if (!value) return [];
      if (Array.isArray(value)) return value.map((item) => item.trim()).filter(Boolean);
      return value
        .split(/[,，\s]+/)
        .map((item) => item.trim())
        .filter(Boolean);
    }),
  source: z.string().trim().max(120).optional().default("")
});

export const ideaPatchSchema = z.object({
  status: z.enum(ideaStatuses).optional(),
  title: z.string().trim().min(1).max(120).optional(),
  tags: z.array(z.string()).optional(),
  source: z.string().trim().max(120).optional()
});

export const ideaTitleSchema = z.object({
  title: z.string().min(1),
  platform: z.string().default(""),
  score: boundedScore.default(60)
});

export const analysisResultSchema = z.object({
  summary: z.string().min(1),
  feasibilityLevel: z.enum(simpleLevelLabels),
  commercialValue: boundedScore,
  contentValue: boundedScore,
  viralityLevel: z.enum(levelLabels),
  viralityScore: boundedScore,
  productizationLevel: z.enum(simpleLevelLabels),
  productizationScore: boundedScore,
  shortVideoFit: z.enum(simpleLevelLabels),
  longTermFit: z.enum(simpleLevelLabels),
  personalFitScore: boundedScore.default(55),
  riskLevel: z.enum(riskLevels).default("中"),
  spreadableTitles: z.array(ideaTitleSchema).min(5).max(12),
  productSuggestions: textArray,
  recommendedPlatforms: textArray,
  requiredResources: textArray,
  nextMinimalAction: z.string().min(1),
  targetUsers: textArray,
  monetizationMethods: textArray,
  risks: textArray,
  priority: z.enum(priorityLabels),
  valueExplanation: z.string().min(1),
  titleCandidates: z.array(z.string()).optional(),
  initialValue: z.coerce.number().int().min(0).optional(),
  currentValue: z.coerce.number().int().min(0).optional(),
  platformReason: z.record(z.string()).optional(),
  bestPlatform: z.string().optional(),
  why: z.string().optional(),
  mvpSuggestion: z.string().optional(),
  firstValidationStep: z.string().optional(),
  zeroAi: z.unknown().optional()
});

export const interestItemSchema = z.object({
  interestType: z.string().min(1),
  content: z.string().min(1),
  suggestedAction: z.string().min(1),
  milestone: z.enum(["7d", "30d", "90d"]).optional(),
  reason: z.string().optional(),
  estimatedValueChange: z.coerce.number().int().optional()
});

export const interestResultSchema = z.object({
  interests: z.array(interestItemSchema).min(3).max(5)
});

export const generateOutputRequestSchema = z.object({
  outputType: z.enum(outputTypes)
});

export const outputResultSchema = z.object({
  outputType: z.enum(outputTypes),
  title: z.string().min(1),
  content: z.string().min(1),
  templateGenerated: z.boolean().optional(),
  note: z.string().optional()
});

export type CreateIdeaInput = z.infer<typeof createIdeaSchema>;
