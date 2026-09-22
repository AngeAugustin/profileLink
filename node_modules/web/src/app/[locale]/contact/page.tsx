import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { ContactPageContent } from "@/components/marketing/ContactPageContent";
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
    title: `${t(dict, "marketing.meta.contactTitle")} — ProfileLink`,
    description: t(dict, "marketing.contact.subtitle"),
  };
}

export default function ContactPage() {
  return (
    <MarketingShell active="/contact">
      <ContactPageContent />
    </MarketingShell>
  );
}
