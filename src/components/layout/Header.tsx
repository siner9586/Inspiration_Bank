import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WechatQrPopover } from "@/components/dashboard/WechatQrPopover";
import { getAiRuntimeConfig } from "@/lib/ai/runtime-config";

export function Header() {
  const config = getAiRuntimeConfig();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/82 backdrop-blur">
      <div className="flex min-h-16 items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-ink">灵感银行</div>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
            <span>
              当前引擎：{config.currentProvider} · API 成本：￥0 · 外部模型：{config.externalApiEnabled ? "已启用" : "未启用"}
            </span>
            <WechatQrPopover />
          </div>
        </div>
        <Link href="/new" className="shrink-0">
          <Button size="sm">
            <PlusCircle className="h-4 w-4" />
            存入灵感
          </Button>
        </Link>
      </div>
    </header>
  );
}
