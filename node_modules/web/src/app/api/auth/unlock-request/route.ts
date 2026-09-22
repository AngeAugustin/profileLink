import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { audit } from "@/lib/audit-log";
import { jsonError } from "@/i18n/api";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  email: z.string().email(),
  message: z.string().trim().max(1000).optional(),
});

export async function POST(request: Request) {
  try {
    const ip = clientIp(request);
    const limited = rateLimit(`unlock-request:ip:${ip}`, 5, 60 * 60_000);
    if (!limited.ok) {
      return jsonError("api.rateLimited", 429, {
        retryAfter: limited.retryAfterSec,
      });
    }

    const body = await request.json();
    const data = schema.parse(body);
    const email = data.email.toLowerCase();

    const byEmail = rateLimit(`unlock-request:email:${email}`, 3, 60 * 60_000);
    if (!byEmail.ok) {
      return jsonError("api.rateLimited", 429, {
        retryAfter: byEmail.retryAfterSec,
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, lockedAt: true, email: true },
    });

    if (!user?.lockedAt) {
      return jsonError("api.invalid", 400);
    }

    const existing = await prisma.unlockRequest.findFirst({
      where: { userId: user.id, status: "PENDING" },
      select: { id: true },
    });
    if (existing) {
      return jsonError("api.unlockRequestPending", 409);
    }

    const requestRow = await prisma.unlockRequest.create({
      data: {
        userId: user.id,
        message: data.message?.trim() || "",
      },
      select: { id: true },
    });

    audit({
      category: "SECURITY",
      action: "security.unlock_request.created",
      message: `Unlock review requested by ${email}`,
      actor: { id: user.id, email: user.email },
      targetType: "UnlockRequest",
      targetId: requestRow.id,
      request,
      statusCode: 201,
      meta: { hasMessage: Boolean(data.message?.trim()) },
    });

    return NextResponse.json({ ok: true, id: requestRow.id }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError("api.invalid", 400, { details: error.flatten() });
    }
    console.error(error);
    return jsonError("api.server", 500);
  }
}
