import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { defaultLocale, isLocale, type Locale } from "@/i18n/config";

const SESSION_COOKIE = "pl_session";

function getPathLocale(pathname: string): Locale | null {
  const segment = pathname.split("/")[1];
  return segment && isLocale(segment) ? segment : null;
}

function stripLocale(pathname: string): string {
  const parts = pathname.split("/");
  if (parts[1] && isLocale(parts[1])) {
    const rest = parts.slice(2).join("/");
    return rest ? `/${rest}` : "/";
  }
  return pathname;
}

function preferLocale(request: NextRequest): Locale {
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  if (cookieLocale && isLocale(cookieLocale)) return cookieLocale;

  const accept = request.headers.get("accept-language") ?? "";
  const preferred = accept
    .split(",")
    .map((part) => part.trim().split(";")[0]?.toLowerCase())
    .find((tag) => tag && (isLocale(tag) || isLocale(tag.slice(0, 2))));

  if (preferred) {
    if (isLocale(preferred)) return preferred;
    const short = preferred.slice(0, 2);
    if (isLocale(short)) return short;
  }

  return defaultLocale;
}

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return null;
  return new TextEncoder().encode(secret);
}

async function hasValidSessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const secret = getAuthSecret();
  if (!secret) return false;
  try {
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

function clearSessionCookie(res: NextResponse) {
  res.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const localeInPath = getPathLocale(pathname);

  if (!localeInPath) {
    const locale = preferLocale(request);
    const url = request.nextUrl.clone();
    url.pathname =
      pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;
    const res = NextResponse.redirect(url);
    res.cookies.set("NEXT_LOCALE", locale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
    return res;
  }

  const bare = stripLocale(pathname);
  const rawToken = request.cookies.get(SESSION_COOKIE)?.value;
  const validSession = await hasValidSessionToken(rawToken);

  if (bare.startsWith("/app") && !validSession) {
    const url = request.nextUrl.clone();
    url.pathname = `/${localeInPath}/connexion`;
    url.searchParams.set("next", pathname);
    const res = NextResponse.redirect(url);
    if (rawToken) clearSessionCookie(res);
    return res;
  }

  if (bare.startsWith("/admin") && !validSession) {
    const url = request.nextUrl.clone();
    url.pathname = `/${localeInPath}/connexion`;
    const res = NextResponse.redirect(url);
    if (rawToken) clearSessionCookie(res);
    return res;
  }

  if ((bare === "/connexion" || bare === "/inscription") && validSession) {
    const url = request.nextUrl.clone();
    url.pathname = `/${localeInPath}/app`;
    return NextResponse.redirect(url);
  }

  const res = NextResponse.next();
  res.cookies.set("NEXT_LOCALE", localeInPath, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return res;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};
