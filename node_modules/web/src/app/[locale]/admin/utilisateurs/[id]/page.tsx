"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminUnlockRequestsPanel } from "@/components/admin/AdminUnlockRequestsPanel";
import { useAdminAccess } from "@/components/admin/useAdminAccess";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Icon } from "@/components/ui/Icon";
import { Pagination, useClientPagination } from "@/components/ui/Pagination";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/cn";
import type { PlanId } from "@/lib/admin-catalog";
import { localizedPath } from "@/i18n/path";
import { useI18n, useT } from "@/i18n/provider";

type ProfileRow = {
  id: string;
  slug: string;
  firstName: string;
  lastName: string;
  title: string;
  status: "DRAFT" | "PUBLISHED";
  theme: string;
  views: number;
  clicks: number;
  qrScans: number;
  isPrimary: boolean;
  updatedAt: string;
};

type UserDetail = {
  id: string;
  email: string;
  name: string | null;
  plan: "FREE" | "PRO" | "TEAM";
  role: "USER" | "ADMIN";
  lockedAt: string | null;
  failedLoginCount: number;
  createdAt: string;
  updatedAt: string;
  profiles: ProfileRow[];
};

type TabId = "compte" | "abonnement" | "acces" | "examens" | "profils";

type PlanOfferInfo = { name: string; priceMonthly: number };

const PLAN_OPTIONS = ["FREE", "PRO", "TEAM"] as const;
const ROLE_OPTIONS = ["USER", "ADMIN"] as const;

function DetailItem({
  label,
  value,
  className,
  mono,
}: {
  label: string;
  value: string;
  className?: string;
  mono?: boolean;
}) {
  return (
    <div className={cn("rounded-xl bg-surface-container-low px-3.5 py-3", className)}>
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-on-surface-variant">
        {label}
      </dt>
      <dd
        className={cn(
          "mt-1 text-sm font-medium text-on-surface break-all",
          mono && "font-mono text-[12px] text-on-surface-variant",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function MetaChip({
  icon,
  label,
  value,
  className,
}: {
  icon: string;
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl bg-surface-container-lowest px-4 py-3 shadow-sm",
        className,
      )}
    >
      <Icon name={icon} className="text-[18px] text-primary shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-on-surface-variant">{label}</p>
        <p className="truncate text-sm font-medium text-on-surface">{value}</p>
      </div>
    </div>
  );
}

export default function AdminUserDetailPage() {
  return (
    <AdminShell>
      <UserDetailContent />
    </AdminShell>
  );
}

function UserDetailContent() {
  const params = useParams<{ id: string }>();
  const t = useT();
  const { locale } = useI18n();
  const { toast } = useToast();
  const { ready, forbidden } = useAdminAccess();
  const dateLocale = locale === "en" ? "en-US" : "fr-FR";

  const [user, setUser] = useState<UserDetail | null>(null);
  const [planOffers, setPlanOffers] = useState<Record<PlanId, PlanOfferInfo> | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<TabId>("compte");
  const [unlockConfirmOpen, setUnlockConfirmOpen] = useState(false);
  const [pendingReviews, setPendingReviews] = useState(0);

  useEffect(() => {
    if (!ready || !params.id) return;
    let cancelled = false;
    void (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/users/${params.id}`);
        const data = await res.json();
        if (!res.ok) {
          if (!cancelled) toast(data.error ?? t("api.server"));
          return;
        }
        if (!cancelled) {
          setUser(data.user);
          setPlanOffers(data.planOffers ?? null);
        }
      } catch {
        if (!cancelled) toast(t("common.networkError"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ready, params.id, t, toast]);

  useEffect(() => {
    if (!ready || !params.id) return;
    void fetch(`/api/admin/unlock-requests?userId=${params.id}&status=PENDING`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.stats?.pendingCount != null) {
          setPendingReviews(data.stats.pendingCount);
        }
      })
      .catch(() => undefined);
  }, [ready, params.id, tab]);

  const profiles = user?.profiles ?? [];
  const {
    page: profilesPage,
    setPage: setProfilesPage,
    totalPages: profilesTotalPages,
    pageItems: profilePageItems,
    from: profilesFrom,
    to: profilesTo,
    total: profilesTotal,
  } = useClientPagination(profiles, 10, params.id);

  async function patch(body: { plan?: string; role?: string; unlock?: true }) {
    if (!user) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? t("api.server"));
        return;
      }
      setUser((prev) =>
        prev
          ? {
              ...prev,
              plan: data.user.plan,
              role: data.user.role,
              lockedAt: data.user.lockedAt ?? null,
              failedLoginCount: data.user.failedLoginCount ?? 0,
            }
          : prev,
      );
      if (body.unlock) {
        setUnlockConfirmOpen(false);
        toast(t("admin.userUnlocked"));
      } else toast(body.plan ? t("admin.planUpdated") : t("admin.roleUpdated"));
    } catch {
      toast(t("common.networkError"));
    } finally {
      setSaving(false);
    }
  }

  const metrics = useMemo(() => {
    if (!user) return { views: 0, clicks: 0, qr: 0, published: 0 };
    return user.profiles.reduce(
      (acc, p) => ({
        views: acc.views + p.views,
        clicks: acc.clicks + p.clicks,
        qr: acc.qr + p.qrScans,
        published: acc.published + (p.status === "PUBLISHED" ? 1 : 0),
      }),
      { views: 0, clicks: 0, qr: 0, published: 0 },
    );
  }, [user]);

  const tabs: { id: TabId; label: string; count?: number }[] = [
    { id: "compte", label: t("admin.tabAccount") },
    { id: "abonnement", label: t("admin.tabSubscription") },
    { id: "acces", label: t("admin.tabAccess") },
    {
      id: "examens",
      label: t("admin.tabUnlockReviews"),
      count: pendingReviews || undefined,
    },
    {
      id: "profils",
      label: t("admin.tabProfiles"),
      count: user?.profiles.length,
    },
  ];

  if (forbidden) {
    return (
      <p className="text-body-md text-on-surface-variant">{t("admin.forbidden")}</p>
    );
  }

  if (loading || !user) {
    return (
      <div className="w-full flex flex-col gap-space-lg max-w-6xl">
        <div className="h-52 w-full rounded-xl bg-surface-container animate-pulse" />
        <div className="h-96 w-full rounded-xl bg-surface-container animate-pulse" />
      </div>
    );
  }

  const displayName = user.name?.trim() || user.email;
  const parts = displayName.split(/\s+/);
  const initials =
    parts.length >= 2
      ? `${parts[0]!.charAt(0)}${parts[1]!.charAt(0)}`.toUpperCase()
      : displayName.slice(0, 2).toUpperCase();

  const joined = new Date(user.createdAt).toLocaleDateString(dateLocale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const updated = new Date(user.updatedAt).toLocaleDateString(dateLocale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const planLabel: Record<PlanId, string> = {
    FREE: planOffers?.FREE.name ?? t("admin.planFree"),
    PRO: planOffers?.PRO.name ?? t("admin.planPro"),
    TEAM: planOffers?.TEAM.name ?? t("admin.planTeam"),
  };
  const priceMonthly = planOffers?.[user.plan]?.priceMonthly ?? 0;
  const features = [
    t(`admin.feature.${user.plan}.a`),
    t(`admin.feature.${user.plan}.b`),
    t(`admin.feature.${user.plan}.c`),
    t(`admin.feature.${user.plan}.d`),
  ];

  return (
    <div className="mx-auto w-full max-w-6xl flex flex-col gap-space-lg">
      <div className="flex flex-col gap-space-md sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <Link
            href={localizedPath(locale, "/admin/utilisateurs")}
            className="inline-flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <Icon name="arrow_back" className="text-[16px]" />
            {t("admin.backToUsers")}
          </Link>
          <h1 className="mt-3 font-display text-2xl font-semibold text-on-surface tracking-tight">
            {t("admin.userDetailTitle")}
          </h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            {t("admin.userDetailSub")}
          </p>
        </div>
        {user.lockedAt ? (
          <Button
            type="button"
            size="sm"
            variant="primary"
            disabled={saving}
            className="shrink-0 self-start sm:mt-8"
            onClick={() => setUnlockConfirmOpen(true)}
          >
            <Icon name="lock_open" className="text-[16px]" />
            {t("admin.unlockUser")}
          </Button>
        ) : null}
      </div>

      {/* Hero — pattern Assainissement ProfileHero */}
      <section className="overflow-hidden rounded-xl border border-outline-variant/25 bg-surface-container-lowest shadow-sm">
        <div className="relative bg-gradient-to-br from-primary via-primary-container to-[#0a1f6e] px-6 py-8 text-on-primary sm:px-8">
          <div
            className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-white/10 blur-2xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-16 left-1/3 size-48 rounded-full bg-tertiary-container/25 blur-3xl"
            aria-hidden
          />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <span
                className="flex size-16 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 font-display text-xl font-bold backdrop-blur-sm"
                aria-hidden
              >
                {initials}
              </span>
              <div className="min-w-0">
                <h2 className="font-display text-2xl font-semibold text-white truncate">
                  {displayName}
                </h2>
                <p className="mt-1 text-sm text-on-primary-container truncate">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-full border border-white/20 bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                {user.plan}
              </span>
              <span className="inline-flex items-center rounded-full border border-white/20 bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                {user.role}
              </span>
              {user.lockedAt ? (
                <span className="inline-flex items-center rounded-full border border-error-container/40 bg-error-container px-3 py-1 text-xs font-semibold uppercase tracking-wide text-on-error-container">
                  {t("admin.lockedBadge")}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="grid gap-3 border-t border-outline-variant/20 bg-primary-fixed/25 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetaChip
            icon="badge"
            label={t("admin.colProfiles")}
            value={String(user.profiles.length)}
          />
          <MetaChip
            icon="publish"
            label={t("admin.publishedShort")}
            value={String(metrics.published)}
          />
          <MetaChip
            icon="visibility"
            label={t("admin.views")}
            value={metrics.views.toLocaleString(dateLocale)}
          />
          <MetaChip
            icon="calendar_month"
            label={t("admin.colJoined")}
            value={joined}
          />
        </div>
      </section>

      {/* Tabs */}
      <div
        role="tablist"
        aria-label={t("admin.userTabs")}
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
              onClick={() => setTab(item.id)}
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

      {tab === "compte" ? (
        <section className="rounded-xl border border-outline-variant/25 bg-surface-container-lowest shadow-sm overflow-hidden">
          <div className="flex items-start gap-3 border-b border-outline-variant/20 px-6 py-5">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/8 text-primary">
              <Icon name="person" className="text-[20px]" />
            </span>
            <div>
              <h3 className="font-semibold text-on-surface">{t("admin.userInfo")}</h3>
              <p className="mt-0.5 text-sm text-on-surface-variant">
                {t("admin.userInfoSub")}
              </p>
            </div>
          </div>
          <div className="p-6">
            <dl className="grid gap-3 sm:grid-cols-2">
              <DetailItem label={t("admin.displayName")} value={user.name ?? "—"} />
              <DetailItem label={t("admin.colUser")} value={user.email} />
              <DetailItem label={t("admin.colJoined")} value={joined} />
              <DetailItem label={t("admin.lastUpdate")} value={updated} />
              <DetailItem
                label={t("admin.qrScans")}
                value={metrics.qr.toLocaleString(dateLocale)}
              />
              <DetailItem
                label={t("admin.clicks")}
                value={metrics.clicks.toLocaleString(dateLocale)}
              />
              <DetailItem
                label={t("admin.userId")}
                value={user.id}
                mono
                className="sm:col-span-2"
              />
            </dl>
          </div>
        </section>
      ) : null}

      {tab === "abonnement" ? (
        <section className="rounded-xl border border-outline-variant/25 bg-surface-container-lowest shadow-sm overflow-hidden">
          <div className="flex items-start gap-3 border-b border-outline-variant/20 px-6 py-5">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/8 text-primary">
              <Icon name="credit_card" className="text-[20px]" />
            </span>
            <div>
              <h3 className="font-semibold text-on-surface">
                {t("admin.tabSubscription")}
              </h3>
              <p className="mt-0.5 text-sm text-on-surface-variant">
                {t("admin.subscriptionTabSub")}
              </p>
            </div>
          </div>
          <div className="p-6 space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-tertiary-fixed/80 px-3 py-1 text-xs font-bold uppercase tracking-wide text-on-tertiary-fixed-variant">
                {user.plan}
              </span>
              <span className="text-sm font-medium text-on-surface">
                {planLabel[user.plan]}
              </span>
              <span className="text-sm text-on-surface-variant">
                ·{" "}
                {priceMonthly === 0
                  ? t("admin.priceFree")
                  : t("admin.pricePerMonth", { price: priceMonthly })}
              </span>
            </div>

            <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <DetailItem
                label={t("admin.colPlan")}
                value={`${planLabel[user.plan]} (${user.plan})`}
              />
              <DetailItem
                label={t("admin.priceMonth")}
                value={
                  priceMonthly === 0
                    ? t("admin.priceFree")
                    : `${priceMonthly}€`
                }
              />
              <DetailItem
                label={t("admin.billingStatus")}
                value={t("admin.billingSimulated")}
              />
              <DetailItem
                label={t("admin.profileLimit")}
                value={t(`admin.limit.${user.plan}`)}
              />
              <DetailItem
                label={t("admin.colProfiles")}
                value={`${user.profiles.length} / ${
                  user.plan === "FREE" ? "1" : "∞"
                }`}
              />
              <DetailItem
                label={t("admin.publishedShort")}
                value={String(metrics.published)}
              />
            </dl>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-on-surface-variant mb-2">
                {t("admin.planIncludes")}
              </p>
              <ul className="grid gap-2 sm:grid-cols-2">
                {features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 rounded-xl bg-surface-container-low px-3.5 py-2.5 text-sm text-on-surface"
                  >
                    <Icon
                      name="check_circle"
                      className="text-[18px] text-primary shrink-0 mt-0.5"
                    />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant/15 pt-4">
              <p className="text-xs text-on-surface-variant max-w-md">
                {t("admin.subscriptionTabHint")}
              </p>
              <Button
                href={`/admin/abonnements/${user.plan.toLowerCase()}`}
                variant="brand"
                size="sm"
              >
                <Icon name="open_in_new" className="text-[16px]" />
                {t("admin.viewPlan")}
              </Button>
            </div>
          </div>
        </section>
      ) : null}

      {tab === "acces" ? (
        <section className="rounded-xl border border-outline-variant/25 bg-surface-container-lowest shadow-sm overflow-hidden">
          <div className="flex items-start gap-3 border-b border-outline-variant/20 px-6 py-5">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/8 text-primary">
              <Icon name="admin_panel_settings" className="text-[20px]" />
            </span>
            <div>
              <h3 className="font-semibold text-on-surface">{t("admin.tabAccess")}</h3>
              <p className="mt-0.5 text-sm text-on-surface-variant">
                {t("admin.accessSub")}
              </p>
            </div>
          </div>
          <div className="p-6 space-y-5 max-w-xl">
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-on-surface">
                {t("admin.colPlan")}
              </span>
              <select
                value={user.plan}
                disabled={saving}
                onChange={(e) => void patch({ plan: e.target.value })}
                className="h-11 w-full rounded-lg border border-outline-variant/40 bg-surface-container-lowest px-3 text-sm outline-none focus:border-primary-container focus:ring-2 focus:ring-primary/15"
              >
                {PLAN_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <span className="text-xs text-on-surface-variant">{t("admin.planHint")}</span>
            </label>

            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-on-surface">
                {t("admin.colRole")}
              </span>
              <select
                value={user.role}
                disabled={saving}
                onChange={(e) => void patch({ role: e.target.value })}
                className="h-11 w-full rounded-lg border border-outline-variant/40 bg-surface-container-lowest px-3 text-sm outline-none focus:border-primary-container focus:ring-2 focus:ring-primary/15"
              >
                {ROLE_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <span className="text-xs text-on-surface-variant">{t("admin.roleHint")}</span>
            </label>

            <div className="rounded-xl border border-outline-variant/25 bg-surface-container-low/60 p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-on-surface">
                    {t("admin.lockStatus")}
                  </p>
                  <p className="mt-0.5 text-xs text-on-surface-variant">
                    {user.lockedAt
                      ? t("admin.lockStatusLocked", {
                          date: new Date(user.lockedAt).toLocaleString(dateLocale, {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }),
                          count: user.failedLoginCount,
                        })
                      : t("admin.lockStatusActive", {
                          count: user.failedLoginCount,
                        })}
                  </p>
                </div>
                {user.lockedAt ? (
                  <span className="shrink-0 rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-error-container text-on-error-container">
                    {t("admin.lockedBadge")}
                  </span>
                ) : (
                  <span className="shrink-0 rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-primary/10 text-primary">
                    {t("admin.activeBadge")}
                  </span>
                )}
              </div>
            </div>

            {saving ? (
              <p className="text-sm text-on-surface-variant flex items-center gap-2">
                <Icon name="progress_activity" className="text-[18px] animate-spin" />
                {t("admin.saving")}
              </p>
            ) : null}
          </div>
        </section>
      ) : null}

      {tab === "examens" ? (
        <section className="flex flex-col gap-space-md">
          <div>
            <h3 className="font-semibold text-on-surface">
              {t("admin.tabUnlockReviews")}
            </h3>
            <p className="mt-0.5 text-sm text-on-surface-variant">
              {t("admin.unlockTabSub")}
            </p>
          </div>
          <AdminUnlockRequestsPanel
            ready={ready}
            userId={user.id}
            compact
            onPendingCountChange={setPendingReviews}
            onUnlocked={() => {
              setUser((prev) =>
                prev
                  ? { ...prev, lockedAt: null, failedLoginCount: 0 }
                  : prev,
              );
            }}
          />
        </section>
      ) : null}

      {tab === "profils" ? (
        <section className="rounded-xl border border-outline-variant/25 bg-surface-container-lowest shadow-sm overflow-hidden">
          <div className="flex items-start gap-3 border-b border-outline-variant/20 px-6 py-5">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/8 text-primary">
              <Icon name="account_box" className="text-[20px]" />
            </span>
            <div>
              <h3 className="font-semibold text-on-surface">{t("admin.userProfiles")}</h3>
              <p className="mt-0.5 text-sm text-on-surface-variant">
                {t("admin.profilesSub")}
              </p>
            </div>
          </div>

          {user.profiles.length === 0 ? (
            <p className="px-6 py-10 text-sm text-on-surface-variant text-center">
              {t("admin.noProfiles")}
            </p>
          ) : (
            <>
              <ul className="divide-y divide-outline-variant/15">
                {profilePageItems.map((p) => (
                  <li
                    key={p.id}
                    className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-on-surface">
                          {p.firstName} {p.lastName}
                        </p>
                        {p.isPrimary ? (
                          <span className="rounded-full bg-tertiary-fixed/80 px-2 py-0.5 text-[11px] font-semibold text-on-tertiary-fixed-variant">
                            {t("admin.primary")}
                          </span>
                        ) : null}
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                            p.status === "PUBLISHED"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-surface-container text-on-surface-variant",
                          )}
                        >
                          {p.status === "PUBLISHED"
                            ? t("admin.statusPublished")
                            : t("admin.statusDraft")}
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm text-on-surface-variant truncate">
                        {p.title || "—"}
                      </p>
                      <p className="mt-1 font-mono text-xs text-primary">/{p.slug}</p>
                      <p className="mt-2 text-xs text-on-surface-variant tabular-nums">
                        {p.views} {t("admin.views")} · {p.clicks} {t("admin.clicks")} ·{" "}
                        {p.theme}
                      </p>
                    </div>
                    <Button
                      href={`/p/${p.slug}`}
                      variant="outline"
                      size="sm"
                      target="_blank"
                      className="shrink-0 self-start"
                    >
                      {t("admin.openPublic")}
                    </Button>
                  </li>
                ))}
              </ul>
              <Pagination
                page={profilesPage}
                totalPages={profilesTotalPages}
                total={profilesTotal}
                from={profilesFrom}
                to={profilesTo}
                onPageChange={setProfilesPage}
              />
            </>
          )}
        </section>
      ) : null}

      <ConfirmModal
        open={unlockConfirmOpen}
        title={t("admin.unlockConfirmTitle")}
        description={t("admin.unlockConfirmBody")}
        confirmLabel={t("admin.unlockConfirmAction")}
        confirming={saving}
        onConfirm={() => void patch({ unlock: true })}
        onCancel={() => {
          if (!saving) setUnlockConfirmOpen(false);
        }}
      />
    </div>
  );
}
