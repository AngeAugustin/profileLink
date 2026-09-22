"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { useAdminAccess } from "@/components/admin/useAdminAccess";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/cn";
import { localizedPath } from "@/i18n/path";
import { useI18n, useT } from "@/i18n/provider";

type MessageStatus = "NEW" | "READ" | "ARCHIVED";

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  body: string;
  status: MessageStatus;
  locale: string | null;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function AdminMessageDetailPage() {
  return (
    <AdminShell>
      <MessageDetailContent />
    </AdminShell>
  );
}

function MessageDetailContent() {
  const params = useParams<{ id: string }>();
  const t = useT();
  const { locale } = useI18n();
  const { toast } = useToast();
  const { ready, forbidden } = useAdminAccess();
  const dateLocale = locale === "en" ? "en-US" : "fr-FR";

  const [message, setMessage] = useState<ContactMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!ready || !params.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/messages/${params.id}`);
      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? t("api.server"));
        setMessage(null);
        return;
      }
      setMessage(data.message);
      if (data.message.status === "NEW") {
        const patch = await fetch(`/api/admin/messages/${params.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "READ" }),
        });
        if (patch.ok) {
          const patched = await patch.json();
          setMessage(patched.message);
        }
      }
    } catch {
      toast(t("common.networkError"));
    } finally {
      setLoading(false);
    }
  }, [ready, params.id, t, toast]);

  useEffect(() => {
    void load();
  }, [load]);

  async function updateStatus(status: MessageStatus) {
    if (!message || saving) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/messages/${message.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? t("api.server"));
        return;
      }
      setMessage(data.message);
      toast(
        status === "ARCHIVED"
          ? t("admin.messagesArchived")
          : status === "NEW"
            ? t("admin.messagesMarkedNew")
            : t("admin.messagesMarkedRead"),
      );
    } catch {
      toast(t("common.networkError"));
    } finally {
      setSaving(false);
    }
  }

  if (forbidden) {
    return (
      <p className="text-body-md text-on-surface-variant">{t("admin.forbidden")}</p>
    );
  }

  if (loading || !message) {
    return (
      <p className="text-body-md text-on-surface-variant">
        {loading ? t("admin.loading") : t("admin.messagesNotFound")}
      </p>
    );
  }

  const when = new Date(message.createdAt).toLocaleString(dateLocale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const mailto = `mailto:${message.email}?subject=${encodeURIComponent(`Re: ${message.subject}`)}`;

  return (
    <div className="flex flex-col gap-space-lg w-full max-w-3xl">
      <div>
        <Link
          href={localizedPath(locale, "/admin/messages")}
          className="inline-flex items-center gap-1 text-label-sm font-semibold text-primary-container hover:underline mb-space-sm"
        >
          <Icon name="arrow_back" className="text-[16px]" />
          {t("admin.messagesBack")}
        </Link>
        <h1 className="text-headline-lg text-on-surface font-bold tracking-tight">
          {message.subject}
        </h1>
        <p className="text-body-md text-on-surface-variant mt-1">{when}</p>
      </div>

      <div className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest shadow-sm p-space-lg flex flex-col gap-space-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
          <div className="rounded-xl bg-surface-container-low px-3.5 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-on-surface-variant">
              {t("admin.messagesColFrom")}
            </p>
            <p className="mt-1 text-sm font-medium text-on-surface">{message.name}</p>
            <a
              href={`mailto:${message.email}`}
              className="text-sm text-primary hover:underline break-all"
            >
              {message.email}
            </a>
          </div>
          <div className="rounded-xl bg-surface-container-low px-3.5 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-on-surface-variant">
              {t("admin.messagesColStatus")}
            </p>
            <p
              className={cn(
                "mt-2 inline-flex rounded px-2 py-0.5 font-semibold uppercase tracking-wide text-[10px]",
                message.status === "NEW"
                  ? "bg-primary/10 text-primary"
                  : message.status === "READ"
                    ? "bg-surface-container-high text-on-surface-variant"
                    : "bg-surface-container text-on-surface-variant",
              )}
            >
              {message.status === "NEW"
                ? t("admin.messagesStatusNew")
                : message.status === "READ"
                  ? t("admin.messagesStatusRead")
                  : t("admin.messagesStatusArchived")}
            </p>
            {message.locale ? (
              <p className="mt-2 text-[12px] text-on-surface-variant font-mono">
                {t("admin.messagesLocale")}: {message.locale}
              </p>
            ) : null}
          </div>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-on-surface-variant mb-space-sm">
            {t("admin.messagesBody")}
          </p>
          <div className="rounded-xl bg-surface-container-low px-space-md py-space-md text-body-md text-on-surface whitespace-pre-wrap">
            {message.body}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap gap-space-sm">
          <Button href={mailto} size="sm">
            {t("admin.messagesReply")}
            <Icon name="reply" className="text-[16px]" />
          </Button>
          {message.status !== "ARCHIVED" ? (
            <Button
              type="button"
              variant="muted"
              size="sm"
              disabled={saving}
              onClick={() => void updateStatus("ARCHIVED")}
            >
              {t("admin.messagesArchive")}
            </Button>
          ) : (
            <Button
              type="button"
              variant="muted"
              size="sm"
              disabled={saving}
              onClick={() => void updateStatus("READ")}
            >
              {t("admin.messagesUnarchive")}
            </Button>
          )}
          {message.status !== "NEW" ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={saving}
              onClick={() => void updateStatus("NEW")}
            >
              {t("admin.messagesMarkNew")}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
