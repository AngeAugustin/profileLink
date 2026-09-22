/** Request / network helpers shared by rate-limit and audit logs. */

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  const cf = request.headers.get("cf-connecting-ip")?.trim();
  if (cf) return cf;
  return "unknown";
}

export function clientUserAgent(request: Request): string | null {
  const ua = request.headers.get("user-agent")?.trim();
  return ua ? ua.slice(0, 512) : null;
}

export type GeoInfo = {
  country: string | null;
  countryCode: string | null;
  region: string | null;
  city: string | null;
};

const geoCache = new Map<string, { at: number; geo: GeoInfo }>();
const GEO_TTL_MS = 6 * 60 * 60_000;

function isPrivateIp(ip: string): boolean {
  if (!ip || ip === "unknown" || ip === "::1" || ip === "127.0.0.1") return true;
  if (ip.startsWith("10.") || ip.startsWith("192.168.") || ip.startsWith("172.")) {
    return true;
  }
  if (ip.startsWith("fc") || ip.startsWith("fd") || ip.startsWith("fe80")) return true;
  return false;
}

/** Prefer edge/platform headers, then free IP geolocation lookup. */
export async function resolveGeo(
  request: Request,
  ip: string,
): Promise<GeoInfo> {
  const fromHeaders: GeoInfo = {
    country:
      request.headers.get("x-vercel-ip-country") ??
      request.headers.get("cf-ipcountry") ??
      null,
    countryCode:
      request.headers.get("x-vercel-ip-country") ??
      request.headers.get("cf-ipcountry") ??
      null,
    region:
      request.headers.get("x-vercel-ip-country-region") ??
      request.headers.get("x-vercel-ip-region") ??
      null,
    city: request.headers.get("x-vercel-ip-city") ?? null,
  };

  if (fromHeaders.country || fromHeaders.city) {
    return {
      country: fromHeaders.country,
      countryCode: fromHeaders.countryCode,
      region: fromHeaders.region,
      city: fromHeaders.city ? decodeURIComponent(fromHeaders.city) : null,
    };
  }

  if (isPrivateIp(ip)) {
    return {
      country: "Local",
      countryCode: null,
      region: null,
      city: "Localhost",
    };
  }

  const cached = geoCache.get(ip);
  if (cached && Date.now() - cached.at < GEO_TTL_MS) {
    return cached.geo;
  }

  try {
    const res = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,countryCode,regionName,city`,
      { signal: AbortSignal.timeout(2500) },
    );
    if (!res.ok) throw new Error("geo http");
    const data = (await res.json()) as {
      status?: string;
      country?: string;
      countryCode?: string;
      regionName?: string;
      city?: string;
    };
    if (data.status !== "success") throw new Error("geo status");
    const geo: GeoInfo = {
      country: data.country ?? null,
      countryCode: data.countryCode ?? null,
      region: data.regionName ?? null,
      city: data.city ?? null,
    };
    geoCache.set(ip, { at: Date.now(), geo });
    return geo;
  } catch {
    return {
      country: null,
      countryCode: null,
      region: null,
      city: null,
    };
  }
}
