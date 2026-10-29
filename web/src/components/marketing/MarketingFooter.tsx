"use client";

import { Logo } from "@/components/brand/Logo";
import { LocaleLink } from "@/i18n/path";
import { useI18n } from "@/i18n/provider";

export function MarketingFooter() {
  const { locale, t } = useI18n();
  const year = new Date().getFullYear();

  const columns = [
    {
      title: t("marketing.footer.product"),
      links: [
        { href: "/fonctionnalites", label: t("marketing.footer.features") },
        { href: "/themes", label: t("marketing.footer.themes") },
        { href: "/generateur-qr", label: t("marketing.footer.qrGenerator") },
        { href: "/tarifs", label: t("marketing.footer.pricing") },
      ],
    },
    {
      title: t("marketing.footer.resources"),
      links: [
        { href: "/aide", label: t("marketing.footer.help") },
        { href: "/faq", label: t("marketing.footer.faq") },
        { href: "/guides", label: t("marketing.footer.guides") },
      ],
    },
    {
      title: t("marketing.footer.legal"),
      links: [
        { href: "/confidentialite", label: t("marketing.footer.privacy") },
        { href: "/conditions", label: t("marketing.footer.terms") },
        { href: "/mentions-legales", label: t("marketing.footer.legalNotice") },
        { href: "/cookies", label: t("marketing.footer.cookies") },
      ],
    },
  ];

  return (
    <footer className="w-full bg-surface-container-low border-t border-outline-variant/30 py-space-xl">
      <div className="max-w-7xl mx-auto px-gutter">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-space-xl mb-space-xl">
          <div className="col-span-2">
            <div className="mb-space-sm">
              <Logo href={`/${locale}`} />
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm mb-space-md">
              {t("marketing.footer.tagline")}
            </p>
            <div className="inline-flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-emerald-50 text-emerald-700 font-label-sm text-label-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {t("marketing.footer.status")}
            </div>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="font-label-md text-label-md text-on-surface mb-space-md">
                {col.title}
              </h3>
              <ul className="space-y-space-sm">
                {col.links.map((link) => (
                  <li key={link.href + link.label}>
                    <LocaleLink
                      locale={locale}
                      href={link.href}
                      className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors"
                    >
                      {link.label}
                    </LocaleLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-space-lg border-t border-outline-variant/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-sm">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            © {year}{" "}
            <a
              href="https://www.augustinfachehoun.pro/fr"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-on-surface hover:text-primary transition-colors"
            >
              AF
            </a>
            . {t("marketing.footer.rightsReserved")}
          </p>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            {t("marketing.footer.bottomNote")}
          </p>
        </div>
      </div>
    </footer>
  );
}
