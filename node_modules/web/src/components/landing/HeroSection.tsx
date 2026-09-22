"use client";

import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { ToastProvider, useToast } from "@/components/ui/Toast";
import { useT } from "@/i18n/provider";

const LOGOS = ["Lumio", "alan", "Doctolib", "QONTO", "BlaBlaCar", "PayFit"];

function HeroInner() {
  const { toast } = useToast();
  const t = useT();
  const slug = "profilelink.me/p/jean-dupont";
  const skills = [
    { label: t("marketing.hero.skill1"), accent: false },
    { label: t("marketing.hero.skill2"), accent: false },
    { label: t("marketing.hero.skill3"), accent: false },
    { label: t("marketing.hero.skill4"), accent: true },
  ];

  function copySlug() {
    void navigator.clipboard.writeText(`https://${slug}`);
    toast(t("marketing.hero.toastCopied"));
  }

  return (
    <div className="relative w-full overflow-hidden">
      <div
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[480px] w-[720px] -translate-x-1/2 -translate-y-8 rounded-full opacity-80 blur-3xl"
        style={{
          background:
            "linear-gradient(24deg, rgba(183, 196, 255, 0.35) 0%, rgba(0, 55, 176, 0.1) 50%, rgba(0, 55, 176, 0) 100%)",
        }}
        aria-hidden
      />

      <section className="mx-auto w-full max-w-7xl px-gutter pb-12 pt-10 lg:pb-16 lg:pt-14">
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-surface-container-lowest px-4 py-1.5 shadow-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-40" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
            </span>
            <span className="font-mono text-[13px] font-bold uppercase tracking-[0.05em] text-primary">
              {t("marketing.hero.versionBadge")}
            </span>
            <span className="text-outline">•</span>
            <span className="inline-flex items-center gap-1 text-label-sm font-semibold text-on-surface-variant">
              <Icon name="auto_awesome" className="text-sm text-tertiary-container" />
              {t("marketing.hero.eyebrow")}
            </span>
          </div>

          <h1 className="mt-space-md max-w-4xl text-display-lg-mobile font-extrabold tracking-tight text-on-surface md:text-display-lg">
            {t("marketing.hero.title1")}
            <br />
            <span className="bg-gradient-to-r from-primary-container via-primary to-primary-container bg-clip-text text-transparent">
              {t("marketing.hero.titleLink")}
            </span>{" "}
            <span className="text-on-surface">{t("marketing.hero.titleQr")}</span>
            <br className="hidden sm:block" />{" "}
            <span className="text-on-surface">{t("marketing.hero.titleInstant")}</span>
          </h1>

          <p className="mt-space-md max-w-2xl text-body-lg leading-relaxed text-on-surface-variant">
            {t("marketing.hero.subtitle")}
          </p>

          <div className="mt-space-lg flex w-full flex-col items-stretch justify-center gap-space-md sm:w-auto sm:flex-row sm:items-center">
            <Button href="/inscription" size="lg" className="hover:-translate-y-0.5">
              {t("marketing.hero.ctaCreate")}
              <Icon name="arrow_forward" className="text-lg" />
            </Button>
            <Button href="#apercu-live" variant="secondary" size="lg">
              <Icon name="play_circle" className="text-lg text-primary-container" />
              {t("marketing.hero.ctaDemo")}
            </Button>
          </div>

          <div className="mt-space-md flex flex-wrap items-center justify-center gap-2">
            <div className="flex text-[#F59E0B]">
              {Array.from({ length: 5 }).map((_, i) => (
                <Icon key={i} name="star" filled className="text-base" />
              ))}
            </div>
            <span className="text-label-sm font-semibold text-on-surface">
              {t("marketing.hero.rating")}
            </span>
            <span className="text-body-sm text-on-surface-variant">
              {t("marketing.hero.ratingBy")}
            </span>
          </div>
        </div>

        {/* Split preview: profile (7) + QR/live (5) */}
        <div
          id="apercu-live"
          className="mx-auto mt-space-xl grid w-full max-w-5xl scroll-mt-24 grid-cols-1 items-center gap-6 lg:grid-cols-12"
        >
          {/* ——— Profile card ——— */}
          <article className="overflow-hidden rounded-xl bg-white shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] lg:col-span-7">
            <div
              className="flex h-28 items-start justify-end px-4 pt-4"
              style={{
                background:
                  "linear-gradient(90deg, rgba(29, 78, 216, 1) 0%, rgba(0, 55, 176, 1) 50%, rgba(33, 81, 218, 1) 100%)",
              }}
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-[12px] font-bold text-primary shadow-sm backdrop-blur-[6px]">
                <Icon name="verified" filled className="text-sm text-primary" />
                {t("marketing.hero.certified")}
              </span>
            </div>

            <div className="-mt-12 px-6 pb-6">
              <div className="mb-4 flex items-end justify-between gap-3">
                <div className="relative h-24 w-24 shrink-0 rounded-full bg-white p-1 shadow-[0_2px_4px_-2px_rgba(0,0,0,0.1),0_4px_6px_-1px_rgba(0,0,0,0.1)]">
                  <Image
                    src="/images/hero/jean-portrait-56586a.png"
                    alt="Jean Dupont"
                    width={88}
                    height={88}
                    className="h-full w-full rounded-full object-cover"
                    priority
                  />
                  <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full border-[2.5px] border-white bg-[#10B981] shadow-sm" />
                </div>

                <div className="flex items-center gap-2 pb-1">
                  <button
                    type="button"
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary-container px-4 text-[12px] font-semibold text-white shadow-sm transition hover:bg-primary"
                  >
                    <Icon name="mail" className="text-sm" />
                    {t("marketing.hero.contactBtn")}
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container text-on-surface transition hover:bg-surface-container-high"
                    aria-label="Share"
                  >
                    <Icon name="ios_share" className="text-base" />
                  </button>
                </div>
              </div>

              <div className="mb-1 flex items-center gap-1.5">
                <h2 className="text-2xl font-bold tracking-tight text-on-surface">Jean Dupont</h2>
                <Icon name="verified" filled className="text-lg text-primary" />
              </div>
              <p className="text-sm font-medium text-on-surface-variant">
                {t("marketing.hero.role")}
              </p>

              <button
                type="button"
                onClick={copySlug}
                className="mt-1.5 inline-flex items-center gap-2 text-left transition hover:opacity-80"
                title={t("marketing.hero.copyLink")}
              >
                <Icon name="link" className="text-sm text-primary" />
                <span className="font-mono text-[13px] font-medium text-primary">{slug}</span>
              </button>

              <div className="mt-4 flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill.label}
                    className={`rounded-md px-2.5 py-1 text-[12px] font-semibold ${
                      skill.accent
                        ? "bg-secondary-container text-on-secondary-fixed"
                        : "bg-surface-container text-on-surface"
                    }`}
                  >
                    {skill.label}
                  </span>
                ))}
              </div>

              <div className="mt-4 rounded-lg bg-surface-container-low p-4">
                <p className="mb-2 text-[12px] font-bold uppercase tracking-[0.05em] text-on-surface-variant">
                  {t("marketing.hero.lastStep")}
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                    <Icon name="rocket_launch" className="text-xl text-primary-container" />
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="truncate text-sm font-bold tracking-tight text-on-surface">
                      {t("marketing.hero.jobTitle")}
                    </p>
                    <p className="text-[13px] text-on-surface-variant">
                      {t("marketing.hero.jobPeriod")}
                    </p>
                  </div>
                  <span className="shrink-0 rounded bg-primary-fixed px-2 py-0.5 text-[11px] font-bold text-on-primary-fixed">
                    {t("marketing.hero.inPost")}
                  </span>
                </div>
              </div>
            </div>
          </article>

          {/* ——— QR + live scan ——— */}
          <div className="flex flex-col gap-5 lg:col-span-5">
            <article className="rounded-xl bg-white p-6 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)]">
              <div className="mb-4 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Icon name="qr_code_2" className="text-xl text-primary-container" />
                  <h3 className="text-sm font-bold text-on-surface">
                    {t("marketing.hero.qrTitle")}
                  </h3>
                </div>
                <span className="rounded-full bg-primary-fixed px-3 py-0.5 font-mono text-[12px] font-medium text-on-primary-fixed">
                  {t("marketing.hero.qrDynamic")}
                </span>
              </div>

              <div className="flex flex-col items-center rounded-xl bg-surface-container-low px-5 py-5">
                <div className="rounded-xl bg-white p-3 shadow-[0_2px_4px_-2px_rgba(0,0,0,0.1),0_4px_6px_-1px_rgba(0,0,0,0.1)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/hero/qr-code.svg"
                    alt="QR Code"
                    width={160}
                    height={160}
                    className="h-40 w-40"
                  />
                </div>
                <p className="mt-3 text-center text-[12px] font-semibold text-on-surface">
                  {t("marketing.hero.qrReady")}
                </p>
                <p className="text-center text-[13px] text-on-surface-variant">
                  {t("marketing.hero.qrHint")}
                </p>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-surface-container py-2 text-[12px] font-semibold text-on-surface transition hover:bg-surface-container-high"
                >
                  <Icon name="download" className="text-sm" />
                  {t("marketing.hero.formatSvg")}
                </button>
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-surface-container py-2 text-[12px] font-semibold text-on-surface transition hover:bg-surface-container-high"
                >
                  <Icon name="image" className="text-sm" />
                  {t("marketing.hero.formatPng")}
                </button>
              </div>
            </article>

            <div className="flex items-center justify-between gap-3 rounded-xl bg-white p-4 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)]">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ECFDF5]">
                  <Icon name="sensors" className="text-[#059669]" />
                </div>
                <div className="min-w-0 text-left">
                  <div className="flex items-center gap-1.5">
                    <p className="text-[12px] font-bold text-on-surface">
                      {t("marketing.hero.liveScan")}
                    </p>
                    <span className="h-2 w-2 animate-pulse rounded-full bg-[#10B981]" />
                  </div>
                  <p className="truncate text-[13px] text-on-surface-variant">
                    {t("marketing.hero.liveScanMeta")}
                  </p>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-mono text-[13px] font-bold text-[#059669]">+184%</p>
                <p className="text-[10px] text-on-surface-variant">
                  {t("marketing.hero.vsPaper")}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center gap-space-md">
          <p className="text-label-sm font-semibold uppercase tracking-[0.1em] text-on-surface-variant">
            {t("marketing.hero.logosLabel")}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-60">
            {LOGOS.map((name) => (
              <span
                key={name}
                className={`text-xl font-extrabold tracking-tight text-on-surface ${
                  name === "alan" || name === "PayFit" ? "font-semibold lowercase" : ""
                } ${name === "QONTO" ? "tracking-wider" : ""}`}
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export function HeroSection() {
  return (
    <ToastProvider>
      <HeroInner />
    </ToastProvider>
  );
}
