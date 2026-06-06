import type { UserSettings } from "@prisma/client";
import {
  analysisResultSchema,
  interestResultSchema,
  outputResultSchema
} from "@/lib/ai/schemas";
import type { AiIdeaInput, AiIdeaRecord, AiProvider } from "@/lib/ai/provider";
import type { AiCallOptions } from "@/lib/ai/ai-call-logger";
import { withAiCallLog } from "@/lib/ai/ai-call-logger";
import type { AnalysisResult } from "@/types/analysis";
import type { OutputType } from "@/types/idea";
import { ideaTypeLabels, outputTypeLabels } from "@/types/idea";
import { toTagList } from "@/lib/utils/text";

function containsAny(text: string, words: string[]) {
  return words.some((word) => text.toLowerCase().includes(word.toLowerCase()));
}

function pickPlatforms(settings: UserSettings | null, fallback: string[]) {
  const platforms = settings ? toTagList(settings.platforms) : [];
  return platforms.length ? platforms.slice(0, 4) : fallback;
}

function baseAnalysis(input: AiIdeaInput, settings: UserSettings | null): AnalysisResult {
  const text = `${input.title} ${input.rawContent}`;
  const productLike = containsAny(text, ["产品", "工具", "网站", "系统", "MVP", "自动"]);
  const contentLike = containsAny(text, ["内容", "公众号", "短视频", "选题", "文章", "脚本"]);
  const businessLike = containsAny(text, ["商业", "变现", "客户", "付费", "SaaS", "订阅"]);
  const researchLike = containsAny(text, ["论文", "研究", "认知", "框架", "分析"]);
  const platforms = pickPlatforms(settings, contentLike ? ["微信公众号", "小红书", "即刻", "X"] : ["即刻", "知乎", "GitHub", "微信公众号"]);
  const commercialValue = businessLike || productLike ? 72 : contentLike ? 42 : 32;
  const contentValue = contentLike || researchLike ? 78 : productLike ? 58 : 50;
  const productizationScore = productLike ? 78 : researchLike ? 54 : 42;
  const viralityScore = contentLike ? 70 : productLike ? 58 : 48;
  const personalFitScore = settings?.focusDirections ? 72 : 58;
  const priority = commercialValue + contentValue + productizationScore > 205 ? "高" : "中";
  const productName = productLike ? `${input.title} MVP` : `${input.title} 内容资产包`;

  return analysisResultSchema.parse({
    summary: `${input.title}可以被沉淀为一个${ideaTypeLabels[input.type]}资产，先用低成本方式验证需求和表达角度。`,
    feasibilityLevel: productLike ? "中" : "高",
    commercialValue,
    contentValue,
    viralityLevel: viralityScore >= 70 ? "中高" : "中",
    viralityScore,
    productizationLevel: productizationScore >= 70 ? "高" : productizationScore >= 50 ? "中" : "低",
    productizationScore,
    shortVideoFit: contentLike ? "高" : "中",
    longTermFit: productLike || researchLike ? "高" : "中",
    personalFitScore,
    riskLevel: productLike ? "中" : "低",
    spreadableTitles: [
      { title: `不让 ${input.title} 停留在脑子里`, platform: "微信公众号", score: 82 },
      { title: `我把一个灵感存成了可行动资产`, platform: "X", score: 76 },
      { title: `${input.title}：从闪念到项目种子`, platform: "即刻", score: 74 },
      { title: `一个 30 分钟就能验证的想法`, platform: "小红书", score: 72 },
      { title: `${input.title} 的最小可行动版本`, platform: "知乎", score: 70 }
    ],
    productSuggestions: [
      productName,
      "一个带模板和提醒机制的轻量工作台",
      "一套可复用的内容选题库或项目验证清单"
    ],
    recommendedPlatforms: platforms,
    requiredResources: [
      "一页需求验证文档",
      "3 个目标用户访谈对象",
      "一个可演示的低保真原型",
      "30 分钟内容草稿时间"
    ],
    nextMinimalAction: `用 30 分钟写出“${input.title}”的目标用户、使用场景和第一个验证问题。`,
    targetUsers: [
      "经常产生想法但缺少整理机制的创作者",
      "正在寻找产品选题的独立开发者",
      "希望把知识沉淀为资产的个人用户"
    ],
    monetizationMethods: productLike
      ? ["订阅制工具", "模板包", "咨询或工作坊"]
      : ["内容流量转化", "付费社群", "选题库模板"],
    risks: productLike
      ? ["真实需求仍需验证", "功能容易膨胀", "用户可能只把它当普通笔记"]
      : ["标题吸引力不足会降低传播", "需要持续输出才能形成资产"],
    priority,
    valueExplanation:
      "这是基于 mock 智能引擎的启发性估值说明：估值只用于复盘和排序，不代表真实市场价格、交易价格或金融建议。"
  });
}

async function withMockLog<T>(options: AiCallOptions | undefined, run: () => T | Promise<T>) {
  const model = options?.model ?? process.env.AI_MODEL ?? "mock-model";
  const taskType = options?.taskType ?? "analyze";
  return withAiCallLog(
    {
      providerName: "mock",
      model,
      taskType,
      ideaId: options?.ideaId,
      inputPayload: options?.inputPayload
    },
    async () => {
      const result = await run();
      return {
        result,
        outputPayload: result
      };
    }
  );
}

export const mockAiProvider: AiProvider = {
  async analyzeIdea(input, settings, options) {
    return withMockLog(
      {
        ...options,
        taskType: options?.taskType ?? "analyze",
        inputPayload: options?.inputPayload ?? input
      },
      () => baseAnalysis(input, settings)
    );
  },

  async revalueIdea(idea, settings, options) {
    return withMockLog(
      {
        ...options,
        taskType: "revalue",
        ideaId: options?.ideaId ?? idea.id,
        inputPayload: options?.inputPayload ?? idea
      },
      () =>
        baseAnalysis(
          {
            title: idea.title,
            rawContent: idea.rawContent,
            type: idea.type as AiIdeaInput["type"],
            tags: toTagList(idea.tags),
            source: idea.source,
            createdAt: idea.createdAt
          },
          settings
        )
    );
  },

  async generateInterest(idea, settings, options) {
    const platforms = pickPlatforms(settings, ["微信公众号", "X", "小红书"]);
    return withMockLog(
      {
        ...options,
        taskType: "interest",
        ideaId: options?.ideaId ?? idea.id,
        inputPayload: options?.inputPayload ?? idea
      },
      () =>
        interestResultSchema.parse({
          interests: [
            {
              interestType: "升级为内容",
              content: `把“${idea.title}”扩展成一篇公众号选题：先讲灵感为什么容易消失，再给出一个存入、拆解、行动的流程。`,
              suggestedAction: "写 5 个小标题，每个小标题补 2 句要点。"
            },
            {
              interestType: "改造成推文",
              content: `把它压缩成 X 上的一条观点：真正有价值的不是灵感本身，而是灵感被持续复利的系统。`,
              suggestedAction: `在 ${platforms[0] ?? "X"} 发布一个 280 字以内的观点测试。`
            },
            {
              interestType: "短视频脚本",
              content: "用“你每天死掉的灵感，可能就是未来项目的种子”作为前三秒钩子，讲一个具体使用场景。",
              suggestedAction: "录一段 45 秒口播，结尾引导评论区留下一个最近的灵感。"
            },
            {
              interestType: "现在适合行动",
              content: "这个灵感已经具备可行动入口，适合用一个极小验证动作判断是否值得继续投入。",
              suggestedAction: "找 1 位目标用户，问他是否遇到过同类问题，以及现在怎么解决。"
            }
          ]
        })
    );
  },

  async generateOutput(idea, outputType, _settings, options) {
    const label = outputTypeLabels[outputType];
    const contentByType: Record<OutputType, string> = {
      x_tweet: `灵感不是越多越好，而是要能被存入、估值、提醒和转化。\n\n“${idea.title}”这个想法的关键是：把闪念当作思想资产管理，而不是普通笔记。\n\n今天的最小行动：${idea.nextMinimalAction || "写下目标用户和第一个验证问题。"}`,
      wechat_outline: `选题：${idea.title}\n\n核心观点：${idea.summary}\n\n结构：\n1. 为什么好灵感经常白白消失\n2. 这个灵感能解决什么具体问题\n3. 它能如何变成内容、产品或项目\n4. 30 分钟内可以做的验证动作\n\n开头：如果一个想法只被写进备忘录，它大概率还是会死掉。真正重要的是让它进入一个可复盘、可行动的系统。`,
      xiaohongshu_post: `标题：我开始把灵感当资产管理了\n\n正文：\n以前灵感来了就记一下，过几天就忘。\n现在我会问 5 个问题：\n- 它适合什么人？\n- 能不能变成内容？\n- 有没有产品化空间？\n- 下一步 30 分钟能做什么？\n- 过 30 天还值得复盘吗？\n\n这条灵感是：${idea.title}\n下一步：${idea.nextMinimalAction || "写一个最小验证清单。"}`,
      short_video_script: `镜头 1｜前三秒：你每天死掉的灵感，可能就是未来项目的种子。\n\n镜头 2｜问题：大多数人只是记录想法，但没有复盘、估值和下一步。\n\n镜头 3｜案例：${idea.title}。\n\n镜头 4｜拆解：它可以变成内容选题、产品 MVP 或一个验证任务。\n\n镜头 5｜行动：今天只做一件事，${idea.nextMinimalAction || "写下目标用户和一个验证问题。"}`,
      product_one_liner: `${idea.title}：面向高频产生想法但缺少行动系统的人，把灵感沉淀为可复盘、可估值、可转化资产的轻量工作台。`,
      project_readme: `# ${idea.title}\n\n${idea.summary}\n\n## 目标用户\n${JSON.stringify(idea.targetUsers ?? [], null, 2)}\n\n## MVP\n- 灵感录入\n- 智能拆解\n- 启发性估值\n- 利息建议\n- 内容草稿生成\n\n## 下一步\n${idea.nextMinimalAction || "完成一个 30 分钟验证动作。"}`,
      action_checklist: `# 下一步执行清单\n\n- 明确一个目标用户\n- 写出一个真实使用场景\n- 提炼一个 30 字价值主张\n- 找 1 位潜在用户验证\n- 根据反馈决定继续沉淀、行动或归档\n\n当前最小行动：${idea.nextMinimalAction || "写下目标用户和第一个验证问题。"}`
    };

    return withMockLog(
      {
        ...options,
        taskType: "output",
        ideaId: options?.ideaId ?? idea.id,
        inputPayload: options?.inputPayload ?? { idea, outputType }
      },
      () =>
        outputResultSchema.parse({
          outputType,
          title: `${idea.title} - ${label}`,
          content: contentByType[outputType]
        })
    );
  }
};
