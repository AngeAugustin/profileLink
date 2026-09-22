import { NextResponse } from "next/server";
import type { Prisma, UnlockRequestStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { jsonError } from "@/i18n/api";

const STATUSES = new Set<UnlockRequestStatus>([
  "PENDING",
  "APPROVED",
  "REJECTED",
]);

export async function GET(request: Request) {
  try {
    const admin = await getSessionUser();
    if (!admin) return jsonError("api.unauthorized", 401);
    if (admin.role !== "ADMIN") return jsonError("api.forbidden", 403);

    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") ?? "").trim();
    const userId = (searchParams.get("userId") ?? "").trim() || null;
    const statusParam = (searchParams.get("status") ?? "").toUpperCase();
    const statusFilter =
      statusParam && STATUSES.has(statusParam as UnlockRequestStatus)
        ? (statusParam as UnlockRequestStatus)
        : null;

    const where: Prisma.UnlockRequestWhereInput = {
      ...(userId ? { userId } : {}),
      ...(statusFilter ? { status: statusFilter } : {}),
      ...(q
        ? {
            OR: [
              { message: { contains: q, mode: "insensitive" } },
              { user: { email: { contains: q, mode: "insensitive" } } },
              { user: { name: { contains: q, mode: "insensitive" } } },
            ],
          }
        : {}),
    };

    const [requests, total, pendingCount] = await Promise.all([
      prisma.unlockRequest.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              lockedAt: true,
              failedLoginCount: true,
            },
          },
        },
      }),
      prisma.unlockRequest.count({ where }),
      prisma.unlockRequest.count({
        where: {
          status: "PENDING",
          ...(userId ? { userId } : {}),
        },
      }),
    ]);

    return NextResponse.json({
      requests,
      stats: { total, pendingCount },
    });
  } catch (error) {
    console.error(error);
    return jsonError("api.server", 500);
  }
}
