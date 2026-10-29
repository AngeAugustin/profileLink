import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { QrGeneratorPage } from "@/components/qr/QrGeneratorPage";
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
    title: `${t(dict, "marketing.meta.qrGeneratorTitle")} — ProfileLink`,
    description: t(dict, "marketing.qrGenerator.subtitle"),
  };
}

export default function QrGeneratorRoute() {
  return (
    <MarketingShell active="/generateur-qr">
      <QrGeneratorPage />
    </MarketingShell>
  );
}
