import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateProfileQr, generateProfileQrDataUrl } from "@/lib/qr";
import { getProfilePublicUrl } from "@/lib/profile-sync";
import { jsonError } from "@/i18n/api";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user) {
    return jsonError("api.unauthorized", 401);
  }

  const { id } = await params;
  const profile = await prisma.profile.findFirst({
    where: { id, userId: user.id },
    select: { id: true, slug: true, firstName: true, lastName: true },
  });

  if (!profile) {
    return jsonError("api.notFound", 404);
  }

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") === "svg" ? "svg" : "png";
  const json = searchParams.get("json") === "1";

  if (json) {
    const { url, dataUrl } = await generateProfileQrDataUrl(profile.slug);
    return NextResponse.json({
      slug: profile.slug,
      url,
      dataUrl,
      label: `${profile.firstName} ${profile.lastName}`,
    });
  }

  const { data, contentType } = await generateProfileQr({
    slug: profile.slug,
    format,
    size: format === "png" ? 1024 : undefined,
  });

  const filename = `profilelink-${profile.slug}.${format}`;
  const body = typeof data === "string" ? data : new Uint8Array(data);

  return new NextResponse(body, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, max-age=3600",
      "X-Profile-Url": getProfilePublicUrl(profile.slug),
    },
  });
}
