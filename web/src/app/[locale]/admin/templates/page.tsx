"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { AdminShell } from "@/components/admin/AdminShell";
import { useAdminAccess } from "@/components/admin/useAdminAccess";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/cn";
import { localizedPath } from "@/i18n/path";
import { useI18n, useT } from "@/i18n/provider";
import type { ThemeMood } from "@/lib/profile-themes";

type TemplateRow = {
  id: string;
  name: string;
  description: string;
  mood: ThemeMood;
  preview: string;
  accentDot: string;
  light: boolean;
  enabled: boolean;
  sortOrder: number;
  profiles: number;
  published: number;
  views: number;
  share: number;
  builtin: boolean;
};

const MOODS: ThemeMood[] = ["corporate", "light", "bold", "night"];

export default function AdminTemplatesPage() {
  return (
    <AdminShell>
      <TemplatesContent />
    </AdminShell>
  );
}

function TemplatesContent() {
  const t = useT();
  const { locale } = useI18n();
  const { toast } = useToast();
  const { ready, forbidden } = useAdminAccess();
  const dateLocale = locale === "en" ? "en-US" : "fr-FR";

  const [templates, setTemplates] = useState<TemplateRow[]>([]);
  const [totalProfiles, setTotalProfiles] = useState(0);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<TemplateRow | null>(null);
  const [deleting, setDeleting] = useState<TemplateRow | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/templates");
      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? t("api.server"));
        return;
      }
      setTemplates(data.templates);
      setTotalProfiles(data.totalProfiles);
    } catch {
      toast(t("common.networkError"));
    } finally {
      setLoading(false);
    }
  }, [t, toast]);

  useEffect(() => {
    if (!ready) return;
    void load();
  }, [ready, load]);

  async function confirmDelete() {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      const res = await fetch(`/api/admin/templates/${deleting.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? t("api.server"));
        return;
      }
      toast(t("admin.templateDeleted"));
      setDeleting(null);
      await load();
    } catch {
      toast(t("common.networkError"));
    } finally {
      setDeleteBusy(false);
    }
  }

  if (forbidden) {
    return (
      <p className="text-body-md text-on-surface-variant">{t("admin.forbidden")}</p>
    );
  }

  const items: TemplateRow[] = loading
    ? Array.from({ length: 8 }, (_, i) => ({
        id: `skeleton-${i}`,
        name: "…",
        description: "",
        mood: "corporate",
        preview: "bg-surface-container",
        accentDot: "bg-primary",
        light: true,
        enabled: true,
        sortOrder: i,
        profiles: 0,
        published: 0,
        views: 0,
        share: 0,
        builtin: true,
      }))
    : templates;

  return (
    <div className="flex flex-col gap-space-xl w-full">
      <div className="flex flex-wrap items-end justify-between gap-space-md">
        <div>
          <h1 className="text-headline-lg text-on-surface font-bold">
            {t("admin.templatesTitle")}
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            {t("admin.templatesSub", { count: totalProfiles })}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button href="/themes" variant="outline" size="sm" target="_blank">
            {t("admin.publicThemes")}
          </Button>
          <Button
            size="sm"
            disabled={loading}
            onClick={() => setCreating(true)}
          >
            <Icon name="add" className="text-[18px]" />
            {t("admin.createTemplate")}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">
        {items.map((theme, index) => (
          <article
            key={theme.id}
            className={cn(
              "group relative flex flex-col overflow-hidden rounded-2xl",
              "bg-surface-container-lowest border border-outline-variant/20",
              "shadow-[0_6px_20px_rgba(15,23,42,0.04)]",
              "transition-[transform,box-shadow,border-color] duration-300 ease-out",
              !loading &&
                "hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(15,23,42,0.1)] hover:border-primary/25",
              loading && "animate-pulse",
              !loading && !theme.enabled && "opacity-70",
            )}
            style={loading ? undefined : { animationDelay: `${index * 40}ms` }}
          >
            <div
              className={cn(
                "relative h-[9.5rem] p-3 transition-[filter] duration-300",
                theme.preview,
                !loading && "group-hover:brightness-[1.04]",
              )}
            >
              {!loading ? (
                <>
                  <div
                    aria-hidden
                    className="absolute inset-0 opacity-40"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.22), transparent 45%)",
                    }}
                  />
                  <div
                    className={cn(
                      "relative h-full rounded-xl overflow-hidden flex flex-col border shadow-[0_8px_24px_rgba(0,0,0,0.18)]",
                      "transition-transform duration-300 ease-out group-hover:scale-[1.02]",
                      theme.light
                        ? "bg-white/92 border-stone-200/80 text-stone-900"
                        : "bg-black/45 border-white/10 text-white backdrop-blur-md",
                    )}
                  >
                    <div
                      className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1.5 border-b",
                        theme.light
                          ? "border-stone-200/80 bg-stone-50/90"
                          : "border-white/10 bg-black/20",
                      )}
                    >
                      <span className="size-1.5 rounded-full bg-red-400/80" />
                      <span className="size-1.5 rounded-full bg-amber-400/80" />
                      <span className="size-1.5 rounded-full bg-emerald-400/80" />
                      <span
                        className={cn(
                          "ml-2 h-1.5 flex-1 max-w-[4.5rem] rounded-full",
                          theme.light ? "bg-stone-200" : "bg-white/20",
                        )}
                      />
                    </div>
                    <div className="flex-1 p-2.5 flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "size-7 rounded-lg shrink-0",
                            theme.light ? "bg-stone-200" : "bg-white/20",
                          )}
                        />
                        <div className="flex-1 space-y-1.5 min-w-0">
                          <div
                            className={cn(
                              "h-1.5 w-2/3 rounded-full",
                              theme.light ? "bg-stone-300" : "bg-white/35",
                            )}
                          />
                          <div
                            className={cn(
                              "h-1 w-1/2 rounded-full",
                              theme.light ? "bg-stone-200" : "bg-white/20",
                            )}
                          />
                        </div>
                        <span
                          className={cn(
                            "size-2 rounded-full shrink-0",
                            theme.accentDot,
                          )}
                        />
                      </div>
                      <div className="flex gap-1.5 mt-auto">
                        {[1, 2, 3].map((n) => (
                          <span
                            key={n}
                            className={cn(
                              "h-5 flex-1 rounded-md",
                              theme.light ? "bg-stone-100" : "bg-white/12",
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="absolute top-4 right-4 flex flex-col items-end gap-1">
                    {!theme.enabled ? (
                      <span className="rounded-md bg-surface-container-lowest/95 text-on-surface-variant px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border border-outline-variant/20 shadow-sm">
                        {t("admin.templateDisabled")}
                      </span>
                    ) : theme.share > 0 ? (
                      <span className="rounded-md bg-surface-container-lowest/95 text-on-surface px-2 py-0.5 text-[11px] font-bold tabular-nums border border-outline-variant/20 shadow-sm backdrop-blur-sm">
                        {theme.share}%
                      </span>
                    ) : null}
                  </div>
                </>
              ) : null}
            </div>

            <div className="p-space-md flex flex-col gap-space-sm flex-1">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-display text-headline-md font-bold text-on-surface tracking-tight">
                    {theme.name}
                  </h2>
                  {!loading ? (
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-on-surface-variant shrink-0 mt-1">
                      {t(`admin.mood.${theme.mood}`)}
                    </span>
                  ) : null}
                </div>
                {theme.description ? (
                  <p className="mt-1 text-body-sm text-on-surface-variant leading-snug line-clamp-2">
                    {theme.description}
                  </p>
                ) : loading ? (
                  <div className="mt-2 h-8 rounded bg-surface-container" />
                ) : null}
                {!loading ? (
                  <p className="mt-1 text-[11px] font-mono text-on-surface-variant/80">
                    {theme.id}
                    {theme.builtin ? ` · ${t("admin.templateBuiltin")}` : ""}
                  </p>
                ) : null}
              </div>

              <dl className="grid grid-cols-3 gap-1 rounded-xl bg-surface-container/60 px-2 py-2.5 mt-1">
                <div className="text-center">
                  <dt className="text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold">
                    {t("admin.colProfiles")}
                  </dt>
                  <dd className="mt-0.5 font-display text-label-md font-bold tabular-nums text-on-surface">
                    {loading ? "—" : theme.profiles}
                  </dd>
                </div>
                <div className="text-center border-x border-outline-variant/20">
                  <dt className="text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold">
                    {t("admin.publishedShort")}
                  </dt>
                  <dd className="mt-0.5 font-display text-label-md font-bold tabular-nums text-on-surface">
                    {loading ? "—" : theme.published}
                  </dd>
                </div>
                <div className="text-center">
                  <dt className="text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold">
                    {t("admin.views")}
                  </dt>
                  <dd className="mt-0.5 font-display text-label-md font-bold tabular-nums text-on-surface">
                    {loading ? "—" : theme.views.toLocaleString(dateLocale)}
                  </dd>
                </div>
              </dl>

              <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
                {!loading ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setEditing(theme)}
                      className="inline-flex items-center gap-1 rounded-lg border border-outline-variant/50 px-2.5 py-1.5 text-label-sm font-semibold text-on-surface hover:bg-surface-container transition-colors"
                    >
                      <Icon name="edit" className="text-[16px]" />
                      {t("admin.editTemplate")}
                    </button>
                    <Link
                      href={localizedPath(locale, `/themes/preview/${theme.id}`)}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-label-sm font-semibold text-primary shrink-0 opacity-80 group-hover:opacity-100 transition-opacity hover:underline"
                    >
                      <Icon name="visibility" className="text-[16px]" />
                      {t("admin.previewTheme")}
                    </Link>
                    {!theme.builtin ? (
                      <button
                        type="button"
                        onClick={() => setDeleting(theme)}
                        className="ml-auto inline-flex items-center gap-1 text-label-sm font-semibold text-error hover:underline"
                      >
                        <Icon name="delete" className="text-[16px]" />
                        {t("admin.deleteTemplate")}
                      </button>
                    ) : null}
                  </>
                ) : (
                  <span className="h-4 w-24 rounded bg-surface-container" />
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      {creating ? (
        <TemplateFormModal
          mode="create"
          cloneOptions={templates}
          onClose={() => setCreating(false)}
          onSaved={async () => {
            setCreating(false);
            toast(t("admin.templateCreated"));
            await load();
          }}
        />
      ) : null}

      {editing ? (
        <TemplateFormModal
          mode="edit"
          template={editing}
          cloneOptions={templates}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null);
            toast(t("admin.templateSaved"));
            await load();
          }}
        />
      ) : null}

      <ConfirmModal
        open={Boolean(deleting)}
        title={t("admin.deleteTemplate")}
        description={
          deleting
            ? t("admin.templateDeleteConfirm", { name: deleting.name })
            : undefined
        }
        confirmLabel={t("admin.deleteTemplate")}
        tone="danger"
        confirming={deleteBusy}
        onConfirm={() => void confirmDelete()}
        onCancel={() => {
          if (!deleteBusy) setDeleting(null);
        }}
      />
    </div>
  );
}

function TemplateFormModal({
  mode,
  template,
  cloneOptions,
  onClose,
  onSaved,
}: {
  mode: "create" | "edit";
  template?: TemplateRow;
  cloneOptions: TemplateRow[];
  onClose: () => void;
  onSaved: () => void | Promise<void>;
}) {
  const t = useT();
  const { toast } = useToast();
  const titleId = useId();
  const [mounted, setMounted] = useState(false);
  const [id, setId] = useState(template?.id ?? "");
  const [name, setName] = useState(template?.name ?? "");
  const [description, setDescription] = useState(template?.description ?? "");
  const [mood, setMood] = useState<ThemeMood>(template?.mood ?? "corporate");
  const [cloneFrom, setCloneFrom] = useState(
    cloneOptions[0]?.id ?? "executive",
  );
  const [enabled, setEnabled] = useState(template?.enabled ?? true);
  const [light, setLight] = useState(template?.light ?? false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !saving) onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, saving]);

  async function save() {
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast(t("api.invalid"));
      return;
    }

    setSaving(true);
    try {
      if (mode === "create") {
        const slug = id.trim().toLowerCase();
        const res = await fetch("/api/admin/templates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: slug,
            name: trimmedName,
            description: description.trim(),
            mood,
            cloneFrom,
            light,
            enabled,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          toast(data.error ?? t("api.server"));
          return;
        }
      } else if (template) {
        const res = await fetch(`/api/admin/templates/${template.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: trimmedName,
            description: description.trim(),
            mood,
            light,
            enabled,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          toast(data.error ?? t("api.server"));
          return;
        }
      }
      await onSaved();
    } catch {
      toast(t("common.networkError"));
    } finally {
      setSaving(false);
    }
  }

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-space-md">
      <button
        type="button"
        aria-label={t("common.close")}
        className="absolute inset-0 bg-on-surface/40 backdrop-blur-[2px]"
        onClick={() => {
          if (!saving) onClose();
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-lg rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-xl p-space-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-start gap-space-md mb-space-lg">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/8 text-primary">
            <Icon
              name={mode === "create" ? "add" : "edit"}
              className="text-[22px]"
            />
          </span>
          <div className="min-w-0">
            <h2
              id={titleId}
              className="text-headline-md font-semibold text-on-surface"
            >
              {mode === "create"
                ? t("admin.templateCreateTitle")
                : t("admin.templateEditTitle")}
            </h2>
            {mode === "edit" && template ? (
              <p className="mt-0.5 text-body-sm text-on-surface-variant font-mono">
                {template.id}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-space-md">
          {mode === "create" ? (
            <div>
              <label className="text-label-sm font-semibold text-on-surface">
                {t("admin.templateId")}
              </label>
              <Input
                value={id}
                onChange={(e) => setId(e.target.value.toLowerCase())}
                placeholder="midnight"
                className="mt-1.5 font-mono"
                autoComplete="off"
              />
              <p className="mt-1 text-[12px] text-on-surface-variant">
                {t("admin.templateIdHint")}
              </p>
            </div>
          ) : null}

          <div>
            <label className="text-label-sm font-semibold text-on-surface">
              {t("admin.templateName")}
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5"
              autoComplete="off"
            />
          </div>

          <div>
            <label className="text-label-sm font-semibold text-on-surface">
              {t("admin.templateDescription")}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1.5 w-full rounded-xl border border-outline-variant/40 bg-surface-container-lowest px-3 py-2.5 text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 resize-y min-h-[5rem]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
            <div>
              <label className="text-label-sm font-semibold text-on-surface">
                {t("admin.templateMood")}
              </label>
              <select
                value={mood}
                onChange={(e) => setMood(e.target.value as ThemeMood)}
                className="mt-1.5 w-full rounded-xl border border-outline-variant/40 bg-surface-container-lowest px-3 py-2.5 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {MOODS.map((m) => (
                  <option key={m} value={m}>
                    {t(`admin.mood.${m}`)}
                  </option>
                ))}
              </select>
            </div>

            {mode === "create" ? (
              <div>
                <label className="text-label-sm font-semibold text-on-surface">
                  {t("admin.templateCloneFrom")}
                </label>
                <select
                  value={cloneFrom}
                  onChange={(e) => setCloneFrom(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-outline-variant/40 bg-surface-container-lowest px-3 py-2.5 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {cloneOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
          </div>

          <label className="flex items-center gap-2.5 text-body-sm text-on-surface cursor-pointer">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="size-4 rounded border-outline-variant accent-primary"
            />
            {t("admin.templateEnabled")}
          </label>

          <label className="flex items-center gap-2.5 text-body-sm text-on-surface cursor-pointer">
            <input
              type="checkbox"
              checked={light}
              onChange={(e) => setLight(e.target.checked)}
              className="size-4 rounded border-outline-variant accent-primary"
            />
            {t("admin.templateLight")}
          </label>
        </div>

        <div className="flex justify-end gap-2 mt-space-lg pt-space-md border-t border-outline-variant/20">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={saving}
            onClick={onClose}
          >
            {t("common.cancel")}
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={saving}
            onClick={() => void save()}
          >
            {saving ? "…" : t("common.save")}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
