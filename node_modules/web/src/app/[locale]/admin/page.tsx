"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { localizedPath } from "@/i18n/path";
import { useI18n } from "@/i18n/provider";

export default function AdminIndexPage() {
  const router = useRouter();
  const { locale } = useI18n();

  useEffect(() => {
    router.replace(localizedPath(locale, "/admin/utilisateurs"));
  }, [locale, router]);

  return null;
}
