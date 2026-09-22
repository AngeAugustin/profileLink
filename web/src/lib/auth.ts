import { hash, compare } from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "./db";

export const SESSION_COOKIE = "pl_session";
const SESSION_DAYS = 14;
/** Failed logins before the account is locked (admin must unlock). */
export const LOGIN_LOCK_THRESHOLD = 5;

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string) {
  return hash(password, 12);
}

export async function verifyPassword(password: string, passwordHash: string) {
  return compare(password, passwordHash);
}

export async function createSession(userId: string) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DAYS);

  const token = await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(getSecret());

  await prisma.session.create({
    data: { token, userId, expiresAt },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  return token;
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { token } });
    cookieStore.delete(SESSION_COOKIE);
  }
}

/** Revoke every session for a user (all devices). */
export async function destroyAllSessions(userId: string) {
  await prisma.session.deleteMany({ where: { userId } });
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

/** Lock account after too many failed logins and kill active sessions. */
export async function lockUserAccount(userId: string) {
  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        lockedAt: new Date(),
        failedLoginCount: LOGIN_LOCK_THRESHOLD,
      },
    }),
    prisma.session.deleteMany({ where: { userId } }),
  ]);
}

export async function unlockUserAccount(userId: string, reviewedById?: string) {
  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        lockedAt: null,
        failedLoginCount: 0,
      },
    }),
    prisma.unlockRequest.updateMany({
      where: { userId, status: "PENDING" },
      data: {
        status: "APPROVED",
        reviewedAt: new Date(),
        ...(reviewedById ? { reviewedById } : {}),
      },
    }),
  ]);
}

export async function recordFailedLogin(userId: string): Promise<boolean> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { failedLoginCount: { increment: 1 } },
    select: { failedLoginCount: true, lockedAt: true },
  });
  if (user.lockedAt) return true;
  if (user.failedLoginCount >= LOGIN_LOCK_THRESHOLD) {
    await lockUserAccount(userId);
    return true;
  }
  return false;
}

export async function clearFailedLogins(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { failedLoginCount: 0 },
  });
}

export async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    const userId = payload.sub;
    if (!userId) return null;

    const session = await prisma.session.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            plan: true,
            role: true,
            lockedAt: true,
            createdAt: true,
          },
        },
      },
    });

    if (!session || session.expiresAt < new Date()) {
      if (session) await prisma.session.delete({ where: { id: session.id } });
      return null;
    }

    if (session.user.lockedAt) {
      await prisma.session.delete({ where: { id: session.id } });
      return null;
    }

    const { lockedAt: _lockedAt, ...user } = session.user;
    return user;
  } catch {
    return null;
  }
}

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

export async function requireAdmin() {
  const user = await getSessionUser();
  if (!user) throw new Error("UNAUTHORIZED");
  if (user.role !== "ADMIN") throw new Error("FORBIDDEN");
  return user;
}

/** Edge-safe JWT shape check (no DB). Used by middleware. */
export async function verifySessionJwt(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, getSecret());
    return true;
  } catch {
    return false;
  }
}
