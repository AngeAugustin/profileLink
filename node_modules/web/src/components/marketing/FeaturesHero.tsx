"use client";

import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { ASSETS } from "@/lib/mock-data";
import { useT } from "@/i18n/provider";

const MODULES = [
  { icon: "edit_note", key: "chipEditor" },
  { icon: "link", key: "chipLink" },
  { icon: "qr_code_2", key: "chipQr" },
  { icon: "insights", key: "chipAnalytics" },
] as const;

export function FeaturesHero() {
  const t = useT();

  return (
    <section className="relative overflow-hidden border-b border-outline-variant/15">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_15%_0%,rgba(29,78,216,0.12),transparent_55%),radial-gradient(ellipse_60%_50%_at_90%_20%,rgba(163,57,0,0.06),transparent_50%),linear-gradient(180deg,#f7f9fb_0%,#eef2f8_48%,#f7f9fb_100%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(15,23,42,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.04) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse 75% 65% at 70% 40%, black 10%, transparent 70%)",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-gutter pt-space-xl pb-space-xl md:pb-[3.25rem]">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] gap-space-xl items-center">
          <div className="text-center lg:text-left max-w-xl mx-auto lg:mx-0">
            <p className="text-label-sm font-semibold uppercase tracking-[0.14em] text-primary mb-space-sm">
              {t("marketing.features.pageEyebrow")}
            </p>
            <h1 className="text-headline-xl-mobile md:text-headline-xl lg:text-[2.6rem] lg:leading-[1.12] text-on-surface font-extrabold tracking-tight">
              {t("marketing.features.pageTitle")}
            </h1>
            <p className="mt-space-sm text-body-md text-on-surface-variant max-w-lg mx-auto lg:mx-0">
              {t("marketing.features.pageSubtitle")}
            </p>
            <div className="mt-space-md flex flex-col sm:flex-row gap-space-sm justify-center lg:justify-start">
              <Button href="/inscription" size="md">
                {t("marketing.features.ctaCreate")}
              </Button>
              <Button href="/tarifs" variant="outline" size="md">
                {t("marketing.features.ctaPricing")}
              </Button>
            </div>
          </div>

          {/* Soft product tray: URL + QR mosaic + module list */}
          <div
            aria-hidden
            className="relative w-full max-w-md mx-auto lg:max-w-none lg:mx-0"
          >
            <div className="absolute -inset-3 rounded-[1.75rem] bg-primary/[0.06] blur-2xl pointer-events-none" />
            <div className="relative rounded-3xl bg-surface-container-lowest/90 border border-outline-variant/20 shadow-[0_24px_60px_rgba(15,23,42,0.08)] p-space-md md:p-space-lg backdrop-blur-sm">
              <div className="flex items-center gap-2 rounded-xl bg-surface-container-low border border-outline-variant/15 px-3 py-2.5 mb-space-md">
                <Icon name="lock" className="text-[16px] text-primary shrink-0" />
                <span className="font-mono text-[0.8125rem] text-on-surface-variant truncate">
                  profilelink.me/p/vous
                </span>
                <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5 text-[0.6875rem] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {t("marketing.features.mockLive")}
                </span>
              </div>

              <div className="grid grid-cols-[112px_minmax(0,1fr)] gap-space-md items-stretch">
                <div className="rounded-2xl bg-[linear-gradient(145deg,#e8eefc_0%,#f7f9fb_55%,#fff_100%)] border border-outline-variant/20 p-2.5 flex items-center justify-center">
                  <div className="relative w-full aspect-square">
                    <Image
                      src={ASSETS.avatarJean}
                      alt=""
                      fill
                      className="rounded-xl object-cover shadow-sm"
                      sizes="96px"
                    />
                    <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary text-on-primary border-2 border-surface-container-lowest flex items-center justify-center shadow-sm">
                      <Icon name="verified" className="text-[12px]" filled />
                    </span>
                  </div>
                </div>

                <ul className="m-0 p-0 list-none flex flex-col justify-between gap-1.5 min-h-0">
                  {MODULES.map((mod) => (
                    <li
                      key={mod.key}
                      className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 bg-surface-container-low/80 border border-transparent hover:border-outline-variant/25 transition-colors"
                    >
                      <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Icon name={mod.icon} className="text-[16px]" />
                      </span>
                      <span className="text-label-sm font-semibold text-on-surface truncate">
                        {t(`marketing.features.${mod.key}`)}
                      </span>
                      <Icon
                        name="check_circle"
                        className="text-[16px] text-primary ml-auto shrink-0"
                        filled
                      />
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-space-md grid grid-cols-3 gap-2">
                {[
                  { labelKey: "mockViews", value: "1,284" },
                  { labelKey: "mockClicks", value: "326" },
                  { labelKey: "mockScans", value: "98" },
                ].map((stat) => (
                  <div
                    key={stat.labelKey}
                    className="rounded-xl bg-surface-container-low/70 px-2.5 py-2 text-center"
                  >
                    <p className="text-[0.6875rem] uppercase tracking-wider text-on-surface-variant font-semibold">
                      {t(`marketing.features.${stat.labelKey}`)}
                    </p>
                    <p className="text-label-md font-bold text-on-surface tabular-nums mt-0.5">
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
