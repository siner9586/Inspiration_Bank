import { ideaToMarkdown, type ExportIdea } from "@/lib/export/markdown";

export type ExportPlatform = "markdown" | "x_thread" | "wechat" | "xiaohongshu" | "short_video" | "readme" | "project_plan";

export const exportPlatformLabels: Record<ExportPlatform, string> = {
  markdown: "Markdown",
  x_thread: "X thread",
  wechat: "微信公众号草稿",
  xiaohongshu: "小红书笔记",
  short_video: "短视频脚本",
  readme: "GitHub README",
  project_plan: "项目计划书"
};

export function exportIdeaForPlatform(idea: ExportIdea, platform: ExportPlatform) {
  const action = idea.nextMinimalAction || "用 30 分钟补充问题、受众和下一步验证。";
  if (platform === "markdown") return ideaToMarkdown(idea);
  if (platform === "x_thread") {
    return `1/ ${idea.title}\n\n${idea.summary || idea.rawContent.slice(0, 120)}\n\n2/ 为什么值得做：启发性估值 ${idea.currentValue}，优先级 ${idea.priority}。\n\n3/ 今天的 30 分钟动作：${action}\n\n模板生成，可继续人工润色。`;
  }
  if (platform === "wechat") {
    return `# ${idea.title}\n\n## 开头\n${idea.summary || "从这个灵感切入一个具体问题。"}\n\n## 核心观点\n1. 问题是什么\n2. 为什么现在值得做\n3. 30 分钟内怎么推进\n\n## 结尾\n${action}\n\n模板生成，可继续人工润色。`;
  }
  if (platform === "xiaohongshu") {
    return `${idea.title}\n\n一句话：${idea.summary || idea.rawContent.slice(0, 80)}\n\n适合收藏的 3 个点：\n1. 先把想法写清楚\n2. 用启发性估值排序\n3. 今天只做一步：${action}\n\n#灵感管理 #个人成长 #AI工具\n\n模板生成，可继续人工润色。`;
  }
  if (platform === "short_video") {
    return `短视频脚本｜${idea.title}\n\n0-3s：抛出问题：这个灵感为什么不能放过？\n3-15s：讲清背景：${idea.summary || idea.rawContent.slice(0, 120)}\n15-25s：给出方法：按启发性估值、可行性、内容价值排序。\n25-35s：行动号召：${action}\n\n模板生成，可继续人工润色。`;
  }
  if (platform === "readme") {
    return `# ${idea.title}\n\n## 一句话定位\n${idea.summary || "把一个灵感转成可执行的小项目。"}\n\n## Problem\n${idea.rawContent}\n\n## MVP Scope\n- ${action}\n- 写出最小功能列表\n- 收集 3 个反馈\n\n## Roadmap\n- Day 1：整理 README\n- Day 2-3：完成最小原型\n- Day 4-7：验证并复盘\n\n模板生成，可继续人工润色。`;
  }
  return `# 项目计划书：${idea.title}\n\n## 定位\n${idea.summary || "个人灵感转化项目"}\n\n## 目标用户\n对该问题有持续痛点的人。\n\n## MVP 范围\n- ${action}\n- 做一个最小演示\n- 记录反馈和下一步\n\n## 风险\n不要把启发性估值理解为真实金融资产。\n\n模板生成，可继续人工润色。`;
}
