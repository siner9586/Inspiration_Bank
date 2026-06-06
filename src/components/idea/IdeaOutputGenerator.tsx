"use client";

import type { IdeaOutput } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Copy, FileText, WandSparkles } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/field";
import { outputTypeLabels, outputTypes, type OutputType } from "@/types/idea";
import { useToast } from "@/components/ui/toast";

export function IdeaOutputGenerator({
  ideaId,
  outputs
}: {
  ideaId: string;
  outputs: IdeaOutput[];
}) {
  const router = useRouter();
  const [outputType, setOutputType] = useState<OutputType>("x_tweet");
  const [loading, setLoading] = useState(false);
  const { showToast, Toast } = useToast();

  async function generate() {
    setLoading(true);
    try {
      const response = await fetch(`/api/ideas/${ideaId}/outputs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outputType })
      });
      if (!response.ok) throw new Error("generate output failed");
      showToast("内容草稿已生成");
      router.refresh();
    } catch {
      showToast("草稿生成失败，请稍后重试", "error");
    } finally {
      setLoading(false);
    }
  }

  async function copy(content: string) {
    await navigator.clipboard.writeText(content);
    showToast("已复制草稿");
  }

  return (
    <Card>
      <Toast />
      <CardHeader>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="text-base font-semibold text-ink">内容转化</div>
            <div className="mt-1 text-sm text-slate-500">把灵感转成可复制的内容或项目草稿</div>
          </div>
          <div className="flex gap-2">
            <Select
              value={outputType}
              onChange={(event) => setOutputType(event.target.value as OutputType)}
              className="w-56"
            >
              {outputTypes.map((type) => (
                <option key={type} value={type}>
                  {outputTypeLabels[type]}
                </option>
              ))}
            </Select>
            <Button onClick={generate} disabled={loading}>
              <WandSparkles className="h-4 w-4" />
              {loading ? "生成中..." : "生成草稿"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {outputs.length ? (
          outputs.map((output) => (
            <div key={output.id} className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                    <FileText className="h-4 w-4" />
                    {output.title}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {outputTypeLabels[output.outputType as OutputType] ?? output.outputType}
                  </div>
                </div>
                <Button variant="secondary" size="sm" onClick={() => copy(output.content)}>
                  <Copy className="h-4 w-4" />
                  复制
                </Button>
              </div>
              <pre className="mt-4 whitespace-pre-wrap rounded-md bg-white p-4 text-sm leading-6 text-slate-700">
                {output.content}
              </pre>
            </div>
          ))
        ) : (
          <div className="rounded-md bg-slate-50 p-4 text-sm text-slate-500">
            暂无草稿。选择输出类型后点击“生成草稿”。
          </div>
        )}
      </CardContent>
    </Card>
  );
}
