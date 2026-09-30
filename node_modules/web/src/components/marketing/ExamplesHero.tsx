"use client";

import { Icon } from "@/components/ui/Icon";
import { useT } from "@/i18n/provider";

const STATS = [
  { icon: "group", value: "45k+", labelKey: "statProfiles", tone: "text-primary" },
  {
    icon: "qr_code_scanner",
    value: "1.2M",
    labelKey: "statScans",
    tone: "text-tertiary-container",
  },
  { icon: "cloud_done", value: "99.98%", labelKey: "statUptime", tone: "text-primary" },
] as const;

export function ExamplesHero() {
  const t = useT();

  return (
    <section className="relative overflow-hidden border-b border-outline-variant/15">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_-10%,rgba(29,78,216,0.1),transparent_55%)]"
      />
      <div className="relative mx-auto max-w-4xl px-gutter pb-10 pt-12 text-center md:pb-12 md:pt-16">
        <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-primary">
          {t("marketing.examples.eyebrow")}
        </span>
        <h1 className="mt-5 text-[2rem] font-extrabold leading-tight tracking-tight text-on-surface md:text-[2.75rem] md:leading-[1.15]">
          {t("marketing.examples.title")}{" "}
          <span className="text-primary">{t("marketing.examples.titleBrand")}</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-on-surface-variant md:text-base">
          {t("marketing.examples.subtitle")}
        </p>

        <div className="mx-auto mt-8 flex flex-wrap items-stretch justify-center gap-3">
          {STATS.map((s) => (
            <div
              key={s.labelKey}
              className="inline-flex min-w-[160px] items-center gap-2.5 rounded-xl border border-outline-variant/25 bg-white px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 ${s.tone}`}
              >
                <Icon name={s.icon} className="text-lg" />
              </span>
              <div className="text-left">
                <p className="text-sm font-bold tabular-nums text-on-surface">{s.value}</p>
                <p className="text-[11px] font-medium text-on-surface-variant">
                  {t(`marketing.examples.${s.labelKey}`)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
