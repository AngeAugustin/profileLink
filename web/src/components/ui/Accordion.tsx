"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

type AccordionItem = {
  id: string;
  title: string;
  subtitle?: string;
  number?: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
};

export function AccordionSection({
  id,
  title,
  subtitle,
  number,
  defaultOpen = false,
  children,
}: AccordionItem) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section
      id={id}
      className="rounded-xl bg-surface-container-lowest shadow-sm overflow-hidden transition-all duration-200"
    >
      <button
        type="button"
        className="w-full px-space-lg py-space-md flex items-center justify-between bg-surface-container-lowest hover:bg-surface-container-low transition-colors text-left"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <div className="flex items-center gap-space-md">
          {typeof number === "number" ? (
            <span className="w-7 h-7 rounded-full bg-primary text-on-primary font-label-sm text-label-sm font-bold flex items-center justify-center shrink-0">
              {number}
            </span>
          ) : null}
          <div>
            <h2 className="font-headline-md text-[1.125rem] text-on-surface font-semibold">
              {title}
            </h2>
            {subtitle ? (
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>
        <Icon
          name={open ? "expand_less" : "expand_more"}
          className="text-on-surface-variant transition-transform"
        />
      </button>
      <div
        className={cn(
          "px-space-lg pb-space-lg pt-space-xs flex flex-col gap-space-md",
          !open && "hidden",
        )}
      >
        {children}
      </div>
    </section>
  );
}

type FaqAccordionProps = {
  items: { q: string; a: string }[];
};

export function FaqAccordion({ items }: FaqAccordionProps) {
  const [openId, setOpenId] = useState<number | null>(0);

  return (
    <div className="flex flex-col gap-space-sm max-w-3xl mx-auto">
      {items.map((item, index) => {
        const open = openId === index;
        return (
          <div
            key={item.q}
            className="rounded-xl bg-surface-container-lowest shadow-sm overflow-hidden"
          >
            <button
              type="button"
              className="w-full px-space-lg py-space-md flex items-center justify-between gap-space-md text-left hover:bg-surface-container-low transition-colors"
              onClick={() => setOpenId(open ? null : index)}
              aria-expanded={open}
            >
              <span className="font-headline-md text-[1.0625rem] text-on-surface font-semibold">
                {item.q}
              </span>
              <Icon
                name={open ? "expand_less" : "expand_more"}
                className="text-on-surface-variant shrink-0"
              />
            </button>
            {open ? (
              <div className="px-space-lg pb-space-lg">
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  {item.a}
                </p>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
