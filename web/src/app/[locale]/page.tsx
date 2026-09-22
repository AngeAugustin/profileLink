import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { HeroSection } from "@/components/landing/HeroSection";
import { ProcessSection } from "@/components/landing/ProcessSection";
import { ComparisonBentoSection } from "@/components/landing/ComparisonBentoSection";
import {
  PersonasSection,
  TouchpointsSection,
} from "@/components/landing/MoreSections";
import { PricingSection } from "@/components/landing/PricingSection";
import { FaqSection } from "@/components/landing/FaqSection";
import { FinalCtaSection } from "@/components/landing/FinalCtaSection";
import { getDictionary, t } from "@/i18n/get-dictionary";
import { defaultLocale, isLocale, type Locale } from "@/i18n/config";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : defaultLocale;
  const dict = getDictionary(locale);
  return {
    title: t(dict, "marketing.meta.homeTitle"),
    description: t(dict, "marketing.meta.homeDescription"),
  };
}

export default function HomePage() {
  return (
    <MarketingShell active="/">
      <HeroSection />
      <ProcessSection />
      <ComparisonBentoSection />
      <TouchpointsSection />
      <PersonasSection />
      <PricingSection />
      <FaqSection />
      <FinalCtaSection />
    </MarketingShell>
  );
}
