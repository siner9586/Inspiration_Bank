import { calculateInspirationValue, getDaysSinceCreated } from "@/lib/scoring/valuation";
import { generateNextMinimalAction } from "@/lib/zero-ai/action-generator";
import { matchPlatforms } from "@/lib/zero-ai/platform-matcher";
import { matchProducts } from "@/lib/zero-ai/product-matcher";
import {
  estimateMonetizationMethods,
  estimateRequiredResources,
  estimateRisks,
  estimateTargetUsers
} from "@/lib/zero-ai/resource-estimator";
import { summarizeIdea } from "@/lib/zero-ai/rules";
import { scoreIdea } from "@/lib/zero-ai/scoring";
import { generateTitleCandidates } from "@/lib/zero-ai/title-generator";
import { joinReason, zeroAiCostDisclaimer, zeroAiValueDisclaimer } from "@/lib/zero-ai/templates";
import type { ZeroAiInput, ZeroCostAnalysisResult } from "@/lib/zero-ai/types";

function topReasons(result: ReturnType<typeof scoreIdea>) {
  return Object.values(result.components)
    .flat()
    .filter((item) => item.hits.length || item.score >= 14)
    .sort((a, b) => b.score * b.weight - a.score * a.weight)
    .slice(0, 5)
    .map((item) => `${item.label}：${item.reason}`);
}

export function analyzeIdeaZeroCost(input: ZeroAiInput): ZeroCostAnalysisResult {
  const scored = scoreIdea(input);
  const platforms = matchPlatforms(input);
  const products = matchProducts(input);
  const titles = generateTitleCandidates(input);
  const nextMinimalAction = generateNextMinimalAction(input, {
    bestPlatform: platforms.bestPlatform,
    productSuggestions: products.productSuggestions,
    commercialValue: scored.commercialValue,
    contentValue: scored.contentValue,
    productizationScore: scored.productizationScore
  });
  const valuation = calculateInspirationValue({
    commercialValue: scored.commercialValue,
    contentValue: scored.contentValue,
    viralityScore: scored.viralityScore,
    productizationScore: scored.productizationScore,
    feasibilityLevel: scored.feasibilityLevel,
    shortVideoFit: scored.shortVideoFit,
    longTermFit: scored.longTermFit,
    personalFitScore: scored.personalFitScore,
    riskLevel: scored.riskLevel,
    daysSinceCreated: input.createdAt ? getDaysSinceCreated(input.createdAt) : 0
  });
  const reasons = topReasons(scored);

  return {
    summary: summarizeIdea(input.title, input.rawContent),
    feasibilityLevel: scored.feasibilityLevel,
    commercialValue: scored.commercialValue,
    contentValue: scored.contentValue,
    viralityLevel: scored.viralityLevel,
    viralityScore: scored.viralityScore,
    productizationLevel: scored.productizationLevel,
    productizationScore: scored.productizationScore,
    shortVideoFit: scored.shortVideoFit,
    longTermFit: scored.longTermFit,
    personalFitScore: scored.personalFitScore,
    riskLevel: scored.riskLevel,
    spreadableTitles: titles.slice(0, 10),
    productSuggestions: products.productSuggestions,
    recommendedPlatforms: platforms.recommendedPlatforms,
    requiredResources: estimateRequiredResources(input),
    nextMinimalAction,
    targetUsers: estimateTargetUsers(input),
    monetizationMethods: estimateMonetizationMethods(input),
    risks: estimateRisks(input, scored.riskLevel),
    priority: scored.priority,
    valueExplanation: joinReason([
      "本结果由本地 zero-cost 规则引擎生成，基于词库命中、规则评分、用户画像和模板组合。",
      reasons.join(" "),
      `当前规则命中 ${scored.ruleHitCount} 项，词库命中 ${scored.lexiconHitCount} 项。`,
      zeroAiValueDisclaimer,
      zeroAiCostDisclaimer
    ]),
    titleCandidates: titles.map((item) => item.title),
    initialValue: valuation.value,
    currentValue: valuation.value,
    platformReason: platforms.platformReason,
    bestPlatform: platforms.bestPlatform,
    why: platforms.why,
    mvpSuggestion: products.mvpSuggestion,
    firstValidationStep: products.firstValidationStep,
    zeroAi: {
      engineType: "zero-cost",
      apiCost: 0,
      estimatedSavedCost: 0.003,
      ruleHitCount: scored.ruleHitCount + platforms.ruleHitCount + products.ruleHitCount,
      templateHitCount: titles.length + 3,
      lexiconHitCount: scored.lexiconHitCount,
      fallbackUsed: false,
      explainabilityScore: scored.explainabilityScore,
      components: scored.components
    }
  };
}
