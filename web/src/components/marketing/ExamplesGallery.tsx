"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { ASSETS, profiles } from "@/lib/mock-data";
import { LocaleLink } from "@/i18n/path";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/cn";

type PersonaFilter =
  | "all"
  | "product"
  | "consulting"
  | "talks"
  | "design"
  | "student";

type ExampleCard = {
  id: string;
  name: string;
  title: string;
  slug: string;
  persona: PersonaFilter;
  personaLabelKey: string;
  blurbKey: string;
  cover: string;
  avatarType: "image" | "initials";
  avatarUrl?: string;
  initials?: string;
  views: number;
  scans: number;
};

const FILTERS: PersonaFilter[] = [
  "all",
  "product",
  "consulting",
  "talks",
  "design",
  "student",
];

export function ExamplesGallery() {
  const { locale, t } = useI18n();
  const [filter, setFilter] = useState<PersonaFilter>("all");

  const examples: ExampleCard[] = useMemo(
    () => [
      {
        ...profiles[0],
        persona: "product",
        personaLabelKey: "product",
        blurbKey: "e1Blurb",
        cover: ASSETS.cover,
        views: 1920,
        scans: 142,
        avatarType: "image",
      },
      {
        id: profiles[1].id,
        name: "Sofia Bernard",
        title: "Product Strategy Advisor",
        slug: "sofia-bernard",
        persona: "consulting",
        personaLabelKey: "consulting",
        blurbKey: "e2Blurb",
        cover:
          "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200&h=400&fit=crop",
        avatarType: "image",
        avatarUrl:
          "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=256&h=256&fit=crop&crop=face",
        views: 920,
        scans: 52,
      },
      {
        id: "demo-speaker",
        name: "Camille Roux",
        title: "Speaker & Formatrice tech",
        slug: "camille-roux",
        persona: "talks",
        personaLabelKey: "talks",
        blurbKey: "e3Blurb",
        cover:
          "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=400&fit=crop",
        avatarType: "image",
        avatarUrl:
          "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=256&h=256&fit=crop&crop=face",
        views: 1480,
        scans: 210,
      },
      {
        id: "demo-design",
        name: "Léa Moreau",
        title: "Brand & Visual Designer",
        slug: "lea-moreau",
        persona: "design",
        personaLabelKey: "design",
        blurbKey: "e4Blurb",
        cover:
          "https://images.unsplash.com/photo-1558655146-d09347e92766?w=1200&h=400&fit=crop",
        avatarType: "image",
        avatarUrl:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=256&h=256&fit=crop&crop=face",
        views: 1104,
        scans: 88,
      },
      {
        id: "demo-student",
        name: "Noah Petit",
        title: "Étudiant en informatique",
        slug: "noah-petit",
        persona: "student",
        personaLabelKey: "student",
        blurbKey: "e5Blurb",
        cover:
          "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&h=400&fit=crop",
        avatarType: "initials",
        initials: "NP",
        views: 640,
        scans: 124,
      },
      {
        id: "demo-freelance",
        name: "Inès Diallo",
        title: "Freelance Product Ops",
        slug: "ines-diallo",
        persona: "product",
        personaLabelKey: "product",
        blurbKey: "e6Blurb",
        cover:
          "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=400&fit=crop",
        avatarType: "image",
        avatarUrl:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&h=256&fit=crop&crop=face",
        views: 870,
        scans: 76,
      },
    ],
    [],
  );

  const visible = examples.filter(
    (ex) => filter === "all" || ex.persona === filter,
  );

  return (
    <section id="galerie" className="w-full scroll-mt-24">
      <div className="max-w-7xl mx-auto px-gutter pt-space-xl pb-space-md">
        <div className="text-center md:text-left max-w-2xl mx-auto md:mx-0 mb-space-lg">
          <p className="text-label-sm font-semibold uppercase tracking-[0.14em] text-primary mb-space-sm">
            {t("marketing.examples.galleryEyebrow")}
          </p>
          <h2 className="text-headline-xl-mobile md:text-headline-xl text-on-surface font-bold tracking-tight">
            {t("marketing.examples.galleryTitle")}
          </h2>
          <p className="mt-space-sm text-body-md text-on-surface-variant">
            {t("marketing.examples.gallerySubtitle")}
          </p>
        </div>

        <div
          className="flex flex-wrap justify-center md:justify-start gap-2 mb-space-lg"
          role="tablist"
          aria-label={t("marketing.examples.galleryEyebrow")}
        >
          {FILTERS.map((key) => {
            const active = filter === key;
            const label =
              key === "all"
                ? t("marketing.examples.filterAll")
                : t(`marketing.examples.${key}`);
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(key)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-label-sm font-semibold border transition-colors",
                  active
                    ? "bg-primary text-on-primary border-primary shadow-sm"
                    : "bg-surface-container-lowest text-on-surface-variant border-outline-variant/25 hover:text-on-surface hover:border-outline-variant/50",
                )}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-space-md">
          {visible.map((ex) => (
            <article
              key={ex.id}
              className="group rounded-2xl bg-surface-container-lowest border border-outline-variant/15 shadow-[0_8px_28px_rgba(15,23,42,0.04)] overflow-hidden hover:shadow-[0_14px_36px_rgba(15,23,42,0.08)] hover:border-primary/20 transition-all flex flex-col"
            >
              <div
                className="h-28 bg-cover bg-center relative"
                style={{ backgroundImage: `url(${ex.cover})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-on-surface/25 to-transparent" />
                <Badge tone="primary" className="absolute top-3 left-3">
                  {t(`marketing.examples.${ex.personaLabelKey}`)}
                </Badge>
              </div>

              <div className="p-space-md md:p-space-lg flex flex-col gap-space-sm flex-1 -mt-8 relative">
                {ex.avatarType === "image" && ex.avatarUrl ? (
                  <Image
                    src={ex.avatarUrl}
                    alt=""
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-xl object-cover border-4 border-surface-container-lowest shadow-md"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-primary/15 text-primary flex items-center justify-center text-headline-md font-bold border-4 border-surface-container-lowest shadow-md">
                    {ex.initials}
                  </div>
                )}

                <div>
                  <h3 className="text-headline-md text-on-surface font-semibold tracking-tight">
                    {ex.name}
                  </h3>
                  <p className="text-body-sm text-on-surface-variant mt-0.5">
                    {ex.title}
                  </p>
                </div>

                <p className="text-body-sm text-on-surface-variant leading-relaxed">
                  {t(`marketing.examples.${ex.blurbKey}`)}
                </p>

                <p className="font-mono text-[0.75rem] text-primary truncate">
                  profilelink.me/p/{ex.slug}
                </p>

                <div className="flex gap-space-md text-label-sm text-on-surface-variant">
                  <span>
                    <strong className="text-on-surface tabular-nums">
                      {ex.views.toLocaleString(locale)}
                    </strong>{" "}
                    {t("marketing.examples.metricViews")}
                  </span>
                  <span>
                    <strong className="text-on-surface tabular-nums">
                      {ex.scans.toLocaleString(locale)}
                    </strong>{" "}
                    {t("marketing.examples.metricScans")}
                  </span>
                </div>

                <div className="mt-auto pt-space-sm flex gap-space-xs">
                  <Button
                    href={`/p/${ex.slug}`}
                    variant="brand"
                    size="sm"
                    className="flex-1"
                  >
                    {t("marketing.examples.viewProfile")}
                  </Button>
                  <Button
                    href={`/p/${ex.slug}`}
                    variant="muted"
                    size="sm"
                    aria-label={t("marketing.examples.openLink")}
                  >
                    <Icon name="arrow_outward" className="text-[18px]" />
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {visible.length === 0 ? (
          <p className="text-center text-body-md text-on-surface-variant py-space-xl">
            —
          </p>
        ) : null}

        <p className="text-center mt-space-xl text-body-sm text-on-surface-variant">
          {t("marketing.examples.alreadyAccount")}{" "}
          <LocaleLink
            locale={locale}
            href="/app/profils/nouveau"
            className="text-primary font-semibold hover:underline"
          >
            {t("marketing.examples.createOwn")}
          </LocaleLink>
        </p>
      </div>
    </section>
  );
}
