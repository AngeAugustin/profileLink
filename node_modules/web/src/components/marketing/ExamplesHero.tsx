"use client";

import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { ASSETS } from "@/lib/mock-data";
import { useT } from "@/i18n/provider";

const STACK = [
  {
    src: ASSETS.avatarJean,
    labelKey: "product",
    rotate: "-6deg",
    z: 3,
    x: "8%",
  },
  {
    src: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=256&h=256&fit=crop&crop=face",
    labelKey: "consulting",
    rotate: "3deg",
    z: 2,
    x: "34%",
  },
  {
    src: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=256&h=256&fit=crop&crop=face",
    labelKey: "talks",
    rotate: "8deg",
    z: 1,
    x: "58%",
  },
] as const;

export function ExamplesHero() {
  const t = useT();

  return (
    <section className="relative overflow-hidden border-b border-outline-variant/15">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_75%_65%_at_85%_10%,rgba(29,78,216,0.11),transparent_55%),radial-gradient(ellipse_50%_45%_at_10%_80%,rgba(163,57,0,0.05),transparent_50%),linear-gradient(165deg,#f7f9fb_0%,#eef3f9_45%,#f7f9fb_100%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.3]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(15,23,42,0.07) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 75% 45%, black 15%, transparent 72%)",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-gutter pt-space-xl pb-space-xl">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] gap-space-xl items-center">
          <div className="text-center lg:text-left max-w-xl mx-auto lg:mx-0">
            <p className="text-label-sm font-semibold uppercase tracking-[0.14em] text-primary mb-space-sm">
              {t("marketing.examples.eyebrow")}
            </p>
            <h1 className="text-headline-xl-mobile md:text-headline-xl lg:text-[2.6rem] lg:leading-[1.12] text-on-surface font-extrabold tracking-tight">
              {t("marketing.examples.title")}
            </h1>
            <p className="mt-space-sm text-body-md text-on-surface-variant max-w-lg mx-auto lg:mx-0">
              {t("marketing.examples.subtitle")}
            </p>
            <div className="mt-space-md flex flex-col sm:flex-row gap-space-sm justify-center lg:justify-start">
              <Button href="#galerie" size="md">
                {t("marketing.examples.ctaBrowse")}
              </Button>
              <Button href="/inscription" variant="outline" size="md">
                {t("marketing.examples.ctaCreate")}
              </Button>
            </div>
          </div>

          {/* Soft portrait stack — gallery faces */}
          <div
            aria-hidden
            className="relative w-full max-w-md mx-auto lg:max-w-none h-[260px] md:h-[300px]"
          >
            <p className="absolute top-0 left-0 right-0 text-center lg:text-left text-label-sm text-on-surface-variant font-semibold tracking-wide mb-space-sm">
              {t("marketing.examples.stackLabel")}
            </p>
            <div className="absolute inset-x-0 top-8 bottom-0">
              {STACK.map((face) => (
                <div
                  key={face.labelKey}
                  className="absolute top-4 w-[42%] max-w-[168px] transition-transform duration-500 hover:-translate-y-1.5"
                  style={{
                    left: face.x,
                    zIndex: face.z,
                    transform: `rotate(${face.rotate})`,
                  }}
                >
                  <div className="rounded-2xl bg-surface-container-lowest/95 border border-outline-variant/20 shadow-[0_16px_40px_rgba(15,23,42,0.1)] p-2 backdrop-blur-sm">
                    <div className="relative aspect-[4/5] rounded-xl overflow-hidden">
                      <Image
                        src={face.src}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="168px"
                      />
                    </div>
                    <p className="mt-2 px-1 pb-0.5 text-center text-label-sm font-semibold text-on-surface truncate">
                      {t(`marketing.examples.${face.labelKey}`)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
