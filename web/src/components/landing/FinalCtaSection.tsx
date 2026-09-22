"use client";

import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useT } from "@/i18n/provider";

export function FinalCtaSection() {
  const t = useT();

  const perks = [
    { icon: "bolt", label: t("marketing.finalCta.perk1") },
    { icon: "credit_card_off", label: t("marketing.finalCta.perk2") },
    { icon: "shield", label: t("marketing.finalCta.perk3") },
  ];

  return (
    <section className="relative my-space-xl w-full overflow-hidden bg-primary-container">
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          background:
            "linear-gradient(90deg, rgba(0, 55, 176, 1) 0%, rgba(29, 78, 216, 1) 50%, rgba(33, 81, 218, 1) 100%)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-primary/40 blur-3xl"
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-gutter py-16 text-center lg:py-20">
        <span className="font-mono text-[13px] font-bold uppercase tracking-[0.1em] text-on-primary-container">
          {t("marketing.finalCta.eyebrow")}
        </span>
        <h2 className="mt-3 text-headline-xl-mobile font-extrabold tracking-tight text-on-primary md:text-5xl md:leading-tight">
          {t("marketing.finalCta.title")}
        </h2>
        <p className="mt-space-md max-w-2xl text-body-lg text-on-primary-container">
          {t("marketing.finalCta.body")}
        </p>

        <div className="mt-space-lg flex w-full flex-col items-stretch justify-center gap-space-md sm:w-auto sm:flex-row sm:items-center">
          <Button href="/inscription" size="lg" className="hover:-translate-y-0.5 shadow-lg">
            {t("marketing.finalCta.cta")}
            <Icon name="arrow_forward" />
          </Button>
          <Button
            href="/tarifs"
            size="lg"
            className="border-0 bg-on-primary/15 text-on-primary backdrop-blur-sm hover:bg-on-primary/25"
          >
            {t("marketing.finalCta.ctaPro")}
          </Button>
        </div>

        <div className="mt-space-lg flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {perks.map((perk) => (
            <div
              key={perk.label}
              className="flex items-center gap-1.5 text-body-sm text-on-primary-container"
            >
              <Icon name={perk.icon} className="text-base" />
              <span>{perk.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
