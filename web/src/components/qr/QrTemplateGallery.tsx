"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useT } from "@/i18n/provider";
import { cn } from "@/lib/cn";
import { QR_TEMPLATES, templateStyle, type QrTemplate } from "@/lib/qr-style";
import { QrSvg } from "./QrSvg";
import { templateGround } from "./QrStudio";

type Category = "all" | QrTemplate["category"];
const CATEGORIES: Category[] = ["all", "minimal", "gradient", "color", "dark", "framed"];

export function QrTemplateGallery({ text, onUse }: { text: string; onUse: (id: string) => void }) {
  const t = useT();
  const [category, setCategory] = useState<Category>("all");
  const items = QR_TEMPLATES.filter((tpl) => category === "all" || tpl.category === category);

  return (
    <div className="flex flex-col gap-space-lg">
      <div role="group" aria-label={t("app.qrStudio.templates.title")} className="flex flex-wrap gap-space-xs">
        {CATEGORIES.map((c) => {
          const count = c === "all" ? QR_TEMPLATES.length : QR_TEMPLATES.filter((tpl) => tpl.category === c).length;
          return (
            <button
              key={c}
              type="button"
              aria-pressed={category === c}
              onClick={() => setCategory(c)}
              className={cn(
                "h-9 rounded-full border px-space-md text-label-sm transition-colors",
                category === c
                  ? "border-on-surface bg-on-surface text-surface"
                  : "border-outline-variant/50 bg-surface-container-lowest text-on-surface-variant hover:text-on-surface",
              )}
            >
              {t(`app.qrStudio.categories.${c}`)}
              <span className="ml-1.5 font-mono opacity-60">{count}</span>
            </button>
          );
        })}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-space-sm sm:gap-space-md">
        {items.map((tpl) => {
          const style = templateStyle(tpl.id);
          const ground = templateGround(style);
          const name = t(`app.qrStudio.templates.names.${tpl.id}`);
          return (
            <article
              key={tpl.id}
              className="flex flex-col gap-space-sm rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-space-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div
                className="relative aspect-square rounded-xl"
                style={{ background: ground ?? "var(--color-surface-container-low)" }}
              >
                <QrSvg text={text} style={{ ...style, margin: ground ? 0 : 2 }} title={name} fit className="absolute inset-[11%] !h-auto !w-auto" />
              </div>
              <div className="flex items-center justify-between gap-space-xs px-1">
                <h3 className="text-label-md text-on-surface">{name}</h3>
                <Badge>{t(`app.qrStudio.categories.${tpl.category}`)}</Badge>
              </div>
              <Button variant="outline" size="sm" onClick={() => onUse(tpl.id)}>
                {t("app.qrStudio.templates.use")}
              </Button>
            </article>
          );
        })}
      </div>
    </div>
  );
}
