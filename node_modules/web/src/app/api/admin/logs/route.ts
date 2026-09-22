import { NextResponse } from "next/server";
import type { AuditLogCategory, AuditLogLevel, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { jsonError } from "@/i18n/api";

const CATEGORIES = new Set<AuditLogCategory>([
  "AUTH",
  "SECURITY",
  "ADMIN",
  "CONTACT",
  "PROFILE",
  "BILLING",
  "SYSTEM",
]);

const LEVELS = new Set<AuditLogLevel>(["INFO", "WARN", "ERROR"]);

export async function GET(request: Request) {
  try {
    const admin = await getSessionUser();
    if (!admin) return jsonError("api.unauthorized", 401);
    if (admin.role !== "ADMIN") return jsonError("api.forbidden", 403);

    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") ?? "").trim();
    const categoryParam = (searchParams.get("category") ?? "").toUpperCase();
    const levelParam = (searchParams.get("level") ?? "").toUpperCase();
    const take = Math.min(
      200,
      Math.max(1, Number(searchParams.get("limit") ?? 100) || 100),
    );

    const category =
      categoryParam && CATEGORIES.has(categoryParam as AuditLogCategory)
        ? (categoryParam as AuditLogCategory)
        : null;
    const level =
      levelParam && LEVELS.has(levelParam as AuditLogLevel)
        ? (levelParam as AuditLogLevel)
        : null;

    const where: Prisma.AuditLogWhereInput = {
      ...(category ? { category } : {}),
      ...(level ? { level } : {}),
      ...(q
        ? {
            OR: [
              { message: { contains: q, mode: "insensitive" } },
              { action: { contains: q, mode: "insensitive" } },
              { actorEmail: { contains: q, mode: "insensitive" } },
              { ip: { contains: q, mode: "insensitive" } },
              { city: { contains: q, mode: "insensitive" } },
              { country: { contains: q, mode: "insensitive" } },
              { path: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [logs, total, byCategory] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take,
      }),
      prisma.auditLog.count({ where }),
      prisma.auditLog.groupBy({
        by: ["category"],
        _count: { _all: true },
      }),
    ]);

    const categoryCounts = Object.fromEntries(
      byCategory.map((row) => [row.category, row._count._all]),
    );

    return NextResponse.json({
      logs,
      stats: {
        total,
        returned: logs.length,
        byCategory: categoryCounts,
      },
    });
  } catch (error) {
    console.error(error);
    return jsonError("api.server", 500);
  }
}
