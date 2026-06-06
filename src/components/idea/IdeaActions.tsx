"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Archive, CheckCircle2, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function IdeaActions({ ideaId }: { ideaId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const { showToast, Toast } = useToast();

  async function post(path: string, message: string) {
    setLoading(path);
    try {
      const response = await fetch(path, { method: "POST" });
      if (!response.ok) throw new Error(path);
      showToast(message);
      router.refresh();
    } catch {
      showToast("操作失败，请稍后重试", "error");
    } finally {
      setLoading(null);
    }
  }

  async function setStatus(status: string, message: string) {
    setLoading(status);
    try {
      const response = await fetch(`/api/ideas/${ideaId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (!response.ok) throw new Error(status);
      showToast(message);
      router.refresh();
    } catch {
      showToast("状态更新失败", "error");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Toast />
      <Button
        variant="secondary"
        onClick={() => post(`/api/ideas/${ideaId}/analyze`, "已完成重新估值")}
        disabled={Boolean(loading)}
      >
        <RefreshCw className="h-4 w-4" />
        {loading === `/api/ideas/${ideaId}/analyze` ? "分析中..." : "重新估值"}
      </Button>
      <Button
        onClick={() => post(`/api/ideas/${ideaId}/interest`, "已生成灵感利息")}
        disabled={Boolean(loading)}
      >
        <Sparkles className="h-4 w-4" />
        {loading === `/api/ideas/${ideaId}/interest` ? "生成中..." : "生成灵感利息"}
      </Button>
      <Button variant="secondary" onClick={() => setStatus("actionable", "已标记为可行动")} disabled={Boolean(loading)}>
        <CheckCircle2 className="h-4 w-4" />
        标记为已行动
      </Button>
      <Button variant="secondary" onClick={() => setStatus("converted", "已标记为已转化")} disabled={Boolean(loading)}>
        <CheckCircle2 className="h-4 w-4" />
        已转化
      </Button>
      <Button variant="ghost" onClick={() => setStatus("archived", "已归档")} disabled={Boolean(loading)}>
        <Archive className="h-4 w-4" />
        已归档
      </Button>
    </div>
  );
}
