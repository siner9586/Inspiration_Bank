"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type TypePoint = {
  name: string;
  value: number;
};

const colors = ["#1d5149", "#d7a83b", "#2563eb", "#7c3aed", "#dc2626", "#64748b", "#0f766e"];

export function IdeaTypeChart({ data }: { data: TypePoint[] }) {
  return (
    <Card>
      <CardHeader>
        <div className="text-base font-semibold text-ink">灵感类型分布</div>
        <div className="mt-1 text-sm text-slate-500">观察你的思想资产结构</div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-[1fr_160px]">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="value" innerRadius={58} outerRadius={94} paddingAngle={3}>
                  {data.map((entry, index) => (
                    <Cell key={entry.name} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col justify-center gap-2">
            {data.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between gap-3 text-sm">
                <span className="flex min-w-0 items-center gap-2 text-slate-600">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: colors[index % colors.length] }}
                  />
                  <span className="truncate">{item.name}</span>
                </span>
                <span className="font-semibold text-ink">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
