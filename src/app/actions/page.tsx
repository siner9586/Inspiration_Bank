import { Target } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/utils/money";
import { buildEmptyActionState } from "@/lib/actions/recommend";
import { getTodayActions } from "@/lib/actions/service";
import { ActionButtons } from "@/components/actions/ActionButtons";

export const dynamic = "force-dynamic";

export default async function TodayActionsPage() {
  const actions = await getTodayActions();
  const empty = buildEmptyActionState();

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-semibold text-ink">今日行动台</h1>
          <p className="mt-2 text-sm text-slate-600">每天只挑 3–5 个 30 分钟内能推进的灵感动作。</p>
        </div>
        <Badge tone="gold">启发性估值仅用于排序，不代表真实资产</Badge>
      </div>

      {actions.length ? (
        <div className="grid gap-4">
          {actions.map((item, index) => (
            <Card key={item.ideaId} className="overflow-hidden hover:border-bank-200">
              <CardHeader>
                <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="green">今日 #{index + 1}</Badge>
                      <Badge tone="gold">启发性估值 {formatMoney(item.value)}</Badge>
                      <Badge tone="blue">{item.outputForm}</Badge>
                    </div>
                    <h2 className="mt-3 text-lg font-semibold text-ink">{item.title}</h2>
                  </div>
                  <Target className="h-5 w-5 text-bank-700" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-md bg-slate-50 p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">推荐理由</div>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{item.reason}</p>
                </div>
                <div className="rounded-md border border-bank-100 bg-bank-50 p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-bank-700">30 分钟最小行动</div>
                  <p className="mt-2 text-sm leading-6 text-ink">{item.actionText}</p>
                </div>
                <ActionButtons ideaId={item.ideaId} actionText={item.actionText} />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-bank-50 text-bank-700">
            <Target className="h-6 w-6" />
          </div>
          <div className="mt-4 text-lg font-semibold text-ink">{empty.title}</div>
          <p className="mt-2 text-sm text-slate-500">{empty.description}</p>
        </Card>
      )}
    </div>
  );
}
