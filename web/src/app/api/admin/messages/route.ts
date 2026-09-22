import { NextResponse } from "next/server";
import type { ContactMessageStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { jsonError } from "@/i18n/api";

const STATUSES = new Set<ContactMessageStatus>(["NEW", "READ", "ARCHIVED"]);

export async function GET(request: Request) {
  try {
    const admin = await getSessionUser();
    if (!admin) return jsonError("api.unauthorized", 401);
    if (admin.role !== "ADMIN") return jsonError("api.forbidden", 403);

    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") ?? "").trim();
    const statusParam = (searchParams.get("status") ?? "").toUpperCase();
    const statusFilter =
      statusParam && STATUSES.has(statusParam as ContactMessageStatus)
        ? (statusParam as ContactMessageStatus)
        : null;

    const where: Prisma.ContactMessageWhereInput = {
      ...(statusFilter ? { status: statusFilter } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
              { subject: { contains: q, mode: "insensitive" } },
              { body: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [messages, total, newCount] = await Promise.all([
      prisma.contactMessage.findMany({
        where,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          subject: true,
          body: true,
          status: true,
          locale: true,
          readAt: true,
          createdAt: true,
        },
      }),
      prisma.contactMessage.count({ where }),
      prisma.contactMessage.count({ where: { status: "NEW" } }),
    ]);

    return NextResponse.json({
      messages: messages.map((m) => ({
        ...m,
        preview: m.body.slice(0, 140),
      })),
      stats: { total, newCount },
    });
  } catch (error) {
    console.error(error);
    return jsonError("api.server", 500);
  }
}
