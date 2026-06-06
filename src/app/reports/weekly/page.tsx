import { format } from "date-fns";
import { prisma } from "@/lib/db/client";
import { buildWeeklyReportData } from "@/lib/reports/weekly";
import { generateWeeklyMarkdown } from "@/lib/reports/markdown";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MarkdownExportBox } from "@/components/reports/MarkdownExportBox";

export const dynamic = "force-dynamic";

export default async function WeeklyReportPage() {
  const ideas = await prisma.idea.findMany({
    orderBy: { createdAt: "desc" },
    include: { outputs: { select: { id: true } }, actionLogs: { select: { status: true, createdAt: true } } }
  });
  const data = buildWeeklyReportData(ideas);
  const markdown = generateWeeklyMarkdown(data);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">灵感周报</h1>
        <p className="mt-2 text-sm text-slate-600">用本地规则生成一份可复制、可下载、可继续润色的个人思想资产周报。</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5"><div className="text-sm text-slate-500">本周新增</div><div className="mt-2 text-2xl font-semibold text-ink">{data.newCount}</div></Card>
        <Card className="p-5"><div className="text-sm text-slate-500">启发性估值变化</div><div className="mt-2 text-2xl font-semibold text-ink">{data.valueDelta >= 0 ? "+" : ""}{data.valueDelta}</div></Card>
        <Card className="p-5"><div className="text-sm text-slate-500">周报周期</div><div className="mt-2 text-2xl font-semibold text-ink">{format(data.weekStart, "MM-dd")} 起</div></Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-base font-semibold text-ink">高价值灵感 TOP 5</div>
            <Badge tone="gold">启发性估值</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.topIdeas.length ? data.topIdeas.map((idea) => (
            <div key={idea.id} className="rounded-md bg-slate-50 p-3 text-sm">
              <div className="font-semibold text-ink">{idea.title}</div>
              <div className="mt-1 text-slate-500">启发性估值 {idea.currentValue} · {idea.nextMinimalAction || "建议补充下一步动作"}</div>
            </div>
          )) : <div className="text-sm text-slate-500">本周暂无新增高价值灵感。</div>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="text-base font-semibold text-ink">Markdown 周报</div>
          <div className="mt-1 text-sm text-slate-500">模板生成，可继续人工润色。</div>
        </CardHeader>
        <CardContent>
          <MarkdownExportBox markdown={markdown} filename={`inspiration-weekly-${format(new Date(), "yyyy-MM-dd")}.md`} />
        </CardContent>
      </Card>
    </div>
  );
}
