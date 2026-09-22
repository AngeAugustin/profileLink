"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { useT } from "@/i18n/provider";

type ConfirmModalProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirming?: boolean;
  tone?: "default" | "danger";
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  confirming = false,
  tone = "default",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const t = useT();
  const titleId = useId();
  const descId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cancelRef.current?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !confirming) onCancel();
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, confirming, onCancel]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-space-md">
      <button
        type="button"
        aria-label={t("common.close")}
        className="absolute inset-0 bg-on-surface/40 backdrop-blur-[2px]"
        onClick={() => {
          if (!confirming) onCancel();
        }}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        className="relative w-full max-w-md rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-xl p-space-lg"
      >
        <div className="flex gap-space-md">
          <span
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-xl",
              tone === "danger"
                ? "bg-error-container/60 text-on-error-container"
                : "bg-primary/8 text-primary",
            )}
          >
            <Icon
              name={tone === "danger" ? "logout" : "help"}
              className="text-[22px]"
            />
          </span>
          <div className="min-w-0 flex-1">
            <h2
              id={titleId}
              className="text-headline-md font-semibold text-on-surface"
            >
              {title}
            </h2>
            {description ? (
              <p
                id={descId}
                className="mt-1 text-body-sm text-on-surface-variant"
              >
                {description}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-space-lg flex flex-col-reverse sm:flex-row sm:justify-end gap-space-sm">
          <button
            ref={cancelRef}
            type="button"
            disabled={confirming}
            onClick={onCancel}
            className="inline-flex h-9 items-center justify-center rounded-lg border border-outline-variant/50 px-space-md text-label-sm font-semibold text-on-surface hover:bg-surface-container transition-colors disabled:opacity-50"
          >
            {cancelLabel ?? t("common.cancel")}
          </button>
          <button
            type="button"
            disabled={confirming}
            onClick={onConfirm}
            className={cn(
              "inline-flex h-9 items-center justify-center rounded-lg px-space-md text-label-sm font-semibold transition-colors disabled:opacity-50",
              tone === "danger"
                ? "bg-error text-on-error hover:bg-error/90"
                : "bg-primary-container text-on-primary hover:bg-primary",
            )}
          >
            {confirming ? t("common.loading") : (confirmLabel ?? t("common.continue"))}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
