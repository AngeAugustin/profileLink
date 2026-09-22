"use client";

import { useState } from "react";
import { FinalCtaSection } from "@/components/landing/FinalCtaSection";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Input, Textarea } from "@/components/ui/Input";
import { LocaleLink } from "@/i18n/path";
import { useI18n } from "@/i18n/provider";

const SUPPORT_EMAIL = "hello@profilelink.me";

export function ContactPageContent() {
  const { locale, t } = useI18n();
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!res.ok) {
        setError(data.error ?? t("marketing.contact.sendError"));
        return;
      }
      setSent(true);
    } catch {
      setError(t("common.networkError"));
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setSent(false);
    setError(null);
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
  }

  const details = [
    {
      icon: "mail" as const,
      label: t("marketing.contact.email"),
      value: SUPPORT_EMAIL,
      href: `mailto:${SUPPORT_EMAIL}`,
    },
    {
      icon: "schedule" as const,
      label: t("marketing.contact.hours"),
      value: t("marketing.contact.hoursValue"),
    },
    {
      icon: "place" as const,
      label: t("marketing.contact.hq"),
      value: t("marketing.contact.hqValue"),
    },
  ];

  return (
    <>
      <section className="relative overflow-hidden border-b border-outline-variant/15">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_75%_60%_at_12%_0%,rgba(29,78,216,0.12),transparent_55%),radial-gradient(ellipse_50%_45%_at_92%_15%,rgba(163,57,0,0.05),transparent_50%),linear-gradient(180deg,#f7f9fb_0%,#eef2f8_52%,#f7f9fb_100%)]"
        />
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.32]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(15,23,42,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.04) 1px, transparent 1px)",
            backgroundSize: "52px 52px",
            maskImage:
              "radial-gradient(ellipse 70% 60% at 78% 35%, black 8%, transparent 72%)",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-gutter pt-space-xl pb-space-lg md:pb-space-xl">
          <div className="max-w-2xl text-center md:text-left mx-auto md:mx-0">
            <p className="text-label-sm font-semibold uppercase tracking-[0.14em] text-primary mb-space-sm animate-[resources-hero-in_0.5s_ease-out_both]">
              {t("marketing.contact.eyebrow")}
            </p>
            <h1 className="text-headline-xl-mobile md:text-headline-xl lg:text-[2.6rem] lg:leading-[1.12] text-on-surface font-extrabold tracking-tight animate-[resources-hero-in_0.55s_ease-out_0.05s_both]">
              {t("marketing.contact.title")}
            </h1>
            <p className="mt-space-sm text-body-md text-on-surface-variant max-w-xl mx-auto md:mx-0 animate-[resources-hero-in_0.55s_ease-out_0.1s_both]">
              {t("marketing.contact.subtitle")}
            </p>

            <div className="mt-space-md flex flex-wrap items-center justify-center md:justify-start gap-x-space-md gap-y-space-sm animate-[resources-hero-in_0.55s_ease-out_0.16s_both]">
              <span className="inline-flex items-center gap-2 text-label-sm font-semibold text-on-surface">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inset-0 rounded-full bg-emerald-500/40 animate-ping motion-reduce:animate-none" />
                  <span className="relative h-2 w-2 rounded-full bg-emerald-600" />
                </span>
                {t("marketing.contact.responseBadge")}
              </span>
              <span className="hidden sm:inline text-outline-variant/60" aria-hidden>
                ·
              </span>
              <p className="text-label-sm text-on-surface-variant">
                {t("marketing.contact.preferSelfServe")}{" "}
                <LocaleLink
                  locale={locale}
                  href="/faq"
                  className="font-semibold text-primary hover:text-primary-container underline-offset-2 hover:underline"
                >
                  {t("marketing.contact.linkFaq")}
                </LocaleLink>
                {" · "}
                <LocaleLink
                  locale={locale}
                  href="/aide"
                  className="font-semibold text-primary hover:text-primary-container underline-offset-2 hover:underline"
                >
                  {t("marketing.contact.linkHelp")}
                </LocaleLink>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-gutter py-space-xl w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-space-lg lg:gap-space-xl items-stretch">
          {/* Contact rail — continuous panel, not card stack */}
          <aside className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-on-primary-fixed via-primary to-primary-container text-on-primary p-space-lg md:p-space-xl shadow-[0_24px_60px_rgba(15,23,42,0.14)]">
            <div
              aria-hidden
              className="absolute -right-20 -top-24 w-64 h-64 rounded-full bg-tertiary-container/25 blur-3xl pointer-events-none"
            />
            <div
              aria-hidden
              className="absolute -left-16 bottom-0 w-48 h-48 rounded-full bg-on-primary/10 blur-2xl pointer-events-none"
            />

            <div className="relative z-10 flex flex-col h-full min-h-[22rem]">
              <p className="text-label-sm font-semibold uppercase tracking-[0.14em] text-on-primary/70">
                {t("marketing.contact.railTitle")}
              </p>
              <p className="mt-space-sm text-body-md text-on-primary-container max-w-sm">
                {t("marketing.contact.railBody")}
              </p>

              <div className="mt-space-lg flex-1 flex flex-col gap-0 divide-y divide-on-primary/15">
                {details.map((item) => {
                  const valueNode = item.href ? (
                    <a
                      href={item.href}
                      className="font-semibold text-[1.0625rem] tracking-tight text-on-primary hover:text-on-primary/90 underline-offset-4 hover:underline break-all"
                    >
                      {item.value}
                    </a>
                  ) : (
                    <p className="font-semibold text-[1.0625rem] tracking-tight text-on-primary">
                      {item.value}
                    </p>
                  );

                  return (
                    <div key={item.label} className="flex gap-space-md py-space-md first:pt-0 last:pb-0">
                      <span className="w-10 h-10 rounded-xl bg-on-primary/10 text-on-primary flex items-center justify-center shrink-0">
                        <Icon name={item.icon} />
                      </span>
                      <div className="min-w-0">
                        <p className="text-label-sm font-semibold uppercase tracking-[0.1em] text-on-primary/55">
                          {item.label}
                        </p>
                        <div className="mt-1">{valueNode}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Button
                href={`mailto:${SUPPORT_EMAIL}`}
                variant="primary"
                size="md"
                className="mt-space-lg w-full sm:w-auto self-start bg-tertiary-container hover:bg-tertiary text-on-tertiary"
              >
                {t("marketing.contact.emailCta")}
                <Icon name="arrow_forward" />
              </Button>
            </div>
          </aside>

          {/* Form surface — interaction container */}
          <div className="rounded-3xl border border-outline-variant/20 bg-surface-container-lowest shadow-[0_16px_40px_rgba(15,23,42,0.05)] p-space-lg md:p-space-xl">
            {sent ? (
              <div className="flex flex-col items-center text-center py-space-xl gap-space-sm min-h-[22rem] justify-center">
                <div className="w-14 h-14 rounded-2xl bg-emerald-600/10 text-emerald-700 flex items-center justify-center">
                  <Icon name="check_circle" className="text-[32px]" />
                </div>
                <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">
                  {t("marketing.contact.sentTitle")}
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm">
                  {t("marketing.contact.sentBody", { name, email })}
                </p>
                <div className="mt-space-md flex flex-col sm:flex-row gap-space-sm">
                  <Button type="button" variant="muted" onClick={resetForm}>
                    {t("marketing.contact.sendAnother")}
                  </Button>
                  <Button href="/" variant="outline">
                    {t("marketing.contact.backHome")}
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-space-md h-full">
                <div>
                  <h2 className="text-headline-md text-on-surface font-bold tracking-tight">
                    {t("marketing.contact.formTitle")}
                  </h2>
                  <p className="mt-1 text-body-sm text-on-surface-variant max-w-md">
                    {t("marketing.contact.formHint")}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                  <Input
                    label={t("marketing.contact.name")}
                    name="name"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t("marketing.contact.namePh")}
                    required
                    disabled={submitting}
                  />
                  <Input
                    label={t("marketing.contact.email")}
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("marketing.contact.emailPh")}
                    required
                    disabled={submitting}
                  />
                </div>
                <Input
                  label={t("marketing.contact.subject")}
                  name="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={t("marketing.contact.subjectPh")}
                  required
                  disabled={submitting}
                />
                <Textarea
                  label={t("marketing.contact.message")}
                  name="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t("marketing.contact.messagePh")}
                  rows={6}
                  required
                  minLength={10}
                  disabled={submitting}
                />

                {error ? (
                  <p
                    role="alert"
                    className="rounded-lg bg-error-container/40 text-on-error-container text-body-sm px-space-md py-space-sm"
                  >
                    {error}
                  </p>
                ) : null}

                <div className="mt-auto pt-space-sm flex flex-col sm:flex-row sm:items-center gap-space-md justify-between">
                  <p className="text-body-sm text-on-surface-variant order-2 sm:order-1">
                    {t("marketing.contact.privacyNote")}
                  </p>
                  <Button
                    type="submit"
                    size="md"
                    disabled={submitting}
                    className="order-1 sm:order-2 w-full sm:w-auto shrink-0"
                  >
                    {submitting
                      ? t("marketing.contact.submitting")
                      : t("marketing.contact.submit")}
                    {!submitting ? (
                      <Icon name="send" className="text-[18px]" />
                    ) : null}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      <FinalCtaSection />
    </>
  );
}
