import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { syncProfileNested } from "@/lib/profile-sync";
import { notifyProfilePublished } from "@/lib/notifications";
import { jsonError } from "@/i18n/api";

type Params = { params: Promise<{ id: string }> };

const experienceSchema = z.object({
  title: z.string().min(1).max(120),
  company: z.string().min(1).max(120),
  location: z.string().max(120).optional(),
  startDate: z.string().min(1).max(40),
  endDate: z.string().max(40).optional().nullable(),
  current: z.boolean().optional(),
  highlights: z.string().max(4000).optional(),
  sortOrder: z.number().int().optional(),
});

const educationSchema = z.object({
  degree: z.string().min(1).max(160),
  school: z.string().min(1).max(160),
  field: z.string().max(120).optional(),
  year: z.string().min(1).max(20),
  note: z.string().max(500).optional(),
  sortOrder: z.number().int().optional(),
});

const certificationSchema = z.object({
  abbrev: z.string().max(20).optional(),
  title: z.string().min(1).max(160),
  issuer: z.string().max(120).optional(),
  status: z.string().max(120).optional(),
  url: z.string().url().optional().nullable(),
  sortOrder: z.number().int().optional(),
});

const skillSchema = z.object({
  label: z.string().min(1).max(80),
  tone: z.enum(["primary", "secondary"]).optional(),
  sortOrder: z.number().int().optional(),
});

const linkSchema = z.object({
  label: z.string().min(1).max(80),
  url: z.string().min(1).max(500),
  icon: z.string().max(40).optional(),
  visible: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

const interestSchema = z.object({
  label: z.string().min(1).max(80),
  sortOrder: z.number().int().optional(),
});

const languageSchema = z.object({
  label: z.string().min(1).max(80),
  level: z.string().max(40).optional(),
  sortOrder: z.number().int().optional(),
});

const projectSchema = z.object({
  title: z.string().min(1).max(160),
  role: z.string().max(120).optional(),
  description: z.string().max(4000).optional(),
  url: z.string().max(500).optional().nullable(),
  year: z.string().max(40).optional(),
  tags: z.string().max(240).optional(),
  sortOrder: z.number().int().optional(),
});

const updateSchema = z.object({
  firstName: z.string().min(1).max(60).optional(),
  lastName: z.string().min(1).max(60).optional(),
  title: z.string().max(120).optional(),
  bio: z.string().max(2000).optional(),
  location: z.string().max(120).optional(),
  email: z.string().email().optional().nullable().or(z.literal("")),
  phone: z.string().max(40).optional().nullable(),
  avatarUrl: z.string().url().optional().nullable().or(z.literal("")),
  coverUrl: z.string().url().optional().nullable().or(z.literal("")),
  theme: z.string().optional(),
  accent: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
  indexed: z.boolean().optional(),
  availability: z.string().max(160).optional().nullable(),
  slug: z
    .string()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  experiences: z.array(experienceSchema).optional(),
  projects: z.array(projectSchema).optional(),
  education: z.array(educationSchema).optional(),
  certifications: z.array(certificationSchema).optional(),
  skills: z.array(skillSchema).optional(),
  links: z.array(linkSchema).optional(),
  interests: z.array(interestSchema).optional(),
  languages: z.array(languageSchema).optional(),
});

async function getOwnedProfile(userId: string, id: string) {
  return prisma.profile.findFirst({
    where: { id, userId },
    include: {
      experiences: { orderBy: { sortOrder: "asc" } },
      projects: { orderBy: { sortOrder: "asc" } },
      education: { orderBy: { sortOrder: "asc" } },
      certifications: { orderBy: { sortOrder: "asc" } },
      skills: { orderBy: { sortOrder: "asc" } },
      links: { orderBy: { sortOrder: "asc" } },
      interests: { orderBy: { sortOrder: "asc" } },
      languages: { orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function GET(_request: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user) {
    return jsonError("api.unauthorized", 401);
  }

  const { id } = await params;
  const profile = await getOwnedProfile(user.id, id);
  if (!profile) {
    return jsonError("api.notFound", 404);
  }

  return NextResponse.json({ profile });
}

export async function PATCH(request: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user) {
    return jsonError("api.unauthorized", 401);
  }

  const { id } = await params;
  const existing = await prisma.profile.findFirst({ where: { id, userId: user.id } });
  if (!existing) {
    return jsonError("api.notFound", 404);
  }

  try {
    const raw = await request.json();
    const data = updateSchema.parse(raw);

    if (data.slug && data.slug !== existing.slug) {
      const taken = await prisma.profile.findUnique({ where: { slug: data.slug } });
      if (taken) {
        return jsonError("api.slugTaken", 409);
      }
    }

    const {
      experiences,
      projects,
      education,
      certifications,
      skills,
      links,
      interests,
      languages,
      email,
      avatarUrl,
      coverUrl,
      ...scalarFields
    } = data;

    await prisma.profile.update({
      where: { id },
      data: {
        ...scalarFields,
        email: email === "" ? null : email,
        avatarUrl: avatarUrl === "" ? null : avatarUrl,
        coverUrl: coverUrl === "" ? null : coverUrl,
      },
    });

    await syncProfileNested(id, {
      experiences,
      projects,
      education,
      certifications,
      skills,
      links,
      interests,
      languages,
    });

    const profile = await getOwnedProfile(user.id, id);

    if (
      profile &&
      data.status === "PUBLISHED" &&
      existing.status !== "PUBLISHED"
    ) {
      await notifyProfilePublished(user.id, profile).catch(() => undefined);
    }

    return NextResponse.json({ profile });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError("api.invalid", 400, { details: error.flatten() });
    }
    console.error(error);
    return jsonError("api.server", 500);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user) {
    return jsonError("api.unauthorized", 401);
  }

  const { id } = await params;
  const existing = await prisma.profile.findFirst({ where: { id, userId: user.id } });
  if (!existing) {
    return jsonError("api.notFound", 404);
  }

  await prisma.profile.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
