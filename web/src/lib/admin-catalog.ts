export const PLAN_MRR = {
  FREE: 0,
  PRO: 7,
  TEAM: 19,
} as const;

export type PlanId = keyof typeof PLAN_MRR;

export const PLAN_IDS = ["FREE", "PRO", "TEAM"] as const satisfies readonly PlanId[];

export function isPlanId(value: string): value is PlanId {
  return (PLAN_IDS as readonly string[]).includes(value);
}

export const PROFILE_THEMES = [
  { id: "executive", accent: "bg-primary/10 text-primary" },
  { id: "minimalist", accent: "bg-surface-container-highest text-on-surface" },
  { id: "creative", accent: "bg-tertiary-fixed text-on-tertiary-fixed" },
  { id: "dark", accent: "bg-inverse-surface text-inverse-on-surface" },
  { id: "ocean", accent: "bg-secondary-container text-primary" },
  { id: "forest", accent: "bg-emerald-50 text-emerald-800" },
  { id: "paper", accent: "bg-surface-container-low text-on-surface-variant" },
  { id: "coral", accent: "bg-tertiary-fixed-dim text-on-tertiary-fixed-variant" },
] as const;

/** @deprecated Prefer ProfileTheme rows from `@/lib/profile-themes`. */
export type ThemeId = (typeof PROFILE_THEMES)[number]["id"];

/** Sections every template / public profile can display. */
export const PROFILE_SECTIONS = [
  "identity",
  "links",
  "experiences",
  "projects",
  "education",
  "certifications",
  "skills",
  "interests",
  "languages",
] as const;

export type ProfileSectionId = (typeof PROFILE_SECTIONS)[number];
