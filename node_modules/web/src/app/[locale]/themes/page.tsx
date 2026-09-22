"use client";

import { MarketingShell } from "@/components/marketing/MarketingShell";
import { ThemesHero } from "@/components/marketing/ThemesHero";
import { ThemesGallery } from "@/components/marketing/ThemesGallery";
import { FinalCtaSection } from "@/components/landing/FinalCtaSection";

export default function ThemesPage() {
  return (
    <MarketingShell active="/themes">
      <ThemesHero />
      <ThemesGallery />
      <FinalCtaSection />
    </MarketingShell>
  );
}
