"use client";

import { AppShell } from "@/components/app/AppShell";
import { Icon } from "@/components/ui/Icon";
import { dashboardKpis, profiles } from "@/lib/mock-data";
import { useI18n, useT } from "@/i18n/provider";

const chartBars = [42, 58, 35, 72, 64, 88, 76, 91, 68, 84, 95, 78];

export default function StatsPage() {
  const t = useT();
  const { locale } = useI18n();
  const numLocale = locale === "en" ? "en-US" : "fr-FR";

  return (
    <AppShell>
      <div className="flex flex-col w-full gap-space-xl max-w-6xl">
        <div>
          <h1 className="text-headline-lg text-on-surface font-bold">
            {t("app.stats.title")}
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            {t("app.stats.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">
          {[
            {
              label: t("app.stats.views"),
              value: dashboardKpis.views30d.value.toLocaleString(numLocale),
              delta: `+${dashboardKpis.views30d.deltaPct}%`,
              icon: "visibility",
            },
            {
              label: t("app.stats.clicks"),
              value: dashboardKpis.clicks.value.toLocaleString(numLocale),
              delta: `+${dashboardKpis.clicks.deltaPct}%`,
              icon: "ads_click",
            },
            {
              label: t("app.stats.qr"),
              value: dashboardKpis.qrScans.value.toLocaleString(numLocale),
              delta: `+${dashboardKpis.qrScans.deltaPct}%`,
              icon: "qr_code_scanner",
            },
            {
              label: t("app.stats.visits"),
              value: dashboardKpis.weeklyNewVisits.toLocaleString(numLocale),
              delta: t("app.stats.thisWeek"),
              icon: "trending_up",
            },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-md"
            >
              <div className="flex items-start justify-between">
                <span className="text-label-sm text-on-surface-variant uppercase tracking-wider">
                  {kpi.label}
                </span>
                <div className="w-8 h-8 rounded-lg bg-secondary-container flex items-center justify-center text-primary">
                  <Icon name={kpi.icon} className="text-[18px]" />
                </div>
              </div>
              <div>
                <p className="font-headline-xl text-headline-xl text-on-surface font-bold leading-none">
                  {kpi.value}
                </p>
                <p className="mt-2 font-label-sm text-label-sm text-[#059669]">{kpi.delta}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-md">
          <div className="lg:col-span-2 p-space-lg rounded-xl bg-surface-container-lowest shadow-sm">
            <div className="flex items-center justify-between mb-space-lg">
              <div>
                <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">
                  {t("app.stats.daily")}
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {t("app.stats.dailyHint")}
                </p>
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant px-2 py-1 rounded-lg bg-surface-container">
                Placeholder
              </span>
            </div>
            <div className="h-56 flex items-end gap-2 px-1">
              {chartBars.map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-primary-container to-primary/70 min-h-[8%]"
                    style={{ height: `${h}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-space-sm flex justify-between font-code-sm text-[11px] text-on-surface-variant">
              <span>S1</span>
              <span>S6</span>
              <span>S12</span>
            </div>
          </div>

          <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-md">
            <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">
              {t("app.stats.byProfile")}
            </h2>
            <ul className="flex flex-col gap-space-sm flex-1">
              {profiles.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between p-space-sm rounded-lg bg-surface-container-low"
                >
                  <div className="min-w-0">
                    <p className="font-label-sm text-label-sm text-on-surface font-semibold truncate">
                      {p.name}
                    </p>
                    <p className="font-code-sm text-[11px] text-on-surface-variant truncate">
                      /{p.slug}
                    </p>
                  </div>
                  <span className="font-headline-md text-[1rem] text-on-surface font-bold shrink-0 ml-2">
                    {p.stats?.views.toLocaleString(numLocale) ?? "—"}
                  </span>
                </li>
              ))}
            </ul>
            <div className="h-32 rounded-xl bg-surface-container-low border border-dashed border-outline-variant/40 flex items-center justify-center text-on-surface-variant font-body-sm text-body-sm">
              {t("app.stats.sources")}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
