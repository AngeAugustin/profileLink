"use client";

import { MarketingShell } from "@/components/marketing/MarketingShell";
import { ResourcesHero } from "@/components/marketing/ResourcesHero";
import { ResourcesSearchField } from "@/components/marketing/ResourcesSearchField";
import { FinalCtaSection } from "@/components/landing/FinalCtaSection";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { LocaleLink } from "@/i18n/path";
import { useI18n } from "@/i18n/provider";

export default function PublicHelpPage() {
  const { locale, t } = useI18n();

  const topics = [
    {
      icon: "rocket_launch",
      title: t("marketing.pages.help.start"),
      blurb: t("marketing.pages.help.startBlurb"),
      href: "/guides",
    },
    {
      icon: "edit_note",
      title: t("marketing.pages.help.editor"),
      blurb: t("marketing.pages.help.editorBlurb"),
      href: "/guides",
    },
    {
      icon: "qr_code_2",
      title: t("marketing.pages.help.qr"),
      blurb: t("marketing.pages.help.qrBlurb"),
      href: "/guides",
    },
    {
      icon: "account_balance_wallet",
      title: t("marketing.pages.help.account"),
      blurb: t("marketing.pages.help.accountBlurb"),
      href: "/tarifs",
    },
  ];

  return (
    <MarketingShell active="/aide">
      <ResourcesHero
        active="/aide"
        title={t("marketing.pages.help.title")}
        subtitle={t("marketing.pages.help.subtitle")}
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-space-sm max-w-2xl mx-auto md:mx-0">
          <ResourcesSearchField
            placeholder={t("marketing.pages.help.searchPh")}
            className="flex-1"
          />
          <Button href="/contact" size="sm" className="shrink-0 w-full sm:w-auto">
            {t("marketing.pages.help.contact")}
          </Button>
        </div>
      </ResourcesHero>

      <section className="max-w-7xl mx-auto px-gutter pt-space-lg pb-space-xl w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
          {topics.map((topic) => (
            <LocaleLink
              key={topic.title}
              locale={locale}
              href={topic.href}
              className="group p-space-lg rounded-xl bg-surface-container-lowest shadow-sm border border-outline-variant/15 hover:shadow-md hover:border-primary/25 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-space-sm group-hover:bg-primary group-hover:text-on-primary transition-colors">
                <Icon name={topic.icon} />
              </div>
              <h2 className="font-semibold text-on-surface text-[1.0625rem]">
                {topic.title}
              </h2>
              <p className="text-body-sm text-on-surface-variant mt-1">
                {topic.blurb}
              </p>
            </LocaleLink>
          ))}
        </div>
      </section>

      <FinalCtaSection />
    </MarketingShell>
  );
}
