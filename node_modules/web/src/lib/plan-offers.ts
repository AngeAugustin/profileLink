import { prisma } from "@/lib/db";
import { PLAN_IDS, type PlanId } from "@/lib/admin-catalog";

export const DEFAULT_PLAN_OFFERS: Record<
  PlanId,
  { name: string; priceMonthly: number }
> = {
  FREE: { name: "Gratuit", priceMonthly: 0 },
  PRO: { name: "Pro", priceMonthly: 7 },
  TEAM: { name: "Team", priceMonthly: 19 },
};

export type PlanOfferRow = {
  plan: PlanId;
  name: string;
  priceMonthly: number;
};

/** Ensures default rows exist, then returns all offers ordered FREE → PRO → TEAM. */
export async function ensurePlanOffers(): Promise<PlanOfferRow[]> {
  await Promise.all(
    PLAN_IDS.map((plan) =>
      prisma.planOffer.upsert({
        where: { plan },
        create: {
          plan,
          name: DEFAULT_PLAN_OFFERS[plan].name,
          priceMonthly: DEFAULT_PLAN_OFFERS[plan].priceMonthly,
        },
        update: {},
      }),
    ),
  );

  const rows = await prisma.planOffer.findMany();
  const byPlan = Object.fromEntries(rows.map((r) => [r.plan, r])) as Record<
    PlanId,
    (typeof rows)[number]
  >;

  return PLAN_IDS.map((plan) => ({
    plan,
    name: byPlan[plan]?.name ?? DEFAULT_PLAN_OFFERS[plan].name,
    priceMonthly: byPlan[plan]?.priceMonthly ?? DEFAULT_PLAN_OFFERS[plan].priceMonthly,
  }));
}

export async function getPlanPriceMap(): Promise<Record<PlanId, number>> {
  const offers = await ensurePlanOffers();
  return Object.fromEntries(
    offers.map((o) => [o.plan, o.priceMonthly]),
  ) as Record<PlanId, number>;
}

export async function getPlanOffer(plan: PlanId): Promise<PlanOfferRow> {
  const offers = await ensurePlanOffers();
  return offers.find((o) => o.plan === plan)!;
}

export async function updatePlanOffer(
  plan: PlanId,
  data: { name: string; priceMonthly: number },
): Promise<PlanOfferRow> {
  await ensurePlanOffers();
  const row = await prisma.planOffer.update({
    where: { plan },
    data: {
      name: data.name,
      priceMonthly: data.priceMonthly,
    },
  });
  return {
    plan: row.plan,
    name: row.name,
    priceMonthly: row.priceMonthly,
  };
}
