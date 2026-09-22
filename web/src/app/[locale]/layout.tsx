import { notFound } from "next/navigation";
import { I18nProvider } from "@/i18n/provider";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale, locales, type Locale } from "@/i18n/config";
import { HtmlLang } from "@/components/i18n/HtmlLang";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = getDictionary(locale);

  return (
    <I18nProvider locale={locale} dict={dict}>
      <HtmlLang locale={locale} />
      {children}
    </I18nProvider>
  );
}
