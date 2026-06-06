import type { UserSettings } from "@prisma/client";
import {
  commercialTerms,
  contentTerms,
  highCostTerms,
  lowCostValidationTerms,
  productizationTerms,
  repeatNeedTerms,
  sensitiveTerms,
  userTerms,
  viralityTerms
} from "@/lib/zero-ai/lexicons";
import {
  clampScore,
  countOverlap,
  getIdeaText,
  hasConcreteUser,
  hasConflictOrContrast,
  hasStorySignal,
  hasTimeBoxedAction,
  matchTerms,
  scoreToLevel,
  scoreToSimpleLevel,
  settingsPlatforms,
  settingsText
} from "@/lib/zero-ai/rules";
import type { RuleComponent, ZeroAiInput, ZeroAiScoreBreakdown } from "@/lib/zero-ai/types";

type ScoreOutput = {
  commercialValue: number;
  contentValue: number;
  viralityScore: number;
  productizationScore: number;
  feasibilityScore: number;
  feasibilityLevel: "低" | "中" | "高";
  viralityLevel: "低" | "中" | "中高" | "高";
  productizationLevel: "低" | "中" | "高";
  shortVideoFit: "低" | "中" | "高";
  longTermFit: "低" | "中" | "高";
  personalFitScore: number;
  riskLevel: "低" | "中" | "高";
  priority: "低" | "中" | "高";
  components: ZeroAiScoreBreakdown;
  ruleHitCount: number;
  lexiconHitCount: number;
  explainabilityScore: number;
};

function component(
  id: string,
  label: string,
  score: number,
  weight: number,
  reason: string,
  hits: string[] = []
): RuleComponent {
  const bounded = Math.max(-100, Math.min(100, Math.round(score)));
  return { id, label, score: bounded, weight, reason, hits };
}

function weightedScore(base: number, components: RuleComponent[]) {
  const value = components.reduce((sum, item) => sum + item.score * item.weight, base);
  return clampScore(value);
}

function countRuleHits(components: ZeroAiScoreBreakdown) {
  return Object.values(components)
    .flat()
    .filter((item) => item.score > 0 || item.hits.length > 0).length;
}

function countLexiconHits(components: ZeroAiScoreBreakdown) {
  return Object.values(components)
    .flat()
    .reduce((sum, item) => sum + item.hits.length, 0);
}

function personalFit(input: ZeroAiInput, settings?: UserSettings | null) {
  const text = getIdeaText(input);
  const settingPayload = settingsText(settings);
  const keywordOverlap = countOverlap([...(input.tags ?? []), input.title], settingPayload);
  const platforms = settingsPlatforms(settings);
  const platformOverlap = countOverlap(platforms, text);
  const hasSkills = countOverlap(["开发", "产品", "写作", "AI", "运营", "设计", "研究"], settingPayload) > 0;
  const goalOverlap = countOverlap(["内容", "产品", "商业", "研究", "项目"], settingPayload);

  const components = [
    component(
      "focus-overlap",
      "关注方向匹配",
      Math.min(26, keywordOverlap * 10),
      1,
      keywordOverlap ? "灵感标签或标题与用户关注方向有交集。" : "暂未识别到明显关注方向交集。",
      keywordOverlap ? [input.title, ...(input.tags ?? [])].slice(0, keywordOverlap + 1) : []
    ),
    component(
      "platform-overlap",
      "常用平台匹配",
      Math.min(18, platformOverlap * 8),
      1,
      platformOverlap ? "灵感表达场景与常用平台接近。" : "平台匹配主要由内容特征推断。",
      platformOverlap ? platforms : []
    ),
    component(
      "skills",
      "技能资源匹配",
      hasSkills ? 18 : 8,
      1,
      hasSkills ? "用户画像中有产品、开发、写作或研究能力。" : "资源能力信息较少，按保守分处理。",
      hasSkills ? ["产品", "开发", "写作", "AI", "研究"] : []
    ),
    component(
      "conversion-goal",
      "转化目标匹配",
      Math.min(18, goalOverlap * 7 + 4),
      1,
      goalOverlap ? "转化目标支持内容、产品或研究方向。" : "转化目标不明确。",
      goalOverlap ? ["内容", "产品", "商业", "研究"].slice(0, goalOverlap) : []
    )
  ];

  return {
    score: clampScore(46 + components.reduce((sum, item) => sum + item.score, 0) * 0.72),
    components
  };
}

export function scoreIdea(input: ZeroAiInput): ScoreOutput {
  const text = getIdeaText(input);
  const commercialHits = matchTerms(text, commercialTerms);
  const contentHits = matchTerms(text, contentTerms);
  const viralityHits = matchTerms(text, viralityTerms);
  const productHits = matchTerms(text, productizationTerms);
  const repeatHits = matchTerms(text, repeatNeedTerms);
  const userHits = matchTerms(text, userTerms);
  const costHits = matchTerms(text, highCostTerms);
  const validationHits = matchTerms(text, lowCostValidationTerms);
  const sensitiveHits = matchTerms(text, sensitiveTerms);
  const concreteUser = hasConcreteUser(text);
  const contrast = hasConflictOrContrast(text);
  const story = hasStorySignal(text);
  const timeBoxed = hasTimeBoxedAction(text);

  const commercial = [
    component("commercial-lexicon", "商业词库信号", Math.min(30, commercialHits.length * 5), 1, "产品、付费、客户、效率等词会提升商业价值。", commercialHits),
    component("target-user", "明确用户", concreteUser || userHits.length > 0 ? 18 : 0, 1, concreteUser ? "指向了明确人群或服务对象。" : "暂未指向明确用户。", userHits),
    component("repeat-need", "重复需求", Math.min(18, repeatHits.length * 6), 1, "重复场景更容易形成稳定需求。", repeatHits),
    component("tool-service", "工具或服务空间", productHits.length ? 18 : 0, 1, "存在工具化、服务化或流程化空间。", productHits.slice(0, 5)),
    component("long-term", "长期使用场景", /长期|持续|每周|每天|复用|沉淀|系统/.test(text) ? 12 : 2, 1, "长期场景会提高复盘和转化价值。", repeatHits)
  ];

  const content = [
    component("content-lexicon", "内容词库信号", Math.min(28, contentHits.length * 5), 1, "复盘、方法论、案例、选题等词提升内容价值。", contentHits),
    component("contrast", "观点反差", contrast ? 18 : 0, 1, "反差和冲突更容易形成标题与观点。", contrast ? ["反差"] : []),
    component("story", "故事性", story ? 16 : 0, 1, "有案例、经历或项目过程，更适合内容表达。", story ? ["案例/经历"] : []),
    component("platform-fit", "多平台表达", matchTerms(text, ["公众号", "X", "小红书", "短视频", "知乎", "即刻"]).length * 5, 1, "出现明确内容平台会提升可输出性。", matchTerms(text, ["公众号", "X", "小红书", "短视频", "知乎", "即刻"])),
    component("method-case", "方法论/清单/趋势", /方法论|清单|趋势|案例|复盘|步骤|框架/.test(text) ? 18 : 0, 1, "方法论和清单结构便于沉淀。", matchTerms(text, ["方法论", "清单", "趋势", "案例", "复盘", "步骤", "框架"]))
  ];

  const virality = [
    component("virality-lexicon", "传播词库信号", Math.min(26, viralityHits.length * 5), 1, "痛点、反差、共鸣和利益点提升传播潜力。", viralityHits),
    component("short-expression", "短句表达", input.title.length <= 32 ? 12 : 4, 1, "标题较短，适合转成短观点或钩子。", input.title.length <= 32 ? [input.title] : []),
    component("identity", "身份代入", userHits.length ? 14 : 0, 1, "明确身份更利于读者代入。", userHits),
    component("visualizable", "可视觉化", /流程|看板|表格|卡片|演示|插件|页面|视频|地图|数据库/.test(text) ? 14 : 0, 1, "可以被画成流程、页面或视频镜头。", matchTerms(text, ["流程", "看板", "表格", "卡片", "演示", "插件", "页面", "视频", "地图", "数据库"])),
    component("pain-benefit", "痛点与利益", /问题|痛点|效率|成本|浪费|第一步|节省|提升/.test(text) ? 16 : 0, 1, "痛点或明确收益让传播更容易启动。", matchTerms(text, ["问题", "痛点", "效率", "成本", "浪费", "第一步", "节省", "提升"]))
  ];

  const productization = [
    component("product-lexicon", "产品化词库信号", Math.min(32, productHits.length * 5), 1, "工具化、模板化、自动化、数据化会提升产品化潜力。", productHits),
    component("workflow", "流程化", /流程|SOP|步骤|清单|工作流|自动/.test(text) ? 16 : 0, 1, "流程化场景适合做 MVP 或模板。", matchTerms(text, ["流程", "SOP", "步骤", "清单", "工作流", "自动"])),
    component("template", "模板化", /模板|清单|README|表单|框架|选题库/.test(text) ? 14 : 0, 1, "模板化能降低交付成本。", matchTerms(text, ["模板", "清单", "README", "表单", "框架", "选题库"])),
    component("data", "数据化", /数据|指标|看板|数据库|统计|历史记录/.test(text) ? 12 : 0, 1, "数据化可形成持续复用价值。", matchTerms(text, ["数据", "指标", "看板", "数据库", "统计", "历史记录"])),
    component("mvp", "MVP 可验证", /MVP|原型|验证|冷启动|landing|小程序表单|公开页面/.test(text) ? 14 : timeBoxed ? 8 : 0, 1, "可用低成本 MVP 或内容验证启动。", matchTerms(text, ["MVP", "原型", "验证", "冷启动", "landing", "小程序表单", "公开页面"]))
  ];

  const feasibility = [
    component("low-cost", "低成本验证", Math.min(28, validationHits.length * 7 + (timeBoxed ? 10 : 0)), 1, "能从表单、访谈、README 或 30 分钟动作开始。", validationHits),
    component("capital-risk", "资金与团队复杂度", costHits.length ? -24 : 10, 1, costHits.length ? "涉及资金、资质、监管或复杂团队，需保守处理。" : "暂未识别高资金或复杂团队依赖。", costHits),
    component("content-first", "可内容先行", /公众号|小红书|X|即刻|知乎|内容|短视频|文章|选题/.test(text) ? 20 : 6, 1, "可以先用内容验证关注度。", matchTerms(text, ["公众号", "小红书", "X", "即刻", "知乎", "内容", "短视频", "文章", "选题"])),
    component("thirty-minutes", "30 分钟入口", timeBoxed ? 18 : 8, 1, timeBoxed ? "文本中已出现可快速启动的行动线索。" : "可以由系统生成 30 分钟内的最小动作。", timeBoxed ? ["30 分钟行动"] : [])
  ];

  const safety = [
    component("sensitive-risk", "敏感/高风险内容", sensitiveHits.length ? 40 : 0, 1, sensitiveHits.length ? "涉及敏感或高风险词，应给出保守建议并避免具体执行方案。" : "未识别明显敏感风险。", sensitiveHits)
  ];

  const fit = personalFit(input, input.userSettings);

  const components: ZeroAiScoreBreakdown = {
    commercial,
    content,
    virality,
    productization,
    feasibility,
    personalFit: fit.components,
    safety
  };

  let commercialValue = weightedScore(28, commercial);
  let contentValue = weightedScore(30, content);
  let viralityScore = weightedScore(26, virality);
  let productizationScore = weightedScore(24, productization);
  let feasibilityScore = weightedScore(44, feasibility);

  if (sensitiveHits.length) {
    commercialValue = clampScore(commercialValue - 22);
    viralityScore = clampScore(viralityScore - 16);
    productizationScore = clampScore(productizationScore - 14);
    feasibilityScore = clampScore(feasibilityScore - 24);
  }

  const personalFitScore = fit.score;
  const shortVideoFit = scoreToSimpleLevel(clampScore(viralityScore * 0.7 + contentValue * 0.25 + (text.includes("短视频") ? 12 : 0)));
  const longTermFit = scoreToSimpleLevel(clampScore(productizationScore * 0.45 + commercialValue * 0.25 + contentValue * 0.2 + repeatHits.length * 4));
  const feasibilityLevel = scoreToSimpleLevel(feasibilityScore);
  const productizationLevel = scoreToSimpleLevel(productizationScore);
  const viralityLevel = scoreToLevel(viralityScore);
  const riskLevel = sensitiveHits.length || costHits.length >= 2 ? "高" : costHits.length || commercialValue >= 82 ? "中" : "低";
  const aggregate =
    commercialValue * 0.24 +
    contentValue * 0.21 +
    viralityScore * 0.17 +
    productizationScore * 0.22 +
    feasibilityScore * 0.1 +
    personalFitScore * 0.06;
  const priority: "低" | "中" | "高" =
    riskLevel === "高" ? "低" : aggregate >= 74 ? "高" : aggregate >= 48 ? "中" : "低";
  const ruleHitCount = countRuleHits(components);
  const lexiconHitCount = countLexiconHits(components);

  return {
    commercialValue,
    contentValue,
    viralityScore,
    productizationScore,
    feasibilityScore,
    feasibilityLevel,
    viralityLevel,
    productizationLevel,
    shortVideoFit,
    longTermFit,
    personalFitScore,
    riskLevel,
    priority,
    components,
    ruleHitCount,
    lexiconHitCount,
    explainabilityScore: clampScore(62 + Math.min(24, ruleHitCount * 2) + Math.min(14, lexiconHitCount))
  };
}
