"use client";

import { Icon } from "@/components/ui/Icon";
import { useT } from "@/i18n/provider";
import { cn } from "@/lib/cn";

type FeatureItem = {
  icon: string;
  titleKey: string;
  bodyKey: string;
};

type FeatureGroup = {
  titleKey: string;
  bodyKey: string;
  items: FeatureItem[];
  tone: "plain" | "soft";
};

const GROUPS: FeatureGroup[] = [
  {
    titleKey: "gBuild",
    bodyKey: "gBuildBody",
    tone: "plain",
    items: [
      { icon: "edit_note", titleKey: "fEditorTitle", bodyKey: "fEditorBody" },
      { icon: "palette", titleKey: "fThemesTitle", bodyKey: "fThemesBody" },
      { icon: "workspaces", titleKey: "fMultiTitle", bodyKey: "fMultiBody" },
      {
        icon: "view_timeline",
        titleKey: "fTimelineTitle",
        bodyKey: "fTimelineBody",
      },
      { icon: "verified", titleKey: "fCertsTitle", bodyKey: "fCertsBody" },
    ],
  },
  {
    titleKey: "gShare",
    bodyKey: "gShareBody",
    tone: "soft",
    items: [
      { icon: "link", titleKey: "fLinkTitle", bodyKey: "fLinkBody" },
      { icon: "qr_code_2", titleKey: "fQrTitle", bodyKey: "fQrBody" },
      { icon: "language", titleKey: "fDomainTitle", bodyKey: "fDomainBody" },
      { icon: "share", titleKey: "fTouchTitle", bodyKey: "fTouchBody" },
    ],
  },
  {
    titleKey: "gMeasure",
    bodyKey: "gMeasureBody",
    tone: "plain",
    items: [
      {
        icon: "insights",
        titleKey: "fAnalyticsTitle",
        bodyKey: "fAnalyticsBody",
      },
    ],
  },
  {
    titleKey: "gControl",
    bodyKey: "gControlBody",
    tone: "soft",
    items: [
      { icon: "lock", titleKey: "fPasswordTitle", bodyKey: "fPasswordBody" },
      { icon: "publish", titleKey: "fPublishTitle", bodyKey: "fPublishBody" },
      {
        icon: "shield_person",
        titleKey: "fPrivacyTitle",
        bodyKey: "fPrivacyBody",
      },
    ],
  },
];

export function FeaturesCatalog() {
  const t = useT();

  return (
    <div className="w-full">
      <section className="max-w-7xl mx-auto px-gutter pt-space-xl pb-space-lg text-center md:text-left">
        <p className="text-label-sm font-semibold uppercase tracking-[0.14em] text-primary mb-space-sm">
          {t("marketing.features.catalogEyebrow")}
        </p>
        <h2 className="text-headline-xl-mobile md:text-headline-xl text-on-surface font-bold tracking-tight max-w-2xl mx-auto md:mx-0">
          {t("marketing.features.catalogTitle")}
        </h2>
        <p className="mt-space-sm text-body-md text-on-surface-variant max-w-xl mx-auto md:mx-0">
          {t("marketing.features.catalogSubtitle")}
        </p>
      </section>

      {GROUPS.map((group) => (
        <section
          key={group.titleKey}
          className={cn(
            "w-full py-space-xl border-t border-outline-variant/15",
            group.tone === "soft" && "bg-surface-container-low/60",
          )}
        >
          <div className="max-w-7xl mx-auto px-gutter">
            <div className="grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)] gap-space-lg lg:gap-space-xl">
              <header className="lg:sticky lg:top-28 lg:self-start">
                <h3 className="text-headline-md text-on-surface font-bold tracking-tight">
                  {t(`marketing.features.${group.titleKey}`)}
                </h3>
                <p className="mt-space-xs text-body-sm text-on-surface-variant max-w-xs">
                  {t(`marketing.features.${group.bodyKey}`)}
                </p>
              </header>

              <ul className="m-0 p-0 list-none divide-y divide-outline-variant/20 rounded-2xl bg-surface-container-lowest/80 border border-outline-variant/15 overflow-hidden shadow-[0_8px_28px_rgba(15,23,42,0.04)]">
                {group.items.map((item) => (
                  <li
                    key={item.titleKey}
                    className="flex gap-space-md p-space-md md:p-space-lg hover:bg-primary/[0.03] transition-colors"
                  >
                    <div className="w-10 h-10 shrink-0 rounded-xl bg-primary/8 text-primary flex items-center justify-center">
                      <Icon name={item.icon} className="text-[20px]" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-[1.0625rem] font-semibold text-on-surface tracking-tight">
                        {t(`marketing.features.${item.titleKey}`)}
                      </h4>
                      <p className="mt-1 text-body-sm text-on-surface-variant leading-relaxed">
                        {t(`marketing.features.${item.bodyKey}`)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
