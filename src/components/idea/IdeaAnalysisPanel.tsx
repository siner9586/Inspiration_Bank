import type { Idea, IdeaTitle } from "@prisma/client";
import { AlertTriangle, CheckCircle2, Megaphone, Package, PlayCircle, Users } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toTagList } from "@/lib/utils/text";

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <div className="text-sm font-semibold text-ink">{title}</div>
      <ul className="mt-3 space-y-2">
        {items.length ? (
          items.map((item) => (
            <li key={item} className="rounded-md bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-600">
              {item}
            </li>
          ))
        ) : (
          <li className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-500">暂无</li>
        )}
      </ul>
    </div>
  );
}

export function IdeaAnalysisPanel({ idea, titles }: { idea: Idea; titles: IdeaTitle[] }) {
  const recommendedPlatforms = toTagList(idea.recommendedPlatforms);
  const productSuggestions = toTagList(idea.productSuggestions);
  const requiredResources = toTagList(idea.requiredResources);
  const targetUsers = toTagList(idea.targetUsers);
  const monetizationMethods = toTagList(idea.monetizationMethods);
  const risks = toTagList(idea.risks);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-5">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Megaphone className="h-4 w-4" />
            传播潜力
          </div>
          <div className="mt-3 text-2xl font-semibold text-ink">{idea.viralityLevel}</div>
          <div className="mt-1 text-sm text-slate-500">{idea.viralityScore}/100</div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Package className="h-4 w-4" />
            产品化潜力
          </div>
          <div className="mt-3 text-2xl font-semibold text-ink">{idea.productizationLevel}</div>
          <div className="mt-1 text-sm text-slate-500">{idea.productizationScore}/100</div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <PlayCircle className="h-4 w-4" />
            短视频适配
          </div>
          <div className="mt-3 text-2xl font-semibold text-ink">{idea.shortVideoFit}</div>
          <div className="mt-1 text-sm text-slate-500">长期项目：{idea.longTermFit}</div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <CheckCircle2 className="h-4 w-4" />
            可行性等级
          </div>
          <div className="mt-3 text-2xl font-semibold text-ink">{idea.feasibilityLevel}</div>
          <div className="mt-1 text-sm text-slate-500">风险：{idea.riskLevel}</div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="text-base font-semibold text-ink">下一步最小行动</div>
          <div className="mt-1 text-sm text-slate-500">应能在 30 分钟内启动</div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-gold-100 bg-gold-50 p-4 text-sm leading-6 text-ink">
            {idea.nextMinimalAction || "暂无下一步行动，请重新分析。"}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="text-base font-semibold text-ink">可传播标题</div>
          </CardHeader>
          <CardContent className="space-y-3">
            {titles.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-3 rounded-md bg-slate-50 p-3">
                <div className="text-sm font-medium leading-6 text-ink">{item.title}</div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge tone="green">{item.platform}</Badge>
                  <span className="text-xs text-slate-500">{item.score}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="text-base font-semibold text-ink">平台建议</div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {recommendedPlatforms.map((platform) => (
                <Badge key={platform} tone="blue">
                  {platform}
                </Badge>
              ))}
            </div>
            <div className="mt-5 grid gap-4">
              <ListBlock title="适合做成什么产品" items={productSuggestions} />
              <ListBlock title="可能的变现方式" items={monetizationMethods} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 text-base font-semibold text-ink">
              <Users className="h-4 w-4" />
              目标用户
            </div>
          </CardHeader>
          <CardContent>
            <ListBlock title="可能的目标用户" items={targetUsers} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="text-base font-semibold text-ink">所需资源</div>
          </CardHeader>
          <CardContent>
            <ListBlock title="需要哪些资源" items={requiredResources} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 text-base font-semibold text-ink">
              <AlertTriangle className="h-4 w-4" />
              风险提示
            </div>
          </CardHeader>
          <CardContent>
            <ListBlock title="风险与限制" items={risks} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
