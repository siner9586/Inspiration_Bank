export const ideaTypes = [
  "content_topic",
  "product_idea",
  "business_opportunity",
  "short_video",
  "wechat_article",
  "tool_idea",
  "research_idea",
  "life_reflection",
  "other"
] as const;

export const ideaTypeLabels: Record<(typeof ideaTypes)[number], string> = {
  content_topic: "内容选题",
  product_idea: "产品想法",
  business_opportunity: "商业机会",
  short_video: "短视频创意",
  wechat_article: "公众号文章",
  tool_idea: "工具想法",
  research_idea: "研究想法",
  life_reflection: "人生感悟",
  other: "其他"
};

export const ideaStatuses = [
  "new",
  "analyzing",
  "incubating",
  "actionable",
  "converted",
  "archived"
] as const;

export const ideaStatusLabels: Record<(typeof ideaStatuses)[number], string> = {
  new: "新存入",
  analyzing: "分析中",
  incubating: "沉淀中",
  actionable: "可行动",
  converted: "已转化",
  archived: "已归档"
};

export const outputTypes = [
  "x_tweet",
  "wechat_outline",
  "xiaohongshu_post",
  "short_video_script",
  "product_one_liner",
  "project_readme",
  "action_checklist"
] as const;

export const outputTypeLabels: Record<(typeof outputTypes)[number], string> = {
  x_tweet: "X 推文",
  wechat_outline: "微信公众号选题说明",
  xiaohongshu_post: "小红书标题与正文",
  short_video_script: "短视频脚本",
  product_one_liner: "产品一句话介绍",
  project_readme: "项目 README 简介",
  action_checklist: "下一步执行清单"
};

export const levelLabels = ["低", "中", "中高", "高"] as const;
export const simpleLevelLabels = ["低", "中", "高"] as const;
export const priorityLabels = ["低", "中", "高"] as const;
export const riskLevels = ["低", "中", "高"] as const;

export type IdeaType = (typeof ideaTypes)[number];
export type IdeaStatus = (typeof ideaStatuses)[number];
export type OutputType = (typeof outputTypes)[number];
