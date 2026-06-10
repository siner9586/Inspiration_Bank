"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

const QR_ROWS = [
  "00000000000000000000000000000000000000000",
  "00000000000000000000000000000000000000000",
  "00000000000000000000000000000000000000000",
  "00000000000000000000000000000000000000000",
  "00001111111000010110010101111011111110000",
  "00001000001001000111101011110010000010000",
  "00001011101001001101001110000010111010000",
  "00001011101000111110111010101010111010000",
  "00001011101001010110001111100010111010000",
  "00001000001011010001110100101010000010000",
  "00001111111010101010101010101011111110000",
  "00000000000000111011110001100000000000000",
  "00001001011011110010101001011101000000000",
  "00000110010001111111110001101010000100000",
  "00000011011000110110101101100111101010000",
  "00000111110001111101001101100100110110000",
  "00001110011011111011101110110111010100000",
  "00001100100101001111001011100100100110000",
  "00001011101111111001100100110100101100000",
  "00001110000000011000111011110011100100000",
  "00000100001000111101010011111010110100000",
  "00000000000011110010110000111101010110000",
  "00000001111000101100010001001111001110000",
  "00000111110011111011100110110000000010000",
  "00001100001010000001010110000100100110000",
  "00000000110100101001000101000000000110000",
  "00001110111000001000100100000011011010000",
  "00000111010100111111001111100010110100000",
  "00001001011010101010110011111111101100000",
  "00000000000011100111011111101000110010000",
  "00001111111000101100011010101010111100000",
  "00001000001011010100111001101000110100000",
  "00001011101000100111001110001111110100000",
  "00001011101011101101101100110011100100000",
  "00001011101001001001101111000000110010000",
  "00001000001000010110010111101011010000000",
  "00001111111011100101101101011100010100000",
  "00000000000000000000000000000000000000000",
  "00000000000000000000000000000000000000000",
  "00000000000000000000000000000000000000000",
  "00000000000000000000000000000000000000000"
];

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
    <span ref={wrapperRef} className="relative inline-flex align-middle">
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
          "inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium leading-4 text-blue-700",
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
          <span
            className="grid aspect-square w-full overflow-hidden rounded-xl bg-white"
            style={{ gridTemplateColumns: `repeat(${QR_ROWS.length}, minmax(0, 1fr))` }}
            aria-label="公众号：灵感与观点交流二维码，扫码进入公众号"
          >
            {QR_ROWS.flatMap((row, rowIndex) =>
              row.split("").map((cell, colIndex) => (
                <span
                  key={`${rowIndex}-${colIndex}`}
                  className={cell === "1" ? "bg-black" : "bg-white"}
                  aria-hidden="true"
                />
              ))
            )}
          </span>
          <span className="mt-2 block text-xs leading-5 text-slate-500">
            微信扫码关注：灵感与观点交流
          </span>
        </span>
      ) : null}
    </span>
  );
}
