import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-slate-500">{label}</div>
          <div className="mt-2 text-2xl font-semibold tracking-normal text-ink">{value}</div>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-md bg-bank-50 text-bank-700">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {hint ? <div className="mt-3 text-xs text-slate-500">{hint}</div> : null}
    </Card>
  );
}
