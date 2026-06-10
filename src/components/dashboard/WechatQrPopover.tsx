"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

const WECHAT_QR_SRC =
  "https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=10&data=http%3A%2F%2Fweixin.qq.com%2Fr%2Fmp%2FIiNGXnLEuC-HrTY993Yw";

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
