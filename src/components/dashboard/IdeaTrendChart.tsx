"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type TrendPoint = {
  date: string;
  value: number;
  count: number;
};

export function IdeaTrendChart({ data }: { data: TrendPoint[] }) {
  return (
    <Card>
      <CardHeader>
        <div className="text-base font-semibold text-ink">灵感资产趋势</div>
        <div className="mt-1 text-sm text-slate-500">最近 14 天新增灵感的启发性估值走势</div>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ left: 0, right: 6, top: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="assetValue" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#2f7669" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#2f7669" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip
                formatter={(value, name) => [
                  name === "value" ? `￥${Number(value).toLocaleString("zh-CN")}` : value,
                  name === "value" ? "启发性估值" : "灵感数"
                ]}
                labelClassName="text-slate-600"
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#1d5149"
                strokeWidth={2}
                fill="url(#assetValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
