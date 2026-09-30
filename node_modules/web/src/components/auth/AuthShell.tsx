"use client";

import Image from "next/image";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { LocaleLink } from "@/i18n/path";
import { useI18n } from "@/i18n/provider";
import { ASSETS } from "@/lib/mock-data";

type AuthShellProps = {
  children: React.ReactNode;
  headerHint: string;
  headerCtaHref: string;
  headerCtaLabel: string;
  /** i18n prefix for the side panel copy, e.g. auth.login / auth.signup / auth.forgot */
  previewNs?: "login" | "signup" | "forgot";
};

export function AuthShell({
  children,
  headerHint,
  headerCtaHref,
  headerCtaLabel,
  previewNs = "login",
}: AuthShellProps) {
  const { locale, t } = useI18n();
  const p = (key: string) => {
    const specific = `auth.${previewNs}.${key}`;
    const fallback = `auth.login.${key}`;
    const value = t(specific);
    return value === specific ? t(fallback) : value;
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F5F6F8] font-sans text-on-surface antialiased">
      <header className="border-b border-outline-variant/20 bg-[#F5F6F8]">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-gutter">
          <div className="flex min-w-0 items-center gap-3">
            <Logo href={`/${locale}`} />
            <span className="hidden h-5 w-px bg-outline-variant/40 sm:block" aria-hidden />
            <LocaleLink
              locale={locale}
              href="/"
              className="hidden text-sm text-on-surface-variant hover:text-on-surface sm:inline"
            >
              {t("auth.login.backToSite")}
            </LocaleLink>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <span className="hidden text-sm text-on-surface-variant md:inline">
              {headerHint}
            </span>
            <Button href={headerCtaHref} size="sm">
              {headerCtaLabel}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-gutter py-8 lg:flex-row lg:items-stretch lg:gap-10 lg:py-10">
        <div className="flex w-full flex-col justify-center lg:max-w-[480px] lg:shrink-0 xl:max-w-[520px]">
          {children}
        </div>
        <AuthPreviewPanel p={p} chartId={`auth-chart-${previewNs}`} />
      </main>
    </div>
  );
}

function AuthPreviewPanel({
  p,
  chartId,
}: {
  p: (key: string) => string;
  chartId: string;
}) {
  return (
    <aside className="relative hidden min-h-[560px] flex-1 overflow-hidden rounded-3xl bg-gradient-to-br from-[#E8EEF8] via-[#F3F0F4] to-[#F8EDE8] p-6 lg:flex lg:flex-col lg:p-8">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 top-10 h-64 w-64 rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-10 bottom-20 h-48 w-48 rounded-full bg-tertiary-container/10 blur-3xl"
      />

      <div className="relative z-10 flex items-center justify-between gap-3">
        <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-on-surface-variant">
          <Icon name="wifi_tethering" className="text-base text-primary" />
          {p("previewEyebrow")}
        </p>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-on-surface shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
          {p("previewSync")}
        </span>
      </div>

      <div className="relative z-10 mx-auto mt-6 w-full max-w-sm rounded-2xl border border-white/60 bg-white p-5 shadow-[0_12px_40px_rgba(0,55,176,0.08)]">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className="relative shrink-0">
              <Image
                src={ASSETS.avatarJean}
                alt=""
                width={48}
                height={48}
                className="h-12 w-12 rounded-full object-cover"
              />
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <p className="text-sm font-bold text-on-surface">Jean Dupont</p>
                <span className="rounded bg-primary px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-on-primary">
                  PRO
                </span>
              </div>
              <p className="mt-0.5 text-xs text-on-surface-variant">
                Head of Product & Design Systems
              </p>
              <p className="text-[11px] text-on-surface-variant/80">
                Hexa Dynamics • Paris
              </p>
            </div>
          </div>
          <Icon name="apps" className="shrink-0 text-on-surface-variant" />
        </div>

        <div className="mt-4 flex items-center justify-between gap-2 rounded-lg bg-tertiary-container/10 px-3 py-2 text-[11px]">
          <span className="inline-flex items-center gap-1 font-semibold text-tertiary-container">
            <Icon name="bolt" className="text-sm" />
            {p("previewScan")}
          </span>
          <span className="text-on-surface-variant">{p("previewScanAgo")}</span>
        </div>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-3xl font-extrabold tracking-tight text-on-surface">1920</p>
            <p className="text-xs text-on-surface-variant">{p("previewViews")}</p>
          </div>
          <span className="mb-1 inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
            <Icon name="trending_up" className="text-sm" />
            +24%
          </span>
        </div>

        <svg viewBox="0 0 280 56" className="mt-3 h-14 w-full" fill="none" aria-hidden>
          <path
            d="M0 42 C40 40 55 28 90 30 C125 32 140 18 175 16 C210 14 230 22 280 8"
            stroke="#0037B0"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M0 42 C40 40 55 28 90 30 C125 32 140 18 175 16 C210 14 230 22 280 8 V56 H0 Z"
            fill={`url(#${chartId})`}
            opacity="0.15"
          />
          <defs>
            <linearGradient id={chartId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0037B0" />
              <stop offset="100%" stopColor="#0037B0" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <span className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-surface-container text-xs font-semibold text-on-surface">
            <Icon name="contact_page" className="text-base" />
            {p("previewVcard")}
          </span>
          <span className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-surface-container text-xs font-semibold text-on-surface">
            <Icon name="send" className="text-base" />
            {p("previewMessage")}
          </span>
        </div>
      </div>

      <blockquote className="relative z-10 mx-auto mt-5 w-full max-w-sm rounded-2xl border border-white/50 bg-white/90 p-5 shadow-sm">
        <div className="mb-2 flex gap-0.5 text-tertiary-container" aria-hidden>
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className="text-sm leading-none">
              ★
            </span>
          ))}
        </div>
        <p className="text-sm leading-6 text-on-surface">« {p("quote")} »</p>
        <footer className="mt-3 text-xs text-on-surface-variant">{p("quoteAuthor")}</footer>
      </blockquote>

      <div className="relative z-10 mt-auto flex flex-wrap justify-center gap-x-5 gap-y-2 pt-6 text-[11px] font-medium text-on-surface-variant">
        {(
          [
            ["verified_user", "previewHost"],
            ["policy", "previewGdpr"],
            ["verified", "previewSla"],
          ] as const
        ).map(([icon, key]) => (
          <span key={key} className="inline-flex items-center gap-1">
            <Icon name={icon} className="text-base text-primary" />
            {p(key)}
          </span>
        ))}
      </div>
    </aside>
  );
}

export function AuthSocialButtons({
  onSoon,
  dividerLabel,
}: {
  onSoon: (feature: "google" | "linkedin") => void;
  dividerLabel: string;
}) {
  return (
    <>
      <div className="mt-6 grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => onSoon("google")}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-surface-container text-sm font-semibold text-on-surface transition hover:bg-surface-container-high"
        >
          <GoogleIcon />
          Google
        </button>
        <button
          type="button"
          onClick={() => onSoon("linkedin")}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-surface-container text-sm font-semibold text-on-surface transition hover:bg-surface-container-high"
        >
          <LinkedInIcon />
          LinkedIn
        </button>
      </div>
      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center" aria-hidden>
          <div className="w-full border-t border-outline-variant/25" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-[11px] font-medium text-on-surface-variant">
            {dividerLabel}
          </span>
        </div>
      </div>
    </>
  );
}

export function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-outline-variant/15 bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] md:p-8">
      {children}
    </div>
  );
}

export function AuthField({
  label,
  icon,
  trailing,
  children,
}: {
  label: React.ReactNode;
  icon: string;
  trailing?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-on-surface">{label}</span>
        {trailing}
      </div>
      <div className="relative mt-1.5">
        <Icon
          name={icon}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
        />
        {children}
      </div>
    </div>
  );
}

export const authInputClassName =
  "h-11 w-full rounded-xl border border-transparent bg-surface-container-low pl-10 pr-3 text-sm outline-none transition focus:border-primary/30 focus:bg-white focus:ring-2 focus:ring-primary/15";

export function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#EA4335"
        d="M12 10.2v3.6h5.1c-.2 1.2-.9 2.3-1.9 3l3.1 2.4c1.8-1.7 2.9-4.1 2.9-7 0-.7-.1-1.3-.2-1.9H12z"
      />
      <path
        fill="#34A853"
        d="M5.3 14.3 4.4 15l-2.7 2.1C3.4 20.5 7.4 23 12 23c2.7 0 5-.9 6.7-2.4l-3.1-2.4c-.9.6-2 1-3.6 1-2.8 0-5.1-1.9-6-4.4z"
      />
      <path
        fill="#4A90E2"
        d="M12 5.8c1.5 0 2.8.5 3.8 1.5l2.8-2.8C16.9 2.7 14.7 1.8 12 1.8 7.4 1.8 3.4 4.4 1.7 8.3l3.6 2.8c.9-2.6 3.2-4.3 6.7-4.3z"
      />
      <path
        fill="#FBBC05"
        d="M1.7 8.3C1.3 9.4 1 10.7 1 12s.3 2.6.7 3.7l3.6-2.8c-.2-.6-.3-1.2-.3-1.9s.1-1.3.3-1.9L1.7 8.3z"
      />
    </svg>
  );
}

export function LinkedInIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#0A66C2"
        d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.23 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.73V1.73C24 .77 23.21 0 22.23 0z"
      />
    </svg>
  );
}
