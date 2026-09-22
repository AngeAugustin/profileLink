"use client";

import { useEffect, useMemo, useState } from "react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/cn";

export type LegalMetaKey = "privacy" | "terms" | "legalNotice" | "cookies";

type LegalSection = {
  id: string;
  title: string;
  paragraphs: string[];
};

function slugify(input: string, index: number) {
  const base = input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  return base || `section-${index + 1}`;
}

export function LegalDocumentPage({
  active,
  metaKey,
}: {
  active: string;
  metaKey: LegalMetaKey;
}) {
  const { t } = useI18n();
  const base = `marketing.pages.${metaKey}` as const;
  const [activeId, setActiveId] = useState<string | null>(null);

  const sections: LegalSection[] = useMemo(() => {
    const sectionCount = Number(t(`${base}.sectionCount`));
    return Array.from({ length: sectionCount }, (_, i) => {
      const n = i + 1;
      const title = t(`${base}.s${n}.title`);
      const paraCount = Number(t(`${base}.s${n}.paraCount`));
      return {
        id: slugify(title, i),
        title,
        paragraphs: Array.from({ length: paraCount }, (_, j) =>
          t(`${base}.s${n}.p${j + 1}`),
        ),
      };
    });
  }, [base, t]);

  useEffect(() => {
    if (sections.length === 0) return;
    setActiveId(sections[0].id);

    const elements = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-20% 0px -55% 0px", threshold: [0.15, 0.4, 0.7] },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

  return (
    <MarketingShell active={active}>
      {/* Hero — Govern One–style: soft wash + watermark + pills */}
      <section className="relative overflow-hidden border-b border-outline-variant/20">
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(165deg,rgba(29,78,216,0.10)_0%,rgba(242,244,246,0.95)_42%,#f7f9fb_100%)]"
        />
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(15,23,42,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.05) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage:
              "radial-gradient(ellipse 70% 60% at 50% 30%, black 20%, transparent 75%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-8 md:top-4 flex justify-center select-none"
        >
          <span className="font-extrabold tracking-tight text-[clamp(4.5rem,18vw,11rem)] leading-none text-on-surface/[0.045]">
            {t(`${base}.watermark`)}
          </span>
        </div>

        <div className="relative max-w-4xl mx-auto px-gutter pt-space-xl pb-24 md:pb-28 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-surface-container-lowest/90 border border-outline-variant/25 px-3.5 py-1.5 shadow-sm mb-space-md">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-label-sm font-semibold text-on-surface tracking-wide">
              {t("marketing.pages.legalChrome.badge")}
            </span>
          </div>

          <h1 className="text-headline-xl-mobile md:text-display-lg-mobile lg:text-[2.75rem] lg:leading-[1.15] text-on-surface font-extrabold tracking-tight max-w-3xl mx-auto">
            {t(`${base}.title`)}
          </h1>

          <p className="mt-space-sm text-body-md text-on-surface-variant max-w-xl mx-auto">
            {t(`${base}.subtitle`)}
          </p>

          <div className="mt-space-md inline-flex items-center gap-2 rounded-full bg-surface-container-lowest/95 border border-outline-variant/25 px-3.5 py-1.5 shadow-sm text-label-sm text-on-surface-variant">
            <Icon name="calendar_today" className="text-[16px] text-primary" />
            <span>{t(`${base}.updated`)}</span>
          </div>
        </div>
      </section>

      {/* Overlapping document sheet */}
      <div className="relative z-10 max-w-7xl mx-auto px-2 md:px-space-sm -mt-14 md:-mt-16 pb-space-xl w-full">
        <div className="rounded-3xl bg-surface-container-lowest shadow-[0_12px_40px_rgba(15,23,42,0.08)] border border-outline-variant/20 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] items-start gap-space-sm lg:gap-space-md px-2 py-space-md md:px-space-sm md:py-space-lg">
            {/* TOC */}
            <aside className="min-w-0">
              <h2 className="text-headline-md text-on-surface font-bold tracking-tight m-0">
                {t("marketing.pages.legalChrome.toc")}
              </h2>
              <div
                aria-hidden
                className="border-b border-outline-variant/30 mt-space-sm mb-space-sm"
              />
              <nav aria-label={t("marketing.pages.legalChrome.toc")}>
                <ul className="flex flex-col m-0 p-0 list-none">
                  {sections.map((section) => {
                    const isActive = activeId === section.id;
                    return (
                      <li key={section.id}>
                        <a
                          href={`#${section.id}`}
                          className={cn(
                            "block rounded-r-lg pl-3 pr-2 py-2.5 text-body-sm transition-colors border-l-[3px]",
                            isActive
                              ? "bg-primary/8 text-primary font-semibold border-primary"
                              : "text-on-surface-variant border-transparent hover:bg-surface-container-low hover:text-on-surface",
                          )}
                        >
                          {section.title.replace(/^\d+\.\s*/, "")}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </aside>

            {/* Body */}
            <article className="min-w-0 space-y-space-xl lg:border-l lg:border-outline-variant/20 lg:pl-space-lg">
              {sections.map((section) => (
                <section
                  key={section.id}
                  id={section.id}
                  className="scroll-mt-28 space-y-space-sm"
                >
                  <h2 className="text-headline-md text-on-surface font-bold tracking-tight m-0">
                    {section.title}
                  </h2>
                  {section.paragraphs.map((p) => (
                    <p
                      key={p.slice(0, 64)}
                      className="text-body-md text-on-surface-variant leading-relaxed"
                    >
                      {p}
                    </p>
                  ))}
                </section>
              ))}

              <div className="rounded-2xl bg-surface-container-low border border-outline-variant/20 p-space-lg flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
                <div>
                  <h3 className="text-headline-md text-on-surface font-semibold">
                    {t("marketing.pages.legalChrome.contactTitle")}
                  </h3>
                  <p className="text-body-sm text-on-surface-variant mt-1 max-w-md">
                    {t("marketing.pages.legalChrome.contactBody")}
                  </p>
                </div>
                <Button href="/contact" size="sm" className="shrink-0">
                  <Icon name="mail" className="text-[18px]" />
                  {t("marketing.pages.legalChrome.contactCta")}
                </Button>
              </div>
            </article>
          </div>
        </div>
      </div>
    </MarketingShell>
  );
}
