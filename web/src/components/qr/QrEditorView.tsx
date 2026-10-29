"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import { localizedPath } from "@/i18n/path";
import { useI18n } from "@/i18n/provider";
import { normalizeStyle, templateStyle } from "@/lib/qr-style";
import { QrStudio, isValidDestination, type QrStudioValue } from "./QrStudio";

type SavedQr = QrStudioValue & { id: string; shortUrl: string };

export function QrEditorView({ qrId }: { qrId?: string }) {
  const router = useRouter();
  const { locale, t } = useI18n();
  const { toast } = useToast();
  const [value, setValue] = useState<QrStudioValue>({
    name: "",
    destination: "https://",
    dynamic: false,
    style: templateStyle("brand"),
  });
  const [saved, setSaved] = useState<SavedQr | null>(null);
  const [canDynamic, setCanDynamic] = useState(false);
  const [loading, setLoading] = useState(!!qrId);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const plan = data?.user?.plan;
        setCanDynamic(plan === "PRO" || plan === "TEAM");
        // New codes default to dynamic when the plan allows it.
        if (!qrId && (plan === "PRO" || plan === "TEAM")) setValue((v) => ({ ...v, dynamic: true }));
      })
      .catch(() => undefined);
  }, [qrId]);

  useEffect(() => {
    if (!qrId) return;
    void (async () => {
      try {
        const res = await fetch(`/api/qr-codes/${qrId}`);
        if (res.status === 401) {
          router.push(localizedPath(locale, "/connexion"));
          return;
        }
        const data = await res.json();
        if (!res.ok) {
          setError(res.status === 404 ? t("app.qrCodes.notFound") : (data.error ?? t("app.qrCodes.errorLoad")));
          return;
        }
        const qr = data.qrCode;
        const next = {
          name: qr.name,
          destination: qr.destination,
          dynamic: qr.dynamic,
          style: normalizeStyle(qr.style),
        };
        setValue(next);
        setSaved({ ...next, id: qr.id, shortUrl: qr.shortUrl });
      } catch {
        setError(t("common.networkError"));
      } finally {
        setLoading(false);
      }
    })();
  }, [qrId, router, locale, t]);

  async function save() {
    if (!isValidDestination(value.destination.trim()) || !value.name.trim()) return;
    setSaving(true);
    try {
      const body = JSON.stringify({ ...value, name: value.name.trim(), destination: value.destination.trim() });
      const res = saved
        ? await fetch(`/api/qr-codes/${saved.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body })
        : await fetch("/api/qr-codes", { method: "POST", headers: { "Content-Type": "application/json" }, body });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? t("common.serverError"));
        return;
      }
      toast(t("app.qrStudio.saved"));
      if (!saved) {
        router.replace(localizedPath(locale, `/app/qr-codes/${data.qrCode.id}`));
        return;
      }
      setSaved({ ...value, id: data.qrCode.id, shortUrl: data.qrCode.shortUrl });
    } catch {
      toast(t("common.networkError"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-space-lg w-full">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-space-md">
        <div>
          <Button href="/app/qr-codes" variant="ghost" size="sm" className="-ml-space-sm mb-space-xs">
            <Icon name="arrow_back" className="text-[18px]" /> {t("app.qrCodes.back")}
          </Button>
          <h1 className="text-headline-lg font-bold text-on-surface">
            {qrId ? value.name || t("app.qrCodes.editTitle") : t("app.qrCodes.newTitle")}
          </h1>
        </div>
      </div>

      {loading ? (
        <p className="text-body-md text-on-surface-variant">{t("common.loading")}</p>
      ) : error ? (
        <div className="rounded-lg bg-error-container text-on-error-container p-space-md">{error}</div>
      ) : (
        <QrStudio
          value={value}
          onChange={setValue}
          mode="app"
          // A code that is already dynamic stays editable even after a downgrade.
          canDynamic={canDynamic || !!saved?.dynamic}
          shortUrl={saved?.dynamic ? saved.shortUrl : null}
          onSave={() => void save()}
          saving={saving}
          saveLabel={saved ? t("app.qrStudio.save") : t("app.qrStudio.create")}
        />
      )}
    </div>
  );
}
