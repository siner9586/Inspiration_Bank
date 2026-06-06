import { prisma } from "@/lib/db/client";
import { analyzePortfolio } from "@/lib/insights/analyze-portfolio";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function InsightsPage() {
  const ideas = await prisma.idea.findMany({ orderBy: { createdAt: "desc" } });
  const data = analyzePortfolio(ideas);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">灵感资产复盘</h1>
        <p className="mt-2 text-sm text-slate-600">基于关键词、标签、类型、评分与状态做轻量聚类；启发性估值不代表真实资产。</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5"><div className="text-sm text-slate-500">已转化率</div><div className="mt-2 text-2xl font-semibold text-ink">{data.conversionRate}%</div></Card>
        <Card className="p-5"><div className="text-sm text-slate-500">噪音率</div><div className="mt-2 text-2xl font-semibold text-ink">{data.noiseRate}%</div></Card>
        <Card className="p-5"><div className="text-sm text-slate-500">灵感总数</div><div className="mt-2 text-2xl font-semibold text-ink">{data.total}</div></Card>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader><div className="text-base font-semibold text-ink">高频主题 / 关键词</div></CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {data.themes.length ? data.themes.map(([word, count]) => <Badge key={word} tone="blue">{word} × {count}</Badge>) : <div className="text-sm text-slate-500">暂无足够主题。</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><div className="text-base font-semibold text-ink">类型分布</div></CardHeader>
          <CardContent className="space-y-2">
            {data.typeDistribution.map(([type, count]) => <div key={type} className="flex justify-between rounded-md bg-slate-50 p-3 text-sm"><span>{type}</span><span>{count}</span></div>)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><div className="text-base font-semibold text-ink">最高价值方向</div></CardHeader>
          <CardContent className="space-y-2">{data.highestValue.map((idea) => <div key={idea.id} className="rounded-md bg-slate-50 p-3 text-sm">{idea.title} · 启发性估值 {idea.currentValue}</div>)}</CardContent>
        </Card>
        <Card>
          <CardHeader><div className="text-base font-semibold text-ink">长期沉淀但未行动</div></CardHeader>
          <CardContent className="space-y-2">{data.dormant.length ? data.dormant.map((idea) => <div key={idea.id} className="rounded-md bg-slate-50 p-3 text-sm">{idea.title}</div>) : <div className="text-sm text-slate-500">暂无长期沉淀项。</div>}</CardContent>
        </Card>
      </div>
      <Card className="p-5">
        <div className="text-base font-semibold text-ink">个人认知趋势</div>
        <p className="mt-2 text-sm leading-6 text-slate-600">{data.trend}</p>
      </Card>
    </div>
  );
}
