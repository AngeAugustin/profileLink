"use client";

import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/cn";

export function PricingSection({ id = "tarifs" }: { id?: string }) {
  const { t } = useI18n();

  const plans = [
    {
      id: "starter",
      name: t("marketing.pricing.starterName"),
      price: "0€",
      period: t("marketing.pricing.starterPeriod"),
      monthlyHint: null as string | null,
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
      monthlyHint: t("marketing.pricing.proMonthlyHint"),
      blurb: t("marketing.pricing.proBlurb"),
      featured: true,
      badge: t("marketing.pricing.proBadge"),
      cta: t("marketing.pricing.proCta"),
      ctaHref: "/inscription",
      ctaVariant: "primary" as const,
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
      period: null as string | null,
      monthlyHint: null as string | null,
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
    <section
      id={id}
      className="mx-auto flex w-full max-w-7xl flex-col items-center gap-10 px-gutter py-10"
    >
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-1.5 text-center">
        <span className="text-sm font-semibold uppercase tracking-[0.05em] text-tertiary-container">
          {t("marketing.pricing.eyebrow")}
        </span>
        <h2 className="text-[28px] font-bold leading-tight tracking-[-0.02em] text-on-surface md:text-4xl md:leading-[44px]">
          {t("marketing.pricing.title")}
        </h2>
        <p className="mt-0.5 max-w-2xl text-[15px] leading-6 text-on-surface-variant">
          {t("marketing.pricing.subtitle")}
        </p>
      </div>

      <div className="grid w-full grid-cols-1 items-stretch gap-6 pt-3 lg:grid-cols-3 lg:gap-5">
        {plans.map((plan) => (
          <article
            key={plan.id}
            className={cn(
              "relative flex flex-col justify-between rounded-2xl bg-white p-6",
              plan.featured
                ? "z-10 shadow-[0_8px_10px_-6px_rgba(0,0,0,0.1),0_20px_25px_-5px_rgba(0,0,0,0.1)] lg:-translate-y-3"
                : "shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]",
            )}
          >
            {plan.badge ? (
              <span className="absolute -top-3.5 left-1/2 z-20 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-tertiary-container px-4 py-1 text-xs font-semibold tracking-wide text-white shadow-[0_2px_4px_-2px_rgba(0,0,0,0.1),0_4px_6px_-1px_rgba(0,0,0,0.1)]">
                <Icon name="star" filled className="text-[11px] text-white" />
                {plan.badge}
              </span>
            ) : null}

            <div className="flex flex-col gap-1">
              <p
                className={cn(
                  "text-sm font-semibold uppercase tracking-[0.01em]",
                  plan.featured ? "text-tertiary-container" : "text-on-surface-variant",
                )}
              >
                {plan.name}
              </p>

              <div className="flex min-h-11 flex-wrap items-baseline gap-x-1.5">
                <span className="text-4xl font-bold tracking-[-0.02em] text-on-surface">
                  {plan.price}
                </span>
                {plan.period ? (
                  <span className="text-[15px] leading-6 text-outline">{plan.period}</span>
                ) : null}
                {plan.monthlyHint ? (
                  <span className="text-xs tracking-wide text-on-surface-variant">
                    {plan.monthlyHint}
                  </span>
                ) : null}
              </div>

              <p className="pt-1 text-[13px] leading-5 tracking-[0.005em] text-on-surface-variant">
                {plan.blurb}
              </p>

              <ul className="mt-5 flex flex-col gap-2">
                {plan.features.map((feature, i) => {
                  const highlight = plan.featured && i === 0;
                  return (
                    <li key={feature} className="flex items-start gap-2">
                      <Icon
                        name="check"
                        className={cn(
                          "mt-0.5 shrink-0 text-sm",
                          highlight ? "text-tertiary-container" : "text-primary",
                        )}
                      />
                      <span
                        className={cn(
                          "text-[13px] leading-5 tracking-[0.005em] text-on-surface",
                          highlight && "font-semibold",
                        )}
                      >
                        {feature}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="mt-6">
              <Button
                href={plan.ctaHref}
                variant={plan.ctaVariant}
                className={cn(
                  "h-11 w-full text-sm font-semibold tracking-[0.01em]",
                  plan.featured &&
                    "shadow-[0_2px_4px_-2px_rgba(0,0,0,0.1),0_4px_6px_-1px_rgba(0,0,0,0.1)]",
                )}
              >
                {plan.cta}
              </Button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
