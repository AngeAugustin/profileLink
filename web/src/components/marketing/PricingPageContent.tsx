"use client";

import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { LocaleLink } from "@/i18n/path";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/cn";

function usePlans() {
  const { t } = useI18n();
  return [
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
      period: "",
      blurb: t("marketing.pricing.teamBlurb"),
      featured: false,
      badge: null as string | null,
      cta: t("marketing.pricing.teamCta"),
      ctaHref: "/contact",
      features: [
        t("marketing.pricing.teamF1"),
        t("marketing.pricing.teamF2"),
        t("marketing.pricing.teamF3"),
        t("marketing.pricing.teamF4"),
      ],
    },
  ];
}

const COMPARE_ROWS = [
  {
    labelKey: "rowProfiles",
    starter: "valStarterProfiles",
    pro: "valProProfiles",
    team: "valTeamProfiles",
  },
  {
    labelKey: "rowQr",
    starter: "valStarterQr",
    pro: "valProQr",
    team: "valTeamQr",
  },
  {
    labelKey: "rowAnalytics",
    starter: "valStarterAnalytics",
    pro: "valProAnalytics",
    team: "valTeamAnalytics",
  },
  {
    labelKey: "rowDomain",
    starter: "valNo",
    pro: "valYes",
    team: "valYes",
  },
  {
    labelKey: "rowPassword",
    starter: "valNo",
    pro: "valYes",
    team: "valYes",
  },
  {
    labelKey: "rowTeam",
    starter: "valNo",
    pro: "valNo",
    team: "valYes",
  },
] as const;

const ASSURANCES = [
  { icon: "receipt_long", titleKey: "a1Title", bodyKey: "a1Body" },
  { icon: "swap_horiz", titleKey: "a2Title", bodyKey: "a2Body" },
  { icon: "public", titleKey: "a3Title", bodyKey: "a3Body" },
] as const;

const PRICING_FAQ = [
  { q: "pq1", a: "pa1" },
  { q: "pq2", a: "pa2" },
  { q: "pq3", a: "pa3" },
  { q: "pq4", a: "pa4" },
] as const;

export function PricingPageContent() {
  const { locale, t } = useI18n();
  const plans = usePlans();

  return (
    <>
      {/* Plans */}
      <section id="plans" className="scroll-mt-24 max-w-7xl mx-auto px-gutter pt-space-xl pb-space-lg w-full">
        <div className="text-center md:text-left max-w-2xl mx-auto md:mx-0 mb-space-xl">
          <p className="text-label-sm font-semibold uppercase tracking-[0.14em] text-primary mb-space-sm">
            {t("marketing.pricing.plansEyebrow")}
          </p>
          <h2 className="text-headline-xl-mobile md:text-headline-xl text-on-surface font-bold tracking-tight">
            {t("marketing.pricing.plansTitle")}
          </h2>
          <p className="mt-space-sm text-body-md text-on-surface-variant">
            {t("marketing.pricing.plansSubtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-md items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                "relative rounded-2xl p-space-lg flex flex-col bg-surface-container-lowest border border-outline-variant/15 shadow-[0_8px_28px_rgba(15,23,42,0.04)]",
                plan.featured &&
                  "lg:-translate-y-2 border-primary/25 shadow-[0_16px_40px_rgba(29,78,216,0.1)] ring-1 ring-primary/15",
              )}
            >
              {plan.badge ? (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-on-primary text-label-sm font-semibold shadow-sm">
                  {plan.badge}
                </span>
              ) : null}
              <h3
                className={cn(
                  "text-headline-md font-semibold mb-1",
                  plan.featured ? "text-primary" : "text-on-surface",
                )}
              >
                {plan.name}
              </h3>
              <div className="flex flex-wrap items-baseline gap-x-1.5 mb-space-sm">
                <span className="text-headline-xl font-bold text-on-surface tabular-nums">
                  {plan.price}
                </span>
                {plan.period ? (
                  <span className="text-body-sm text-on-surface-variant">
                    {plan.period}
                  </span>
                ) : null}
                {plan.id === "pro" ? (
                  <span className="text-xs text-on-surface-variant">
                    {t("marketing.pricing.proMonthlyHint")}
                  </span>
                ) : null}
              </div>
              <p className="text-body-sm text-on-surface-variant mb-space-lg">
                {plan.blurb}
              </p>
              <ul className="flex flex-col gap-space-sm mb-space-lg flex-1 m-0 p-0 list-none">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2 text-body-sm text-on-surface"
                  >
                    <Icon
                      name="check_circle"
                      className={cn(
                        "text-lg shrink-0",
                        plan.featured ? "text-primary" : "text-primary/70",
                      )}
                      filled
                    />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                href={plan.ctaHref}
                variant={plan.featured ? "primary" : "muted"}
                className="w-full"
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>

        <p className="text-center mt-space-md text-body-sm text-on-surface-variant">
          {t("marketing.pricing.needHelp")}{" "}
          <LocaleLink
            locale={locale}
            href="/contact"
            className="text-primary font-semibold hover:underline"
          >
            {t("marketing.pricing.advisor")}
          </LocaleLink>
        </p>
      </section>

      {/* Comparison */}
      <section className="w-full bg-surface-container-low/50 border-y border-outline-variant/15 py-space-xl">
        <div className="max-w-7xl mx-auto px-gutter">
          <div className="text-center md:text-left max-w-2xl mx-auto md:mx-0 mb-space-lg">
            <p className="text-label-sm font-semibold uppercase tracking-[0.14em] text-primary mb-space-sm">
              {t("marketing.pricing.compareEyebrow")}
            </p>
            <h2 className="text-headline-xl-mobile md:text-headline-xl text-on-surface font-bold tracking-tight">
              {t("marketing.pricing.compareTitle")}
            </h2>
            <p className="mt-space-sm text-body-md text-on-surface-variant">
              {t("marketing.pricing.compareSubtitle")}
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-outline-variant/20 bg-surface-container-lowest shadow-[0_8px_28px_rgba(15,23,42,0.04)]">
            <table className="w-full min-w-[640px] text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/20">
                  <th className="p-space-md text-label-sm font-semibold text-on-surface-variant w-[28%]" />
                  <th className="p-space-md text-label-md font-semibold text-on-surface">
                    {t("marketing.pricing.starterName")}
                  </th>
                  <th className="p-space-md text-label-md font-semibold text-primary bg-primary/[0.04]">
                    {t("marketing.pricing.proName")}
                  </th>
                  <th className="p-space-md text-label-md font-semibold text-on-surface">
                    {t("marketing.pricing.teamName")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARE_ROWS.map((row) => (
                  <tr
                    key={row.labelKey}
                    className="border-b border-outline-variant/15 last:border-0"
                  >
                    <th className="p-space-md text-body-sm font-semibold text-on-surface align-top">
                      {t(`marketing.pricing.${row.labelKey}`)}
                    </th>
                    <td className="p-space-md text-body-sm text-on-surface-variant">
                      {t(`marketing.pricing.${row.starter}`)}
                    </td>
                    <td className="p-space-md text-body-sm text-on-surface bg-primary/[0.04] font-medium">
                      {t(`marketing.pricing.${row.pro}`)}
                    </td>
                    <td className="p-space-md text-body-sm text-on-surface-variant">
                      {t(`marketing.pricing.${row.team}`)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Assurances */}
      <section className="max-w-7xl mx-auto px-gutter py-space-xl w-full">
        <div className="text-center md:text-left max-w-2xl mx-auto md:mx-0 mb-space-lg">
          <p className="text-label-sm font-semibold uppercase tracking-[0.14em] text-primary mb-space-sm">
            {t("marketing.pricing.assuranceEyebrow")}
          </p>
          <h2 className="text-headline-xl-mobile md:text-headline-xl text-on-surface font-bold tracking-tight">
            {t("marketing.pricing.assuranceTitle")}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
          {ASSURANCES.map((item) => (
            <div
              key={item.titleKey}
              className="rounded-2xl border border-outline-variant/15 bg-surface-container-lowest p-space-lg"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-space-sm">
                <Icon name={item.icon} className="text-[20px]" />
              </div>
              <h3 className="text-headline-md text-on-surface font-semibold">
                {t(`marketing.pricing.${item.titleKey}`)}
              </h3>
              <p className="mt-1 text-body-sm text-on-surface-variant leading-relaxed">
                {t(`marketing.pricing.${item.bodyKey}`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing FAQ */}
      <section className="w-full bg-surface-container-low/40 border-t border-outline-variant/15 py-space-xl">
        <div className="max-w-3xl mx-auto px-gutter">
          <div className="text-center mb-space-lg">
            <p className="text-label-sm font-semibold uppercase tracking-[0.14em] text-primary mb-space-sm">
              {t("marketing.pricing.faqEyebrow")}
            </p>
            <h2 className="text-headline-xl-mobile md:text-headline-xl text-on-surface font-bold tracking-tight">
              {t("marketing.pricing.faqTitle")}
            </h2>
          </div>
          <ul className="m-0 p-0 list-none divide-y divide-outline-variant/20 rounded-2xl border border-outline-variant/15 bg-surface-container-lowest overflow-hidden">
            {PRICING_FAQ.map((item) => (
              <li key={item.q} className="p-space-md md:p-space-lg">
                <h3 className="text-[1.0625rem] font-semibold text-on-surface">
                  {t(`marketing.pricing.${item.q}`)}
                </h3>
                <p className="mt-1.5 text-body-sm text-on-surface-variant leading-relaxed">
                  {t(`marketing.pricing.${item.a}`)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
