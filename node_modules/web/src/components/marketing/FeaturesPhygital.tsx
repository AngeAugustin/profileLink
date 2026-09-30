"use client";

import { Icon } from "@/components/ui/Icon";
import { useT } from "@/i18n/provider";

const ITEMS = [
  {
    icon: "contactless",
    titleKey: "phyNfcTitle",
    bodyKey: "phyNfcBody",
    footKey: "phyNfcFoot",
    footTone: "text-primary",
  },
  {
    icon: "qr_code_2",
    titleKey: "phyBadgeTitle",
    bodyKey: "phyBadgeBody",
    footKey: "phyBadgeFoot",
    footTone: "text-tertiary-container",
  },
  {
    icon: "mail",
    titleKey: "phyMailTitle",
    bodyKey: "phyMailBody",
    footKey: "phyMailFoot",
    footTone: "text-primary",
  },
  {
    icon: "wallet",
    titleKey: "phyWalletTitle",
    bodyKey: "phyWalletBody",
    footKey: "phyWalletFoot",
    footTone: "text-tertiary-container",
  },
] as const;

export function FeaturesPhygital() {
  const t = useT();

  return (
    <section
      id="phygital"
      className="w-full scroll-mt-24 bg-surface-container-low py-10 md:py-14"
    >
      <div className="mx-auto max-w-7xl px-gutter">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-tertiary-container">
            {t("marketing.features.phyEyebrow")}
          </p>
          <h2 className="text-[1.75rem] font-bold tracking-tight text-on-surface md:text-4xl md:leading-[44px]">
            {t("marketing.features.phyTitle")}
          </h2>
          <p className="mt-3 text-[15px] leading-6 text-on-surface-variant">
            {t("marketing.features.phySubtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ITEMS.map((item) => (
            <article
              key={item.titleKey}
              className="flex flex-col justify-between rounded-2xl border border-outline-variant/25 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
            >
              <div>
                <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon name={item.icon} className="text-xl" />
                </span>
                <h3 className="text-base font-semibold text-on-surface">
                  {t(`marketing.features.${item.titleKey}`)}
                </h3>
                <p className="mt-2 text-[13px] leading-5 text-on-surface-variant">
                  {t(`marketing.features.${item.bodyKey}`)}
                </p>
              </div>
              <p
                className={`mt-5 inline-flex items-center gap-1 border-t border-outline-variant/20 pt-4 text-xs font-bold uppercase tracking-wide ${item.footTone}`}
              >
                {t(`marketing.features.${item.footKey}`)}
                <Icon name="arrow_forward" className="text-sm" />
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
