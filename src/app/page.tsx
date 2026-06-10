import { subDays, format } from "date-fns";
import {
  ArchiveRestore,
  Banknote,
  CalendarClock,
  CheckCircle2,
  Lightbulb,
  TrendingUp
} from "lucide-react";
import { prisma } from "@/lib/db/client";
import { StatCard } from "@/components/dashboard/StatCard";
import { IdeaTrendChart } from "@/components/dashboard/IdeaTrendChart";
import { IdeaTypeChart } from "@/components/dashboard/IdeaTypeChart";
import { RecommendedIdeas } from "@/components/dashboard/RecommendedIdeas";
import { EmptyDashboard } from "@/components/dashboard/EmptyDashboard";
import { WechatQrPopover } from "@/components/dashboard/WechatQrPopover";
import { formatMoney } from "@/lib/utils/money";
import { ideaTypeLabels } from "@/types/idea";
import { getDaysSinceCreated } from "@/lib/scoring/valuation";
import { getDepositReminder } from "@/lib/scoring/reminders";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAiRuntimeConfig } from "@/lib/ai/runtime-config";

export const dynamic = "force-dynamic";

function buildTrend(ideas: Awaited<ReturnType<typeof prisma.idea.findMany>>) {
  const days = Array.from({ length: 14 }, (_, index) => {
    const date = subDays(new Date(), 13 - index);
    return {
      key: format(date, "yyyy-MM-dd"),
      date: format(date, "MM-dd"),
      value: 0,
      count: 0
    };
  });
  const map = new Map(days.map((item) => [item.key, item]));

  for (const idea of ideas) {
    const key = format(idea.createdAt, "yyyy-MM-dd");
    const point = map.get(key);
    if (point) {
      point.value += idea.currentValue;
      point.count += 1;
    }
  }

  return days.map(({ key: _key, ...item }) => item);
}

function buildTypeData(ideas: Awaited<ReturnType<typeof prisma.idea.findMany>>) {
  const count = new Map<string, number>();
  for (const idea of ideas) {
    const label = ideaTypeLabels[idea.type as keyof typeof ideaTypeLabels] ?? "其他";
    count.set(label, (count.get(label) ?? 0) + 1);
  }
  return Array.from(count.entries()).map(([name, value]) => ({ name, value }));
}

export default async function DashboardPage() {
  const runtime = getAiRuntimeConfig();
  const ideas = await prisma.idea.findMany({
    orderBy: { createdAt: "desc" }
  });

  if (ideas.length === 0) {
    return <EmptyDashboard />;
  }

  const totalValue = ideas.reduce((sum, idea) => sum + idea.currentValue, 0);
  const weekStart = subDays(new Date(), 7);
  const weeklyNew = ideas.filter((idea) => idea.createdAt >= weekStart).length;
  const highValue = ideas.filter((idea) => idea.currentValue >= 2000 || idea.priority === "高").length;
  const actionable = ideas.filter((idea) => idea.status === "actionable").length;
  const matured30 = ideas.filter((idea) => getDaysSinceCreated(idea.createdAt) >= 30).length;
  const recommended = [...ideas]
    .sort((a, b) => {
      const aReminder = getDepositReminder(getDaysSinceCreated(a.createdAt)) ? 1 : 0;
      const bReminder = getDepositReminder(getDaysSinceCreated(b.createdAt)) ? 1 : 0;
      return (
        (b.status === "actionable" ? 100000 : 0) +
        b.currentValue +
        bReminder * 300 -
        ((a.status === "actionable" ? 100000 : 0) + a.currentValue + aReminder * 300)
      );
    })
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-semibold text-ink">灵感资产</h1>
          <p className="mt-2 text-sm text-slate-600">不让任何一个灵感白白死掉。</p>
        </div>
        <div className="rounded-md border border-slate-200 bg-white px-4 py-3 text-sm shadow-asset">
          <div className="flex flex-wrap gap-2">
            <Badge tone="green">当前引擎：{runtime.currentProvider}</Badge>
            <Badge tone="gold">API 成本：￥0</Badge>
            <Badge tone="slate">外部模型：{runtime.externalApiEnabled ? "已启用" : "未启用"}</Badge>
            <WechatQrPopover />
            <Badge tone="blue">可离线分析：{runtime.currentProvider === "zero-cost" ? "是" : "视配置而定"}</Badge>
          </div>
          <div className="mt-2 text-xs text-slate-500">所有金额均为启发性估值，不代表真实市场价格。</div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <StatCard label="总灵感数" value={ideas.length} icon={Lightbulb} />
        <StatCard label="总启发性估值" value={formatMoney(totalValue)} icon={Banknote} />
        <StatCard label="本周新增" value={weeklyNew} icon={TrendingUp} />
        <StatCard label="高价值灵感" value={highValue} icon={ArchiveRestore} />
        <StatCard label="待行动灵感" value={actionable} icon={CheckCircle2} />
        <StatCard label="30 天以上" value={matured30} icon={CalendarClock} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
        <IdeaTrendChart data={buildTrend(ideas)} />
        <IdeaTypeChart data={buildTypeData(ideas)} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <RecommendedIdeas ideas={recommended} />
        <Card className="p-5">
          <div className="text-base font-semibold text-ink">今日可行动</div>
          <div className="mt-4 space-y-3">
            {recommended.map((idea) => (
              <div key={idea.id} className="rounded-md bg-slate-50 p-3">
                <div className="text-sm font-semibold text-ink">{idea.title}</div>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                  {idea.nextMinimalAction || idea.summary}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
