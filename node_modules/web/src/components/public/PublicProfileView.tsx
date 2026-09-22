"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/brand/Logo";
import { QrModal } from "@/components/app/QrCodePanel";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { LocaleLink, localizedPath } from "@/i18n/path";
import { useI18n, useT } from "@/i18n/provider";
import { formatExperiencePeriod } from "@/components/ui/ExperienceTimeline";
import { ThemedProfileCard } from "@/components/profile/ThemedProfileCard";
import { cn } from "@/lib/cn";
import type { ThemeTokens } from "@/lib/profile-themes";
import { resolveThemeTokens } from "@/lib/profile-themes";

type PublicProfile = {
  slug: string;
  firstName: string;
  lastName: string;
  title: string;
  bio: string | null;
  location: string | null;
  email: string | null;
  phone: string | null;
  availability: string | null;
  avatarUrl: string | null;
  coverUrl: string | null;
  theme: string;
  views: number;
  experiences: {
    id: string;
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string | null;
    current: boolean;
    highlights: string;
  }[];
  projects: {
    id: string;
    title: string;
    role: string;
    description: string;
    url: string | null;
    year: string;
    tags: string;
  }[];
  education: {
    id: string;
    degree: string;
    school: string;
    year: string;
    note: string;
  }[];
  certifications: {
    id: string;
    abbrev: string;
    title: string;
    issuer: string;
    status: string;
    url: string | null;
  }[];
  skills: { id: string; label: string; tone: string }[];
  links: {
    id: string;
    label: string;
    url: string;
    icon: string;
  }[];
  interests: { id: string; label: string }[];
  languages: { id: string; label: string; level: string }[];
};

export function PublicProfileView({
  profile,
  themeTokens,
}: {
  profile: PublicProfile;
  themeTokens?: ThemeTokens | null;
}) {
  const t = useT();
  const { locale } = useI18n();
  const [qrOpen, setQrOpen] = useState(false);
  const url = `profilelink.me/p/${profile.slug}`;
  const fullName = `${profile.firstName} ${profile.lastName}`;
  const tokens = themeTokens ?? resolveThemeTokens(profile.theme);

  function trackEvent(type: "click" | "qr_scan") {
    void fetch(
      `/api/public/profiles/${encodeURIComponent(profile.slug)}/events`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
        keepalive: true,
      },
    ).catch(() => undefined);
  }

  function openQr() {
    trackEvent("qr_scan");
    setQrOpen(true);
  }

  return (
    <div className={cn("min-h-screen flex flex-col", tokens.shell)}>
      {/* Sticky marketing header — Figma Header */}
      <header
        className={cn(
          "sticky top-0 z-50 border-b backdrop-blur-xl",
          tokens.bar,
          tokens.barBorder,
        )}
      >
        <div className="max-w-[1152px] mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <Logo href={localizedPath(locale, "/")} />
          <div className="flex items-center gap-2 shrink-0">
            <LanguageSwitcher />
            <Button href="/inscription" size="sm">
              {t("public.createProfile")}
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 relative">
        {/* Top Geometric Banner — 320px */}
        <div className={cn("relative h-64 md:h-80 overflow-hidden", tokens.cover)}>
          {profile.coverUrl ? (
            <div
              className="absolute inset-0 opacity-35 bg-cover bg-center"
              style={{ backgroundImage: `url(${profile.coverUrl})` }}
            />
          ) : null}
          {/* Grid texture */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
          {/* Ambient halos */}
          <div
            aria-hidden
            className="absolute -right-16 -top-24 size-96 rounded-full bg-[#A33900]/30 blur-[32px]"
          />
          <div
            aria-hidden
            className="absolute left-1/4 top-0 size-80 rounded-full bg-[#2151DA]/20 blur-[20px]"
          />

          {profile.availability ? (
            <div className="absolute top-6 right-6 md:right-[calc((100%-1152px)/2+24px)] z-10">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F7F9FB]/90 backdrop-blur-md px-3 py-1 text-[12px] font-semibold text-[#191C1E] shadow-sm">
                <span className="size-2 rounded-full bg-emerald-500" />
                {profile.availability}
              </span>
            </div>
          ) : null}
        </div>

        {/* Main container overlapping banner */}
        <div className="relative z-10 max-w-[1152px] mx-auto px-6 -mt-28 md:-mt-32 pb-20">
          <ThemedProfileCard
            tokens={tokens}
            slug={profile.slug}
            profileUrl={url}
            onOpenQr={openQr}
            onEngage={() => trackEvent("click")}
            labels={{
              contact: t("public.contactMe"),
              contactEmail: t("public.contactEmail"),
              saveVcard: t("public.saveVcard"),
              experiences: t("public.career"),
              projects: t("public.projects"),
              education: t("public.diplomas"),
              certifications: t("public.certifications"),
              skills: t("public.expertise"),
              interests: t("public.interests"),
              languages: t("public.languages"),
              viewProject: t("public.viewProject"),
              viewCert: t("public.viewCert"),
              networks: t("public.networks"),
              platforms: t("public.platforms"),
              about: t("public.about"),
              timeline: t("public.timeline"),
              qrTitle: t("public.qrDirect"),
              qrHint: t("public.qrHint"),
              vcardTag: t("public.vcardTag"),
              responseFast: t("public.responseFast"),
              verified: t("public.verifiedPro"),
              educationLabel: t("public.educationLabel"),
              png: "PNG",
              svg: "SVG",
            }}
            profile={{
              firstName: profile.firstName,
              lastName: profile.lastName,
              title: profile.title,
              bio: profile.bio,
              location: profile.location,
              availability: profile.availability,
              email: profile.email,
              phone: profile.phone,
              avatarUrl: profile.avatarUrl,
              coverUrl: profile.coverUrl,
              experiences: profile.experiences.map((exp) => ({
                id: exp.id,
                title: exp.title,
                company: exp.company,
                location: exp.location,
                period: formatExperiencePeriod({
                  startDate: exp.startDate,
                  endDate: exp.endDate,
                  current: exp.current,
                  presentLabel: t("public.present"),
                }),
                highlights: exp.highlights,
              })),
              projects: profile.projects ?? [],
              education: profile.education,
              certifications: profile.certifications,
              skills: profile.skills,
              links: profile.links,
              interests: profile.interests,
              languages: profile.languages ?? [],
            }}
          />

          {/* Profile Bottom Branding Strip */}
          <div className="mt-16 pt-8 border-t border-current/10 flex flex-col items-center gap-2 text-center">
            <p className={cn("text-[13px] leading-5", tokens.textMuted)}>
              {t("public.poweredBy")}{" "}
              <span className={cn("font-bold text-[12px]", tokens.text)}>
                ProfileLink Pro
              </span>
              {" — "}
              {t("public.poweredBlurb")}
            </p>
            <LocaleLink
              locale={locale}
              href="/inscription"
              className={cn(
                "inline-flex items-center gap-1 text-[12px] font-semibold uppercase tracking-wide hover:underline",
                tokens.accent,
              )}
            >
              {t("public.createFree")}
              <span aria-hidden>→</span>
            </LocaleLink>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={cn("border-t py-6", tokens.muted, tokens.barBorder)}>
        <div className="max-w-[1152px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className={cn("text-[13px] text-center sm:text-left", tokens.textMuted)}>
            {t("public.poweredBy")}{" "}
            <span className={cn("font-semibold", tokens.text)}>ProfileLink</span>
            {" — "}
            {t("public.footerTagline")}
          </p>
          <div className="flex items-center gap-4">
            <LocaleLink
              locale={locale}
              href="/mentions-legales"
              className={cn("text-[13px] hover:underline", tokens.textMuted)}
            >
              {t("public.legal")}
            </LocaleLink>
            <LocaleLink
              locale={locale}
              href="/confidentialite"
              className={cn("text-[13px] hover:underline", tokens.textMuted)}
            >
              {t("public.privacy")}
            </LocaleLink>
          </div>
        </div>
      </footer>

      <QrModal
        open={qrOpen}
        onClose={() => setQrOpen(false)}
        slug={profile.slug}
        label={fullName}
      />
    </div>
  );
}
