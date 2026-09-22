"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { Pagination, useClientPagination } from "@/components/ui/Pagination";
import { useToast } from "@/components/ui/Toast";
import { localizedPath } from "@/i18n/path";
import { useI18n, useT } from "@/i18n/provider";

type ProfileRow = {
  id: string;
  slug: string;
  firstName: string;
  lastName: string;
  title: string;
  status: "DRAFT" | "PUBLISHED";
  isPrimary: boolean;
  views: number;
  clicks: number;
  qrScans: number;
  updatedAt: string;
};

export default function ProfilesPage() {
  return (
    <AppShell>
      <ProfilesList />
    </AppShell>
  );
}

function ProfilesList() {
  const router = useRouter();
  const { toast } = useToast();
  const t = useT();
  const { locale } = useI18n();
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const numLocale = locale === "en" ? "en-US" : "fr-FR";

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/profiles");
        if (res.status === 401) {
          router.push(localizedPath(locale, "/connexion"));
          return;
        }
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? t("app.profiles.errorLoad"));
          return;
        }
        setProfiles(data.profiles);
      } catch {
        setError(t("common.networkError"));
      } finally {
        setLoading(false);
      }
    })();
  }, [router, locale, t]);

  const {
    page,
    setPage,
    totalPages,
    pageItems,
    from,
    to,
    total: pageTotal,
  } = useClientPagination(profiles, 10);

  async function copySlug(slug: string) {
    await navigator.clipboard.writeText(`https://profilelink.me/p/${slug}`);
    toast(t("app.profiles.copied", { slug }));
  }

  return (
    <div className="flex flex-col gap-space-lg w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
        <div>
          <h1 className="text-headline-lg font-bold text-on-surface">
            {t("app.profiles.title")}
          </h1>
          <p className="text-body-md text-on-surface-variant mt-1">
            {t("app.profiles.subtitle")}
          </p>
        </div>
        <Button href="/app/profils/nouveau">
          <Icon name="add" /> {t("app.profiles.create")}
        </Button>
      </div>

      {loading ? (
        <p className="text-body-md text-on-surface-variant">{t("app.profiles.loading")}</p>
      ) : error ? (
        <div className="rounded-lg bg-error-container text-on-error-container p-space-md">
          {error}
        </div>
      ) : profiles.length === 0 ? (
        <div className="rounded-2xl bg-surface-container-lowest p-space-xl text-center shadow-sm">
          <Icon name="badge" className="text-4xl text-primary mb-space-sm" />
          <h2 className="text-headline-md font-semibold mb-2">{t("app.profiles.emptyTitle")}</h2>
          <p className="text-body-md text-on-surface-variant mb-space-md">
            {t("app.profiles.emptyBody")}
          </p>
          <Button href="/app/profils/nouveau">{t("app.profiles.emptyCta")}</Button>
        </div>
      ) : (
        <div className="flex flex-col gap-space-md">
          {pageItems.map((p) => (
            <div
              key={p.id}
              className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col gap-space-md"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
                <div>
                  <div className="flex items-center gap-space-xs flex-wrap">
                    <h2 className="text-headline-md font-semibold text-on-surface">
                      {p.firstName} {p.lastName}
                    </h2>
                    <Badge tone={p.status === "PUBLISHED" ? "success" : "warning"}>
                      {p.status === "PUBLISHED"
                        ? t("app.profiles.published")
                        : t("app.profiles.draft")}
                    </Badge>
                    {p.isPrimary ? (
                      <Badge tone="primary">{t("app.profiles.primary")}</Badge>
                    ) : null}
                  </div>
                  <p className="text-body-sm text-on-surface-variant">
                    {p.title || t("app.profiles.untitled")}
                  </p>
                  <div className="mt-1 flex items-center gap-1 min-w-0">
                    <span className="font-mono text-code-sm text-primary-container bg-surface-container-low px-2 py-0.5 rounded truncate max-w-[min(100%,18rem)] sm:max-w-none">
                      profilelink.me/p/{p.slug}
                    </span>
                    <button
                      type="button"
                      className="p-1 rounded hover:bg-surface-container text-on-surface-variant shrink-0"
                      onClick={() => void copySlug(p.slug)}
                    >
                      <Icon name="content_copy" className="text-[16px]" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-space-md bg-surface-container-low px-space-md py-space-sm rounded-lg">
                  <div>
                    <div className="text-headline-md font-semibold leading-none">
                      {p.views.toLocaleString(numLocale)}
                    </div>
                    <div className="text-[11px] text-on-surface-variant">
                      {t("app.profiles.views")}
                    </div>
                  </div>
                  <div className="w-px h-6 bg-outline-variant/30" />
                  <div>
                    <div className="text-headline-md font-semibold leading-none">{p.clicks}</div>
                    <div className="text-[11px] text-on-surface-variant">
                      {t("app.profiles.clicks")}
                    </div>
                  </div>
                  <div className="w-px h-6 bg-outline-variant/30" />
                  <div>
                    <div className="text-headline-md font-semibold leading-none">{p.qrScans}</div>
                    <div className="text-[11px] text-on-surface-variant">
                      {t("app.profiles.qrScans")}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-space-xs">
                <Button href={`/app/profils/${p.id}`} variant="brand" size="sm">
                  <Icon name="edit" className="text-[18px]" /> {t("app.profiles.edit")}
                </Button>
                {p.status === "PUBLISHED" ? (
                  <Button href={`/p/${p.slug}`} variant="muted" size="sm">
                    <Icon name="open_in_new" className="text-[18px]" /> {t("app.profiles.preview")}
                  </Button>
                ) : null}
              </div>
            </div>
          ))}
          <Pagination
            page={page}
            totalPages={totalPages}
            total={pageTotal}
            from={from}
            to={to}
            onPageChange={setPage}
            className="rounded-xl bg-surface-container-lowest shadow-sm border border-outline-variant/20"
          />
        </div>
      )}
    </div>
  );
}
