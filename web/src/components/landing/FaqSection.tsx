"use client";

import { FaqAccordion } from "@/components/ui/Accordion";
import { useT } from "@/i18n/provider";

export function FaqSection({ id = "faq" }: { id?: string }) {
  const t = useT();

  const items = [
    { q: t("marketing.faq.q1"), a: t("marketing.faq.a1") },
    { q: t("marketing.faq.q2"), a: t("marketing.faq.a2") },
    { q: t("marketing.faq.q3"), a: t("marketing.faq.a3") },
    { q: t("marketing.faq.q4"), a: t("marketing.faq.a4") },
    { q: t("marketing.faq.q5"), a: t("marketing.faq.a5") },
  ];

  return (
    <section id={id} className="w-full bg-surface-container-low py-space-xl">
      <div className="max-w-7xl mx-auto px-gutter">
        <div className="mx-auto mb-space-xl max-w-2xl text-center">
          <span className="font-mono text-[13px] font-bold uppercase tracking-[0.05em] text-primary">
            {t("marketing.faq.eyebrow")}
          </span>
          <h2 className="mt-1 text-headline-xl-mobile font-bold text-on-surface md:text-headline-xl">
            {t("marketing.faq.title")}
          </h2>
          <p className="mt-2 text-body-md text-on-surface-variant">
            {t("marketing.faq.subtitle")}
          </p>
        </div>
        <FaqAccordion items={items} />
      </div>
    </section>
  );
}
