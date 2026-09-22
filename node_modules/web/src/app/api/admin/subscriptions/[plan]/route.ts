import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { jsonError } from "@/i18n/api";
import { isPlanId } from "@/lib/admin-catalog";
import { getPlanOffer, updatePlanOffer } from "@/lib/plan-offers";

type Params = { params: Promise<{ plan: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const admin = await getSessionUser();
    if (!admin) return jsonError("api.unauthorized", 401);
    if (admin.role !== "ADMIN") return jsonError("api.forbidden", 403);

    const { plan: raw } = await params;
    const plan = raw.toUpperCase();
    if (!isPlanId(plan)) return jsonError("api.notFound", 404);

    const [offer, users] = await Promise.all([
      getPlanOffer(plan),
      prisma.user.findMany({
        where: { plan },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          _count: { select: { profiles: true } },
        },
      }),
    ]);

    const profileTotal = await prisma.profile.count({
      where: { userId: { in: users.map((u) => u.id) } },
    });

    return NextResponse.json({
      plan: {
        id: plan,
        name: offer.name,
        priceMonthly: offer.priceMonthly,
        accounts: users.length,
        profiles: profileTotal,
        mrr: users.length * offer.priceMonthly,
      },
      users: users.map((u) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        profiles: u._count.profiles,
        createdAt: u.createdAt,
      })),
    });
  } catch (error) {
    console.error(error);
    return jsonError("api.server", 500);
  }
}

const patchSchema = z.object({
  name: z.string().trim().min(1).max(80),
  priceMonthly: z.number().min(0).max(100_000),
});

export async function PATCH(request: Request, { params }: Params) {
  try {
    const admin = await getSessionUser();
    if (!admin) return jsonError("api.unauthorized", 401);
    if (admin.role !== "ADMIN") return jsonError("api.forbidden", 403);

    const { plan: raw } = await params;
    const plan = raw.toUpperCase();
    if (!isPlanId(plan)) return jsonError("api.notFound", 404);

    const body = await request.json();
    const parsed = patchSchema.safeParse({
      name: body.name,
      priceMonthly:
        typeof body.priceMonthly === "string"
          ? Number(body.priceMonthly.replace(",", "."))
          : body.priceMonthly,
    });
    if (!parsed.success) return jsonError("api.invalid", 400);

    const offer = await updatePlanOffer(plan, {
      name: parsed.data.name,
      priceMonthly: Math.round(parsed.data.priceMonthly * 100) / 100,
    });

    return NextResponse.json({ plan: offer });
  } catch (error) {
    console.error(error);
    return jsonError("api.server", 500);
  }
}
