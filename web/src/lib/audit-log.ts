import type { AuditLogCategory, AuditLogLevel, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  clientIp,
  clientUserAgent,
  resolveGeo,
} from "@/lib/request-meta";

export type AuditActor = {
  id?: string | null;
  email?: string | null;
  role?: string | null;
};

export type WriteAuditInput = {
  category: AuditLogCategory;
  action: string;
  message: string;
  level?: AuditLogLevel;
  actor?: AuditActor | null;
  targetType?: string | null;
  targetId?: string | null;
  request?: Request | null;
  path?: string | null;
  method?: string | null;
  statusCode?: number | null;
  meta?: Prisma.InputJsonValue;
  /** Skip geo lookup (faster for high-volume events). */
  skipGeo?: boolean;
};

/**
 * Persist an audit log. Never throws to callers — failures are swallowed/logged.
 */
export async function writeAuditLog(input: WriteAuditInput): Promise<void> {
  try {
    const ip = input.request ? clientIp(input.request) : null;
    const userAgent = input.request ? clientUserAgent(input.request) : null;
    let country: string | null = null;
    let countryCode: string | null = null;
    let region: string | null = null;
    let city: string | null = null;

    if (input.request && ip && !input.skipGeo) {
      const geo = await resolveGeo(input.request, ip);
      country = geo.country;
      countryCode = geo.countryCode;
      region = geo.region;
      city = geo.city;
    }

    let path = input.path ?? null;
    let method = input.method ?? null;
    if (input.request) {
      try {
        const url = new URL(input.request.url);
        path = path ?? url.pathname;
        method = method ?? input.request.method;
      } catch {
        /* ignore */
      }
    }

    await prisma.auditLog.create({
      data: {
        category: input.category,
        level: input.level ?? "INFO",
        action: input.action,
        message: input.message,
        actorUserId: input.actor?.id ?? null,
        actorEmail: input.actor?.email ?? null,
        actorRole: input.actor?.role ?? null,
        targetType: input.targetType ?? null,
        targetId: input.targetId ?? null,
        ip,
        userAgent,
        country,
        countryCode,
        region,
        city,
        path,
        method,
        statusCode: input.statusCode ?? null,
        meta: input.meta ?? undefined,
      },
    });
  } catch (error) {
    console.error("[audit-log]", error);
  }
}

/** Fire-and-forget wrapper. */
export function audit(input: WriteAuditInput): void {
  void writeAuditLog(input);
}
