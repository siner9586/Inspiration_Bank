"use client";

import { Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function MarkdownExportBox({ markdown, filename }: { markdown: string; filename: string }) {
  const { showToast, Toast } = useToast();

  async function copy() {
    await navigator.clipboard.writeText(markdown);
    showToast("Markdown 已复制");
  }

  function download() {
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
    showToast("已生成下载文件");
  }

  return (
    <div className="space-y-3">
      <Toast />
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="secondary" onClick={copy}>
          <Copy className="h-4 w-4" />
          复制 Markdown
        </Button>
        <Button size="sm" variant="secondary" onClick={download}>
          <Download className="h-4 w-4" />
          下载 .md
        </Button>
      </div>
      <textarea
        readOnly
        value={markdown}
        className="min-h-96 w-full rounded-md border border-slate-200 bg-slate-50 p-4 font-mono text-xs leading-6 text-slate-700"
      />
    </div>
  );
}
