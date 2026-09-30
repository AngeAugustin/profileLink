"use client";

import Image from "next/image";
import { Icon } from "@/components/ui/Icon";
import { useT } from "@/i18n/provider";

export function FeaturesPillars() {
  const t = useT();

  const profiles = [
    {
      initials: "VP",
      color: "bg-primary-container",
      name: t("marketing.features.p1Role1"),
      slug: "profilelink.me/p/jean-dupont",
      badge: t("marketing.features.p1BadgePublic"),
      badgeTone: "bg-primary/10 text-primary",
      active: true,
    },
    {
      initials: "AD",
      color: "bg-tertiary-container",
      name: t("marketing.features.p1Role2"),
      slug: "profilelink.me/p/jean-advisory",
      badge: t("marketing.features.p1BadgePassword"),
      badgeTone: "bg-[#FFDBCE] text-[#7c2900]",
      active: false,
    },
    {
      initials: "SP",
      color: "bg-surface-container-high text-on-surface",
      name: t("marketing.features.p1Role3"),
      slug: "profilelink.me/p/jean-keynotes",
      badge: t("marketing.features.p1BadgeActive"),
      badgeTone: "bg-primary/10 text-primary",
      active: false,
    },
  ];

  const embeds = [
    {
      icon: "brush",
      title: t("marketing.features.p3Embed1"),
      sub: t("marketing.features.p3Embed1Sub"),
    },
    {
      icon: "code",
      title: t("marketing.features.p3Embed2"),
      sub: t("marketing.features.p3Embed2Sub"),
    },
    {
      icon: "calendar_month",
      title: t("marketing.features.p3Embed3"),
      sub: t("marketing.features.p3Embed3Sub"),
      accent: true,
    },
  ];

  const metrics = [
    {
      label: t("marketing.features.p4Metric1"),
      value: "1,842",
      hint: t("marketing.features.p4Metric1Hint"),
      tone: "text-primary",
    },
    {
      label: t("marketing.features.p4Metric2"),
      value: "64.3%",
      hint: t("marketing.features.p4Metric2Hint"),
      tone: "text-tertiary-container",
    },
    {
      label: t("marketing.features.p4Metric3"),
      value: "128",
      hint: t("marketing.features.p4Metric3Hint"),
      tone: "text-on-surface",
    },
  ];

  const sources = [
    { label: t("marketing.features.p4Src1"), value: "54%", bar: "w-[54%] bg-primary" },
    {
      label: t("marketing.features.p4Src2"),
      value: "31%",
      bar: "w-[31%] bg-tertiary-container",
    },
    { label: t("marketing.features.p4Src3"), value: "15%", bar: "w-[15%] bg-outline" },
  ];

  return (
    <section id="architecture" className="w-full scroll-mt-24 py-10 md:py-14">
      <div className="mx-auto max-w-7xl px-gutter">
        <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              {t("marketing.features.pillarsEyebrow")}
            </p>
            <h2 className="text-[1.75rem] font-bold tracking-tight text-on-surface md:text-4xl md:leading-[44px]">
              {t("marketing.features.pillarsTitle")}
            </h2>
          </div>
          <p className="max-w-md text-[15px] leading-6 text-on-surface-variant lg:text-right">
            {t("marketing.features.pillarsSubtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Pilier 1 — Multi */}
          <article className="relative overflow-hidden rounded-3xl border border-outline-variant/30 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)] lg:col-span-7">
            <div className="mb-6">
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon name="switch_account" className="text-lg" />
                </span>
                <span className="rounded bg-surface-container-low px-2 py-0.5 text-xs font-semibold tracking-wide text-on-surface-variant">
                  {t("marketing.features.pillar01")}
                </span>
              </div>
              <h3 className="text-xl font-bold tracking-tight text-on-surface">
                {t("marketing.features.p1Title")}
              </h3>
              <p className="mt-2 text-[15px] leading-6 text-on-surface-variant">
                {t("marketing.features.p1Body")}
              </p>
            </div>

            <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-mono text-xs font-medium uppercase tracking-wide text-on-surface-variant">
                  {t("marketing.features.p1Switcher")}
                </span>
                <span className="font-mono text-xs font-semibold text-primary">
                  {t("marketing.features.p1Active")}
                </span>
              </div>
              <ul className="m-0 flex list-none flex-col gap-2 p-0">
                {profiles.map((p) => (
                  <li
                    key={p.slug}
                    className="flex items-center justify-between gap-3 rounded-lg bg-white px-2 py-2 shadow-sm"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${p.color}`}
                      >
                        {p.initials}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-on-surface">{p.name}</p>
                        <p className="truncate font-mono text-[12px] text-on-surface-variant">
                          {p.slug}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className={`rounded px-2 py-0.5 text-[11px] font-semibold ${p.badgeTone}`}>
                        {p.badge}
                      </span>
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${p.active ? "bg-primary" : "bg-outline"}`}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </article>

          {/* Pilier 2 — QR */}
          <article className="rounded-3xl border border-outline-variant/30 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)] lg:col-span-5">
            <div className="mb-5">
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FFDBCE] text-tertiary-container">
                  <Icon name="qr_code_2" className="text-lg" />
                </span>
                <span className="rounded bg-surface-container-low px-2 py-0.5 text-xs font-semibold tracking-wide text-on-surface-variant">
                  {t("marketing.features.pillar02")}
                </span>
              </div>
              <h3 className="text-xl font-bold tracking-tight text-on-surface">
                {t("marketing.features.p2Title")}
              </h3>
              <p className="mt-2 text-[15px] leading-6 text-on-surface-variant">
                {t("marketing.features.p2Body")}
              </p>
            </div>
            <div className="flex flex-col items-center rounded-xl bg-surface-container-low p-6">
              <div className="relative rounded-2xl bg-white p-4 shadow-md">
                <Image
                  src="/images/hero/qr-code.svg"
                  alt=""
                  width={144}
                  height={144}
                  className="h-36 w-36"
                />
                <span className="absolute inset-0 m-auto flex h-8 w-8 items-center justify-center rounded-full bg-white text-xs font-extrabold text-primary shadow-md">
                  PL
                </span>
              </div>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {[t("marketing.features.chipSvg"), t("marketing.features.chipPng"), "PDF Presse"].map(
                  (chip) => (
                    <span
                      key={chip}
                      className="rounded-lg bg-white px-3 py-1.5 text-[11px] font-semibold text-on-surface shadow-sm"
                    >
                      {chip}
                    </span>
                  ),
                )}
              </div>
            </div>
          </article>

          {/* Pilier 3 — Embeds */}
          <article className="rounded-3xl border border-outline-variant/30 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)] lg:col-span-5">
            <div className="mb-5">
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-container text-on-surface">
                  <Icon name="widgets" className="text-lg" />
                </span>
                <span className="rounded bg-surface-container-low px-2 py-0.5 text-xs font-semibold tracking-wide text-on-surface-variant">
                  {t("marketing.features.pillar03")}
                </span>
              </div>
              <h3 className="text-xl font-bold tracking-tight text-on-surface">
                {t("marketing.features.p3Title")}
              </h3>
              <p className="mt-2 text-[15px] leading-6 text-on-surface-variant">
                {t("marketing.features.p3Body")}
              </p>
            </div>
            <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
              {embeds.map((e) => (
                <li
                  key={e.title}
                  className="flex items-center justify-between gap-3 rounded-xl border border-outline-variant/20 bg-surface-container-low px-3 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ${e.accent ? "text-tertiary-container" : "text-on-surface"}`}
                    >
                      <Icon name={e.icon} className="text-base" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-on-surface">{e.title}</p>
                      <p className="truncate text-xs text-on-surface-variant">{e.sub}</p>
                    </div>
                  </div>
                  <Icon name="chevron_right" className="shrink-0 text-on-surface-variant" />
                </li>
              ))}
            </ul>
          </article>

          {/* Pilier 4 — Analytics */}
          <article className="rounded-3xl border border-outline-variant/30 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)] lg:col-span-7">
            <div className="mb-5">
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon name="insights" className="text-lg" />
                </span>
                <span className="rounded bg-surface-container-low px-2 py-0.5 text-xs font-semibold tracking-wide text-on-surface-variant">
                  {t("marketing.features.pillar04")}
                </span>
              </div>
              <h3 className="text-xl font-bold tracking-tight text-on-surface">
                {t("marketing.features.p4Title")}
              </h3>
              <p className="mt-2 text-[15px] leading-6 text-on-surface-variant">
                {t("marketing.features.p4Body")}
              </p>
            </div>
            <div className="rounded-xl bg-surface-container-low p-4">
              <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {metrics.map((m) => (
                  <div
                    key={m.label}
                    className="rounded-xl bg-white p-3 shadow-sm"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-on-surface-variant">
                      {m.label}
                    </p>
                    <p className={`mt-1 text-2xl font-extrabold tabular-nums ${m.tone}`}>
                      {m.value}
                    </p>
                    <p className={`text-xs font-semibold ${m.tone}`}>{m.hint}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-lg bg-white p-3 shadow-sm">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="font-mono text-[11px] font-medium uppercase tracking-wide text-on-surface-variant">
                    {t("marketing.features.p4Sources")}
                  </span>
                  <span className="font-mono text-[11px] font-medium uppercase tracking-wide text-on-surface-variant">
                    {t("marketing.features.p4Compliant")}
                  </span>
                </div>
                <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
                  {sources.map((s) => (
                    <li key={s.label}>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="font-medium text-on-surface">{s.label}</span>
                        <span className="font-semibold text-on-surface-variant">{s.value}</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-surface-container">
                        <div className={`h-full rounded-full ${s.bar}`} />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
