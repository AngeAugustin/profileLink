import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { jsonError } from "@/i18n/api";
import { getPlanPriceMap } from "@/lib/plan-offers";

export async function GET() {
  try {
    const admin = await getSessionUser();
    if (!admin) return jsonError("api.unauthorized", 401);
    if (admin.role !== "ADMIN") return jsonError("api.forbidden", 403);

    const now = new Date();
    const days30 = new Date(now);
    days30.setDate(days30.getDate() - 30);
    const days7 = new Date(now);
    days7.setDate(days7.getDate() - 7);

    const [
      totalAccounts,
      newAccounts30d,
      newAccounts7d,
      planGroups,
      totalProfiles,
      publishedProfiles,
      draftProfiles,
      aggregates,
      recentUsers,
      topProfiles,
      themeGroups,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: days30 } } }),
      prisma.user.count({ where: { createdAt: { gte: days7 } } }),
      prisma.user.groupBy({ by: ["plan"], _count: { _all: true } }),
      prisma.profile.count(),
      prisma.profile.count({ where: { status: "PUBLISHED" } }),
      prisma.profile.count({ where: { status: "DRAFT" } }),
      prisma.profile.aggregate({
        _sum: { views: true, clicks: true, qrScans: true },
      }),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        select: {
          id: true,
          name: true,
          email: true,
          plan: true,
          createdAt: true,
        },
      }),
      prisma.profile.findMany({
        orderBy: { views: "desc" },
        take: 8,
        select: {
          id: true,
          slug: true,
          firstName: true,
          lastName: true,
          views: true,
          clicks: true,
          status: true,
          theme: true,
        },
      }),
      prisma.profile.groupBy({
        by: ["theme"],
        _count: { _all: true },
      }),
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

    const months: { key: string; label: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const next = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const count = await prisma.user.count({
        where: { createdAt: { gte: d, lt: next } },
      });
      months.push({ key, label: key, count });
    }

    return NextResponse.json({
      overview: {
        totalAccounts,
        newAccounts30d,
        newAccounts7d,
        paidAccounts: byPlan.PRO + byPlan.TEAM,
        simulatedMrr,
        totalProfiles,
        publishedProfiles,
        draftProfiles,
        totalViews: aggregates._sum.views ?? 0,
        totalClicks: aggregates._sum.clicks ?? 0,
        totalQrScans: aggregates._sum.qrScans ?? 0,
        byPlan,
      },
      signupsByMonth: months,
      recentUsers,
      topProfiles,
      themes: themeGroups.map((g) => ({
        id: g.theme,
        count: g._count._all,
      })),
    });
  } catch (error) {
    console.error(error);
    return jsonError("api.server", 500);
  }
}
