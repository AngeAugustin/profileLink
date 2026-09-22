import {
  isValidThemeId,
  DEFAULT_PROFILE_THEMES,
} from "@/lib/profile-themes";

/** Built-in theme ids (seeded catalog). Custom DB themes may exist beyond this. */
export type ThemePreviewId = (typeof DEFAULT_PROFILE_THEMES)[number]["id"];

export const THEME_PREVIEW_IDS: ThemePreviewId[] = DEFAULT_PROFILE_THEMES.map(
  (t) => t.id,
);

export function isThemePreviewId(value: string): value is ThemePreviewId {
  return THEME_PREVIEW_IDS.includes(value as ThemePreviewId);
}

export function isKnownThemeId(value: string): boolean {
  return isValidThemeId(value);
}
