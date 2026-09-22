import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export type ThemeMood = "corporate" | "light" | "bold" | "night";

export type ThemeTokens = {
  shell: string;
  cover: string;
  card: string;
  muted: string;
  text: string;
  textMuted: string;
  accent: string;
  accentSoft: string;
  chip: string;
  border: string;
  cta: string;
  ctaText: string;
  ring: string;
  bar: string;
  barBorder: string;
  barOutline: string;
};

export type ProfileThemeRow = {
  id: string;
  name: string;
  description: string;
  mood: ThemeMood;
  preview: string;
  accentDot: string;
  light: boolean;
  enabled: boolean;
  sortOrder: number;
  tokens: ThemeTokens;
  createdAt?: Date;
  updatedAt?: Date;
};

export type ProfileThemeInput = {
  id: string;
  name: string;
  description?: string;
  mood?: ThemeMood;
  preview?: string;
  accentDot?: string;
  light?: boolean;
  enabled?: boolean;
  sortOrder?: number;
  tokens?: ThemeTokens;
  /** Clone visual tokens/preview from an existing theme id. */
  cloneFrom?: string;
};

const MOODS: ThemeMood[] = ["corporate", "light", "bold", "night"];

export function isThemeMood(value: string): value is ThemeMood {
  return (MOODS as string[]).includes(value);
}

export const THEME_ID_REGEX = /^[a-z][a-z0-9-]{1,31}$/;

export function isValidThemeId(value: string): boolean {
  return THEME_ID_REGEX.test(value);
}

/** Built-in defaults — seeded into DB via ensureProfileThemes(). */
export const DEFAULT_PROFILE_THEMES: ProfileThemeRow[] = [
  {
    id: "executive",
    name: "Executive",
    description:
      "Autorité sobre pour dirigeants, associés et profils corporate.",
    mood: "corporate",
    preview: "bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900",
    accentDot: "bg-amber-400",
    light: false,
    enabled: true,
    sortOrder: 0,
    tokens: {
      shell: "bg-slate-950",
      cover: "bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900",
      card: "bg-slate-900/90",
      muted: "bg-slate-800/80",
      text: "text-slate-50",
      textMuted: "text-slate-300",
      accent: "text-amber-400",
      accentSoft: "bg-amber-400/15 text-amber-300",
      chip: "bg-slate-800 text-slate-200",
      border: "border-slate-700/80",
      cta: "bg-amber-400 hover:bg-amber-300",
      ctaText: "text-slate-950",
      ring: "ring-slate-950",
      bar: "bg-slate-900/95",
      barBorder: "border-slate-700/80",
      barOutline: "border-slate-600 text-slate-50 hover:bg-slate-800",
    },
  },
  {
    id: "minimalist",
    name: "Minimaliste",
    description:
      "Beaucoup d’air, typographie claire — idéal freelances et designers.",
    mood: "light",
    preview: "bg-gradient-to-br from-stone-100 via-white to-stone-200",
    accentDot: "bg-stone-800",
    light: true,
    enabled: true,
    sortOrder: 1,
    tokens: {
      shell: "bg-[#f7f6f3]",
      cover: "bg-gradient-to-br from-stone-100 via-white to-stone-200",
      card: "bg-white",
      muted: "bg-stone-50",
      text: "text-stone-900",
      textMuted: "text-stone-500",
      accent: "text-stone-800",
      accentSoft: "bg-stone-900/8 text-stone-800",
      chip: "bg-stone-100 text-stone-700",
      border: "border-stone-200",
      cta: "bg-stone-900 hover:bg-stone-800",
      ctaText: "text-white",
      ring: "ring-white",
      bar: "bg-white/95",
      barBorder: "border-stone-200",
      barOutline: "border-stone-300 text-stone-900 hover:bg-stone-100",
    },
  },
  {
    id: "creative",
    name: "Créatif",
    description:
      "Accents vifs et rythme dynamique pour speakers et créateurs.",
    mood: "bold",
    preview: "bg-gradient-to-br from-teal-600 via-cyan-500 to-sky-400",
    accentDot: "bg-white",
    light: false,
    enabled: true,
    sortOrder: 2,
    tokens: {
      shell: "bg-[#ecfeff]",
      cover: "bg-gradient-to-br from-teal-600 via-cyan-500 to-sky-400",
      card: "bg-white/95",
      muted: "bg-cyan-50",
      text: "text-slate-900",
      textMuted: "text-slate-600",
      accent: "text-teal-700",
      accentSoft: "bg-teal-500/15 text-teal-800",
      chip: "bg-teal-50 text-teal-800",
      border: "border-teal-100",
      cta: "bg-teal-600 hover:bg-teal-500",
      ctaText: "text-white",
      ring: "ring-white",
      bar: "bg-white/95",
      barBorder: "border-teal-100",
      barOutline: "border-teal-200 text-slate-900 hover:bg-teal-50",
    },
  },
  {
    id: "dark",
    name: "Dark Mode",
    description: "Contraste élevé pour une présence tech et contemporaine.",
    mood: "night",
    preview: "bg-gradient-to-br from-zinc-950 via-zinc-900 to-indigo-950",
    accentDot: "bg-indigo-400",
    light: false,
    enabled: true,
    sortOrder: 3,
    tokens: {
      shell: "bg-zinc-950",
      cover: "bg-gradient-to-br from-zinc-950 via-zinc-900 to-indigo-950",
      card: "bg-zinc-900/95",
      muted: "bg-zinc-800/80",
      text: "text-zinc-50",
      textMuted: "text-zinc-400",
      accent: "text-indigo-400",
      accentSoft: "bg-indigo-500/20 text-indigo-300",
      chip: "bg-zinc-800 text-zinc-200",
      border: "border-zinc-700/80",
      cta: "bg-indigo-500 hover:bg-indigo-400",
      ctaText: "text-white",
      ring: "ring-zinc-950",
      bar: "bg-zinc-900/95",
      barBorder: "border-zinc-700/80",
      barOutline: "border-zinc-600 text-zinc-50 hover:bg-zinc-800",
    },
  },
  {
    id: "ocean",
    name: "Ocean",
    description:
      "Bleus profonds et clarté — parfait pour consultants et profils conseil.",
    mood: "corporate",
    preview: "bg-gradient-to-br from-sky-800 via-blue-600 to-cyan-500",
    accentDot: "bg-sky-200",
    light: false,
    enabled: true,
    sortOrder: 4,
    tokens: {
      shell: "bg-[#eef5fb]",
      cover: "bg-gradient-to-br from-sky-800 via-blue-600 to-cyan-500",
      card: "bg-white/95",
      muted: "bg-sky-50",
      text: "text-slate-900",
      textMuted: "text-slate-600",
      accent: "text-sky-800",
      accentSoft: "bg-sky-500/15 text-sky-800",
      chip: "bg-sky-50 text-sky-900",
      border: "border-sky-100",
      cta: "bg-sky-700 hover:bg-sky-600",
      ctaText: "text-white",
      ring: "ring-white",
      bar: "bg-white/95",
      barBorder: "border-sky-100",
      barOutline: "border-sky-200 text-slate-900 hover:bg-sky-50",
    },
  },
  {
    id: "forest",
    name: "Forest",
    description:
      "Verts calmes et naturels pour une présence douce et crédible.",
    mood: "light",
    preview: "bg-gradient-to-br from-emerald-900 via-green-700 to-lime-600",
    accentDot: "bg-lime-200",
    light: false,
    enabled: true,
    sortOrder: 5,
    tokens: {
      shell: "bg-[#f3f6f1]",
      cover: "bg-gradient-to-br from-emerald-900 via-green-700 to-lime-600",
      card: "bg-white/95",
      muted: "bg-emerald-50",
      text: "text-stone-900",
      textMuted: "text-stone-600",
      accent: "text-emerald-800",
      accentSoft: "bg-emerald-500/15 text-emerald-900",
      chip: "bg-emerald-50 text-emerald-900",
      border: "border-emerald-100",
      cta: "bg-emerald-800 hover:bg-emerald-700",
      ctaText: "text-white",
      ring: "ring-white",
      bar: "bg-white/95",
      barBorder: "border-emerald-100",
      barOutline: "border-emerald-200 text-stone-900 hover:bg-emerald-50",
    },
  },
  {
    id: "paper",
    name: "Paper",
    description:
      "Rendu éditorial encre & papier — sérieux, lisible, intemporel.",
    mood: "light",
    preview: "bg-gradient-to-br from-[#1e293b] via-[#334155] to-[#64748b]",
    accentDot: "bg-[#f4f1ea]",
    light: false,
    enabled: true,
    sortOrder: 6,
    tokens: {
      shell: "bg-[#f4f1ea]",
      cover: "bg-gradient-to-br from-[#1e293b] via-[#334155] to-[#64748b]",
      card: "bg-[#faf8f4]",
      muted: "bg-[#efeae0]",
      text: "text-[#1c1917]",
      textMuted: "text-[#57534e]",
      accent: "text-[#1e3a5f]",
      accentSoft: "bg-[#1e3a5f]/10 text-[#1e3a5f]",
      chip: "bg-[#e7e2d6] text-[#292524]",
      border: "border-[#ddd5c5]",
      cta: "bg-[#1e3a5f] hover:bg-[#152a45]",
      ctaText: "text-white",
      ring: "ring-[#faf8f4]",
      bar: "bg-[#faf8f4]/95",
      barBorder: "border-[#ddd5c5]",
      barOutline: "border-[#ddd5c5] text-[#1c1917] hover:bg-[#efeae0]",
    },
  },
  {
    id: "coral",
    name: "Coral",
    description: "Énergie chaude et humaine pour marques et créateurs.",
    mood: "bold",
    preview: "bg-gradient-to-br from-rose-600 via-orange-500 to-amber-400",
    accentDot: "bg-white",
    light: false,
    enabled: true,
    sortOrder: 7,
    tokens: {
      shell: "bg-[#fff5f2]",
      cover: "bg-gradient-to-br from-rose-600 via-orange-500 to-amber-400",
      card: "bg-white/95",
      muted: "bg-rose-50",
      text: "text-stone-900",
      textMuted: "text-stone-600",
      accent: "text-rose-700",
      accentSoft: "bg-rose-500/15 text-rose-800",
      chip: "bg-orange-50 text-rose-900",
      border: "border-rose-100",
      cta: "bg-rose-600 hover:bg-rose-500",
      ctaText: "text-white",
      ring: "ring-white",
      bar: "bg-white/95",
      barBorder: "border-rose-100",
      barOutline: "border-rose-200 text-stone-900 hover:bg-rose-50",
    },
  },
  {
    id: "midnight",
    name: "Midnight",
    description:
      "Bleu nuit profond et accent électrique — idéal founders tech et late-night brands.",
    mood: "night",
    preview: "bg-gradient-to-br from-[#0b1220] via-[#152238] to-[#1e3a5f]",
    accentDot: "bg-sky-400",
    light: false,
    enabled: true,
    sortOrder: 8,
    tokens: {
      shell: "bg-[#070b14]",
      cover: "bg-gradient-to-br from-[#0b1220] via-[#152238] to-[#1e3a5f]",
      card: "bg-[#101826]/95",
      muted: "bg-[#162033]",
      text: "text-slate-50",
      textMuted: "text-slate-400",
      accent: "text-sky-400",
      accentSoft: "bg-sky-400/15 text-sky-300",
      chip: "bg-[#1a2740] text-slate-200",
      border: "border-slate-700/70",
      cta: "bg-sky-500 hover:bg-sky-400",
      ctaText: "text-[#070b14]",
      ring: "ring-[#070b14]",
      bar: "bg-[#101826]/95",
      barBorder: "border-slate-700/70",
      barOutline: "border-slate-600 text-slate-50 hover:bg-[#162033]",
    },
  },
  {
    id: "sand",
    name: "Sand",
    description:
      "Sables chauds et typo aérée — coaches lifestyle, architectes, studios calmes.",
    mood: "light",
    preview: "bg-gradient-to-br from-[#e8dcc8] via-[#f3ebe0] to-[#d4c4a8]",
    accentDot: "bg-[#6b5344]",
    light: true,
    enabled: true,
    sortOrder: 9,
    tokens: {
      shell: "bg-[#f7f1e8]",
      cover: "bg-gradient-to-br from-[#e8dcc8] via-[#f3ebe0] to-[#d4c4a8]",
      card: "bg-[#fffcf7]",
      muted: "bg-[#efe6d8]",
      text: "text-[#3d3229]",
      textMuted: "text-[#7a6a5a]",
      accent: "text-[#6b5344]",
      accentSoft: "bg-[#6b5344]/10 text-[#6b5344]",
      chip: "bg-[#ebe0d0] text-[#4a3c32]",
      border: "border-[#ddd0bc]",
      cta: "bg-[#6b5344] hover:bg-[#574336]",
      ctaText: "text-[#fffcf7]",
      ring: "ring-[#fffcf7]",
      bar: "bg-[#fffcf7]/95",
      barBorder: "border-[#ddd0bc]",
      barOutline: "border-[#d4c4a8] text-[#3d3229] hover:bg-[#efe6d8]",
    },
  },
  {
    id: "ink",
    name: "Ink",
    description:
      "Noir & blanc éditorial — auteurs, journalistes, profils qui misent sur le fond.",
    mood: "corporate",
    preview: "bg-gradient-to-br from-[#111111] via-[#2a2a2a] to-[#4a4a4a]",
    accentDot: "bg-white",
    light: false,
    enabled: true,
    sortOrder: 10,
    tokens: {
      shell: "bg-[#f5f5f5]",
      cover: "bg-gradient-to-br from-[#111111] via-[#2a2a2a] to-[#4a4a4a]",
      card: "bg-white",
      muted: "bg-[#eeeeee]",
      text: "text-[#111111]",
      textMuted: "text-[#666666]",
      accent: "text-[#111111]",
      accentSoft: "bg-[#111111]/8 text-[#111111]",
      chip: "bg-[#e8e8e8] text-[#222222]",
      border: "border-[#e0e0e0]",
      cta: "bg-[#111111] hover:bg-[#2a2a2a]",
      ctaText: "text-white",
      ring: "ring-white",
      bar: "bg-white/95",
      barBorder: "border-[#e0e0e0]",
      barOutline: "border-[#cccccc] text-[#111111] hover:bg-[#eeeeee]",
    },
  },
  {
    id: "aurora",
    name: "Aurora",
    description:
      "Dégradé boréal violet → émeraude — créatifs, DJ, studios immersifs.",
    mood: "bold",
    preview: "bg-gradient-to-br from-[#4c1d95] via-[#0f766e] to-[#34d399]",
    accentDot: "bg-emerald-300",
    light: false,
    enabled: true,
    sortOrder: 11,
    tokens: {
      shell: "bg-[#0c1222]",
      cover: "bg-gradient-to-br from-[#4c1d95] via-[#0f766e] to-[#34d399]",
      card: "bg-[#141b2d]/95",
      muted: "bg-[#1c2538]",
      text: "text-emerald-50",
      textMuted: "text-slate-400",
      accent: "text-emerald-300",
      accentSoft: "bg-emerald-400/15 text-emerald-200",
      chip: "bg-[#1c2538] text-violet-200",
      border: "border-violet-900/50",
      cta: "bg-emerald-400 hover:bg-emerald-300",
      ctaText: "text-[#0c1222]",
      ring: "ring-[#0c1222]",
      bar: "bg-[#141b2d]/95",
      barBorder: "border-violet-900/40",
      barOutline: "border-violet-700/60 text-emerald-50 hover:bg-[#1c2538]",
    },
  },
  {
    id: "slate",
    name: "Slate",
    description:
      "Gris froid précis — consultants, product managers, équipes ops.",
    mood: "corporate",
    preview: "bg-gradient-to-br from-slate-600 via-slate-500 to-slate-400",
    accentDot: "bg-cyan-500",
    light: false,
    enabled: true,
    sortOrder: 12,
    tokens: {
      shell: "bg-[#f1f5f9]",
      cover: "bg-gradient-to-br from-slate-600 via-slate-500 to-slate-400",
      card: "bg-white",
      muted: "bg-slate-100",
      text: "text-slate-900",
      textMuted: "text-slate-500",
      accent: "text-cyan-700",
      accentSoft: "bg-cyan-500/12 text-cyan-800",
      chip: "bg-slate-100 text-slate-700",
      border: "border-slate-200",
      cta: "bg-slate-800 hover:bg-slate-700",
      ctaText: "text-white",
      ring: "ring-white",
      bar: "bg-white/95",
      barBorder: "border-slate-200",
      barOutline: "border-slate-300 text-slate-900 hover:bg-slate-100",
    },
  },
  {
    id: "honey",
    name: "Honey",
    description:
      "Or doux et miel — food, hospitality, marques artisanales.",
    mood: "bold",
    preview: "bg-gradient-to-br from-[#b45309] via-[#d97706] to-[#fbbf24]",
    accentDot: "bg-[#78350f]",
    light: false,
    enabled: true,
    sortOrder: 13,
    tokens: {
      shell: "bg-[#fffbeb]",
      cover: "bg-gradient-to-br from-[#b45309] via-[#d97706] to-[#fbbf24]",
      card: "bg-[#fffdf7]",
      muted: "bg-[#fef3c7]",
      text: "text-[#451a03]",
      textMuted: "text-[#92400e]",
      accent: "text-[#b45309]",
      accentSoft: "bg-[#f59e0b]/15 text-[#92400e]",
      chip: "bg-[#fde68a]/70 text-[#78350f]",
      border: "border-[#fcd34d]/60",
      cta: "bg-[#b45309] hover:bg-[#92400e]",
      ctaText: "text-white",
      ring: "ring-[#fffdf7]",
      bar: "bg-[#fffdf7]/95",
      barBorder: "border-[#fcd34d]/50",
      barOutline: "border-[#fbbf24] text-[#451a03] hover:bg-[#fef3c7]",
    },
  },
  {
    id: "lavender",
    name: "Lavender",
    description:
      "Lilas doux et respirant — thérapeutes, wellness, marques soin.",
    mood: "light",
    preview: "bg-gradient-to-br from-[#a78bfa] via-[#c4b5fd] to-[#ede9fe]",
    accentDot: "bg-[#5b21b6]",
    light: true,
    enabled: true,
    sortOrder: 14,
    tokens: {
      shell: "bg-[#faf8ff]",
      cover: "bg-gradient-to-br from-[#a78bfa] via-[#c4b5fd] to-[#ede9fe]",
      card: "bg-white",
      muted: "bg-[#f3eefc]",
      text: "text-[#2e1065]",
      textMuted: "text-[#6b7280]",
      accent: "text-[#6d28d9]",
      accentSoft: "bg-[#8b5cf6]/12 text-[#5b21b6]",
      chip: "bg-[#ede9fe] text-[#5b21b6]",
      border: "border-[#ddd6fe]",
      cta: "bg-[#6d28d9] hover:bg-[#5b21b6]",
      ctaText: "text-white",
      ring: "ring-white",
      bar: "bg-white/95",
      barBorder: "border-[#ddd6fe]",
      barOutline: "border-[#c4b5fd] text-[#2e1065] hover:bg-[#f3eefc]",
    },
  },
  {
    id: "graphite",
    name: "Graphite",
    description:
      "Anthracite mat et acier — ingénieurs, makers, profils industriels.",
    mood: "night",
    preview: "bg-gradient-to-br from-[#1c1917] via-[#292524] to-[#44403c]",
    accentDot: "bg-orange-400",
    light: false,
    enabled: true,
    sortOrder: 15,
    tokens: {
      shell: "bg-[#0c0a09]",
      cover: "bg-gradient-to-br from-[#1c1917] via-[#292524] to-[#44403c]",
      card: "bg-[#1c1917]/95",
      muted: "bg-[#292524]",
      text: "text-stone-100",
      textMuted: "text-stone-400",
      accent: "text-orange-400",
      accentSoft: "bg-orange-400/15 text-orange-300",
      chip: "bg-[#292524] text-stone-200",
      border: "border-stone-700/80",
      cta: "bg-orange-500 hover:bg-orange-400",
      ctaText: "text-[#0c0a09]",
      ring: "ring-[#0c0a09]",
      bar: "bg-[#1c1917]/95",
      barBorder: "border-stone-700/80",
      barOutline: "border-stone-600 text-stone-100 hover:bg-[#292524]",
    },
  },
  {
    id: "mint",
    name: "Mint",
    description:
      "Vert menthe clinique et net — santé, fintech douce, SaaS clairs.",
    mood: "light",
    preview: "bg-gradient-to-br from-[#0d9488] via-[#2dd4bf] to-[#ccfbf1]",
    accentDot: "bg-[#115e59]",
    light: true,
    enabled: true,
    sortOrder: 16,
    tokens: {
      shell: "bg-[#f0fdfa]",
      cover: "bg-gradient-to-br from-[#0d9488] via-[#2dd4bf] to-[#ccfbf1]",
      card: "bg-white",
      muted: "bg-[#e6fffa]",
      text: "text-[#134e4a]",
      textMuted: "text-[#5b716e]",
      accent: "text-[#0f766e]",
      accentSoft: "bg-teal-500/12 text-teal-800",
      chip: "bg-[#ccfbf1] text-[#115e59]",
      border: "border-teal-100",
      cta: "bg-[#0d9488] hover:bg-[#0f766e]",
      ctaText: "text-white",
      ring: "ring-white",
      bar: "bg-white/95",
      barBorder: "border-teal-100",
      barOutline: "border-teal-200 text-[#134e4a] hover:bg-[#e6fffa]",
    },
  },
  {
    id: "copper",
    name: "Copper",
    description:
      "Cuivre brossé et chaleur métallique — artisans, design produit, luxe accessible.",
    mood: "bold",
    preview: "bg-gradient-to-br from-[#7c2d12] via-[#c2410c] to-[#ea580c]",
    accentDot: "bg-[#fdba74]",
    light: false,
    enabled: true,
    sortOrder: 17,
    tokens: {
      shell: "bg-[#1a0f0a]",
      cover: "bg-gradient-to-br from-[#7c2d12] via-[#c2410c] to-[#ea580c]",
      card: "bg-[#23150f]/95",
      muted: "bg-[#2e1b14]",
      text: "text-orange-50",
      textMuted: "text-orange-200/70",
      accent: "text-[#fdba74]",
      accentSoft: "bg-orange-400/15 text-orange-200",
      chip: "bg-[#2e1b14] text-orange-100",
      border: "border-orange-900/50",
      cta: "bg-[#ea580c] hover:bg-[#c2410c]",
      ctaText: "text-white",
      ring: "ring-[#1a0f0a]",
      bar: "bg-[#23150f]/95",
      barBorder: "border-orange-900/50",
      barOutline: "border-orange-800 text-orange-50 hover:bg-[#2e1b14]",
    },
  },
  {
    id: "noir",
    name: "Noir",
    description:
      "Cinéma noir avec rouge sang — photographes, réalisateurs, clubs privés.",
    mood: "night",
    preview: "bg-gradient-to-br from-black via-[#1a0505] to-[#7f1d1d]",
    accentDot: "bg-red-500",
    light: false,
    enabled: true,
    sortOrder: 18,
    tokens: {
      shell: "bg-black",
      cover: "bg-gradient-to-br from-black via-[#1a0505] to-[#7f1d1d]",
      card: "bg-[#0a0a0a]/95",
      muted: "bg-[#171717]",
      text: "text-neutral-50",
      textMuted: "text-neutral-400",
      accent: "text-red-500",
      accentSoft: "bg-red-500/15 text-red-400",
      chip: "bg-[#171717] text-neutral-200",
      border: "border-neutral-800",
      cta: "bg-red-600 hover:bg-red-500",
      ctaText: "text-white",
      ring: "ring-black",
      bar: "bg-[#0a0a0a]/95",
      barBorder: "border-neutral-800",
      barOutline: "border-neutral-700 text-neutral-50 hover:bg-[#171717]",
    },
  },
  {
    id: "glacier",
    name: "Glacier",
    description:
      "Glace claire et bleu polaire — cabinets, legal tech, profils ultra-nets.",
    mood: "corporate",
    preview: "bg-gradient-to-br from-[#0e7490] via-[#38bdf8] to-[#e0f2fe]",
    accentDot: "bg-[#0c4a6e]",
    light: true,
    enabled: true,
    sortOrder: 19,
    tokens: {
      shell: "bg-[#f0f9ff]",
      cover: "bg-gradient-to-br from-[#0e7490] via-[#38bdf8] to-[#e0f2fe]",
      card: "bg-white",
      muted: "bg-[#e0f2fe]",
      text: "text-[#0c4a6e]",
      textMuted: "text-slate-500",
      accent: "text-[#0369a1]",
      accentSoft: "bg-sky-500/12 text-sky-800",
      chip: "bg-[#e0f2fe] text-[#0c4a6e]",
      border: "border-sky-100",
      cta: "bg-[#0284c7] hover:bg-[#0369a1]",
      ctaText: "text-white",
      ring: "ring-white",
      bar: "bg-white/95",
      barBorder: "border-sky-100",
      barOutline: "border-sky-200 text-[#0c4a6e] hover:bg-[#e0f2fe]",
    },
  },
];

export function isBuiltinThemeId(id: string): boolean {
  return DEFAULT_PROFILE_THEMES.some((d) => d.id === id);
}

/** Client-safe token lookup (defaults). Prefer getProfileTheme() on the server for DB themes. */
export function resolveThemeTokens(themeId: string): ThemeTokens {
  return (
    DEFAULT_PROFILE_THEMES.find((d) => d.id === themeId)?.tokens ??
    DEFAULT_PROFILE_THEMES[0].tokens
  );
}
const TOKEN_KEYS: (keyof ThemeTokens)[] = [
  "shell",
  "cover",
  "card",
  "muted",
  "text",
  "textMuted",
  "accent",
  "accentSoft",
  "chip",
  "border",
  "cta",
  "ctaText",
  "ring",
  "bar",
  "barBorder",
  "barOutline",
];

export function parseThemeTokens(value: unknown): ThemeTokens | null {
  if (!value || typeof value !== "object") return null;
  const obj = value as Record<string, unknown>;
  const out = {} as ThemeTokens;
  for (const key of TOKEN_KEYS) {
    if (typeof obj[key] !== "string" || !obj[key]) return null;
    out[key] = obj[key] as string;
  }
  return out;
}

function rowToTheme(row: {
  id: string;
  name: string;
  description: string;
  mood: string;
  preview: string;
  accentDot: string;
  light: boolean;
  enabled: boolean;
  sortOrder: number;
  tokens: Prisma.JsonValue;
  createdAt: Date;
  updatedAt: Date;
}): ProfileThemeRow {
  const tokens =
    parseThemeTokens(row.tokens) ??
    DEFAULT_PROFILE_THEMES.find((d) => d.id === row.id)?.tokens ??
    DEFAULT_PROFILE_THEMES[0].tokens;
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    mood: isThemeMood(row.mood) ? row.mood : "corporate",
    preview: row.preview,
    accentDot: row.accentDot,
    light: row.light,
    enabled: row.enabled,
    sortOrder: row.sortOrder,
    tokens,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function ensureProfileThemes(): Promise<ProfileThemeRow[]> {
  await Promise.all(
    DEFAULT_PROFILE_THEMES.map((theme) =>
      prisma.profileTheme.upsert({
        where: { id: theme.id },
        create: {
          id: theme.id,
          name: theme.name,
          description: theme.description,
          mood: theme.mood,
          preview: theme.preview,
          accentDot: theme.accentDot,
          light: theme.light,
          enabled: theme.enabled,
          sortOrder: theme.sortOrder,
          tokens: theme.tokens as Prisma.InputJsonValue,
        },
        update: {},
      }),
    ),
  );

  const rows = await prisma.profileTheme.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  return rows.map(rowToTheme);
}

export async function listProfileThemes(opts?: {
  enabledOnly?: boolean;
}): Promise<ProfileThemeRow[]> {
  await ensureProfileThemes();
  const rows = await prisma.profileTheme.findMany({
    where: opts?.enabledOnly ? { enabled: true } : undefined,
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  return rows.map(rowToTheme);
}

export async function getProfileTheme(
  id: string,
): Promise<ProfileThemeRow | null> {
  await ensureProfileThemes();
  const row = await prisma.profileTheme.findUnique({ where: { id } });
  return row ? rowToTheme(row) : null;
}

export async function createProfileTheme(
  input: ProfileThemeInput,
): Promise<ProfileThemeRow> {
  await ensureProfileThemes();

  const id = input.id.trim().toLowerCase();
  if (!isValidThemeId(id)) {
    throw new Error("INVALID_ID");
  }

  const existing = await prisma.profileTheme.findUnique({ where: { id } });
  if (existing) throw new Error("ID_TAKEN");

  const cloneId = input.cloneFrom?.trim().toLowerCase() || "executive";
  const base =
    (await getProfileTheme(cloneId)) ??
    DEFAULT_PROFILE_THEMES.find((d) => d.id === "executive")!;

  const count = await prisma.profileTheme.count();
  const tokens = input.tokens ?? base.tokens;
  const preview = input.preview ?? base.preview;
  const accentDot = input.accentDot ?? base.accentDot;
  const light = input.light ?? base.light;

  const row = await prisma.profileTheme.create({
    data: {
      id,
      name: input.name.trim(),
      description: (input.description ?? "").trim(),
      mood: input.mood && isThemeMood(input.mood) ? input.mood : base.mood,
      preview,
      accentDot,
      light,
      enabled: input.enabled ?? true,
      sortOrder: input.sortOrder ?? count,
      tokens: tokens as Prisma.InputJsonValue,
    },
  });

  return rowToTheme(row);
}

export async function updateProfileTheme(
  id: string,
  data: Partial<{
    name: string;
    description: string;
    mood: ThemeMood;
    preview: string;
    accentDot: string;
    light: boolean;
    enabled: boolean;
    sortOrder: number;
    tokens: ThemeTokens;
  }>,
): Promise<ProfileThemeRow> {
  await ensureProfileThemes();
  const existing = await prisma.profileTheme.findUnique({ where: { id } });
  if (!existing) throw new Error("NOT_FOUND");

  const row = await prisma.profileTheme.update({
    where: { id },
    data: {
      ...(data.name !== undefined ? { name: data.name.trim() } : {}),
      ...(data.description !== undefined
        ? { description: data.description.trim() }
        : {}),
      ...(data.mood !== undefined ? { mood: data.mood } : {}),
      ...(data.preview !== undefined ? { preview: data.preview } : {}),
      ...(data.accentDot !== undefined ? { accentDot: data.accentDot } : {}),
      ...(data.light !== undefined ? { light: data.light } : {}),
      ...(data.enabled !== undefined ? { enabled: data.enabled } : {}),
      ...(data.sortOrder !== undefined ? { sortOrder: data.sortOrder } : {}),
      ...(data.tokens !== undefined
        ? { tokens: data.tokens as Prisma.InputJsonValue }
        : {}),
    },
  });

  return rowToTheme(row);
}

export async function deleteProfileTheme(id: string): Promise<void> {
  await ensureProfileThemes();
  const existing = await prisma.profileTheme.findUnique({ where: { id } });
  if (!existing) throw new Error("NOT_FOUND");

  const inUse = await prisma.profile.count({ where: { theme: id } });
  if (inUse > 0) throw new Error("IN_USE");

  const isDefault = isBuiltinThemeId(id);
  if (isDefault) throw new Error("BUILTIN");

  await prisma.profileTheme.delete({ where: { id } });
}
