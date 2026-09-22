"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { LocaleLink, localizedPath } from "@/i18n/path";
import { useI18n } from "@/i18n/provider";

export default function SignupPage() {
  const router = useRouter();
  const { locale, t } = useI18n();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? t("auth.signup.error"));
        return;
      }
      router.push(localizedPath(locale, "/app/profils/nouveau"));
      router.refresh();
    } catch {
      setError(t("common.networkError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <MarketingShell active="/inscription">
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-gutter py-space-xl">
        <div className="w-full max-w-md">
          <div className="text-center mb-space-lg flex flex-col items-center gap-space-sm">
            <Logo href={`/${locale}`} />
            <h1 className="text-headline-xl-mobile md:text-headline-xl text-on-surface font-bold">
              {t("auth.signup.title")}
            </h1>
            <p className="text-body-md text-on-surface-variant">
              {t("auth.signup.subtitle")}
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-2xl bg-surface-container-lowest shadow-sm p-space-lg flex flex-col gap-space-md border border-outline-variant/20"
          >
            {error ? (
              <div className="rounded-lg bg-error-container text-on-error-container px-space-md py-space-sm text-body-sm">
                {error}
              </div>
            ) : null}
            <Input
              label={t("auth.signup.name")}
              name="name"
              autoComplete="name"
              placeholder={t("auth.signup.namePh")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label={t("auth.signup.email")}
              type="email"
              name="email"
              autoComplete="email"
              placeholder={t("auth.login.emailPh")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label={t("auth.signup.password")}
              type="password"
              name="password"
              autoComplete="new-password"
              placeholder={t("auth.signup.passwordPh")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t("auth.signup.loading") : t("auth.signup.submit")}
            </Button>
            <p className="text-center text-body-sm text-on-surface-variant">
              {t("auth.signup.hasAccount")}{" "}
              <LocaleLink
                locale={locale}
                href="/connexion"
                className="text-primary font-semibold hover:underline"
              >
                {t("auth.signup.signIn")}
              </LocaleLink>
            </p>
          </form>
        </div>
      </div>
    </MarketingShell>
  );
}
