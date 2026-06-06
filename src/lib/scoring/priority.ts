export function inferPriority(params: {
  commercialValue: number;
  contentValue: number;
  productizationScore: number;
  viralityScore: number;
  feasibilityLevel: string;
  nextMinimalAction: string;
}) {
  const weighted =
    params.commercialValue * 0.28 +
    params.contentValue * 0.22 +
    params.productizationScore * 0.22 +
    params.viralityScore * 0.18 +
    (params.feasibilityLevel === "高" ? 10 : params.feasibilityLevel === "中" ? 5 : 0) +
    (params.nextMinimalAction.length > 8 ? 5 : 0);

  if (weighted >= 72) return "高";
  if (weighted >= 45) return "中";
  return "低";
}

export function inferStatusAfterAnalysis(priority: string, nextMinimalAction: string) {
  if (priority === "高" && nextMinimalAction.trim().length >= 8) return "actionable";
  return "incubating";
}
