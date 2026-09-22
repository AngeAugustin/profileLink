import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { notifyProfileCreated, notifyPlanLimitReached } from "@/lib/notifications";
import { jsonError } from "@/i18n/api";

function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

const createSchema = z.object({
  firstName: z.string().min(1).max(60),
  lastName: z.string().min(1).max(60),
  title: z.string().max(120).optional(),
  slug: z.string().min(2).max(60).optional(),
});

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return jsonError("api.unauthorized", 401);
  }

  const profiles = await prisma.profile.findMany({
    where: { userId: user.id },
    orderBy: [{ isPrimary: "desc" }, { updatedAt: "desc" }],
    select: {
      id: true,
      slug: true,
      firstName: true,
      lastName: true,
      title: true,
      avatarUrl: true,
      status: true,
      isPrimary: true,
      views: true,
      clicks: true,
      qrScans: true,
      updatedAt: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ profiles });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return jsonError("api.unauthorized", 401);
  }

  try {
    const body = await request.json();
    const data = createSchema.parse(body);

    if (user.plan === "FREE") {
      const count = await prisma.profile.count({ where: { userId: user.id } });
      if (count >= 1) {
        await notifyPlanLimitReached(user.id).catch(() => undefined);
        return jsonError("api.freePlanLimit", 403);
      }
    }

    let slug =
      data.slug?.trim() ||
      slugify(`${data.firstName}-${data.lastName}`) ||
      `profil-${Date.now()}`;

    const taken = await prisma.profile.findUnique({ where: { slug } });
    if (taken) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;

    const existingCount = await prisma.profile.count({ where: { userId: user.id } });

    const profile = await prisma.profile.create({
      data: {
        userId: user.id,
        slug,
        firstName: data.firstName,
        lastName: data.lastName,
        title: data.title ?? "",
        isPrimary: existingCount === 0,
        email: user.email,
      },
    });

    await notifyProfileCreated(user.id, profile).catch(() => undefined);

    return NextResponse.json({ profile }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError("api.invalid", 400);
    }
    console.error(error);
    return jsonError("api.server", 500);
  }
}
