"use client";

import { Button } from "@/components/ui/Button";
import { useI18n } from "@/i18n/provider";

export default function NotFound() {
  const { t } = useI18n();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-gutter text-center gap-space-md">
      <p className="text-label-md text-tertiary-container uppercase tracking-wider font-semibold">
        404
      </p>
      <h1 className="text-headline-xl-mobile md:text-headline-xl text-on-surface font-bold">
        {t("notFound.title")}
      </h1>
      <p className="text-body-md text-on-surface-variant max-w-md">
        {t("notFound.body")}
      </p>
      <Button href="/">{t("notFound.home")}</Button>
    </div>
  );
}
