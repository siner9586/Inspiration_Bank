"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

const WECHAT_QR_SRC =
  "data:image/webp;base64,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";

export function WechatQrPopover() {
  const [open, setOpen] = React.useState(false);
  const [mobileTop, setMobileTop] = React.useState(0);
  const wrapperRef = React.useRef<HTMLSpanElement | null>(null);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);

  const updateMobilePosition = React.useCallback(() => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMobileTop(rect.bottom + 16);
  }, []);

  React.useEffect(() => {
    if (!open) return;

    updateMobilePosition();

    const onPointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("resize", updateMobilePosition);
    window.addEventListener("scroll", updateMobilePosition, true);
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("resize", updateMobilePosition);
      window.removeEventListener("scroll", updateMobilePosition, true);
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, updateMobilePosition]);

  return (
    <span ref={wrapperRef} className="relative inline-flex">
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls="wechat-qr-popover"
        onClick={() => {
          updateMobilePosition();
          setOpen((value) => !value);
        }}
        className={cn(
          "inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700",
          "transition hover:bg-blue-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
        )}
      >
        公众号：灵感与观点交流
      </button>

      {open ? (
        <span
          id="wechat-qr-popover"
          role="dialog"
          aria-label="公众号二维码"
          style={{ "--wechat-popover-top": `${mobileTop}px` } as React.CSSProperties}
          className={cn(
            "absolute left-0 top-[calc(100%+0.5rem)] z-50 w-64 rounded-2xl border border-slate-200 bg-white p-3 text-center shadow-2xl",
            "max-sm:fixed max-sm:left-1/2 max-sm:top-[var(--wechat-popover-top)] max-sm:w-[min(78vw,18rem)] max-sm:-translate-x-1/2"
          )}
        >
          <img
            src={WECHAT_QR_SRC}
            alt="公众号：灵感与观点交流二维码"
            className="mx-auto aspect-square w-full rounded-xl bg-white"
          />
          <span className="mt-2 block text-xs leading-5 text-slate-500">
            微信扫码关注：灵感与观点交流
          </span>
        </span>
      ) : null}
    </span>
  );
}
