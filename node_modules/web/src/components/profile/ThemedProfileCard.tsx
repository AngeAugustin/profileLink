"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { ContactIconRow } from "@/components/ui/ContactIconRow";
import {
  ExperienceTimeline,
  profileSectionTitleClass,
  type TimelineExperience,
} from "@/components/ui/ExperienceTimeline";
import {
  ProjectsSection,
  type ProjectItem,
} from "@/components/ui/ProjectsSection";
import {
  isContactSocialIcon,
  normalizeExternalHref,
  socialLinkIconSrc,
} from "@/lib/social-icons";
import { cn } from "@/lib/cn";
import type { ThemeTokens } from "@/lib/profile-themes";

export type ThemedProfileLink = {
  id: string;
  label: string;
  url: string;
  icon: string;
};

export type ThemedProfileEducation = {
  id: string;
  degree: string;
  school: string;
  year: string;
  note?: string;
};

export type ThemedProfileCertification = {
  id: string;
  abbrev?: string;
  title: string;
  issuer?: string;
  status?: string;
  url?: string | null;
};

export type ThemedProfileData = {
  firstName: string;
  lastName: string;
  title: string;
  bio?: string | null;
  location?: string | null;
  availability?: string | null;
  email?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  coverUrl?: string | null;
  experiences: TimelineExperience[];
  projects: ProjectItem[];
  education: ThemedProfileEducation[];
  certifications: ThemedProfileCertification[];
  skills: { id: string; label: string }[];
  links: ThemedProfileLink[];
  interests: { id: string; label: string }[];
  languages?: { id: string; label: string; level?: string }[];
};

export type ThemedProfileLabels = {
  contact: string;
  experiences: string;
  projects: string;
  education: string;
  certifications: string;
  skills: string;
  interests: string;
  languages?: string;
  viewProject: string;
  viewCert: string;
  networks?: string;
  platforms?: string;
  about?: string;
  timeline?: string;
  qrTitle?: string;
  qrHint?: string;
  vcardTag?: string;
  contactEmail?: string;
  saveVcard?: string;
  responseFast?: string;
  verified?: string;
  educationLabel?: string;
  png?: string;
  svg?: string;
};

type ThemedProfileCardProps = {
  tokens: ThemeTokens;
  profile: ThemedProfileData;
  labels: ThemedProfileLabels;
  onEngage?: () => void;
  className?: string;
  /** Compact density for editor sidebar */
  compact?: boolean;
  /** Public slug — enables sidebar QR fetch */
  slug?: string;
  profileUrl?: string;
  onOpenQr?: () => void;
};

function accentToBg(accent: string): string {
  return accent.replace(/^text-/, "bg-");
}

function downloadVCard(profile: ThemedProfileData) {
  const fullName = `${profile.firstName} ${profile.lastName}`.trim();
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${fullName}`,
    `N:${profile.lastName};${profile.firstName};;;`,
  ];
  if (profile.title) lines.push(`TITLE:${profile.title}`);
  if (profile.email) lines.push(`EMAIL;TYPE=INTERNET:${profile.email}`);
  if (profile.phone) lines.push(`TEL;TYPE=CELL:${profile.phone}`);
  if (profile.location) lines.push(`ADR;TYPE=HOME:;;${profile.location};;;;`);
  if (profile.bio) lines.push(`NOTE:${profile.bio.replace(/\n/g, " ")}`);
  lines.push("END:VCARD");
  const blob = new Blob([lines.join("\r\n")], {
    type: "text/vcard;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${fullName.replace(/\s+/g, "-").toLowerCase() || "contact"}.vcf`;
  a.click();
  URL.revokeObjectURL(url);
}

function qrTargetUrl(profileUrl: string): string {
  const cleaned = profileUrl.split("·")[0]?.trim() || profileUrl;
  if (cleaned.startsWith("http://") || cleaned.startsWith("https://")) {
    return cleaned;
  }
  return `https://${cleaned}`;
}

function PublicQrSidebar({
  slug,
  profileUrl,
  tokens,
  labels,
}: {
  slug?: string;
  profileUrl: string;
  tokens: ThemeTokens;
  labels: ThemedProfileLabels;
}) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const target = qrTargetUrl(profileUrl);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (slug) {
        try {
          const res = await fetch(
            `/api/public/profiles/${encodeURIComponent(slug)}/qr`,
          );
          if (res.ok) {
            const json = (await res.json()) as { dataUrl?: string };
            if (!cancelled && json.dataUrl) {
              setDataUrl(json.dataUrl);
              return;
            }
          }
        } catch {
          /* fall through to client generate */
        }
      }

      try {
        const QRCode = (await import("qrcode")).default;
        const generated = await QRCode.toDataURL(target, {
          width: 512,
          margin: 1,
          color: { dark: "#0037b0", light: "#ffffff" },
        });
        if (!cancelled) setDataUrl(generated);
      } catch {
        if (!cancelled) setDataUrl(null);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [slug, target]);

  function download(format: "png" | "svg") {
    if (slug) {
      window.open(
        `/api/public/profiles/${encodeURIComponent(slug)}/qr?format=${format}`,
        "_blank",
      );
      return;
    }
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `profilelink-qr.${format === "svg" ? "png" : format}`;
    a.click();
  }

  return (
    <div
      className={cn(
        "rounded-xl p-6 flex flex-col items-center gap-2 shadow-[0_2px_4px_-2px_rgba(0,0,0,0.1),0_4px_6px_-1px_rgba(0,0,0,0.1)]",
        tokens.card,
      )}
    >
      <div className="w-full flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Icon name="qr_code_2" className={cn("text-[18px]", tokens.accent)} />
          <span className={cn("text-sm font-bold tracking-tight", tokens.text)}>
            {labels.qrTitle ?? "QR Code Direct"}
          </span>
        </div>
        <span
          className={cn(
            "shrink-0 rounded px-2 py-0.5 font-mono text-[13px] font-medium",
            tokens.accentSoft,
          )}
        >
          {labels.vcardTag ?? "vCard Link"}
        </span>
      </div>

      <div
        className={cn(
          "w-full rounded-2xl p-3 flex items-center justify-center aspect-square",
          tokens.muted,
        )}
      >
        {dataUrl ? (
          <Image
            src={dataUrl}
            alt={`QR ${slug ?? "preview"}`}
            width={512}
            height={512}
            className="w-full h-full object-contain"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon
              name="progress_activity"
              className={cn("text-4xl animate-spin", tokens.accent)}
            />
          </div>
        )}
      </div>

      <p
        className={cn(
          "text-center text-[13px] leading-5 px-1",
          tokens.textMuted,
        )}
      >
        {labels.qrHint ??
          "Scannez pour enregistrer instantanément ce profil et contact dans votre smartphone."}
      </p>

      <div
        className={cn(
          "w-full rounded px-2 py-2 text-center font-mono text-[13px] font-medium truncate",
          tokens.muted,
          tokens.accent,
        )}
      >
        {profileUrl}
      </div>

      <div className="w-full flex items-center justify-center gap-2 pt-2">
        <button
          type="button"
          onClick={() => download("png")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-semibold uppercase tracking-wide border shadow-sm",
            tokens.card,
            tokens.border,
            tokens.text,
          )}
        >
          <Icon name="download" className="text-[14px]" />
          {labels.png ?? "PNG"}
        </button>
        <button
          type="button"
          onClick={() => download("svg")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-semibold uppercase tracking-wide border shadow-sm",
            tokens.card,
            tokens.border,
            tokens.text,
          )}
        >
          <Icon name="image" className="text-[14px]" />
          {labels.svg ?? "SVG"}
        </button>
      </div>
    </div>
  );
}

function CompactThemedCard({
  tokens,
  profile,
  labels,
  onEngage,
  className,
}: Omit<ThemedProfileCardProps, "compact" | "slug" | "profileUrl" | "onOpenQr">) {
  const fullName = `${profile.firstName} ${profile.lastName}`.trim() || "—";
  const initials =
    `${profile.firstName?.[0] ?? ""}${profile.lastName?.[0] ?? ""}`.toUpperCase() ||
    "?";
  const socialLinks = profile.links.filter(
    (link) => !isContactSocialIcon(link.icon),
  );

  return (
    <article
      className={cn(
        "rounded-2xl overflow-hidden border shadow-xl",
        tokens.card,
        tokens.border,
        className,
      )}
    >
      <div className={cn("relative h-36", tokens.cover)}>
        {profile.coverUrl ? (
          <div
            className="absolute inset-0 opacity-45 bg-cover bg-center"
            style={{ backgroundImage: `url(${profile.coverUrl})` }}
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>

      <div className="relative px-space-md -mt-10 pb-space-lg">
        <div className="flex flex-wrap items-end justify-between gap-space-sm mb-space-md">
          {profile.avatarUrl ? (
            <Image
              src={profile.avatarUrl}
              alt={fullName}
              width={80}
              height={80}
              className={cn(
                "w-20 h-20 rounded-2xl object-cover shadow-md ring-4",
                tokens.ring,
              )}
            />
          ) : (
            <div
              className={cn(
                "w-20 h-20 rounded-2xl shadow-md ring-4 flex items-center justify-center text-xl font-bold",
                tokens.accentSoft,
                tokens.ring,
              )}
            >
              {initials}
            </div>
          )}
          <ContactIconRow
            className="mb-1"
            phone={profile.phone}
            email={profile.email}
            links={profile.links}
            mailAriaLabel={labels.contact}
            mailClassName={tokens.accent}
            mailIconClassName="text-[24px]"
            iconSize={18}
            onEngage={onEngage}
          />
        </div>

        <h1 className={cn("text-xl font-extrabold tracking-tight", tokens.text)}>
          {fullName}
        </h1>
        {profile.title ? (
          <p className={cn("text-label-md font-semibold mt-1", tokens.accent)}>
            {profile.title}
          </p>
        ) : null}
        {profile.bio ? (
          <p
            className={cn(
              "text-body-sm mt-space-sm leading-relaxed",
              tokens.textMuted,
            )}
          >
            {profile.bio}
          </p>
        ) : null}

        {socialLinks.length > 0 ? (
          <div className="grid grid-cols-1 gap-2 mt-space-md">
            {socialLinks.slice(0, 4).map((link) => {
              const iconSrc = socialLinkIconSrc(link.icon);
              return (
                <a
                  key={link.id}
                  href={normalizeExternalHref(link.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onEngage}
                  className={cn(
                    "rounded-xl px-3 py-2.5 border flex items-center gap-2.5",
                    tokens.muted,
                    tokens.border,
                  )}
                >
                  {iconSrc ? (
                    <Image
                      src={iconSrc}
                      alt=""
                      width={24}
                      height={24}
                      className="size-6 shrink-0 rounded-md object-contain"
                    />
                  ) : (
                    <Icon name="link" className={cn("text-[18px]", tokens.accent)} />
                  )}
                  <span
                    className={cn(
                      "text-label-sm font-semibold truncate",
                      tokens.text,
                    )}
                  >
                    {link.label}
                  </span>
                </a>
              );
            })}
          </div>
        ) : null}

        {profile.experiences.length > 0 ? (
          <ExperienceTimeline
            className="mt-space-lg"
            title={labels.experiences}
            experiences={profile.experiences}
            accentClassName={tokens.accent}
            dotClassName={accentToBg(tokens.accent)}
            headingClassName={tokens.text}
            jobTitleClassName={tokens.text}
            companyClassName={tokens.textMuted}
            bodyClassName={tokens.textMuted}
            lineClassName={tokens.border}
            pillClassName={tokens.chip}
          />
        ) : null}

        {profile.skills.length > 0 ? (
          <div className="mt-space-lg">
            <h2 className={cn(profileSectionTitleClass, tokens.text)}>
              {labels.skills}
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {profile.skills.map((s) => (
                <span
                  key={s.id}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-[11px] font-semibold",
                    tokens.chip,
                  )}
                >
                  {s.label}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </article>
  );
}

/** Figma PROFIL PUBLIC layout — 8+4 grid with identity, networks, parcours, sidebar. */
export function ThemedProfileCard({
  tokens,
  profile,
  labels,
  onEngage,
  className,
  compact = false,
  slug,
  profileUrl,
  onOpenQr,
}: ThemedProfileCardProps) {
  if (compact) {
    return (
      <CompactThemedCard
        tokens={tokens}
        profile={profile}
        labels={labels}
        onEngage={onEngage}
        className={className}
      />
    );
  }

  const fullName = `${profile.firstName} ${profile.lastName}`.trim() || "—";
  const initials =
    `${profile.firstName?.[0] ?? ""}${profile.lastName?.[0] ?? ""}`.toUpperCase() ||
    "?";
  const socialLinks = profile.links.filter(
    (link) => !isContactSocialIcon(link.icon),
  );
  const languages = profile.languages ?? [];
  const currentCompany =
    profile.experiences.find((e) => /présent|present|aujourd/i.test(e.period))
      ?.company ?? profile.experiences[0]?.company;
  const displayUrl =
    profileUrl ?? (slug ? `profilelink.me/p/${slug}` : "profilelink.me");
  const languagesMeta =
    languages.length > 0
      ? languages.map((l) => l.label).join(" / ")
      : null;

  return (
    <div
      className={cn(
        "grid grid-cols-1 lg:grid-cols-12 gap-6 items-start",
        className,
      )}
    >
      {/* Left — 8 cols */}
      <div className="lg:col-span-8 flex flex-col gap-6 min-w-0">
        {/* Identity Card */}
        <section
          className={cn(
            "rounded-xl overflow-hidden shadow-[0_2px_4px_-2px_rgba(0,0,0,0.1),0_4px_6px_-1px_rgba(0,0,0,0.1)]",
            tokens.card,
          )}
        >
          <div className="px-6 md:px-8 pt-8 flex flex-col gap-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="relative">
                {profile.avatarUrl ? (
                  <Image
                    src={profile.avatarUrl}
                    alt={fullName}
                    width={144}
                    height={144}
                    className="size-36 rounded-2xl object-cover shadow-[0_8px_10px_-6px_rgba(0,0,0,0.1),0_20px_25px_-5px_rgba(0,0,0,0.1)] bg-[#ECEEF0]"
                  />
                ) : (
                  <div
                    className={cn(
                      "size-36 rounded-2xl flex items-center justify-center text-4xl font-bold shadow-lg",
                      tokens.accentSoft,
                    )}
                  >
                    {initials}
                  </div>
                )}
                <span
                  className={cn(
                    "absolute -right-1 -bottom-1 size-7 rounded-full flex items-center justify-center shadow-md",
                    accentToBg(tokens.accent),
                    "text-white",
                  )}
                >
                  <Icon name="verified" className="text-[16px]" />
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {profile.availability ? (
                  <span className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold bg-[#FFDBCE] text-[#370E00]">
                    <Icon name="work" className="text-[12px] text-[#7C2900]" />
                    {profile.availability}
                  </span>
                ) : null}
                {profile.email ? (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-[12px] font-semibold",
                      tokens.muted,
                      tokens.textMuted,
                    )}
                  >
                    <Icon name="bolt" className={cn("text-[12px]", tokens.accent)} />
                    {labels.responseFast ?? "Réponse < 24h"}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="flex flex-col items-start gap-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1
                  className={cn(
                    "text-[36px] leading-[44px] font-bold tracking-[-0.025em]",
                    tokens.text,
                  )}
                >
                  {fullName}
                </h1>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[12px] font-semibold",
                    tokens.accentSoft,
                  )}
                >
                  <Icon name="verified" className="text-[12px]" />
                  {labels.verified ?? "Profil Vérifié Pro"}
                </span>
              </div>

              {profile.title ? (
                <p
                  className={cn(
                    "text-xl font-semibold tracking-tight",
                    tokens.accent,
                  )}
                >
                  {profile.title}
                </p>
              ) : null}

              <div
                className={cn(
                  "flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 text-[13px] leading-5",
                  tokens.textMuted,
                )}
              >
                {profile.location ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Image
                      src="/localisation.png"
                      alt=""
                      width={18}
                      height={18}
                      className="size-[18px] object-contain opacity-70"
                    />
                    {profile.location}
                  </span>
                ) : null}
                {currentCompany ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Icon name="apartment" className="text-[14px] opacity-60" />
                    {currentCompany}
                  </span>
                ) : null}
                {languagesMeta ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Icon name="translate" className="text-[14px] opacity-60" />
                    {languagesMeta}
                  </span>
                ) : null}
              </div>

              {profile.bio ? (
                <p
                  className={cn(
                    "pt-5 text-lg leading-[1.625] tracking-tight max-w-2xl",
                    tokens.text,
                  )}
                >
                  {profile.bio}
                </p>
              ) : null}
            </div>
          </div>

          {/* Action bar */}
          <div
            className={cn(
              "mt-6 px-6 md:px-8 py-6 flex flex-wrap items-center gap-2",
              tokens.muted,
            )}
          >
            {profile.email ? (
              <a
                href={`mailto:${profile.email}`}
                onClick={onEngage}
                className={cn(
                  "flex-1 min-w-[12rem] inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold shadow-md",
                  tokens.cta,
                  tokens.ctaText,
                )}
              >
                <Icon name="mail" className="text-[18px]" />
                {labels.contactEmail ?? labels.contact}
              </a>
            ) : null}
            <button
              type="button"
              onClick={() => downloadVCard(profile)}
              className={cn(
                "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold shadow-sm border",
                tokens.card,
                tokens.border,
                tokens.text,
              )}
            >
              <Icon name="contact_page" className="text-[16px] opacity-70" />
              {labels.saveVcard ?? "Enregistrer vCard"}
            </button>
            {onOpenQr || slug ? (
              <button
                type="button"
                onClick={onOpenQr}
                className={cn(
                  "inline-flex items-center justify-center rounded-lg p-3 shadow-sm border",
                  tokens.card,
                  tokens.border,
                  tokens.textMuted,
                )}
                aria-label={labels.qrTitle ?? "QR Code"}
              >
                <Icon name="qr_code_2" className="text-[20px]" />
              </button>
            ) : null}
          </div>
        </section>

        {/* Networks 2×2 */}
        {socialLinks.length > 0 ? (
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <h2
                className={cn(
                  "text-xl font-semibold tracking-tight",
                  tokens.text,
                )}
              >
                {labels.networks ?? "Réseaux & Accès Directs"}
              </h2>
              <span
                className={cn(
                  "text-[12px] font-semibold uppercase tracking-[0.05em]",
                  tokens.textMuted,
                )}
              >
                {(labels.platforms ?? "{count} PLATEFORMES").replace(
                  "{count}",
                  String(socialLinks.length),
                )}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {socialLinks.map((link) => {
                const iconSrc = socialLinkIconSrc(link.icon);
                const href = normalizeExternalHref(link.url);
                return (
                  <a
                    key={link.id}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={onEngage}
                    className={cn(
                      "rounded-xl p-4 border flex items-start gap-3 transition-opacity hover:opacity-90 shadow-sm",
                      tokens.card,
                      tokens.border,
                    )}
                  >
                    <span
                      className={cn(
                        "size-11 shrink-0 rounded-lg flex items-center justify-center",
                        tokens.accentSoft,
                      )}
                    >
                      {iconSrc ? (
                        <Image
                          src={iconSrc}
                          alt=""
                          width={22}
                          height={22}
                          className="size-[22px] object-contain"
                        />
                      ) : (
                        <Icon
                          name={
                            link.icon === "github"
                              ? "code"
                              : link.icon === "dribbble"
                                ? "palette"
                                : link.icon === "tiktok"
                                  ? "music_note"
                                  : "link"
                          }
                          className="text-[20px]"
                        />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={cn(
                            "text-sm font-bold truncate",
                            tokens.text,
                          )}
                        >
                          {link.label}
                        </p>
                        <Icon
                          name="open_in_new"
                          className={cn("text-[14px] shrink-0", tokens.textMuted)}
                        />
                      </div>
                      <p
                        className={cn(
                          "text-[13px] truncate mt-0.5",
                          tokens.textMuted,
                        )}
                      >
                        {link.url.replace(/^https?:\/\//, "")}
                      </p>
                    </div>
                  </a>
                );
              })}
            </div>
          </section>
        ) : null}

        {/* Experience timeline */}
        {profile.experiences.length > 0 ? (
          <section
            className={cn(
              "rounded-xl p-8 shadow-sm flex flex-col gap-6",
              tokens.card,
            )}
          >
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <Icon name="work" className={cn("text-[20px]", tokens.accent)} />
                <h2
                  className={cn(
                    "text-xl font-semibold tracking-tight",
                    tokens.text,
                  )}
                >
                  {labels.experiences}
                </h2>
              </div>
              <span
                className={cn(
                  "rounded px-2.5 py-1 font-mono text-[13px] font-medium",
                  tokens.muted,
                  tokens.textMuted,
                )}
              >
                {labels.timeline ?? "Chronologie"}
              </span>
            </div>
            <ExperienceTimeline
              experiences={profile.experiences}
              accentClassName={tokens.accent}
              dotClassName={accentToBg(tokens.accent)}
              headingClassName={tokens.text}
              jobTitleClassName={tokens.text}
              companyClassName={tokens.accent}
              bodyClassName={tokens.textMuted}
              lineClassName={tokens.border}
              pillClassName={tokens.chip}
            />
          </section>
        ) : null}

        {profile.projects.length > 0 ? (
          <section
            className={cn(
              "rounded-xl p-8 shadow-sm",
              tokens.card,
            )}
          >
            <ProjectsSection
              title={labels.projects}
              projects={profile.projects}
              viewLabel={labels.viewProject}
              headingClassName={tokens.text}
              cardClassName={cn(tokens.muted, tokens.border)}
              titleClassName={tokens.text}
              metaClassName={tokens.accent}
              bodyClassName={tokens.textMuted}
              tagClassName={tokens.chip}
              linkClassName={tokens.accent}
              iconWrapClassName={tokens.accentSoft}
            />
          </section>
        ) : null}
      </div>

      {/* Right — 4 cols sticky */}
      <aside className="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-24">
        <PublicQrSidebar
          slug={slug}
          profileUrl={displayUrl}
          tokens={tokens}
          labels={labels}
        />

        {(profile.education.length > 0 ||
          profile.certifications.length > 0) && (
          <section
            className={cn(
              "rounded-xl p-6 shadow-md flex flex-col gap-4",
              tokens.card,
            )}
          >
            <div className="flex items-center gap-2">
              <Icon name="school" className={cn("text-[20px]", tokens.accent)} />
              <h3
                className={cn(
                  "text-xl font-semibold tracking-tight",
                  tokens.text,
                )}
              >
                {labels.education}
              </h3>
            </div>

            <div className="flex flex-col gap-3">
              {profile.education.map((edu) => (
                <div
                  key={edu.id}
                  className={cn("rounded-lg p-3.5", tokens.muted)}
                >
                  <p
                    className={cn(
                      "text-[12px] font-bold uppercase tracking-[0.05em]",
                      tokens.accent,
                    )}
                  >
                    {labels.educationLabel ?? "Formation"}
                  </p>
                  <p className={cn("text-sm font-semibold mt-1", tokens.text)}>
                    {edu.degree}
                  </p>
                  <p className={cn("text-[13px] mt-0.5", tokens.textMuted)}>
                    {edu.school}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {edu.year ? (
                      <span
                        className={cn(
                          "rounded px-2 py-0.5 text-[12px] font-semibold",
                          tokens.chip,
                        )}
                      >
                        {edu.year}
                      </span>
                    ) : null}
                    {edu.note ? (
                      <span
                        className={cn(
                          "rounded px-2 py-0.5 text-[12px] font-semibold",
                          tokens.chip,
                        )}
                      >
                        {edu.note}
                      </span>
                    ) : null}
                  </div>
                </div>
              ))}

              {profile.certifications.map((cert) => (
                <div
                  key={cert.id}
                  className={cn(
                    "rounded-lg p-3.5 flex gap-3 border",
                    tokens.muted,
                    tokens.border,
                  )}
                >
                  <Icon
                    name="workspace_premium"
                    className={cn("text-[20px] shrink-0 mt-0.5", tokens.accent)}
                  />
                  <div className="min-w-0">
                    <p className={cn("text-sm font-semibold", tokens.text)}>
                      {cert.title}
                    </p>
                    <p className={cn("text-[13px] mt-0.5", tokens.textMuted)}>
                      {[cert.issuer, cert.status].filter(Boolean).join(" · ")}
                    </p>
                    {cert.url ? (
                      <a
                        href={normalizeExternalHref(cert.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          "inline-flex items-center gap-1 text-[12px] font-semibold mt-1.5 hover:underline",
                          tokens.accent,
                        )}
                      >
                        <Icon name="open_in_new" className="text-[12px]" />
                        {labels.viewCert}
                      </a>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {profile.skills.length > 0 ? (
          <section
            className={cn(
              "rounded-xl p-6 shadow-md flex flex-col gap-4",
              tokens.card,
            )}
          >
            <div className="flex items-center gap-2">
              <Icon name="psychology" className={cn("text-[20px]", tokens.accent)} />
              <h3
                className={cn(
                  "text-xl font-semibold tracking-tight",
                  tokens.text,
                )}
              >
                {labels.skills}
              </h3>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {profile.skills.map((s, i) => (
                <span
                  key={s.id}
                  className={cn(
                    "rounded px-2.5 py-1 text-[12px] font-semibold",
                    i < 2 ? tokens.accentSoft : tokens.chip,
                  )}
                >
                  {s.label}
                </span>
              ))}
            </div>
          </section>
        ) : null}

        {profile.interests.length > 0 ? (
          <div
            className={cn(
              "rounded-xl p-4 flex items-start gap-3",
              tokens.accentSoft,
            )}
          >
            <Icon name="groups" className={cn("text-[20px] shrink-0", tokens.accent)} />
            <div className="min-w-0">
              <p className={cn("text-[13px] leading-snug", tokens.accent)}>
                <span className="font-semibold">{labels.interests}</span>
                {" — "}
                {profile.interests.map((i) => i.label).join(" · ")}
              </p>
            </div>
          </div>
        ) : null}

        {languages.length > 0 ? (
          <section
            className={cn(
              "rounded-xl p-6 shadow-md flex flex-col gap-4",
              tokens.card,
            )}
          >
            <div className="flex items-center gap-2">
              <Icon name="translate" className={cn("text-[20px]", tokens.accent)} />
              <h3
                className={cn(
                  "text-xl font-semibold tracking-tight",
                  tokens.text,
                )}
              >
                {labels.languages ?? "Langues"}
              </h3>
            </div>
            <div className="flex flex-col gap-2">
              {languages.map((lang) => (
                <div
                  key={lang.id}
                  className={cn(
                    "rounded-lg px-3 py-2.5 flex items-center justify-between gap-3",
                    tokens.muted,
                  )}
                >
                  <span className={cn("text-sm font-semibold", tokens.text)}>
                    {lang.label}
                  </span>
                  {lang.level ? (
                    <span
                      className={cn(
                        "shrink-0 rounded px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
                        tokens.accentSoft,
                      )}
                    >
                      {lang.level}
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </aside>
    </div>
  );
}
