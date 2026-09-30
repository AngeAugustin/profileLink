"use client";

import { useState } from "react";
import {
  AuthCard,
  AuthField,
  AuthShell,
  authInputClassName,
} from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { LocaleLink } from "@/i18n/path";
import { useI18n } from "@/i18n/provider";

export default function ForgotPasswordPage() {
  const { locale, t } = useI18n();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? t("auth.forgot.error"));
        return;
      }
      setSent(true);
    } catch {
      setError(t("common.networkError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      headerHint={t("auth.forgot.hasAccount")}
      headerCtaHref="/connexion"
      headerCtaLabel={t("auth.forgot.signIn")}
      previewNs="forgot"
    >
      <form onSubmit={handleSubmit}>
        <AuthCard>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
            {t("auth.forgot.badge")}
          </span>

          <h1 className="mt-4 text-2xl font-bold tracking-tight text-on-surface md:text-[1.75rem] md:leading-9">
            {t("auth.forgot.title")}
          </h1>
          <p className="mt-2 text-sm leading-6 text-on-surface-variant">
            {sent ? t("auth.forgot.sentSubtitle") : t("auth.forgot.subtitle")}
          </p>

          {sent ? (
            <div className="mt-6 space-y-4">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                <p className="font-semibold">{t("auth.forgot.sentTitle")}</p>
                <p className="mt-1 leading-6">{t("auth.forgot.sentBody")}</p>
                {email ? (
                  <p className="mt-2 break-all font-mono text-xs font-medium">
                    {email}
                  </p>
                ) : null}
              </div>
              <Button href="/connexion" className="w-full">
                {t("auth.forgot.backToLogin")}
              </Button>
              <button
                type="button"
                onClick={() => {
                  setSent(false);
                  setError(null);
                }}
                className="w-full text-center text-sm font-semibold text-primary hover:underline"
              >
                {t("auth.forgot.resend")}
              </button>
            </div>
          ) : (
            <>
              {error ? (
                <div className="mt-4 rounded-lg bg-error-container px-3 py-2 text-sm text-on-error-container">
                  {error}
                </div>
              ) : null}

              <div className="mt-6">
                <AuthField label={t("auth.forgot.email")} icon="mail">
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

              <button
                type="submit"
                disabled={loading}
                className="mt-5 flex h-12 w-full items-center justify-center gap-1.5 rounded-xl bg-primary text-sm font-bold text-on-primary shadow-sm transition hover:bg-primary/90 disabled:opacity-60"
              >
                {loading ? t("auth.forgot.loading") : t("auth.forgot.submit")}
                {!loading ? <span aria-hidden>→</span> : null}
              </button>

              <div className="mt-5 rounded-xl bg-surface-container-low px-4 py-3 text-center text-sm text-on-surface-variant">
                {t("auth.forgot.hasAccount")}{" "}
                <LocaleLink
                  locale={locale}
                  href="/connexion"
                  className="font-bold text-tertiary-container hover:underline"
                >
                  {t("auth.forgot.signIn")}
                </LocaleLink>
              </div>
            </>
          )}

          <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[11px] text-on-surface-variant">
            <Icon name="lock" className="text-sm text-primary" />
            {t("auth.login.secureNote")}
          </p>
        </AuthCard>
      </form>
    </AuthShell>
  );
}
