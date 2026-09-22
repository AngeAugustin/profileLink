"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { useSidebar } from "@/components/layout/SidebarContext";
import { cn } from "@/lib/cn";
import { localizedPath } from "@/i18n/path";
import { useI18n } from "@/i18n/provider";

type SessionUser = {
  name: string | null;
  email: string;
  role: string;
};

function isActive(pathname: string, href: string, locale: string) {
  const full = localizedPath(locale as "fr" | "en", href);
  if (href === "/admin" || href === "/admin/utilisateurs") {
    return (
      pathname === full ||
      pathname === localizedPath(locale as "fr" | "en", "/admin") ||
      pathname === localizedPath(locale as "fr" | "en", "/admin/utilisateurs") ||
      pathname.startsWith(
        `${localizedPath(locale as "fr" | "en", "/admin/utilisateurs")}/`,
      )
    );
  }
  return pathname === full || pathname.startsWith(`${full}/`);
}

export function AdminSidebar() {
  const pathname = usePathname();
  const { locale, t } = useI18n();
  const { collapsed, toggle, mobileOpen, closeMobile } = useSidebar();
  const [user, setUser] = useState<SessionUser | null>(null);

  const nav = [
    { href: "/admin/utilisateurs", label: t("admin.users"), icon: "group" },
    { href: "/admin/messages", label: t("admin.messages"), icon: "inbox" },
    { href: "/admin/logs", label: t("admin.logs"), icon: "receipt_long" },
    { href: "/admin/abonnements", label: t("admin.subscriptions"), icon: "credit_card" },
    { href: "/admin/statistiques", label: t("admin.stats"), icon: "monitoring" },
    { href: "/admin/templates", label: t("admin.templates"), icon: "dashboard_customize" },
  ];

  useEffect(() => {
    void fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setUser(data?.user ?? null))
      .catch(() => setUser(null));
  }, [pathname]);

  useEffect(() => {
    closeMobile();
  }, [pathname, closeMobile]);

  const showLabels = mobileOpen || !collapsed;

  return (
    <aside
      id="admin-sidebar"
      className={cn(
        "fixed left-0 top-0 h-full bg-surface-container-lowest border-r border-outline-variant/30 z-50 flex flex-col justify-between shadow-[0_1px_3px_0_rgba(15,23,42,0.05)] transition-transform duration-200 ease-out lg:transition-[width] lg:duration-200",
        "w-[min(18rem,88vw)]",
        mobileOpen ? "translate-x-0" : "-translate-x-full",
        "lg:translate-x-0",
        collapsed ? "lg:w-16" : "lg:w-64",
      )}
    >
      <div
        aria-hidden
        className="absolute left-0 top-0 bottom-0 w-[3px] bg-tertiary-container"
      />

      <div className="flex flex-col flex-1 min-h-0">
        <div
          className={cn(
            "h-16 border-b border-outline-variant/20 flex items-center gap-2",
            showLabels
              ? "px-space-md justify-between pl-[calc(var(--spacing-space-md,1rem)+3px)]"
              : "px-space-sm justify-center pl-[calc(var(--spacing-space-sm,0.75rem)+3px)]",
          )}
        >
          <Logo
            href={localizedPath(locale, "/admin/utilisateurs")}
            compact={!showLabels}
          />
          <div className="flex items-center gap-1 shrink-0">
            {showLabels ? (
              <>
                <Badge
                  tone="tertiary"
                  className="rounded uppercase tracking-wider shrink-0 text-[10px] hidden sm:inline-flex"
                >
                  {t("admin.badge")}
                </Badge>
                <button
                  type="button"
                  onClick={toggle}
                  aria-label={t("admin.collapse")}
                  className="hidden lg:inline-flex p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
                >
                  <Icon name="left_panel_close" className="text-[20px]" />
                </button>
              </>
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
              aria-label={t("admin.expand")}
              title={t("admin.expand")}
              className="hidden lg:flex items-center justify-center w-10 h-10 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
            >
              <Icon name="left_panel_open" className="text-[20px]" />
            </button>
          ) : (
            <p className="px-space-md pb-1 font-label-sm text-[11px] uppercase tracking-wider text-on-surface-variant">
              {t("admin.backOffice")}
            </p>
          )}
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
          showLabels ? "p-space-sm" : "p-space-xs",
        )}
      >
        <div
          className={cn(
            "flex items-center rounded-lg bg-surface-container-lowest border border-outline-variant/30",
            showLabels
              ? "justify-between p-space-sm gap-space-sm"
              : "justify-center p-1.5",
          )}
          title={!showLabels ? (user?.name ?? user?.email ?? undefined) : undefined}
        >
          <div className={cn("flex items-center min-w-0", showLabels && "gap-space-sm")}>
            <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-sm font-bold shrink-0">
              {(user?.name || user?.email || "A").charAt(0).toUpperCase()}
            </div>
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
          {showLabels && user?.role === "ADMIN" ? (
            <Badge
              tone="primary"
              className="rounded uppercase tracking-wider shrink-0 text-[10px]"
            >
              Admin
            </Badge>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
