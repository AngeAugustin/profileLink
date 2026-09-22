"use client";

import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useT } from "@/i18n/provider";

const INCLUDED = [
  { icon: "badge", key: "heroIncProfile" },
  { icon: "link", key: "heroIncLink" },
  { icon: "qr_code_2", key: "heroIncQr" },
  { icon: "insights", key: "heroIncAnalytics" },
] as const;

export function PricingHero() {
  const t = useT();

  return (
    <section className="relative overflow-hidden border-b border-outline-variant/15">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_20%_0%,rgba(29,78,216,0.11),transparent_55%),radial-gradient(ellipse_55%_50%_at_90%_70%,rgba(29,78,216,0.05),transparent_50%),linear-gradient(180deg,#f7f9fb_0%,#eef2f8_50%,#f7f9fb_100%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.28]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(15,23,42,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.045) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse 65% 55% at 78% 40%, black 12%, transparent 70%)",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-gutter pt-space-xl pb-space-xl">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] gap-space-xl items-center">
          <div className="text-center lg:text-left max-w-xl mx-auto lg:mx-0">
            <p className="text-label-sm font-semibold uppercase tracking-[0.14em] text-primary mb-space-sm">
              {t("marketing.pricing.pageEyebrow")}
            </p>
            <h1 className="text-headline-xl-mobile md:text-headline-xl lg:text-[2.6rem] lg:leading-[1.12] text-on-surface font-extrabold tracking-tight">
              {t("marketing.pricing.pageTitle")}
            </h1>
            <p className="mt-space-sm text-body-md text-on-surface-variant max-w-lg mx-auto lg:mx-0">
              {t("marketing.pricing.pageSubtitle")}
            </p>
            <div className="mt-space-md flex flex-col sm:flex-row gap-space-sm justify-center lg:justify-start">
              <Button href="#plans" size="md">
                {t("marketing.pricing.ctaCompare")}
              </Button>
              <Button href="/inscription" variant="outline" size="md">
                {t("marketing.pricing.ctaStart")}
              </Button>
            </div>
          </div>

          {/* Soft “from free” value panel */}
          <div
            aria-hidden
            className="relative w-full max-w-md mx-auto lg:ml-auto"
          >
            <div className="absolute -inset-3 rounded-[1.75rem] bg-primary/[0.06] blur-2xl pointer-events-none" />
            <div className="relative rounded-3xl border border-outline-variant/20 bg-surface-container-lowest/95 shadow-[0_20px_50px_rgba(15,23,42,0.07)] overflow-hidden backdrop-blur-sm p-space-md md:p-space-lg">
              <p className="text-label-sm font-semibold uppercase tracking-[0.12em] text-on-surface-variant">
                {t("marketing.pricing.heroFromLabel")}
              </p>
              <div className="mt-space-sm flex items-end gap-2">
                <span className="text-[3.25rem] leading-none font-extrabold tracking-tight text-on-surface tabular-nums">
                  0€
                </span>
                <span className="pb-1.5 text-body-sm text-on-surface-variant">
                  {t("marketing.pricing.heroFromHint")}
                </span>
              </div>

              <div className="mt-space-md h-1.5 rounded-full bg-surface-container-low overflow-hidden">
                <div className="h-full w-[38%] rounded-full bg-gradient-to-r from-primary/70 to-primary" />
              </div>
              <div className="mt-2 flex justify-between text-[0.6875rem] font-semibold uppercase tracking-wider text-on-surface-variant">
                <span>{t("marketing.pricing.starterName")}</span>
                <span className="text-primary">{t("marketing.pricing.proName")}</span>
                <span>{t("marketing.pricing.teamName")}</span>
              </div>

              <p className="mt-space-md text-label-sm font-semibold text-on-surface">
                {t("marketing.pricing.heroIncludedTitle")}
              </p>
              <ul className="mt-space-sm m-0 p-0 list-none grid grid-cols-2 gap-2">
                {INCLUDED.map((item) => (
                  <li
                    key={item.key}
                    className="flex items-center gap-2 rounded-xl bg-surface-container-low/80 px-2.5 py-2"
                  >
                    <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Icon name={item.icon} className="text-[15px]" />
                    </span>
                    <span className="text-label-sm font-semibold text-on-surface truncate">
                      {t(`marketing.pricing.${item.key}`)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
