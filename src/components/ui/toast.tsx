"use client";

import { useCallback, useState } from "react";
import { CheckCircle2, Info, XCircle } from "lucide-react";

type ToastType = "success" | "error" | "info";

type ToastState = {
  type: ToastType;
  message: string;
};

const icons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info
};

export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 3200);
  }, []);

  const Toast = useCallback(() => {
    if (!toast) return null;
    const Icon = icons[toast.type];
    return (
      <div className="fixed right-5 top-5 z-50 flex max-w-sm items-center gap-3 rounded-md border border-slate-200 bg-white px-4 py-3 text-sm shadow-asset">
        <Icon className="h-5 w-5 text-bank-700" />
        <span className="text-slate-800">{toast.message}</span>
      </div>
    );
  }, [toast]);

  return { showToast, Toast };
}
