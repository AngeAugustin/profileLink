"use client";

import { MarketingShell } from "@/components/marketing/MarketingShell";
import { ResourcesHero } from "@/components/marketing/ResourcesHero";
import { ResourcesSearchField } from "@/components/marketing/ResourcesSearchField";
import { FaqSection } from "@/components/landing/FaqSection";
import { FinalCtaSection } from "@/components/landing/FinalCtaSection";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/i18n/provider";

export default function FaqPage() {
  const { t } = useI18n();

  return (
    <MarketingShell active="/faq">
      <ResourcesHero
        active="/faq"
        title={t("marketing.faq.pageTitle")}
        subtitle={t("marketing.faq.pageSubtitle")}
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-space-sm max-w-2xl mx-auto md:mx-0">
          <ResourcesSearchField
            placeholder={t("marketing.faq.searchPh")}
            className="flex-1"
          />
          <Button href="/contact" size="sm" className="shrink-0 w-full sm:w-auto">
            {t("marketing.pages.help.contact")}
          </Button>
        </div>
      </ResourcesHero>

      <FaqSection />
      <FinalCtaSection />
    </MarketingShell>
  );
}
