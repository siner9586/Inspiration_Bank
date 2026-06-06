import { productSignals } from "@/lib/zero-ai/lexicons";
import { getIdeaText, matchTerms, safeTopic, uniqueItems } from "@/lib/zero-ai/rules";
import type { ProductMatch, ZeroAiInput } from "@/lib/zero-ai/types";

export function matchProducts(input: ZeroAiInput): ProductMatch {
  const text = getIdeaText(input);
  const topic = safeTopic(input.title, input.rawContent);
  const scored = Object.entries(productSignals).map(([product, signals]) => {
    const hits = matchTerms(text, signals);
    const typeBoost =
      input.type === "tool_idea" && ["Web 工具", "Chrome 插件", "GitHub 开源项目", "MVP 项目"].includes(product)
        ? 14
        : input.type === "business_opportunity" && ["私域服务", "数据看板", "MVP 项目"].includes(product)
          ? 12
          : input.type === "short_video" && product === "短视频脚本"
            ? 16
            : input.type === "wechat_article" && product === "公众号选题"
              ? 16
              : input.type === "content_topic" && ["公众号选题", "X thread", "小红书笔记"].includes(product)
                ? 10
                : 0;
    return { product, score: hits.length * 9 + typeBoost, hits };
  });

  const sorted = scored.sort((a, b) => b.score - a.score);
  const productSuggestions = uniqueItems(
    [
      ...sorted.filter((item) => item.score > 0).map((item) => item.product),
      input.type === "tool_idea" || input.type === "product_idea" ? "MVP 项目" : "公众号选题",
      "下一步执行清单"
    ],
    5
  );
  const first = productSuggestions[0] ?? "公众号选题";

  const mvpSuggestion =
    first === "Web 工具" || first === "MVP 项目"
      ? `做一个“${topic}”单页 MVP：只保留输入、生成清单、复制结果三个动作。`
      : first === "Chrome 插件"
        ? `先写“${topic}”插件 README 和 3 张界面草图，不急着开发。`
        : first === "短视频脚本"
          ? `把“${topic}”做成 45 秒口播脚本，先验证前三秒钩子。`
          : `把“${topic}”做成一个可发布选题，先验证标题和评论反馈。`;

  const firstValidationStep =
    first === "Web 工具" || first === "MVP 项目"
      ? "用 30 分钟写一个 landing page 文案，列出目标用户、痛点和 3 个核心功能。"
      : first === "GitHub 开源项目"
        ? "用 30 分钟建一个 GitHub README，写清楚使用场景、输入输出和路线图。"
        : first === "小红书笔记"
          ? "用 30 分钟写 3 个小红书标题和 120 字正文，发给 1 位目标读者看反馈。"
          : first === "短视频脚本"
            ? "用 30 分钟录一段 30 秒口播草稿，只验证开头钩子是否清楚。"
            : "用 30 分钟写 5 个标题和 200 字开头，发到一个低压力平台测试反馈。";

  return {
    productSuggestions,
    mvpSuggestion,
    firstValidationStep,
    ruleHitCount: sorted.filter((item) => item.score > 0).length
  };
}
