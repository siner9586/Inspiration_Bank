import { platformDefaults, platformSignals } from "@/lib/zero-ai/lexicons";
import { getIdeaText, matchTerms, settingsPlatforms, uniqueItems } from "@/lib/zero-ai/rules";
import type { PlatformMatch, ZeroAiInput } from "@/lib/zero-ai/types";

const platformDescriptions: Record<string, string> = {
  微信公众号: "适合深度复盘、方法论、项目故事和长期主题沉淀。",
  X: "适合短观点、反差表达、产品进度和构建日志。",
  小红书: "适合经验清单、成长表达、工具推荐和生活化表达。",
  视频号: "适合观点口播、知识分享和轻量产品演示。",
  抖音: "适合强钩子、短视频脚本和冲突表达，需要谨慎避免夸大。",
  B站: "适合教程、长视频复盘和产品构建过程。",
  知乎: "适合问答、深度解释、经验沉淀和研究型表达。",
  即刻: "适合碎片想法、产品构建记录和个人状态。",
  GitHub: "适合开源项目、工具 README 和技术路线沉淀。"
};

export function matchPlatforms(input: ZeroAiInput): PlatformMatch {
  const text = getIdeaText(input);
  const preferred = settingsPlatforms(input.userSettings);
  const scored = Object.entries(platformSignals).map(([platform, signals]) => {
    const hits = matchTerms(text, signals);
    const preferenceBoost = preferred.includes(platform) ? 12 : 0;
    const typeBoost =
      input.type === "tool_idea" && platform === "GitHub"
        ? 18
        : input.type === "wechat_article" && platform === "微信公众号"
          ? 18
          : input.type === "short_video" && ["视频号", "抖音", "B站"].includes(platform)
            ? 16
            : input.type === "content_topic" && ["微信公众号", "X", "小红书"].includes(platform)
              ? 12
              : 0;
    return {
      platform,
      score: hits.length * 10 + preferenceBoost + typeBoost,
      hits
    };
  });

  const sorted = scored.sort((a, b) => b.score - a.score);
  const recommendedPlatforms = uniqueItems(
    [
      ...sorted.filter((item) => item.score > 0).map((item) => item.platform),
      ...preferred,
      ...platformDefaults
    ],
    5
  );
  const bestPlatform = recommendedPlatforms[0] ?? "即刻";
  const platformReason = Object.fromEntries(
    recommendedPlatforms.map((platform) => {
      const row = sorted.find((item) => item.platform === platform);
      const hitText = row?.hits.length ? `命中：${row.hits.slice(0, 4).join("、")}。` : "";
      return [platform, `${platformDescriptions[platform] ?? "适合低成本发布和反馈收集。"}${hitText}`];
    })
  );

  return {
    recommendedPlatforms,
    platformReason,
    bestPlatform,
    why: platformReason[bestPlatform] ?? "它能以最低摩擦完成一次公开验证。",
    ruleHitCount: sorted.filter((item) => item.score > 0).length
  };
}
