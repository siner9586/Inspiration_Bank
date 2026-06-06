export const zeroAiValueDisclaimer =
  "启发性估值仅用于复盘、排序和行动优先级判断，不代表真实市场价格、交易价格或金融建议。";

export const zeroAiCostDisclaimer =
  "zero-cost 当前设计不调用外部付费 AI API；成本节省为估算值，不代表真实账单。";

export function joinReason(items: string[]) {
  return items.filter(Boolean).join(" ");
}
