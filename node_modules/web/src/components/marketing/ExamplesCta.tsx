"use client";

import { Button } from "@/components/ui/Button";
import { useT } from "@/i18n/provider";

export function ExamplesCta() {
  const t = useT();

  return (
    <section className="w-full pb-12 md:pb-16">
      <div className="mx-auto max-w-7xl px-gutter">
        <div className="rounded-2xl bg-primary/10 px-6 py-12 text-center md:px-16 md:py-14">
          <h2 className="mx-auto max-w-2xl text-[1.75rem] font-bold tracking-tight text-on-surface md:text-4xl md:leading-[44px]">
            {t("marketing.examples.ctaTitle")}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[15px] leading-6 text-on-surface-variant">
            {t("marketing.examples.ctaBody")}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button href="/inscription" size="lg">
              {t("marketing.examples.ctaPrimary")}
            </Button>
            <Button href="/tarifs" variant="secondary" size="lg">
              {t("marketing.examples.ctaSecondary")}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
