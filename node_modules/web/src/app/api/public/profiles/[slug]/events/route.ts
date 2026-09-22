import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import {
  recordProfileClick,
  recordProfileQrScan,
} from "@/lib/notifications";
import { jsonError } from "@/i18n/api";

type Params = { params: Promise<{ slug: string }> };

const eventSchema = z.object({
  type: z.enum(["click", "qr_scan"]),
});

export async function POST(request: Request, { params }: Params) {
  const { slug } = await params;

  if (!slug || slug.length > 80) {
    return jsonError("api.invalid", 400);
  }

  try {
    const body = eventSchema.parse(await request.json());

    const profile = await prisma.profile.findFirst({
      where: { slug, status: "PUBLISHED" },
      select: { id: true },
    });
    if (!profile) {
      return jsonError("api.notFound", 404);
    }

    if (body.type === "click") {
      await recordProfileClick(profile.id);
    } else {
      await recordProfileQrScan(profile.id);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError("api.invalid", 400);
    }
    console.error(error);
    return jsonError("api.server", 500);
  }
}
