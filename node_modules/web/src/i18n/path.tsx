import Link from "next/link";
import type { Locale } from "./config";

/** Prefix an internal path with the active locale. */
export function localizedPath(locale: Locale, path: string) {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (clean === "/") return `/${locale}`;
  return `/${locale}${clean}`;
}

export function LocaleLink({
  locale,
  href,
  children,
  className,
  ...rest
}: {
  locale: Locale;
  href: string;
  children: React.ReactNode;
  className?: string;
} & Omit<React.ComponentProps<typeof Link>, "href">) {
  const isExternal =
    href.startsWith("http") ||
    href.startsWith("mailto:") ||
    href.startsWith("#");
  return (
    <Link
      href={isExternal ? href : localizedPath(locale, href)}
      className={className}
      {...rest}
    >
      {children}
    </Link>
  );
}
