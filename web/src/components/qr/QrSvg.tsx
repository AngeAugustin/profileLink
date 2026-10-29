"use client";

import { useMemo } from "react";
import { renderStyledQr, type QrStyle } from "@/lib/qr-style";
import { cn } from "@/lib/cn";

type QrSvgProps = {
  text: string;
  style: QrStyle;
  title?: string;
  className?: string;
  /** Fill the parent box (keeping proportions) instead of sizing by width. */
  fit?: boolean;
};

/** Inline styled QR code. The markup comes from renderStyledQr, which escapes all user text. */
export function QrSvg({ text, style, title, className, fit }: QrSvgProps) {
  const svg = useMemo(() => renderStyledQr(text, style, { title }).svg, [text, style, title]);
  return (
    <div
      className={cn(
        "[&>svg]:block [&>svg]:w-full",
        fit ? "h-full w-full [&>svg]:h-full" : "[&>svg]:h-auto",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
