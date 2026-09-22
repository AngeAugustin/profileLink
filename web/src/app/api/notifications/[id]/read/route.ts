import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { jsonError } from "@/i18n/api";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(_request: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user) {
    return jsonError("api.unauthorized", 401);
  }

  const { id } = await params;
  if (!id || id.length > 64) {
    return jsonError("api.invalid", 400);
  }

  // Ownership enforced in where — never trust client userId.
  const result = await prisma.notification.updateMany({
    where: { id, userId: user.id, readAt: null },
    data: { readAt: new Date() },
  });

  if (result.count === 0) {
    const owned = await prisma.notification.findFirst({
      where: { id, userId: user.id },
      select: { id: true, readAt: true },
    });
    if (!owned) {
      return jsonError("api.notFound", 404);
    }
  }

  const unreadCount = await prisma.notification.count({
    where: { userId: user.id, readAt: null },
  });

  return NextResponse.json({ ok: true, unreadCount });
}
