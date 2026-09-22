"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { localizedPath } from "@/i18n/path";
import { useI18n, useT } from "@/i18n/provider";
import { notificationIcon } from "@/lib/notifications-client";

export type AppNotification = {
  id: string;
  type: string;
  title: string;
  body: string;
  href: string | null;
  readAt: string | null;
  createdAt: string;
};

type NotificationsBellProps = {
  className?: string;
};

function formatRelative(iso: string, locale: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return locale === "en" ? "Just now" : "À l'instant";
  if (mins < 60) return locale === "en" ? `${mins}m ago` : `Il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return locale === "en" ? `${hours}h ago` : `Il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return locale === "en" ? `${days}d ago` : `Il y a ${days} j`;
  return date.toLocaleDateString(locale === "en" ? "en-GB" : "fr-FR", {
    day: "numeric",
    month: "short",
  });
}

export function NotificationsBell({ className }: NotificationsBellProps) {
  const t = useT();
  const { locale } = useI18n();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications?limit=15");
      if (!res.ok) return;
      const data = await res.json();
      setItems(data.notifications ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const id = window.setInterval(() => void load(), 60_000);
    return () => window.clearInterval(id);
  }, [load]);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
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

  async function markRead(id: string) {
    setItems((prev) =>
      prev.map((n) =>
        n.id === id && !n.readAt ? { ...n, readAt: new Date().toISOString() } : n,
      ),
    );
    setUnreadCount((c) => Math.max(0, c - 1));
    try {
      const res = await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
      if (res.ok) {
        const data = await res.json();
        if (typeof data.unreadCount === "number") setUnreadCount(data.unreadCount);
      }
    } catch {
      void load();
    }
  }

  async function markAllRead() {
    setItems((prev) =>
      prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })),
    );
    setUnreadCount(0);
    try {
      await fetch("/api/notifications/read-all", { method: "POST" });
    } catch {
      void load();
    }
  }

  return (
    <div className={cn("relative", className)} ref={panelRef}>
      <button
        type="button"
        aria-label={t("app.notifications.bellLabel")}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          const next = !open;
          setOpen(next);
          if (next) void load();
        }}
        className="relative p-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
      >
        <Icon name="notifications" className="text-[22px]" />
        {unreadCount > 0 ? (
          <span className="absolute top-1.5 right-1.5 min-w-4 h-4 px-1 rounded-full bg-tertiary-container text-on-tertiary text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label={t("app.notifications.title")}
          className="absolute right-0 mt-2 w-[min(100vw-2rem,22rem)] rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-lg z-50 overflow-hidden"
        >
          <div className="flex items-center justify-between gap-2 px-space-md py-space-sm border-b border-outline-variant/20">
            <div>
              <p className="text-label-md font-semibold text-on-surface">
                {t("app.notifications.title")}
              </p>
              <p className="text-[11px] text-on-surface-variant">
                {unreadCount > 0
                  ? t("app.notifications.unreadCount", { count: unreadCount })
                  : t("app.notifications.allRead")}
              </p>
            </div>
            {unreadCount > 0 ? (
              <button
                type="button"
                onClick={() => void markAllRead()}
                className="text-label-sm font-semibold text-primary hover:underline shrink-0"
              >
                {t("app.notifications.markAllRead")}
              </button>
            ) : null}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading && items.length === 0 ? (
              <p className="px-space-md py-space-lg text-body-sm text-on-surface-variant text-center">
                {t("common.loading")}
              </p>
            ) : items.length === 0 ? (
              <div className="px-space-md py-space-xl text-center">
                <Icon
                  name="notifications_off"
                  className="text-[28px] text-on-surface-variant/50 mx-auto"
                />
                <p className="mt-2 text-body-sm text-on-surface-variant">
                  {t("app.notifications.empty")}
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-outline-variant/15">
                {items.map((n) => {
                  const unread = !n.readAt;
                  const content = (
                    <>
                      <span
                        className={cn(
                          "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg",
                          unread
                            ? "bg-primary/10 text-primary"
                            : "bg-surface-container text-on-surface-variant",
                        )}
                      >
                        <Icon name={notificationIcon(n.type)} className="text-[18px]" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-start justify-between gap-2">
                          <span
                            className={cn(
                              "text-label-sm text-on-surface",
                              unread && "font-semibold",
                            )}
                          >
                            {n.title}
                          </span>
                          {unread ? (
                            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                          ) : null}
                        </span>
                        {n.body ? (
                          <span className="mt-0.5 block text-[12px] text-on-surface-variant line-clamp-2">
                            {n.body}
                          </span>
                        ) : null}
                        <span className="mt-1 block text-[11px] text-on-surface-variant">
                          {formatRelative(n.createdAt, locale)}
                        </span>
                      </span>
                    </>
                  );

                  return (
                    <li key={n.id}>
                      {n.href ? (
                        <Link
                          href={localizedPath(locale, n.href)}
                          onClick={() => {
                            if (unread) void markRead(n.id);
                            setOpen(false);
                          }}
                          className={cn(
                            "flex gap-space-sm px-space-md py-space-sm hover:bg-surface-container transition-colors",
                            unread && "bg-primary/[0.03]",
                          )}
                        >
                          {content}
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            if (unread) void markRead(n.id);
                          }}
                          className={cn(
                            "w-full flex gap-space-sm px-space-md py-space-sm text-left hover:bg-surface-container transition-colors",
                            unread && "bg-primary/[0.03]",
                          )}
                        >
                          {content}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="border-t border-outline-variant/20 px-space-md py-space-sm">
            <Link
              href={localizedPath(locale, "/app/parametres?tab=notifications")}
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-1.5 text-label-sm font-semibold text-primary hover:underline"
            >
              {t("app.notifications.viewAll")}
              <Icon name="arrow_forward" className="text-[16px]" />
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
