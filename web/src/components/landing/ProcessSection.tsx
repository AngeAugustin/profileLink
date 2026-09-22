"use client";

import { Icon } from "@/components/ui/Icon";
import { useT } from "@/i18n/provider";

export function ProcessSection() {
  const t = useT();

  const steps = [
    {
      n: "01",
      title: t("marketing.process.s1Title"),
      body: t("marketing.process.s1Body"),
      foot: t("marketing.process.s1Foot"),
      footIcon: "sync",
      tone: "primary" as const,
    },
    {
      n: "02",
      title: t("marketing.process.s2Title"),
      body: t("marketing.process.s2Body"),
      foot: t("marketing.process.s2Foot"),
      footIcon: "style",
      tone: "neutral" as const,
    },
    {
      n: "03",
      title: t("marketing.process.s3Title"),
      body: t("marketing.process.s3Body"),
      foot: t("marketing.process.s3Foot"),
      footIcon: "high_quality",
      tone: "neutral" as const,
    },
    {
      n: "04",
      title: t("marketing.process.s4Title"),
      body: t("marketing.process.s4Body"),
      foot: t("marketing.process.s4Foot"),
      footIcon: "contactless",
      tone: "tertiary" as const,
    },
  ];

  return (
    <section className="w-full bg-surface-container-low py-space-xl">
      <div className="mx-auto max-w-7xl px-gutter">
        <div className="mx-auto mb-space-xl max-w-3xl text-center">
          <span className="font-mono text-[13px] font-bold uppercase tracking-[0.05em] text-primary">
            {t("marketing.process.eyebrow")}
          </span>
          <h2 className="mt-2 text-headline-xl-mobile font-bold text-on-surface md:text-headline-xl">
            {t("marketing.process.title")}
          </h2>
          <p className="mt-2 text-body-md text-on-surface-variant">
            {t("marketing.process.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-space-md md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div
              key={step.n}
              className="flex flex-col justify-between rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm transition-shadow hover:shadow-md"
            >
              <div>
                <div
                  className={`mb-space-md flex h-12 w-12 items-center justify-center rounded-lg text-base font-bold ${
                    step.tone === "primary"
                      ? "bg-primary-fixed text-on-primary-fixed"
                      : step.tone === "tertiary"
                        ? "bg-tertiary-fixed text-on-tertiary-fixed"
                        : "bg-surface-container text-on-surface"
                  }`}
                >
                  {step.n}
                </div>
                <h3 className="mb-2 text-headline-md font-semibold text-on-surface">
                  {step.title}
                </h3>
                <p className="text-body-sm text-on-surface-variant">{step.body}</p>
              </div>
              <div
                className={`mt-space-md flex items-center gap-2 border-t border-outline-variant/20 pt-space-sm text-label-md ${
                  step.tone === "tertiary"
                    ? "font-bold text-tertiary-container"
                    : step.tone === "primary"
                      ? "text-primary"
                      : "text-on-surface-variant"
                }`}
              >
                <Icon name={step.footIcon} className="text-base" />
                <span>{step.foot}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
