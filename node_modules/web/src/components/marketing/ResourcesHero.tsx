"use client";

import type { ReactNode } from "react";
import { LocaleLink } from "@/i18n/path";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/cn";

const RESOURCES_NAV = [
  { href: "/aide", labelKey: "marketing.footer.help" },
  { href: "/faq", labelKey: "marketing.footer.faq" },
  { href: "/guides", labelKey: "marketing.footer.guides" },
] as const;

export function ResourcesHero({
  active,
  title,
  subtitle,
  children,
}: {
  active: string;
  title: string;
  subtitle?: string;
  /** Optional slot under the sister nav (search, CTA…) */
  children?: ReactNode;
}) {
  const { locale, t } = useI18n();

  return (
    <section className="relative overflow-hidden border-b border-outline-variant/15">
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(165deg,rgba(29,78,216,0.09)_0%,rgba(247,249,251,0.92)_48%,var(--color-surface)_100%)]"
      />
      <div
        aria-hidden
        className="absolute inset-y-0 right-0 w-[55%] opacity-[0.4] max-md:opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(15,23,42,0.09) 1px, transparent 1px)",
          backgroundSize: "18px 18px",
          maskImage:
            "linear-gradient(90deg, transparent 0%, black 35%, black 100%)",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-gutter pt-space-xl pb-space-lg md:pb-space-xl">
        <div className="max-w-2xl text-center md:text-left mx-auto md:mx-0">
          <p className="text-label-sm font-semibold uppercase tracking-[0.14em] text-primary mb-space-sm animate-[resources-hero-in_0.5s_ease-out_both]">
            {t("marketing.pages.resourcesChrome.badge")}
          </p>

          <h1 className="text-headline-xl-mobile md:text-headline-xl lg:text-[2.5rem] lg:leading-[1.15] text-on-surface font-extrabold tracking-tight animate-[resources-hero-in_0.55s_ease-out_0.05s_both]">
            {title}
          </h1>

          {subtitle ? (
            <p className="mt-space-sm text-body-md text-on-surface-variant max-w-xl mx-auto md:mx-0 animate-[resources-hero-in_0.55s_ease-out_0.1s_both]">
              {subtitle}
            </p>
          ) : null}

          <nav
            aria-label={t("marketing.pages.resourcesChrome.navLabel")}
            className="mt-space-md flex flex-wrap justify-center md:justify-start gap-2 animate-[resources-hero-in_0.55s_ease-out_0.16s_both]"
          >
            {RESOURCES_NAV.map((item) => {
              const isActive = active === item.href;
              return (
                <LocaleLink
                  key={item.href}
                  locale={locale}
                  href={item.href}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-label-sm font-semibold transition-colors border",
                    isActive
                      ? "bg-primary text-on-primary border-primary shadow-sm"
                      : "bg-surface-container-lowest/90 text-on-surface-variant border-outline-variant/25 hover:border-outline-variant/50 hover:text-on-surface",
                  )}
                >
                  {t(item.labelKey)}
                </LocaleLink>
              );
            })}
          </nav>

          {children ? (
            <div className="mt-space-md animate-[resources-hero-in_0.55s_ease-out_0.22s_both]">
              {children}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
