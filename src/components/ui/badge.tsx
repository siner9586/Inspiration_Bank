import * as React from "react";
import { cn } from "@/lib/utils/cn";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "slate" | "green" | "gold" | "blue" | "red";
};

const tones = {
  slate: "bg-slate-100 text-slate-700",
  green: "bg-bank-100 text-bank-900",
  gold: "bg-gold-50 text-gold-600",
  blue: "bg-blue-50 text-blue-700",
  red: "bg-red-50 text-red-700"
};

export function Badge({ className, tone = "slate", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
