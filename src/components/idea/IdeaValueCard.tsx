import type { Idea } from "@prisma/client";
import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatMoney, formatValueRange } from "@/lib/utils/money";
import { getDaysSinceCreated } from "@/lib/scoring/valuation";
import { getDepositReminder } from "@/lib/scoring/reminders";

export function IdeaValueCard({ idea }: { idea: Idea }) {
  const days = getDaysSinceCreated(idea.createdAt);
  const diff = idea.currentValue - idea.initialValue;
  const reminder = getDepositReminder(days);
  const growth = idea.initialValue > 0 ? Math.round((diff / idea.initialValue) * 100) : 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <div className="text-base font-semibold text-ink">启发性估值卡</div>
          <div className="mt-1 text-sm text-slate-500">用于复盘、排序和行动优先级，不是真实价格</div>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gold-50 text-gold-600">
          <TrendingUp className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-sm text-slate-500">当前启发性估值</div>
            <div className="mt-1 text-4xl font-semibold tracking-normal text-bank-900">
              {formatMoney(idea.currentValue)}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge tone="gold">{idea.valueTier}</Badge>
              <Badge tone="slate">{formatValueRange(idea.currentValue)}</Badge>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-md bg-slate-50 px-4 py-3">
              <div className="text-xs text-slate-500">存入日期</div>
              <div className="mt-1 text-sm font-semibold text-ink">{idea.createdAt.toLocaleDateString("zh-CN")}</div>
            </div>
            <div className="rounded-md bg-slate-50 px-4 py-3">
              <div className="text-xs text-slate-500">已沉淀</div>
              <div className="mt-1 text-sm font-semibold text-ink">{days} 天</div>
            </div>
            <div className="rounded-md bg-slate-50 px-4 py-3">
              <div className="text-xs text-slate-500">增值幅度</div>
              <div className="mt-1 text-sm font-semibold text-ink">
                {diff >= 0 ? "+" : ""}
                {formatMoney(diff)} / {growth >= 0 ? "+" : ""}
                {growth}%
              </div>
            </div>
          </div>
        </div>
        {reminder ? (
          <div className="mt-5 rounded-md border border-bank-100 bg-bank-50 px-4 py-3 text-sm text-bank-900">
            {reminder.message}
          </div>
        ) : null}
        <p className="mt-5 whitespace-pre-line text-sm leading-6 text-slate-600">{idea.valueExplanation}</p>
      </CardContent>
    </Card>
  );
}
