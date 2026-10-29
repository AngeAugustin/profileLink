import { after, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { appBaseUrl, recordQrScan } from "@/lib/qr-codes";

type Params = { params: Promise<{ code: string }> };

/** Entry point of dynamic QR codes: counts the scan, then redirects to the current destination. */
export async function GET(request: Request, { params }: Params) {
  const { code } = await params;

  const qr =
    code && code.length <= 32
      ? await prisma.qrCode.findUnique({
          where: { code },
          select: { id: true, destination: true, dynamic: true },
        })
      : null;

  if (!qr || !qr.dynamic) {
    return NextResponse.redirect(new URL("/", appBaseUrl()), 302);
  }

  after(() => recordQrScan(qr.id, request).catch((error) => console.error(error)));

  const res = NextResponse.redirect(qr.destination, 302);
  res.headers.set("Cache-Control", "no-store");
  return res;
}
