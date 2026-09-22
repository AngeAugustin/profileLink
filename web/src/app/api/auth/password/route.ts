import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import {
  createSession,
  destroyAllSessions,
  getSessionUser,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";
import { audit } from "@/lib/audit-log";
import { jsonError } from "@/i18n/api";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  currentPassword: z.string().min(1).max(128),
  newPassword: z.string().min(8).max(128),
});

export async function POST(request: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return jsonError("api.unauthorized", 401);
    }

    const ip = clientIp(request);
    const limited = rateLimit(`password:${sessionUser.id}:${ip}`, 5, 15 * 60_000);
    if (!limited.ok) {
      return jsonError("api.rateLimited", 429, {
        retryAfter: limited.retryAfterSec,
      });
    }

    const body = await request.json();
    const data = schema.parse(body);

    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: { id: true, passwordHash: true },
    });
    if (!user) {
      return jsonError("api.unauthorized", 401);
    }

    const valid = await verifyPassword(data.currentPassword, user.passwordHash);
    if (!valid) {
      audit({
        category: "SECURITY",
        level: "WARN",
        action: "auth.password.wrong",
        message: `Wrong current password for ${sessionUser.email}`,
        actor: {
          id: sessionUser.id,
          email: sessionUser.email,
          role: sessionUser.role,
        },
        request,
        statusCode: 400,
      });
      return jsonError("api.wrongPassword", 400);
    }

    const passwordHash = await hashPassword(data.newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    await destroyAllSessions(user.id);
    await createSession(user.id);

    audit({
      category: "SECURITY",
      action: "auth.password.changed",
      message: `Password changed for ${sessionUser.email} — all sessions revoked`,
      actor: {
        id: sessionUser.id,
        email: sessionUser.email,
        role: sessionUser.role,
      },
      request,
      statusCode: 200,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError("api.invalid", 400, { details: error.flatten() });
    }
    console.error(error);
    return jsonError("api.server", 500);
  }
}
