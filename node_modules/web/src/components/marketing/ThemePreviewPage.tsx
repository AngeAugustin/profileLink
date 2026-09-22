"use client";

import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/brand/Logo";
import { ASSETS, editorProfile } from "@/lib/mock-data";
import { ThemedProfileCard } from "@/components/profile/ThemedProfileCard";
import { LocaleLink, localizedPath } from "@/i18n/path";
import { useI18n, useT } from "@/i18n/provider";
import { cn } from "@/lib/cn";
import type { ThemeMood, ThemeTokens } from "@/lib/profile-themes";
import { DEFAULT_PROFILE_THEMES } from "@/lib/profile-themes";
import type { ThemePreviewId } from "@/lib/theme-preview";

export type { ThemePreviewId };

export type ThemePreviewData = {
  id: string;
  name: string;
  description?: string;
  mood?: ThemeMood;
  preview?: string;
  tokens: ThemeTokens;
};

type ThemePreviewPageProps = {
  theme: ThemePreviewData;
};

const MOOD_TAG: Record<ThemeMood, string> = {
  corporate: "tagCorporate",
  light: "tagLight",
  bold: "tagBold",
  night: "tagNight",
};

/** @deprecated Prefer passing `theme` from DB via getProfileTheme. */
export function themePreviewFromId(themeId: ThemePreviewId): ThemePreviewData {
  const def = DEFAULT_PROFILE_THEMES.find((t) => t.id === themeId)!;
  return {
    id: def.id,
    name: def.name,
    description: def.description,
    mood: def.mood,
    preview: def.preview,
    tokens: def.tokens,
  };
}

export function ThemePreviewPage({ theme }: ThemePreviewPageProps) {
  const t = useT();
  const { locale } = useI18n();
  const tokens = theme.tokens;
  const profile = editorProfile;
  const mood = theme.mood ?? "corporate";

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f6f9]">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_75%_65%_at_85%_10%,rgba(29,78,216,0.1),transparent_55%),radial-gradient(ellipse_50%_45%_at_10%_90%,rgba(14,116,144,0.06),transparent_50%),linear-gradient(165deg,#f7f9fb_0%,#eef3f9_45%,#f4f6f9_100%)]"
      />

      <header className="relative z-40 sticky top-0 border-b border-outline-variant/20 bg-white/80 backdrop-blur-xl">
        <div className="max-w-[1152px] mx-auto px-6 h-14 flex items-center justify-between gap-space-sm">
          <div className="flex items-center gap-space-sm min-w-0">
            <Logo href={localizedPath(locale, "/")} />
            <span className="hidden md:inline h-4 w-px bg-outline-variant/40" />
            <span className="hidden md:inline font-display text-label-sm font-semibold text-on-surface-variant tracking-wide truncate">
              {t("marketing.pages.themes.previewStudio")}
            </span>
          </div>
          <div className="flex items-center gap-space-xs shrink-0">
            <LocaleLink
              locale={locale}
              href="/themes"
              className="inline-flex items-center gap-1 h-9 px-space-md rounded-lg text-label-sm font-semibold text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
            >
              <Icon name="arrow_back" className="text-[18px]" />
              <span className="hidden sm:inline">
                {t("marketing.pages.themes.previewBack")}
              </span>
            </LocaleLink>
            <Button href="/inscription" size="sm">
              <Icon name="palette" className="text-[18px]" />
              <span className="hidden sm:inline">
                {t("marketing.pages.themes.cta")}
              </span>
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 w-full">
        {/* Theme identity strip */}
        <div className="max-w-[1152px] mx-auto px-6 pt-space-lg pb-space-md">
          <div>
            <p className="font-display text-label-sm font-semibold uppercase tracking-[0.18em] text-primary mb-1">
              {t("marketing.pages.themes.previewEyebrow")}
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-on-surface">
              {theme.name}
            </h1>
            {theme.description ? (
              <p className="mt-2 text-body-md text-on-surface-variant max-w-xl">
                {theme.description}
              </p>
            ) : null}
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-md border border-outline-variant/30 bg-white px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-on-surface-variant">
                {t(`marketing.pages.themes.${MOOD_TAG[mood]}`)}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-md border border-outline-variant/30 bg-white px-2.5 py-1 text-[11px] font-semibold text-on-surface-variant">
                <Icon name="science" className="text-[14px] text-primary" />
                {t("marketing.pages.themes.previewMock")}
              </span>
            </div>
          </div>
        </div>

        {/* Full public-profile stage with theme tokens */}
        <div className={cn("pb-space-2xl", tokens.shell)}>
          <div className={cn("relative h-64 md:h-80 overflow-hidden", tokens.cover)}>
            <div
              className="absolute inset-0 opacity-35 bg-cover bg-center"
              style={{ backgroundImage: `url(${ASSETS.cover})` }}
            />
            <div
              aria-hidden
              className="absolute inset-0 opacity-15"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)",
                backgroundSize: "48px 48px",
              }}
            />
            <div
              aria-hidden
              className="absolute -right-16 -top-24 size-96 rounded-full bg-[#A33900]/30 blur-[32px]"
            />
          </div>

          <div className="relative z-10 max-w-[1152px] mx-auto px-6 -mt-28 md:-mt-32 pb-16">
            <ThemedProfileCard
              tokens={tokens}
              profileUrl={`profilelink.me/p/demo`}
              labels={{
                contact: t("marketing.pages.themes.previewContact"),
                contactEmail: t("public.contactEmail"),
                saveVcard: t("public.saveVcard"),
                experiences: t("public.career"),
                projects: t("marketing.pages.themes.previewProjects"),
                education: t("public.diplomas"),
                certifications: t("marketing.pages.themes.previewCert"),
                skills: t("public.expertise"),
                interests: t("marketing.pages.themes.previewInterests"),
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
              }}
              profile={{
                firstName: profile.identity.firstName,
                lastName: profile.identity.lastName,
                title: profile.identity.title,
                bio: profile.identity.bio,
                location: profile.identity.location,
                availability: "Open to Advisor Roles",
                email: profile.identity.email,
                phone: profile.identity.phone,
                avatarUrl: ASSETS.avatarJean,
                coverUrl: ASSETS.cover,
                experiences: profile.experiences,
                projects: profile.projects,
                education: profile.education,
                certifications: profile.certifications,
                skills: profile.skills,
                links: profile.links,
                interests: profile.interests,
                languages: profile.languages,
              }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
