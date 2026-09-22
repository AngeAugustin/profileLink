"use client";

import Link from "next/link";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { FaqAccordion } from "@/components/ui/Accordion";
import { faqItems } from "@/lib/mock-data";
import { localizedPath } from "@/i18n/path";
import { useI18n, useT } from "@/i18n/provider";

export default function HelpPage() {
  const t = useT();
  const { locale } = useI18n();

  const topics = [
    {
      icon: "rocket_launch",
      title: t("app.help.quick"),
      blurb: t("app.help.quickBlurb"),
    },
    {
      icon: "qr_code_2",
      title: t("app.help.qr"),
      blurb: t("app.help.qrBlurb"),
    },
    {
      icon: "insights",
      title: t("app.help.analytics"),
      blurb: t("app.help.analyticsBlurb"),
    },
    {
      icon: "language",
      title: t("app.help.domain"),
      blurb: t("app.help.domainBlurb"),
    },
  ];

  return (
    <AppShell>
      <div className="flex flex-col w-full gap-space-xl">
        <div>
          <h1 className="text-headline-lg text-on-surface font-bold">
            {t("app.help.title")}
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            {t("app.help.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
          {topics.map((topic) => (
            <div
              key={topic.title}
              className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-space-sm">
                <Icon name={topic.icon} />
              </div>
              <h2 className="font-headline-md text-[1.0625rem] text-on-surface font-semibold">
                {topic.title}
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                {topic.blurb}
              </p>
            </div>
          ))}
        </div>

        <section>
          <h2 className="font-headline-md text-headline-md text-on-surface font-semibold mb-space-md">
            {t("app.help.faqTitle")}
          </h2>
          <FaqAccordion items={faqItems.slice(0, 3)} />
          <p className="mt-space-md text-body-sm text-on-surface-variant">
            {t("app.help.seeFaq")}{" "}
            <Link
              href={localizedPath(locale, "/faq")}
              className="text-primary font-semibold hover:underline"
            >
              {t("app.help.faqPage")}
            </Link>
            .
          </p>
        </section>

        <div className="rounded-2xl bg-primary-container text-on-primary p-space-lg flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
          <div>
            <h2 className="font-headline-md text-headline-md font-semibold">
              {t("app.help.needHuman")}
            </h2>
            <p className="font-body-sm text-body-sm text-on-primary-container mt-1">
              {t("app.help.sla")}
            </p>
          </div>
          <Button href="/contact" variant="primary">
            {t("app.help.contact")}
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
