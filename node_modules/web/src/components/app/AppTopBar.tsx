"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Icon } from "@/components/ui/Icon";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { NotificationsBell } from "@/components/app/NotificationsBell";
import { useSidebar } from "@/components/layout/SidebarContext";
import { ASSETS } from "@/lib/mock-data";
import { cn } from "@/lib/cn";
import { localizedPath } from "@/i18n/path";
import { useI18n, useT } from "@/i18n/provider";

type SessionUser = {
  name: string | null;
  email: string;
  role: string;
};

export function AppTopBar() {
  const t = useT();
  const { locale } = useI18n();
  const { collapsed, mobileOpen, toggleMobile } = useSidebar();
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setUser(data?.user ?? null))
      .catch(() => setUser(null));
  }, []);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const closeLogoutModal = useCallback(() => {
    if (!loggingOut) setLogoutOpen(false);
  }, [loggingOut]);

  async function confirmLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setLogoutOpen(false);
      router.push(localizedPath(locale, "/connexion"));
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  const menuItems = [
    {
      href: "/app/compte",
      label: t("app.topbar.menu.profile"),
      icon: "person",
    },
    {
      href: "/app/parametres",
      label: t("app.topbar.menu.preferences"),
      icon: "tune",
    },
    ...(user?.role === "ADMIN"
      ? [
          {
            href: "/admin/utilisateurs",
            label: t("app.topbar.menu.admin"),
            icon: "admin_panel_settings",
          },
        ]
      : []),
  ];

  return (
    <header
      className={cn(
        "fixed top-0 right-0 left-0 h-16 bg-surface-container-lowest/90 backdrop-blur-xl border-b border-outline-variant/30 z-40 px-4 sm:px-6 lg:px-gutter flex items-center justify-between gap-space-sm sm:gap-space-md transition-[left] duration-200 ease-out",
        collapsed ? "lg:left-16" : "lg:left-64",
      )}
    >
      <div className="flex items-center gap-space-xs sm:gap-space-sm flex-1 min-w-0">
        <button
          type="button"
          aria-label={t("app.nav.openMenu")}
          aria-expanded={mobileOpen}
          aria-controls="app-sidebar"
          onClick={toggleMobile}
          className="lg:hidden shrink-0 p-2 -ml-1 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
        >
          <Icon name="menu" className="text-[22px]" />
        </button>

        {/* Desktop / tablet landscape search */}
        <div className="relative hidden sm:block flex-1 max-w-lg">
          <Icon
            name="search"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]"
          />
          <input
            className="w-full h-10 pl-10 pr-space-md rounded-lg bg-surface-container-low border border-outline-variant/40 font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant focus:border-primary-container focus:bg-surface-container-lowest outline-none transition-all"
            placeholder={t("app.topbar.search")}
            type="search"
          />
        </div>

        {/* Mobile search toggle */}
        <button
          type="button"
          aria-label={t("app.topbar.search")}
          aria-expanded={searchOpen}
          onClick={() => setSearchOpen((v) => !v)}
          className="sm:hidden shrink-0 p-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
        >
          <Icon name={searchOpen ? "close" : "search"} className="text-[22px]" />
        </button>
      </div>

      <div className="flex items-center gap-0.5 sm:gap-space-sm shrink-0">
        <LanguageSwitcher className="hidden md:inline-flex" />
        <NotificationsBell />
        <div className="h-6 w-px bg-outline-variant/40 mx-1 hidden sm:block" />
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={open}
            aria-label={t("app.topbar.menu.open")}
            onClick={() => setOpen((v) => !v)}
            className={cn(
              "rounded-full outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-primary-container",
              open && "ring-2 ring-primary-container/40",
            )}
          >
            <Image
              src={ASSETS.avatarUser}
              alt=""
              width={32}
              height={32}
              className="w-8 h-8 rounded-full object-cover border border-outline-variant/40"
            />
          </button>
          {open ? (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-56 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-lg py-space-xs z-50"
            >
              {user ? (
                <div className="px-space-md py-space-sm border-b border-outline-variant/20 mb-space-xs">
                  <p className="text-label-sm font-semibold text-on-surface truncate">
                    {user.name ?? "…"}
                  </p>
                  <p className="font-mono text-[11px] text-on-surface-variant truncate">
                    {user.email}
                  </p>
                </div>
              ) : null}
              <div className="md:hidden px-space-md py-space-xs border-b border-outline-variant/20 mb-space-xs">
                <LanguageSwitcher className="w-full justify-start" />
              </div>
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={localizedPath(locale, item.href)}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-space-sm px-space-md py-2 text-label-md text-on-surface hover:bg-surface-container transition-colors"
                >
                  <Icon name={item.icon} className="text-[18px] text-on-surface-variant" />
                  {item.label}
                </Link>
              ))}
              <div className="my-space-xs border-t border-outline-variant/20" />
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  setLogoutOpen(true);
                }}
                className="w-full flex items-center gap-space-sm px-space-md py-2 text-label-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
              >
                <Icon name="logout" className="text-[18px]" />
                {t("app.topbar.menu.logout")}
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {/* Mobile expanded search row */}
      {searchOpen ? (
        <div className="absolute inset-x-0 top-16 z-30 border-b border-outline-variant/30 bg-surface-container-lowest px-4 py-3 sm:hidden shadow-sm">
          <div className="relative">
            <Icon
              name="search"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]"
            />
            <input
              autoFocus
              className="w-full h-11 pl-10 pr-space-md rounded-lg bg-surface-container-low border border-outline-variant/40 font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant focus:border-primary-container focus:bg-surface-container-lowest outline-none"
              placeholder={t("app.topbar.search")}
              type="search"
            />
          </div>
        </div>
      ) : null}

      <ConfirmModal
        open={logoutOpen}
        tone="danger"
        title={t("common.logoutConfirm.title")}
        description={t("common.logoutConfirm.description")}
        confirmLabel={t("common.logoutConfirm.confirm")}
        confirming={loggingOut}
        onConfirm={() => void confirmLogout()}
        onCancel={closeLogoutModal}
      />
    </header>
  );
}
