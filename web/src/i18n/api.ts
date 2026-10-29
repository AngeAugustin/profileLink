import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { defaultLocale, isLocale, type Locale } from "./config";
import { getDictionary, t } from "./get-dictionary";

export type ApiErrorKey =
  | "api.unauthorized"
  | "api.forbidden"
  | "api.notFound"
  | "api.invalid"
  | "api.server"
  | "api.badCredentials"
  | "api.wrongPassword"
  | "api.emailTaken"
  | "api.slugTaken"
  | "api.freePlanLimit"
  | "api.rateLimited"
  | "api.accountLocked"
  | "api.unlockRequestPending"
  | "api.themeIdTaken"
  | "api.themeInUse"
  | "api.themeBuiltin"
  | "api.qrNotFound"
  | "api.dynamicQrPro";

export async function resolveApiLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get("NEXT_LOCALE")?.value;
  return value && isLocale(value) ? value : defaultLocale;
}

export async function jsonError(
  key: ApiErrorKey,
  status: number,
  extra?: Record<string, unknown>,
) {
  const locale = await resolveApiLocale();
  const dict = getDictionary(locale);
  return NextResponse.json(
    { error: t(dict, key), code: key, ...extra },
    { status },
  );
}
