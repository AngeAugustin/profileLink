"use client";

import { useT } from "@/i18n/provider";

export function ExamplesSocialProof() {
  const t = useT();

  return (
    <section className="w-full bg-surface-container-low py-10 md:py-14">
      <div className="mx-auto max-w-7xl px-gutter">
        <div className="grid grid-cols-1 gap-6 rounded-2xl border border-outline-variant/20 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] md:p-8 lg:grid-cols-[1.35fr_0.85fr] lg:items-stretch lg:gap-8 lg:p-10">
          <blockquote className="min-w-0">
            <div className="mb-3 flex gap-0.5 text-tertiary-container" aria-hidden>
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className="text-lg leading-none">
                  ★
                </span>
              ))}
            </div>
            <p className="text-base font-bold leading-relaxed text-on-surface md:text-lg md:leading-8">
              « {t("marketing.examples.quoteBefore")}{" "}
              <span className="text-tertiary-container">
                {t("marketing.examples.quoteHighlight")}
              </span>{" "}
              {t("marketing.examples.quoteAfter")} »
            </p>
            <footer className="mt-5 flex items-center gap-3">
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-container text-xs font-bold text-on-surface"
                aria-hidden
              >
                ER
              </span>
              <div>
                <p className="text-sm font-bold text-on-surface">
                  {t("marketing.examples.quoteAuthor")}
                </p>
                <p className="text-xs text-on-surface-variant">
                  {t("marketing.examples.quoteRole")}
                </p>
              </div>
            </footer>
          </blockquote>

          <aside className="flex flex-col rounded-2xl bg-surface-container-low p-5 md:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-4xl font-extrabold tracking-tight text-primary md:text-5xl">
                4.9{" "}
                <span className="text-2xl font-bold text-primary md:text-3xl">/ 5</span>
              </p>
              <span className="rounded-full border border-outline-variant/25 bg-white px-2.5 py-0.5 text-[10px] font-semibold text-on-surface">
                {t("marketing.examples.ratingBadge")}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-on-surface-variant">
              {t("marketing.examples.ratingMeta")}
            </p>
            <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-6 text-xs">
              <span className="font-medium text-on-surface">
                {t("marketing.examples.ratingScan")}
              </span>
              <span className="font-semibold text-emerald-600">
                {t("marketing.examples.ratingCompat")}
              </span>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
