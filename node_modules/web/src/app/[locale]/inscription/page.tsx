"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AuthCard,
  AuthField,
  AuthShell,
  AuthSocialButtons,
  authInputClassName,
} from "@/components/auth/AuthShell";
import { Icon } from "@/components/ui/Icon";
import { LocaleLink, localizedPath } from "@/i18n/path";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/cn";

export default function SignupPage() {
  const router = useRouter();
  const { locale, t } = useI18n();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
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

  function handleSoon(feature: "google" | "linkedin") {
    setInfo(t(`auth.login.soon_${feature}`));
  }

  return (
    <AuthShell
      headerHint={t("auth.signup.hasAccount")}
      headerCtaHref="/connexion"
      headerCtaLabel={t("auth.signup.signIn")}
      previewNs="signup"
    >
      <form onSubmit={handleSubmit}>
        <AuthCard>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
            {t("auth.signup.badge")}
          </span>

          <h1 className="mt-4 text-2xl font-bold tracking-tight text-on-surface md:text-[1.75rem] md:leading-9">
            {t("auth.signup.title")}
          </h1>
          <p className="mt-2 text-sm leading-6 text-on-surface-variant">
            {t("auth.signup.subtitle")}
          </p>

          {error ? (
            <div className="mt-4 rounded-lg bg-error-container px-3 py-2 text-sm text-on-error-container">
              {error}
            </div>
          ) : null}
          {info ? (
            <div className="mt-4 rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary">
              {info}
            </div>
          ) : null}

          <AuthSocialButtons
            onSoon={handleSoon}
            dividerLabel={t("auth.signup.orEmail")}
          />

          <AuthField label={t("auth.signup.name")} icon="person">
            <input
              type="text"
              name="name"
              autoComplete="name"
              required
              disabled={loading}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("auth.signup.namePh")}
              className={authInputClassName}
            />
          </AuthField>

          <div className="mt-4">
            <AuthField label={t("auth.signup.email")} icon="mail">
              <input
                type="email"
                name="email"
                autoComplete="email"
                required
                disabled={loading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("auth.login.emailPh")}
                className={authInputClassName}
              />
            </AuthField>
          </div>

          <div className="mt-4">
            <AuthField
              label={
                <label htmlFor="signup-password">{t("auth.signup.password")}</label>
              }
              icon="lock"
            >
              <input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="new-password"
                required
                minLength={8}
                disabled={loading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("auth.signup.passwordPh")}
                className={cn(authInputClassName, "pr-10")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-on-surface-variant hover:text-on-surface"
                aria-label={
                  showPassword
                    ? t("auth.login.hidePassword")
                    : t("auth.login.showPassword")
                }
              >
                <Icon
                  name={showPassword ? "visibility_off" : "visibility"}
                  className="text-lg"
                />
              </button>
            </AuthField>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-5 flex h-12 w-full items-center justify-center gap-1.5 rounded-xl bg-primary text-sm font-bold text-on-primary shadow-sm transition hover:bg-primary/90 disabled:opacity-60"
          >
            {loading ? t("auth.signup.loading") : t("auth.signup.submit")}
            {!loading ? <span aria-hidden>→</span> : null}
          </button>

          <div className="mt-5 rounded-xl bg-surface-container-low px-4 py-3 text-center text-sm text-on-surface-variant">
            {t("auth.signup.hasAccount")}{" "}
            <LocaleLink
              locale={locale}
              href="/connexion"
              className="font-bold text-tertiary-container hover:underline"
            >
              {t("auth.signup.signIn")}
            </LocaleLink>
          </div>

          <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[11px] text-on-surface-variant">
            <Icon name="lock" className="text-sm text-primary" />
            {t("auth.login.secureNote")}
          </p>
        </AuthCard>
      </form>
    </AuthShell>
  );
}
