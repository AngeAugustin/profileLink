import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { createSession, hashPassword } from "@/lib/auth";
import { audit } from "@/lib/audit-log";
import { notifyWelcome } from "@/lib/notifications";
import { jsonError } from "@/i18n/api";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = schema.parse(body);
    const ip = clientIp(request);

    const limited = rateLimit(`register:ip:${ip}`, 5, 60 * 60_000);
    if (!limited.ok) {
      return jsonError("api.rateLimited", 429, {
        retryAfter: limited.retryAfterSec,
      });
    }

    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });
    if (existing) {
      return jsonError("api.emailTaken", 409);
    }

    const passwordHash = await hashPassword(data.password);
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        passwordHash,
        plan: "FREE",
      },
      select: { id: true, email: true, name: true, plan: true, role: true },
    });

    await createSession(user.id);
    await notifyWelcome(user.id).catch(() => undefined);

    audit({
      category: "AUTH",
      action: "auth.register",
      message: `New account created (${user.email})`,
      actor: { id: user.id, email: user.email, role: user.role },
      request,
      statusCode: 201,
      meta: { plan: user.plan },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError("api.invalid", 400, { details: error.flatten() });
    }
    console.error(error);
    return jsonError("api.server", 500);
  }
}
