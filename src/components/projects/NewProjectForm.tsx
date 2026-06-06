"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function NewProjectForm({ ideas }: { ideas: { id: string; title: string; currentValue: number; type: string }[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { showToast, Toast } = useToast();

  function toggle(id: string) {
    setSelected((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]);
  }

  async function createProject() {
    if (selected.length < 2) {
      showToast("至少选择 2 条灵感", "error");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ideaIds: selected })
      });
      const data = await response.json();
      if (!response.ok) throw new Error("failed");
      if (data.warning) showToast(data.warning, "info");
      router.push(`/projects/${data.project.id}`);
    } catch {
      showToast("项目种子生成失败", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <Toast />
      <div className="grid gap-3">
        {ideas.map((idea) => (
          <label key={idea.id} className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-asset hover:border-bank-200">
            <span>
              <span className="block text-sm font-semibold text-ink">{idea.title}</span>
              <span className="mt-1 block text-xs text-slate-500">{idea.type} · 启发性估值 {idea.currentValue}</span>
            </span>
            <input type="checkbox" checked={selected.includes(idea.id)} onChange={() => toggle(idea.id)} className="h-4 w-4" />
          </label>
        ))}
      </div>
      <Button onClick={createProject} disabled={loading}>{loading ? "生成中..." : "合并为项目种子"}</Button>
    </div>
  );
}
