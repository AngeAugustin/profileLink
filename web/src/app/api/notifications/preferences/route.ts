import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { jsonError } from "@/i18n/api";

const prefsSchema = z.object({
  emailAlerts: z.boolean(),
  weeklyDigest: z.boolean(),
  productTips: z.boolean(),
});

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return jsonError("api.unauthorized", 401);
  }

  const prefs = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      notifyEmailAlerts: true,
      notifyWeeklyDigest: true,
      notifyProductTips: true,
    },
  });

  if (!prefs) {
    return jsonError("api.unauthorized", 401);
  }

  return NextResponse.json({
    preferences: {
      emailAlerts: prefs.notifyEmailAlerts,
      weeklyDigest: prefs.notifyWeeklyDigest,
      productTips: prefs.notifyProductTips,
    },
  });
}

export async function PATCH(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return jsonError("api.unauthorized", 401);
  }

  try {
    const body = await request.json();
    const data = prefsSchema.parse(body);

    const prefs = await prisma.user.update({
      where: { id: user.id },
      data: {
        notifyEmailAlerts: data.emailAlerts,
        notifyWeeklyDigest: data.weeklyDigest,
        notifyProductTips: data.productTips,
      },
      select: {
        notifyEmailAlerts: true,
        notifyWeeklyDigest: true,
        notifyProductTips: true,
      },
    });

    return NextResponse.json({
      preferences: {
        emailAlerts: prefs.notifyEmailAlerts,
        weeklyDigest: prefs.notifyWeeklyDigest,
        productTips: prefs.notifyProductTips,
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
