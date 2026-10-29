"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";
import { useSidebar } from "@/components/layout/SidebarContext";
import { ASSETS } from "@/lib/mock-data";
import { cn } from "@/lib/cn";
import { localizedPath } from "@/i18n/path";
import { useI18n } from "@/i18n/provider";

type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  plan: "FREE" | "PRO" | "TEAM";
  role: string;
};

function isActive(pathname: string, href: string, locale: string) {
  const full = localizedPath(locale as "fr" | "en", href);
  if (href === "/app") {
    return pathname === full || pathname === `/${locale}/app`;
  }
  return pathname === full || pathname.startsWith(`${full}/`);
}

export function AppSidebar() {
  const pathname = usePathname();
  const { locale, t } = useI18n();
  const { collapsed, toggle, mobileOpen, closeMobile } = useSidebar();
  const [user, setUser] = useState<SessionUser | null>(null);

  const nav = [
    { href: "/app", label: t("app.nav.dashboard"), icon: "grid_view" },
    { href: "/app/profils", label: t("app.nav.profiles"), icon: "account_box" },
    { href: "/app/statistiques", label: t("app.nav.stats"), icon: "insights" },
    { href: "/app/parametres", label: t("app.nav.settings"), icon: "settings" },
    { href: "/app/aide", label: t("app.nav.help"), icon: "help" },
  ];

  useEffect(() => {
    void fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setUser(data?.user ?? null))
      .catch(() => setUser(null));
  }, [pathname]);

  // Close drawer after navigation on mobile/tablet.
  useEffect(() => {
    closeMobile();
  }, [pathname, closeMobile]);

  const showLabels = mobileOpen || !collapsed;

  return (
    <aside
      id="app-sidebar"
      className={cn(
        "fixed left-0 top-0 h-full bg-surface-container-lowest border-r border-outline-variant/30 z-50 flex flex-col justify-between shadow-[0_1px_3px_0_rgba(15,23,42,0.05)] transition-transform duration-200 ease-out lg:transition-[width] lg:duration-200",
        // Mobile / tablet: off-canvas drawer
        "w-[min(18rem,88vw)]",
        mobileOpen ? "translate-x-0" : "-translate-x-full",
        // Desktop: always visible, width by collapse state
        "lg:translate-x-0",
        collapsed ? "lg:w-16" : "lg:w-64",
      )}
    >
      <div className="flex flex-col flex-1 min-h-0">
        <div
          className={cn(
            "h-16 border-b border-outline-variant/20 flex items-center gap-2",
            showLabels ? "px-space-md justify-between" : "px-space-sm justify-center",
          )}
        >
          <Logo
            href={localizedPath(locale, "/app")}
            compact={!showLabels}
          />
          <div className="flex items-center gap-1">
            {showLabels ? (
              <button
                type="button"
                onClick={toggle}
                aria-label={t("app.nav.collapse")}
                className="hidden lg:inline-flex p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
              >
                <Icon name="left_panel_close" className="text-[20px]" />
              </button>
            ) : null}
            <button
              type="button"
              onClick={closeMobile}
              aria-label={t("common.close")}
              className="lg:hidden p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
            >
              <Icon name="close" className="text-[20px]" />
            </button>
          </div>
        </div>
        <nav
          className={cn(
            "flex-1 py-space-md flex flex-col gap-space-xs overflow-y-auto",
            showLabels ? "px-space-sm" : "px-space-xs items-center",
          )}
        >
          {!showLabels ? (
            <button
              type="button"
              onClick={toggle}
              aria-label={t("app.nav.expand")}
              title={t("app.nav.expand")}
              className="hidden lg:flex items-center justify-center w-10 h-10 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
            >
              <Icon name="left_panel_open" className="text-[20px]" />
            </button>
          ) : null}
          {nav.map((item) => {
            const active = isActive(pathname, item.href, locale);
            return (
              <Link
                key={item.href}
                href={localizedPath(locale, item.href)}
                title={!showLabels ? item.label : undefined}
                aria-label={!showLabels ? item.label : undefined}
                onClick={closeMobile}
                className={cn(
                  "flex items-center rounded-lg transition-all font-semibold text-label-md",
                  showLabels
                    ? "gap-space-sm px-space-md py-2.5"
                    : "justify-center w-10 h-10",
                  active
                    ? "bg-primary-container text-on-primary font-bold"
                    : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface",
                )}
              >
                <Icon name={item.icon} className="text-[20px] shrink-0" />
                {showLabels ? <span className="truncate">{item.label}</span> : null}
              </Link>
            );
          })}
        </nav>
      </div>
      <div
        className={cn(
          "border-t border-outline-variant/30 bg-surface-container-low",
          showLabels ? "p-space-sm space-y-space-xs" : "p-space-xs",
        )}
      >
        <Link
          href={localizedPath(locale, "/app/compte")}
          title={!showLabels ? (user?.name ?? t("app.nav.account")) : undefined}
          onClick={closeMobile}
          className={cn(
            "flex items-center rounded-lg bg-surface-container-lowest border border-outline-variant/30 hover:border-primary-container/50 transition-colors",
            showLabels
              ? "justify-between p-space-sm gap-space-sm"
              : "justify-center p-1.5",
          )}
        >
          <div className={cn("flex items-center min-w-0", showLabels && "gap-space-sm")}>
            <Image
              src={ASSETS.avatarUser}
              alt=""
              width={32}
              height={32}
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            />
            {showLabels ? (
              <div className="min-w-0">
                <p className="text-label-sm font-semibold text-on-surface truncate">
                  {user?.name ?? "…"}
                </p>
                <p className="font-mono text-[11px] text-on-surface-variant truncate">
                  {user?.email ?? ""}
                </p>
              </div>
            ) : null}
          </div>
          {showLabels && user ? (
            <Badge tone="tertiary" className="rounded uppercase tracking-wider shrink-0">
              {user.plan}
            </Badge>
          ) : null}
        </Link>
      </div>
    </aside>
  );
}
