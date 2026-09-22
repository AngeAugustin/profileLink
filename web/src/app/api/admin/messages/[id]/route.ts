import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { jsonError } from "@/i18n/api";

const updateSchema = z.object({
  status: z.enum(["NEW", "READ", "ARCHIVED"]),
});

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const admin = await getSessionUser();
    if (!admin) return jsonError("api.unauthorized", 401);
    if (admin.role !== "ADMIN") return jsonError("api.forbidden", 403);

    const { id } = await params;
    const message = await prisma.contactMessage.findUnique({
      where: { id },
    });

    if (!message) return jsonError("api.notFound", 404);

    return NextResponse.json({ message });
  } catch (error) {
    console.error(error);
    return jsonError("api.server", 500);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const admin = await getSessionUser();
    if (!admin) return jsonError("api.unauthorized", 401);
    if (admin.role !== "ADMIN") return jsonError("api.forbidden", 403);

    const { id } = await params;
    const body = await request.json();
    const data = updateSchema.parse(body);

    const existing = await prisma.contactMessage.findUnique({ where: { id } });
    if (!existing) return jsonError("api.notFound", 404);

    const message = await prisma.contactMessage.update({
      where: { id },
      data: {
        status: data.status,
        readAt:
          data.status === "READ"
            ? existing.readAt ?? new Date()
            : data.status === "NEW"
              ? null
              : existing.readAt,
      },
    });

    return NextResponse.json({ message });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError("api.invalid", 400, { details: error.flatten() });
    }
    console.error(error);
    return jsonError("api.server", 500);
  }
}
