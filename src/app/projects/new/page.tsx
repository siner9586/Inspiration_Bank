import { prisma } from "@/lib/db/client";
import { NewProjectForm } from "@/components/projects/NewProjectForm";

export const dynamic = "force-dynamic";

export default async function NewProjectPage() {
  const ideas = await prisma.idea.findMany({
    where: { status: { notIn: ["archived", "converted"] } },
    orderBy: [{ currentValue: "desc" }, { createdAt: "desc" }],
    take: 30,
    select: { id: true, title: true, currentValue: true, type: true }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">新建项目种子</h1>
        <p className="mt-2 text-sm text-slate-600">只合并相关灵感；相关性弱时系统会提醒不要强行做大项目。</p>
      </div>
      <NewProjectForm ideas={ideas} />
    </div>
  );
}
