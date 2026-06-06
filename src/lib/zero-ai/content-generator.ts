import { outputTypeLabels } from "@/types/idea";
import { safeTopic } from "@/lib/zero-ai/rules";
import { toTagList } from "@/lib/utils/text";
import type { DraftInput, ZeroOutputResult } from "@/lib/zero-ai/types";

function ideaSummary(input: DraftInput) {
  return input.idea.summary || input.idea.rawContent.slice(0, 120) || "把一个想法拆成可行动资产";
}

function targetUsers(input: DraftInput) {
  const users = toTagList(input.idea.targetUsers ?? "");
  return users.length ? users.slice(0, 3).join("、") : "有想法但缺少行动系统的人";
}

function productHints(input: DraftInput) {
  const products = toTagList(input.idea.productSuggestions ?? "");
  return products.length ? products.slice(0, 3).join("、") : "内容选题、轻量 MVP、执行清单";
}

export function generateContentDraftZeroCost(input: DraftInput): ZeroOutputResult {
  const topic = safeTopic(input.idea.title, input.idea.rawContent);
  const summary = ideaSummary(input);
  const action = input.idea.nextMinimalAction || `用 30 分钟写下“${topic}”的目标用户、场景和验证问题。`;
  const note = "模板生成，可继续手动润色。";
  const users = targetUsers(input);
  const products = productHints(input);

  const contentByType = {
    x_tweet: `【模板生成，可继续手动润色】\n\n真正有价值的不是“想到 ${topic}”，而是把它拆成一个可验证的下一步。\n\n我的判断：${summary}\n\n适合先服务：${users}\n\n今天只做一件事：${action}`,
    wechat_outline: `# ${topic}\n\n【模板生成，可继续手动润色】\n\n## 选题判断\n${summary}\n\n## 为什么现在值得写\n- 它有明确的问题场景\n- 可以从一个小样本反馈开始\n- 能沉淀为后续内容或产品素材\n\n## 文章结构\n1. 一个具体场景：这个问题如何出现\n2. 一个核心判断：它为什么不是普通想法\n3. 一个拆解方法：用户、价值、风险、下一步\n4. 一个行动入口：${action}\n\n## 适合读者\n${users}`,
    xiaohongshu_post: `标题 1：我开始认真整理这个想法：${topic}\n标题 2：别再让这个想法只躺在备忘录里\n标题 3：一个 30 分钟就能启动的灵感验证法\n\n【模板生成，可继续手动润色】\n\n正文：\n最近记下一个想法：${topic}。\n\n我没有急着做大，而是先问 4 个问题：\n1. 它到底帮谁？\n2. 用户现在怎么解决？\n3. 它能先变成什么？\n4. 今天 30 分钟能验证什么？\n\n目前最适合的形态：${products}。\n\n下一步：${action}`,
    short_video_script: `【模板生成，可继续手动润色】\n\n镜头 1｜前三秒\n你有没有一个想法，记下来以后就再也没打开过？\n\n镜头 2｜提出问题\n我最近把“${topic}”拆了一遍，发现它不应该只停留在备忘录里。\n\n镜头 3｜核心拆解\n它适合的人是：${users}。\n它可能变成：${products}。\n\n镜头 4｜给出方法\n先不要做完整产品，只做一个 30 分钟验证动作。\n\n镜头 5｜结尾行动\n今天的动作：${action}`,
    product_one_liner: `【模板生成，可继续手动润色】\n\n${topic}：面向${users}，把“${summary}”转成可验证内容、轻量产品或下一步执行清单的思想资产工作台。`,
    project_readme: `# ${topic}\n\n【模板生成，可继续手动润色】\n\n## What\n${summary}\n\n## Who\n${users}\n\n## Possible Outputs\n- ${products.split("、").join("\n- ")}\n\n## MVP Scope\n- 输入：一段原始想法\n- 处理：拆成用户、场景、价值、风险\n- 输出：标题、平台建议、下一步行动\n\n## Next Step\n${action}`,
    action_checklist: `# ${topic} 下一步执行清单\n\n【模板生成，可继续手动润色】\n\n- 写下 1 个目标用户：${users}\n- 写下 1 个真实使用场景\n- 写下 3 个标题或价值主张\n- 找 3 个相似内容、工具或服务\n- 完成一个 30 分钟验证动作：${action}\n- 复盘反馈：继续、合并、归档`
  };

  return {
    outputType: input.outputType,
    title: `${topic} - ${outputTypeLabels[input.outputType]}`,
    content: contentByType[input.outputType],
    templateGenerated: true,
    note
  };
}
