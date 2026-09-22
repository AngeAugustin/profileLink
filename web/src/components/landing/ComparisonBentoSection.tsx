"use client";

import { Icon } from "@/components/ui/Icon";
import { useT } from "@/i18n/provider";

export function ComparisonBentoSection() {
  const t = useT();

  const metrics = [
    { value: "1 420", label: t("marketing.compare.b2Views"), tone: "text-on-surface" },
    { value: "38%", label: t("marketing.compare.b2Ctr"), tone: "text-primary" },
    { value: "12", label: t("marketing.compare.b2Meetings"), tone: "text-[#059669]" },
  ];

  const chips = [
    t("marketing.compare.b4Chip1"),
    t("marketing.compare.b4Chip2"),
    t("marketing.compare.b4Chip3"),
  ];

  return (
    <section className="w-full bg-surface py-space-xl">
      <div className="mx-auto max-w-7xl px-gutter">
        <div className="mb-space-xl flex flex-col justify-between gap-space-md md:flex-row md:items-end">
          <div>
            <span className="font-mono text-[13px] font-bold uppercase tracking-[0.05em] text-primary">
              {t("marketing.compare.eyebrow")}
            </span>
            <h2 className="mt-1 text-headline-xl-mobile font-bold text-on-surface md:text-headline-xl">
              {t("marketing.compare.title")}
            </h2>
          </div>
          <p className="max-w-md text-body-md text-on-surface-variant">
            {t("marketing.compare.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-space-md md:grid-cols-12">
          {/* Bento 1 — live updates */}
          <div className="flex flex-col rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm md:col-span-7">
            <div className="mb-space-md flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2">
                <Icon name="sync" className="text-primary" />
                <span className="text-label-md font-bold text-primary">
                  {t("marketing.compare.b1Badge")}
                </span>
              </div>
              <span className="rounded-full bg-[#ECFDF5] px-2.5 py-0.5 font-mono text-[13px] font-medium text-[#059669]">
                {t("marketing.compare.b1Pill")}
              </span>
            </div>
            <h3 className="mb-2 text-headline-md font-bold text-on-surface md:text-2xl">
              {t("marketing.compare.b1Title")}
            </h3>
            <p className="mb-space-md flex-1 text-body-md text-on-surface-variant">
              {t("marketing.compare.b1Body")}
            </p>
            <div className="flex flex-col gap-3 rounded-lg bg-surface-container-low p-space-md sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-body-sm text-on-surface-variant line-through">
                <Icon name="close" className="text-error text-sm" />
                {t("marketing.compare.b1Old")}
              </div>
              <div className="flex items-center gap-2 text-label-md font-bold text-[#059669]">
                <Icon name="check_circle" filled className="text-base" />
                {t("marketing.compare.b1New")}
              </div>
            </div>
          </div>

          {/* Bento 2 — analytics */}
          <div className="flex flex-col rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm md:col-span-5">
            <div className="mb-space-sm flex items-center gap-2">
              <Icon name="insights" className="text-primary-container" />
              <span className="text-label-md font-bold text-primary-container">
                {t("marketing.compare.b2Badge")}
              </span>
            </div>
            <h3 className="mb-2 text-headline-md font-semibold text-on-surface">
              {t("marketing.compare.b2Title")}
            </h3>
            <p className="mb-space-md text-body-sm text-on-surface-variant">
              {t("marketing.compare.b2Body")}
            </p>
            <div className="mt-auto flex items-center justify-around gap-2 rounded-lg bg-surface-container p-3">
              {metrics.map((m) => (
                <div key={m.label} className="text-center">
                  <div className={`font-mono text-[13px] font-bold ${m.tone}`}>{m.value}</div>
                  <div className="text-[11px] text-on-surface-variant">{m.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Bento 3 — multi-profiles */}
          <div className="flex flex-col rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm md:col-span-5">
            <div className="mb-space-sm flex items-center gap-2">
              <Icon name="layers" className="text-on-surface" />
              <span className="text-label-md font-bold text-on-surface">
                {t("marketing.compare.b3Badge")}
              </span>
            </div>
            <h3 className="mb-2 text-headline-md font-semibold text-on-surface">
              {t("marketing.compare.b3Title")}
            </h3>
            <p className="mb-space-md text-body-sm text-on-surface-variant">
              {t("marketing.compare.b3Body")}
            </p>
            <div className="mt-auto flex flex-wrap gap-2">
              <span className="rounded-lg bg-surface-container-high px-3 py-1.5 text-label-sm font-semibold text-on-surface">
                {t("marketing.compare.b3Tab1")}
              </span>
              <span className="rounded-lg bg-primary-fixed px-3 py-1.5 text-label-sm font-bold text-on-primary-fixed">
                {t("marketing.compare.b3Tab2")}
              </span>
              <span className="rounded-lg bg-surface-container px-3 py-1.5 text-label-sm font-semibold text-on-surface-variant">
                {t("marketing.compare.b3Tab3")}
              </span>
            </div>
          </div>

          {/* Bento 4 — proof */}
          <div className="flex flex-col rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm md:col-span-7">
            <div className="mb-space-md flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2">
                <Icon name="verified" className="text-tertiary-container" />
                <span className="text-label-md font-bold text-tertiary-container">
                  {t("marketing.compare.b4Badge")}
                </span>
              </div>
              <span className="rounded-full bg-tertiary-fixed px-2.5 py-0.5 font-mono text-[13px] font-medium text-on-tertiary-fixed">
                {t("marketing.compare.b4Pill")}
              </span>
            </div>
            <h3 className="mb-2 text-headline-md font-bold text-on-surface md:text-2xl">
              {t("marketing.compare.b4Title")}
            </h3>
            <p className="mb-space-md text-body-md text-on-surface-variant">
              {t("marketing.compare.b4Body")}
            </p>
            <div className="mt-auto flex flex-wrap gap-2">
              {chips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-lg border border-outline-variant/40 bg-surface-container-low px-3 py-2 font-mono text-[13px] font-medium text-on-surface"
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
