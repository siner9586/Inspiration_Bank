import { getIdeaText, matchTerms } from "@/lib/zero-ai/rules";
import type { ZeroAiInput } from "@/lib/zero-ai/types";

export function estimateRequiredResources(input: ZeroAiInput) {
  const text = getIdeaText(input);
  const resources = new Set<string>();

  resources.add("30 分钟无打扰时间");
  resources.add("一页验证文档或草稿");

  if (matchTerms(text, ["产品", "工具", "MVP", "插件", "工作流", "SaaS"]).length) {
    resources.add("一张低保真流程图");
    resources.add("3 个潜在用户或类似产品样本");
  }

  if (matchTerms(text, ["公众号", "小红书", "短视频", "选题", "文章", "内容"]).length) {
    resources.add("5 个标题候选");
    resources.add("一个可发布平台账号");
  }

  if (matchTerms(text, ["数据", "看板", "数据库", "研究", "论文"]).length) {
    resources.add("一个最小样本表");
    resources.add("可追溯的信息来源记录");
  }

  if (matchTerms(text, ["客户", "企业", "B2B", "老师", "团队", "本地"]).length) {
    resources.add("3 个目标用户访谈问题");
  }

  return Array.from(resources).slice(0, 6);
}

export function estimateTargetUsers(input: ZeroAiInput) {
  const text = getIdeaText(input);
  if (matchTerms(text, ["老师", "课堂", "教育", "学生"]).length) {
    return ["需要低成本备课和课堂互动的老师", "希望提高课堂参与度的教育从业者", "正在整理课程内容的知识创作者"];
  }
  if (matchTerms(text, ["企业", "B2B", "团队", "SOP", "工作流"]).length) {
    return ["正在把 AI 落地到业务流程的中小团队", "需要标准化 SOP 的业务负责人", "希望降低重复沟通成本的运营或产品团队"];
  }
  if (matchTerms(text, ["开发者", "GitHub", "开源", "插件", "代码"]).length) {
    return ["希望提升效率的开发者", "正在构建个人工具的独立开发者", "需要可复用模板的技术创作者"];
  }
  if (matchTerms(text, ["小红书", "公众号", "短视频", "内容", "选题"]).length) {
    return ["经常有选题但缺少结构的内容创作者", "需要低成本测试表达角度的写作者", "希望把经验沉淀为内容资产的个人用户"];
  }
  return ["经常产生想法但缺少整理机制的个人用户", "正在寻找产品或内容选题的独立创作者", "希望把知识沉淀为可行动资产的人"];
}

export function estimateMonetizationMethods(input: ZeroAiInput) {
  const text = getIdeaText(input);
  if (matchTerms(text, ["企业", "B2B", "SaaS", "SOP", "工作流"]).length) {
    return ["轻量订阅制工具", "模板包或行业 SOP 包", "面向小团队的落地咨询"];
  }
  if (matchTerms(text, ["课程", "老师", "教育", "课堂"]).length) {
    return ["课程资料包", "教学模板", "小型工作坊"];
  }
  if (matchTerms(text, ["公众号", "小红书", "短视频", "内容", "选题"]).length) {
    return ["内容流量转化", "选题模板包", "付费社群或陪跑服务"];
  }
  if (matchTerms(text, ["工具", "插件", "MVP", "Web", "开源"]).length) {
    return ["免费工具加高级模板", "个人版订阅", "开源赞助或定制服务"];
  }
  return ["模板包", "内容转化", "一对一咨询或小范围服务"];
}

export function estimateRisks(input: ZeroAiInput, riskLevel: "低" | "中" | "高") {
  const text = getIdeaText(input);
  const risks = new Set<string>();
  risks.add("启发性估值只用于排序和复盘，不代表真实市场价格。");

  if (riskLevel === "高") {
    risks.add("涉及敏感或高风险场景，需要人工判断，不生成具体执行方案。");
  }

  if (matchTerms(text, ["医疗", "法律", "金融", "医生", "律师", "投资"]).length) {
    risks.add("专业领域必须保留人工审核，避免输出诊断、法律意见或投资建议。");
  }

  if (matchTerms(text, ["AI", "自动", "生成"]).length) {
    risks.add("自动化结果需要可解释、可撤销和人工确认机制。");
  }

  if (matchTerms(text, ["产品", "工具", "MVP", "SaaS"]).length) {
    risks.add("真实需求仍需验证，避免一开始就扩展过多功能。");
  }

  if (matchTerms(text, ["内容", "公众号", "短视频", "小红书"]).length) {
    risks.add("内容表达要避免虚假夸大，先用小样本反馈调整标题和结构。");
  }

  return Array.from(risks).slice(0, 5);
}
