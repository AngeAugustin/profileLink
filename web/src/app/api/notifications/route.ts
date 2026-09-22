import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { jsonError } from "@/i18n/api";
import { runNotificationLifecycle, safeAppHref } from "@/lib/notifications";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

function serializeNotification(n: {
  id: string;
  type: string;
  title: string;
  body: string;
  href: string | null;
  readAt: Date | null;
  createdAt: Date;
  meta: unknown;
}) {
  return {
    id: n.id,
    type: n.type,
    title: n.title,
    body: n.body,
    href: safeAppHref(n.href),
    readAt: n.readAt?.toISOString() ?? null,
    createdAt: n.createdAt.toISOString(),
    meta: n.meta,
  };
}

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return jsonError("api.unauthorized", 401);
  }

  const { searchParams } = new URL(request.url);
  const unreadOnly = searchParams.get("unread") === "1";
  const skipLifecycle = searchParams.get("lifecycle") === "0";
  const rawLimit = Number(searchParams.get("limit") ?? DEFAULT_LIMIT);
  const limit = Number.isFinite(rawLimit)
    ? Math.min(Math.max(1, Math.floor(rawLimit)), MAX_LIMIT)
    : DEFAULT_LIMIT;

  // Lifecycle is best-effort and must never break the inbox.
  if (!skipLifecycle) {
    try {
      await runNotificationLifecycle(user.id);
    } catch (error) {
      console.error("[notifications] lifecycle failed", error);
    }
  }

  try {
    const where = {
      userId: user.id,
      ...(unreadOnly ? { readAt: null } : {}),
    };

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        select: {
          id: true,
          type: true,
          title: true,
          body: true,
          href: true,
          readAt: true,
          createdAt: true,
          meta: true,
        },
      }),
      prisma.notification.count({
        where: { userId: user.id, readAt: null },
      }),
    ]);

    return NextResponse.json({
      notifications: notifications.map(serializeNotification),
      unreadCount,
    });
  } catch (error) {
    console.error("[notifications] list failed", error);
    return jsonError("api.server", 500);
  }
}
