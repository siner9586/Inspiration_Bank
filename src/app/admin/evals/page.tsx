import fs from "node:fs/promises";
import path from "node:path";
import { differenceInCalendarDays, startOfMonth } from "date-fns";
import { Activity, BadgeCheck, Clock3, Gauge, ShieldCheck, WalletCards } from "lucide-react";
import { EvalCharts } from "@/components/evals/EvalCharts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { prisma } from "@/lib/db/client";
import { buildCostSavingSnapshot } from "@/lib/ai/cost-saving";
import { getAiRuntimeConfig } from "@/lib/ai/runtime-config";

export const dynamic = "force-dynamic";

type EvalRow = {
  index: number;
  title: string;
  type: string;
  provider: string;
  model: string;
  engineType: string;
  schemaValid: boolean;
  latencyMs: number;
  titleCount: number;
  commercialValue: number | null;
  contentValue: number | null;
  currentValue: number | null;
  status: "ok" | "error";
  errorMessage: string;
  actionabilityScore: number;
  titleQualityScore: number;
  contentUsefulnessScore: number;
  overhypeRiskScore: number;
  apiCost: number;
  estimatedSavedCost: number;
  ruleHitCount: number;
  templateHitCount: number;
  lexiconHitCount: number;
  fallbackUsed: boolean;
  explainabilityScore: number;
};

type EvalResult = {
  createdAt: string;
  provider: string;
  model: string;
  engineType?: string;
  summary: {
    total: number;
    schemaValid: number;
    schemaPassRate?: number;
    avgLatencyMs: number;
    avgActionabilityScore: number;
    avgTitleQualityScore: number;
    avgOverhypeRiskScore: number;
    avgCommercialValue?: number;
    avgContentValue?: number;
    avgCurrentValue?: number;
    avgContentUsefulnessScore?: number;
    avgExplainabilityScore?: number;
    zeroCostSaving?: number;
    apiCost?: number;
  };
  rows: EvalRow[];
};

async function loadEvalResults() {
  const resultsDir = path.resolve(process.cwd(), "evals/results");
  try {
    const files = (await fs.readdir(resultsDir)).filter((file) => file.endsWith(".json"));
    const results = await Promise.all(
      files.map(async (file) => {
        const raw = await fs.readFile(path.join(resultsDir, file), "utf8");
        return { file, data: JSON.parse(raw) as EvalResult };
      })
    );
    return results.sort((a, b) => Date.parse(b.data.createdAt) - Date.parse(a.data.createdAt));
  } catch {
    return [];
  }
}

function formatUsd(value?: number | null) {
  return `$${(value ?? 0).toFixed(4)}`;
}

function pct(valid: number, total: number) {
  return total ? `${Math.round((valid / total) * 100)}%` : "0%";
}

function latestByEngine(results: Array<{ file: string; data: EvalResult }>) {
  const map = new Map<string, EvalResult>();
  for (const result of results) {
    const engine = result.data.engineType || result.data.provider;
    if (!map.has(engine)) map.set(engine, result.data);
  }
  return Array.from(map.entries()).map(([engine, data]) => ({ engine, data }));
}

function Stat({
  label,
  value,
  hint,
  icon: Icon
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: typeof Activity;
}) {
  return (
    <Card className="p-5 transition hover:-translate-y-0.5 hover:border-bank-200">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-sm text-slate-500">{label}</div>
          <div className="mt-2 text-2xl font-semibold tracking-normal text-ink">{value}</div>
          {hint ? <div className="mt-2 text-xs text-slate-500">{hint}</div> : null}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-bank-50 text-bank-700">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}

export default async function EvalsPage() {
  const results = await loadEvalResults();
  const latest = results[0]?.data;
  const latestFile = results[0]?.file;
  const engines = latestByEngine(results);
  const config = getAiRuntimeConfig();
  const localRunsThisMonth = await prisma.aiCallLog.count({
    where: {
      provider: { in: ["zero-cost", "mock", "ollama"] },
      createdAt: { gte: startOfMonth(new Date()) },
      success: true
    }
  });
  const costSnapshot = buildCostSavingSnapshot({
    currentProvider: config.currentProvider,
    currentModel: process.env.AI_MODEL,
    localRunsThisMonth
  });
  const firstZeroResult = results
    .filter((item) => (item.data.engineType || item.data.provider) === "zero-cost")
    .at(-1);
  const zeroCostDays = firstZeroResult
    ? Math.max(0, differenceInCalendarDays(new Date(), new Date(firstZeroResult.data.createdAt)))
    : 0;
  const rows = latest?.rows ?? [];
  const failures = rows.filter(
    (row) =>
      !row.schemaValid ||
      row.fallbackUsed ||
      row.status === "error" ||
      row.actionabilityScore < 55 ||
      row.titleCount === 0
  );

  const engineQuality = engines.map(({ engine, data }) => ({
    engine,
    actionability: data.summary.avgActionabilityScore,
    titleQuality: data.summary.avgTitleQualityScore,
    contentUsefulness: data.summary.avgContentUsefulnessScore ?? 0,
    explainability: data.summary.avgExplainabilityScore ?? 0
  }));
  const latency = rows.map((row, index) => ({
    name: String(index + 1),
    [row.engineType]: row.latencyMs
  }));
  const valueDistribution = engines.map(({ engine, data }) => ({
    engine,
    currentValue: data.summary.avgCurrentValue ?? 0,
    commercialValue: data.summary.avgCommercialValue ?? 0,
    contentValue: data.summary.avgContentValue ?? 0
  }));
  const costComparison = engines.map(({ engine, data }) => ({
    engine,
    apiCost: data.summary.apiCost ?? 0,
    estimatedSaved: data.summary.zeroCostSaving ?? 0,
    costPer1000: engine === "zero-cost" || engine === "mock" || engine === "ollama" ? 0 : data.summary.apiCost ?? 0
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <h1 className="text-2xl font-semibold text-ink">智能引擎评测中心</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            在不花钱的前提下，比较 mock、规则引擎、本地模型和外部模型的灵感分析质量。
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone="green">当前默认引擎：{config.currentProvider}</Badge>
          <Badge tone="gold">API 成本：￥0 估算值</Badge>
          <Badge tone="blue">可离线运行：{config.currentProvider === "zero-cost" ? "是" : "视配置而定"}</Badge>
          <Badge tone={config.externalApiEnabled ? "red" : "slate"}>
            外部 API：{config.externalApiEnabled ? "已启用" : "未启用"}
          </Badge>
        </div>
      </div>

      {config.warnings.length ? (
        <Card className="border-gold-100 bg-gold-50/70 p-4 text-sm leading-6 text-slate-700 shadow-none">
          {config.warnings.map((warning) => (
            <div key={warning}>{warning}</div>
          ))}
        </Card>
      ) : null}

      {!latest ? (
        <Card className="p-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-bank-50 text-bank-700">
            <Gauge className="h-6 w-6" />
          </div>
          <div className="mt-4 text-lg font-semibold text-ink">还没有评测结果</div>
          <p className="mt-2 text-sm text-slate-500">运行 pnpm run eval:zero 后，这里会展示 zero-cost 规则引擎表现。</p>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Stat label="样本总数" value={latest.summary.total} hint={latestFile} icon={Activity} />
            <Stat label="Schema 通过率" value={pct(latest.summary.schemaValid, latest.summary.total)} icon={BadgeCheck} />
            <Stat label="平均延迟" value={`${latest.summary.avgLatencyMs}ms`} icon={Clock3} />
            <Stat label="平均行动性" value={latest.summary.avgActionabilityScore} icon={Gauge} />
            <Stat label="平均标题质量" value={latest.summary.avgTitleQualityScore} icon={ShieldCheck} />
            <Stat label="平均夸大风险" value={latest.summary.avgOverhypeRiskScore} hint="越低越克制" icon={ShieldCheck} />
            <Stat label="估算节省成本" value={formatUsd(latest.summary.zeroCostSaving)} hint="估算值" icon={WalletCards} />
            <Stat label="零成本运行天数" value={zeroCostDays} hint="按本地评测结果估算" icon={Activity} />
          </div>

          <EvalCharts
            engineQuality={engineQuality}
            latency={latency}
            valueDistribution={valueDistribution}
            costComparison={costComparison}
          />

          <Card>
            <CardHeader>
              <div className="text-base font-semibold text-ink">成本节省</div>
              <div className="mt-1 text-sm text-slate-500">所有金额均为估算值，zero-cost 当前设计不调用付费 AI API</div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs text-slate-500">当前默认引擎 API 成本估算</div>
                  <div className="mt-2 text-xl font-semibold text-ink">￥0</div>
                </div>
                <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs text-slate-500">单条灵感分析估算节省</div>
                  <div className="mt-2 text-xl font-semibold text-ink">{formatUsd(costSnapshot.oneIdeaSaved.savedCost)}</div>
                </div>
                <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs text-slate-500">每天 10 条估算节省</div>
                  <div className="mt-2 text-xl font-semibold text-ink">{formatUsd(costSnapshot.tenPerDaySaved.savedCost)}</div>
                </div>
                <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs text-slate-500">每天 100 条估算节省</div>
                  <div className="mt-2 text-xl font-semibold text-ink">{formatUsd(costSnapshot.hundredPerDaySaved.savedCost)}</div>
                </div>
                <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs text-slate-500">每月 1000 条估算节省</div>
                  <div className="mt-2 text-xl font-semibold text-ink">{formatUsd(costSnapshot.thousandMonthlySaved.savedCost)}</div>
                </div>
                <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs text-slate-500">本月本地生成次数</div>
                  <div className="mt-2 text-xl font-semibold text-ink">{costSnapshot.localRunsThisMonth}</div>
                </div>
                <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs text-slate-500">本月估算节省 API 费用</div>
                  <div className="mt-2 text-xl font-semibold text-ink">{formatUsd(costSnapshot.monthlySaved.savedCost)}</div>
                </div>
                <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs text-slate-500">外部模型月成本对比估算</div>
                  <div className="mt-2 text-xl font-semibold text-ink">
                    {costSnapshot.monthlyExternal.estimate.known
                      ? formatUsd(costSnapshot.monthlyExternal.estimate.totalCost)
                      : "unknown"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="text-base font-semibold text-ink">样本详情</div>
              <div className="mt-1 text-sm text-slate-500">当前展示最新结果：{latest.provider} / {latest.model}</div>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full min-w-[980px] border-separate border-spacing-0 text-sm">
                <thead>
                  <tr className="text-left text-xs text-slate-500">
                    <th className="border-b border-slate-100 px-3 py-3">sample title</th>
                    <th className="border-b border-slate-100 px-3 py-3">idea type</th>
                    <th className="border-b border-slate-100 px-3 py-3">engine/provider</th>
                    <th className="border-b border-slate-100 px-3 py-3">schemaValid</th>
                    <th className="border-b border-slate-100 px-3 py-3">latencyMs</th>
                    <th className="border-b border-slate-100 px-3 py-3">启发性估值</th>
                    <th className="border-b border-slate-100 px-3 py-3">titleCount</th>
                    <th className="border-b border-slate-100 px-3 py-3">fallbackUsed</th>
                    <th className="border-b border-slate-100 px-3 py-3">ruleHitCount</th>
                    <th className="border-b border-slate-100 px-3 py-3">errorMessage</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={`${row.index}-${row.title}`} className="transition hover:bg-slate-50">
                      <td className="border-b border-slate-100 px-3 py-3 font-medium text-ink">{row.title}</td>
                      <td className="border-b border-slate-100 px-3 py-3 text-slate-600">{row.type}</td>
                      <td className="border-b border-slate-100 px-3 py-3 text-slate-600">{row.engineType}</td>
                      <td className="border-b border-slate-100 px-3 py-3">
                        <Badge tone={row.schemaValid ? "green" : "red"}>{row.schemaValid ? "valid" : "invalid"}</Badge>
                      </td>
                      <td className="border-b border-slate-100 px-3 py-3 text-slate-600">{row.latencyMs}</td>
                      <td className="border-b border-slate-100 px-3 py-3 text-slate-600">{row.currentValue ?? "-"}</td>
                      <td className="border-b border-slate-100 px-3 py-3 text-slate-600">{row.titleCount}</td>
                      <td className="border-b border-slate-100 px-3 py-3">
                        <Badge tone={row.fallbackUsed ? "gold" : "slate"}>{row.fallbackUsed ? "yes" : "no"}</Badge>
                      </td>
                      <td className="border-b border-slate-100 px-3 py-3 text-slate-600">{row.ruleHitCount}</td>
                      <td className="border-b border-slate-100 px-3 py-3 text-slate-500">{row.errorMessage || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="text-base font-semibold text-ink">失败样本区</div>
              <div className="mt-1 text-sm text-slate-500">schema invalid、fallback used、empty output、low actionability 会出现在这里</div>
            </CardHeader>
            <CardContent>
              {failures.length ? (
                <div className="space-y-3">
                  {failures.map((row) => (
                    <div key={`${row.index}-${row.title}`} className="rounded-md border border-slate-200 bg-slate-50 p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="font-medium text-ink">{row.title}</div>
                        {!row.schemaValid ? <Badge tone="red">schema invalid</Badge> : null}
                        {row.fallbackUsed ? <Badge tone="gold">fallback used</Badge> : null}
                        {row.titleCount === 0 ? <Badge tone="red">empty output</Badge> : null}
                        {row.actionabilityScore < 55 ? <Badge tone="red">low actionability</Badge> : null}
                      </div>
                      <p className="mt-2 text-sm text-slate-500">{row.errorMessage || "需要继续观察或优化规则。"}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-md bg-slate-50 p-4 text-sm text-slate-500">暂无失败样本。</div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
