"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import { QrCodePanel, QrModal } from "@/components/app/QrCodePanel";
import { type ProfileCardData } from "@/lib/mock-data";
import { localizedPath } from "@/i18n/path";
import { useI18n, useT } from "@/i18n/provider";

type ApiProfile = {
  id: string;
  slug: string;
  firstName: string;
  lastName: string;
  title: string;
  avatarUrl: string | null;
  status: "DRAFT" | "PUBLISHED";
  isPrimary: boolean;
  views: number;
  clicks: number;
  qrScans: number;
  updatedAt: string;
};

function mapApiProfile(
  p: ApiProfile,
  locale: string,
  untitled: string,
  primaryLabel: string,
): ProfileCardData {
  const dateLocale = locale === "en" ? "en-US" : "fr-FR";
  return {
    id: p.id,
    name: `${p.firstName} ${p.lastName}`.trim(),
    title: p.title || untitled,
    slug: p.slug,
    status: p.status === "PUBLISHED" ? "online" : "draft",
    badge: p.isPrimary ? primaryLabel : undefined,
    isPrimary: p.isPrimary,
    avatarType: p.avatarUrl ? "image" : "initials",
    avatarUrl: p.avatarUrl ?? undefined,
    initials: `${p.firstName[0] ?? ""}${p.lastName[0] ?? ""}`.toUpperCase() || "PL",
    stats: { views: p.views, clicks: p.clicks, qrScans: p.qrScans },
    updatedAt: new Date(p.updatedAt).toLocaleDateString(dateLocale),
  };
}

function KpiCard({
  label,
  icon,
  children,
}: {
  label: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
      <div className="flex items-start justify-between">
        <span className="text-label-sm text-on-surface-variant uppercase tracking-wider">
          {label}
        </span>
        <div className="w-8 h-8 rounded-lg bg-secondary-container flex items-center justify-center text-primary">
          <Icon name={icon} className="text-[18px]" />
        </div>
      </div>
      <div className="mt-space-md">{children}</div>
    </div>
  );
}

function ProfileCard({
  profile,
  onCopy,
  onQr,
}: {
  profile: ProfileCardData;
  onCopy: (slug: string) => void;
  onQr: (profile: ProfileCardData) => void;
}) {
  const t = useT();
  const isDraft = profile.status === "draft";
  const numLocale = "fr-FR";

  return (
    <div
      className={`p-space-lg rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all flex flex-col gap-space-md ${
        isDraft ? "opacity-90" : ""
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
        <div className="flex items-start gap-space-md">
          <div className="relative">
            {profile.avatarType === "image" && profile.avatarUrl ? (
              <Image
                src={profile.avatarUrl}
                alt=""
                width={56}
                height={56}
                className="w-14 h-14 rounded-xl object-cover shadow-sm"
              />
            ) : profile.avatarType === "initials" ? (
              <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-primary to-surface-tint flex items-center justify-center text-on-primary font-semibold shadow-sm">
                {profile.initials}
              </div>
            ) : (
              <div className="w-14 h-14 rounded-xl bg-surface-container flex items-center justify-center text-on-surface-variant">
                <Icon name={profile.icon ?? "person"} className="text-[28px]" />
              </div>
            )}
            {!isDraft ? (
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-surface-container-lowest" />
            ) : null}
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-space-xs flex-wrap">
              <span className="text-headline-md text-on-surface truncate font-semibold">
                {profile.name}
              </span>
              <Badge tone={isDraft ? "warning" : "success"}>
                {isDraft ? t("app.dashboard.draft") : t("app.dashboard.online")}
              </Badge>
              {profile.badge ? (
                <Badge tone="primary">{t("app.dashboard.primary")}</Badge>
              ) : null}
            </div>
            <p className="text-body-sm text-on-surface-variant truncate">{profile.title}</p>
            <div className="mt-1 flex items-center gap-space-xs min-w-0">
              <span className="font-mono text-code-sm text-primary-container bg-surface-container-low px-2 py-0.5 rounded truncate max-w-[min(100%,16rem)] sm:max-w-none">
                profilelink.me/p/{profile.slug}
              </span>
              {!isDraft ? (
                <button
                  type="button"
                  className="p-1 rounded text-on-surface-variant hover:text-primary hover:bg-surface-container shrink-0"
                  onClick={() => onCopy(profile.slug)}
                  title={t("app.qr.copyLink")}
                >
                  <Icon name="content_copy" className="text-[16px]" />
                </button>
              ) : (
                <span className="text-label-sm text-[11px] text-on-surface-variant shrink-0">
                  {t("app.dashboard.reserved")}
                </span>
              )}
            </div>
          </div>
        </div>

        {profile.stats ? (
          <div className="flex items-center gap-space-md bg-surface-container-low px-space-md py-space-sm rounded-lg self-start md:self-auto">
            {[
              { v: profile.stats.views.toLocaleString(numLocale), l: t("app.dashboard.views") },
              { v: profile.stats.clicks.toLocaleString(numLocale), l: t("app.dashboard.clicks") },
              {
                v: profile.stats.qrScans.toLocaleString(numLocale),
                l: t("app.dashboard.qrScans"),
              },
            ].map((s, i) => (
              <div key={s.l} className="flex items-center gap-space-md">
                {i > 0 ? <div className="w-px h-6 bg-outline-variant/30" /> : null}
                <div className="flex flex-col text-left">
                  <span className="text-headline-md text-on-surface leading-none font-semibold">
                    {s.v}
                  </span>
                  <span className="text-label-sm text-[11px] text-on-surface-variant mt-0.5">
                    {s.l}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : profile.completion != null ? (
          <div className="w-full md:w-56 bg-surface-container-low p-space-sm rounded-lg flex flex-col gap-1.5">
            <div className="flex justify-between text-label-sm">
              <span className="text-on-surface">{t("app.dashboard.configuration")}</span>
              <span className="text-on-surface-variant">{profile.completion}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
              <div
                className="h-full bg-primary-container rounded-full"
                style={{ width: `${profile.completion}%` }}
              />
            </div>
            <p className="text-body-sm text-on-surface-variant">{profile.completionHint}</p>
          </div>
        ) : null}
      </div>

      <div className="pt-space-sm flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
        <span className="text-body-sm text-on-surface-variant flex items-center gap-1">
          <Icon name="schedule" className="text-[16px]" />
          {profile.updatedAt ?? profile.createdAt}
        </span>
        <div className="flex items-center gap-space-xs flex-wrap">
          {isDraft ? (
            <>
              <Button href={`/app/profils/${profile.id}`} variant="brand" size="sm">
                <Icon name="play_circle" className="text-[18px]" /> {t("app.dashboard.continue")}
              </Button>
              <Button variant="ghost" size="sm">
                <Icon name="delete" className="text-[18px]" /> {t("app.dashboard.delete")}
              </Button>
            </>
          ) : (
            <>
              <Button
                href={`/app/profils/${profile.id}`}
                variant={profile.isPrimary ? "brand" : "muted"}
                size="sm"
              >
                <Icon name="edit" className="text-[18px]" /> {t("app.dashboard.edit")}
              </Button>
              <Button href={`/p/${profile.slug}`} variant="muted" size="sm">
                <Icon name="open_in_new" className="text-[18px]" /> {t("app.dashboard.preview")}
              </Button>
              <Button variant="muted" size="sm" onClick={() => onQr(profile)}>
                <Icon name="qr_code_2" className="text-[18px]" /> {t("app.dashboard.qrCode")}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function DashboardView() {
  const { toast } = useToast();
  const t = useT();
  const { locale } = useI18n();
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
  const [profiles, setProfiles] = useState<ProfileCardData[]>([]);
  const [userName, setUserName] = useState("…");
  const [userPlan, setUserPlan] = useState("FREE");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const [meRes, profilesRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/profiles"),
        ]);
        if (meRes.ok) {
          const me = await meRes.json();
          setUserName(me.user?.name?.split(" ")[0] ?? t("app.dashboard.user"));
          setUserPlan(me.user?.plan ?? "FREE");
        }
        if (profilesRes.ok) {
          const data = await profilesRes.json();
          setProfiles(
            (data.profiles as ApiProfile[]).map((p) =>
              mapApiProfile(
                p,
                locale,
                t("app.dashboard.untitled"),
                t("app.dashboard.primary"),
              ),
            ),
          );
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [locale, t]);

  const filtered = useMemo(() => {
    if (filter === "published") return profiles.filter((p) => p.status === "online");
    if (filter === "draft") return profiles.filter((p) => p.status === "draft");
    return profiles;
  }, [filter, profiles]);

  const publishedCount = profiles.filter((p) => p.status === "online").length;
  const draftCount = profiles.filter((p) => p.status === "draft").length;
  const totalViews = profiles.reduce((s, p) => s + (p.stats?.views ?? 0), 0);
  const totalClicks = profiles.reduce((s, p) => s + (p.stats?.clicks ?? 0), 0);
  const totalQr = profiles.reduce((s, p) => s + (p.stats?.qrScans ?? 0), 0);
  const primaryProfile = profiles.find((p) => p.isPrimary) ?? profiles[0];
  const [qrProfile, setQrProfile] = useState<ProfileCardData | null>(null);

  const activity = [
    { icon: "qr_code", title: t("app.dashboard.a1"), meta: t("app.dashboard.a1m"), time: t("app.dashboard.a1t") },
    { icon: "link", title: t("app.dashboard.a2"), meta: t("app.dashboard.a2m"), time: t("app.dashboard.a2t") },
    { icon: "visibility", title: t("app.dashboard.a3"), meta: t("app.dashboard.a3m"), time: t("app.dashboard.a3t") },
    { icon: "download", title: t("app.dashboard.a4"), meta: t("app.dashboard.a4m"), time: t("app.dashboard.a4t") },
  ];

  const numLocale = locale === "en" ? "en-US" : "fr-FR";

  return (
    <div className="flex flex-col w-full gap-space-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex flex-wrap items-center gap-space-xs">
            <h1 className="text-headline-md sm:text-headline-lg text-on-surface tracking-tight font-bold">
              {t("app.dashboard.greeting", { name: userName })}
            </h1>
            <Badge tone="secondary">{t("app.dashboard.plan", { plan: userPlan })}</Badge>
          </div>
          <p className="text-body-sm sm:text-body-md text-on-surface-variant flex items-start sm:items-center gap-1.5">
            <span className="w-2 h-2 mt-1.5 sm:mt-0 shrink-0 rounded-full bg-emerald-500 animate-pulse" />
            <span>
            {loading
              ? t("app.dashboard.loadingProfiles")
              : profiles.length === 0
                ? t("app.dashboard.emptyHint")
                : t("app.dashboard.summary", {
                    count: profiles.length,
                    views: totalViews.toLocaleString(numLocale),
                  })}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-space-sm self-stretch sm:self-auto">
          <Button href="/app/profils/nouveau" size="md" className="w-full sm:w-auto">
            <Icon name="add" className="text-[20px]" />
            {t("app.dashboard.create")}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">
        <KpiCard label={t("app.dashboard.kpiActive")} icon="badge">
          <div className="flex items-baseline gap-space-xs">
            <span className="text-display-lg-mobile font-extrabold text-on-surface">
              {profiles.length}
            </span>
            <span className="text-body-sm text-on-surface-variant">
              {t("app.dashboard.kpiAllowed", { limit: userPlan === "FREE" ? 1 : "∞" })}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-label-sm text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            {t("app.dashboard.kpiMix", { published: publishedCount, drafts: draftCount })}
          </div>
        </KpiCard>

        <KpiCard label={t("app.dashboard.kpiViews")} icon="query_stats">
          <div className="flex items-baseline gap-space-xs">
            <span className="text-display-lg-mobile font-extrabold">
              {totalViews.toLocaleString("en-US")}
            </span>
          </div>
          <p className="text-body-sm text-on-surface-variant mt-1">
            {t("app.dashboard.kpiViewsHint")}
          </p>
        </KpiCard>

        <KpiCard label={t("app.dashboard.kpiClicks")} icon="ads_click">
          <div className="flex items-baseline gap-space-xs">
            <span className="text-display-lg-mobile font-extrabold">{totalClicks}</span>
          </div>
          <p className="text-body-sm text-on-surface-variant mt-1">
            {t("app.dashboard.kpiClicksHint")}
          </p>
        </KpiCard>

        <KpiCard label={t("app.dashboard.kpiQr")} icon="qr_code_scanner">
          <div className="flex items-baseline gap-space-xs">
            <span className="text-display-lg-mobile font-extrabold">{totalQr}</span>
          </div>
          <p className="text-body-sm text-on-surface-variant mt-1">
            {t("app.dashboard.kpiQrHint")}
          </p>
        </KpiCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
        <div className="lg:col-span-8 flex flex-col gap-space-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
            <div>
              <h2 className="text-headline-md text-on-surface font-semibold">
                {t("app.dashboard.profilesTitle")}
              </h2>
              <p className="text-body-sm text-on-surface-variant">
                {t("app.dashboard.profilesSubtitle")}
              </p>
            </div>
            <div className="flex items-center gap-1 bg-surface-container p-1 rounded-lg overflow-x-auto max-w-full">
              {(
                [
                  ["all", t("app.dashboard.filterAll", { count: profiles.length })],
                  ["published", t("app.dashboard.filterPublished", { count: publishedCount })],
                  ["draft", t("app.dashboard.filterDrafts", { count: draftCount })],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFilter(key)}
                  className={`shrink-0 px-3 py-1.5 rounded-lg text-label-sm font-semibold transition-all ${
                    filter === key
                      ? "bg-surface-container-lowest text-on-surface shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-space-md">
            {loading ? (
              <p className="text-body-md text-on-surface-variant">{t("common.loading")}</p>
            ) : filtered.length === 0 ? (
              <div className="rounded-xl bg-surface-container-lowest p-space-xl text-center shadow-sm">
                <p className="text-body-md text-on-surface-variant mb-space-md">
                  {t("app.dashboard.emptyFilter")}
                </p>
                <Button href="/app/profils/nouveau">{t("app.dashboard.createCta")}</Button>
              </div>
            ) : (
              filtered.map((p) => (
                <ProfileCard
                  key={p.id}
                  profile={p}
                  onCopy={(slug) => {
                    void navigator.clipboard.writeText(`https://profilelink.me/p/${slug}`);
                    toast(t("app.dashboard.copied", { slug }));
                  }}
                  onQr={setQrProfile}
                />
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-space-md">
          {primaryProfile ? (
            <QrCodePanel
              profileId={primaryProfile.id}
              slug={primaryProfile.slug}
              label={t("app.dashboard.qrPrimary", { name: primaryProfile.name })}
            />
          ) : (
            <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm text-center text-body-md text-on-surface-variant">
              {t("app.dashboard.qrEmpty")}
            </div>
          )}

          <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
            <h3 className="text-headline-md font-semibold mb-space-md">
              {t("app.dashboard.activity")}
            </h3>
            <ul className="flex flex-col gap-space-md">
              {activity.map((item) => (
                <li key={item.title + item.time} className="flex gap-space-sm">
                  <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0">
                    <Icon name={item.icon} className="text-[18px]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-label-md font-semibold text-on-surface">{item.title}</p>
                    <p className="text-body-sm text-on-surface-variant truncate">{item.meta}</p>
                    <p className="text-label-sm text-on-surface-variant mt-0.5">{item.time}</p>
                  </div>
                </li>
              ))}
            </ul>
            <Link
              href={localizedPath(locale, "/app/statistiques")}
              className="mt-space-md inline-flex items-center gap-1 text-label-md text-primary font-semibold hover:underline"
            >
              {t("app.dashboard.seeMetrics")}
              <Icon name="arrow_forward" className="text-sm" />
            </Link>
          </div>
        </div>
      </div>

      {qrProfile ? (
        <QrModal
          open
          onClose={() => setQrProfile(null)}
          slug={qrProfile.slug}
          profileId={qrProfile.id}
          label={qrProfile.name}
        />
      ) : null}
    </div>
  );
}
