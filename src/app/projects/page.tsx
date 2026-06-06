import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { prisma } from "@/lib/db/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await prisma.projectSeed.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-semibold text-ink">项目种子</h1>
          <p className="mt-2 text-sm text-slate-600">把相关灵感合并为小而可验证的 MVP 项目。</p>
        </div>
        <Link href="/projects/new"><Button><PlusCircle className="h-4 w-4" />新建项目种子</Button></Link>
      </div>
      {projects.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="h-full hover:border-bank-200">
                <CardHeader>
                  <div className="text-base font-semibold text-ink">{project.name}</div>
                  <div className="mt-1 text-sm text-slate-500">{project.status}</div>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-3 text-sm leading-6 text-slate-600">{project.positioning || project.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="p-10 text-center">
          <div className="text-lg font-semibold text-ink">还没有项目种子</div>
          <p className="mt-2 text-sm text-slate-500">选择 2 条以上相关灵感，先生成一个可执行 MVP。</p>
        </Card>
      )}
    </div>
  );
}
