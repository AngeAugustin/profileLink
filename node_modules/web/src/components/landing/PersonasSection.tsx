"use client";

import Image from "next/image";
import { Icon } from "@/components/ui/Icon";
import { useT } from "@/i18n/provider";

function Tag({ children }: { children: string }) {
  return (
    <span className="rounded-full bg-surface-container px-2.5 py-1 font-mono text-xs font-medium text-on-surface-variant">
      {children}
    </span>
  );
}

function CardShell({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <article
      className={`flex flex-col justify-between rounded-3xl border border-outline-variant/30 bg-white p-6 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] ${className}`}
    >
      {children}
    </article>
  );
}

function TagsRow({ tags }: { tags: string[] }) {
  return (
    <div className="mt-4 flex flex-wrap gap-1.5 border-t border-outline-variant/20 pt-4">
      {tags.map((tag) => (
        <Tag key={tag}>{tag}</Tag>
      ))}
    </div>
  );
}

export function PersonasSection() {
  const t = useT();

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-gutter py-10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex max-w-xl flex-col gap-3">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.05em] text-primary">
            <Icon name="grid_view" className="text-sm" />
            {t("marketing.personas.eyebrow")}
          </span>
          <h2 className="text-[28px] font-bold leading-tight tracking-[-0.02em] text-on-surface md:text-4xl md:leading-[44px]">
            {t("marketing.personas.title")}
          </h2>
        </div>
        <p className="max-w-md text-[15px] leading-6 text-on-surface-variant lg:text-right">
          {t("marketing.personas.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-12">
        {/* 1. Freelances — 7 cols */}
        <CardShell className="lg:col-span-7">
          <div className="flex flex-col gap-2 pb-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-[#059669]">
                <Icon name="work" className="text-xl" />
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold tracking-wide text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {t("marketing.personas.freelanceBadge")}
              </span>
            </div>
            <h3 className="pt-2 text-xl font-bold tracking-[-0.01em] text-on-surface">
              {t("marketing.personas.freelance")}
            </h3>
            <p className="text-[13px] leading-5 text-on-surface-variant">
              {t("marketing.personas.freelanceBody")}
            </p>

            <div className="mt-2 flex flex-col gap-2 rounded-2xl border border-outline-variant/20 bg-surface-container-low p-4 pt-6">
              <div className="flex items-center justify-between gap-3 rounded-xl border border-outline-variant/20 bg-white p-2 pl-3">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-on-surface-variant">
                    {t("marketing.personas.freelanceRateLabel")}
                  </p>
                  <p className="flex items-baseline gap-1">
                    <span className="text-xl font-extrabold text-on-surface">650€</span>
                    <span className="text-[13px] font-medium text-on-surface-variant">
                      {t("marketing.personas.freelanceRateUnit")}
                    </span>
                  </p>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold tracking-wide text-white shadow-sm">
                  <Icon name="calendar_month" className="text-sm" />
                  {t("marketing.personas.freelanceCta")}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 px-1">
                <span className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant">
                  <Icon name="trending_up" className="text-sm text-[#059669]" />
                  {t("marketing.personas.freelanceMetricLabel")}
                </span>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
                  {t("marketing.personas.freelanceMetric")}
                </span>
              </div>
            </div>
          </div>
          <TagsRow tags={["#TJM", "#Stripe", "#ContratDirect"]} />
        </CardShell>

        {/* 2. Tech — 5 cols */}
        <CardShell className="lg:col-span-5">
          <div className="flex flex-col gap-2 pb-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-[#1D4ED8]">
                <Icon name="terminal" className="text-xl" />
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold tracking-wide text-[#1D4ED8]">
                <Icon name="sync" className="text-sm" />
                {t("marketing.personas.techBadge")}
              </span>
            </div>
            <h3 className="pt-2 text-xl font-bold tracking-[-0.01em] text-on-surface">
              {t("marketing.personas.tech")}
            </h3>
            <p className="text-[13px] leading-5 text-on-surface-variant">
              {t("marketing.personas.techBody")}
            </p>

            <div className="mt-2 overflow-hidden rounded-xl bg-slate-900 px-2 pb-2 pt-4 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]">
              <div className="mb-1.5 flex items-center justify-between border-b border-slate-700/60 pb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <span className="font-mono text-[10px] text-slate-400">
                  engineer.config.ts
                </span>
                <span className="inline-flex items-center gap-1 font-mono text-[10px] text-amber-400">
                  <Icon name="star" filled className="text-[10px]" />
                  1.4k
                </span>
              </div>
              <pre className="overflow-x-auto p-1 font-mono text-[11px] leading-[1.6]">
                <code>
                  <span className="text-slate-300">{"const developer = {"}</span>
                  {"\n"}
                  <span className="text-slate-300">{"  stack: ["}</span>
                  <span className="text-emerald-400">&apos;TypeScript&apos;</span>
                  <span className="text-slate-300">, </span>
                  <span className="text-emerald-400">&apos;Rust&apos;</span>
                  <span className="text-slate-300">, </span>
                  <span className="text-emerald-400">&apos;Next.js&apos;</span>
                  <span className="text-slate-300">{"],"}</span>
                  {"\n"}
                  <span className="text-slate-300">{"  commits: "}</span>
                  <span className="text-amber-300">842</span>
                  <span className="text-slate-300">,</span>
                  {"\n"}
                  <span className="text-slate-300">{"  verifiedPRs: "}</span>
                  <span className="text-cyan-400">98.4%</span>
                  {"\n"}
                  <span className="text-slate-300">{"};"}</span>
                </code>
              </pre>
            </div>
          </div>
          <TagsRow tags={["#OpenSource", "#FullStack", "#VerifiedCommits"]} />
        </CardShell>

        {/* 3. Designers — 4 cols */}
        <CardShell className="lg:col-span-4">
          <div className="flex flex-col gap-2 pb-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/10 text-tertiary-container">
                <Icon name="palette" className="text-xl" />
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold tracking-wide text-tertiary-container">
                <Icon name="brush" className="text-sm" />
                {t("marketing.personas.designBadge")}
              </span>
            </div>
            <h3 className="pt-2 text-xl font-bold tracking-[-0.01em] text-on-surface">
              {t("marketing.personas.design")}
            </h3>
            <p className="text-[13px] leading-5 text-on-surface-variant">
              {t("marketing.personas.designBody")}
            </p>

            <div className="relative mt-2 rounded-2xl border border-outline-variant/30 bg-gradient-to-b from-surface-container to-surface-container-highest p-3 pt-5">
              <div className="flex flex-col gap-2 rounded-xl bg-white p-2.5 shadow-sm">
                <div className="flex items-center justify-between border-b border-outline-variant/20 pb-1.5">
                  <span className="h-2 w-16 rounded bg-surface-container-high" />
                  <span className="rounded bg-[#FFDBCE] px-1.5 py-0.5 font-mono text-[9px] text-tertiary-container">
                    v2.4 Prototype
                  </span>
                </div>
                <div className="flex gap-1.5">
                  <div className="flex h-10 flex-1 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-[10px] font-semibold text-primary">
                    {t("marketing.personas.designUiBefore")}
                  </div>
                  <div className="flex h-10 flex-1 items-center justify-center rounded-lg border border-tertiary-container/30 bg-tertiary-container/15 text-[10px] font-semibold text-tertiary-container">
                    {t("marketing.personas.designUiAfter")}
                  </div>
                </div>
              </div>
              <div className="absolute bottom-4 right-4 flex items-center gap-1 drop-shadow-md">
                <Image
                  src="/images/personas/figma-cursor.svg"
                  alt=""
                  width={16}
                  height={16}
                  className="drop-shadow"
                />
                <span className="rounded-full bg-orange-600 px-1.5 py-0.5 text-[9px] font-bold text-white">
                  Jean D.
                </span>
              </div>
            </div>
          </div>
          <TagsRow tags={["#DesignSystem", "#Figma", "#Dribbble"]} />
        </CardShell>

        {/* 4. Cadres — 4 cols */}
        <CardShell className="lg:col-span-4">
          <div className="flex flex-col gap-2 pb-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-700">
                <Icon name="corporate_fare" className="text-xl" />
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold tracking-wide text-indigo-700">
                <Icon name="lock" className="text-sm" />
                {t("marketing.personas.execBadge")}
              </span>
            </div>
            <h3 className="pt-2 text-xl font-bold tracking-[-0.01em] text-on-surface">
              {t("marketing.personas.exec")}
            </h3>
            <p className="text-[13px] leading-5 text-on-surface-variant">
              {t("marketing.personas.execBody")}
            </p>

            <div className="mt-2 flex flex-col gap-2 rounded-2xl border border-slate-700/50 bg-gradient-to-b from-slate-900 via-slate-800 to-indigo-950 p-4 pt-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-700 pb-1.5">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-200">
                  <Icon name="lock" className="text-sm text-amber-300" />
                  {t("marketing.personas.execLocked")}
                </span>
                <span className="rounded bg-slate-700/80 px-2 py-0.5 text-[9px] text-slate-300">
                  {t("marketing.personas.execPin")}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-2 py-0.5">
                  <span className="inline-flex items-center gap-2 text-[11px] text-slate-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary-fixed" />
                    {t("marketing.personas.execRole1")}
                  </span>
                  <span className="text-[10px] text-slate-400">2021-2024</span>
                </div>
                <div className="flex items-center justify-between gap-2 py-0.5">
                  <span className="inline-flex items-center gap-2 text-[11px] text-slate-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#FFDBCE]" />
                    {t("marketing.personas.execRole2")}
                  </span>
                  <span className="text-[10px] text-emerald-400">
                    {t("marketing.personas.execOngoing")}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <TagsRow tags={["#Advisory", "#Gouvernance", "#Executive"]} />
        </CardShell>

        {/* 5. Étudiants — 4 cols */}
        <CardShell className="lg:col-span-4">
          <div className="flex flex-col gap-2 pb-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-700">
                <Icon name="school" className="text-xl" />
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold tracking-wide text-teal-700">
                <Icon name="verified" className="text-sm" />
                {t("marketing.personas.studentsBadge")}
              </span>
            </div>
            <h3 className="pt-2 text-xl font-bold tracking-[-0.01em] text-on-surface">
              {t("marketing.personas.students")}
            </h3>
            <p className="pb-2 text-[13px] leading-5 text-on-surface-variant">
              {t("marketing.personas.studentsBody")}
            </p>

            <div className="flex items-center justify-between gap-2 rounded-2xl border border-outline-variant/20 bg-surface-container-low p-2">
              <div className="flex items-center gap-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-outline-variant/20 bg-white p-1">
                  <Image
                    src="/images/personas/qr-mini.svg"
                    alt=""
                    width={38}
                    height={38}
                    className="h-full w-full"
                  />
                </div>
                <div>
                  <p className="inline-flex items-center gap-1 text-xs font-bold text-on-surface">
                    {t("marketing.personas.studentsDiploma")}
                    <Icon name="verified" className="text-sm text-primary" />
                  </p>
                  <p className="text-[11px] text-on-surface-variant">
                    {t("marketing.personas.studentsDegree")}
                  </p>
                </div>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1.5 text-xs font-semibold text-primary">
                <Icon name="contact_page" className="text-sm" />
                vCard
              </span>
            </div>
          </div>
          <TagsRow tags={["#PremierEmploi", "#Stage", "#GrandeÉcole"]} />
        </CardShell>
      </div>
    </section>
  );
}
