"use client";

import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { LocaleLink } from "@/i18n/path";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/cn";

export function PricingSection({ id = "tarifs" }: { id?: string }) {
  const { locale, t } = useI18n();

  const plans = [
    {
      id: "starter",
      name: t("marketing.pricing.starterName"),
      price: "0€",
      period: t("marketing.pricing.starterPeriod"),
      blurb: t("marketing.pricing.starterBlurb"),
      featured: false,
      badge: null as string | null,
      cta: t("marketing.pricing.starterCta"),
      ctaHref: "/inscription",
      ctaVariant: "muted" as const,
      features: [
        t("marketing.pricing.starterF1"),
        t("marketing.pricing.starterF2"),
        t("marketing.pricing.starterF3"),
        t("marketing.pricing.starterF4"),
      ],
    },
    {
      id: "pro",
      name: t("marketing.pricing.proName"),
      price: "39€",
      period: t("marketing.pricing.proPeriod"),
      blurb: t("marketing.pricing.proBlurb"),
      featured: true,
      badge: t("marketing.pricing.proBadge"),
      cta: t("marketing.pricing.proCta"),
      ctaHref: "/inscription",
      ctaVariant: "primary" as const,
      footnote: t("marketing.pricing.proFootnote"),
      features: [
        t("marketing.pricing.proF1"),
        t("marketing.pricing.proF2"),
        t("marketing.pricing.proF3"),
        t("marketing.pricing.proF4"),
        t("marketing.pricing.proF5"),
        t("marketing.pricing.proF6"),
      ],
    },
    {
      id: "team",
      name: t("marketing.pricing.teamName"),
      price: t("marketing.pricing.teamPrice"),
      period: t("marketing.pricing.teamPeriod"),
      blurb: t("marketing.pricing.teamBlurb"),
      featured: false,
      badge: null as string | null,
      cta: t("marketing.pricing.teamCta"),
      ctaHref: "/contact",
      ctaVariant: "muted" as const,
      features: [
        t("marketing.pricing.teamF1"),
        t("marketing.pricing.teamF2"),
        t("marketing.pricing.teamF3"),
        t("marketing.pricing.teamF4"),
      ],
    },
  ];

  return (
    <section id={id} className="mx-auto w-full max-w-7xl px-gutter py-space-xl">
      <div className="mx-auto mb-space-xl max-w-3xl text-center">
        <span className="font-mono text-[13px] font-bold uppercase tracking-[0.05em] text-primary">
          {t("marketing.pricing.eyebrow")}
        </span>
        <h2 className="mt-1 text-headline-xl-mobile font-bold text-on-surface md:text-headline-xl">
          {t("marketing.pricing.title")}
        </h2>
        <p className="mt-2 text-body-md text-on-surface-variant">
          {t("marketing.pricing.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 items-stretch gap-space-lg lg:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={cn(
              "relative flex flex-col rounded-xl bg-surface-container-lowest p-space-lg shadow-sm",
              plan.featured &&
                "z-10 shadow-xl ring-2 ring-primary lg:-translate-y-2",
            )}
          >
            {plan.badge ? (
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-primary px-3 py-1 text-center text-label-sm font-bold leading-tight text-on-primary shadow-sm">
                {plan.badge}
              </span>
            ) : null}

            <p
              className={cn(
                "mb-1 text-label-sm font-semibold uppercase tracking-wider",
                plan.featured ? "text-primary" : "text-on-surface-variant",
              )}
            >
              {plan.name}
            </p>
            <div className="mb-space-sm flex items-baseline gap-1.5">
              <span className="text-4xl font-extrabold tracking-tight text-on-surface">
                {plan.price}
              </span>
              {plan.period ? (
                <span className="text-body-sm text-on-surface-variant">{plan.period}</span>
              ) : null}
            </div>
            <p className="mb-space-lg text-body-sm text-on-surface-variant">{plan.blurb}</p>

            <ul className="mb-space-lg flex flex-1 flex-col gap-space-sm">
              {plan.features.map((f, i) => (
                <li key={f} className="flex items-start gap-2 text-body-sm text-on-surface">
                  <Icon
                    name="check_circle"
                    className={cn(
                      "shrink-0 text-lg",
                      plan.featured ? "text-primary" : "text-on-surface-variant",
                    )}
                    filled
                  />
                  <span className={plan.featured && i === 0 ? "font-bold" : undefined}>{f}</span>
                </li>
              ))}
            </ul>

            <div className="mt-auto flex flex-col gap-2">
              <Button href={plan.ctaHref} variant={plan.ctaVariant} className="w-full">
                {plan.cta}
              </Button>
              {"footnote" in plan && plan.footnote ? (
                <p className="text-center text-[12px] text-on-surface-variant">{plan.footnote}</p>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-space-md text-center text-body-sm text-on-surface-variant">
        {t("marketing.pricing.needHelp")}{" "}
        <LocaleLink
          locale={locale}
          href="/contact"
          className="font-semibold text-primary hover:underline"
        >
          {t("marketing.pricing.advisor")}
        </LocaleLink>
      </p>
    </section>
  );
}
