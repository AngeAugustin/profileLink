"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { useAdminAccess } from "@/components/admin/useAdminAccess";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import { localizedPath } from "@/i18n/path";
import { useI18n, useT } from "@/i18n/provider";

type StatsPayload = {
  overview: {
    totalAccounts: number;
    newAccounts30d: number;
    newAccounts7d: number;
    paidAccounts: number;
    simulatedMrr: number;
    totalProfiles: number;
    publishedProfiles: number;
    draftProfiles: number;
    totalViews: number;
    totalClicks: number;
    totalQrScans: number;
    byPlan: { FREE: number; PRO: number; TEAM: number };
  };
  signupsByMonth: { key: string; label: string; count: number }[];
  recentUsers: {
    id: string;
    name: string | null;
    email: string;
    plan: string;
    createdAt: string;
  }[];
  topProfiles: {
    id: string;
    slug: string;
    firstName: string;
    lastName: string;
    views: number;
    clicks: number;
    status: string;
    theme: string;
  }[];
};

export default function AdminStatsPage() {
  return (
    <AdminShell>
      <StatsContent />
    </AdminShell>
  );
}

function StatsContent() {
  const t = useT();
  const { locale } = useI18n();
  const { toast } = useToast();
  const { ready, forbidden } = useAdminAccess();
  const dateLocale = locale === "en" ? "en-US" : "fr-FR";
  const [data, setData] = useState<StatsPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/admin/stats");
        const json = await res.json();
        if (!res.ok) {
          if (!cancelled) toast(json.error ?? t("api.server"));
          return;
        }
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) toast(t("common.networkError"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ready, t, toast]);

  if (forbidden) {
    return (
      <p className="text-body-md text-on-surface-variant">{t("admin.forbidden")}</p>
    );
  }

  const o = data?.overview;
  const maxSignups = Math.max(
    1,
    ...(data?.signupsByMonth.map((m) => m.count) ?? [1]),
  );

  return (
    <div className="flex flex-col gap-space-xl w-full">
      <div>
        <h1 className="text-headline-lg text-on-surface font-bold">
          {t("admin.statsTitle")}
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">
          {t("admin.statsSub")}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-space-md">
        {[
          {
            label: t("admin.accounts"),
            value: o ? String(o.totalAccounts) : "…",
            hint: t("admin.new30d", { count: o?.newAccounts30d ?? 0 }),
            icon: "group",
          },
          {
            label: t("admin.paidPlans"),
            value: o ? String(o.paidAccounts) : "…",
            hint: t("admin.mrrValue", { value: o?.simulatedMrr ?? 0 }),
            icon: "workspace_premium",
          },
          {
            label: t("admin.profiles"),
            value: o ? `${o.publishedProfiles}/${o.totalProfiles}` : "…",
            hint: t("admin.draftsCount", { count: o?.draftProfiles ?? 0 }),
            icon: "badge",
          },
          {
            label: t("admin.engagement"),
            value: o ? o.totalViews.toLocaleString(dateLocale) : "…",
            hint: t("admin.engagementHint", {
              clicks: o?.totalClicks ?? 0,
              qr: o?.totalQrScans ?? 0,
            }),
            icon: "insights",
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-xl bg-surface-container-lowest shadow-sm p-space-md border border-outline-variant/20 flex gap-space-md"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Icon name={kpi.icon} className="text-[20px]" />
            </div>
            <div className="min-w-0">
              <p className="text-label-sm text-on-surface-variant">{kpi.label}</p>
              <p className="text-headline-md font-semibold text-on-surface tabular-nums">
                {loading ? "…" : kpi.value}
              </p>
              <p className="text-[12px] text-on-surface-variant truncate mt-0.5">
                {kpi.hint}
              </p>
            </div>
          </div>
        ))}
      </div>

      <section className="rounded-xl bg-surface-container-lowest shadow-sm p-space-lg border border-outline-variant/20">
        <h2 className="text-headline-md font-semibold text-on-surface mb-space-md">
          {t("admin.signupsChart")}
        </h2>
        <div className="h-44 flex items-end gap-2">
          {(data?.signupsByMonth ?? Array.from({ length: 6 }, (_, i) => ({
            key: String(i),
            label: "…",
            count: 0,
          }))).map((m) => (
            <div key={m.key} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
              <span className="text-[11px] font-mono text-on-surface-variant tabular-nums">
                {loading ? "—" : m.count}
              </span>
              <div
                className="w-full rounded-t-md bg-primary-container min-h-[4px] transition-[height] duration-500"
                style={{
                  height: `${Math.max(4, (m.count / maxSignups) * 100)}%`,
                }}
              />
              <span className="text-[10px] text-on-surface-variant font-mono">
                {m.label.slice(5)}
              </span>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-md">
        <section className="rounded-xl bg-surface-container-lowest shadow-sm border border-outline-variant/20 overflow-hidden">
          <div className="px-space-lg py-space-md border-b border-outline-variant/20">
            <h2 className="text-headline-md font-semibold text-on-surface">
              {t("admin.recentSignups")}
            </h2>
          </div>
          <ul className="divide-y divide-outline-variant/15">
            {(data?.recentUsers ?? []).length === 0 && !loading ? (
              <li className="px-space-lg py-space-md text-body-sm text-on-surface-variant">
                {t("admin.empty")}
              </li>
            ) : (
              (data?.recentUsers ?? []).map((u) => (
                <li key={u.id}>
                  <Link
                    href={localizedPath(locale, `/admin/utilisateurs/${u.id}`)}
                    className="flex items-center justify-between gap-space-md px-space-lg py-space-md hover:bg-surface-container-low/60"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-on-surface truncate">
                        {u.name ?? u.email}
                      </p>
                      <p className="text-[12px] text-on-surface-variant truncate">
                        {u.email}
                      </p>
                    </div>
                    <Badge tone="neutral">{u.plan}</Badge>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </section>

        <section className="rounded-xl bg-surface-container-lowest shadow-sm border border-outline-variant/20 overflow-hidden">
          <div className="px-space-lg py-space-md border-b border-outline-variant/20">
            <h2 className="text-headline-md font-semibold text-on-surface">
              {t("admin.topProfiles")}
            </h2>
          </div>
          <ul className="divide-y divide-outline-variant/15">
            {(data?.topProfiles ?? []).length === 0 && !loading ? (
              <li className="px-space-lg py-space-md text-body-sm text-on-surface-variant">
                {t("admin.empty")}
              </li>
            ) : (
              (data?.topProfiles ?? []).map((p, i) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between gap-space-md px-space-lg py-space-md"
                >
                  <div className="flex items-center gap-space-sm min-w-0">
                    <span className="font-mono text-[12px] text-on-surface-variant w-5">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-on-surface truncate">
                        {p.firstName} {p.lastName}
                      </p>
                      <p className="text-[12px] text-on-surface-variant font-mono truncate">
                        /{p.slug}
                      </p>
                    </div>
                  </div>
                  <p className="text-label-sm font-semibold tabular-nums shrink-0">
                    {p.views.toLocaleString(dateLocale)}
                  </p>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
