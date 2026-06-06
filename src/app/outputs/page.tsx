import Link from "next/link";
import { FileText } from "lucide-react";
import { prisma } from "@/lib/db/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { outputTypeLabels, type OutputType } from "@/types/idea";
import { formatDateTime } from "@/lib/utils/date";
import { MarkdownExportBox } from "@/components/reports/MarkdownExportBox";

export const dynamic = "force-dynamic";

export default async function OutputsPage() {
  const outputs = await prisma.ideaOutput.findMany({
    orderBy: { createdAt: "desc" },
    include: { idea: true }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">内容草稿</h1>
        <p className="mt-2 text-sm text-slate-600">所有由灵感转化生成的草稿都会保存在这里，并支持复制与下载。</p>
      </div>

      {outputs.length ? (
        <div className="grid gap-4">
          {outputs.map((output) => (
            <Card key={output.id}>
              <CardHeader>
                <div className="flex flex-col justify-between gap-2 md:flex-row md:items-start">
                  <div>
                    <div className="flex items-center gap-2 text-base font-semibold text-ink">
                      <FileText className="h-4 w-4" />
                      {output.title}
                    </div>
                    <div className="mt-1 text-sm text-slate-500">
                      {outputTypeLabels[output.outputType as OutputType] ?? output.outputType} ·{" "}
                      {formatDateTime(output.createdAt)}
                    </div>
                  </div>
                  <Link href={`/ideas/${output.ideaId}`} className="text-sm font-medium text-bank-700">
                    查看灵感
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <pre className="whitespace-pre-wrap rounded-md bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                  {output.content}
                </pre>
                <MarkdownExportBox markdown={output.content} filename={`${output.title}.md`} />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-10 text-center">
          <div className="text-lg font-semibold text-ink">还没有内容草稿</div>
          <p className="mt-2 text-sm text-slate-500">进入任意灵感详情页，选择输出类型并生成草稿。</p>
        </Card>
      )}
    </div>
  );
}
