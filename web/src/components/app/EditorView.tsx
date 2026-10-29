"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AccordionSection } from "@/components/ui/Accordion";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Input, Textarea } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/cn";
import { parseExperiencePeriod } from "@/lib/profile-sync";
import { QrModal } from "@/components/app/QrCodePanel";
import { editorProfile, type ProfileCardData } from "@/lib/mock-data";
import { isContactSocialIcon, socialLinkIconSrc } from "@/lib/social-icons";
import { ThemedProfileCard } from "@/components/profile/ThemedProfileCard";
import { localizedPath } from "@/i18n/path";
import { useI18n, useT } from "@/i18n/provider";
import type { ThemeTokens } from "@/lib/profile-themes";
import { resolveThemeTokens } from "@/lib/profile-themes";

type EditorState = typeof editorProfile;

const LINK_STYLES: Record<string, { bg: string; icon?: string; text?: string }> = {
  whatsapp: { bg: "bg-[#25D366]", icon: "chat" },
  linkedin: { bg: "bg-[#0077B5]", text: "in" },
  facebook: { bg: "bg-[#1877F2]", text: "f" },
  github: { bg: "bg-[#181717]", icon: "code" },
  dribbble: { bg: "bg-[#EA4C89]", icon: "palette" },
  tiktok: { bg: "bg-[#010101]", icon: "music_note" },
};

const ACCENTS = [
  { id: "primary", className: "bg-primary" },
  { id: "tertiary", className: "bg-tertiary-container" },
  { id: "emerald", className: "bg-[#059669]" },
  { id: "violet", className: "bg-[#7c3aed]" },
  { id: "inverse", className: "bg-inverse-surface" },
] as const;

function cloneEditor(base: EditorState = editorProfile): EditorState {
  return structuredClone(base);
}

type EditorViewProps = {
  profileId?: string;
  profileMeta?: ProfileCardData;
};

export function EditorView({ profileId, profileMeta }: EditorViewProps) {
  const { toast } = useToast();
  const t = useT();
  const { locale } = useI18n();
  const sectionNav = [
    { id: "section-identity", label: t("app.editor.navIdentity") },
    { id: "section-media", label: t("app.editor.navMedia") },
    { id: "section-links", label: t("app.editor.navLinks") },
    { id: "section-exp", label: t("app.editor.navExp") },
    { id: "section-projects", label: t("app.editor.navProjects") },
    { id: "section-edu", label: t("app.editor.navEdu") },
    { id: "section-cert", label: t("app.editor.navCert") },
    { id: "section-skills", label: t("app.editor.navSkills") },
    { id: "section-interests", label: t("app.editor.navInterests") },
    { id: "section-languages", label: t("app.editor.navLanguages") },
    { id: "section-theme", label: t("app.editor.navTheme") },
  ];
  const [catalogThemes, setCatalogThemes] = useState<
    { id: string; name: string; preview: string; tokens: ThemeTokens }[]
  >([]);
  const themes =
    catalogThemes.length > 0
      ? catalogThemes.map((th) => ({
          id: th.id,
          label: th.name,
          preview: th.preview,
        }))
      : [
          { id: "executive", label: t("app.editor.themeExec"), preview: "bg-surface-container-lowest" },
          { id: "minimalist", label: t("app.editor.themeMin"), preview: "bg-white" },
          { id: "creative", label: t("app.editor.themeCreative"), preview: "bg-gradient-to-tr from-primary to-tertiary-container" },
          { id: "dark", label: t("app.editor.themeDark"), preview: "bg-inverse-surface" },
          { id: "ocean", label: t("app.editor.themeOcean"), preview: "bg-gradient-to-br from-sky-800 to-cyan-500" },
          { id: "forest", label: t("app.editor.themeForest"), preview: "bg-gradient-to-br from-emerald-900 to-lime-600" },
          { id: "paper", label: t("app.editor.themePaper"), preview: "bg-gradient-to-br from-slate-800 to-slate-500" },
          { id: "coral", label: t("app.editor.themeCoral"), preview: "bg-gradient-to-br from-rose-600 to-amber-400" },
        ];
  const [form, setForm] = useState<EditorState>(() => {
    const base = cloneEditor();
    if (profileMeta) {
      const [first = "", ...rest] = profileMeta.name.split(" ");
      base.id = profileMeta.id;
      base.slug = profileMeta.slug;
      base.identity.firstName = first;
      base.identity.lastName = rest.join(" ");
      base.identity.title = profileMeta.title;
      if (profileMeta.avatarUrl) base.media.avatarUrl = profileMeta.avatarUrl;
      if (profileMeta.completion != null) base.completionPct = profileMeta.completion;
    } else if (profileId) {
      base.id = profileId;
    }
    return base;
  });
  const activeThemeTokens =
    catalogThemes.find((th) => th.id === form.theme)?.tokens ??
    resolveThemeTokens(form.theme);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [skillDraft, setSkillDraft] = useState("");
  const [interestDraft, setInterestDraft] = useState("");
  const [languageDraft, setLanguageDraft] = useState("");
  const [languageLevelDraft, setLanguageLevelDraft] = useState("");
  const [synced, setSynced] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dbId, setDbId] = useState(profileId ?? "");
  const [qrOpen, setQrOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/themes");
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && Array.isArray(data.themes)) {
          setCatalogThemes(
            data.themes.map(
              (th: {
                id: string;
                name: string;
                preview: string;
                tokens: ThemeTokens;
              }) => ({
                id: th.id,
                name: th.name,
                preview: th.preview,
                tokens: th.tokens ?? resolveThemeTokens(th.id),
              }),
            ),
          );
        }
      } catch {
        /* keep fallback catalog */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!profileId) return;
    void (async () => {
      const res = await fetch(`/api/profiles/${profileId}`);
      if (!res.ok) return;
      const { profile } = await res.json();
      setDbId(profile.id);
      setForm((prev) => ({
        ...prev,
        id: profile.id,
        slug: profile.slug,
        theme: profile.theme,
        accent: profile.accent,
        indexed: profile.indexed,
        identity: {
          firstName: profile.firstName,
          lastName: profile.lastName,
          title: profile.title,
          bio: profile.bio,
          location: profile.location,
          email: profile.email ?? "",
          phone: profile.phone ?? "",
        },
        media: {
          avatarUrl: profile.avatarUrl ?? prev.media.avatarUrl,
          coverUrl: profile.coverUrl ?? prev.media.coverUrl,
        },
        experiences:
          profile.experiences?.length > 0
            ? profile.experiences.map(
                (e: {
                  id: string;
                  title: string;
                  company: string;
                  location?: string;
                  period?: string;
                  startDate: string;
                  endDate: string | null;
                  current: boolean;
                  highlights: string;
                }) => ({
                  id: e.id,
                  title: e.title,
                  company: e.company,
                  location: e.location ?? "",
                  period:
                    e.period ??
                    `${e.startDate} — ${e.current ? t("common.present") : e.endDate ?? ""}`,
                  current: e.current,
                  highlights: e.highlights,
                }),
              )
            : prev.experiences,
        projects:
          profile.projects?.length > 0
            ? profile.projects.map(
                (p: {
                  id: string;
                  title: string;
                  role: string;
                  description: string;
                  url: string | null;
                  year: string;
                  tags: string;
                }) => ({
                  id: p.id,
                  title: p.title,
                  role: p.role ?? "",
                  description: p.description ?? "",
                  url: p.url ?? "",
                  year: p.year ?? "",
                  tags: p.tags ?? "",
                }),
              )
            : prev.projects,
        education:
          profile.education?.length > 0
            ? profile.education.map(
                (e: {
                  id: string;
                  degree: string;
                  school: string;
                  year: string;
                  note: string;
                }) => ({
                  id: e.id,
                  degree: e.degree,
                  school: e.school,
                  year: e.year,
                  note: e.note,
                }),
              )
            : prev.education,
        certifications:
          profile.certifications?.length > 0
            ? profile.certifications.map(
                (c: {
                  id: string;
                  abbrev: string;
                  title: string;
                  status: string;
                }) => ({
                  id: c.id,
                  abbrev: c.abbrev,
                  title: c.title,
                  status: c.status,
                }),
              )
            : prev.certifications,
        skills:
          profile.skills?.length > 0
            ? profile.skills.map(
                (s: { id: string; label: string; tone: string }) => ({
                  id: s.id,
                  label: s.label,
                  tone: s.tone === "primary" ? "primary" : "secondary",
                }),
              )
            : prev.skills,
        links:
          profile.links?.length > 0
            ? profile.links.map(
                (l: {
                  id: string;
                  label: string;
                  url: string;
                  icon: string;
                  visible: boolean;
                }) => ({
                  id: l.id,
                  label: l.label,
                  url: l.url,
                  icon: l.icon,
                  visible: l.visible,
                }),
              )
            : prev.links,
        interests:
          profile.interests?.length > 0
            ? profile.interests.map((item: { id: string; label: string }) => ({
                id: item.id,
                label: item.label,
              }))
            : prev.interests,
        languages:
          profile.languages?.length > 0
            ? profile.languages.map(
                (item: { id: string; label: string; level?: string }) => ({
                  id: item.id,
                  label: item.label,
                  level: item.level ?? "",
                }),
              )
            : (prev.languages ?? []),
      }));
    })();
  }, [profileId, t]);

  function buildSavePayload(publish: boolean) {
    return {
      firstName: form.identity.firstName,
      lastName: form.identity.lastName,
      title: form.identity.title,
      bio: form.identity.bio,
      location: form.identity.location,
      email: form.identity.email || null,
      phone: form.identity.phone || null,
      avatarUrl: form.media.avatarUrl || null,
      coverUrl: form.media.coverUrl || null,
      theme: form.theme,
      accent: form.accent,
      indexed: form.indexed,
      slug: form.slug,
      ...(publish ? { status: "PUBLISHED" as const } : {}),
      experiences: form.experiences.map((e, i) => {
        const parsed = parseExperiencePeriod(e.period);
        return {
          title: e.title,
          company: e.company,
          location:
            ("location" in e && typeof e.location === "string" && e.location) ||
            parsed.location,
          startDate: parsed.startDate,
          endDate: parsed.endDate,
          current: e.current ?? parsed.current,
          highlights: e.highlights,
          sortOrder: i,
        };
      }),
      projects: form.projects.map((p, i) => ({
        title: p.title,
        role: p.role ?? "",
        description: p.description ?? "",
        url: p.url?.trim() ? p.url.trim() : null,
        year: p.year ?? "",
        tags: p.tags ?? "",
        sortOrder: i,
      })),
      education: form.education.map((e, i) => ({
        degree: e.degree,
        school: e.school,
        year: e.year,
        note: e.note ?? "",
        sortOrder: i,
      })),
      certifications: form.certifications.map((c, i) => ({
        abbrev: c.abbrev,
        title: c.title,
        status: c.status,
        sortOrder: i,
      })),
      skills: form.skills.map((s, i) => ({
        label: s.label,
        tone: s.tone,
        sortOrder: i,
      })),
      links: form.links.map((l, i) => ({
        label: l.label,
        url: l.url,
        icon: l.icon,
        visible: l.visible,
        sortOrder: i,
      })),
      interests: (form.interests ?? []).map((item, i) => ({
        label: item.label,
        sortOrder: i,
      })),
      languages: (form.languages ?? []).map((item, i) => ({
        label: item.label,
        level: item.level ?? "",
        sortOrder: i,
      })),
    };
  }

  const fullName = `${form.identity.firstName} ${form.identity.lastName}`.trim();

  function patchIdentity(patch: Partial<EditorState["identity"]>) {
    setSynced(false);
    setForm((prev) => ({ ...prev, identity: { ...prev.identity, ...patch } }));
    window.setTimeout(() => setSynced(true), 600);
  }

  function patchForm(updater: (prev: EditorState) => EditorState) {
    setSynced(false);
    setForm(updater);
    window.setTimeout(() => setSynced(true), 600);
  }

  async function saveProfile(publish = false) {
    if (!dbId) {
      toast(t("app.editor.notFound"));
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/profiles/${dbId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildSavePayload(publish)),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? t("app.editor.saveFail"));
        return;
      }
      toast(publish ? t("app.editor.published") : t("app.editor.saved"));
      setSynced(true);
    } catch {
      toast(t("app.editor.network"));
    } finally {
      setSaving(false);
    }
  }

  function handlePublish() {
    void saveProfile(true);
  }

  function handleCopyLink() {
    void navigator.clipboard?.writeText(`https://profilelink.me/p/${form.slug}`);
    toast(t("app.editor.linkCopied"));
  }

  function addSkill() {
    const label = skillDraft.trim();
    if (!label) return;
    patchForm((prev) => ({
      ...prev,
      skills: [
        ...prev.skills,
        {
          id: String(Date.now()),
          label,
          tone: "secondary" as const,
        },
      ],
    }));
    setSkillDraft("");
  }

  function addInterest() {
    const label = interestDraft.trim();
    if (!label) return;
    patchForm((prev) => ({
      ...prev,
      interests: [
        ...(prev.interests ?? []),
        { id: String(Date.now()), label },
      ],
    }));
    setInterestDraft("");
  }

  function addLanguage() {
    const label = languageDraft.trim();
    if (!label) return;
    patchForm((prev) => ({
      ...prev,
      languages: [
        ...(prev.languages ?? []),
        {
          id: String(Date.now()),
          label,
          level: languageLevelDraft.trim(),
        },
      ],
    }));
    setLanguageDraft("");
    setLanguageLevelDraft("");
  }

  return (
    <div className="flex flex-col w-full">
      {/* Sticky command bar */}
      <div className="sticky top-16 z-30 -mx-gutter px-gutter py-space-sm bg-surface-container-lowest/95 backdrop-blur-md shadow-sm mb-space-lg flex flex-wrap items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-md min-w-0">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 shadow-sm">
            <Icon name="badge" className="text-[24px]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-space-xs flex-wrap">
              <h1 className="font-headline-md text-headline-md text-on-surface truncate">
                {t("app.editor.title", { name: fullName || t("app.editor.unnamed") })}
              </h1>
              <Badge tone="secondary">{form.versionLabel}</Badge>
            </div>
            <div className="flex items-center gap-space-sm text-on-surface-variant font-body-sm text-body-sm flex-wrap">
              <span
                className={cn(
                  "flex items-center gap-1 font-medium",
                  synced ? "text-[#059669]" : "text-amber-600",
                )}
              >
                <Icon name={synced ? "check_circle" : "sync"} className="text-[16px]" />
                {synced ? t("app.editor.synced") : t("app.editor.syncing")}
              </span>
              <span className="w-1 h-1 rounded-full bg-outline-variant" />
              <span className="font-code-sm text-[12px] text-on-surface-variant">
                profilelink.me/p/{form.slug}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-space-md ml-auto flex-wrap">
          <div className="hidden xl:flex items-center gap-space-sm px-space-md py-1.5 rounded-lg bg-surface-container-low shadow-sm">
            <div className="flex flex-col text-right">
              <div className="flex items-center gap-1.5 justify-end">
                <span className="font-label-sm text-label-sm text-on-surface">
                  {t("app.editor.completion", { pct: form.completionPct })}
                </span>
                <Icon name="info" className="text-tertiary-container text-[16px]" />
              </div>
              <span className="font-body-sm text-[11px] text-on-surface-variant">
                {t("app.editor.completionHint")}
              </span>
            </div>
            <div className="w-20 h-2 rounded-full bg-surface-container-highest overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-container to-tertiary-container rounded-full transition-all duration-500"
                style={{ width: `${form.completionPct}%` }}
              />
            </div>
          </div>

          <div className="flex items-center p-1 rounded-lg bg-surface-container-high text-on-surface-variant">
            <button
              type="button"
              className={cn(
                "px-3 py-1.5 rounded-md font-label-sm text-label-sm flex items-center gap-1.5 transition-all",
                previewMode === "desktop"
                  ? "bg-surface-container-lowest text-on-surface shadow-sm"
                  : "hover:text-on-surface",
              )}
              onClick={() => setPreviewMode("desktop")}
            >
              <Icon name="desktop_mac" className="text-[18px]" />
              <span className="hidden sm:inline">{t("app.editor.desktop")}</span>
            </button>
            <button
              type="button"
              className={cn(
                "px-3 py-1.5 rounded-md font-label-sm text-label-sm flex items-center gap-1.5 transition-all",
                previewMode === "mobile"
                  ? "bg-surface-container-lowest text-on-surface shadow-sm"
                  : "hover:text-on-surface",
              )}
              onClick={() => setPreviewMode("mobile")}
            >
              <Icon name="smartphone" className="text-[18px]" />
              <span className="hidden sm:inline">{t("app.editor.mobile")}</span>
            </button>
          </div>

          <Button href={`/p/${form.slug}`} variant="muted" size="sm">
            <Icon name="visibility" className="text-[18px]" />
            <span className="hidden md:inline">{t("app.editor.livePreview")}</span>
          </Button>

          <Button variant="secondary" size="sm" onClick={() => void saveProfile(false)} disabled={saving}>
            <Icon name="save" className="text-[18px]" />
            {saving ? "…" : t("app.editor.save")}
          </Button>
          <Button variant="primary" size="sm" onClick={handlePublish} disabled={saving}>
            <Icon name="rocket_launch" className="text-[18px]" />
            {saving ? "…" : t("app.editor.publish")}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* Left: form */}
        <div className="lg:col-span-7 2xl:col-span-6 flex flex-col gap-space-md">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-on-surface-variant font-label-sm text-label-sm">
            <span className="text-on-surface font-semibold shrink-0">{t("app.editor.directAccess")}</span>
            {sectionNav.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="px-2.5 py-1 rounded-full bg-surface-container hover:bg-primary-fixed hover:text-on-primary-fixed transition-colors whitespace-nowrap"
              >
                {s.label}
              </a>
            ))}
          </div>

          {/* 1. Identity */}
          <AccordionSection
            id="section-identity"
            number={1}
            title={t("app.editor.identityTitle")}
            subtitle={t("app.editor.identitySub")}
            defaultOpen
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
              <Input
                label={t("app.editor.firstName")}
                value={form.identity.firstName}
                onChange={(e) => patchIdentity({ firstName: e.target.value })}
              />
              <Input
                label={t("app.editor.lastName")}
                value={form.identity.lastName}
                onChange={(e) => patchIdentity({ lastName: e.target.value })}
              />
            </div>
            <Input
              label={t("app.editor.jobTitle")}
              value={form.identity.title}
              onChange={(e) => patchIdentity({ title: e.target.value })}
            />
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-label-sm text-label-sm text-on-surface">
                  {t("app.editor.bio")}
                </label>
                <span className="font-code-sm text-[11px] text-on-surface-variant">
                  {t("app.editor.bioCount", { n: form.identity.bio.length })}
                </span>
              </div>
              <Textarea
                value={form.identity.bio}
                maxLength={240}
                rows={3}
                className="min-h-0"
                onChange={(e) => patchIdentity({ bio: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
              <Input
                label={t("app.editor.location")}
                value={form.identity.location}
                onChange={(e) => patchIdentity({ location: e.target.value })}
              />
              <Input
                label={t("app.editor.email")}
                type="email"
                value={form.identity.email}
                onChange={(e) => patchIdentity({ email: e.target.value })}
              />
              <Input
                label={t("app.editor.phone")}
                type="tel"
                value={form.identity.phone}
                onChange={(e) => patchIdentity({ phone: e.target.value })}
              />
            </div>
          </AccordionSection>

          {/* 2. Media */}
          <AccordionSection
            id="section-media"
            number={2}
            title={t("app.editor.mediaTitle")}
            subtitle={t("app.editor.mediaSub")}
          >
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-space-md items-center">
              <div className="sm:col-span-4 flex flex-col items-center p-space-md rounded-xl bg-surface-container-low shadow-sm text-center">
                <div className="relative w-28 h-28 rounded-full overflow-hidden shadow-md mb-space-sm">
                  <Image
                    src={form.media.avatarUrl}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="112px"
                  />
                </div>
                <span className="font-label-sm text-label-sm text-on-surface">
                  {t("app.editor.avatar")}
                </span>
                <span className="font-body-sm text-[11px] text-on-surface-variant">
                  {t("app.editor.avatarHint")}
                </span>
              </div>
              <div className="sm:col-span-8 flex flex-col gap-space-xs">
                <span className="font-label-sm text-label-sm text-on-surface">
                  {t("app.editor.banner")}
                </span>
                <div
                  className="relative h-32 rounded-xl overflow-hidden shadow-sm bg-surface-container-high bg-cover bg-center"
                  style={{ backgroundImage: `url(${form.media.coverUrl})` }}
                />
                <div className="flex items-center justify-between text-on-surface-variant font-body-sm text-[12px] pt-1">
                  <span>{t("app.editor.bannerHint")}</span>
                  <button type="button" className="text-primary hover:underline font-label-sm">
                    {t("app.editor.gallery")}
                  </button>
                </div>
              </div>
            </div>
          </AccordionSection>

          {/* 3. Links */}
          <AccordionSection
            id="section-links"
            number={3}
            title={t("app.editor.linksTitle")}
            subtitle={t("app.editor.linksSub")}
          >
            {form.links.map((link, index) => {
              const iconSrc = socialLinkIconSrc(link.icon);
              const style = LINK_STYLES[link.icon] ?? {
                bg: "bg-primary",
                icon: "link",
              };
              return (
                <div
                  key={link.id}
                  className="p-space-md rounded-xl bg-surface-container-low shadow-sm flex items-center justify-between gap-space-md"
                >
                  <div className="flex items-center gap-space-md flex-1 min-w-0">
                    <Icon name="drag_indicator" className="text-on-surface-variant text-[20px]" />
                    {iconSrc ? (
                      <Image
                        src={iconSrc}
                        alt=""
                        width={36}
                        height={36}
                        className="size-9 shrink-0 rounded-lg object-contain"
                      />
                    ) : (
                      <div
                        className={cn(
                          "w-9 h-9 rounded-lg text-white flex items-center justify-center shrink-0 shadow-sm font-bold text-sm",
                          style.bg,
                        )}
                      >
                        {style.text ?? <Icon name={style.icon!} className="text-[20px]" />}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-label-sm text-label-sm text-on-surface font-semibold">
                        {link.label}
                      </p>
                      <input
                        className="w-full bg-transparent text-on-surface-variant font-code-sm text-[12px] outline-none"
                        value={link.url}
                        onChange={(e) =>
                          patchForm((prev) => {
                            const links = [...prev.links];
                            links[index] = { ...links[index], url: e.target.value };
                            return { ...prev, links };
                          })
                        }
                      />
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={link.visible}
                      onChange={(e) =>
                        patchForm((prev) => {
                          const links = [...prev.links];
                          links[index] = { ...links[index], visible: e.target.checked };
                          return { ...prev, links };
                        })
                      }
                    />
                    <div className="w-9 h-5 bg-surface-container-highest rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />
                  </label>
                </div>
              );
            })}
            <button
              type="button"
              className="mt-2 w-full py-2.5 rounded-lg bg-surface-container text-primary font-label-md text-label-md hover:bg-surface-container-high transition-colors flex items-center justify-center gap-1.5"
              onClick={() =>
                patchForm((prev) => ({
                  ...prev,
                  links: [
                    ...prev.links,
                    {
                      id: String(Date.now()),
                      label: t("app.editor.newLink"),
                      url: "",
                      visible: true,
                      icon: "link",
                    },
                  ],
                }))
              }
            >
              <Icon name="add" className="text-[20px]" />
              {t("app.editor.addLink")}
            </button>
          </AccordionSection>

          {/* 4. Experiences */}
          <AccordionSection
            id="section-exp"
            number={4}
            title={t("app.editor.expTitle")}
            subtitle={t("app.editor.expSub")}
          >
            {form.experiences.map((exp, index) => (
              <div
                key={exp.id}
                className="p-space-md rounded-xl bg-surface-container-low shadow-sm flex flex-col gap-space-sm"
              >
                <div className="flex items-center justify-between gap-space-sm">
                  <div className="flex items-center gap-space-xs min-w-0">
                    <Icon name="drag_indicator" className="text-on-surface-variant text-[18px]" />
                    <input
                      className="font-label-md text-label-md text-on-surface font-bold bg-transparent outline-none min-w-0 flex-1"
                      value={exp.title}
                      onChange={(e) =>
                        patchForm((prev) => {
                          const experiences = [...prev.experiences];
                          experiences[index] = { ...experiences[index], title: e.target.value };
                          return { ...prev, experiences };
                        })
                      }
                    />
                    {exp.current ? <Badge tone="primary">{t("app.editor.current")}</Badge> : null}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
                  <Input
                    value={exp.company}
                    placeholder={t("app.editor.company")}
                    className="h-10"
                    onChange={(e) =>
                      patchForm((prev) => {
                        const experiences = [...prev.experiences];
                        experiences[index] = { ...experiences[index], company: e.target.value };
                        return { ...prev, experiences };
                      })
                    }
                  />
                  <Input
                    value={exp.period}
                    placeholder={t("app.editor.period")}
                    className="h-10"
                    onChange={(e) =>
                      patchForm((prev) => {
                        const experiences = [...prev.experiences];
                        experiences[index] = { ...experiences[index], period: e.target.value };
                        return { ...prev, experiences };
                      })
                    }
                  />
                </div>
                <Textarea
                  value={exp.highlights}
                  rows={2}
                  className="min-h-0"
                  onChange={(e) =>
                    patchForm((prev) => {
                      const experiences = [...prev.experiences];
                      experiences[index] = {
                        ...experiences[index],
                        highlights: e.target.value,
                      };
                      return { ...prev, experiences };
                    })
                  }
                />
              </div>
            ))}
            <button
              type="button"
              className="py-2.5 rounded-lg bg-surface-container text-primary font-label-md text-label-md hover:bg-surface-container-high transition-colors flex items-center justify-center gap-1.5"
              onClick={() =>
                patchForm((prev) => ({
                  ...prev,
                  experiences: [
                    ...prev.experiences,
                    {
                      id: String(Date.now()),
                      title: t("app.editor.newJob"),
                      company: "",
                      period: "",
                      current: false,
                      highlights: "",
                    },
                  ],
                }))
              }
            >
              <Icon name="add_circle" className="text-[20px]" />
              {t("app.editor.addExp")}
            </button>
          </AccordionSection>

          {/* 5. Projects */}
          <AccordionSection
            id="section-projects"
            number={5}
            title={t("app.editor.projectsTitle")}
            subtitle={t("app.editor.projectsSub")}
          >
            {form.projects.map((project, index) => (
              <div
                key={project.id}
                className="p-space-md rounded-xl bg-surface-container-low shadow-sm flex flex-col gap-space-sm"
              >
                <div className="flex gap-space-sm">
                  <Icon name="work" className="text-primary text-[24px] shrink-0" />
                  <div className="flex-1 flex flex-col gap-space-sm">
                    <Input
                      value={project.title}
                      placeholder={t("app.editor.projectTitle")}
                      onChange={(e) =>
                        patchForm((prev) => {
                          const projects = [...prev.projects];
                          projects[index] = { ...projects[index], title: e.target.value };
                          return { ...prev, projects };
                        })
                      }
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
                      <Input
                        value={project.role}
                        placeholder={t("app.editor.projectRole")}
                        onChange={(e) =>
                          patchForm((prev) => {
                            const projects = [...prev.projects];
                            projects[index] = { ...projects[index], role: e.target.value };
                            return { ...prev, projects };
                          })
                        }
                      />
                      <Input
                        value={project.year}
                        placeholder={t("app.editor.projectYear")}
                        onChange={(e) =>
                          patchForm((prev) => {
                            const projects = [...prev.projects];
                            projects[index] = { ...projects[index], year: e.target.value };
                            return { ...prev, projects };
                          })
                        }
                      />
                    </div>
                    <Input
                      value={project.url}
                      placeholder={t("app.editor.projectUrl")}
                      onChange={(e) =>
                        patchForm((prev) => {
                          const projects = [...prev.projects];
                          projects[index] = { ...projects[index], url: e.target.value };
                          return { ...prev, projects };
                        })
                      }
                    />
                    <Input
                      value={project.tags}
                      placeholder={t("app.editor.projectTags")}
                      onChange={(e) =>
                        patchForm((prev) => {
                          const projects = [...prev.projects];
                          projects[index] = { ...projects[index], tags: e.target.value };
                          return { ...prev, projects };
                        })
                      }
                    />
                    <Textarea
                      value={project.description}
                      rows={2}
                      className="min-h-0"
                      placeholder={t("app.editor.projectDescription")}
                      onChange={(e) =>
                        patchForm((prev) => {
                          const projects = [...prev.projects];
                          projects[index] = {
                            ...projects[index],
                            description: e.target.value,
                          };
                          return { ...prev, projects };
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              className="py-2.5 rounded-lg bg-surface-container text-primary font-label-md text-label-md hover:bg-surface-container-high transition-colors flex items-center justify-center gap-1.5"
              onClick={() =>
                patchForm((prev) => ({
                  ...prev,
                  projects: [
                    ...prev.projects,
                    {
                      id: String(Date.now()),
                      title: t("app.editor.newProject"),
                      role: "",
                      year: "",
                      url: "",
                      tags: "",
                      description: "",
                    },
                  ],
                }))
              }
            >
              <Icon name="add" className="text-[20px]" />
              {t("app.editor.addProject")}
            </button>
          </AccordionSection>

          {/* 6. Education */}
          <AccordionSection
            id="section-edu"
            number={6}
            title={t("app.editor.eduTitle")}
            subtitle={t("app.editor.eduSub")}
          >
            {form.education.map((edu, index) => (
              <div
                key={edu.id}
                className="p-space-md rounded-xl bg-surface-container-low shadow-sm flex flex-col gap-space-sm"
              >
                <div className="flex gap-space-sm">
                  <Icon name="school" className="text-primary text-[24px] shrink-0" />
                  <div className="flex-1 flex flex-col gap-space-sm">
                    <Input
                      value={edu.degree}
                      onChange={(e) =>
                        patchForm((prev) => {
                          const education = [...prev.education];
                          education[index] = { ...education[index], degree: e.target.value };
                          return { ...prev, education };
                        })
                      }
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
                      <Input
                        value={edu.school}
                        onChange={(e) =>
                          patchForm((prev) => {
                            const education = [...prev.education];
                            education[index] = { ...education[index], school: e.target.value };
                            return { ...prev, education };
                          })
                        }
                      />
                      <Input
                        value={edu.year}
                        onChange={(e) =>
                          patchForm((prev) => {
                            const education = [...prev.education];
                            education[index] = { ...education[index], year: e.target.value };
                            return { ...prev, education };
                          })
                        }
                      />
                    </div>
                    <Input
                      value={edu.note}
                      onChange={(e) =>
                        patchForm((prev) => {
                          const education = [...prev.education];
                          education[index] = { ...education[index], note: e.target.value };
                          return { ...prev, education };
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              className="py-2.5 rounded-lg bg-surface-container text-primary font-label-md text-label-md hover:bg-surface-container-high transition-colors flex items-center justify-center gap-1.5"
              onClick={() =>
                patchForm((prev) => ({
                  ...prev,
                  education: [
                    ...prev.education,
                    {
                      id: String(Date.now()),
                      degree: t("app.editor.newDegree"),
                      school: "",
                      year: "",
                      note: "",
                    },
                  ],
                }))
              }
            >
              <Icon name="add" className="text-[20px]" />
              {t("app.editor.addEdu")}
            </button>
          </AccordionSection>

          {/* 7. Certifications */}
          <AccordionSection
            id="section-cert"
            number={7}
            title={t("app.editor.certTitle")}
            subtitle={t("app.editor.certSub")}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
              {form.certifications.map((cert, index) => (
                <div
                  key={cert.id}
                  className="p-space-md rounded-xl bg-surface-container-low shadow-sm flex items-center gap-space-sm"
                >
                  <div className="w-10 h-10 rounded-lg bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed font-bold text-xs shrink-0">
                    {cert.abbrev}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Input
                      value={cert.title}
                      className="h-9 font-label-sm"
                      onChange={(e) =>
                        patchForm((prev) => {
                          const certifications = [...prev.certifications];
                          certifications[index] = {
                            ...certifications[index],
                            title: e.target.value,
                          };
                          return { ...prev, certifications };
                        })
                      }
                    />
                    <p className="font-code-sm text-[11px] text-[#059669] flex items-center gap-1 mt-1">
                      <Icon name="verified" className="text-[13px]" />
                      {cert.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="py-2.5 rounded-lg bg-surface-container text-primary font-label-md text-label-md hover:bg-surface-container-high transition-colors flex items-center justify-center gap-1.5"
              onClick={() =>
                patchForm((prev) => ({
                  ...prev,
                  certifications: [
                    ...prev.certifications,
                    {
                      id: String(Date.now()),
                      abbrev: "NEW",
                      title: t("app.editor.newCert"),
                      status: t("app.editor.certPending"),
                    },
                  ],
                }))
              }
            >
              <Icon name="add" className="text-[20px]" />
              {t("app.editor.addCert")}
            </button>
          </AccordionSection>

          {/* 8. Skills */}
          <AccordionSection
            id="section-skills"
            number={8}
            title={t("app.editor.skillsTitle")}
            subtitle={t("app.editor.skillsSub")}
          >
            <div className="flex flex-wrap gap-2">
              {form.skills.map((skill) => (
                <span
                  key={skill.id}
                  className={cn(
                    "px-3 py-1.5 rounded-lg font-label-sm text-label-sm flex items-center gap-1.5 font-semibold",
                    skill.tone === "primary"
                      ? "bg-primary/10 text-primary"
                      : "bg-secondary-container text-on-secondary-container",
                  )}
                >
                  {skill.label}
                  <button
                    type="button"
                    className="hover:opacity-75"
                    onClick={() =>
                      patchForm((prev) => ({
                        ...prev,
                        skills: prev.skills.filter((s) => s.id !== skill.id),
                      }))
                    }
                  >
                    <Icon name="close" className="text-[14px]" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                className="flex-1 h-10 px-3 rounded-lg bg-surface-container-low text-on-surface font-body-sm text-body-sm outline-none shadow-sm"
                placeholder={t("app.editor.skillPh")}
                value={skillDraft}
                onChange={(e) => setSkillDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill();
                  }
                }}
              />
              <button
                type="button"
                className="px-4 h-10 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm font-semibold hover:brightness-110 transition-all shadow-sm"
                onClick={addSkill}
              >
                {t("app.editor.addSkill")}
              </button>
            </div>
          </AccordionSection>

          {/* 9. Interests */}
          <AccordionSection
            id="section-interests"
            number={9}
            title={t("app.editor.interestsTitle")}
            subtitle={t("app.editor.interestsSub")}
          >
            <div className="flex flex-wrap gap-2">
              {(form.interests ?? []).map((item) => (
                <span
                  key={item.id}
                  className="px-3 py-1.5 rounded-lg font-label-sm text-label-sm flex items-center gap-1.5 font-semibold bg-secondary-container text-on-secondary-container"
                >
                  {item.label}
                  <button
                    type="button"
                    className="hover:opacity-75"
                    onClick={() =>
                      patchForm((prev) => ({
                        ...prev,
                        interests: (prev.interests ?? []).filter(
                          (i) => i.id !== item.id,
                        ),
                      }))
                    }
                  >
                    <Icon name="close" className="text-[14px]" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                className="flex-1 h-10 px-3 rounded-lg bg-surface-container-low text-on-surface font-body-sm text-body-sm outline-none shadow-sm"
                placeholder={t("app.editor.interestPh")}
                value={interestDraft}
                onChange={(e) => setInterestDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addInterest();
                  }
                }}
              />
              <button
                type="button"
                className="px-4 h-10 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm font-semibold hover:brightness-110 transition-all shadow-sm"
                onClick={addInterest}
              >
                {t("app.editor.addInterest")}
              </button>
            </div>
          </AccordionSection>

          {/* 10. Languages */}
          <AccordionSection
            id="section-languages"
            number={10}
            title={t("app.editor.languagesTitle")}
            subtitle={t("app.editor.languagesSub")}
          >
            <div className="flex flex-col gap-2">
              {(form.languages ?? []).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-lg bg-surface-container-low px-3 py-2"
                >
                  <div className="min-w-0 flex items-center gap-2">
                    <span className="font-label-sm text-label-sm font-semibold text-on-surface">
                      {item.label}
                    </span>
                    {item.level ? (
                      <span className="rounded px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide bg-primary/10 text-primary">
                        {item.level}
                      </span>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    className="hover:opacity-75 text-on-surface-variant"
                    onClick={() =>
                      patchForm((prev) => ({
                        ...prev,
                        languages: (prev.languages ?? []).filter(
                          (l) => l.id !== item.id,
                        ),
                      }))
                    }
                  >
                    <Icon name="close" className="text-[16px]" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                className="flex-1 h-10 px-3 rounded-lg bg-surface-container-low text-on-surface font-body-sm text-body-sm outline-none shadow-sm"
                placeholder={t("app.editor.languagePh")}
                value={languageDraft}
                onChange={(e) => setLanguageDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addLanguage();
                  }
                }}
              />
              <input
                className="sm:w-36 h-10 px-3 rounded-lg bg-surface-container-low text-on-surface font-body-sm text-body-sm outline-none shadow-sm"
                placeholder={t("app.editor.languageLevelPh")}
                value={languageLevelDraft}
                onChange={(e) => setLanguageLevelDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addLanguage();
                  }
                }}
              />
              <button
                type="button"
                className="px-4 h-10 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm font-semibold hover:brightness-110 transition-all shadow-sm"
                onClick={addLanguage}
              >
                {t("app.editor.addLanguage")}
              </button>
            </div>
          </AccordionSection>

          {/* 11. Theme */}
          <AccordionSection
            id="section-theme"
            number={11}
            title={t("app.editor.themeTitle")}
            subtitle={t("app.editor.themeSub")}
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm">
              {themes.map((theme) => {
                const swatch = theme.preview;
                const isDarkish =
                  /slate-9|zinc-9|zinc-950|inverse|from-slate-8|from-zinc|from-\[#1e293b\]/.test(
                    theme.preview,
                  );
                const isVivid =
                  /teal|cyan|sky|emerald|lime|rose|orange|amber|primary|tertiary/.test(
                    theme.preview,
                  ) && !isDarkish;
                const bar = isVivid
                  ? "bg-white/80"
                  : isDarkish
                    ? "bg-tertiary-fixed-dim"
                    : "bg-primary";
                const line = isVivid
                  ? "bg-white/50"
                  : isDarkish
                    ? "bg-outline"
                    : "bg-surface-container-high";
                return (
                <button
                  key={theme.id}
                  type="button"
                  className={cn(
                    "p-space-sm rounded-xl bg-surface-container-low hover:bg-surface-container cursor-pointer transition-all shadow-sm text-center",
                    form.theme === theme.id && "ring-2 ring-primary",
                  )}
                  onClick={() => patchForm((prev) => ({ ...prev, theme: theme.id }))}
                >
                  <div
                    className={cn(
                      "h-16 rounded-lg mb-2 p-2 flex flex-col justify-center gap-1 shadow-sm",
                      swatch,
                    )}
                  >
                    <div className={cn("w-8 h-2 rounded mx-auto", bar)} />
                    <div className={cn("w-12 h-1.5 rounded mx-auto", line)} />
                  </div>
                  <span className="font-label-sm text-label-sm text-on-surface font-semibold">
                    {theme.label}
                  </span>
                </button>
                );
              })}
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="font-label-sm text-label-sm text-on-surface font-semibold">
                {t("app.editor.accent")}
              </span>
              <div className="flex items-center gap-2">
                {ACCENTS.map((accent) => (
                  <button
                    key={accent.id}
                    type="button"
                    className={cn(
                      "w-7 h-7 rounded-full transition-all",
                      accent.className,
                      form.accent === accent.id && "ring-2 ring-offset-2 ring-primary",
                    )}
                    onClick={() => patchForm((prev) => ({ ...prev, accent: accent.id }))}
                  />
                ))}
              </div>
            </div>
          </AccordionSection>

          {/* 9. SEO */}
          <AccordionSection
            id="section-seo"
            number={9}
            title={t("app.editor.seoTitle")}
            subtitle={t("app.editor.seoSub")}
          >
            <div>
              <label className="block font-label-sm text-label-sm text-on-surface mb-1">
                {t("app.editor.slugLabel")}
              </label>
              <div className="flex rounded-lg shadow-sm overflow-hidden">
                <span className="inline-flex items-center px-3 bg-surface-container text-on-surface-variant font-code-sm text-[13px]">
                  profilelink.me/p/
                </span>
                <input
                  className="flex-1 h-11 px-3 bg-surface-container-low text-on-surface font-code-sm text-[13px] outline-none"
                  value={form.slug}
                  onChange={(e) =>
                    patchForm((prev) => ({
                      ...prev,
                      slug: e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9-]/g, "-"),
                    }))
                  }
                />
              </div>
            </div>
            <div className="flex items-center justify-between p-space-md rounded-xl bg-surface-container-low shadow-sm">
              <div>
                <p className="font-label-md text-label-md text-on-surface font-semibold">
                  {t("app.editor.indexing")}
                </p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {t("app.editor.indexingBody")}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={form.indexed}
                  onChange={(e) =>
                    patchForm((prev) => ({ ...prev, indexed: e.target.checked }))
                  }
                />
                <div className="w-11 h-6 bg-surface-container-highest rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#059669]" />
              </label>
            </div>
          </AccordionSection>
        </div>

        {/* Right: live preview */}
        <div className="lg:col-span-5 2xl:col-span-6 lg:sticky lg:top-28">
          <div className="flex items-center justify-between mb-space-sm px-1">
            <div className="flex items-center gap-space-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-[#059669] animate-pulse" />
              <span className="font-label-sm text-label-sm text-on-surface font-bold uppercase tracking-wider">
                {t("app.editor.previewLive")}
              </span>
            </div>
            <span className="font-code-sm text-[12px] text-on-surface-variant">
              {t("app.editor.previewMode")}
            </span>
          </div>

          <div
            className={cn(
              "w-full mx-auto transition-all duration-300",
              previewMode === "mobile" ? "max-w-[375px]" : "max-w-full",
            )}
          >
            <div className={cn("rounded-2xl p-2", activeThemeTokens.shell)}>
              <ThemedProfileCard
                compact
                tokens={activeThemeTokens}
                labels={{
                  contact: t("app.editor.contact"),
                  experiences: t("app.editor.keyExp"),
                  projects: t("app.editor.keyProjects"),
                  education: t("app.editor.eduTitle"),
                  certifications: t("app.editor.certs"),
                  skills: t("app.editor.skillsTitle"),
                  interests: t("public.interests"),
                  languages: t("public.languages"),
                  viewProject: t("public.viewProject"),
                  viewCert: t("public.viewCert"),
                }}
                profile={{
                  firstName: form.identity.firstName,
                  lastName: form.identity.lastName,
                  title: form.identity.title,
                  bio: form.identity.bio,
                  location: form.identity.location,
                  email: form.identity.email,
                  phone: form.identity.phone,
                  avatarUrl: form.media.avatarUrl,
                  coverUrl: form.media.coverUrl,
                  experiences: form.experiences,
                  projects: form.projects,
                  education: form.education,
                  certifications: form.certifications,
                  skills: form.skills,
                  links: form.links,
                  interests: form.interests ?? [],
                  languages: form.languages ?? [],
                }}
              />
            </div>
          </div>

          <div className="mt-space-md flex items-center justify-between gap-space-sm">
            <button
              type="button"
              className="flex-1 py-2.5 px-space-md rounded-xl bg-surface-container-lowest text-on-surface font-label-sm text-label-sm shadow-sm hover:bg-surface-container transition-all flex items-center justify-center gap-2"
              onClick={() => setQrOpen(true)}
            >
              <Icon name="qr_code_scanner" className="text-[18px] text-primary" />
              {t("app.editor.generateQr")}
            </button>
            <button
              type="button"
              className="flex-1 py-2.5 px-space-md rounded-xl bg-surface-container-lowest text-on-surface font-label-sm text-label-sm shadow-sm hover:bg-surface-container transition-all flex items-center justify-center gap-2"
              onClick={handleCopyLink}
            >
              <Icon name="content_copy" className="text-[18px] text-tertiary-container" />
              {t("app.editor.copyLink")}
            </button>
          </div>

          <p className="mt-space-sm text-center">
            <Link
              href={localizedPath(locale, `/p/${form.slug}`)}
              className="font-label-sm text-label-sm text-primary hover:underline"
            >
              {t("app.editor.openPublic")}
            </Link>
          </p>
        </div>
      </div>

      <QrModal
        open={qrOpen}
        onClose={() => setQrOpen(false)}
        slug={form.slug}
        profileId={dbId}
        label={fullName}
      />
    </div>
  );
}
