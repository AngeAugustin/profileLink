import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import {
  clearFailedLogins,
  createSession,
  recordFailedLogin,
  verifyPassword,
} from "@/lib/auth";
import { audit } from "@/lib/audit-log";
import { jsonError } from "@/i18n/api";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = schema.parse(body);
    const ip = clientIp(request);
    const emailKey = data.email.toLowerCase();

    const byIp = rateLimit(`login:ip:${ip}`, 20, 15 * 60_000);
    if (!byIp.ok) {
      audit({
        category: "SECURITY",
        level: "WARN",
        action: "auth.login.rate_limited",
        message: `Login rate-limited for ${emailKey}`,
        request,
        statusCode: 429,
        meta: { email: emailKey },
      });
      return jsonError("api.rateLimited", 429, { retryAfter: byIp.retryAfterSec });
    }

    const user = await prisma.user.findUnique({
      where: { email: emailKey },
    });

    if (user?.lockedAt) {
      audit({
        category: "SECURITY",
        level: "WARN",
        action: "auth.login.locked",
        message: `Login blocked — account locked (${emailKey})`,
        actor: { id: user.id, email: user.email, role: user.role },
        request,
        statusCode: 403,
      });
      return jsonError("api.accountLocked", 403);
    }

    if (!user || !(await verifyPassword(data.password, user.passwordHash))) {
      if (user) {
        const locked = await recordFailedLogin(user.id);
        audit({
          category: "SECURITY",
          level: locked ? "ERROR" : "WARN",
          action: locked ? "auth.login.locked_after_failures" : "auth.login.failed",
          message: locked
            ? `Account locked after failed logins (${emailKey})`
            : `Failed login for ${emailKey}`,
          actor: { id: user.id, email: user.email, role: user.role },
          request,
          statusCode: locked ? 403 : 401,
          meta: { failedLoginCount: user.failedLoginCount + 1 },
        });
        if (locked) {
          return jsonError("api.accountLocked", 403);
        }
      } else {
        audit({
          category: "SECURITY",
          level: "WARN",
          action: "auth.login.failed",
          message: `Failed login for unknown email ${emailKey}`,
          request,
          statusCode: 401,
          meta: { email: emailKey },
        });
      }
      return jsonError("api.badCredentials", 401);
    }

    await clearFailedLogins(user.id);
    await createSession(user.id);

    audit({
      category: "AUTH",
      action: "auth.login.success",
      message: `User signed in (${user.email})`,
      actor: { id: user.id, email: user.email, role: user.role },
      request,
      statusCode: 200,
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        role: user.role,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError("api.invalid", 400);
    }
    console.error(error);
    return jsonError("api.server", 500);
  }
}
