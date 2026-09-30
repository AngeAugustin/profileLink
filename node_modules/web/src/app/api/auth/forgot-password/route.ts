import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { audit } from "@/lib/audit-log";
import { jsonError } from "@/i18n/api";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  email: z.string().email().max(254),
});

/**
 * Always returns success to avoid email enumeration.
 * Real mail delivery can be wired later; we still audit when a user exists.
 */
export async function POST(request: Request) {
  try {
    const ip = clientIp(request);
    const limited = rateLimit(`forgot-password:ip:${ip}`, 8, 60 * 60_000);
    if (!limited.ok) {
      return jsonError("api.rateLimited", 429, {
        retryAfter: limited.retryAfterSec,
      });
    }

    const body = await request.json();
    const data = schema.parse(body);
    const email = data.email.toLowerCase().trim();

    const byEmail = rateLimit(`forgot-password:email:${email}`, 3, 60 * 60_000);
    if (!byEmail.ok) {
      return jsonError("api.rateLimited", 429, {
        retryAfter: byEmail.retryAfterSec,
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, lockedAt: true },
    });

    if (user) {
      audit({
        category: "SECURITY",
        action: "auth.forgot_password.requested",
        message: `Password reset requested for ${user.email}`,
        actor: { id: user.id, email: user.email },
        request,
        statusCode: 200,
        meta: { locked: Boolean(user.lockedAt) },
      });
    } else {
      audit({
        category: "SECURITY",
        level: "INFO",
        action: "auth.forgot_password.unknown_email",
        message: `Password reset requested for unknown email`,
        request,
        statusCode: 200,
        meta: { emailDomain: email.split("@")[1] ?? null },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError("api.invalid", 400, { details: error.flatten() });
    }
    console.error(error);
    return jsonError("api.server", 500);
  }
}
