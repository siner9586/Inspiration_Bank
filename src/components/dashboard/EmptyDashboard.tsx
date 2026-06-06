"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Database, PlusCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { demoIdeas } from "@/lib/ideas/demo-data";
import { ideaTypeLabels } from "@/types/idea";
import { useToast } from "@/components/ui/toast";

export function EmptyDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { showToast, Toast } = useToast();

  async function seedDemo() {
    setLoading(true);
    try {
      const response = await fetch("/api/demo/seed", { method: "POST" });
      if (!response.ok) throw new Error("seed failed");
      showToast("已导入 3 条示例灵感");
      router.refresh();
    } catch {
      showToast("示例导入失败，请稍后重试", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-8">
      <Toast />
      <div className="mx-auto max-w-3xl text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-md bg-bank-900 text-gold-100">
          <Database className="h-7 w-7" />
        </div>
        <h1 className="mt-5 text-2xl font-semibold text-ink">你的灵感账户还是空的</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          还没有灵感，存入你的第一个想法。默认使用本地规则引擎完成智能拆解、启发性估值、利息建议和内容转化。
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/new">
            <Button>
              <PlusCircle className="h-4 w-4" />
              存入灵感
            </Button>
          </Link>
          <Button variant="secondary" onClick={seedDemo} disabled={loading}>
            <Database className="h-4 w-4" />
            {loading ? "导入中..." : "导入 3 条示例"}
          </Button>
        </div>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {demoIdeas.map((idea) => (
          <div key={idea.title} className="rounded-md border border-slate-200 bg-slate-50 p-4 text-left">
            <div className="text-sm font-semibold text-ink">{idea.title}</div>
            <div className="mt-2 text-xs text-bank-700">{ideaTypeLabels[idea.type]}</div>
            <p className="mt-3 line-clamp-4 text-sm leading-6 text-slate-600">{idea.rawContent}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
