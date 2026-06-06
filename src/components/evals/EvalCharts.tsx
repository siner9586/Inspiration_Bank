"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type EnginePoint = {
  engine: string;
  actionability: number;
  titleQuality: number;
  contentUsefulness: number;
  explainability: number;
};

type LatencyPoint = {
  name: string;
  mock?: number;
  "zero-cost"?: number;
  ollama?: number;
};

type ValuePoint = {
  engine: string;
  currentValue: number;
  commercialValue: number;
  contentValue: number;
};

type CostPoint = {
  engine: string;
  apiCost: number;
  estimatedSaved: number;
  costPer1000: number;
};

export function EvalCharts({
  engineQuality,
  latency,
  valueDistribution,
  costComparison
}: {
  engineQuality: EnginePoint[];
  latency: LatencyPoint[];
  valueDistribution: ValuePoint[];
  costComparison: CostPoint[];
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <div className="text-base font-semibold text-ink">引擎质量对比</div>
          <div className="mt-1 text-sm text-slate-500">行动性、标题质量、内容可用性和可解释性</div>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={engineQuality} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="engine" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="actionability" name="行动性" fill="#1d5149" radius={[4, 4, 0, 0]} />
                <Bar dataKey="titleQuality" name="标题质量" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="contentUsefulness" name="内容可用性" fill="#d7a83b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="explainability" name="可解释性" fill="#64748b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="text-base font-semibold text-ink">延迟分布</div>
          <div className="mt-1 text-sm text-slate-500">样本执行耗时，单位 ms</div>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={latency} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip />
                <Line type="monotone" dataKey="mock" name="mock" stroke="#64748b" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="zero-cost" name="zero-cost" stroke="#1d5149" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="ollama" name="ollama" stroke="#2563eb" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="text-base font-semibold text-ink">价值分布</div>
          <div className="mt-1 text-sm text-slate-500">启发性估值、商业价值和内容价值</div>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={valueDistribution} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="engine" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="currentValue" name="当前启发性估值" fill="#1d5149" radius={[4, 4, 0, 0]} />
                <Bar dataKey="commercialValue" name="商业价值" fill="#d7a83b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="contentValue" name="内容价值" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="text-base font-semibold text-ink">成本对比</div>
          <div className="mt-1 text-sm text-slate-500">API 成本和估算节省，单位 USD</div>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costComparison} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="engine" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="apiCost" name="API 成本估算" fill="#64748b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="estimatedSaved" name="估算节省" fill="#1d5149" radius={[4, 4, 0, 0]} />
                <Bar dataKey="costPer1000" name="1000 条成本估算" fill="#d7a83b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
