"use client";

import { MarketingShell } from "@/components/marketing/MarketingShell";
import { ResourcesHero } from "@/components/marketing/ResourcesHero";
import { ResourcesSearchField } from "@/components/marketing/ResourcesSearchField";
import { FinalCtaSection } from "@/components/landing/FinalCtaSection";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { LocaleLink } from "@/i18n/path";
import { useI18n } from "@/i18n/provider";

export default function GuidesPage() {
  const { locale, t } = useI18n();

  const guides = [
    {
      icon: "timer",
      title: t("marketing.pages.guides.g1Title"),
      blurb: t("marketing.pages.guides.g1Blurb"),
      time: t("marketing.pages.guides.g1Time"),
    },
    {
      icon: "edit",
      title: t("marketing.pages.guides.g2Title"),
      blurb: t("marketing.pages.guides.g2Blurb"),
      time: t("marketing.pages.guides.g2Time"),
    },
    {
      icon: "qr_code_2",
      title: t("marketing.pages.guides.g3Title"),
      blurb: t("marketing.pages.guides.g3Blurb"),
      time: t("marketing.pages.guides.g3Time"),
    },
    {
      icon: "workspaces",
      title: t("marketing.pages.guides.g4Title"),
      blurb: t("marketing.pages.guides.g4Blurb"),
      time: t("marketing.pages.guides.g4Time"),
    },
    {
      icon: "insights",
      title: t("marketing.pages.guides.g5Title"),
      blurb: t("marketing.pages.guides.g5Blurb"),
      time: t("marketing.pages.guides.g5Time"),
    },
    {
      icon: "language",
      title: t("marketing.pages.guides.g6Title"),
      blurb: t("marketing.pages.guides.g6Blurb"),
      time: t("marketing.pages.guides.g6Time"),
    },
  ];

  return (
    <MarketingShell active="/guides">
      <ResourcesHero
        active="/guides"
        title={t("marketing.pages.guides.title")}
        subtitle={t("marketing.pages.guides.subtitle")}
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-space-sm max-w-2xl mx-auto md:mx-0">
          <ResourcesSearchField
            placeholder={t("marketing.pages.guides.searchPh")}
            className="flex-1"
          />
          <Button href="/contact" size="sm" className="shrink-0 w-full sm:w-auto">
            {t("marketing.pages.help.contact")}
          </Button>
        </div>
      </ResourcesHero>

      <section className="max-w-7xl mx-auto px-gutter pt-space-lg pb-space-xl w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
          {guides.map((g) => (
            <article
              key={g.title}
              className="flex flex-col rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/15 p-space-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-space-sm mb-space-md">
                <div className="w-11 h-11 rounded-xl bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center">
                  <Icon name={g.icon} />
                </div>
                <span className="text-label-sm text-on-surface-variant font-mono">
                  {g.time}
                </span>
              </div>
              <h2 className="text-[1.0625rem] font-semibold text-on-surface mb-1">
                {g.title}
              </h2>
              <p className="text-body-sm text-on-surface-variant flex-1 mb-space-md">
                {g.blurb}
              </p>
              <LocaleLink
                locale={locale}
                href="/aide"
                className="inline-flex items-center gap-1 text-label-md text-primary font-semibold hover:underline"
              >
                {t("marketing.pages.guides.read")}
                <Icon name="arrow_forward" className="text-[16px]" />
              </LocaleLink>
            </article>
          ))}
        </div>
      </section>

      <FinalCtaSection />
    </MarketingShell>
  );
}
