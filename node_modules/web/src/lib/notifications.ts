import type { NotificationType, Plan, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

export type CreateNotificationInput = {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  href?: string | null;
  meta?: Prisma.InputJsonValue;
};

const VIEW_MILESTONES = [10, 50, 100, 250, 500, 1000, 2500, 5000] as const;
const QR_MILESTONES = [5, 10, 25, 50, 100, 250, 500] as const;
const CLICK_MILESTONES = [10, 50, 100, 250, 500] as const;

/** Only allow in-app relative paths — blocks open redirects. */
export function safeAppHref(href: string | null | undefined): string | null {
  if (!href) return null;
  const trimmed = href.trim();
  if (!trimmed.startsWith("/")) return null;
  if (trimmed.startsWith("//")) return null;
  if (trimmed.includes("://")) return null;
  if (trimmed.includes("\\")) return null;
  return trimmed.slice(0, 200);
}

export async function createNotification(input: CreateNotificationInput) {
  return prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title.slice(0, 160),
      body: (input.body ?? "").slice(0, 500),
      href: safeAppHref(input.href),
      meta: input.meta,
    },
  });
}

/** Creates at most one notification per (userId, uniqueKey). */
export async function createUniqueNotification(
  input: CreateNotificationInput,
  uniqueKey: string,
) {
  const existing = await prisma.notification.findFirst({
    where: {
      userId: input.userId,
      meta: { path: ["key"], equals: uniqueKey },
    },
    select: { id: true },
  });
  if (existing) return null;

  const meta =
    input.meta && typeof input.meta === "object" && !Array.isArray(input.meta)
      ? { ...(input.meta as Record<string, unknown>), key: uniqueKey }
      : { key: uniqueKey };

  return createNotification({
    ...input,
    meta: meta as Prisma.InputJsonValue,
  });
}

export async function notifyWelcome(userId: string, locale: "fr" | "en" = "fr") {
  const copy =
    locale === "en"
      ? {
          title: "Welcome to ProfileLink",
          body: "Create your first professional profile and share it with a link or QR code.",
        }
      : {
          title: "Bienvenue sur ProfileLink",
          body: "Créez votre premier profil professionnel et partagez-le avec un lien ou un QR code.",
        };

  return createUniqueNotification(
    {
      userId,
      type: "WELCOME",
      title: copy.title,
      body: copy.body,
      href: "/app/profils/nouveau",
    },
    "welcome",
  );
}

export async function notifyProfileCreated(
  userId: string,
  profile: { id: string; firstName: string; lastName: string },
  locale: "fr" | "en" = "fr",
) {
  const name = `${profile.firstName} ${profile.lastName}`.trim();
  const copy =
    locale === "en"
      ? {
          title: "Profile created",
          body: `"${name}" is ready to edit.`,
        }
      : {
          title: "Profil créé",
          body: `« ${name} » est prêt à être édité.`,
        };

  return createNotification({
    userId,
    type: "PROFILE_CREATED",
    title: copy.title,
    body: copy.body,
    href: `/app/profils/${profile.id}`,
    meta: { profileId: profile.id },
  });
}

export async function notifyProfilePublished(
  userId: string,
  profile: { id: string; firstName: string; lastName: string; slug: string },
  locale: "fr" | "en" = "fr",
) {
  const name = `${profile.firstName} ${profile.lastName}`.trim();
  const copy =
    locale === "en"
      ? {
          title: "Profile published",
          body: `"${name}" is now public at /p/${profile.slug}.`,
        }
      : {
          title: "Profil publié",
          body: `« ${name} » est maintenant public sur /p/${profile.slug}.`,
        };

  return createNotification({
    userId,
    type: "PROFILE_PUBLISHED",
    title: copy.title,
    body: copy.body,
    href: `/app/profils/${profile.id}`,
    meta: { profileId: profile.id, slug: profile.slug },
  });
}

export async function notifyPlanLimitReached(
  userId: string,
  locale: "fr" | "en" = "fr",
) {
  const copy =
    locale === "en"
      ? {
          title: "Free plan limit reached",
          body: "Starter includes 1 profile. Upgrade to Pro for unlimited profiles.",
        }
      : {
          title: "Limite du forfait Free atteinte",
          body: "Starter inclut 1 profil. Passez à Pro pour des profils illimités.",
        };

  return createUniqueNotification(
    {
      userId,
      type: "PLAN",
      title: copy.title,
      body: copy.body,
      href: "/app/parametres?tab=subscription",
    },
    "plan-limit-free",
  );
}

type ProfileMetric = {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  slug: string;
  views: number;
  clicks: number;
  qrScans: number;
};

function profileName(p: { firstName: string; lastName: string }) {
  return `${p.firstName} ${p.lastName}`.trim();
}

async function ownerAllowsActivityAlerts(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { notifyEmailAlerts: true },
  });
  return user?.notifyEmailAlerts !== false;
}

async function maybeNotifyMilestone(opts: {
  profile: ProfileMetric;
  metric: "views" | "clicks" | "qrScans";
  value: number;
  milestones: readonly number[];
  type: NotificationType;
  titleFr: string;
  titleEn: string;
  bodyFr: (name: string, value: number) => string;
  bodyEn: (name: string, value: number) => string;
  locale?: "fr" | "en";
}) {
  if (!(await ownerAllowsActivityAlerts(opts.profile.userId))) return;

  const hit = opts.milestones.find((m) => opts.value === m);
  if (!hit) return;

  const locale = opts.locale ?? "fr";
  const name = profileName(opts.profile);
  const title = locale === "en" ? opts.titleEn : opts.titleFr;
  const body =
    locale === "en" ? opts.bodyEn(name, hit) : opts.bodyFr(name, hit);

  await createUniqueNotification(
    {
      userId: opts.profile.userId,
      type: opts.type,
      title,
      body,
      href: `/app/profils/${opts.profile.id}`,
      meta: {
        profileId: opts.profile.id,
        metric: opts.metric,
        milestone: hit,
      },
    },
    `${opts.metric}-${hit}-${opts.profile.id}`,
  );
}

export async function recordProfileView(profileId: string) {
  const profile = await prisma.profile.update({
    where: { id: profileId },
    data: { views: { increment: 1 } },
    select: {
      id: true,
      userId: true,
      firstName: true,
      lastName: true,
      slug: true,
      views: true,
      clicks: true,
      qrScans: true,
    },
  });

  await maybeNotifyMilestone({
    profile,
    metric: "views",
    value: profile.views,
    milestones: VIEW_MILESTONES,
    type: "PROFILE_VIEW",
    titleFr: "Nouveau seuil de vues",
    titleEn: "View milestone reached",
    bodyFr: (name, value) =>
      `« ${name} » vient d’atteindre ${value.toLocaleString("fr-FR")} vues.`,
    bodyEn: (name, value) =>
      `"${name}" just reached ${value.toLocaleString("en-US")} views.`,
  }).catch(() => undefined);

  return profile;
}

export async function recordProfileClick(profileId: string) {
  const profile = await prisma.profile.update({
    where: { id: profileId },
    data: { clicks: { increment: 1 } },
    select: {
      id: true,
      userId: true,
      firstName: true,
      lastName: true,
      slug: true,
      views: true,
      clicks: true,
      qrScans: true,
    },
  });

  await maybeNotifyMilestone({
    profile,
    metric: "clicks",
    value: profile.clicks,
    milestones: CLICK_MILESTONES,
    type: "LINK_CLICK",
    titleFr: "Nouveau seuil de clics",
    titleEn: "Click milestone reached",
    bodyFr: (name, value) =>
      `« ${name} » cumule ${value.toLocaleString("fr-FR")} clics sur vos liens.`,
    bodyEn: (name, value) =>
      `"${name}" now has ${value.toLocaleString("en-US")} link clicks.`,
  }).catch(() => undefined);

  return profile;
}

export async function recordProfileQrScan(profileId: string) {
  const profile = await prisma.profile.update({
    where: { id: profileId },
    data: { qrScans: { increment: 1 } },
    select: {
      id: true,
      userId: true,
      firstName: true,
      lastName: true,
      slug: true,
      views: true,
      clicks: true,
      qrScans: true,
    },
  });

  await maybeNotifyMilestone({
    profile,
    metric: "qrScans",
    value: profile.qrScans,
    milestones: QR_MILESTONES,
    type: "QR_SCAN",
    titleFr: "Nouveau seuil de scans QR",
    titleEn: "QR scan milestone reached",
    bodyFr: (name, value) =>
      `« ${name} » a été scanné ${value.toLocaleString("fr-FR")} fois.`,
    bodyEn: (name, value) =>
      `"${name}" has been scanned ${value.toLocaleString("en-US")} times.`,
  }).catch(() => undefined);

  return profile;
}

function nextResetDate(subscribedAt: Date, plan: Plan): Date {
  const now = new Date();
  const reset = new Date(subscribedAt);
  const stepMonths = plan === "FREE" ? 1 : 12;
  let guard = 0;
  while (reset <= now && guard < 240) {
    reset.setMonth(reset.getMonth() + stepMonths);
    guard += 1;
  }
  return reset;
}

function isoWeekKey(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

export async function maybeNotifyWeeklyDigest(
  userId: string,
  locale: "fr" | "en" = "fr",
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { notifyWeeklyDigest: true },
  });
  if (!user?.notifyWeeklyDigest) return null;

  const weekKey = `weekly-${isoWeekKey(new Date())}`;
  const profiles = await prisma.profile.findMany({
    where: { userId },
    select: { views: true, clicks: true, qrScans: true },
  });
  if (profiles.length === 0) return null;

  const views = profiles.reduce((s, p) => s + p.views, 0);
  const clicks = profiles.reduce((s, p) => s + p.clicks, 0);
  const qr = profiles.reduce((s, p) => s + p.qrScans, 0);

  const copy =
    locale === "en"
      ? {
          title: "Your weekly summary",
          body: `${profiles.length} profile(s) · ${views} views · ${clicks} clicks · ${qr} QR scans.`,
        }
      : {
          title: "Votre résumé hebdomadaire",
          body: `${profiles.length} profil(s) · ${views} vues · ${clicks} clics · ${qr} scans QR.`,
        };

  return createUniqueNotification(
    {
      userId,
      type: "WEEKLY_DIGEST",
      title: copy.title,
      body: copy.body,
      href: "/app/statistiques",
      meta: { views, clicks, qrScans: qr },
    },
    weekKey,
  );
}

export async function maybeNotifyRenewal(
  userId: string,
  locale: "fr" | "en" = "fr",
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { createdAt: true, plan: true },
  });
  if (!user) return null;

  const resetAt = nextResetDate(user.createdAt, user.plan);
  const daysLeft = Math.max(
    0,
    Math.ceil((resetAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
  );
  if (daysLeft > 7) return null;

  const resetKey = `renewal-${resetAt.toISOString().slice(0, 10)}`;
  const copy =
    locale === "en"
      ? {
          title: "Period reset coming up",
          body:
            daysLeft === 0
              ? "Your billing/analytics period resets today."
              : `Your period resets in ${daysLeft} day(s) (${resetAt.toLocaleDateString("en-GB")}).`,
        }
      : {
          title: "Reset de période bientôt",
          body:
            daysLeft === 0
              ? "Votre période de facturation / analytics se réinitialise aujourd’hui."
              : `Votre période se réinitialise dans ${daysLeft} jour(s) (${resetAt.toLocaleDateString("fr-FR")}).`,
        };

  return createUniqueNotification(
    {
      userId,
      type: "PLAN",
      title: copy.title,
      body: copy.body,
      href: "/app/parametres?tab=subscription",
      meta: { daysLeft, resetAt: resetAt.toISOString() },
    },
    resetKey,
  );
}

export async function maybeNotifyIncompleteProfiles(
  userId: string,
  locale: "fr" | "en" = "fr",
) {
  const profiles = await prisma.profile.findMany({
    where: {
      userId,
      createdAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      title: true,
      bio: true,
      avatarUrl: true,
      _count: { select: { links: true } },
    },
  });

  const results = [];
  for (const profile of profiles) {
    const missing: string[] = [];
    if (!profile.title.trim()) missing.push(locale === "en" ? "title" : "titre");
    if (!profile.bio.trim()) missing.push("bio");
    if (!profile.avatarUrl) missing.push(locale === "en" ? "photo" : "photo");
    if (profile._count.links === 0) {
      missing.push(locale === "en" ? "links" : "liens");
    }
    if (missing.length === 0) continue;

    const name = profileName(profile);
    const copy =
      locale === "en"
        ? {
            title: "Complete your profile",
            body: `"${name}" is missing: ${missing.join(", ")}.`,
          }
        : {
            title: "Complétez votre profil",
            body: `Il manque à « ${name} » : ${missing.join(", ")}.`,
          };

    results.push(
      await createUniqueNotification(
        {
          userId,
          type: "PROFILE_INCOMPLETE",
          title: copy.title,
          body: copy.body,
          href: `/app/profils/${profile.id}`,
          meta: { profileId: profile.id, missing },
        },
        `incomplete-${profile.id}`,
      ),
    );
  }
  return results;
}

/** Lightweight lifecycle checks when the user opens notifications. */
export async function runNotificationLifecycle(
  userId: string,
  locale: "fr" | "en" = "fr",
) {
  await Promise.allSettled([
    maybeNotifyWeeklyDigest(userId, locale),
    maybeNotifyRenewal(userId, locale),
    maybeNotifyIncompleteProfiles(userId, locale),
  ]);
}
