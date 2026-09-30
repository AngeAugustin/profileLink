"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { useT } from "@/i18n/provider";
import { cn } from "@/lib/cn";

type FeatureItem = {
  icon: string;
  titleKey: string;
  bodyKey: string;
};

type FeatureGroup = {
  id: string;
  titleKey: string;
  bodyKey: string;
  items: FeatureItem[];
};

const GROUPS: FeatureGroup[] = [
  {
    id: "build",
    titleKey: "gBuild",
    bodyKey: "gBuildBody",
    items: [
      { icon: "edit_note", titleKey: "fEditorTitle", bodyKey: "fEditorBody" },
      { icon: "palette", titleKey: "fThemesTitle", bodyKey: "fThemesBody" },
      { icon: "workspaces", titleKey: "fMultiTitle", bodyKey: "fMultiBody" },
      { icon: "view_timeline", titleKey: "fTimelineTitle", bodyKey: "fTimelineBody" },
      { icon: "verified", titleKey: "fCertsTitle", bodyKey: "fCertsBody" },
    ],
  },
  {
    id: "share",
    titleKey: "gShare",
    bodyKey: "gShareBody",
    items: [
      { icon: "link", titleKey: "fLinkTitle", bodyKey: "fLinkBody" },
      { icon: "qr_code_2", titleKey: "fQrTitle", bodyKey: "fQrBody" },
      { icon: "language", titleKey: "fDomainTitle", bodyKey: "fDomainBody" },
      { icon: "share", titleKey: "fTouchTitle", bodyKey: "fTouchBody" },
    ],
  },
  {
    id: "measure",
    titleKey: "gMeasure",
    bodyKey: "gMeasureBody",
    items: [
      { icon: "insights", titleKey: "fAnalyticsTitle", bodyKey: "fAnalyticsBody" },
    ],
  },
  {
    id: "control",
    titleKey: "gControl",
    bodyKey: "gControlBody",
    items: [
      { icon: "lock", titleKey: "fPasswordTitle", bodyKey: "fPasswordBody" },
      { icon: "publish", titleKey: "fPublishTitle", bodyKey: "fPublishBody" },
      { icon: "shield_person", titleKey: "fPrivacyTitle", bodyKey: "fPrivacyBody" },
    ],
  },
];

export function FeaturesCatalog() {
  const t = useT();
  const [activeId, setActiveId] = useState(GROUPS[0].id);
  const active = GROUPS.find((g) => g.id === activeId) ?? GROUPS[0];

  return (
    <section className="w-full border-t border-outline-variant/15 bg-surface">
      <div className="mx-auto max-w-7xl px-gutter py-10 md:py-14">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              {t("marketing.features.catalogEyebrow")}
            </p>
            <h2 className="text-[1.75rem] font-bold leading-tight tracking-tight text-on-surface md:text-3xl">
              {t("marketing.features.catalogTitle")}
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-on-surface-variant">
              {t("marketing.features.catalogSubtitle")}
            </p>
          </div>

          <div
            role="tablist"
            aria-label={t("marketing.features.catalogEyebrow")}
            className="flex w-full shrink-0 flex-wrap gap-1 rounded-xl bg-surface-container-low p-1 md:w-auto"
          >
            {GROUPS.map((group) => {
              const selected = group.id === activeId;
              return (
                <button
                  key={group.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setActiveId(group.id)}
                  className={cn(
                    "rounded-lg px-3.5 py-2 text-sm font-semibold transition-all",
                    selected
                      ? "bg-white text-on-surface shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface",
                  )}
                >
                  {t(`marketing.features.${group.titleKey}`)}
                </button>
              );
            })}
          </div>
        </div>

        <p className="mt-5 text-sm text-on-surface-variant md:mt-6">
          {t(`marketing.features.${active.bodyKey}`)}
        </p>

        <ul
          role="tabpanel"
          className="mt-5 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3"
        >
          {active.items.map((item) => (
            <li
              key={item.titleKey}
              className="group flex gap-3 rounded-2xl border border-outline-variant/20 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors hover:border-primary/25 hover:bg-primary/[0.02]"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                <Icon name={item.icon} className="text-[18px]" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold tracking-tight text-on-surface">
                  {t(`marketing.features.${item.titleKey}`)}
                </h3>
                <p className="mt-1 text-[13px] leading-snug text-on-surface-variant">
                  {t(`marketing.features.${item.bodyKey}`)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
