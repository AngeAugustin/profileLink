"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/app/AppShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import type { AppNotification } from "@/components/app/NotificationsBell";
import { cn } from "@/lib/cn";
import { notificationIcon } from "@/lib/notifications-client";
import { localizedPath } from "@/i18n/path";
import { useI18n, useT } from "@/i18n/provider";

type SettingsTab = "subscription" | "notifications" | "preferences";
type PlanId = "FREE" | "PRO" | "TEAM";

function isPlanId(value: string): value is PlanId {
  return value === "FREE" || value === "PRO" || value === "TEAM";
}

function isSettingsTab(value: string | null): value is SettingsTab {
  return (
    value === "subscription" ||
    value === "notifications" ||
    value === "preferences"
  );
}

/** Next billing / quota reset after the subscription anniversary. */
function nextResetDate(subscribedAt: Date, plan: PlanId): Date {
  const now = new Date();
  const reset = new Date(subscribedAt);
  const stepMonths = plan === "FREE" ? 1 : 12;

  let guard = 0;
  while (reset <= now && guard < 240) {
    reset.setMonth(reset.getMonth() + stepMonths);
    guard += 1;
  }
  return reset;
}

function daysUntil(date: Date): number {
  const ms = date.getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

function formatDate(date: Date, locale: string): string {
  return date.toLocaleDateString(locale === "en" ? "en-GB" : "fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDateTime(iso: string, locale: string): string {
  return new Date(iso).toLocaleString(locale === "en" ? "en-GB" : "fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SettingsPage() {
  return (
    <AppShell>
      <Suspense fallback={null}>
        <SettingsContent />
      </Suspense>
    </AppShell>
  );
}

function SettingsContent() {
  const { toast } = useToast();
  const t = useT();
  const { locale } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab");

  const [tab, setTab] = useState<SettingsTab>(
    isSettingsTab(initialTab) ? initialTab : "subscription",
  );
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [productTips, setProductTips] = useState(false);
  const [prefsLoaded, setPrefsLoaded] = useState(false);
  const [prefsSaving, setPrefsSaving] = useState(false);
  const [plan, setPlan] = useState<PlanId>("FREE");
  const [subscribedAt, setSubscribedAt] = useState<Date | null>(null);
  const [planOpen, setPlanOpen] = useState(false);

  const [inbox, setInbox] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [inboxLoading, setInboxLoading] = useState(true);

  useEffect(() => {
    if (isSettingsTab(initialTab)) setTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    void fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const nextPlan = data?.user?.plan;
        if (typeof nextPlan === "string" && isPlanId(nextPlan)) {
          setPlan(nextPlan);
        }
        if (data?.user?.createdAt) {
          setSubscribedAt(new Date(data.user.createdAt));
        }
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    void fetch("/api/notifications/preferences")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const p = data?.preferences;
        if (!p) return;
        setEmailNotifs(Boolean(p.emailAlerts));
        setWeeklyDigest(Boolean(p.weeklyDigest));
        setProductTips(Boolean(p.productTips));
      })
      .catch(() => undefined)
      .finally(() => setPrefsLoaded(true));
  }, []);

  const loadInbox = useCallback(async () => {
    setInboxLoading(true);
    try {
      const res = await fetch("/api/notifications?limit=40");
      if (!res.ok) return;
      const data = await res.json();
      setInbox(data.notifications ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } catch {
      /* ignore */
    } finally {
      setInboxLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === "notifications") void loadInbox();
  }, [tab, loadInbox]);

  useEffect(() => {
    void fetch("/api/notifications?limit=1")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (typeof data?.unreadCount === "number") {
          setUnreadCount(data.unreadCount);
        }
      })
      .catch(() => undefined);
  }, []);

  const resetAt = useMemo(() => {
    if (!subscribedAt) return null;
    return nextResetDate(subscribedAt, plan);
  }, [subscribedAt, plan]);

  const daysLeft = resetAt ? daysUntil(resetAt) : null;

  const currentPlanMeta: Record<PlanId, { title: string; features: string }> = {
    FREE: {
      title: t("app.settings.planFreeTitle"),
      features: t("app.settings.planFreeFeatures"),
    },
    PRO: {
      title: t("app.settings.planPro"),
      features: t("app.settings.planProFeatures"),
    },
    TEAM: {
      title: t("app.settings.planTeamTitle"),
      features: t("app.settings.planTeamFeatures"),
    },
  };

  const upgradeTarget: PlanId | null =
    plan === "FREE" ? "PRO" : plan === "PRO" ? "TEAM" : null;

  const tabs: { id: SettingsTab; label: string; icon: string }[] = [
    {
      id: "subscription",
      label: t("app.settings.subscription"),
      icon: "workspace_premium",
    },
    {
      id: "notifications",
      label: t("app.settings.notifications"),
      icon: "notifications",
    },
    {
      id: "preferences",
      label: t("app.settings.notifPrefs"),
      icon: "tune",
    },
  ];

  async function savePrefs() {
    setPrefsSaving(true);
    try {
      const res = await fetch("/api/notifications/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailAlerts: emailNotifs,
          weeklyDigest,
          productTips,
        }),
      });
      if (!res.ok) {
        toast(t("common.serverError"));
        return;
      }
      toast(t("app.settings.prefsSaved"));
    } catch {
      toast(t("common.networkError"));
    } finally {
      setPrefsSaving(false);
    }
  }

  async function markRead(id: string) {
    setInbox((prev) =>
      prev.map((n) =>
        n.id === id && !n.readAt ? { ...n, readAt: new Date().toISOString() } : n,
      ),
    );
    setUnreadCount((c) => Math.max(0, c - 1));
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
    } catch {
      void loadInbox();
    }
  }

  async function markAllRead() {
    setInbox((prev) =>
      prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })),
    );
    setUnreadCount(0);
    try {
      await fetch("/api/notifications/read-all", { method: "POST" });
    } catch {
      void loadInbox();
    }
  }

  return (
    <div className="flex flex-col w-full gap-space-xl">
      <div>
        <h1 className="text-headline-lg text-on-surface font-bold">
          {t("app.settings.title")}
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">
          {t("app.settings.subtitle")}
        </p>
      </div>

      <div
        className="flex gap-1 border-b border-outline-variant/30 overflow-x-auto -mx-1 px-1 scrollbar-none"
        role="tablist"
        aria-label={t("app.settings.title")}
      >
        {tabs.map((item) => {
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              id={`settings-tab-${item.id}`}
              aria-controls={`settings-panel-${item.id}`}
              onClick={() => {
                setTab(item.id);
                router.replace(
                  localizedPath(locale, `/app/parametres?tab=${item.id}`),
                  { scroll: false },
                );
              }}
              className={cn(
                "inline-flex items-center gap-2 px-space-md py-2.5 text-label-md font-semibold border-b-2 -mb-px transition-colors shrink-0 whitespace-nowrap",
                active
                  ? "border-primary text-primary"
                  : "border-transparent text-on-surface-variant hover:text-on-surface",
              )}
            >
              <Icon name={item.icon} className="text-[18px]" />
              {item.label}
              {item.id === "notifications" && unreadCount > 0 ? (
                <span className="ml-0.5 inline-flex min-w-5 h-5 items-center justify-center rounded-full bg-primary text-on-primary text-[10px] font-bold px-1">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {tab === "subscription" ? (
        <section
          id="settings-panel-subscription"
          role="tabpanel"
          aria-labelledby="settings-tab-subscription"
          className="rounded-xl bg-surface-container-lowest shadow-sm p-space-lg flex flex-col gap-space-md"
        >
          <div className="flex items-center justify-between gap-space-md flex-wrap">
            <div className="flex items-center gap-space-sm">
              <div className="w-9 h-9 rounded-lg bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center">
                <Icon name="workspace_premium" />
              </div>
              <div>
                <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">
                  {t("app.settings.subscription")}
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {t("app.settings.subSubtitle")}
                </p>
              </div>
            </div>
            <Badge tone="tertiary" className="uppercase tracking-wider">
              {plan}
            </Badge>
          </div>

          <div className="rounded-xl bg-surface-container-low overflow-hidden">
            <div className="p-space-md flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
              <div>
                <p className="font-label-md text-label-md text-on-surface font-semibold">
                  {currentPlanMeta[plan].title}
                </p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {currentPlanMeta[plan].features}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                aria-expanded={planOpen}
                aria-controls="plan-details"
                onClick={() => setPlanOpen((open) => !open)}
              >
                <Icon
                  name={planOpen ? "expand_less" : "expand_more"}
                  className="text-[18px]"
                />
                {planOpen
                  ? t("app.settings.hidePlan")
                  : t("app.settings.managePlan")}
              </Button>
            </div>

            <div
              id="plan-details"
              className={cn(
                "grid transition-[grid-template-rows] duration-300 ease-out",
                planOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
            >
              <div className="overflow-hidden">
                <div className="border-t border-outline-variant/20 px-space-md pb-space-md pt-space-md flex flex-col gap-space-md">
                  <dl className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl bg-surface-container-lowest p-space-md border border-outline-variant/15">
                      <dt className="text-[11px] font-semibold uppercase tracking-wide text-on-surface-variant">
                        {t("app.settings.subscribedAt")}
                      </dt>
                      <dd className="mt-1.5 text-label-md font-semibold text-on-surface">
                        {subscribedAt ? formatDate(subscribedAt, locale) : "—"}
                      </dd>
                    </div>
                    <div className="rounded-xl bg-surface-container-lowest p-space-md border border-outline-variant/15">
                      <dt className="text-[11px] font-semibold uppercase tracking-wide text-on-surface-variant">
                        {t("app.settings.daysUntilReset")}
                      </dt>
                      <dd className="mt-1.5 text-label-md font-semibold text-on-surface">
                        {daysLeft != null
                          ? t("app.settings.daysLeft", { count: daysLeft })
                          : "—"}
                      </dd>
                    </div>
                    <div className="rounded-xl bg-surface-container-lowest p-space-md border border-outline-variant/15">
                      <dt className="text-[11px] font-semibold uppercase tracking-wide text-on-surface-variant">
                        {t("app.settings.resetAt")}
                      </dt>
                      <dd className="mt-1.5 text-label-md font-semibold text-on-surface">
                        {resetAt ? formatDate(resetAt, locale) : "—"}
                      </dd>
                    </div>
                  </dl>

                  {upgradeTarget ? (
                    <div className="rounded-xl border border-primary/20 bg-primary/5 p-space-md flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
                      <div className="flex items-start gap-space-sm min-w-0">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Icon name="rocket_launch" className="text-[18px]" />
                        </span>
                        <div className="min-w-0">
                          <p className="font-label-md text-label-md font-semibold text-on-surface">
                            {t(`app.settings.upgradeTo.${upgradeTarget}.title`)}
                          </p>
                          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                            {t(`app.settings.upgradeTo.${upgradeTarget}.blurb`)}
                          </p>
                        </div>
                      </div>
                      <Button
                        href={upgradeTarget === "TEAM" ? "/contact" : "/tarifs"}
                        size="sm"
                        className="shrink-0 self-start sm:self-auto"
                      >
                        <Icon name="arrow_upward" className="text-[16px]" />
                        {t(`app.settings.upgradeTo.${upgradeTarget}.cta`)}
                      </Button>
                    </div>
                  ) : (
                    <div className="rounded-xl bg-surface-container-lowest border border-outline-variant/15 p-space-md flex items-start gap-space-sm">
                      <Icon
                        name="verified"
                        className="text-[20px] text-primary shrink-0 mt-0.5"
                      />
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        {t("app.settings.highestPlan")}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {tab === "notifications" ? (
        <section
          id="settings-panel-notifications"
          role="tabpanel"
          aria-labelledby="settings-tab-notifications"
          className="rounded-xl bg-surface-container-lowest shadow-sm overflow-hidden"
        >
            <div className="flex items-center justify-between gap-space-md flex-wrap px-space-lg py-space-md border-b border-outline-variant/20">
              <div className="flex items-center gap-space-sm">
                <div className="w-9 h-9 rounded-lg bg-secondary-container text-primary flex items-center justify-center">
                  <Icon name="inbox" />
                </div>
                <div>
                  <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">
                    {t("app.notifications.inboxTitle")}
                  </h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    {unreadCount > 0
                      ? t("app.notifications.unreadCount", { count: unreadCount })
                      : t("app.notifications.allRead")}
                  </p>
                </div>
              </div>
              {unreadCount > 0 ? (
                <Button variant="outline" size="sm" onClick={() => void markAllRead()}>
                  {t("app.notifications.markAllRead")}
                </Button>
              ) : null}
            </div>

            {inboxLoading ? (
              <p className="px-space-lg py-space-xl text-body-sm text-on-surface-variant text-center">
                {t("common.loading")}
              </p>
            ) : inbox.length === 0 ? (
              <div className="px-space-lg py-space-xl text-center">
                <Icon
                  name="notifications_off"
                  className="text-[32px] text-on-surface-variant/40 mx-auto"
                />
                <p className="mt-2 text-body-sm text-on-surface-variant">
                  {t("app.notifications.empty")}
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-outline-variant/15">
                {inbox.map((n) => {
                  const unread = !n.readAt;
                  const inner = (
                    <div className="flex gap-space-sm px-space-lg py-space-md">
                      <span
                        className={cn(
                          "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg",
                          unread
                            ? "bg-primary/10 text-primary"
                            : "bg-surface-container text-on-surface-variant",
                        )}
                      >
                        <Icon name={notificationIcon(n.type)} className="text-[18px]" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={cn(
                              "text-label-md text-on-surface",
                              unread && "font-semibold",
                            )}
                          >
                            {n.title}
                          </p>
                          {unread ? (
                            <span className="mt-2 size-2 shrink-0 rounded-full bg-primary" />
                          ) : null}
                        </div>
                        {n.body ? (
                          <p className="mt-0.5 text-body-sm text-on-surface-variant">
                            {n.body}
                          </p>
                        ) : null}
                        <p className="mt-1 text-[11px] text-on-surface-variant">
                          {formatDateTime(n.createdAt, locale)}
                        </p>
                      </div>
                    </div>
                  );

                  return (
                    <li
                      key={n.id}
                      className={cn(unread && "bg-primary/[0.03]")}
                    >
                      {n.href ? (
                        <Link
                          href={localizedPath(locale, n.href)}
                          onClick={() => {
                            if (unread) void markRead(n.id);
                          }}
                          className="block hover:bg-surface-container/80 transition-colors"
                        >
                          {inner}
                        </Link>
                      ) : (
                        <button
                          type="button"
                          className="w-full text-left hover:bg-surface-container/80 transition-colors"
                          onClick={() => {
                            if (unread) void markRead(n.id);
                          }}
                        >
                          {inner}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
        </section>
      ) : null}

      {tab === "preferences" ? (
        <section
          id="settings-panel-preferences"
          role="tabpanel"
          aria-labelledby="settings-tab-preferences"
          className="rounded-xl bg-surface-container-lowest shadow-sm p-space-lg flex flex-col gap-space-md"
        >
            <div className="flex items-center gap-space-sm">
              <div className="w-9 h-9 rounded-lg bg-surface-container text-on-surface-variant flex items-center justify-center">
                <Icon name="tune" />
              </div>
              <div>
                <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">
                  {t("app.settings.notifPrefs")}
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {t("app.settings.notifPrefsSub")}
                </p>
              </div>
            </div>
            {[
              {
                label: t("app.settings.emailAlerts"),
                value: emailNotifs,
                set: setEmailNotifs,
              },
              {
                label: t("app.settings.weekly"),
                value: weeklyDigest,
                set: setWeeklyDigest,
              },
              {
                label: t("app.settings.tips"),
                value: productTips,
                set: setProductTips,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between p-space-md rounded-xl bg-surface-container-low"
              >
                <span className="font-label-md text-label-md text-on-surface">
                  {item.label}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={item.value}
                    disabled={!prefsLoaded}
                    onChange={(e) => item.set(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-surface-container-highest rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary peer-disabled:opacity-50" />
                </label>
              </div>
            ))}
            <Button
              variant="muted"
              size="sm"
              className="self-start"
              disabled={!prefsLoaded || prefsSaving}
              onClick={() => void savePrefs()}
            >
              {prefsSaving ? t("common.loading") : t("app.settings.saveNotifs")}
            </Button>
        </section>
      ) : null}
    </div>
  );
}
