import { notFound } from "next/navigation";
import { PublicProfileView } from "@/components/public/PublicProfileView";
import { prisma } from "@/lib/db";
import { recordProfileView } from "@/lib/notifications";
import { getProfileTheme, resolveThemeTokens } from "@/lib/profile-themes";

type Props = { params: Promise<{ slug: string }> };

export default async function PublicProfilePage({ params }: Props) {
  const { slug } = await params;

  const profile = await prisma.profile.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: {
      experiences: { orderBy: { sortOrder: "asc" } },
      projects: { orderBy: { sortOrder: "asc" } },
      education: { orderBy: { sortOrder: "asc" } },
      certifications: { orderBy: { sortOrder: "asc" } },
      skills: { orderBy: { sortOrder: "asc" } },
      links: { where: { visible: true }, orderBy: { sortOrder: "asc" } },
      interests: { orderBy: { sortOrder: "asc" } },
      languages: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!profile) notFound();

  const [updated, themeRow] = await Promise.all([
    recordProfileView(profile.id),
    getProfileTheme(profile.theme),
  ]);

  const themeTokens = themeRow?.tokens ?? resolveThemeTokens(profile.theme);

  return (
    <PublicProfileView
      profile={{
        ...profile,
        views: updated.views,
      }}
      themeTokens={themeTokens}
    />
  );
}
