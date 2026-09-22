"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Icon } from "@/components/ui/Icon";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { useSidebar } from "@/components/layout/SidebarContext";
import { cn } from "@/lib/cn";
import { localizedPath } from "@/i18n/path";
import { useI18n, useT } from "@/i18n/provider";

type SessionUser = {
  name: string | null;
  email: string;
};

export function AdminTopBar() {
  const t = useT();
  const { locale } = useI18n();
  const { collapsed, mobileOpen, toggleMobile } = useSidebar();
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [open, setOpen] = useState(false);
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

  const initial = (user?.name || user?.email || "A").charAt(0).toUpperCase();

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
          aria-label={t("admin.openMenu")}
          aria-expanded={mobileOpen}
          aria-controls="admin-sidebar"
          onClick={toggleMobile}
          className="lg:hidden shrink-0 p-2 -ml-1 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
        >
          <Icon name="menu" className="text-[22px]" />
        </button>

        <div className="min-w-0">
          <p className="font-label-sm text-[11px] uppercase tracking-[0.14em] text-tertiary-container font-bold">
            {t("admin.administration")}
          </p>
          <p className="font-body-sm text-body-sm text-on-surface-variant truncate hidden xs:block sm:block">
            {t("admin.console")}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-0.5 sm:gap-space-sm shrink-0">
        <LanguageSwitcher className="hidden md:inline-flex" />
        <Link
          href={localizedPath(locale, "/app")}
          className="hidden sm:flex items-center gap-space-xs px-space-sm sm:px-space-md py-space-xs rounded-lg border border-outline-variant/50 text-on-surface hover:bg-surface-container font-label-sm text-label-sm transition-colors"
        >
          <Icon name="apps" className="text-[18px]" />
          <span className="hidden md:inline">{t("admin.backToApp")}</span>
        </Link>
        <div className="h-6 w-px bg-outline-variant/40 mx-1 hidden sm:block" />
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={open}
            aria-label={t("admin.menu.open")}
            onClick={() => setOpen((v) => !v)}
            className={cn(
              "w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-sm font-bold outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-primary-container",
              open && "ring-2 ring-primary-container/40",
            )}
          >
            {initial}
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
              <Link
                href={localizedPath(locale, "/app")}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-space-sm px-space-md py-2 text-label-md text-on-surface hover:bg-surface-container transition-colors sm:hidden"
              >
                <Icon name="apps" className="text-[18px] text-on-surface-variant" />
                {t("admin.backToApp")}
              </Link>
              <div className="my-space-xs border-t border-outline-variant/20 sm:hidden" />
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
                {t("admin.menu.logout")}
              </button>
            </div>
          ) : null}
        </div>
      </div>

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
