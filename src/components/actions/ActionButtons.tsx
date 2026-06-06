"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle2, FastForward, Play, WandSparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function ActionButtons({ ideaId, actionText }: { ideaId: string; actionText: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const { showToast, Toast } = useToast();

  async function mark(status: "done" | "skipped" | "converted") {
    setLoading(status);
    try {
      const response = await fetch("/api/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ideaId, actionType: "today_action", actionText, status })
      });
      if (!response.ok) throw new Error("failed");
      showToast(status === "done" ? "已标记完成" : status === "converted" ? "已标记转化" : "已跳过今天");
      router.refresh();
    } catch {
      showToast("操作失败，请稍后重试", "error");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Toast />
      <Button size="sm" variant="secondary" onClick={() => window.open(`/ideas/${ideaId}`, "_self")}>
        <Play className="h-4 w-4" />
        开始行动
      </Button>
      <Button size="sm" variant="secondary" onClick={() => window.open(`/ideas/${ideaId}#outputs`, "_self")}>
        <WandSparkles className="h-4 w-4" />
        生成草稿
      </Button>
      <Button size="sm" onClick={() => mark("done")} disabled={loading === "done"}>
        <CheckCircle2 className="h-4 w-4" />
        标记完成
      </Button>
      <Button size="sm" variant="ghost" onClick={() => mark("skipped")} disabled={loading === "skipped"}>
        <FastForward className="h-4 w-4" />
        跳过
      </Button>
      <Button size="sm" variant="secondary" onClick={() => mark("converted")} disabled={loading === "converted"}>
        已转化
      </Button>
    </div>
  );
}
