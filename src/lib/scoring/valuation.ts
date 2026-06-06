import { differenceInCalendarDays } from "date-fns";

export type Level = "低" | "中" | "中高" | "高";
export type SimpleLevel = "低" | "中" | "高";
export type RiskLevel = "低" | "中" | "高";

export type ValuationInput = {
  commercialValue: number;
  contentValue: number;
  viralityScore: number;
  productizationScore: number;
  feasibilityLevel: SimpleLevel;
  shortVideoFit: SimpleLevel;
  longTermFit: SimpleLevel;
  personalFitScore: number;
  riskLevel: RiskLevel;
  daysSinceCreated?: number;
};

export type ValuationResult = {
  value: number;
  valueTier: string;
  explanation: string;
  components: {
    baseScore: number;
    commercialComponent: number;
    contentComponent: number;
    viralityComponent: number;
    productizationComponent: number;
    feasibilityComponent: number;
    personalFitComponent: number;
    timeBonus: number;
    riskPenalty: number;
    shortVideoBonus: number;
    longTermBonus: number;
    rawScore: number;
  };
};

const feasibilityMap: Record<SimpleLevel, number> = {
  低: 35,
  中: 62,
  高: 86
};

const fitMap: Record<SimpleLevel, number> = {
  低: 0.96,
  中: 1,
  高: 1.06
};

const riskPenaltyMap: Record<RiskLevel, number> = {
  低: 1,
  中: 0.86,
  高: 0.42
};

export function getValueTier(value: number) {
  if (value >= 2000) return "高潜力项目种子";
  if (value >= 500) return "可行动机会";
  if (value >= 100) return "可沉淀灵感";
  return "闪念";
}

export function getDaysSinceCreated(createdAt: Date) {
  return Math.max(0, differenceInCalendarDays(new Date(), createdAt));
}

export function calculateTimeBonus(daysSinceCreated = 0) {
  if (daysSinceCreated >= 90) return 1.16;
  if (daysSinceCreated >= 30) return 1.1;
  if (daysSinceCreated >= 7) return 1.04;
  return 1;
}

function clampScore(value: number) {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

export function calculateInspirationValue(input: ValuationInput): ValuationResult {
  const commercialValue = clampScore(input.commercialValue);
  const contentValue = clampScore(input.contentValue);
  const viralityScore = clampScore(input.viralityScore);
  const productizationScore = clampScore(input.productizationScore);
  const personalFitScore = clampScore(input.personalFitScore);
  const feasibilityScore = feasibilityMap[input.feasibilityLevel] ?? feasibilityMap["中"];
  const timeBonus = calculateTimeBonus(input.daysSinceCreated ?? 0);
  const riskPenalty = riskPenaltyMap[input.riskLevel] ?? riskPenaltyMap["中"];
  const shortVideoBonus = fitMap[input.shortVideoFit] ?? 1;
  const longTermBonus = fitMap[input.longTermFit] ?? 1;
  const baseScore = 10;

  const commercialComponent = commercialValue * 2.0;
  const contentComponent = contentValue * 1.5;
  const viralityComponent = viralityScore * 1.3;
  const productizationComponent = productizationScore * 1.8;
  const feasibilityComponent = feasibilityScore * 1.2;
  const personalFitComponent = personalFitScore * 1.4;

  const weightedScore =
    baseScore +
    commercialComponent +
    contentComponent +
    viralityComponent +
    productizationComponent +
    feasibilityComponent +
    personalFitComponent;

  const rawScore = weightedScore * timeBonus * riskPenalty * shortVideoBonus * longTermBonus;
  const value = Math.max(0, Math.round(rawScore * 2.0));
  const valueTier = getValueTier(value);

  return {
    value,
    valueTier,
    explanation: `启发性估值基于商业价值、内容价值、传播潜力、产品化潜力、可行性、个人匹配度、沉淀时间和风险折扣计算。当前估值为 ￥${value}，属于“${valueTier}”。该估值只用于排序、复盘和行动优先级判断，不代表真实市场价格、交易价格或金融建议。`,
    components: {
      baseScore,
      commercialComponent,
      contentComponent,
      viralityComponent,
      productizationComponent,
      feasibilityComponent,
      personalFitComponent,
      timeBonus,
      riskPenalty,
      shortVideoBonus,
      longTermBonus,
      rawScore: Math.round(rawScore * 100) / 100
    }
  };
}
