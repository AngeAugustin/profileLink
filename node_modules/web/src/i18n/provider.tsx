"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import type { Locale } from "./config";
import type { Dictionary } from "./get-dictionary";
import { t as translate } from "./get-dictionary";

type I18nContextValue = {
  locale: Locale;
  dict: Dictionary;
  t: (path: string, vars?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  locale,
  dict,
  children,
}: {
  locale: Locale;
  dict: Dictionary;
  children: ReactNode;
}) {
  const t = useCallback(
    (path: string, vars?: Record<string, string | number>) =>
      translate(dict, path, vars),
    [dict],
  );

  const value = useMemo(
    () => ({ locale, dict, t }),
    [locale, dict, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

export function useT() {
  return useI18n().t;
}
