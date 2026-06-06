import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/db/client";
import { ideaInclude } from "@/lib/ideas/service";
import { IdeaValueCard } from "@/components/idea/IdeaValueCard";
import { IdeaAnalysisPanel } from "@/components/idea/IdeaAnalysisPanel";
import { IdeaInterestTimeline } from "@/components/idea/IdeaInterestTimeline";
import { IdeaOutputGenerator } from "@/components/idea/IdeaOutputGenerator";
import { IdeaActions } from "@/components/idea/IdeaActions";
import { IdeaExportPanel } from "@/components/export/IdeaExportPanel";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ideaStatusLabels, ideaTypeLabels } from "@/types/idea";
import { toTagList } from "@/lib/utils/text";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function IdeaDetailPage({ params }: PageProps) {
  const { id } = await params;
  const idea = await prisma.idea.findUnique({
    where: { id },
    include: ideaInclude
  });

  if (!idea) notFound();

  const tags = toTagList(idea.tags);

  return (
    <div className="space-y-6">
      <Link href="/ideas" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-bank-700">
        <ArrowLeft className="h-4 w-4" />
        返回灵感列表
      </Link>

      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            <Badge tone="green">{ideaTypeLabels[idea.type as keyof typeof ideaTypeLabels] ?? "其他"}</Badge>
            <Badge tone="gold">启发性估值</Badge>
            <Badge tone="slate">{ideaStatusLabels[idea.status as keyof typeof ideaStatusLabels] ?? idea.status}</Badge>
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-normal text-ink">{idea.title}</h1>
          <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-600">{idea.summary}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                #{tag}
              </span>
            ))}
          </div>
        </div>
        <IdeaActions ideaId={idea.id} />
      </div>

      <IdeaValueCard idea={idea} />
      <IdeaExportPanel idea={idea} />

      <Card>
        <CardHeader>
          <div className="text-base font-semibold text-ink">灵感原始记录</div>
          <div className="mt-1 text-sm text-slate-500">来源：{idea.source || "未填写"}</div>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">{idea.rawContent}</p>
        </CardContent>
      </Card>

      <IdeaAnalysisPanel idea={idea} titles={idea.titles} />
      <IdeaInterestTimeline interests={idea.interests} />
      <div id="outputs">
        <IdeaOutputGenerator ideaId={idea.id} outputs={idea.outputs} />
      </div>
    </div>
  );
}
