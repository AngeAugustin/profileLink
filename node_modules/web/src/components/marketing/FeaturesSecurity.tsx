"use client";

import { Icon } from "@/components/ui/Icon";
import { useT } from "@/i18n/provider";

const ITEMS = [
  { icon: "encrypted", titleKey: "secAesTitle", bodyKey: "secAesBody" },
  { icon: "public", titleKey: "secEuTitle", bodyKey: "secEuBody" },
  { icon: "lock", titleKey: "secNdaTitle", bodyKey: "secNdaBody" },
  { icon: "download", titleKey: "secExportTitle", bodyKey: "secExportBody" },
] as const;

export function FeaturesSecurity() {
  const t = useT();

  return (
    <section id="securite" className="w-full scroll-mt-24 py-10 md:py-14">
      <div className="mx-auto max-w-7xl px-gutter">
        <div className="rounded-2xl border border-outline-variant/25 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)] md:p-12">
          <div className="mb-8 max-w-2xl">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              {t("marketing.features.secEyebrow")}
            </p>
            <h2 className="text-[1.75rem] font-bold tracking-tight text-on-surface md:text-4xl md:leading-[44px]">
              {t("marketing.features.secTitle")}
            </h2>
            <p className="mt-3 text-[15px] leading-6 text-on-surface-variant">
              {t("marketing.features.secSubtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ITEMS.map((item) => (
              <div
                key={item.titleKey}
                className="rounded-xl border border-outline-variant/20 bg-surface-container-low p-4"
              >
                <Icon name={item.icon} className="mb-3 text-2xl text-primary" />
                <h3 className="text-sm font-bold text-on-surface">
                  {t(`marketing.features.${item.titleKey}`)}
                </h3>
                <p className="mt-1.5 text-[13px] leading-5 text-on-surface-variant">
                  {t(`marketing.features.${item.bodyKey}`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
