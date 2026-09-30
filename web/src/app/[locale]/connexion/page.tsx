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
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Textarea } from "@/components/ui/Input";
import { LocaleLink, localizedPath } from "@/i18n/path";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/cn";

export default function LoginPage() {
  const router = useRouter();
  const { locale, t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [locked, setLocked] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");
  const [reviewSending, setReviewSending] = useState(false);
  const [reviewSent, setReviewSent] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setReviewError(null);
    setLocked(false);
    setReviewSent(false);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, remember }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.code === "api.accountLocked") {
          setLocked(true);
          setError(data.error ?? t("auth.login.locked"));
          return;
        }
        setError(data.error ?? t("auth.login.error"));
        return;
      }
      router.push(localizedPath(locale, "/app"));
      router.refresh();
    } catch {
      setError(t("common.networkError"));
    } finally {
      setLoading(false);
    }
  }

  async function handleReviewRequest() {
    if (reviewSending) return;
    setReviewError(null);
    setReviewSending(true);
    try {
      const res = await fetch("/api/auth/unlock-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          message: reviewMessage.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setReviewError(data.error ?? t("auth.login.reviewError"));
        return;
      }
      setReviewSent(true);
    } catch {
      setReviewError(t("common.networkError"));
    } finally {
      setReviewSending(false);
    }
  }

  function handleSoon(feature: "google" | "linkedin") {
    setInfo(t(`auth.login.soon_${feature}`));
  }

  return (
    <AuthShell
      headerHint={t("auth.login.noAccount")}
      headerCtaHref="/inscription"
      headerCtaLabel={t("auth.login.createShort")}
      previewNs="login"
    >
      <form onSubmit={handleSubmit}>
        <AuthCard>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
            {t("auth.login.badge")}
          </span>

          <h1 className="mt-4 text-2xl font-bold tracking-tight text-on-surface md:text-[1.75rem] md:leading-9">
            {t("auth.login.title")}
          </h1>
          <p className="mt-2 text-sm leading-6 text-on-surface-variant">
            {t("auth.login.subtitle")}
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

          {locked ? (
            <div className="mt-4 rounded-xl border border-outline-variant/25 bg-surface-container-low p-4">
              <p className="text-sm font-semibold text-on-surface">
                {t("auth.login.reviewTitle")}
              </p>
              <p className="mt-1 text-sm text-on-surface-variant">
                {t("auth.login.reviewBody")}
              </p>
              {reviewSent ? (
                <p className="mt-3 text-sm font-semibold text-primary">
                  {t("auth.login.reviewSent")}
                </p>
              ) : (
                <div className="mt-3 flex flex-col gap-3">
                  <Textarea
                    label={t("auth.login.reviewMessage")}
                    name="reviewMessage"
                    value={reviewMessage}
                    onChange={(e) => setReviewMessage(e.target.value)}
                    placeholder={t("auth.login.reviewMessagePh")}
                    rows={3}
                    disabled={reviewSending}
                  />
                  {reviewError ? (
                    <p role="alert" className="text-sm text-error">
                      {reviewError}
                    </p>
                  ) : null}
                  <Button
                    type="button"
                    variant="brand"
                    className="w-full"
                    disabled={reviewSending}
                    onClick={() => void handleReviewRequest()}
                  >
                    {reviewSending
                      ? t("auth.login.reviewSending")
                      : t("auth.login.reviewCta")}
                  </Button>
                </div>
              )}
            </div>
          ) : null}

          <AuthSocialButtons
            onSoon={handleSoon}
            dividerLabel={t("auth.login.orEmail")}
          />

          <AuthField label={t("auth.login.email")} icon="mail">
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

          <div className="mt-4">
            <AuthField
              label={
                <label htmlFor="password">{t("auth.login.password")}</label>
              }
              icon="lock"
              trailing={
                <LocaleLink
                  locale={locale}
                  href="/mot-de-passe-oublie"
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  {t("auth.login.forgot")}
                </LocaleLink>
              }
            >
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="current-password"
                required
                disabled={loading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
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

          <label className="mt-4 flex cursor-pointer items-center gap-2.5 text-sm text-on-surface">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 rounded border-outline-variant text-primary accent-primary"
            />
            {t("auth.login.remember")}
          </label>

          <button
            type="submit"
            disabled={loading}
            className="mt-5 flex h-12 w-full items-center justify-center gap-1.5 rounded-xl bg-primary text-sm font-bold text-on-primary shadow-sm transition hover:bg-primary/90 disabled:opacity-60"
          >
            {loading ? t("auth.login.loading") : t("auth.login.submit")}
            {!loading ? <span aria-hidden>→</span> : null}
          </button>

          <div className="mt-5 rounded-xl bg-surface-container-low px-4 py-3 text-center text-sm text-on-surface-variant">
            {t("auth.login.noAccount")}{" "}
            <LocaleLink
              locale={locale}
              href="/inscription"
              className="font-bold text-tertiary-container hover:underline"
            >
              {t("auth.login.createFree")}
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
