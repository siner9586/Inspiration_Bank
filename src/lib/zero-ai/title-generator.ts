import { inferKeywords, safeTopic, uniqueItems } from "@/lib/zero-ai/rules";
import type { ZeroAiInput } from "@/lib/zero-ai/types";

const blockedTitleTerms = ["夸大收益", "高风险承诺", "灰产", "赌博", "荐股", "医疗诊断", "无风险"];

function cleanTitle(title: string) {
  return title.replace(/\s+/g, " ").replace(/[，。！？]+$/g, "").trim();
}

function safeTitle(title: string) {
  const cleaned = cleanTitle(title);
  if (blockedTitleTerms.some((term) => cleaned.includes(term))) return "";
  return cleaned.length > 46 ? `${cleaned.slice(0, 44)}...` : cleaned;
}

export function generateTitleCandidates(input: ZeroAiInput) {
  const topic = safeTopic(input.title, input.rawContent);
  const keywords = inferKeywords(input, 5);
  const primary = keywords[0] ?? "灵感";
  const second = keywords.find((item) => item !== primary) ?? "行动";
  const concrete = keywords.find((item) => /工具|产品|内容|公众号|短视频|清单|模板|工作流|MVP|AI/.test(item)) ?? primary;

  const candidates = [
    { title: `为什么${topic}值得被存成思想资产`, platform: "微信公众号", score: 84 },
    { title: `如何用 30 分钟验证“${topic}”`, platform: "X", score: 82 },
    { title: `有没有一种方法，把${primary}变成可行动清单`, platform: "小红书", score: 79 },
    { title: `很多人以为${primary}只是想法，其实它可以变成${second}`, platform: "即刻", score: 78 },
    { title: `真正厉害的不是想到${primary}，而是把它持续沉淀`, platform: "知乎", score: 77 },
    { title: `我用${topic}做了一个最小验证入口`, platform: "X", score: 76 },
    { title: `一套把${primary}拆成标题、用户和行动的方法`, platform: "微信公众号", score: 75 },
    { title: `把${topic}变成${concrete}工作台`, platform: "GitHub", score: 74 },
    { title: `${topic}操作系统：从闪念到项目种子`, platform: "B站", score: 72 },
    { title: `别再让${primary}白白浪费`, platform: "小红书", score: 70 }
  ]
    .map((item) => ({ ...item, title: safeTitle(item.title) }))
    .filter((item) => item.title);

  const unique = uniqueItems(candidates.map((item) => item.title), 10);
  return unique.map((title) => candidates.find((item) => item.title === title)!).slice(0, 10);
}
