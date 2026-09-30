"use client";

import { Button } from "@/components/ui/Button";
import { FaqAccordion } from "@/components/ui/Accordion";
import { useT } from "@/i18n/provider";

export function FeaturesFaqCta() {
  const t = useT();

  const items = [
    { q: t("marketing.features.faqQ1"), a: t("marketing.features.faqA1") },
    { q: t("marketing.features.faqQ2"), a: t("marketing.features.faqA2") },
    { q: t("marketing.features.faqQ3"), a: t("marketing.features.faqA3") },
    { q: t("marketing.features.faqQ4"), a: t("marketing.features.faqA4") },
  ];

  return (
    <section id="faq" className="w-full scroll-mt-24 py-10 md:py-14">
      <div className="mx-auto max-w-7xl px-gutter">
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            {t("marketing.features.faqEyebrow")}
          </p>
          <h2 className="text-[1.75rem] font-bold tracking-tight text-on-surface md:text-4xl md:leading-[44px]">
            {t("marketing.features.faqTitle")}
          </h2>
        </div>

        <div className="mx-auto mb-12 max-w-3xl">
          <FaqAccordion items={items} />
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-primary-container px-6 py-14 text-center shadow-lg md:px-16">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(0,21,81,1) 0%, rgba(0,55,176,1) 50%, rgba(29,78,216,1) 100%)",
            }}
          />
          <div className="relative z-10 mx-auto max-w-2xl">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-on-primary-container">
              {t("marketing.features.ctaEyebrow")}
            </p>
            <h2 className="text-[1.75rem] font-bold tracking-tight text-white md:text-4xl md:leading-[44px]">
              {t("marketing.features.ctaTitle")}
            </h2>
            <p className="mt-3 text-[15px] leading-6 text-on-primary-container">
              {t("marketing.features.ctaBody")}
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button href="/inscription" size="lg" className="min-w-[240px]">
                {t("marketing.features.ctaPrimary")}
              </Button>
              <Button
                href="/contact"
                variant="secondary"
                size="lg"
                className="min-w-[240px]"
              >
                {t("marketing.features.ctaSecondary")}
              </Button>
            </div>
            <p className="mt-5 text-[11px] font-semibold uppercase tracking-wide text-on-primary-container">
              {t("marketing.features.ctaFoot")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
