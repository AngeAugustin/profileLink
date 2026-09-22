import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { jsonError } from "@/i18n/api";
import { PLAN_IDS } from "@/lib/admin-catalog";
import { ensurePlanOffers } from "@/lib/plan-offers";

export async function GET() {
  try {
    const admin = await getSessionUser();
    if (!admin) return jsonError("api.unauthorized", 401);
    if (admin.role !== "ADMIN") return jsonError("api.forbidden", 403);

    const [offers, planGroups] = await Promise.all([
      ensurePlanOffers(),
      prisma.user.groupBy({
        by: ["plan"],
        _count: { _all: true },
      }),
    ]);

    const priceByPlan = Object.fromEntries(
      offers.map((o) => [o.plan, o.priceMonthly]),
    ) as Record<(typeof PLAN_IDS)[number], number>;
    const nameByPlan = Object.fromEntries(
      offers.map((o) => [o.plan, o.name]),
    ) as Record<(typeof PLAN_IDS)[number], string>;

    const byPlan = { FREE: 0, PRO: 0, TEAM: 0 };
    for (const row of planGroups) {
      byPlan[row.plan] = row._count._all;
    }

    const plans = await Promise.all(
      PLAN_IDS.map(async (plan) => {
        const [users, profileTotal] = await Promise.all([
          prisma.user.findMany({
            where: { plan },
            orderBy: { createdAt: "desc" },
            take: 5,
            select: {
              id: true,
              name: true,
              email: true,
              createdAt: true,
              _count: { select: { profiles: true } },
            },
          }),
          prisma.profile.count({
            where: { user: { plan } },
          }),
        ]);

        const priceMonthly = priceByPlan[plan];
        return {
          id: plan,
          name: nameByPlan[plan],
          priceMonthly,
          accounts: byPlan[plan],
          profiles: profileTotal,
          mrr: byPlan[plan] * priceMonthly,
          recentUsers: users.map((u) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            profiles: u._count.profiles,
            createdAt: u.createdAt,
          })),
        };
      }),
    );

    const simulatedMrr = plans.reduce((sum, p) => sum + p.mrr, 0);

    return NextResponse.json({
      plans,
      simulatedMrr,
      totalAccounts: byPlan.FREE + byPlan.PRO + byPlan.TEAM,
      paidAccounts: byPlan.PRO + byPlan.TEAM,
    });
  } catch (error) {
    console.error(error);
    return jsonError("api.server", 500);
  }
}
