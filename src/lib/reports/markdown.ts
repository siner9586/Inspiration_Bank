import { format } from "date-fns";

type WeeklyData = {
  weekStart: Date;
  newCount: number;
  valueDelta: number;
  topIdeas: { title: string; currentValue: number; nextMinimalAction: string }[];
  converted: { title: string }[];
  skippedOrArchived: { title: string }[];
  keywords: [string, number][];
  nextActions: { title: string; actionText: string; outputForm: string }[];
};

function list<T>(items: T[], render: (item: T) => string, fallback: string) {
  return items.length ? items.map(render).join("\n") : fallback;
}

export function generateWeeklyMarkdown(data: WeeklyData) {
  return `# 灵感银行周报

> 周期：${format(data.weekStart, "yyyy-MM-dd")} 起。本周所有金额均为启发性估值，不代表真实资产。

## 本周概览
- 本周新增灵感：${data.newCount}
- 本周总启发性估值变化：${data.valueDelta >= 0 ? "+" : ""}${data.valueDelta}
- 说明：本周报由本地规则与模板生成，可继续人工润色。

## 高价值灵感
${list(data.topIdeas, (idea) => `- ${idea.title}（启发性估值 ${idea.currentValue}）：${idea.nextMinimalAction || "建议补充下一步动作"}`, "- 暂无高价值灵感。")}

## 已转化内容
${list(data.converted, (idea) => `- ${idea.title}`, "- 本周暂无已转化灵感。")}

## 沉淀中的机会
${list(data.topIdeas.filter((idea) => idea.currentValue > 0), (idea) => `- ${idea.title}`, "- 暂无明显机会。")}

## 重复出现的主题
${list(data.keywords, ([word, count]) => `- ${word} × ${count}`, "- 暂无稳定主题。")}

## 下周推荐行动
${list(data.nextActions, (item) => `- ${item.title}：${item.actionText}（建议输出：${item.outputForm}）`, "- 下周先新增或复盘 3 条灵感。")}

## 值得放弃的噪音
${list(data.skippedOrArchived, (idea) => `- ${idea.title}`, "- 暂无需要放弃的噪音。")}
`;
}
