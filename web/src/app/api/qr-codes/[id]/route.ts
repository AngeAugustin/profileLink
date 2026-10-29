import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { qrScanStats, serializeQr } from "@/lib/qr-codes";
import { jsonError } from "@/i18n/api";
import { updateQrSchema } from "../schema";

type Params = { params: Promise<{ id: string }> };

async function findOwned(id: string, userId: string) {
  return prisma.qrCode.findFirst({ where: { id, userId } });
}

export async function GET(_request: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user) {
    return jsonError("api.unauthorized", 401);
  }

  const { id } = await params;
  const qr = await findOwned(id, user.id);
  if (!qr) {
    return jsonError("api.qrNotFound", 404);
  }

  const stats = await qrScanStats([qr.id]);
  return NextResponse.json({
    qrCode: { ...serializeQr(qr), daily: stats.daily[qr.id] ?? [] },
    stats: { since: stats.since, total: stats.total, devices: stats.devices, cities: stats.cities },
  });
}

export async function PATCH(request: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user) {
    return jsonError("api.unauthorized", 401);
  }

  const { id } = await params;
  const existing = await findOwned(id, user.id);
  if (!existing) {
    return jsonError("api.qrNotFound", 404);
  }

  try {
    const data = updateQrSchema.parse(await request.json());

    if (data.dynamic && !existing.dynamic && user.plan === "FREE") {
      return jsonError("api.dynamicQrPro", 403);
    }

    const qr = await prisma.qrCode.update({
      where: { id: existing.id },
      data: {
        name: data.name,
        destination: data.destination,
        dynamic: data.dynamic,
        style: data.style,
      },
    });

    return NextResponse.json({ qrCode: serializeQr(qr) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError("api.invalid", 400);
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
  const existing = await findOwned(id, user.id);
  if (!existing) {
    return jsonError("api.qrNotFound", 404);
  }

  await prisma.qrCode.delete({ where: { id: existing.id } });
  return NextResponse.json({ ok: true });
}
