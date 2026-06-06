import Link from "next/link";
import type { Idea } from "@prisma/client";
import { ArrowUpRight, CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ideaStatusLabels, ideaTypeLabels } from "@/types/idea";
import { formatMoney } from "@/lib/utils/money";
import { toTagList, truncateText } from "@/lib/utils/text";
import { formatDate } from "@/lib/utils/date";
import { getDaysSinceCreated } from "@/lib/scoring/valuation";
import { getDepositReminder } from "@/lib/scoring/reminders";

function statusTone(status: string) {
  if (status === "actionable") return "gold";
  if (status === "archived") return "slate";
  if (status === "converted") return "blue";
  return "green";
}

export function IdeaCard({ idea }: { idea: Idea }) {
  const tags = toTagList(idea.tags);
  const days = getDaysSinceCreated(idea.createdAt);
  const reminder = getDepositReminder(days);

  return (
    <Link href={`/ideas/${idea.id}`}>
      <Card className="group p-5 transition hover:-translate-y-0.5 hover:border-bank-200">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="green">{ideaTypeLabels[idea.type as keyof typeof ideaTypeLabels] ?? "其他"}</Badge>
              <Badge tone={statusTone(idea.status)}>
                {ideaStatusLabels[idea.status as keyof typeof ideaStatusLabels] ?? idea.status}
              </Badge>
              <Badge tone={idea.priority === "高" ? "gold" : "slate"}>{idea.priority}优先级</Badge>
            </div>
            <h2 className="mt-3 line-clamp-2 text-lg font-semibold text-ink">{idea.title}</h2>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
              {truncateText(idea.summary || idea.rawContent, 132)}
            </p>
          </div>
          <ArrowUpRight className="h-5 w-5 shrink-0 text-slate-300 transition group-hover:text-bank-700" />
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <div className="rounded-md bg-bank-50 px-3 py-2">
            <div className="text-xs text-slate-500">启发性估值</div>
            <div className="text-lg font-semibold text-bank-900">{formatMoney(idea.currentValue)}</div>
          </div>
          <div className="rounded-md bg-slate-50 px-3 py-2">
            <div className="text-xs text-slate-500">内容价值</div>
            <div className="text-lg font-semibold text-ink">{idea.contentValue}</div>
          </div>
          <div className="rounded-md bg-slate-50 px-3 py-2">
            <div className="text-xs text-slate-500">产品化</div>
            <div className="text-lg font-semibold text-ink">{idea.productizationLevel}</div>
          </div>
        </div>

        {tags.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.slice(0, 5).map((tag) => (
              <span key={tag} className="text-xs text-slate-500">
                #{tag}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" />
            存入 {formatDate(idea.createdAt)}，已沉淀 {days} 天
          </span>
          {reminder ? <span className="font-medium text-bank-700">{reminder.message}</span> : null}
        </div>
      </Card>
    </Link>
  );
}
