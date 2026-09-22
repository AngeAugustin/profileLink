"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { localizedPath } from "@/i18n/path";
import { useI18n, useT } from "@/i18n/provider";

export default function NewProfilePage() {
  return (
    <AppShell>
      <NewProfileForm />
    </AppShell>
  );
}

function NewProfileForm() {
  const router = useRouter();
  const { toast } = useToast();
  const t = useT();
  const { locale } = useI18n();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function slugify(value: string) {
    return value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function syncSlug(fn: string, ln: string) {
    const next = slugify(`${fn} ${ln}`.trim());
    setSlug(next);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          title: title.trim(),
          slug: slug.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? t("app.newProfile.error"));
        return;
      }
      toast(t("app.newProfile.created"));
      router.push(localizedPath(locale, `/app/profils/${data.profile.id}`));
    } catch {
      setError(t("common.networkError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto w-full">
      <div className="mb-space-lg">
        <h1 className="text-headline-lg text-on-surface font-bold">
          {t("app.newProfile.title")}
        </h1>
        <p className="text-body-md text-on-surface-variant mt-1">
          {t("app.newProfile.subtitle")}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl bg-surface-container-lowest shadow-sm p-space-lg flex flex-col gap-space-md"
      >
        {error ? (
          <div className="rounded-lg bg-error-container text-on-error-container px-space-md py-space-sm text-body-sm">
            {error}
          </div>
        ) : null}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
          <Input
            label={t("app.newProfile.firstName")}
            placeholder="Jean"
            value={firstName}
            onChange={(e) => {
              setFirstName(e.target.value);
              syncSlug(e.target.value, lastName);
            }}
            required
          />
          <Input
            label={t("app.newProfile.lastName")}
            placeholder="Dupont"
            value={lastName}
            onChange={(e) => {
              setLastName(e.target.value);
              syncSlug(firstName, e.target.value);
            }}
            required
          />
        </div>
        <Input
          label={t("app.newProfile.jobTitle")}
          placeholder={t("app.newProfile.titlePh")}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div>
          <label className="block text-label-sm font-semibold text-on-surface mb-1">
            {t("app.newProfile.slug")}
          </label>
          <div className="flex rounded-lg shadow-sm overflow-hidden">
            <span className="inline-flex items-center px-3 bg-surface-container text-on-surface-variant font-mono text-[13px]">
              profilelink.me/p/
            </span>
            <input
              className="flex-1 h-11 px-3 bg-surface-container-low text-on-surface font-mono text-[13px] outline-none focus:bg-surface-container-lowest"
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
              placeholder="jean-dupont"
              required
            />
          </div>
        </div>

        <div className="flex items-center gap-space-sm pt-space-sm">
          <Button type="submit" className="flex-1" disabled={loading}>
            <Icon name="arrow_forward" className="text-[18px]" />
            {loading ? t("app.newProfile.loading") : t("app.newProfile.submit")}
          </Button>
          <Button href="/app/profils" variant="ghost">
            {t("app.newProfile.cancel")}
          </Button>
        </div>
      </form>
    </div>
  );
}
