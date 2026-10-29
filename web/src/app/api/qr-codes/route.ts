import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { generateQrCode, qrScanStats, serializeQr } from "@/lib/qr-codes";
import { jsonError } from "@/i18n/api";
import { createQrSchema } from "./schema";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return jsonError("api.unauthorized", 401);
  }

  const rows = await prisma.qrCode.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
  });
  const stats = await qrScanStats(rows.map((r) => r.id));

  return NextResponse.json({
    qrCodes: rows.map((r) => ({ ...serializeQr(r), daily: stats.daily[r.id] ?? [] })),
    stats: { since: stats.since, total: stats.total, devices: stats.devices, cities: stats.cities },
    plan: user.plan,
  });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return jsonError("api.unauthorized", 401);
  }

  try {
    const data = createQrSchema.parse(await request.json());

    if (data.dynamic && user.plan === "FREE") {
      return jsonError("api.dynamicQrPro", 403);
    }

    const qr = await prisma.qrCode.create({
      data: {
        userId: user.id,
        name: data.name,
        destination: data.destination,
        dynamic: data.dynamic,
        style: data.style,
        code: await generateQrCode(),
      },
    });

    return NextResponse.json({ qrCode: serializeQr(qr) }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError("api.invalid", 400);
    }
    console.error(error);
    return jsonError("api.server", 500);
  }
}
