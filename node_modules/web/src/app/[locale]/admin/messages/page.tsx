"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { useAdminAccess } from "@/components/admin/useAdminAccess";
import { Icon } from "@/components/ui/Icon";
import { Pagination, useClientPagination } from "@/components/ui/Pagination";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/cn";
import { localizedPath } from "@/i18n/path";
import { useI18n, useT } from "@/i18n/provider";

type MessageStatus = "NEW" | "READ" | "ARCHIVED";

type ContactMessageRow = {
  id: string;
  name: string;
  email: string;
  subject: string;
  preview: string;
  status: MessageStatus;
  locale: string | null;
  createdAt: string;
};

const STATUS_FILTERS: Array<MessageStatus | "ALL"> = [
  "ALL",
  "NEW",
  "READ",
  "ARCHIVED",
];

export default function AdminMessagesPage() {
  return (
    <AdminShell>
      <MessagesContent />
    </AdminShell>
  );
}

function statusTone(status: MessageStatus) {
  if (status === "NEW") return "bg-primary/10 text-primary";
  if (status === "READ") return "bg-surface-container-high text-on-surface-variant";
  return "bg-surface-container text-on-surface-variant";
}

function MessagesContent() {
  const t = useT();
  const { locale } = useI18n();
  const { toast } = useToast();
  const { ready, forbidden } = useAdminAccess();
  const dateLocale = locale === "en" ? "en-US" : "fr-FR";

  const [messages, setMessages] = useState<ContactMessageRow[]>([]);
  const [total, setTotal] = useState(0);
  const [newCount, setNewCount] = useState(0);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<MessageStatus | "ALL">("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (query.trim()) params.set("q", query.trim());
        if (status !== "ALL") params.set("status", status);
        const qs = params.toString();
        const res = await fetch(`/api/admin/messages${qs ? `?${qs}` : ""}`);
        const data = await res.json();
        if (!res.ok) {
          if (!cancelled) toast(data.error ?? t("api.server"));
          return;
        }
        if (!cancelled) {
          setMessages(data.messages);
          setTotal(data.stats.total);
          setNewCount(data.stats.newCount);
        }
      } catch {
        if (!cancelled) toast(t("common.networkError"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, query ? 280 : 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [ready, query, status, t, toast]);

  const {
    page,
    setPage,
    totalPages,
    pageItems,
    from,
    to,
    total: pageTotal,
  } = useClientPagination(messages, 10, `${query}:${status}`);

  if (forbidden) {
    return (
      <p className="text-body-md text-on-surface-variant">{t("admin.forbidden")}</p>
    );
  }

  function statusLabel(value: MessageStatus | "ALL") {
    if (value === "ALL") return t("admin.messagesFilterAll");
    if (value === "NEW") return t("admin.messagesStatusNew");
    if (value === "READ") return t("admin.messagesStatusRead");
    return t("admin.messagesStatusArchived");
  }

  return (
    <div className="flex flex-col gap-space-xl w-full">
      <div>
        <h1 className="text-headline-lg text-on-surface font-bold">
          {t("admin.messagesTitle")}
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">
          {t("admin.messagesSub", { count: total, new: newCount })}
        </p>
      </div>

      <div className="rounded-xl bg-surface-container-lowest shadow-sm overflow-hidden border border-outline-variant/20">
        <div className="p-space-md border-b border-outline-variant/20 flex flex-col gap-space-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md w-full">
            <Icon
              name="search"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("admin.messagesSearch")}
              className="w-full pl-10 pr-space-md py-2.5 rounded-lg bg-surface-container-low text-body-sm text-on-surface placeholder:text-on-surface-variant outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setStatus(value)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-label-sm font-semibold border transition-colors",
                  status === value
                    ? "bg-primary text-on-primary border-primary"
                    : "bg-surface-container-low text-on-surface-variant border-outline-variant/25 hover:text-on-surface",
                )}
              >
                {statusLabel(value)}
              </button>
            ))}
          </div>
        </div>

        {!ready || (loading && messages.length === 0) ? (
          <p className="px-space-md py-space-lg text-body-sm text-on-surface-variant">
            {t("admin.loading")}
          </p>
        ) : messages.length === 0 ? (
          <p className="px-space-md py-space-lg text-body-sm text-on-surface-variant">
            {t("admin.messagesEmpty")}
          </p>
        ) : (
          <>
            <ul className="md:hidden divide-y divide-outline-variant/15">
              {pageItems.map((m) => {
                const href = localizedPath(locale, `/admin/messages/${m.id}`);
                const when = new Date(m.createdAt).toLocaleString(dateLocale, {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                });
                return (
                  <li key={m.id}>
                    <Link
                      href={href}
                      className="flex items-start gap-3 px-space-md py-space-md active:bg-surface-container-low/60"
                    >
                      <div className="min-w-0 flex-1 flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <p className="font-semibold text-on-surface truncate">
                            {m.subject}
                          </p>
                          {m.status === "NEW" ? (
                            <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                          ) : null}
                        </div>
                        <p className="text-body-sm text-on-surface-variant truncate">
                          {m.name} · {m.email}
                        </p>
                        <p className="text-[12px] text-on-surface-variant line-clamp-2">
                          {m.preview}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-on-surface-variant">
                          <span
                            className={cn(
                              "inline-flex rounded px-1.5 py-0.5 font-semibold uppercase tracking-wide text-[10px]",
                              statusTone(m.status),
                            )}
                          >
                            {statusLabel(m.status)}
                          </span>
                          <span>{when}</span>
                        </div>
                      </div>
                      <Icon
                        name="chevron_right"
                        className="text-[20px] text-on-surface-variant shrink-0 mt-0.5"
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-body-sm">
                <thead className="bg-surface-container-low text-label-sm text-on-surface-variant uppercase tracking-wider">
                  <tr>
                    <th className="px-space-md py-space-sm font-semibold">
                      {t("admin.messagesColSubject")}
                    </th>
                    <th className="px-space-md py-space-sm font-semibold">
                      {t("admin.messagesColFrom")}
                    </th>
                    <th className="px-space-md py-space-sm font-semibold">
                      {t("admin.messagesColStatus")}
                    </th>
                    <th className="px-space-md py-space-sm font-semibold">
                      {t("admin.messagesColDate")}
                    </th>
                    <th className="px-space-md py-space-sm font-semibold sr-only">
                      {t("admin.colActions")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((m) => (
                    <tr
                      key={m.id}
                      className={cn(
                        "border-t border-outline-variant/15 hover:bg-surface-container-low/60",
                        m.status === "NEW" && "bg-primary/[0.03]",
                      )}
                    >
                      <td className="px-space-md py-space-md">
                        <Link
                          href={localizedPath(locale, `/admin/messages/${m.id}`)}
                          className="flex flex-col group min-w-0 max-w-md"
                        >
                          <span className="font-semibold text-on-surface group-hover:text-primary-container truncate">
                            {m.subject}
                          </span>
                          <span className="text-on-surface-variant truncate text-[12px]">
                            {m.preview}
                          </span>
                        </Link>
                      </td>
                      <td className="px-space-md py-space-md">
                        <div className="flex flex-col min-w-0">
                          <span className="font-medium text-on-surface truncate">
                            {m.name}
                          </span>
                          <span className="text-on-surface-variant truncate">
                            {m.email}
                          </span>
                        </div>
                      </td>
                      <td className="px-space-md py-space-md">
                        <span
                          className={cn(
                            "inline-flex rounded px-2 py-0.5 font-semibold uppercase tracking-wide text-[10px]",
                            statusTone(m.status),
                          )}
                        >
                          {statusLabel(m.status)}
                        </span>
                      </td>
                      <td className="px-space-md py-space-md text-on-surface-variant whitespace-nowrap">
                        {new Date(m.createdAt).toLocaleString(dateLocale, {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-space-md py-space-md text-right">
                        <Link
                          href={localizedPath(locale, `/admin/messages/${m.id}`)}
                          className="inline-flex items-center gap-1 text-label-sm font-semibold text-primary-container hover:underline"
                        >
                          {t("admin.seeDetails")}
                          <Icon name="chevron_right" className="text-[16px]" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        <Pagination
          page={page}
          totalPages={totalPages}
          total={pageTotal}
          from={from}
          to={to}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
