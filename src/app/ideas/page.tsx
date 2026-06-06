import Link from "next/link";
import { Search } from "lucide-react";
import { listIdeas, getIdeaTags } from "@/lib/ideas/service";
import { IdeaCard } from "@/components/idea/IdeaCard";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/field";
import { ideaStatusLabels, ideaStatuses, ideaTypeLabels, ideaTypes } from "@/types/idea";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function paramValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function IdeasPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = paramValue(params.q) ?? "";
  const type = paramValue(params.type) ?? "all";
  const tag = paramValue(params.tag) ?? "";
  const status = paramValue(params.status) ?? "all";
  const sort = paramValue(params.sort) ?? "newest";

  const [ideas, tags] = await Promise.all([
    listIdeas({ query: q, type, tag, status, sort }),
    getIdeaTags()
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-semibold text-ink">灵感列表</h1>
          <p className="mt-2 text-sm text-slate-600">搜索、筛选和排序你的思想资产。</p>
        </div>
        <Link href="/new">
          <Button>存入灵感</Button>
        </Link>
      </div>

      <form className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-asset md:grid-cols-[1.4fr_1fr_1fr_1fr_1fr_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input name="q" defaultValue={q} placeholder="搜索标题、原文、摘要" className="pl-9" />
        </div>
        <Select name="type" defaultValue={type}>
          <option value="all">全部类型</option>
          {ideaTypes.map((item) => (
            <option key={item} value={item}>
              {ideaTypeLabels[item]}
            </option>
          ))}
        </Select>
        <Select name="tag" defaultValue={tag}>
          <option value="">全部标签</option>
          {tags.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>
        <Select name="status" defaultValue={status}>
          <option value="all">全部状态</option>
          {ideaStatuses.map((item) => (
            <option key={item} value={item}>
              {ideaStatusLabels[item]}
            </option>
          ))}
        </Select>
        <Select name="sort" defaultValue={sort}>
          <option value="newest">创建时间排序</option>
          <option value="oldest">最早创建</option>
          <option value="value">价值排序</option>
          <option value="priority">优先级排序</option>
        </Select>
        <Button type="submit" variant="secondary">
          筛选
        </Button>
      </form>

      {ideas.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {ideas.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-slate-200 bg-white p-10 text-center shadow-asset">
          <div className="text-lg font-semibold text-ink">没有找到匹配的灵感</div>
          <p className="mt-2 text-sm text-slate-500">调整筛选条件，或存入一个新的灵感。</p>
        </div>
      )}
    </div>
  );
}
