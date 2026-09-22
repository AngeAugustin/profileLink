"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { useAdminAccess } from "@/components/admin/useAdminAccess";
import { Icon } from "@/components/ui/Icon";
import { Pagination, useClientPagination } from "@/components/ui/Pagination";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/cn";
import { useI18n, useT } from "@/i18n/provider";

type AuditCategory =
  | "AUTH"
  | "SECURITY"
  | "ADMIN"
  | "CONTACT"
  | "PROFILE"
  | "BILLING"
  | "SYSTEM";

type AuditLevel = "INFO" | "WARN" | "ERROR";

type AuditLogRow = {
  id: string;
  createdAt: string;
  category: AuditCategory;
  level: AuditLevel;
  action: string;
  message: string;
  actorUserId: string | null;
  actorEmail: string | null;
  actorRole: string | null;
  targetType: string | null;
  targetId: string | null;
  ip: string | null;
  userAgent: string | null;
  country: string | null;
  countryCode: string | null;
  region: string | null;
  city: string | null;
  path: string | null;
  method: string | null;
  statusCode: number | null;
  meta: unknown;
};

const CATEGORIES: Array<AuditCategory | "ALL"> = [
  "ALL",
  "AUTH",
  "SECURITY",
  "ADMIN",
  "CONTACT",
  "PROFILE",
  "BILLING",
  "SYSTEM",
];

export default function AdminLogsPage() {
  return (
    <AdminShell>
      <LogsContent />
    </AdminShell>
  );
}

function levelTone(level: AuditLevel) {
  if (level === "ERROR") return "bg-error-container text-on-error-container";
  if (level === "WARN") return "bg-tertiary-container/20 text-tertiary";
  return "bg-primary/10 text-primary";
}

function LogsContent() {
  const t = useT();
  const { locale } = useI18n();
  const { toast } = useToast();
  const { ready, forbidden } = useAdminAccess();
  const dateLocale = locale === "en" ? "en-US" : "fr-FR";

  const [logs, setLogs] = useState<AuditLogRow[]>([]);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<AuditCategory | "ALL">("ALL");
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (query.trim()) params.set("q", query.trim());
        if (category !== "ALL") params.set("category", category);
        params.set("limit", "150");
        const res = await fetch(`/api/admin/logs?${params.toString()}`);
        const data = await res.json();
        if (!res.ok) {
          if (!cancelled) toast(data.error ?? t("api.server"));
          return;
        }
        if (!cancelled) {
          setLogs(data.logs);
          setTotal(data.stats.total);
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
  }, [ready, query, category, t, toast]);

  const {
    page,
    setPage,
    totalPages,
    pageItems,
    from,
    to,
    total: pageTotal,
  } = useClientPagination(logs, 20, `${query}:${category}`);

  if (forbidden) {
    return (
      <p className="text-body-md text-on-surface-variant">{t("admin.forbidden")}</p>
    );
  }

  return (
    <div className="flex flex-col gap-space-xl w-full">
      <div>
        <h1 className="text-headline-lg text-on-surface font-bold">
          {t("admin.logsTitle")}
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">
          {t("admin.logsSub", { count: total })}
        </p>
      </div>

      <div className="rounded-xl bg-surface-container-lowest shadow-sm overflow-hidden border border-outline-variant/20">
        <div className="p-space-md border-b border-outline-variant/20 flex flex-col gap-space-sm lg:flex-row lg:items-center lg:justify-between">
          <div className="relative max-w-md w-full">
            <Icon
              name="search"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("admin.logsSearch")}
              className="w-full pl-10 pr-space-md py-2.5 rounded-lg bg-surface-container-low text-body-sm text-on-surface placeholder:text-on-surface-variant outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setCategory(value)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-label-sm font-semibold border transition-colors",
                  category === value
                    ? "bg-primary text-on-primary border-primary"
                    : "bg-surface-container-low text-on-surface-variant border-outline-variant/25 hover:text-on-surface",
                )}
              >
                {value === "ALL" ? t("admin.logsFilterAll") : value}
              </button>
            ))}
          </div>
        </div>

        {!ready || (loading && logs.length === 0) ? (
          <p className="px-space-md py-space-lg text-body-sm text-on-surface-variant">
            {t("admin.loading")}
          </p>
        ) : logs.length === 0 ? (
          <p className="px-space-md py-space-lg text-body-sm text-on-surface-variant">
            {t("admin.logsEmpty")}
          </p>
        ) : (
          <ul className="divide-y divide-outline-variant/15">
            {pageItems.map((log) => {
              const when = new Date(log.createdAt).toLocaleString(dateLocale, {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              });
              const place = [log.city, log.region, log.country]
                .filter(Boolean)
                .join(", ");
              const open = expandedId === log.id;
              return (
                <li key={log.id}>
                  <button
                    type="button"
                    onClick={() => setExpandedId(open ? null : log.id)}
                    className="w-full text-left px-space-md py-space-md hover:bg-surface-container-low/50 transition-colors"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={cn(
                              "rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                              levelTone(log.level),
                            )}
                          >
                            {log.level}
                          </span>
                          <span className="rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-surface-container-high text-on-surface-variant">
                            {log.category}
                          </span>
                          <span className="font-mono text-[11px] text-on-surface-variant truncate">
                            {log.action}
                          </span>
                        </div>
                        <p className="font-semibold text-on-surface text-body-sm">
                          {log.message}
                        </p>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[12px] text-on-surface-variant">
                          <span>{when}</span>
                          {log.actorEmail ? (
                            <span>{log.actorEmail}</span>
                          ) : null}
                          {log.ip ? (
                            <span className="font-mono">{log.ip}</span>
                          ) : null}
                          {place ? <span>{place}</span> : null}
                        </div>
                      </div>
                      <Icon
                        name={open ? "expand_less" : "expand_more"}
                        className="text-[20px] text-on-surface-variant shrink-0"
                      />
                    </div>
                  </button>

                  {open ? (
                    <div className="px-space-md pb-space-md">
                      <dl className="grid gap-2 sm:grid-cols-2 rounded-xl bg-surface-container-low p-space-md text-body-sm">
                        <Detail label={t("admin.logsColTime")} value={when} />
                        <Detail
                          label={t("admin.logsColAction")}
                          value={log.action}
                          mono
                        />
                        <Detail
                          label={t("admin.logsColActor")}
                          value={
                            log.actorEmail
                              ? `${log.actorEmail}${log.actorRole ? ` (${log.actorRole})` : ""}`
                              : "—"
                          }
                        />
                        <Detail
                          label={t("admin.logsColIp")}
                          value={log.ip ?? "—"}
                          mono
                        />
                        <Detail
                          label={t("admin.logsColLocation")}
                          value={place || "—"}
                        />
                        <Detail
                          label={t("admin.logsColCountryCode")}
                          value={log.countryCode ?? "—"}
                          mono
                        />
                        <Detail
                          label={t("admin.logsColPath")}
                          value={
                            log.method && log.path
                              ? `${log.method} ${log.path}`
                              : (log.path ?? "—")
                          }
                          mono
                        />
                        <Detail
                          label={t("admin.logsColStatus")}
                          value={
                            log.statusCode != null ? String(log.statusCode) : "—"
                          }
                          mono
                        />
                        <Detail
                          label={t("admin.logsColTarget")}
                          value={
                            log.targetType
                              ? `${log.targetType}${log.targetId ? ` · ${log.targetId}` : ""}`
                              : "—"
                          }
                          mono
                        />
                        <Detail
                          label={t("admin.logsColUserAgent")}
                          value={log.userAgent ?? "—"}
                          className="sm:col-span-2"
                        />
                        {log.meta ? (
                          <div className="sm:col-span-2">
                            <dt className="text-[11px] font-semibold uppercase tracking-wide text-on-surface-variant">
                              {t("admin.logsColMeta")}
                            </dt>
                            <dd className="mt-1">
                              <pre className="overflow-x-auto rounded-lg bg-surface-container-lowest border border-outline-variant/20 p-3 text-[11px] font-mono text-on-surface whitespace-pre-wrap break-all">
                                {JSON.stringify(log.meta, null, 2)}
                              </pre>
                            </dd>
                          </div>
                        ) : null}
                      </dl>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
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

function Detail({
  label,
  value,
  mono,
  className,
}: {
  label: string;
  value: string;
  mono?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-on-surface-variant">
        {label}
      </dt>
      <dd
        className={cn(
          "mt-0.5 text-on-surface break-all",
          mono && "font-mono text-[12px]",
        )}
      >
        {value}
      </dd>
    </div>
  );
}
