"use client";

import { MarketingShell } from "@/components/marketing/MarketingShell";
import { ExamplesHero } from "@/components/marketing/ExamplesHero";
import { ExamplesGallery } from "@/components/marketing/ExamplesGallery";
import { FinalCtaSection } from "@/components/landing/FinalCtaSection";

export default function ExamplesPage() {
  return (
    <MarketingShell active="/exemples">
      <ExamplesHero />
      <ExamplesGallery />
      <FinalCtaSection />
    </MarketingShell>
  );
}
