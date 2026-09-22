import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSessionUser, unlockUserAccount } from "@/lib/auth";
import { audit } from "@/lib/audit-log";
import { jsonError } from "@/i18n/api";
import { ensurePlanOffers } from "@/lib/plan-offers";

const updateSchema = z.object({
  plan: z.enum(["FREE", "PRO", "TEAM"]).optional(),
  role: z.enum(["USER", "ADMIN"]).optional(),
  unlock: z.literal(true).optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const admin = await getSessionUser();
    if (!admin) return jsonError("api.unauthorized", 401);
    if (admin.role !== "ADMIN") return jsonError("api.forbidden", 403);

    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        role: true,
        lockedAt: true,
        failedLoginCount: true,
        createdAt: true,
        updatedAt: true,
        profiles: {
          orderBy: [{ isPrimary: "desc" }, { updatedAt: "desc" }],
          select: {
            id: true,
            slug: true,
            firstName: true,
            lastName: true,
            title: true,
            status: true,
            theme: true,
            views: true,
            clicks: true,
            qrScans: true,
            isPrimary: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!user) return jsonError("api.notFound", 404);

    const offers = await ensurePlanOffers();
    const planOffers = Object.fromEntries(
      offers.map((o) => [o.plan, { name: o.name, priceMonthly: o.priceMonthly }]),
    );

    return NextResponse.json({
      user: {
        ...user,
        profilesCount: user.profiles.length,
      },
      planOffers,
    });
  } catch (error) {
    console.error(error);
    return jsonError("api.server", 500);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const admin = await getSessionUser();
    if (!admin) return jsonError("api.unauthorized", 401);
    if (admin.role !== "ADMIN") return jsonError("api.forbidden", 403);

    const { id } = await params;
    const body = await request.json();
    const data = updateSchema.parse(body);

    if (!data.plan && !data.role && !data.unlock) {
      return jsonError("api.invalid", 400);
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) return jsonError("api.notFound", 404);

    if (existing.id === admin.id && data.role === "USER") {
      return jsonError("api.invalid", 400);
    }

    if (data.unlock) {
      await unlockUserAccount(id, admin.id);
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(data.plan ? { plan: data.plan } : {}),
        ...(data.role ? { role: data.role } : {}),
      },
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        role: true,
        lockedAt: true,
        failedLoginCount: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { profiles: true } },
      },
    });

    audit({
      category: "ADMIN",
      action: data.unlock
        ? "admin.user.unlocked"
        : data.plan
          ? "admin.user.plan_updated"
          : "admin.user.role_updated",
      message: data.unlock
        ? `Admin unlocked ${user.email}`
        : data.plan
          ? `Admin set plan ${user.plan} for ${user.email}`
          : `Admin set role ${user.role} for ${user.email}`,
      actor: { id: admin.id, email: admin.email, role: admin.role },
      targetType: "User",
      targetId: user.id,
      request,
      statusCode: 200,
      meta: {
        unlock: Boolean(data.unlock),
        plan: data.plan ?? null,
        role: data.role ?? null,
      },
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        role: user.role,
        lockedAt: user.lockedAt,
        failedLoginCount: user.failedLoginCount,
        profiles: user._count.profiles,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError("api.invalid", 400, { details: error.flatten() });
    }
    console.error(error);
    return jsonError("api.server", 500);
  }
}
