import { differenceInCalendarDays } from "date-fns";
import { generateTitleCandidates } from "@/lib/zero-ai/title-generator";
import { safeTopic } from "@/lib/zero-ai/rules";
import type { ZeroAiInput, ZeroInterestItem, ZeroInterestResult } from "@/lib/zero-ai/types";

export function getMilestoneFromDays(daysSinceCreated: number): "7d" | "30d" | "90d" {
  if (daysSinceCreated >= 90) return "90d";
  if (daysSinceCreated >= 30) return "30d";
  return "7d";
}

function daysFromInput(input: ZeroAiInput) {
  if (!input.createdAt) return 7;
  return Math.max(0, differenceInCalendarDays(new Date(), input.createdAt));
}

function titleLine(input: ZeroAiInput) {
  return generateTitleCandidates(input)
    .slice(0, 3)
    .map((item, index) => `${index + 1}. ${item.title}`)
    .join("\n");
}

export function generateIdeaInterestZeroCost(input: ZeroAiInput, forcedMilestone?: "7d" | "30d" | "90d"): ZeroInterestResult {
  const daysSinceCreated = daysFromInput(input);
  const milestone = forcedMilestone ?? getMilestoneFromDays(daysSinceCreated);
  const topic = safeTopic(input.title, input.rawContent);
  const commonReason = `这个灵感已经沉淀 ${daysSinceCreated} 天，适合做一次低成本复盘。`;

  const plans: Record<"7d" | "30d" | "90d", ZeroInterestItem[]> = {
    "7d": [
      {
        interestType: "7 天初步复盘",
        content: `重新看“${topic}”，先判断它是否还有清晰的问题、用户和表达角度。`,
        suggestedAction: "用 30 分钟写下：目标用户、一个痛点、一个验证问题。",
        milestone: "7d",
        reason: commonReason,
        estimatedValueChange: 24
      },
      {
        interestType: "生成标题",
        content: `可以先测试 3 个标题：\n${titleLine(input)}`,
        suggestedAction: "从中选 1 个标题，发到低压力平台看是否有人追问。",
        milestone: "7d",
        reason: "7 天节点适合验证表达，而不是急着做完整产品。",
        estimatedValueChange: 18
      },
      {
        interestType: "做一条短内容",
        content: `把“${topic}”压缩成一条 120 到 200 字短内容，重点讲问题和下一步。`,
        suggestedAction: "今天写一条短内容草稿，保留一个明确提问作为结尾。",
        milestone: "7d",
        reason: "短内容可以用最小成本测试关注度。",
        estimatedValueChange: 20
      },
      {
        interestType: "判断是否继续沉淀",
        content: "如果这个想法仍然能说清用户和场景，就继续沉淀；如果只剩情绪或口号，先降级为素材。",
        suggestedAction: "给它打一个继续、行动或归档的标签。",
        milestone: "7d",
        reason: "早期筛选能避免堆积不可行动的想法。",
        estimatedValueChange: 8
      }
    ],
    "30d": [
      {
        interestType: "升级为公众号选题",
        content: `“${topic}”已经有 30 天沉淀，可以扩展成一篇有结构的选题说明：问题、案例、方法、行动。`,
        suggestedAction: "用 30 分钟写 5 个小标题，每个小标题补 2 句要点。",
        milestone: "30d",
        reason: commonReason,
        estimatedValueChange: 48
      },
      {
        interestType: "升级为产品 MVP",
        content: `如果它仍然有明确用户，可以做一个只包含输入、处理、输出的最小 MVP。`,
        suggestedAction: "画一张产品流程图，只保留 3 个核心动作。",
        milestone: "30d",
        reason: "30 天后仍能复现的问题，更适合进入产品验证。",
        estimatedValueChange: 56
      },
      {
        interestType: "合并到已有项目",
        content: "检查它是否能成为现有内容栏目、工具路线图或项目 README 的一个模块。",
        suggestedAction: "找 1 个已有项目，把这个灵感写成一个 issue 或小节。",
        milestone: "30d",
        reason: "合并比新开项目更容易产生连续沉淀。",
        estimatedValueChange: 32
      },
      {
        interestType: "生成行动清单",
        content: "把它拆成发布、访谈、原型、复盘四个动作，先做最小的一项。",
        suggestedAction: "今天只完成第一项：写 200 字验证文案。",
        milestone: "30d",
        reason: "月度节点需要从想法进入轻量执行。",
        estimatedValueChange: 36
      }
    ],
    "90d": [
      {
        interestType: "重新启发性估值",
        content: `“${topic}”已经跨过 90 天，需要重新判断它是长期主题、项目种子还是应归档素材。`,
        suggestedAction: "用 30 分钟重新打分：商业、内容、传播、产品化、可行性。",
        milestone: "90d",
        reason: commonReason,
        estimatedValueChange: 72
      },
      {
        interestType: "判断是否归档",
        content: "如果它没有用户、场景和下一步，就把它归档为素材；如果还有复用价值，合并到年度主题。",
        suggestedAction: "写一句归档理由或继续理由，避免长期悬空。",
        milestone: "90d",
        reason: "90 天节点应减少长期噪音，让系统保持清爽。",
        estimatedValueChange: 20
      },
      {
        interestType: "提炼成长期主题",
        content: `从“${topic}”里提炼一个可持续研究或内容方向，而不是只保留单条想法。`,
        suggestedAction: "写 3 个相关子问题，判断是否能组成一个长期栏目。",
        milestone: "90d",
        reason: "长期主题比孤立灵感更容易形成思想资产。",
        estimatedValueChange: 64
      },
      {
        interestType: "合并进年度方向",
        content: "把它放进年度项目、内容栏目或知识库索引中，形成可回看路径。",
        suggestedAction: "在年度方向文档里新增一个小节，链接这条灵感和下一步。",
        milestone: "90d",
        reason: "跨季度沉淀适合进入长期资产层。",
        estimatedValueChange: 44
      }
    ]
  };

  return {
    interests: plans[milestone].slice(0, 5),
    zeroAi: {
      engineType: "zero-cost",
      apiCost: 0,
      templateHitCount: plans[milestone].length,
      fallbackUsed: false
    }
  };
}
