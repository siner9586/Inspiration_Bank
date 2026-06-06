"use client";

import { useMemo, useState } from "react";
import { Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { buildDownloadFilename } from "@/lib/export/download";
import { exportIdeaForPlatform, exportPlatformLabels, type ExportPlatform } from "@/lib/export/platforms";
import type { ExportIdea } from "@/lib/export/markdown";

const platforms = Object.keys(exportPlatformLabels) as ExportPlatform[];

export function IdeaExportPanel({ idea }: { idea: ExportIdea }) {
  const [platform, setPlatform] = useState<ExportPlatform>("markdown");
  const { showToast, Toast } = useToast();
  const content = useMemo(() => exportIdeaForPlatform(idea, platform), [idea, platform]);

  async function copy() {
    await navigator.clipboard.writeText(content);
    showToast("已复制导出内容");
  }

  function download() {
    const ext = platform === "markdown" || platform === "readme" ? "md" : "txt";
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = buildDownloadFilename(idea.title, ext);
    anchor.click();
    URL.revokeObjectURL(url);
    showToast("已生成下载文件");
  }

  return (
    <div id="exports" className="rounded-lg border border-slate-200 bg-white p-5 shadow-asset">
      <Toast />
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <div className="text-base font-semibold text-ink">一键导出</div>
          <div className="mt-1 text-sm text-slate-500">模板生成，可继续人工润色。</div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={platform} onChange={(event) => setPlatform(event.target.value as ExportPlatform)}>
            {platforms.map((item) => (
              <option key={item} value={item}>{exportPlatformLabels[item]}</option>
            ))}
          </Select>
          <Button size="sm" variant="secondary" onClick={copy}><Copy className="h-4 w-4" />复制</Button>
          <Button size="sm" variant="secondary" onClick={download}><Download className="h-4 w-4" />下载</Button>
        </div>
      </div>
      <pre className="mt-4 max-h-96 overflow-auto whitespace-pre-wrap rounded-md bg-slate-50 p-4 text-sm leading-6 text-slate-700">{content}</pre>
    </div>
  );
}
