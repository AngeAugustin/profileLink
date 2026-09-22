import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { jsonError } from "@/i18n/api";
import { isPlanId } from "@/lib/admin-catalog";
import { getPlanPriceMap } from "@/lib/plan-offers";

export async function GET(request: Request) {
  try {
    const admin = await getSessionUser();
    if (!admin) return jsonError("api.unauthorized", 401);
    if (admin.role !== "ADMIN") return jsonError("api.forbidden", 403);

    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") ?? "").trim();
    const planParam = searchParams.get("plan");
    const planFilter =
      planParam && isPlanId(planParam.toUpperCase())
        ? planParam.toUpperCase()
        : null;

    const where = {
      ...(planFilter ? { plan: planFilter as "FREE" | "PRO" | "TEAM" } : {}),
      ...(q
        ? {
            OR: [
              { email: { contains: q, mode: "insensitive" as const } },
              { name: { contains: q, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [users, totalAccounts, planGroups, totalProfiles, publishedProfiles, lockedAccounts] =
      await Promise.all([
        prisma.user.findMany({
          where,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            email: true,
            name: true,
            plan: true,
            role: true,
            lockedAt: true,
            failedLoginCount: true,
            createdAt: true,
            _count: { select: { profiles: true } },
          },
        }),
        prisma.user.count(),
        prisma.user.groupBy({
          by: ["plan"],
          _count: { _all: true },
        }),
        prisma.profile.count(),
        prisma.profile.count({ where: { status: "PUBLISHED" } }),
        prisma.user.count({ where: { lockedAt: { not: null } } }),
      ]);

    const byPlan = { FREE: 0, PRO: 0, TEAM: 0 };
    for (const row of planGroups) {
      byPlan[row.plan] = row._count._all;
    }

    const prices = await getPlanPriceMap();
    const simulatedMrr =
      byPlan.FREE * prices.FREE +
      byPlan.PRO * prices.PRO +
      byPlan.TEAM * prices.TEAM;

    return NextResponse.json({
      users: users.map((u) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        plan: u.plan,
        role: u.role,
        lockedAt: u.lockedAt,
        failedLoginCount: u.failedLoginCount,
        profiles: u._count.profiles,
        createdAt: u.createdAt,
      })),
      stats: {
        totalAccounts,
        lockedAccounts,
        byPlan,
        paidAccounts: byPlan.PRO + byPlan.TEAM,
        totalProfiles,
        publishedProfiles,
        simulatedMrr,
      },
    });
  } catch (error) {
    console.error(error);
    return jsonError("api.server", 500);
  }
}
