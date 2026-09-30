"use client";

import { Icon } from "@/components/ui/Icon";
import { useT } from "@/i18n/provider";

const USES = [
  {
    icon: "event",
    titleKey: "useSalonTitle",
    bodyKey: "useSalonBody",
  },
  {
    icon: "mail",
    titleKey: "useMailTitle",
    bodyKey: "useMailBody",
  },
  {
    icon: "description",
    titleKey: "useCvTitle",
    bodyKey: "useCvBody",
  },
  {
    icon: "share",
    titleKey: "useBioTitle",
    bodyKey: "useBioBody",
  },
] as const;

export function ExamplesUseCases() {
  const t = useT();

  return (
    <section className="w-full bg-surface-container-low py-10 md:py-14">
      <div className="mx-auto max-w-7xl px-gutter">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            {t("marketing.examples.useEyebrow")}
          </p>
          <h2 className="mt-2 text-[1.75rem] font-bold tracking-tight text-on-surface md:text-4xl md:leading-[44px]">
            {t("marketing.examples.useTitle")}
          </h2>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {USES.map((u) => (
            <article
              key={u.titleKey}
              className="rounded-2xl border border-outline-variant/25 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
            >
              <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon name={u.icon} className="text-xl" />
              </span>
              <h3 className="text-sm font-bold text-on-surface">
                {t(`marketing.examples.${u.titleKey}`)}
              </h3>
              <p className="mt-1.5 text-[13px] leading-5 text-on-surface-variant">
                {t(`marketing.examples.${u.bodyKey}`)}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
