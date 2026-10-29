"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { ToastProvider } from "@/components/ui/Toast";
import { useT } from "@/i18n/provider";
import { templateStyle } from "@/lib/qr-style";
import { QrStudio, encodedTextFor, type QrStudioValue } from "./QrStudio";
import { QrTemplateGallery } from "./QrTemplateGallery";

/** Public, sign-up-free QR generator: everything happens in the browser. */
export function QrGeneratorPage() {
  return (
    <ToastProvider>
      <QrGenerator />
    </ToastProvider>
  );
}

function QrGenerator() {
  const t = useT();
  const studioRef = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState<QrStudioValue>({
    name: "",
    destination: t("marketing.qrGenerator.defaultUrl"),
    dynamic: false,
    style: templateStyle("brand"),
  });

  function useTemplate(id: string) {
    setValue((v) => ({ ...v, style: templateStyle(id) }));
    studioRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      <section className="max-w-7xl mx-auto px-gutter pt-space-xl pb-space-lg">
        <p className="font-mono text-label-sm uppercase tracking-widest text-on-surface-variant">
          {t("marketing.qrGenerator.eyebrow")}
        </p>
        <h1 className="mt-space-sm text-display-lg-mobile md:text-display-lg font-extrabold text-on-surface max-w-3xl text-balance">
          {t("marketing.qrGenerator.title")}{" "}
          <span className="text-primary-container">{t("marketing.qrGenerator.titleAccent")}</span>
        </h1>
        <p className="mt-space-md text-body-lg text-on-surface-variant max-w-2xl">{t("marketing.qrGenerator.subtitle")}</p>
        <ul className="mt-space-md flex flex-wrap gap-x-space-lg gap-y-space-xs text-body-sm text-on-surface-variant">
          {["reassure1", "reassure2", "reassure3"].map((k) => (
            <li key={k} className="flex items-center gap-1">
              <Icon name="check" className="text-[16px] text-tertiary-container" />
              {t(`marketing.qrGenerator.${k}`)}
            </li>
          ))}
        </ul>
      </section>

      <section ref={studioRef} className="max-w-[1400px] mx-auto px-gutter pb-space-xl scroll-mt-20">
        <QrStudio value={value} onChange={setValue} mode="public" canDynamic={false} />
      </section>

      <section className="border-t border-outline-variant/30 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-gutter py-space-xl flex flex-col gap-space-lg">
          <div>
            <h2 className="text-headline-xl-mobile md:text-headline-xl text-on-surface">
              {t("marketing.qrGenerator.galleryTitle")}
            </h2>
            <p className="mt-1 text-body-md text-on-surface-variant">{t("marketing.qrGenerator.gallerySubtitle")}</p>
          </div>
          <QrTemplateGallery text={encodedTextFor(value)} onUse={useTemplate} />
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-gutter py-space-xl">
        <div className="rounded-3xl bg-primary text-on-primary p-space-lg md:p-space-xl flex flex-col md:flex-row md:items-center justify-between gap-space-lg">
          <div className="max-w-2xl">
            <h2 className="text-headline-lg md:text-headline-xl">{t("marketing.qrGenerator.saveTitle")}</h2>
            <p className="mt-space-sm text-body-md text-on-primary-container">{t("marketing.qrGenerator.saveBody")}</p>
          </div>
          <Button href="/inscription" size="lg" className="shrink-0">
            {t("marketing.qrGenerator.saveCta")}
          </Button>
        </div>
      </section>
    </>
  );
}
