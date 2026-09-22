"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { localizedPath } from "@/i18n/path";
import { useI18n } from "@/i18n/provider";

const variants = {
  primary:
    "bg-tertiary-container hover:bg-tertiary text-on-tertiary shadow-sm hover:shadow-md",
  secondary:
    "bg-surface-container-lowest hover:bg-surface-container text-primary hover:text-primary-container shadow-sm",
  muted:
    "bg-surface-container hover:bg-surface-container-high text-on-surface",
  brand:
    "bg-primary-container hover:bg-primary text-on-primary shadow-sm",
  ghost:
    "bg-transparent hover:bg-surface-container text-on-surface-variant hover:text-on-surface",
  outline:
    "border border-outline-variant/50 text-on-surface hover:bg-surface-container bg-transparent",
} as const;

const sizes = {
  sm: "h-9 px-space-md text-label-sm gap-1.5",
  md: "h-11 px-space-md text-label-md gap-space-xs",
  lg: "h-12 px-space-lg text-label-md gap-space-xs py-3.5",
} as const;

type ButtonProps = {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  className?: string;
  children: React.ReactNode;
  href?: string;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  disabled?: boolean;
  target?: string;
  rel?: string;
};

function resolveHref(href: string | undefined, locale: string) {
  if (!href) return undefined;
  if (
    href.startsWith("http") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    href.startsWith("#")
  ) {
    return href;
  }
  return localizedPath(locale as "fr" | "en", href);
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  href,
  type = "button",
  onClick,
  disabled,
  target,
  rel,
}: ButtonProps) {
  const { locale } = useI18n();
  const classes = cn(
    "inline-flex items-center justify-center rounded-lg font-semibold transition-all active:scale-[0.98] disabled:opacity-50",
    variants[variant],
    sizes[size],
    className,
  );

  const resolved = resolveHref(href, locale);

  if (resolved) {
    return (
      <Link
        href={resolved}
        className={classes}
        onClick={onClick}
        target={target}
        rel={rel ?? (target === "_blank" ? "noopener noreferrer" : undefined)}
      >
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
