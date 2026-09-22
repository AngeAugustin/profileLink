"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminUnlockRequestsPanel } from "@/components/admin/AdminUnlockRequestsPanel";
import { useAdminAccess } from "@/components/admin/useAdminAccess";
import { Icon } from "@/components/ui/Icon";
import { Pagination, useClientPagination } from "@/components/ui/Pagination";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/cn";
import { localizedPath } from "@/i18n/path";
import { useI18n, useT } from "@/i18n/provider";

type AdminUser = {
  id: string;
  email: string;
  name: string | null;
  plan: "FREE" | "PRO" | "TEAM";
  role: "USER" | "ADMIN";
  lockedAt: string | null;
  failedLoginCount: number;
  profiles: number;
  createdAt: string;
};

type UsersTab = "comptes" | "examens";

export default function AdminUsersPage() {
  return (
    <AdminShell>
      <UsersContent />
    </AdminShell>
  );
}

function UsersContent() {
  const t = useT();
  const { locale } = useI18n();
  const { toast } = useToast();
  const { ready, forbidden } = useAdminAccess();
  const dateLocale = locale === "en" ? "en-US" : "fr-FR";

  const [tab, setTab] = useState<UsersTab>("comptes");
  const [pendingUnlocks, setPendingUnlocks] = useState(0);

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("tab") === "examens") setTab("examens");
  }, []);

  useEffect(() => {
    if (!ready || tab !== "comptes") return;
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const url = query.trim()
          ? `/api/admin/users?q=${encodeURIComponent(query.trim())}`
          : "/api/admin/users";
        const res = await fetch(url);
        const data = await res.json();
        if (!res.ok) {
          if (!cancelled) toast(data.error ?? t("api.server"));
          return;
        }
        if (!cancelled) {
          setUsers(data.users);
          setTotal(data.stats.totalAccounts);
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
  }, [ready, query, tab, t, toast]);

  useEffect(() => {
    if (!ready) return;
    void fetch("/api/admin/unlock-requests?status=PENDING")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.stats?.pendingCount != null) {
          setPendingUnlocks(data.stats.pendingCount);
        }
      })
      .catch(() => undefined);
  }, [ready, tab]);

  const {
    page,
    setPage,
    totalPages,
    pageItems,
    from,
    to,
    total: pageTotal,
  } = useClientPagination(users, 10, query);

  function selectTab(next: UsersTab) {
    setTab(next);
    const url = new URL(window.location.href);
    if (next === "examens") url.searchParams.set("tab", "examens");
    else url.searchParams.delete("tab");
    window.history.replaceState({}, "", url.toString());
  }

  if (forbidden) {
    return (
      <p className="text-body-md text-on-surface-variant">{t("admin.forbidden")}</p>
    );
  }

  const tabs: { id: UsersTab; label: string; count?: number }[] = [
    { id: "comptes", label: t("admin.tabAccounts"), count: total || undefined },
    {
      id: "examens",
      label: t("admin.tabUnlockReviews"),
      count: pendingUnlocks || undefined,
    },
  ];

  return (
    <div className="flex flex-col gap-space-xl w-full">
      <div>
        <h1 className="text-headline-lg text-on-surface font-bold">
          {t("admin.usersTitle")}
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">
          {tab === "examens"
            ? t("admin.unlockTabSub")
            : t("admin.usersSub", { count: total })}
        </p>
      </div>

      <div
        role="tablist"
        aria-label={t("admin.usersTabs")}
        className="flex gap-1 border-b border-outline-variant/25 overflow-x-auto -mx-1 px-1 scrollbar-none"
      >
        {tabs.map((item) => {
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => selectTab(item.id)}
              className={cn(
                "relative inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-colors shrink-0 whitespace-nowrap",
                active
                  ? "text-primary"
                  : "text-on-surface-variant hover:text-on-surface",
              )}
            >
              {item.label}
              {typeof item.count === "number" ? (
                <span
                  className={cn(
                    "min-w-[1.25rem] rounded-full px-1.5 py-0.5 text-[11px] tabular-nums",
                    active
                      ? "bg-primary/10 text-primary"
                      : "bg-surface-container text-on-surface-variant",
                  )}
                >
                  {item.count}
                </span>
              ) : null}
              {active ? (
                <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" />
              ) : null}
            </button>
          );
        })}
      </div>

      {tab === "examens" ? (
        <AdminUnlockRequestsPanel
          ready={ready}
          onPendingCountChange={setPendingUnlocks}
        />
      ) : (
        <div className="rounded-xl bg-surface-container-lowest shadow-sm overflow-hidden border border-outline-variant/20">
          <div className="p-space-md border-b border-outline-variant/20">
            <div className="relative max-w-md">
              <Icon
                name="search"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("admin.search")}
                className="w-full pl-10 pr-space-md py-2.5 rounded-lg bg-surface-container-low text-body-sm text-on-surface placeholder:text-on-surface-variant outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          {!ready || (loading && users.length === 0) ? (
            <p className="px-space-md py-space-lg text-body-sm text-on-surface-variant">
              {t("admin.loading")}
            </p>
          ) : users.length === 0 ? (
            <p className="px-space-md py-space-lg text-body-sm text-on-surface-variant">
              {t("admin.empty")}
            </p>
          ) : (
            <>
              <ul className="md:hidden divide-y divide-outline-variant/15">
                {pageItems.map((u) => {
                  const href = localizedPath(locale, `/admin/utilisateurs/${u.id}`);
                  const joined = new Date(u.createdAt).toLocaleDateString(
                    dateLocale,
                    {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    },
                  );
                  return (
                    <li key={u.id}>
                      <Link
                        href={href}
                        className="flex items-start gap-3 px-space-md py-space-md active:bg-surface-container-low/60"
                      >
                        <div className="min-w-0 flex-1 flex flex-col gap-1.5">
                          <div className="min-w-0">
                            <p className="font-semibold text-on-surface truncate flex items-center gap-2">
                              <span className="truncate">{u.name ?? "—"}</span>
                              {u.lockedAt ? (
                                <span className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-error-container text-on-error-container">
                                  {t("admin.lockedBadge")}
                                </span>
                              ) : null}
                            </p>
                            <p className="text-body-sm text-on-surface-variant truncate">
                              {u.email}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-on-surface-variant">
                            <span className="font-mono">{u.plan}</span>
                            <span className="font-mono">{u.role}</span>
                            <span>
                              {u.profiles} {t("admin.colProfiles")}
                            </span>
                            <span>{joined}</span>
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
                        {t("admin.colUser")}
                      </th>
                      <th className="px-space-md py-space-sm font-semibold">
                        {t("admin.colPlan")}
                      </th>
                      <th className="px-space-md py-space-sm font-semibold">
                        {t("admin.colRole")}
                      </th>
                      <th className="px-space-md py-space-sm font-semibold">
                        {t("admin.colStatus")}
                      </th>
                      <th className="px-space-md py-space-sm font-semibold">
                        {t("admin.colProfiles")}
                      </th>
                      <th className="px-space-md py-space-sm font-semibold">
                        {t("admin.colJoined")}
                      </th>
                      <th className="px-space-md py-space-sm font-semibold sr-only">
                        {t("admin.colActions")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageItems.map((u) => (
                      <tr
                        key={u.id}
                        className="border-t border-outline-variant/15 hover:bg-surface-container-low/60"
                      >
                        <td className="px-space-md py-space-md">
                          <Link
                            href={localizedPath(
                              locale,
                              `/admin/utilisateurs/${u.id}`,
                            )}
                            className="flex flex-col group"
                          >
                            <span className="font-semibold text-on-surface group-hover:text-primary-container">
                              {u.name ?? "—"}
                            </span>
                            <span className="text-on-surface-variant">
                              {u.email}
                            </span>
                          </Link>
                        </td>
                        <td className="px-space-md py-space-md font-mono text-[12px]">
                          {u.plan}
                        </td>
                        <td className="px-space-md py-space-md font-mono text-[12px]">
                          {u.role}
                        </td>
                        <td className="px-space-md py-space-md">
                          {u.lockedAt ? (
                            <span className="inline-flex rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-error-container text-on-error-container">
                              {t("admin.lockedBadge")}
                            </span>
                          ) : (
                            <span className="text-on-surface-variant">
                              {t("admin.activeBadge")}
                            </span>
                          )}
                        </td>
                        <td className="px-space-md py-space-md">{u.profiles}</td>
                        <td className="px-space-md py-space-md text-on-surface-variant">
                          {new Date(u.createdAt).toLocaleDateString(dateLocale, {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-space-md py-space-md text-right">
                          <Link
                            href={localizedPath(
                              locale,
                              `/admin/utilisateurs/${u.id}`,
                            )}
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
      )}
    </div>
  );
}
