import { randomBytes } from "crypto";
import { prisma } from "./db";
import { clientIp, clientUserAgent, resolveGeo } from "./request-meta";
import { normalizeStyle } from "./qr-style";

const CODE_ALPHABET = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function appBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  );
}

/** Redirect URL a dynamic QR code encodes. */
export function qrShortUrl(code: string) {
  return `${appBaseUrl()}/r/${code}`;
}

/** Text actually encoded in the QR symbol. */
export function qrEncodedText(qr: { dynamic: boolean; code: string; destination: string }) {
  return qr.dynamic ? qrShortUrl(qr.code) : qr.destination;
}

export async function generateQrCode() {
  for (let attempt = 0; attempt < 5; attempt++) {
    const bytes = randomBytes(6);
    const code = Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join("");
    const taken = await prisma.qrCode.findUnique({ where: { code }, select: { id: true } });
    if (!taken) return code;
  }
  throw new Error("Could not allocate a unique QR code");
}

export function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function deviceFromUserAgent(ua: string | null) {
  if (!ua) return "other";
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  if (/Windows|Macintosh|Linux|CrOS/i.test(ua)) return "desktop";
  return "other";
}

export async function recordQrScan(qrCodeId: string, request: Request) {
  const ua = clientUserAgent(request);
  const geo = await resolveGeo(request, clientIp(request)).catch(() => null);
  await prisma.$transaction([
    prisma.qrScan.create({
      data: {
        qrCodeId,
        device: deviceFromUserAgent(ua),
        country: geo?.country ?? null,
        city: geo?.city ?? null,
      },
    }),
    prisma.qrCode.update({ where: { id: qrCodeId }, data: { scans: { increment: 1 } } }),
  ]);
}

type QrRow = {
  id: string;
  name: string;
  destination: string;
  dynamic: boolean;
  code: string;
  style: unknown;
  scans: number;
  createdAt: Date;
  updatedAt: Date;
};

export function serializeQr(qr: QrRow) {
  return {
    id: qr.id,
    name: qr.name,
    destination: qr.destination,
    dynamic: qr.dynamic,
    code: qr.code,
    shortUrl: qrShortUrl(qr.code),
    encodedText: qrEncodedText(qr),
    style: normalizeStyle(qr.style),
    scans: qr.scans,
    createdAt: qr.createdAt.toISOString(),
    updatedAt: qr.updatedAt.toISOString(),
  };
}

export type SerializedQr = ReturnType<typeof serializeQr>;

const DAY_MS = 86_400_000;

/** Daily scans over the last `days` days (oldest first), plus device and city split. */
export async function qrScanStats(qrCodeIds: string[], days = 30) {
  const since = new Date(Date.now() - (days - 1) * DAY_MS);
  since.setHours(0, 0, 0, 0);
  const events = await prisma.qrScan.findMany({
    where: { qrCodeId: { in: qrCodeIds }, createdAt: { gte: since } },
    select: { qrCodeId: true, createdAt: true, device: true, city: true },
  });

  const daily = new Map<string, number[]>(qrCodeIds.map((id) => [id, new Array(days).fill(0)]));
  const devices: Record<string, number> = {};
  const cities: Record<string, number> = {};
  for (const e of events) {
    const index = Math.floor((e.createdAt.getTime() - since.getTime()) / DAY_MS);
    const row = daily.get(e.qrCodeId);
    if (row && index >= 0 && index < days) row[index] += 1;
    devices[e.device] = (devices[e.device] ?? 0) + 1;
    if (e.city) cities[e.city] = (cities[e.city] ?? 0) + 1;
  }

  const total = events.length;
  const share = (rec: Record<string, number>, limit: number) =>
    Object.entries(rec)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([label, count]) => ({ label, count, percent: total ? Math.round((count / total) * 100) : 0 }));

  return {
    since: since.toISOString(),
    total,
    daily: Object.fromEntries(daily),
    devices: share(devices, 4),
    cities: share(cities, 5),
  };
}
