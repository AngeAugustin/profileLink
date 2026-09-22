"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { useI18n, useT } from "@/i18n/provider";

type AccountUser = {
  id: string;
  email: string;
  name: string | null;
  plan: "FREE" | "PRO" | "TEAM";
  role: string;
  createdAt: string;
};

export default function AccountPage() {
  return (
    <AppShell>
      <AccountContent />
    </AppShell>
  );
}

function AccountContent() {
  const { toast } = useToast();
  const t = useT();
  const { locale } = useI18n();

  const [user, setUser] = useState<AccountUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [infoError, setInfoError] = useState<string | null>(null);
  const [infoSaving, setInfoSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSaving, setPasswordSaving] = useState(false);

  useEffect(() => {
    void fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const next = data?.user as AccountUser | undefined;
        if (next) {
          setUser(next);
          setName(next.name ?? "");
          setEmail(next.email);
        }
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function saveInfo(e: React.FormEvent) {
    e.preventDefault();
    setInfoError(null);
    setInfoSaving(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setInfoError(data.error ?? t("api.server"));
        return;
      }
      setUser(data.user);
      setName(data.user.name ?? "");
      setEmail(data.user.email);
      toast(t("app.account.updated"));
    } catch {
      setInfoError(t("common.networkError"));
    } finally {
      setInfoSaving(false);
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError(null);

    if (newPassword !== confirmPassword) {
      setPasswordError(t("app.account.passwordMismatch"));
      return;
    }

    setPasswordSaving(true);
    try {
      const res = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPasswordError(data.error ?? t("api.server"));
        return;
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast(t("app.account.passwordChanged"));
    } catch {
      setPasswordError(t("common.networkError"));
    } finally {
      setPasswordSaving(false);
    }
  }

  const memberSince = user
    ? new Date(user.createdAt).toLocaleDateString(
        locale === "en" ? "en-US" : "fr-FR",
        { year: "numeric", month: "long", day: "numeric" },
      )
    : "";

  return (
    <div className="flex flex-col w-full gap-space-xl">
      <div>
        <h1 className="text-headline-lg text-on-surface font-bold">
          {t("app.account.title")}
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">
          {t("app.account.subtitle")}
        </p>
      </div>

      {loading ? (
        <p className="text-body-md text-on-surface-variant">{t("app.account.loading")}</p>
      ) : !user ? (
        <p className="text-body-md text-on-surface-variant">{t("api.unauthorized")}</p>
      ) : (
        <>
          <section className="rounded-xl bg-surface-container-lowest shadow-sm p-space-lg flex flex-col gap-space-md">
            <div className="flex items-center justify-between gap-space-md flex-wrap">
              <div className="flex items-center gap-space-sm">
                <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Icon name="person" />
                </div>
                <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">
                  {t("app.account.info")}
                </h2>
              </div>
              <Badge tone="tertiary" className="uppercase tracking-wider">
                {user.plan}
              </Badge>
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm text-body-sm">
              <div className="rounded-lg bg-surface-container-low px-space-md py-space-sm">
                <dt className="text-on-surface-variant">{t("app.account.plan")}</dt>
                <dd className="font-semibold text-on-surface mt-0.5">{user.plan}</dd>
              </div>
              <div className="rounded-lg bg-surface-container-low px-space-md py-space-sm">
                <dt className="text-on-surface-variant">{t("app.account.memberSince")}</dt>
                <dd className="font-semibold text-on-surface mt-0.5">{memberSince}</dd>
              </div>
            </dl>

            <form onSubmit={(e) => void saveInfo(e)} className="flex flex-col gap-space-md">
              {infoError ? (
                <div className="rounded-lg bg-error-container text-on-error-container px-space-md py-space-sm text-body-sm">
                  {infoError}
                </div>
              ) : null}
              <Input
                label={t("app.account.displayName")}
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
                maxLength={80}
              />
              <Input
                label={t("app.account.email")}
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button
                type="submit"
                variant="brand"
                size="sm"
                className="self-start"
                disabled={infoSaving}
              >
                {infoSaving ? t("app.account.saving") : t("app.account.save")}
              </Button>
            </form>
          </section>

          <section className="rounded-xl bg-surface-container-lowest shadow-sm p-space-lg flex flex-col gap-space-md">
            <div className="flex items-center gap-space-sm">
              <div className="w-9 h-9 rounded-lg bg-secondary-container text-primary flex items-center justify-center">
                <Icon name="lock" />
              </div>
              <div>
                <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">
                  {t("app.account.password")}
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {t("app.account.passwordSubtitle")}
                </p>
              </div>
            </div>

            <form
              onSubmit={(e) => void changePassword(e)}
              className="flex flex-col gap-space-md"
            >
              {passwordError ? (
                <div className="rounded-lg bg-error-container text-on-error-container px-space-md py-space-sm text-body-sm">
                  {passwordError}
                </div>
              ) : null}
              <Input
                label={t("app.account.currentPassword")}
                name="currentPassword"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
              <Input
                label={t("app.account.newPassword")}
                name="newPassword"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
              />
              <Input
                label={t("app.account.confirmPassword")}
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
              />
              <Button
                type="submit"
                variant="brand"
                size="sm"
                className="self-start"
                disabled={passwordSaving}
              >
                {passwordSaving
                  ? t("app.account.changingPassword")
                  : t("app.account.changePassword")}
              </Button>
            </form>
          </section>
        </>
      )}
    </div>
  );
}
