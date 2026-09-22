import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { recordProfileView } from "@/lib/notifications";
import { jsonError } from "@/i18n/api";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: Params) {
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

  if (!profile) {
    return jsonError("api.notFound", 404);
  }

  const updated = await recordProfileView(profile.id);

  return NextResponse.json({
    profile: {
      ...profile,
      views: updated.views,
    },
  });
}
