import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { defaultLocale, isLocale } from "@/i18n/config";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function AdminLayout({ children, params }: LayoutProps) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : defaultLocale;
  const user = await getSessionUser();

  if (!user) {
    redirect(`/${locale}/connexion`);
  }
  if (user.role !== "ADMIN") {
    redirect(`/${locale}/app`);
  }

  return children;
}
