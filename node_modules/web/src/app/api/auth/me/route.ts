import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { jsonError } from "@/i18n/api";

const updateSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
});

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  return NextResponse.json({ user });
}

export async function PATCH(request: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return jsonError("api.unauthorized", 401);
    }

    const body = await request.json();
    const data = updateSchema.parse(body);
    const email = data.email.toLowerCase();

    if (email !== sessionUser.email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing && existing.id !== sessionUser.id) {
        return jsonError("api.emailTaken", 409);
      }
    }

    const user = await prisma.user.update({
      where: { id: sessionUser.id },
      data: {
        name: data.name.trim(),
        email,
      },
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError("api.invalid", 400, { details: error.flatten() });
    }
    console.error(error);
    return jsonError("api.server", 500);
  }
}
