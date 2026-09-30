"use client";

import { Icon } from "@/components/ui/Icon";
import { useT } from "@/i18n/provider";
import { cn } from "@/lib/cn";

type Cell = "yes" | "no" | string;

const ROWS: { labelKey: string; cells: Cell[] }[] = [
  { labelKey: "cmpR1", cells: ["yes", "no", "yes", "yes"] },
  { labelKey: "cmpR2", cells: ["yes", "no", "no", "no"] },
  { labelKey: "cmpR3", cells: ["yes", "no", "cmpBasicPng", "no"] },
  { labelKey: "cmpR4", cells: ["yes", "no", "cmpLimited", "cmpPassive"] },
  { labelKey: "cmpR5", cells: ["yes", "no", "cmpCookies", "cmpViews"] },
  { labelKey: "cmpR6", cells: ["yes", "no", "no", "no"] },
  { labelKey: "cmpR7", cells: ["yes", "no", "cmpPaywall", "no"] },
];

function CellValue({ value, t }: { value: Cell; t: (k: string) => string }) {
  if (value === "yes") {
    return (
      <Icon name="check_circle" filled className="text-lg text-primary" />
    );
  }
  if (value === "no") {
    return <Icon name="cancel" className="text-lg text-outline" />;
  }
  return (
    <span className="text-xs font-medium text-on-surface-variant">
      {t(`marketing.features.${value}`)}
    </span>
  );
}

export function FeaturesCompare() {
  const t = useT();
  const headers = [
    t("marketing.features.cmpColFeature"),
    t("marketing.features.cmpColPl"),
    t("marketing.features.cmpColPdf"),
    t("marketing.features.cmpColLink"),
    t("marketing.features.cmpColLi"),
  ];

  return (
    <section id="compare" className="w-full scroll-mt-24 py-10 md:py-14">
      <div className="mx-auto max-w-7xl px-gutter">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            {t("marketing.features.cmpEyebrow")}
          </p>
          <h2 className="text-[1.75rem] font-bold tracking-tight text-on-surface md:text-4xl md:leading-[44px]">
            {t("marketing.features.cmpTitle")}
          </h2>
          <p className="mt-3 text-[15px] leading-6 text-on-surface-variant">
            {t("marketing.features.cmpSubtitle")}
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-outline-variant/25 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr className="border-b border-outline-variant/25 bg-surface-container-low/80">
                {headers.map((h, i) => (
                  <th
                    key={h}
                    className={cn(
                      "px-4 py-4 text-sm font-semibold",
                      i === 0 && "pl-6 text-on-surface",
                      i === 1 && "bg-primary-fixed/40 text-center text-primary",
                      i > 1 && "text-center text-on-surface-variant",
                    )}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr
                  key={row.labelKey}
                  className="border-b border-outline-variant/15 last:border-0"
                >
                  <td className="px-6 py-4 text-sm font-medium text-on-surface">
                    {t(`marketing.features.${row.labelKey}`)}
                  </td>
                  {row.cells.map((cell, i) => (
                    <td
                      key={`${row.labelKey}-${i}`}
                      className={cn(
                        "px-4 py-4 text-center",
                        i === 0 && "bg-primary-fixed/20",
                      )}
                    >
                      <span className="inline-flex items-center justify-center">
                        <CellValue value={cell} t={t} />
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
