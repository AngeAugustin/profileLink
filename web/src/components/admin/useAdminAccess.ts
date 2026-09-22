"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { localizedPath } from "@/i18n/path";
import { useI18n } from "@/i18n/provider";

export function useAdminAccess() {
  const router = useRouter();
  const { locale } = useI18n();
  const [ready, setReady] = useState(false);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled) return;
        if (data?.user?.role !== "ADMIN") {
          setForbidden(true);
          router.replace(localizedPath(locale, "/app"));
          return;
        }
        setReady(true);
      })
      .catch(() => {
        if (cancelled) return;
        setForbidden(true);
        router.replace(localizedPath(locale, "/connexion"));
      });
    return () => {
      cancelled = true;
    };
  }, [locale, router]);

  return { ready, forbidden };
}
