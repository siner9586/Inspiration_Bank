import type { UserSettings } from "@prisma/client";
import type { AnalysisResult, InterestResult, OutputResult } from "@/types/analysis";
import type { IdeaType, OutputType } from "@/types/idea";

export type ZeroAiInput = {
  title: string;
  rawContent: string;
  type: IdeaType;
  tags?: string[];
  source?: string;
  createdAt?: Date;
  userSettings?: UserSettings | null;
};

export type RuleComponent = {
  id: string;
  label: string;
  score: number;
  weight: number;
  reason: string;
  hits: string[];
};

export type ZeroAiScoreBreakdown = {
  commercial: RuleComponent[];
  content: RuleComponent[];
  virality: RuleComponent[];
  productization: RuleComponent[];
  feasibility: RuleComponent[];
  personalFit: RuleComponent[];
  safety: RuleComponent[];
};

export type ZeroAiMetadata = {
  engineType: "zero-cost";
  apiCost: 0;
  estimatedSavedCost: number;
  ruleHitCount: number;
  templateHitCount: number;
  lexiconHitCount: number;
  fallbackUsed: boolean;
  explainabilityScore: number;
  components: ZeroAiScoreBreakdown;
};

export type ZeroCostAnalysisResult = AnalysisResult & {
  titleCandidates: string[];
  initialValue: number;
  currentValue: number;
  platformReason: Record<string, string>;
  bestPlatform: string;
  why: string;
  mvpSuggestion: string;
  firstValidationStep: string;
  zeroAi: ZeroAiMetadata;
};

export type PlatformMatch = {
  recommendedPlatforms: string[];
  platformReason: Record<string, string>;
  bestPlatform: string;
  why: string;
  ruleHitCount: number;
};

export type ProductMatch = {
  productSuggestions: string[];
  mvpSuggestion: string;
  firstValidationStep: string;
  ruleHitCount: number;
};

export type ZeroInterestItem = InterestResult["interests"][number] & {
  milestone: "7d" | "30d" | "90d";
  reason: string;
  estimatedValueChange: number;
};

export type ZeroInterestResult = {
  interests: ZeroInterestItem[];
  zeroAi: Pick<ZeroAiMetadata, "engineType" | "apiCost" | "templateHitCount" | "fallbackUsed">;
};

export type ZeroOutputResult = OutputResult & {
  templateGenerated: true;
  note: string;
};

export type DraftInput = {
  idea: {
    title: string;
    rawContent: string;
    summary?: string | null;
    nextMinimalAction?: string | null;
    recommendedPlatforms?: string | null;
    productSuggestions?: string | null;
    targetUsers?: string | null;
  };
  outputType: OutputType;
  userSettings?: UserSettings | null;
};
