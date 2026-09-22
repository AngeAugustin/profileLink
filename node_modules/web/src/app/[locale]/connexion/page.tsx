"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { LocaleLink, localizedPath } from "@/i18n/path";
import { useI18n } from "@/i18n/provider";

export default function LoginPage() {
  const router = useRouter();
  const { locale, t } = useI18n();
  const [email, setEmail] = useState("alex@profile.link");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [locked, setLocked] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");
  const [reviewSending, setReviewSending] = useState(false);
  const [reviewSent, setReviewSent] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setReviewError(null);
    setLocked(false);
    setReviewSent(false);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
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

  return (
    <MarketingShell active="/connexion">
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-gutter py-space-xl">
        <div className="w-full max-w-md">
          <div className="text-center mb-space-lg flex flex-col items-center gap-space-sm">
            <Logo href={`/${locale}`} />
            <h1 className="text-headline-xl-mobile md:text-headline-xl text-on-surface font-bold">
              {t("auth.login.title")}
            </h1>
            <p className="text-body-md text-on-surface-variant">
              {t("auth.login.subtitle")}
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

            {locked ? (
              <div className="rounded-xl border border-outline-variant/25 bg-surface-container-low/80 p-space-md flex flex-col gap-space-sm">
                <p className="text-body-sm text-on-surface font-semibold">
                  {t("auth.login.reviewTitle")}
                </p>
                <p className="text-body-sm text-on-surface-variant">
                  {t("auth.login.reviewBody")}
                </p>
                {reviewSent ? (
                  <p className="text-body-sm text-primary font-semibold">
                    {t("auth.login.reviewSent")}
                  </p>
                ) : (
                  <>
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
                      <p role="alert" className="text-body-sm text-error">
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
                  </>
                )}
              </div>
            ) : null}

            <Input
              label={t("auth.login.email")}
              type="email"
              name="email"
              autoComplete="email"
              placeholder={t("auth.login.emailPh")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
            <Input
              label={t("auth.login.password")}
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
            <p className="text-body-sm text-on-surface-variant">
              {t("auth.login.demo")}
            </p>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t("auth.login.loading") : t("auth.login.submit")}
            </Button>
            <p className="text-center text-body-sm text-on-surface-variant">
              {t("auth.login.noAccount")}{" "}
              <LocaleLink
                locale={locale}
                href="/inscription"
                className="text-primary font-semibold hover:underline"
              >
                {t("auth.login.create")}
              </LocaleLink>
            </p>
          </form>
        </div>
      </div>
    </MarketingShell>
  );
}
