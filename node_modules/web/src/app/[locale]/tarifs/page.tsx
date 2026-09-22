import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { PricingHero } from "@/components/marketing/PricingHero";
import { PricingPageContent } from "@/components/marketing/PricingPageContent";
import { FinalCtaSection } from "@/components/landing/FinalCtaSection";
import { getDictionary, t } from "@/i18n/get-dictionary";
import { defaultLocale, isLocale, type Locale } from "@/i18n/config";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : defaultLocale;
  const dict = getDictionary(locale);
  return {
    title: `${t(dict, "marketing.meta.pricingTitle")} — ProfileLink`,
    description: t(dict, "marketing.pricing.pageSubtitle"),
  };
}

export default async function PricingPage() {
  return (
    <MarketingShell active="/tarifs">
      <PricingHero />
      <PricingPageContent />
      <FinalCtaSection />
    </MarketingShell>
  );
}
