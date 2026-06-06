import type { IdeaInterest } from "@prisma/client";
import { Clock3 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils/date";

export function IdeaInterestTimeline({ interests }: { interests: IdeaInterest[] }) {
  return (
    <Card>
      <CardHeader>
        <div className="text-base font-semibold text-ink">灵感利息记录</div>
        <div className="mt-1 text-sm text-slate-500">利息不是钱，而是系统生成的新用途与行动建议</div>
      </CardHeader>
      <CardContent>
        {interests.length ? (
          <div className="space-y-4">
            {interests.map((interest) => (
              <div key={interest.id} className="relative border-l border-bank-200 pl-5">
                <div className="absolute -left-2 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-bank-700">
                  <Clock3 className="h-2.5 w-2.5 text-white" />
                </div>
                <div className="text-sm font-semibold text-ink">{interest.interestType}</div>
                <div className="mt-1 text-xs text-slate-500">
                  已沉淀 {interest.daysSinceCreated} 天
                  {interest.milestone ? ` · ${interest.milestone}` : ""} · {formatDateTime(interest.createdAt)}
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{interest.content}</p>
                <div className="mt-2 rounded-md bg-bank-50 px-3 py-2 text-sm text-bank-900">
                  {interest.suggestedAction}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-md bg-slate-50 p-4 text-sm text-slate-500">
            还没有利息，沉淀一段时间后它会自动出现；也可以手动生成一次利息建议。
          </div>
        )}
      </CardContent>
    </Card>
  );
}
