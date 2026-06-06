import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/client";
import { parseJsonList } from "@/lib/projects/roadmap";
import { generateProjectReadme } from "@/lib/projects/readme-generator";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MarkdownExportBox } from "@/components/reports/MarkdownExportBox";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

export default async function ProjectDetailPage({ params }: PageProps) {
  const { id } = await params;
  const project = await prisma.projectSeed.findUnique({ where: { id } });
  if (!project) notFound();

  const relatedIds = parseJsonList(project.relatedIdeaIds);
  const relatedIdeas = await prisma.idea.findMany({ where: { id: { in: relatedIds } } });
  const mvp = parseJsonList(project.mvpScope);
  const roadmap = parseJsonList(project.roadmap);
  const markdown = generateProjectReadme(project);

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm text-slate-500">项目状态：{project.status}</div>
        <h1 className="mt-2 text-2xl font-semibold text-ink">{project.name}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">{project.positioning}</p>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <Card>
          <CardHeader><div className="text-base font-semibold text-ink">项目卡片</div></CardHeader>
          <CardContent className="space-y-4 text-sm leading-6 text-slate-700">
            <div><strong>用户痛点：</strong>{project.problem}</div>
            <div><strong>解决方案：</strong>{project.solution}</div>
            <div>
              <strong>MVP checklist：</strong>
              <ul className="mt-2 list-disc space-y-1 pl-5">{mvp.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
            <div>
              <strong>后续路线图：</strong>
              <ul className="mt-2 list-disc space-y-1 pl-5">{roadmap.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><div className="text-base font-semibold text-ink">关联灵感</div></CardHeader>
          <CardContent className="space-y-3">
            {relatedIdeas.map((idea) => (
              <div key={idea.id} className="rounded-md bg-slate-50 p-3 text-sm">
                <div className="font-semibold text-ink">{idea.title}</div>
                <div className="mt-1 text-slate-500">启发性估值 {idea.currentValue}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader><div className="text-base font-semibold text-ink">README 导出</div></CardHeader>
        <CardContent><MarkdownExportBox markdown={markdown} filename={`${project.name}.md`} /></CardContent>
      </Card>
    </div>
  );
}
