"use client";

import { MarketingShell } from "@/components/marketing/MarketingShell";
import { ExamplesHero } from "@/components/marketing/ExamplesHero";
import { ExamplesGallery } from "@/components/marketing/ExamplesGallery";
import { ExamplesUseCases } from "@/components/marketing/ExamplesUseCases";
import { ExamplesSocialProof } from "@/components/marketing/ExamplesSocialProof";
import { ExamplesCta } from "@/components/marketing/ExamplesCta";

export default function ExamplesPage() {
  return (
    <MarketingShell active="/exemples">
      <ExamplesHero />
      <ExamplesGallery />
      <ExamplesUseCases />
      <ExamplesSocialProof />
      <ExamplesCta />
    </MarketingShell>
  );
}
