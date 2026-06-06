import fs from "node:fs/promises";
import path from "node:path";
import type { UserSettings } from "@prisma/client";
import samples from "./idea-samples.json";
import { createIdeaSchema, analysisResultSchema } from "../src/lib/ai/schemas";
import { getModelRoutedProvider } from "../src/lib/ai/model-router";
import { getTaskRoute } from "../src/lib/ai/model-router";
import { estimateSavedCost } from "../src/lib/ai/cost-estimator";
import { estimateTokens } from "../src/lib/ai/json";
import { calculateInspirationValue } from "../src/lib/scoring/valuation";

type ZeroMeta = {
  engineType?: string;
  apiCost?: number;
  estimatedSavedCost?: number;
  ruleHitCount?: number;
  templateHitCount?: number;
  lexiconHitCount?: number;
  fallbackUsed?: boolean;
  explainabilityScore?: number;
};

type EvalRow = {
  index: number;
  title: string;
  type: string;
  provider: string;
  model: string;
  engineType: string;
  schemaValid: boolean;
  latencyMs: number;
  hasNextMinimalAction: boolean;
  hasValueExplanation: boolean;
  titleCount: number;
  commercialValue: number | null;
  contentValue: number | null;
  currentValue: number | null;
  status: "ok" | "error";
  errorMessage: string;
  actionabilityScore: number;
  titleQualityScore: number;
  businessReasoningScore: number;
  contentUsefulnessScore: number;
  overhypeRiskScore: number;
  apiCost: number;
  estimatedSavedCost: number;
  ruleHitCount: number;
  templateHitCount: number;
  lexiconHitCount: number;
  fallbackUsed: boolean;
  explainabilityScore: number;
};

const forceZero = process.argv.includes("--engine") && process.argv.includes("zero-cost");
if (forceZero) {
  process.env.AI_PROVIDER = "zero-cost";
  process.env.AI_ANALYZE_PROVIDER = "zero-cost";
  process.env.AI_MODEL = process.env.AI_MODEL || "zero-cost-rule-engine";
  process.env.AI_FALLBACK_PROVIDER = process.env.AI_FALLBACK_PROVIDER || "mock";
}

const evalSettings: UserSettings = {
  id: "eval-user",
  focusDirections: "AI 产品、内容资产、个人知识管理、独立产品、中文互联网内容增长",
  platforms: JSON.stringify(["微信公众号", "X", "小红书", "即刻", "知乎", "GitHub"]),
  contentStyle: "务实、具体、不过度夸大，偏中文互联网产品和内容语境",
  resources: "可以投入 30 分钟到 2 小时做验证，有基础产品、开发和内容能力",
  skills: "产品设计、全栈开发、AI 应用、内容写作、用户访谈",
  conversionGoal: "内容 / 产品 / 商业项目 / 研究",
  createdAt: new Date(),
  updatedAt: new Date()
};

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function scoreActionability(action: string) {
  const hasTimeBox = /30\s*分钟|半小时|今天|一次|1\s*位|一个|3\s*个/.test(action);
  const hasVerb = /写|问|找|列|发|做|录|画|整理|验证|访谈|建立|创建/.test(action);
  return clamp((action.length >= 12 ? 35 : 15) + (hasTimeBox ? 35 : 10) + (hasVerb ? 30 : 10));
}

function scoreTitleQuality(titles: Array<{ title: string; score?: number }>) {
  if (!titles.length) return 0;
  const countScore = Math.min(50, titles.length * 10);
  const lengthScore = titles.filter((item) => item.title.length >= 8 && item.title.length <= 46).length * 8;
  return clamp(countScore + Math.min(40, lengthScore) + 10);
}

function scoreBusinessReasoning(analysis: ReturnType<typeof analysisResultSchema.parse>) {
  return clamp(
    (analysis.targetUsers.length ? 25 : 0) +
      (analysis.monetizationMethods.length ? 25 : 0) +
      (analysis.productSuggestions.length ? 20 : 0) +
      (analysis.commercialValue > 0 ? 15 : 0) +
      (analysis.risks.length ? 15 : 0)
  );
}

function scoreContentUsefulness(analysis: ReturnType<typeof analysisResultSchema.parse>) {
  return clamp(
    (analysis.spreadableTitles.length >= 5 ? 35 : analysis.spreadableTitles.length * 6) +
      (analysis.recommendedPlatforms.length ? 25 : 0) +
      (analysis.contentValue > 0 ? 20 : 0) +
      (analysis.shortVideoFit !== "低" ? 10 : 0) +
      (analysis.nextMinimalAction ? 10 : 0)
  );
}

function scoreOverhypeRisk(analysis: ReturnType<typeof analysisResultSchema.parse>) {
  const highClaims =
    analysis.commercialValue >= 85 || analysis.productizationScore >= 85 || analysis.viralityScore >= 85;
  const weakRisk = analysis.risks.length < 2 || analysis.riskLevel === "低";
  return highClaims && weakRisk ? 75 : analysis.valueExplanation.includes("不代表真实市场价格") ? 10 : 35;
}

function zeroMeta(value: unknown): ZeroMeta {
  if (!value || typeof value !== "object") return {};
  return value as ZeroMeta;
}

function avg(rows: EvalRow[], key: keyof EvalRow) {
  if (!rows.length) return 0;
  const values = rows.map((row) => Number(row[key] ?? 0));
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

async function main() {
  const route = getTaskRoute("analyze");
  const provider = getModelRoutedProvider();
  const rows: EvalRow[] = [];

  for (const [index, sample] of samples.entries()) {
    const parsedSample = createIdeaSchema.parse(sample);
    const startedAt = Date.now();

    try {
      const analysis = await provider.analyzeIdea(parsedSample, evalSettings, {
        inputPayload: parsedSample
      });
      const parsedAnalysis = analysisResultSchema.parse(analysis);
      const schemaValid = analysisResultSchema.safeParse(analysis).success;
      const valuation = calculateInspirationValue({
        commercialValue: parsedAnalysis.commercialValue,
        contentValue: parsedAnalysis.contentValue,
        viralityScore: parsedAnalysis.viralityScore,
        productizationScore: parsedAnalysis.productizationScore,
        feasibilityLevel: parsedAnalysis.feasibilityLevel,
        shortVideoFit: parsedAnalysis.shortVideoFit,
        longTermFit: parsedAnalysis.longTermFit,
        personalFitScore: parsedAnalysis.personalFitScore,
        riskLevel: parsedAnalysis.riskLevel,
        daysSinceCreated: 0
      });
      const meta = zeroMeta(parsedAnalysis.zeroAi);
      const saved = estimateSavedCost({
        baselineProvider: "openai",
        baselineModel: "gpt-4o-mini",
        zeroCostRuns: route.providerName === "zero-cost" ? 1 : 0,
        avgInputTokens: estimateTokens(parsedSample),
        avgOutputTokens: estimateTokens(parsedAnalysis)
      });

      rows.push({
        index: index + 1,
        title: parsedSample.title,
        type: parsedSample.type,
        provider: route.providerName,
        model: route.model,
        engineType: meta.engineType ?? route.providerName,
        schemaValid,
        latencyMs: Date.now() - startedAt,
        hasNextMinimalAction: Boolean(parsedAnalysis.nextMinimalAction),
        hasValueExplanation: Boolean(parsedAnalysis.valueExplanation),
        titleCount: parsedAnalysis.spreadableTitles.length,
        commercialValue: parsedAnalysis.commercialValue,
        contentValue: parsedAnalysis.contentValue,
        currentValue: valuation.value,
        status: "ok",
        errorMessage: "",
        actionabilityScore: scoreActionability(parsedAnalysis.nextMinimalAction),
        titleQualityScore: scoreTitleQuality(parsedAnalysis.spreadableTitles),
        businessReasoningScore: scoreBusinessReasoning(parsedAnalysis),
        contentUsefulnessScore: scoreContentUsefulness(parsedAnalysis),
        overhypeRiskScore: scoreOverhypeRisk(parsedAnalysis),
        apiCost: meta.apiCost ?? 0,
        estimatedSavedCost: meta.estimatedSavedCost ?? saved.savedCost,
        ruleHitCount: meta.ruleHitCount ?? 0,
        templateHitCount: meta.templateHitCount ?? parsedAnalysis.spreadableTitles.length,
        lexiconHitCount: meta.lexiconHitCount ?? 0,
        fallbackUsed: Boolean(meta.fallbackUsed),
        explainabilityScore: meta.explainabilityScore ?? (route.providerName === "mock" ? 45 : 60)
      });
    } catch (error) {
      rows.push({
        index: index + 1,
        title: parsedSample.title,
        type: parsedSample.type,
        provider: route.providerName,
        model: route.model,
        engineType: route.providerName,
        schemaValid: false,
        latencyMs: Date.now() - startedAt,
        hasNextMinimalAction: false,
        hasValueExplanation: false,
        titleCount: 0,
        commercialValue: null,
        contentValue: null,
        currentValue: null,
        status: "error",
        errorMessage: error instanceof Error ? error.message : String(error),
        actionabilityScore: 0,
        titleQualityScore: 0,
        businessReasoningScore: 0,
        contentUsefulnessScore: 0,
        overhypeRiskScore: 100,
        apiCost: 0,
        estimatedSavedCost: 0,
        ruleHitCount: 0,
        templateHitCount: 0,
        lexiconHitCount: 0,
        fallbackUsed: true,
        explainabilityScore: 0
      });
    }
  }

  const output = {
    createdAt: new Date().toISOString(),
    provider: route.providerName,
    model: route.model,
    engineType: route.providerName === "zero-cost" ? "zero-cost" : route.providerName,
    summary: {
      total: rows.length,
      schemaValid: rows.filter((row) => row.schemaValid).length,
      schemaPassRate: rows.length ? rows.filter((row) => row.schemaValid).length / rows.length : 0,
      avgLatencyMs: avg(rows, "latencyMs"),
      avgActionabilityScore: avg(rows, "actionabilityScore"),
      avgTitleQualityScore: avg(rows, "titleQualityScore"),
      avgOverhypeRiskScore: avg(rows, "overhypeRiskScore"),
      avgCommercialValue: avg(rows, "commercialValue"),
      avgContentValue: avg(rows, "contentValue"),
      avgCurrentValue: avg(rows, "currentValue"),
      avgContentUsefulnessScore: avg(rows, "contentUsefulnessScore"),
      avgExplainabilityScore: avg(rows, "explainabilityScore"),
      zeroCostSaving: Math.round(rows.reduce((sum, row) => sum + row.estimatedSavedCost, 0) * 10000) / 10000,
      apiCost: Math.round(rows.reduce((sum, row) => sum + row.apiCost, 0) * 10000) / 10000
    },
    rows
  };

  const resultsDir = path.resolve(process.cwd(), "evals/results");
  await fs.mkdir(resultsDir, { recursive: true });
  const resultPath = path.join(
    resultsDir,
    `${new Date().toISOString().replace(/[:.]/g, "-")}-${route.providerName}-${route.model.replace(/[/:]/g, "_")}.json`
  );
  await fs.writeFile(resultPath, JSON.stringify(output, null, 2));

  console.table(
    rows.map((row) => ({
      "#": row.index,
      title: row.title.slice(0, 20),
      engine: row.engineType,
      schemaValid: row.schemaValid,
      latencyMs: row.latencyMs,
      titleCount: row.titleCount,
      commercialValue: row.commercialValue,
      contentValue: row.contentValue,
      currentValue: row.currentValue,
      actionabilityScore: row.actionabilityScore,
      overhypeRiskScore: row.overhypeRiskScore,
      ruleHitCount: row.ruleHitCount,
      status: row.status
    }))
  );
  console.log("Summary:", output.summary);
  console.log("Saved:", resultPath);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
