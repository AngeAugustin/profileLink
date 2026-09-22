import { redirect } from "next/navigation";
import { defaultLocale, isLocale } from "@/i18n/config";

type PageProps = {
  params: Promise<{ locale: string }>;
};

/** Legacy route → utilisateurs tab */
export default async function AdminUnlockRequestsRedirect({ params }: PageProps) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : defaultLocale;
  redirect(`/${locale}/admin/utilisateurs?tab=examens`);
}
