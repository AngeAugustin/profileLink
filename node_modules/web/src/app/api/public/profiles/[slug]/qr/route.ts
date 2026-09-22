import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateProfileQrDataUrl } from "@/lib/qr";
import { jsonError } from "@/i18n/api";

type Params = { params: Promise<{ slug: string }> };

export async function GET(request: Request, { params }: Params) {
  const { slug } = await params;

  const profile = await prisma.profile.findFirst({
    where: { slug, status: "PUBLISHED" },
    select: { slug: true, firstName: true, lastName: true },
  });

  if (!profile) {
    return jsonError("api.notFound", 404);
  }

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format");

  if (format === "png" || format === "svg") {
    const { generateProfileQr } = await import("@/lib/qr");
    const { data, contentType } = await generateProfileQr({
      slug: profile.slug,
      format,
    });
    const body = typeof data === "string" ? data : new Uint8Array(data);
    return new NextResponse(body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
      },
    });
  }

  const { url, dataUrl } = await generateProfileQrDataUrl(profile.slug);
  return NextResponse.json({
    slug: profile.slug,
    url,
    dataUrl,
    label: `${profile.firstName} ${profile.lastName}`,
  });
}
