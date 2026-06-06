import type { ZeroAiInput } from "@/lib/zero-ai/types";
import { getIdeaText, matchTerms, safeTopic } from "@/lib/zero-ai/rules";

const concreteActions = [
  "写 5 个标题",
  "发一条 X 测试反馈",
  "写 200 字公众号开头",
  "画一张产品流程图",
  "建一个 GitHub README",
  "找 3 个类似产品",
  "问 3 个潜在用户",
  "做一个 landing page 文案",
  "录一个 30 秒口播草稿",
  "写一个最小 demo prompt"
];

export function generateNextMinimalAction(input: ZeroAiInput, params: {
  bestPlatform?: string;
  productSuggestions?: string[];
  commercialValue?: number;
  contentValue?: number;
  productizationScore?: number;
}) {
  const text = getIdeaText(input);
  const topic = safeTopic(input.title, input.rawContent);
  const bestPlatform = params.bestPlatform ?? "即刻";
  const firstProduct = params.productSuggestions?.[0] ?? "";

  if (matchTerms(text, ["GitHub", "开源", "README", "插件", "开发者"]).length || firstProduct.includes("GitHub")) {
    return `用 30 分钟建一个“${topic}”GitHub README，写清楚目标用户、输入输出和第一个 demo。`;
  }

  if (matchTerms(text, ["短视频", "口播", "脚本", "前三秒", "抖音", "视频号"]).length || firstProduct.includes("短视频")) {
    return `用 30 分钟录一段“${topic}”30 秒口播草稿，只验证前三秒钩子和结尾行动。`;
  }

  if (matchTerms(text, ["公众号", "文章", "方法论", "复盘", "案例"]).length || bestPlatform === "微信公众号") {
    return `用 30 分钟写出“${topic}”的 5 个标题和 200 字公众号开头。`;
  }

  if (
    matchTerms(text, ["产品", "工具", "SaaS", "MVP", "工作流", "自动化", "看板"]).length ||
    (params.productizationScore ?? 0) >= 68
  ) {
    return `用 30 分钟画一张“${topic}”产品流程图，并列出 3 个必须验证的问题。`;
  }

  if ((params.commercialValue ?? 0) >= 68) {
    return `用 30 分钟找 3 个类似产品或服务，记录它们的目标用户、价格和差异点。`;
  }

  if ((params.contentValue ?? 0) >= 66) {
    return `用 30 分钟在 ${bestPlatform} 写一条“${topic}”短内容草稿，测试一个观点钩子。`;
  }

  return `用 30 分钟把“${topic}”拆成：1 个目标用户、1 个使用场景、1 个可公开验证的问题。`;
}

export function actionExamples() {
  return concreteActions;
}
