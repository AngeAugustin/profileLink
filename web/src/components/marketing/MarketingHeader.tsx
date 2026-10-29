"use client";

import { useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { LocaleLink } from "@/i18n/path";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/cn";

type MarketingHeaderProps = {
  active?: string;
};

export function MarketingHeader({ active = "/" }: MarketingHeaderProps) {
  const { locale, t } = useI18n();
  const [open, setOpen] = useState(false);

  const nav = [
    { href: "/fonctionnalites", label: t("marketing.header.features") },
    { href: "/exemples", label: t("marketing.header.examples") },
    { href: "/themes", label: t("marketing.header.themes") },
    { href: "/generateur-qr", label: t("marketing.header.qrGenerator") },
    { href: "/tarifs", label: t("marketing.header.pricing") },
    { href: "/contact", label: t("marketing.header.contact") },
  ];

  function close() {
    setOpen(false);
  }

  return (
    <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/30 shadow-[0_1px_8px_rgba(15,23,42,0.04)]">
      <div className="h-16 max-w-7xl mx-auto px-gutter flex items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-md min-w-0">
          <Logo href={`/${locale}`} />
          <nav className="hidden lg:flex items-center gap-space-lg ml-space-lg">
            {nav.map((item) => (
              <LocaleLink
                key={item.href}
                locale={locale}
                href={item.href}
                className={cn(
                  "font-label-md text-label-md transition-colors",
                  active === item.href
                    ? "text-primary font-bold"
                    : "text-on-surface-variant hover:text-on-surface",
                )}
              >
                {item.label}
              </LocaleLink>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-space-sm sm:gap-space-md">
          <LanguageSwitcher className="hidden sm:inline-flex" />
          <LocaleLink
            locale={locale}
            href="/connexion"
            className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface px-space-sm py-space-xs transition-colors hidden sm:inline"
          >
            {t("marketing.header.login")}
          </LocaleLink>
          <Button href="/inscription" size="sm" className="hidden sm:inline-flex">
            {t("marketing.header.cta")}
          </Button>
          <button
            type="button"
            className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg text-on-surface hover:bg-surface-container transition-colors"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <Icon name={open ? "close" : "menu"} className="text-[24px]" />
          </button>
        </div>
      </div>

      {open ? (
        <div
          id="mobile-nav"
          className="lg:hidden border-t border-outline-variant/30 bg-surface/95 backdrop-blur-xl"
        >
          <nav className="max-w-7xl mx-auto px-gutter py-space-md flex flex-col gap-1">
            {nav.map((item) => (
              <LocaleLink
                key={item.href}
                locale={locale}
                href={item.href}
                onClick={close}
                className={cn(
                  "rounded-lg px-space-md py-3 font-label-md text-label-md transition-colors",
                  active === item.href
                    ? "bg-primary/10 text-primary font-bold"
                    : "text-on-surface hover:bg-surface-container",
                )}
              >
                {item.label}
              </LocaleLink>
            ))}
            <div className="pt-space-sm mt-space-sm border-t border-outline-variant/20 flex flex-col gap-space-sm">
              <div className="px-space-md py-1">
                <LanguageSwitcher />
              </div>
              <LocaleLink
                locale={locale}
                href="/connexion"
                onClick={close}
                className="rounded-lg px-space-md py-3 font-label-md text-on-surface-variant hover:bg-surface-container"
              >
                {t("marketing.header.login")}
              </LocaleLink>
              <Button href="/inscription" size="sm" className="w-full" onClick={close}>
                {t("marketing.header.cta")}
              </Button>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
