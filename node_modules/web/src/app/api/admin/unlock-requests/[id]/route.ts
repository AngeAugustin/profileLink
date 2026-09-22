import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSessionUser, unlockUserAccount } from "@/lib/auth";
import { audit } from "@/lib/audit-log";
import { jsonError } from "@/i18n/api";

const patchSchema = z.object({
  action: z.enum(["approve", "reject"]),
});

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const admin = await getSessionUser();
    if (!admin) return jsonError("api.unauthorized", 401);
    if (admin.role !== "ADMIN") return jsonError("api.forbidden", 403);

    const { id } = await params;
    const body = await request.json();
    const data = patchSchema.parse(body);

    const existing = await prisma.unlockRequest.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, lockedAt: true, email: true },
        },
      },
    });
    if (!existing) return jsonError("api.notFound", 404);
    if (existing.status !== "PENDING") {
      return jsonError("api.invalid", 400);
    }

    if (data.action === "approve") {
      await unlockUserAccount(existing.userId, admin.id);
      const updated = await prisma.unlockRequest.findUnique({
        where: { id },
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
      });
      audit({
        category: "ADMIN",
        action: "admin.unlock.approved",
        message: `Admin unlocked ${existing.user.email}`,
        actor: { id: admin.id, email: admin.email, role: admin.role },
        targetType: "User",
        targetId: existing.userId,
        request,
        statusCode: 200,
        meta: { unlockRequestId: id },
      });
      return NextResponse.json({ request: updated });
    }

    const updated = await prisma.unlockRequest.update({
      where: { id },
      data: {
        status: "REJECTED",
        reviewedAt: new Date(),
        reviewedById: admin.id,
      },
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
    });

    audit({
      category: "ADMIN",
      level: "WARN",
      action: "admin.unlock.rejected",
      message: `Admin rejected unlock for ${existing.user.email}`,
      actor: { id: admin.id, email: admin.email, role: admin.role },
      targetType: "User",
      targetId: existing.userId,
      request,
      statusCode: 200,
      meta: { unlockRequestId: id },
    });

    return NextResponse.json({ request: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError("api.invalid", 400, { details: error.flatten() });
    }
    console.error(error);
    return jsonError("api.server", 500);
  }
}
