import { toTagList } from "@/lib/utils/text";

export type ExportIdea = {
  title: string;
  rawContent: string;
  summary: string;
  status: string;
  priority: string;
  currentValue: number;
  nextMinimalAction: string;
  tags: string;
};

export function ideaToMarkdown(idea: ExportIdea) {
  const tags = toTagList(idea.tags).map((tag) => `#${tag}`).join(" ");
  return `# ${idea.title}

> 模板生成，可继续人工润色。启发性估值不代表真实资产。

## 摘要
${idea.summary || idea.rawContent}

## 标签
${tags || "暂无标签"}

## 启发性估值
- 当前启发性估值：${idea.currentValue}
- 优先级：${idea.priority}
- 状态：${idea.status}

## 30 分钟最小行动
${idea.nextMinimalAction || "补充一个 30 分钟内可完成的下一步动作。"}

## 原始记录
${idea.rawContent}
`;
}
