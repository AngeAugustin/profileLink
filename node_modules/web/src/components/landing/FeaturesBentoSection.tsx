"use client";

import { Icon } from "@/components/ui/Icon";
import { useT } from "@/i18n/provider";

export function FeaturesBentoSection() {
  const t = useT();

  const roles = [
    { label: t("marketing.features.developer"), slug: "jean-developpeur" },
    { label: t("marketing.features.consultant"), slug: "jean-consultant" },
    { label: t("marketing.features.designer"), slug: "jean-designer" },
  ];

  const chips = [
    t("marketing.features.chipSvg"),
    t("marketing.features.chipPng"),
    t("marketing.features.chipLogo"),
  ];

  const cards = [
    {
      icon: "timeline",
      title: t("marketing.features.timelineTitle"),
      body: t("marketing.features.timelineBody"),
      foot: t("marketing.features.timelineFoot"),
    },
    {
      icon: "workspace_premium",
      title: t("marketing.features.certsTitle"),
      body: t("marketing.features.certsBody"),
      foot: t("marketing.features.certsFoot"),
    },
    {
      icon: "insights",
      title: t("marketing.features.analyticsTitle"),
      body: t("marketing.features.analyticsBody"),
      foot: null as string | null,
      spark: true,
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-gutter py-space-xl w-full">
      <div className="text-center max-w-3xl mx-auto mb-space-xl">
        <span className="text-label-md text-primary font-semibold uppercase tracking-wider">
          {t("marketing.features.eyebrow")}
        </span>
        <h2 className="text-headline-xl-mobile md:text-headline-xl text-on-surface mt-1 font-bold">
          {t("marketing.features.title")}
        </h2>
        <p className="text-body-md text-on-surface-variant mt-2">
          {t("marketing.features.subtitle")}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
        <div className="md:col-span-2 rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm">
          <div className="flex items-center gap-space-sm mb-space-md">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Icon name="layers" />
            </div>
            <h3 className="text-headline-md font-semibold text-on-surface">
              {t("marketing.features.multiTitle")}
            </h3>
          </div>
          <p className="text-body-sm text-on-surface-variant mb-space-md">
            {t("marketing.features.multiBody")}
          </p>
          <div className="grid grid-cols-3 gap-space-sm">
            {roles.map((p, i) => (
              <div
                key={p.slug}
                className={`rounded-xl p-space-md border ${
                  i === 0
                    ? "bg-primary-fixed border-primary/20"
                    : "bg-surface-container-low border-transparent"
                }`}
              >
                <p className="text-label-sm font-semibold text-on-surface">{p.label}</p>
                <p className="text-body-sm text-on-surface-variant mt-1">/p/{p.slug}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-tertiary-container/10 text-tertiary-container flex items-center justify-center mb-space-md">
            <Icon name="qr_code_2" />
          </div>
          <h3 className="text-headline-md font-semibold text-on-surface mb-2">
            {t("marketing.features.qrTitle")}
          </h3>
          <p className="text-body-sm text-on-surface-variant mb-space-md">
            {t("marketing.features.qrBody")}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {chips.map((c) => (
              <span
                key={c}
                className="px-2 py-0.5 rounded-full bg-surface-container text-label-sm text-on-surface-variant"
              >
                {c}
              </span>
            ))}
          </div>
        </div>

        {cards.map((card) => (
          <div
            key={card.title}
            className="rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-space-md">
              <Icon name={card.icon} />
            </div>
            <h3 className="text-headline-md font-semibold text-on-surface mb-2">{card.title}</h3>
            <p className="text-body-sm text-on-surface-variant mb-space-md">{card.body}</p>
            {card.spark ? (
              <div className="flex items-end gap-1 h-10">
                {[40, 55, 35, 70, 50, 85, 65].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm bg-primary-container/70"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            ) : (
              <p className="text-label-sm text-primary font-semibold">{card.foot}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
