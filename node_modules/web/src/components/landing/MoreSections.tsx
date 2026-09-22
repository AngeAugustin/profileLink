"use client";

import { Icon } from "@/components/ui/Icon";
import { useT } from "@/i18n/provider";

export function TouchpointsSection() {
  const t = useT();

  return (
    <section className="w-full bg-surface-container-low py-space-xl">
      <div className="mx-auto max-w-7xl px-gutter">
        <div className="mx-auto mb-space-xl max-w-3xl text-center">
          <span className="font-mono text-[13px] font-bold uppercase tracking-[0.05em] text-primary">
            {t("marketing.touchpoints.eyebrow")}
          </span>
          <h2 className="mt-2 text-headline-xl-mobile font-bold text-on-surface md:text-headline-xl">
            {t("marketing.touchpoints.title")}
          </h2>
          <p className="mt-2 text-body-md text-on-surface-variant">
            {t("marketing.touchpoints.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-space-lg sm:grid-cols-2 lg:grid-cols-4">
          {/* NFC Card */}
          <article className="flex flex-col">
            <div className="mb-space-md flex h-44 flex-col justify-between rounded-lg bg-[#2D3133] p-space-md text-on-primary shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-black">
                  <Icon name="hub" className="text-sm text-surface-variant" />
                </div>
                <Icon name="contactless" className="text-surface-variant" />
              </div>
              <div>
                <p className="text-label-md font-bold text-on-primary">Jean Dupont</p>
                <p className="font-mono text-[11px] text-surface-variant">
                  {t("marketing.touchpoints.nfcSeries")}
                </p>
              </div>
            </div>
            <h3 className="mb-1 text-headline-md font-semibold text-on-surface">
              {t("marketing.touchpoints.nfcTitle")}
            </h3>
            <p className="text-body-sm text-on-surface-variant">
              {t("marketing.touchpoints.nfcBody")}
            </p>
          </article>

          {/* Email signature */}
          <article className="flex flex-col">
            <div className="mb-space-md flex h-44 flex-col justify-center rounded-lg bg-surface-container p-space-md">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-container text-base font-bold text-on-primary">
                  JD
                </div>
                <div>
                  <p className="text-label-md font-bold text-on-surface">Jean Dupont</p>
                  <p className="text-[11px] text-on-surface-variant">
                    {t("marketing.touchpoints.emailRole")}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 border-t border-outline-variant/40 pt-3">
                <Icon name="link" className="text-sm text-primary" />
                <span className="font-mono text-[11px] font-bold text-primary">
                  profilelink.me/p/jean
                </span>
              </div>
            </div>
            <h3 className="mb-1 text-headline-md font-semibold text-on-surface">
              {t("marketing.touchpoints.emailTitle")}
            </h3>
            <p className="text-body-sm text-on-surface-variant">
              {t("marketing.touchpoints.emailBody")}
            </p>
          </article>

          {/* Event badge */}
          <article className="flex flex-col">
            <div className="mb-space-md flex h-44 flex-col items-center justify-center gap-2 rounded-lg bg-surface-container p-space-md">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-surface-container-lowest shadow-sm">
                <Icon name="qr_code_2" className="text-3xl text-on-surface" />
              </div>
              <p className="text-center text-[11px] font-bold uppercase tracking-wider text-on-surface">
                {t("marketing.touchpoints.badgeLabel")}
              </p>
            </div>
            <h3 className="mb-1 text-headline-md font-semibold text-on-surface">
              {t("marketing.touchpoints.badgeTitle")}
            </h3>
            <p className="text-body-sm text-on-surface-variant">
              {t("marketing.touchpoints.badgeBody")}
            </p>
          </article>

          {/* Wallet pass */}
          <article className="flex flex-col">
            <div className="mb-space-md flex h-44 flex-col justify-between rounded-lg bg-primary-container p-space-md text-on-primary shadow-sm">
              <div className="flex items-start justify-between">
                <p className="text-[12px] font-bold uppercase tracking-wide text-on-primary">
                  {t("marketing.touchpoints.walletLabel")}
                </p>
                <Icon name="wallet" className="text-on-primary" />
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-6 items-center justify-center rounded bg-on-primary/20">
                  <Icon name="qr_code" className="text-sm text-on-primary" />
                </div>
                <p className="text-[12px] leading-snug text-on-primary">
                  {t("marketing.touchpoints.walletHint")}
                </p>
              </div>
            </div>
            <h3 className="mb-1 text-headline-md font-semibold text-on-surface">
              {t("marketing.touchpoints.walletTitle")}
            </h3>
            <p className="text-body-sm text-on-surface-variant">
              {t("marketing.touchpoints.walletBody")}
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}

export function PersonasSection() {
  const t = useT();

  const personas = [
    {
      icon: "business_center",
      title: t("marketing.personas.freelance"),
      foot: t("marketing.personas.freelanceFoot"),
    },
    {
      icon: "terminal",
      title: t("marketing.personas.tech"),
      foot: t("marketing.personas.techFoot"),
    },
    {
      icon: "draw",
      title: t("marketing.personas.design"),
      foot: t("marketing.personas.designFoot"),
      tertiary: true,
    },
    {
      icon: "school",
      title: t("marketing.personas.students"),
      foot: t("marketing.personas.studentsFoot"),
    },
    {
      icon: "corporate_fare",
      title: t("marketing.personas.exec"),
      foot: t("marketing.personas.execFoot"),
    },
  ];

  return (
    <section className="mx-auto w-full max-w-7xl px-gutter py-space-xl">
      <div className="mx-auto mb-space-xl max-w-3xl text-center">
        <span className="text-label-md font-semibold uppercase tracking-wider text-primary">
          {t("marketing.personas.eyebrow")}
        </span>
        <h2 className="mt-1 text-headline-xl-mobile font-bold text-on-surface md:text-headline-xl">
          {t("marketing.personas.title")}
        </h2>
        <p className="mt-2 text-body-md text-on-surface-variant">
          {t("marketing.personas.subtitle")}
        </p>
      </div>
      <div className="grid grid-cols-1 gap-space-md md:grid-cols-3 lg:grid-cols-5">
        {personas.map((p) => (
          <div
            key={p.title}
            className="rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm transition-transform hover:-translate-y-1"
          >
            <div
              className={`mb-space-md flex h-10 w-10 items-center justify-center rounded-xl ${
                p.tertiary
                  ? "bg-tertiary-container/10 text-tertiary-container"
                  : "bg-primary/10 text-primary"
              }`}
            >
              <Icon name={p.icon} />
            </div>
            <h3 className="mb-2 text-label-md font-semibold text-on-surface">{p.title}</h3>
            <p
              className={`text-body-sm font-semibold ${
                p.tertiary ? "text-tertiary-container" : "text-primary"
              }`}
            >
              {p.foot}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
