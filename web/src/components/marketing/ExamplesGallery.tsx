"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { ASSETS } from "@/lib/mock-data";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/cn";

type PersonaFilter =
  | "all"
  | "tech"
  | "design"
  | "exec"
  | "consulting"
  | "freelance"
  | "student";

type BadgeTone = "neutral" | "primary" | "tertiary" | "success" | "violet";

type GalleryCard = {
  id: string;
  name: string;
  title: string;
  slug: string;
  persona: PersonaFilter;
  tags: string[];
  badges: { label: string; tone: BadgeTone }[];
  avatarUrl?: string;
  initials?: string;
  avatarTone?: "dark" | "violet" | "muted";
  preview:
    | "github"
    | "gallery"
    | "nda"
    | "download"
    | "code"
    | "casestudy";
  previewMeta?: { left: string; right: string; icon?: string };
  views: number;
};

const FILTERS: { id: PersonaFilter; count?: number }[] = [
  { id: "all", count: 48 },
  { id: "tech" },
  { id: "design" },
  { id: "exec" },
  { id: "consulting" },
  { id: "freelance" },
  { id: "student" },
];

const SORTS = ["sortPopular", "sortRecent", "sortName"] as const;

export function ExamplesGallery() {
  const { locale, t } = useI18n();
  const [filter, setFilter] = useState<PersonaFilter>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<(typeof SORTS)[number]>("sortPopular");

  const explore: GalleryCard[] = useMemo(
    () => [
      {
        id: "thomas",
        name: "Thomas Leroy",
        title: "Lead DevOps & Cloud Arch.",
        slug: "thomas-devops",
        persona: "tech",
        tags: ["#Kubernetes", "#Terraform", "#Golang"],
        badges: [
          { label: "Dark Mono", tone: "neutral" },
          { label: "AWS Architect", tone: "violet" },
        ],
        initials: "TL",
        avatarTone: "dark",
        preview: "github",
        previewMeta: {
          left: "1,480 commits en 2024",
          right: "GitHub pro",
          icon: "ssid_chart",
        },
        views: 6000,
      },
      {
        id: "sarah",
        name: "Sarah Benali",
        title: "Photographe & DA",
        slug: "sarah-art",
        persona: "design",
        tags: ["#Editorial", "#Behance", "#vCardExpo"],
        badges: [
          { label: "Minimalist", tone: "neutral" },
          { label: "Galerie Pro", tone: "tertiary" },
        ],
        avatarUrl:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=256&h=256&fit=crop&crop=face",
        preview: "gallery",
        views: 5000,
      },
      {
        id: "maxime",
        name: "Maxime Vasseur",
        title: "Fondateur & Angel Investor",
        slug: "m-vasseur",
        persona: "exec",
        tags: ["#Fintech", "#B2BSaaS", "#SeedRound"],
        badges: [
          { label: "Executive", tone: "neutral" },
          { label: "Carte Métal NFC", tone: "violet" },
        ],
        initials: "MV",
        avatarTone: "muted",
        preview: "nda",
        previewMeta: {
          left: "Deck confidentiel (NDA)",
          right: "8 participations",
          icon: "lock",
        },
        views: 4000,
      },
      {
        id: "lea",
        name: "Léa Fontaine",
        title: "Consultante RSE & Climat",
        slug: "lea-rse",
        persona: "consulting",
        tags: ["#BilanCarbone", "#Gouvernance", "#Audit"],
        badges: [
          { label: "Eco-Light", tone: "neutral" },
          { label: "Cal.com Sync", tone: "violet" },
        ],
        avatarUrl:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=256&h=256&fit=crop&crop=face",
        preview: "download",
        previewMeta: {
          left: "Rapport CSRD 2024",
          right: "Télécharger",
          icon: "description",
        },
        views: 3000,
      },
      {
        id: "alex",
        name: "Alexandre Chen",
        title: "Fullstack & Solopreneur",
        slug: "alex-chen",
        persona: "freelance",
        tags: ["#React", "#Supabase", "#MicroSaaS"],
        badges: [
          { label: "Dispo TJM 680€", tone: "success" },
          { label: "Stripe Pay", tone: "neutral" },
        ],
        initials: "AC",
        avatarTone: "violet",
        preview: "code",
        views: 2000,
      },
      {
        id: "camille",
        name: "Camille Roux",
        title: "Diplômée Master UX Gobelins",
        slug: "camille-ux",
        persona: "student",
        tags: ["#UserResearch", "#Testing", "#FigmaPro"],
        badges: [
          { label: "Recherche 1er CDI", tone: "primary" },
          { label: "CV Vérifié", tone: "neutral" },
        ],
        avatarUrl:
          "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=256&h=256&fit=crop&crop=face",
        preview: "casestudy",
        previewMeta: {
          left: "Étude de cas Figma (Health)",
          right: "Ouvrir",
          icon: "link",
        },
        views: 1000,
      },
    ],
    [],
  );

  const visible = explore
    .filter((ex) => filter === "all" || ex.persona === filter)
    .filter((ex) => {
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        ex.name.toLowerCase().includes(q) ||
        ex.title.toLowerCase().includes(q) ||
        ex.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      if (sort === "sortName") return a.name.localeCompare(b.name, locale);
      if (sort === "sortRecent") return b.id.localeCompare(a.id);
      return b.views - a.views;
    });

  return (
    <section id="galerie" className="w-full scroll-mt-24 py-10 md:py-12">
      <div className="mx-auto max-w-7xl px-gutter">
        {/* Search + sort */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative min-w-0 flex-1">
            <Icon
              name="search"
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("marketing.examples.searchPh")}
              className="h-11 w-full rounded-xl border border-outline-variant/30 bg-surface-container-low pl-10 pr-4 text-sm text-on-surface outline-none transition focus:border-primary/40 focus:bg-white focus:ring-2 focus:ring-primary/15"
            />
          </label>
          <div className="flex shrink-0 items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">
              {t("marketing.examples.sortLabel")}
            </span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as (typeof SORTS)[number])}
              className="h-11 rounded-xl border border-outline-variant/30 bg-white px-3 text-sm font-semibold text-on-surface outline-none focus:border-primary/40"
            >
              {SORTS.map((s) => (
                <option key={s} value={s}>
                  {t(`marketing.examples.${s}`)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filters */}
        <div
          className="mt-4 flex gap-2 overflow-x-auto pb-1"
          role="tablist"
          aria-label={t("marketing.examples.filterLabel")}
        >
          {FILTERS.map((f) => {
            const active = filter === f.id;
            const label =
              f.id === "all"
                ? `${t("marketing.examples.filterAll")}${f.count != null ? ` ${f.count}` : ""}`
                : t(`marketing.examples.filter_${f.id}`);
            return (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(f.id)}
                className={cn(
                  "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors",
                  active
                    ? "bg-primary text-on-primary shadow-sm"
                    : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface",
                )}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Featured */}
        <div className="mt-10 flex items-end justify-between gap-4">
          <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-on-surface md:text-2xl">
            <span className="h-2 w-2 rounded-full bg-tertiary-container" />
            {t("marketing.examples.featuredTitle")}
          </h2>
          <span className="hidden text-[11px] font-bold uppercase tracking-[0.12em] text-on-surface-variant sm:inline">
            {t("marketing.examples.featuredBadge")}
          </span>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Jean featured */}
          <article className="flex flex-col rounded-2xl border border-outline-variant/25 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)] md:p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <Image
                  src={ASSETS.avatarJean}
                  alt=""
                  width={56}
                  height={56}
                  className="h-14 w-14 rounded-full object-cover ring-2 ring-white shadow-md"
                />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <h3 className="text-base font-bold text-on-surface">Jean Dupont</h3>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                      {t("marketing.examples.badgeVerified")}
                    </span>
                    <span className="rounded-full bg-surface-container px-2 py-0.5 text-[10px] font-semibold text-on-surface-variant">
                      Executive Template
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-on-surface-variant">
                    VP Product & Design Systems Lead
                  </p>
                  <a
                    href="/p/jean-dupont"
                    className="mt-1 inline-flex items-center gap-1 font-mono text-xs font-medium text-primary hover:underline"
                  >
                    profilelink.me/p/jean-dupont
                    <Icon name="open_in_new" className="text-sm" />
                  </a>
                </div>
              </div>
              <div className="hidden shrink-0 flex-col items-center rounded-xl border border-outline-variant/20 bg-surface-container-low p-2 sm:flex">
                <Image
                  src="/images/hero/qr-code.svg"
                  alt=""
                  width={56}
                  height={56}
                  className="h-14 w-14"
                />
                <span className="mt-1 text-[10px] font-semibold text-on-surface-variant">
                  {t("marketing.examples.scan")}
                </span>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-3 text-xs text-on-surface-variant">
              <span className="inline-flex items-center gap-1">
                <Icon name="visibility" className="text-sm text-primary" />
                <strong className="text-on-surface">1 920</strong>{" "}
                {t("marketing.examples.metricViews")}
              </span>
              <span className="inline-flex items-center gap-1">
                <Icon name="schedule" className="text-sm text-tertiary-container" />
                {t("marketing.examples.responseTime")}
              </span>
            </div>

            <p className="mt-3 text-[13px] leading-5 text-on-surface-variant">
              <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-primary align-middle" />
              {t("marketing.examples.e1Blurb")}
            </p>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {["Design Systems", "Product", "B2B SaaS"].map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-surface-container px-2 py-0.5 text-[11px] font-semibold text-on-surface-variant"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Button href="/p/jean-dupont" variant="brand" size="sm">
                {t("marketing.examples.cloneTemplate")}
              </Button>
              <Button href="/p/jean-dupont" variant="ghost" size="sm">
                {t("marketing.examples.viewLive")}
              </Button>
            </div>
          </article>

          {/* Clara featured */}
          <article className="overflow-hidden rounded-2xl border border-outline-variant/25 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <div
              className="relative px-5 pb-8 pt-4 md:px-6"
              style={{
                background:
                  "linear-gradient(90deg, rgba(163,57,0,0.9) 0%, rgba(29,78,216,0.95) 100%)",
              }}
            >
              <span className="inline-flex rounded-full bg-white/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-tertiary-container">
                Creative Flare Template
              </span>
            </div>
            <div className="relative -mt-7 px-5 pb-5 md:px-6 md:pb-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <Image
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=256&h=256&fit=crop&crop=face"
                    alt=""
                    width={56}
                    height={56}
                    className="h-14 w-14 rounded-full object-cover ring-4 ring-white shadow-md"
                  />
                  <div className="min-w-0 pt-6">
                    <h3 className="text-base font-bold text-on-surface">Clara Marchand</h3>
                    <p className="text-sm text-on-surface-variant">
                      Senior Fractional CMO & Brand Strategist
                    </p>
                  </div>
                </div>
                <div className="mt-6 hidden shrink-0 flex-col items-center rounded-xl border border-outline-variant/20 bg-surface-container-low p-2 sm:flex">
                  <Image
                    src="/images/hero/qr-code.svg"
                    alt=""
                    width={48}
                    height={48}
                    className="h-12 w-12"
                  />
                  <span className="mt-1 text-[10px] font-semibold text-on-surface-variant">
                    {t("marketing.examples.scan")}
                  </span>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-outline-variant/20 bg-surface-container-low p-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-bold text-on-surface">
                      {t("marketing.examples.claraOffer")}
                    </p>
                    <p className="text-[11px] text-on-surface-variant">
                      {t("marketing.examples.claraAudience")}
                    </p>
                  </div>
                  <Button href="/inscription" size="sm" className="shrink-0">
                    {t("marketing.examples.book")}
                  </Button>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {["Go-to-Market", "Positioning", "Content Ops", "Series A/B"].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-surface-container px-2 py-0.5 text-[11px] font-semibold text-on-surface-variant"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-5">
                <Button href="/p/sofia-bernard" variant="primary" size="sm" className="w-full sm:w-auto">
                  {t("marketing.examples.cloneTemplate")}
                </Button>
              </div>
            </div>
          </article>
        </div>

        {/* Explore grid */}
        <div className="mt-12">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-xl font-bold tracking-tight text-on-surface md:text-2xl">
                {t("marketing.examples.exploreTitle")}
              </h2>
              <p className="mt-1.5 text-sm leading-6 text-on-surface-variant">
                {t("marketing.examples.exploreSubtitle")}
              </p>
            </div>
            <p className="flex shrink-0 items-center gap-1.5 font-mono text-[11px] text-on-surface-variant">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
              {t("marketing.examples.exploreVerified")}
            </p>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((ex) => (
              <ExploreCard key={ex.id} card={ex} t={t} />
            ))}
          </div>
          {visible.length === 0 ? (
            <p className="py-12 text-center text-sm text-on-surface-variant">
              {t("marketing.examples.empty")}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

const BADGE_TONES: Record<BadgeTone, string> = {
  neutral: "bg-surface-container text-on-surface-variant",
  primary: "bg-primary/10 text-primary",
  tertiary: "bg-tertiary-container/15 text-tertiary-container",
  success: "bg-emerald-50 text-emerald-700",
  violet: "bg-indigo-50 text-primary",
};

function ExploreCard({
  card,
  t,
}: {
  card: GalleryCard;
  t: (k: string) => string;
}) {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-outline-variant/20 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="flex flex-1 flex-col p-4 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <Avatar card={card} />
            <div className="min-w-0">
              <h3 className="truncate text-sm font-bold text-on-surface">{card.name}</h3>
              <p className="truncate text-xs text-on-surface-variant">{card.title}</p>
            </div>
          </div>
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-outline-variant/25 bg-surface-container-low text-on-surface-variant"
            aria-hidden
          >
            <Icon name="qr_code_2" className="text-base" />
          </span>
        </div>

        <a
          href={`/p/${card.slug}`}
          className="mt-2.5 block truncate font-mono text-xs font-medium text-primary underline underline-offset-2 hover:opacity-80"
        >
          profilelink.me/p/{card.slug}
        </a>

        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {card.badges.map((b) => (
            <span
              key={b.label}
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                BADGE_TONES[b.tone],
              )}
            >
              {b.label}
            </span>
          ))}
        </div>

        <div className="mt-3">
          <Preview card={card} />
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {card.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-surface-container px-1.5 py-0.5 text-[10px] font-medium text-on-surface-variant"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-outline-variant/15 bg-surface-container-low px-4 py-2.5">
        <a
          href={`/p/${card.slug}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          {t("marketing.examples.viewProfile")}
          <Icon name="north_east" className="text-sm" />
        </a>
        <Button href="/inscription" variant="outline" size="sm" className="h-8 bg-white px-3 text-xs">
          {t("marketing.examples.useTemplate")}
        </Button>
      </div>
    </article>
  );
}

function Avatar({ card }: { card: GalleryCard }) {
  if (card.avatarUrl) {
    return (
      <Image
        src={card.avatarUrl}
        alt=""
        width={40}
        height={40}
        className="h-10 w-10 rounded-full object-cover"
      />
    );
  }
  const tone =
    card.avatarTone === "dark"
      ? "bg-on-surface text-white"
      : card.avatarTone === "violet"
        ? "bg-indigo-100 text-primary"
        : "bg-surface-container-high text-on-surface-variant";
  return (
    <span
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-lg text-xs font-bold",
        tone,
      )}
    >
      {card.initials}
    </span>
  );
}

function Preview({ card }: { card: GalleryCard }) {
  if (card.preview === "gallery") {
    const thumbs = [
      "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=200&h=140&fit=crop",
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=200&h=140&fit=crop",
      "https://images.unsplash.com/photo-1541643600914-78b084683601?w=200&h=140&fit=crop",
    ];
    return (
      <div className="grid grid-cols-3 gap-1.5">
        {thumbs.map((src) => (
          <div
            key={src}
            className="relative aspect-[4/3] overflow-hidden rounded-md bg-surface-container"
          >
            <Image src={src} alt="" fill className="object-cover" sizes="100px" />
          </div>
        ))}
      </div>
    );
  }

  if (card.preview === "code") {
    return (
      <div className="rounded-xl bg-surface-container-low px-3 py-2.5 font-mono text-[11px] leading-5 text-on-surface">
        {"const stack = ['Next.js', 'Postgres', 'Tailwind'];"}
      </div>
    );
  }

  const meta = card.previewMeta;
  if (!meta) return null;

  const rightIsAction =
    card.preview === "download" ||
    card.preview === "casestudy" ||
    card.preview === "github";
  const iconTone =
    card.preview === "nda"
      ? "text-tertiary-container"
      : card.preview === "github"
        ? "text-emerald-600"
        : "text-on-surface-variant";

  return (
    <div className="flex items-center gap-2 rounded-xl bg-surface-container-low px-3 py-2.5">
      {meta.icon ? (
        <Icon name={meta.icon} className={cn("shrink-0 text-base", iconTone)} />
      ) : null}
      <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-on-surface">
        {meta.left}
      </span>
      <span
        className={cn(
          "shrink-0 text-[11px] font-semibold",
          rightIsAction && card.preview !== "nda" ? "text-primary" : "text-on-surface-variant",
          card.preview === "github" && "text-primary",
        )}
      >
        {meta.right}
      </span>
    </div>
  );
}
