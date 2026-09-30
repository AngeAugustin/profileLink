import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { FeaturesHero } from "@/components/marketing/FeaturesHero";
import { FeaturesCatalog } from "@/components/marketing/FeaturesCatalog";
import { FeaturesPillars } from "@/components/marketing/FeaturesPillars";
import { FeaturesPhygital } from "@/components/marketing/FeaturesPhygital";
import { FeaturesCompare } from "@/components/marketing/FeaturesCompare";
import { FeaturesSecurity } from "@/components/marketing/FeaturesSecurity";
import { FeaturesFaqCta } from "@/components/marketing/FeaturesFaqCta";
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
    title: `${t(dict, "marketing.meta.featuresTitle")} — ProfileLink`,
    description: t(dict, "marketing.features.pageSubtitle"),
  };
}

export default async function FeaturesPage() {
  return (
    <MarketingShell active="/fonctionnalites">
      <FeaturesHero />
      <FeaturesCatalog />
      <FeaturesPillars />
      <FeaturesPhygital />
      <FeaturesCompare />
      <FeaturesSecurity />
      <FeaturesFaqCta />
    </MarketingShell>
  );
}
