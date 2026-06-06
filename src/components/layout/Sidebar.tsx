"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpenText,
  FileText,
  FolderKanban,
  Gauge,
  Lightbulb,
  PlusCircle,
  Settings,
  Sparkles,
  Target
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const navGroups = [
  {
    title: "工作台",
    items: [
      { href: "/", label: "灵感资产", icon: BarChart3 },
      { href: "/actions", label: "今日行动", icon: Target },
      { href: "/new", label: "存入灵感", icon: PlusCircle }
    ]
  },
  {
    title: "资产",
    items: [
      { href: "/ideas", label: "灵感列表", icon: Lightbulb },
      { href: "/outputs", label: "内容草稿", icon: FileText },
      { href: "/projects", label: "项目种子", icon: FolderKanban },
      { href: "/insights", label: "资产复盘", icon: Sparkles }
    ]
  },
  {
    title: "自动化",
    items: [
      { href: "/reports/weekly", label: "灵感周报", icon: BookOpenText },
      { href: "/admin/evals", label: "智能评测", icon: Gauge }
    ]
  },
  {
    title: "设置",
    items: [{ href: "/settings", label: "方向设置", icon: Settings }]
  }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-slate-200 bg-white/92 px-4 py-5 backdrop-blur lg:block">
      <Link href="/" className="mb-7 flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-bank-900 text-gold-100">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <div className="text-base font-semibold text-ink">灵感银行</div>
          <div className="text-xs text-slate-500">思想资产操作系统</div>
        </div>
      </Link>

      <nav className="space-y-5">
        {navGroups.map((group) => (
          <div key={group.title}>
            <div className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              {group.title}
            </div>
            <div className="space-y-1">
              {group.items.map((item) => {
                const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-ink",
                      active && "bg-bank-50 text-bank-900"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="absolute bottom-5 left-4 right-4 rounded-lg border border-bank-100 bg-bank-50 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-semibold text-ink">零成本模式</div>
          <span className="rounded-full bg-white px-2 py-1 text-xs font-medium text-bank-700">API ￥0</span>
        </div>
        <p className="mt-2 text-xs leading-5 text-slate-600">默认使用本地规则引擎，启发性估值只用于复盘和优先级判断。</p>
      </div>
    </aside>
  );
}
