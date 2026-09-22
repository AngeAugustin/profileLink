import type { Metadata } from "next";
import { getDictionary, t } from "@/i18n/get-dictionary";
import { defaultLocale, isLocale, type Locale } from "@/i18n/config";

type LayoutProps = {
  params: Promise<{ locale: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : defaultLocale;
  const dict = getDictionary(locale);
  return {
    title: `${t(dict, "marketing.meta.examplesTitle")} — ProfileLink`,
    description: t(dict, "marketing.examples.subtitle"),
  };
}

export default function ExamplesLayout({ children }: LayoutProps) {
  return children;
}
