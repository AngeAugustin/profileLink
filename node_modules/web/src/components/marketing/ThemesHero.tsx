"use client";

import { Button } from "@/components/ui/Button";
import { useI18n, useT } from "@/i18n/provider";
import { localizedPath } from "@/i18n/path";
import { cn } from "@/lib/cn";

const RUNWAY = [
  {
    id: "midnight",
    label: "Midnight",
    preview: "bg-gradient-to-b from-[#0b1220] via-[#152238] to-[#1e3a5f]",
  },
  {
    id: "ocean",
    label: "Ocean",
    preview: "bg-gradient-to-b from-sky-800 via-blue-600 to-cyan-400",
  },
  {
    id: "mint",
    label: "Mint",
    preview: "bg-gradient-to-b from-teal-700 via-teal-500 to-cyan-200",
  },
  {
    id: "honey",
    label: "Honey",
    preview: "bg-gradient-to-b from-amber-800 via-amber-500 to-yellow-300",
  },
  {
    id: "coral",
    label: "Coral",
    preview: "bg-gradient-to-b from-rose-700 via-orange-500 to-amber-300",
  },
  {
    id: "noir",
    label: "Noir",
    preview: "bg-gradient-to-b from-black via-[#3f0a0a] to-red-700",
  },
] as const;

export function ThemesHero() {
  const t = useT();
  const { locale } = useI18n();

  return (
    <section className="relative isolate overflow-hidden flex flex-col border-b border-outline-variant/15">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_75%_65%_at_85%_10%,rgba(29,78,216,0.11),transparent_55%),radial-gradient(ellipse_50%_45%_at_10%_80%,rgba(163,57,0,0.05),transparent_50%),linear-gradient(165deg,#f7f9fb_0%,#eef3f9_45%,#f7f9fb_100%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.3]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(15,23,42,0.07) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 75% 45%, black 15%, transparent 72%)",
        }}
      />

      <div className="relative flex-1 flex flex-col justify-center max-w-7xl w-full mx-auto px-gutter pt-space-xl pb-space-lg">
        <div className="max-w-2xl">
          <p className="font-display text-label-sm font-semibold uppercase tracking-[0.14em] text-primary mb-space-sm animate-[themes-fade-up_0.7s_ease-out_both]">
            {t("marketing.pages.themes.eyebrow")}
          </p>
          <h1 className="font-display text-headline-xl-mobile md:text-headline-xl lg:text-[2.6rem] lg:leading-[1.12] text-on-surface font-extrabold tracking-tight animate-[themes-fade-up_0.7s_ease-out_0.08s_both]">
            {t("marketing.pages.themes.title")}
          </h1>
          <p className="mt-space-sm text-body-md text-on-surface-variant max-w-lg animate-[themes-fade-up_0.7s_ease-out_0.14s_both]">
            {t("marketing.pages.themes.subtitle")}
          </p>
          <div className="mt-space-md flex flex-col sm:flex-row gap-space-sm animate-[themes-fade-up_0.7s_ease-out_0.2s_both]">
            <Button href="#themes-gallery" size="md">
              {t("marketing.pages.themes.ctaBrowse")}
            </Button>
            <Button href="/inscription" variant="outline" size="md">
              {t("marketing.pages.themes.ctaCreate")}
            </Button>
          </div>
        </div>
      </div>

      <div className="relative w-full mt-auto">
        <p className="max-w-7xl mx-auto px-gutter mb-3 text-label-sm font-semibold tracking-[0.12em] uppercase text-on-surface-variant">
          {t("marketing.pages.themes.fanLabel")}
        </p>
        <div className="flex w-full h-[9.5rem] sm:h-[11rem] md:h-[13rem]">
          {RUNWAY.map((swatch, i) => (
            <a
              key={swatch.id}
              href={localizedPath(locale, `/themes/preview/${swatch.id}`)}
              className={cn(
                "group relative flex-1 min-w-0 overflow-hidden transition-[flex] duration-500 ease-out hover:flex-[1.35] focus-visible:flex-[1.35] outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset animate-[themes-fade-up_0.8s_ease-out_both]",
                swatch.preview,
              )}
              style={{ animationDelay: `${0.2 + i * 0.06}s` }}
            >
              <span className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-80" />
              <span className="absolute bottom-3 left-3 right-3 font-display text-label-sm sm:text-label-md font-bold text-white tracking-tight truncate drop-shadow-sm translate-y-1 opacity-90 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                {swatch.label}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
