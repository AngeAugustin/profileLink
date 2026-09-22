"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useT } from "@/i18n/provider";
import { cn } from "@/lib/cn";
import type { ThemeMood } from "@/lib/profile-themes";
import { DEFAULT_PROFILE_THEMES } from "@/lib/profile-themes";

type MoodFilter = "all" | ThemeMood;

type GalleryTheme = {
  id: string;
  name: string;
  description: string;
  mood: ThemeMood;
  preview: string;
  accentDot: string;
  light: boolean;
};

const FILTERS: { id: MoodFilter; labelKey: string }[] = [
  { id: "all", labelKey: "filterAll" },
  { id: "corporate", labelKey: "filterCorporate" },
  { id: "light", labelKey: "filterLight" },
  { id: "bold", labelKey: "filterBold" },
  { id: "night", labelKey: "filterNight" },
];

const MOOD_TAG: Record<ThemeMood, string> = {
  corporate: "tagCorporate",
  light: "tagLight",
  bold: "tagBold",
  night: "tagNight",
};

function fallbackThemes(): GalleryTheme[] {
  return DEFAULT_PROFILE_THEMES.map((th) => ({
    id: th.id,
    name: th.name,
    description: th.description,
    mood: th.mood,
    preview: th.preview,
    accentDot: th.accentDot,
    light: th.light,
  }));
}

export function ThemesGallery() {
  const t = useT();
  const [filter, setFilter] = useState<MoodFilter>("all");
  const [themes, setThemes] = useState<GalleryTheme[]>(fallbackThemes);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/themes");
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled || !Array.isArray(data.themes) || data.themes.length === 0) {
          return;
        }
        setThemes(
          data.themes.map(
            (th: {
              id: string;
              name: string;
              description: string;
              mood: ThemeMood;
              preview: string;
              accentDot: string;
              light: boolean;
            }) => ({
              id: th.id,
              name: th.name,
              description: th.description,
              mood: th.mood,
              preview: th.preview,
              accentDot: th.accentDot,
              light: th.light,
            }),
          ),
        );
      } catch {
        /* keep defaults */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const visible = useMemo(
    () => themes.filter((th) => filter === "all" || th.mood === filter),
    [themes, filter],
  );

  return (
    <>
      <section
        id="themes-gallery"
        className="scroll-mt-24 w-full bg-[#f4f6f9] border-t border-slate-200/80"
      >
        <div className="max-w-7xl mx-auto px-gutter pt-space-xl pb-space-xl">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-space-lg mb-space-xl">
            <div className="max-w-xl">
              <p className="font-display text-label-sm font-semibold uppercase tracking-[0.18em] text-primary mb-space-sm">
                {t("marketing.pages.themes.galleryEyebrow")}
              </p>
              <h2 className="font-display text-headline-xl-mobile md:text-headline-xl text-on-surface font-extrabold tracking-tight">
                {t("marketing.pages.themes.galleryTitle")}
              </h2>
              <p className="mt-space-sm text-body-md text-on-surface-variant leading-relaxed">
                {t("marketing.pages.themes.gallerySubtitle")}
              </p>
            </div>

            <div
              className="flex flex-wrap gap-x-1 gap-y-2 border-b border-slate-300/70 pb-px"
              role="tablist"
              aria-label={t("marketing.pages.themes.galleryEyebrow")}
            >
              {FILTERS.map((f) => {
                const active = filter === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setFilter(f.id)}
                    className={cn(
                      "relative px-3.5 py-2.5 text-label-sm font-semibold transition-colors",
                      active
                        ? "text-primary"
                        : "text-on-surface-variant hover:text-on-surface",
                    )}
                  >
                    {t(`marketing.pages.themes.${f.labelKey}`)}
                    <span
                      className={cn(
                        "absolute left-3 right-3 -bottom-px h-0.5 rounded-full bg-primary transition-opacity duration-200",
                        active ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-space-md">
            {visible.map((theme, index) => (
              <article
                key={theme.id}
                className="group relative flex flex-col overflow-hidden rounded-2xl bg-white border border-slate-200/80 shadow-[0_1px_0_rgba(15,23,42,0.04)] transition-[transform,box-shadow,border-color] duration-400 ease-out hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(15,23,42,0.1)] hover:border-primary/25"
                style={{
                  animation: `themes-card-in 0.55s ease-out ${Math.min(index, 12) * 0.04}s both`,
                }}
              >
                {/* Swatch + mini profile */}
                <div className="relative flex h-44 sm:h-48">
                  <div
                    className={cn(
                      "w-[28%] shrink-0 transition-[width] duration-500 ease-out group-hover:w-[32%]",
                      theme.preview,
                    )}
                  />
                  <div
                    className={cn(
                      "relative flex-1 p-3 flex flex-col",
                      theme.preview,
                    )}
                  >
                    <div
                      aria-hidden
                      className="absolute inset-0 opacity-50"
                      style={{
                        backgroundImage:
                          "linear-gradient(135deg, rgba(255,255,255,0.12), transparent 50%)",
                      }}
                    />
                    <div
                      className={cn(
                        "relative flex-1 rounded-xl overflow-hidden border flex flex-col shadow-[0_10px_28px_rgba(0,0,0,0.2)] transition-transform duration-500 ease-out group-hover:scale-[1.02]",
                        theme.light
                          ? "bg-white/92 border-white/60 text-stone-900"
                          : "bg-black/50 border-white/10 text-white backdrop-blur-md",
                      )}
                    >
                      <div
                        className={cn(
                          "flex items-center gap-1 px-2.5 py-1.5 border-b",
                          theme.light
                            ? "border-stone-200/80 bg-stone-50/90"
                            : "border-white/10 bg-black/25",
                        )}
                      >
                        <span className="size-1.5 rounded-full bg-red-400/90" />
                        <span className="size-1.5 rounded-full bg-amber-400/90" />
                        <span className="size-1.5 rounded-full bg-emerald-400/90" />
                      </div>
                      <div className="flex-1 p-2.5 flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "size-7 rounded-lg shrink-0",
                              theme.light ? "bg-stone-200" : "bg-white/20",
                            )}
                          />
                          <div className="flex-1 space-y-1.5 min-w-0">
                            <div
                              className={cn(
                                "h-1.5 w-3/4 rounded-full",
                                theme.light ? "bg-stone-300" : "bg-white/35",
                              )}
                            />
                            <div
                              className={cn(
                                "h-1 w-1/2 rounded-full",
                                theme.light ? "bg-stone-200" : "bg-white/20",
                              )}
                            />
                          </div>
                          <span
                            className={cn(
                              "size-2 rounded-full shrink-0",
                              theme.accentDot,
                            )}
                          />
                        </div>
                        <div className="mt-auto flex gap-1">
                          {[0, 1, 2].map((n) => (
                            <span
                              key={n}
                              className={cn(
                                "h-4 flex-1 rounded-md",
                                theme.light ? "bg-stone-100" : "bg-white/12",
                              )}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col flex-1 p-space-md md:p-space-lg gap-space-sm">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display text-headline-md font-bold text-on-surface tracking-tight">
                      {theme.name}
                    </h3>
                    <span className="shrink-0 mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-on-surface-variant">
                      {t(`marketing.pages.themes.${MOOD_TAG[theme.mood]}`)}
                    </span>
                  </div>
                  <p className="text-body-sm text-on-surface-variant leading-relaxed line-clamp-2">
                    {theme.description}
                  </p>
                  <div className="mt-auto flex flex-wrap gap-2 pt-space-sm">
                    <Button
                      variant="outline"
                      size="sm"
                      href={`/themes/preview/${theme.id}`}
                      target="_blank"
                    >
                      <Icon name="visibility" className="text-[18px]" />
                      {t("marketing.pages.themes.preview")}
                    </Button>
                    <Button href="/inscription" variant="muted" size="sm">
                      <Icon name="palette" className="text-[18px]" />
                      {t("marketing.pages.themes.cta")}
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <p className="text-center text-body-sm text-on-surface-variant mt-space-xl max-w-2xl mx-auto">
            {t("marketing.pages.themes.note")}
          </p>
        </div>
      </section>
    </>
  );
}
