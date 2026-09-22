"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type SidebarContextValue = {
  collapsed: boolean;
  toggle: () => void;
  setCollapsed: (value: boolean) => void;
  /** Mobile/tablet off-canvas drawer */
  mobileOpen: boolean;
  openMobile: () => void;
  closeMobile: () => void;
  toggleMobile: () => void;
};

const SidebarContext = createContext<SidebarContextValue | null>(null);

const LG_QUERY = "(min-width: 1024px)";

export function SidebarProvider({
  children,
  storageKey = "profilelink.sidebar.collapsed",
}: {
  children: React.ReactNode;
  storageKey?: string;
}) {
  const [collapsed, setCollapsedState] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    try {
      setCollapsedState(window.localStorage.getItem(storageKey) === "1");
    } catch {
      // ignore
    }
  }, [storageKey]);

  useEffect(() => {
    const mq = window.matchMedia(LG_QUERY);
    const onChange = () => {
      if (mq.matches) setMobileOpen(false);
    };
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileOpen]);

  const setCollapsed = useCallback(
    (value: boolean) => {
      setCollapsedState(value);
      try {
        window.localStorage.setItem(storageKey, value ? "1" : "0");
      } catch {
        // ignore
      }
    },
    [storageKey],
  );

  const toggle = useCallback(() => {
    setCollapsedState((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(storageKey, next ? "1" : "0");
      } catch {
        // ignore
      }
      return next;
    });
  }, [storageKey]);

  const openMobile = useCallback(() => setMobileOpen(true), []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);
  const toggleMobile = useCallback(() => setMobileOpen((v) => !v), []);

  const value = useMemo(
    () => ({
      collapsed,
      toggle,
      setCollapsed,
      mobileOpen,
      openMobile,
      closeMobile,
      toggleMobile,
    }),
    [
      collapsed,
      toggle,
      setCollapsed,
      mobileOpen,
      openMobile,
      closeMobile,
      toggleMobile,
    ],
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    throw new Error("useSidebar must be used within SidebarProvider");
  }
  return ctx;
}
