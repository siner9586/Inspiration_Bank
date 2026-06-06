import Link from "next/link";
import type { Idea } from "@prisma/client";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/utils/money";
import { truncateText } from "@/lib/utils/text";

export function RecommendedIdeas({ ideas }: { ideas: Idea[] }) {
  return (
    <Card>
      <CardHeader>
        <div className="text-base font-semibold text-ink">推荐今天处理</div>
        <div className="mt-1 text-sm text-slate-500">优先看可行动、高估值或已沉淀的灵感</div>
      </CardHeader>
      <CardContent className="space-y-3">
        {ideas.length ? (
          ideas.map((idea) => (
            <Link
              key={idea.id}
              href={`/ideas/${idea.id}`}
              className="flex items-center justify-between gap-4 rounded-md border border-slate-100 p-4 transition hover:border-bank-200 hover:bg-bank-50/50"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="truncate text-sm font-semibold text-ink">{idea.title}</div>
                  <Badge tone={idea.priority === "高" ? "gold" : "green"}>{idea.priority}优先级</Badge>
                </div>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                  {truncateText(idea.nextMinimalAction || idea.summary, 96)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="text-sm font-semibold text-bank-900">{formatMoney(idea.currentValue)}</span>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </div>
            </Link>
          ))
        ) : (
          <div className="rounded-md bg-slate-50 p-4 text-sm text-slate-500">暂无推荐，先存入一个灵感。</div>
        )}
      </CardContent>
    </Card>
  );
}
