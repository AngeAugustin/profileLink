"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Icon } from "@/components/ui/Icon";
import { Pagination, useClientPagination } from "@/components/ui/Pagination";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/cn";
import { localizedPath } from "@/i18n/path";
import { useI18n, useT } from "@/i18n/provider";

type UnlockStatus = "PENDING" | "APPROVED" | "REJECTED";

type UnlockRequestRow = {
  id: string;
  message: string;
  status: UnlockStatus;
  createdAt: string;
  reviewedAt: string | null;
  user: {
    id: string;
    email: string;
    name: string | null;
    lockedAt: string | null;
    failedLoginCount: number;
  };
};

const FILTERS: Array<UnlockStatus | "ALL"> = [
  "PENDING",
  "ALL",
  "APPROVED",
  "REJECTED",
];

type AdminUnlockRequestsPanelProps = {
  ready: boolean;
  userId?: string;
  /** When set for a single user, hide search and default to all statuses. */
  compact?: boolean;
  onPendingCountChange?: (count: number) => void;
  onUnlocked?: () => void;
};

export function AdminUnlockRequestsPanel({
  ready,
  userId,
  compact = false,
  onPendingCountChange,
  onUnlocked,
}: AdminUnlockRequestsPanelProps) {
  const t = useT();
  const { locale } = useI18n();
  const { toast } = useToast();
  const dateLocale = locale === "en" ? "en-US" : "fr-FR";

  const [requests, setRequests] = useState<UnlockRequestRow[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<UnlockStatus | "ALL">(
    compact ? "ALL" : "PENDING",
  );
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
  const [confirmUnlock, setConfirmUnlock] = useState<UnlockRequestRow | null>(
    null,
  );

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (userId) params.set("userId", userId);
      if (query.trim()) params.set("q", query.trim());
      if (status !== "ALL") params.set("status", status);
      const qs = params.toString();
      const res = await fetch(`/api/admin/unlock-requests${qs ? `?${qs}` : ""}`);
      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? t("api.server"));
        return;
      }
      setRequests(data.requests);
      onPendingCountChange?.(data.stats.pendingCount ?? 0);
    } catch {
      toast(t("common.networkError"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      if (!cancelled) void load();
    }, query ? 280 : 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload on filters
  }, [ready, query, status, userId]);

  const {
    page,
    setPage,
    totalPages,
    pageItems,
    from,
    to,
    total: pageTotal,
  } = useClientPagination(requests, 10, `${query}:${status}`);

  async function act(id: string, action: "approve" | "reject") {
    setActingId(id);
    try {
      const res = await fetch(`/api/admin/unlock-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? t("api.server"));
        return;
      }
      toast(
        action === "approve"
          ? t("admin.unlockApproved")
          : t("admin.unlockRejected"),
      );
      setConfirmUnlock(null);
      await load();
      if (action === "approve") onUnlocked?.();
    } catch {
      toast(t("common.networkError"));
    } finally {
      setActingId(null);
    }
  }

  function statusLabel(value: UnlockStatus | "ALL") {
    if (value === "ALL") return t("admin.unlockFilterAll");
    if (value === "PENDING") return t("admin.unlockStatusPending");
    if (value === "APPROVED") return t("admin.unlockStatusApproved");
    return t("admin.unlockStatusRejected");
  }

  return (
    <>
      <div className="rounded-xl bg-surface-container-lowest shadow-sm overflow-hidden border border-outline-variant/20">
        <div
          className={cn(
            "p-space-md border-b border-outline-variant/20 flex flex-col gap-space-sm sm:flex-row sm:items-center sm:justify-between",
            compact && "sm:justify-end",
          )}
        >
          {!compact ? (
            <div className="relative max-w-md w-full">
              <Icon
                name="search"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("admin.unlockSearch")}
                className="w-full pl-10 pr-space-md py-2.5 rounded-lg bg-surface-container-low text-body-sm text-on-surface placeholder:text-on-surface-variant outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          ) : null}
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((value) => (
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

        {!ready || (loading && requests.length === 0) ? (
          <p className="px-space-md py-space-lg text-body-sm text-on-surface-variant">
            {t("admin.loading")}
          </p>
        ) : requests.length === 0 ? (
          <p className="px-space-md py-space-lg text-body-sm text-on-surface-variant">
            {t("admin.unlockEmpty")}
          </p>
        ) : (
          <ul className="divide-y divide-outline-variant/15">
            {pageItems.map((row) => {
              const when = new Date(row.createdAt).toLocaleString(dateLocale, {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });
              const busy = actingId === row.id;
              return (
                <li
                  key={row.id}
                  className="px-space-md py-space-md flex flex-col gap-space-sm lg:flex-row lg:items-start lg:justify-between"
                >
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-on-surface">
                        {row.user.name ?? row.user.email}
                      </p>
                      <span
                        className={cn(
                          "rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                          row.status === "PENDING"
                            ? "bg-tertiary-container/15 text-tertiary"
                            : row.status === "APPROVED"
                              ? "bg-primary/10 text-primary"
                              : "bg-surface-container-high text-on-surface-variant",
                        )}
                      >
                        {statusLabel(row.status)}
                      </span>
                    </div>
                    <p className="text-body-sm text-on-surface-variant">
                      {row.user.email}
                    </p>
                    <p className="text-[12px] text-on-surface-variant">{when}</p>
                    {row.message ? (
                      <p className="text-body-sm text-on-surface whitespace-pre-wrap rounded-lg bg-surface-container-low px-3 py-2 mt-1">
                        {row.message}
                      </p>
                    ) : (
                      <p className="text-body-sm text-on-surface-variant italic">
                        {t("admin.unlockNoMessage")}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 shrink-0">
                    {!userId ? (
                      <Link
                        href={localizedPath(
                          locale,
                          `/admin/utilisateurs/${row.user.id}`,
                        )}
                        className="inline-flex items-center gap-1 rounded-lg border border-outline-variant/40 px-3 py-2 text-label-sm font-semibold text-on-surface hover:bg-surface-container"
                      >
                        {t("admin.seeDetails")}
                      </Link>
                    ) : null}
                    {row.status === "PENDING" ? (
                      <>
                        <Button
                          type="button"
                          size="sm"
                          disabled={busy}
                          onClick={() => setConfirmUnlock(row)}
                        >
                          {t("admin.unlockApprove")}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="muted"
                          disabled={busy}
                          onClick={() => void act(row.id, "reject")}
                        >
                          {t("admin.unlockReject")}
                        </Button>
                      </>
                    ) : null}
                  </div>
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

      <ConfirmModal
        open={!!confirmUnlock}
        title={t("admin.unlockConfirmTitle")}
        description={
          confirmUnlock
            ? `${t("admin.unlockConfirmBody")} (${confirmUnlock.user.email})`
            : t("admin.unlockConfirmBody")
        }
        confirmLabel={t("admin.unlockConfirmAction")}
        confirming={!!actingId && actingId === confirmUnlock?.id}
        onConfirm={() => {
          if (confirmUnlock) void act(confirmUnlock.id, "approve");
        }}
        onCancel={() => {
          if (!actingId) setConfirmUnlock(null);
        }}
      />
    </>
  );
}
