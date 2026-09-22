import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { audit } from "@/lib/audit-log";
import { jsonError, resolveApiLocale } from "@/i18n/api";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(160),
  subject: z.string().trim().min(2).max(160),
  message: z.string().trim().min(10).max(5000),
});

export async function POST(request: Request) {
  try {
    const ip = clientIp(request);
    const limited = rateLimit(`contact:ip:${ip}`, 5, 60 * 60_000);
    if (!limited.ok) {
      return jsonError("api.rateLimited", 429, {
        retryAfter: limited.retryAfterSec,
      });
    }

    const body = await request.json();
    const data = schema.parse(body);
    const locale = await resolveApiLocale();

    const message = await prisma.contactMessage.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        subject: data.subject,
        body: data.message,
        locale,
      },
      select: { id: true },
    });

    audit({
      category: "CONTACT",
      action: "contact.message.created",
      message: `Contact form from ${data.email}: ${data.subject}`,
      actor: { email: data.email.toLowerCase() },
      targetType: "ContactMessage",
      targetId: message.id,
      request,
      statusCode: 201,
      meta: { name: data.name, subject: data.subject, locale },
    });

    return NextResponse.json({ ok: true, id: message.id }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError("api.invalid", 400, { details: error.flatten() });
    }
    console.error(error);
    return jsonError("api.server", 500);
  }
}
