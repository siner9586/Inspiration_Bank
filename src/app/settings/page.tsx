import { SettingsForm } from "@/components/idea/SettingsForm";
import { getOrCreateUserSettings } from "@/lib/ideas/service";
import { getAiRuntimeConfig } from "@/lib/ai/runtime-config";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await getOrCreateUserSettings();
  const runtime = getAiRuntimeConfig();
  return (
    <div className="space-y-6">
      <SettingsForm settings={settings} />
      <Card className="max-w-4xl">
        <CardHeader>
          <h2 className="text-xl font-semibold text-ink">智能引擎设置</h2>
          <p className="mt-1 text-sm text-slate-500">当前版本从环境变量读取配置，默认强调 zero-cost 本地规则引擎。</p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs text-slate-500">当前默认 Provider</div>
              <div className="mt-2 font-semibold text-ink">{runtime.currentProvider}</div>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs text-slate-500">Cron 默认 Provider</div>
              <div className="mt-2 font-semibold text-ink">{runtime.cronProvider}</div>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs text-slate-500">是否启用外部 API</div>
              <div className="mt-2">
                <Badge tone={runtime.externalApiEnabled ? "red" : "slate"}>
                  {runtime.externalApiEnabled ? "已启用" : "未启用"}
                </Badge>
              </div>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs text-slate-500">是否启用 zero-cost provider</div>
              <div className="mt-2">
                <Badge tone={runtime.zeroCostEnabled ? "green" : "gold"}>
                  {runtime.zeroCostEnabled ? "已启用" : "未作为当前路由"}
                </Badge>
              </div>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs text-slate-500">是否允许 cron 使用付费 provider</div>
              <div className="mt-2">
                <Badge tone={runtime.allowCronPaidProvider ? "red" : "green"}>
                  {runtime.allowCronPaidProvider ? "允许，可能产生费用" : "不允许，默认 zero-cost"}
                </Badge>
              </div>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs text-slate-500">本地 Ollama 状态</div>
              <div className="mt-2 text-sm font-semibold text-ink">可选：{runtime.ollamaBaseUrl}</div>
            </div>
          </div>
          {runtime.warnings.length ? (
            <div className="mt-4 rounded-md border border-gold-100 bg-gold-50 p-4 text-sm leading-6 text-slate-700">
              {runtime.warnings.map((warning) => (
                <div key={warning}>{warning}</div>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
