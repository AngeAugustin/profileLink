"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useT } from "@/i18n/provider";

type QrCodePanelProps = {
  profileId: string;
  slug: string;
  label?: string;
  compact?: boolean;
};

type QrJson = {
  slug: string;
  url: string;
  dataUrl: string;
  label?: string;
};

export function QrCodePanel({ profileId, slug, label, compact }: QrCodePanelProps) {
  const { toast } = useToast();
  const t = useT();
  const [qr, setQr] = useState<QrJson | null>(null);
  const [loading, setLoading] = useState(true);

  const loadQr = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/profiles/${profileId}/qr?json=1`);
      if (res.ok) {
        setQr(await res.json());
      }
    } finally {
      setLoading(false);
    }
  }, [profileId]);

  useEffect(() => {
    void loadQr();
  }, [loadQr]);

  function download(format: "png" | "svg") {
    window.open(`/api/profiles/${profileId}/qr?format=${format}`, "_blank");
    toast(t("app.qr.download", { format: format.toUpperCase() }));
  }

  async function copyLink() {
    const url = qr?.url ?? `https://profilelink.me/p/${slug}`;
    await navigator.clipboard.writeText(url);
    toast(t("app.qr.copied"));
  }

  return (
    <div className={compact ? "" : "rounded-xl bg-surface-container-lowest p-space-lg shadow-sm"}>
      {!compact ? (
        <div className="flex items-center justify-between mb-space-md">
          <h3 className="text-headline-md font-semibold">{t("app.qr.title")}</h3>
          <span className="text-label-sm text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold">
            {t("app.qr.active")}
          </span>
        </div>
      ) : null}

      <div className="w-40 h-40 mx-auto bg-surface-container-low rounded-xl p-3 mb-space-md flex items-center justify-center">
        {loading ? (
          <Icon name="progress_activity" className="text-3xl text-primary animate-spin" />
        ) : qr?.dataUrl ? (
          <Image
            src={qr.dataUrl}
            alt={`QR code ${slug}`}
            width={160}
            height={160}
            className="w-full h-full object-contain"
            unoptimized
          />
        ) : (
          <Icon name="qr_code_2" className="text-4xl text-outline" />
        )}
      </div>

      <p className="text-center font-mono text-code-sm text-on-surface-variant mb-space-md truncate">
        {label ?? qr?.label ?? slug}
      </p>
      <p className="text-center text-body-sm text-on-surface-variant mb-space-md truncate px-2">
        {qr?.url ?? `…/p/${slug}`}
      </p>

      <div className="flex flex-col gap-space-xs">
        <button
          type="button"
          onClick={() => download("png")}
          className="w-full flex items-center gap-space-sm px-space-md py-2 rounded-lg hover:bg-surface-container text-label-md text-on-surface transition-colors"
        >
          <Icon name="download" className="text-[18px] text-primary" />
          {t("app.qr.png")}
        </button>
        <button
          type="button"
          onClick={() => download("svg")}
          className="w-full flex items-center gap-space-sm px-space-md py-2 rounded-lg hover:bg-surface-container text-label-md text-on-surface transition-colors"
        >
          <Icon name="file_download" className="text-[18px] text-primary" />
          {t("app.qr.svg")}
        </button>
        <Button variant="secondary" size="sm" className="w-full" onClick={() => void copyLink()}>
          <Icon name="content_copy" className="text-[18px]" />
          {t("app.qr.copyLink")}
        </Button>
      </div>
    </div>
  );
}

type QrModalProps = {
  open: boolean;
  onClose: () => void;
  slug: string;
  profileId?: string;
  label?: string;
};

export function QrModal({ open, onClose, slug, profileId, label }: QrModalProps) {
  const t = useT();
  const [qr, setQr] = useState<QrJson | null>(null);

  useEffect(() => {
    if (!open) return;
    const endpoint = profileId
      ? `/api/profiles/${profileId}/qr?json=1`
      : `/api/public/profiles/${slug}/qr`;
    void fetch(endpoint)
      .then((r) => (r.ok ? r.json() : null))
      .then(setQr);
  }, [open, slug, profileId]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-on-surface/40 backdrop-blur-sm flex items-center justify-center p-gutter">
      <div className="bg-surface-container-lowest rounded-2xl p-space-xl max-w-sm w-full shadow-xl text-center">
        <h3 className="text-headline-md font-bold mb-space-md">{t("app.qr.modalTitle")}</h3>
        {qr?.dataUrl ? (
          <Image
            src={qr.dataUrl}
            alt="QR code"
            width={192}
            height={192}
            className="w-48 h-48 mx-auto mb-space-md"
            unoptimized
          />
        ) : (
          <div className="w-48 h-48 mx-auto mb-space-md bg-surface-container-low rounded-xl flex items-center justify-center">
            <Icon name="progress_activity" className="text-3xl text-primary animate-spin" />
          </div>
        )}
        <p className="font-mono text-code-sm text-on-surface-variant mb-space-md break-all">
          {qr?.url ?? `…/p/${slug}`}
        </p>
        <p className="text-body-sm text-on-surface-variant mb-space-md">{label}</p>
        <div className="flex gap-space-sm">
          {profileId ? (
            <>
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => window.open(`/api/profiles/${profileId}/qr?format=png`, "_blank")}
              >
                PNG
              </Button>
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => window.open(`/api/profiles/${profileId}/qr?format=svg`, "_blank")}
              >
                SVG
              </Button>
            </>
          ) : null}
          <Button className="flex-1" onClick={onClose}>
            {t("app.qr.close")}
          </Button>
        </div>
      </div>
    </div>
  );
}
