import QRCode from "qrcode";
import { z } from "zod";

/** Styled QR rendering shared by the studio (browser) and the API (server). */

export const DOT_SHAPES = ["square", "rounded", "dots", "classy", "soft", "diamond", "bars"] as const;
export const EYE_FRAMES = ["square", "rounded", "circle", "leaf"] as const;
export const EYE_BALLS = ["square", "rounded", "circle", "diamond", "leaf"] as const;
export const LOGOS = ["none", "link", "fork", "pin", "camera", "mono", "image"] as const;
export const FRAMES = ["none", "label", "bubble", "ticket"] as const;
export const ECLS = ["L", "M", "Q", "H"] as const;

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/);

export const qrStyleSchema = z.object({
  ecl: z.enum(ECLS),
  dot: z.enum(DOT_SHAPES),
  eyeFrame: z.enum(EYE_FRAMES),
  eyeBall: z.enum(EYE_BALLS),
  fg: hex,
  fg2: hex,
  gradient: z.enum(["none", "linear", "radial"]),
  eyeColor: hex.nullable(),
  bg: hex,
  transparent: z.boolean(),
  logo: z.enum(LOGOS),
  logoSize: z.number().min(0.14).max(0.3),
  logoData: z
    .string()
    .max(300_000)
    .regex(/^data:image\/(png|jpeg|webp|svg\+xml);base64,/)
    .nullable(),
  mono: z.string().max(2),
  margin: z.number().int().min(0).max(6),
  frame: z.enum(FRAMES),
  frameText: z.string().max(24),
});

export type QrStyle = z.infer<typeof qrStyleSchema>;
export type DotShape = QrStyle["dot"];
export type EyeFrame = QrStyle["eyeFrame"];
export type EyeBall = QrStyle["eyeBall"];

export const DEFAULT_STYLE: QrStyle = {
  ecl: "H",
  dot: "square",
  eyeFrame: "square",
  eyeBall: "square",
  fg: "#111418",
  fg2: "#111418",
  gradient: "none",
  eyeColor: null,
  bg: "#FFFFFF",
  transparent: false,
  logo: "none",
  logoSize: 0.22,
  logoData: null,
  mono: "PL",
  margin: 4,
  frame: "none",
  frameText: "SCANNEZ-MOI",
};

export type QrTemplate = {
  id: string;
  /** Category key, translated under app.qrStudio.categories. */
  category: "minimal" | "gradient" | "color" | "dark" | "framed";
  style: Partial<QrStyle>;
};

export const QR_TEMPLATES: QrTemplate[] = [
  { id: "classic", category: "minimal", style: {} },
  { id: "pearl", category: "minimal", style: { dot: "dots", eyeFrame: "circle", eyeBall: "circle", fg: "#1D2B3A" } },
  { id: "brand", category: "gradient", style: { dot: "rounded", eyeFrame: "rounded", eyeBall: "rounded", fg: "#1D4ED8", fg2: "#0037B0", gradient: "linear", eyeColor: "#A33900", logo: "link" } },
  { id: "bauhaus", category: "color", style: { fg: "#1C1C1C", eyeBall: "circle", eyeColor: "#D7263D", bg: "#F2E8D5" } },
  { id: "midnight", category: "dark", style: { dot: "dots", eyeFrame: "rounded", eyeBall: "circle", fg: "#ECE9E2", bg: "#10141A" } },
  { id: "coral", category: "gradient", style: { dot: "classy", eyeFrame: "leaf", eyeBall: "leaf", fg: "#E4572E", fg2: "#A3195B", gradient: "linear" } },
  { id: "lagoon", category: "gradient", style: { dot: "bars", eyeFrame: "circle", eyeBall: "circle", fg: "#0369A1", fg2: "#0F766E", gradient: "radial", logo: "pin" } },
  { id: "sakura", category: "framed", style: { dot: "dots", eyeFrame: "leaf", eyeBall: "leaf", fg: "#B0124F", bg: "#FFF1F5", frame: "bubble", frameText: "MENU DU JOUR" } },
  { id: "graphite", category: "minimal", style: { dot: "classy", eyeFrame: "rounded", eyeBall: "square", fg: "#2B2D31", eyeColor: "#1D4ED8" } },
  { id: "neon", category: "dark", style: { dot: "soft", eyeFrame: "circle", eyeBall: "circle", fg: "#7DD3FC", fg2: "#C084FC", gradient: "linear", bg: "#0B0B12" } },
  { id: "kraft", category: "color", style: { dot: "diamond", eyeFrame: "square", eyeBall: "diamond", fg: "#3B2A1A", bg: "#E8D5B5" } },
  { id: "label", category: "framed", style: { dot: "rounded", eyeFrame: "rounded", eyeBall: "circle", fg: "#A33900", frame: "label", frameText: "SCANNEZ-MOI", logo: "link" } },
];

export function templateStyle(id: string): QrStyle {
  const tpl = QR_TEMPLATES.find((t) => t.id === id);
  return { ...DEFAULT_STYLE, ...(tpl?.style ?? {}) };
}

/** Accepts stored JSON of any age and returns a complete, valid style. */
export function normalizeStyle(raw: unknown): QrStyle {
  const merged = { ...DEFAULT_STYLE, ...(raw && typeof raw === "object" ? raw : {}) };
  const parsed = qrStyleSchema.safeParse(merged);
  return parsed.success ? parsed.data : DEFAULT_STYLE;
}

// ---------- geometry ----------

const f = (v: number) => +v.toFixed(3);

function escapeXml(s: string) {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
}

/** Rectangle path with its own radius per corner (top-left, top-right, bottom-right, bottom-left). */
function rr(x: number, y: number, w: number, h: number, a: number, b: number, c: number, d: number) {
  return (
    `M${f(x + a)},${f(y)}H${f(x + w - b)}` +
    (b ? `A${b},${b} 0 0 1 ${f(x + w)},${f(y + b)}` : "") +
    `V${f(y + h - c)}` +
    (c ? `A${c},${c} 0 0 1 ${f(x + w - c)},${f(y + h)}` : "") +
    `H${f(x + d)}` +
    (d ? `A${d},${d} 0 0 1 ${f(x)},${f(y + h - d)}` : "") +
    `V${f(y + a)}` +
    (a ? `A${a},${a} 0 0 1 ${f(x + a)},${f(y)}` : "") +
    "Z"
  );
}

function dot(shape: DotShape, x: number, y: number, U: boolean, D: boolean, L: boolean, R: boolean) {
  switch (shape) {
    case "dots":
      return `M${f(x + 0.08)},${f(y + 0.5)}a.42,.42 0 1 0 .84,0a.42,.42 0 1 0 -.84,0Z`;
    case "rounded":
      return rr(x, y, 1, 1, !U && !L ? 0.5 : 0, !U && !R ? 0.5 : 0, !D && !R ? 0.5 : 0, !D && !L ? 0.5 : 0);
    case "classy":
      return rr(x, y, 1, 1, !U && !L ? 0.5 : 0, 0, !D && !R ? 0.5 : 0, 0);
    case "diamond":
      return `M${f(x + 0.5)},${f(y + 0.02)}L${f(x + 0.98)},${f(y + 0.5)}L${f(x + 0.5)},${f(y + 0.98)}L${f(x + 0.02)},${f(y + 0.5)}Z`;
    case "bars":
      return rr(x + 0.12, y, 0.76, 1, U ? 0 : 0.38, U ? 0 : 0.38, D ? 0 : 0.38, D ? 0 : 0.38);
    case "soft":
      return rr(x + 0.06, y + 0.06, 0.88, 0.88, 0.26, 0.26, 0.26, 0.26);
    default:
      return `M${x},${y}h1v1h-1Z`;
  }
}

type DarkFn = (r: number, c: number) => boolean;

export function dotsPath(n: number, isDark: DarkFn, shape: DotShape, ox: number, oy: number) {
  let d = "";
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (!isDark(r, c)) continue;
      d += dot(shape, ox + c, oy + r, isDark(r - 1, c), isDark(r + 1, c), isDark(r, c - 1), isDark(r, c + 1));
    }
  }
  return d;
}

/** Finder pattern ("eye") at x,y: a 7×7 ring and a 3×3 center. */
export function eyePaths(x: number, y: number, frame: EyeFrame, ball: EyeBall) {
  let ring: string;
  if (frame === "leaf") {
    ring = rr(x, y, 7, 7, 3, 0.6, 3, 0.6) + rr(x + 1, y + 1, 5, 5, 2, 0.3, 2, 0.3);
  } else {
    const [o, i] = ({ square: [0, 0], rounded: [2.2, 1.3], circle: [3.5, 2.5] } as const)[frame];
    ring = rr(x, y, 7, 7, o, o, o, o) + rr(x + 1, y + 1, 5, 5, i, i, i, i);
  }
  const bx = x + 2;
  const by = y + 2;
  let center: string;
  switch (ball) {
    case "rounded":
      center = rr(bx, by, 3, 3, 0.9, 0.9, 0.9, 0.9);
      break;
    case "circle":
      center = rr(bx, by, 3, 3, 1.5, 1.5, 1.5, 1.5);
      break;
    case "diamond":
      center = `M${bx + 1.5},${by - 0.2}L${bx + 3.2},${by + 1.5}L${bx + 1.5},${by + 3.2}L${bx - 0.2},${by + 1.5}Z`;
      break;
    case "leaf":
      center = rr(bx, by, 3, 3, 1.4, 0.3, 1.4, 0.3);
      break;
    default:
      center = rr(bx, by, 3, 3, 0, 0, 0, 0);
  }
  return { ring, center };
}

/** Line icons (24×24, stroke) drawn in the logo plate. */
export const LOGO_ICONS: Record<"link" | "fork" | "pin" | "camera", string> = {
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  fork: '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
};

const matrixCache = new Map<string, { n: number; version: number; dark: DarkFn }>();

function getMatrix(text: string, ecl: QrStyle["ecl"]) {
  const key = `${ecl}|${text}`;
  const hit = matrixCache.get(key);
  if (hit) return hit;
  const qr = QRCode.create(text || " ", { errorCorrectionLevel: ecl });
  const n = qr.modules.size;
  const data = qr.modules.data;
  const m = { n, version: qr.version, dark: (r: number, c: number) => data[r * n + c] === 1 };
  if (matrixCache.size > 200) matrixCache.clear();
  matrixCache.set(key, m);
  return m;
}

/** Stable id prefix so server and client render identical markup (no hydration mismatch). */
function stableId(input: string) {
  let h = 5381;
  for (let i = 0; i < input.length; i++) h = ((h << 5) + h + input.charCodeAt(i)) | 0;
  return `qr${(h >>> 0).toString(36)}`;
}

export type RenderedQr = { svg: string; modules: number; version: number; width: number; height: number };

/** Renders `text` as a standalone SVG document using `style`. */
export function renderStyledQr(text: string, style: QrStyle, opts: { title?: string } = {}): RenderedQr {
  const uid = stableId(`${text}|${JSON.stringify({ ...style, logoData: style.logoData?.length ?? 0 })}`);
  const M = getMatrix(text, style.ecl);
  const n = M.n;
  const m = style.margin;
  const q = n + 2 * m;

  const hasLogo = style.logo !== "none" && (style.logo !== "image" || !!style.logoData);
  let ls = hasLogo ? Math.round(n * style.logoSize) : 0;
  if (ls && (n - ls) % 2) ls += 1;
  const la = (n - ls) / 2;
  const lb = la + ls;
  const finder = (r: number, c: number) => (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7);
  const isDark: DarkFn = (r, c) =>
    r >= 0 && c >= 0 && r < n && c < n && !finder(r, c) && !(ls && r >= la && r < lb && c >= la && c < lb) && M.dark(r, c);

  const bg = style.transparent ? "none" : style.bg;
  const plate = style.transparent ? "#FFFFFF" : style.bg;
  const fill = style.gradient !== "none" ? `url(#${uid}g)` : style.fg;
  const eyeFill = style.eyeColor ?? fill;
  const solid = style.fg;
  const label = escapeXml(style.frameText || " ");
  const P = 1.6;

  let W = q;
  let H = q;
  let ox = 0;
  let oy = 0;
  let pre = "";
  let post = "";

  if (style.frame === "label") {
    const lh = q * 0.2;
    W = q + 2 * P;
    H = q + 2 * P + lh;
    ox = P;
    oy = P;
    pre =
      `<rect width="${f(W)}" height="${f(H)}" rx="${f(q * 0.07)}" fill="${solid}"/>` +
      `<rect x="${P}" y="${P}" width="${q}" height="${q}" rx="${f(q * 0.045)}" fill="${plate}"/>`;
    post = `<text x="${f(W / 2)}" y="${f(P + q + lh * 0.58)}" text-anchor="middle" dominant-baseline="middle" font-family="Plus Jakarta Sans, Arial, sans-serif" font-weight="700" letter-spacing="${f(q * 0.006)}" font-size="${f(lh * 0.38)}" fill="${plate}">${label}</text>`;
  } else if (style.frame === "bubble") {
    const ph = q * 0.15;
    const pw = q * 0.78;
    const gap = q * 0.07;
    H = ph + gap + q;
    oy = ph + gap;
    pre =
      `<rect x="${f((q - pw) / 2)}" y="0" width="${f(pw)}" height="${f(ph)}" rx="${f(ph / 2)}" fill="${solid}"/>` +
      `<path d="M${f(q / 2 - q * 0.03)},${f(ph - 0.1)}L${f(q / 2)},${f(ph + gap * 0.6)}L${f(q / 2 + q * 0.03)},${f(ph - 0.1)}Z" fill="${solid}"/>` +
      `<text x="${f(q / 2)}" y="${f(ph * 0.54)}" text-anchor="middle" dominant-baseline="middle" font-family="Plus Jakarta Sans, Arial, sans-serif" font-weight="700" font-size="${f(ph * 0.42)}" fill="${plate}">${label}</text>` +
      (bg === "none" ? "" : `<rect y="${f(oy)}" width="${q}" height="${q}" rx="${f(q * 0.05)}" fill="${bg}"/>`);
  } else if (style.frame === "ticket") {
    const lh = q * 0.18;
    const sw = q * 0.012;
    W = q + 2 * P;
    H = q + 2 * P + lh;
    ox = P;
    oy = P;
    pre =
      (bg === "none" ? "" : `<rect width="${f(W)}" height="${f(H)}" rx="${f(q * 0.07)}" fill="${bg}"/>`) +
      `<rect x="${f(sw / 2)}" y="${f(sw / 2)}" width="${f(W - sw)}" height="${f(H - sw)}" rx="${f(q * 0.07)}" fill="none" stroke="${solid}" stroke-width="${f(sw * 1.4)}"/>` +
      `<path d="M${f(P)},${f(P + q + 0.2)}H${f(W - P)}" stroke="${solid}" stroke-width="${f(sw)}" stroke-dasharray="${f(q * 0.02)} ${f(q * 0.02)}"/>`;
    post = `<text x="${f(W / 2)}" y="${f(P + q + lh * 0.55)}" text-anchor="middle" dominant-baseline="middle" font-family="JetBrains Mono, Menlo, monospace" font-weight="500" letter-spacing="${f(q * 0.008)}" font-size="${f(lh * 0.34)}" fill="${solid}">${label}</text>`;
  } else {
    pre = bg === "none" ? "" : `<rect width="${q}" height="${q}" fill="${bg}"/>`;
  }

  const X = ox + m;
  const Y = oy + m;
  let defs = "";
  if (style.gradient === "linear") {
    defs = `<linearGradient id="${uid}g" gradientUnits="userSpaceOnUse" x1="${f(X)}" y1="${f(Y)}" x2="${f(X + n)}" y2="${f(Y + n)}"><stop offset="0" stop-color="${style.fg}"/><stop offset="1" stop-color="${style.fg2}"/></linearGradient>`;
  } else if (style.gradient === "radial") {
    defs = `<radialGradient id="${uid}g" gradientUnits="userSpaceOnUse" cx="${f(X + n / 2)}" cy="${f(Y + n / 2)}" r="${f(n * 0.72)}"><stop offset="0" stop-color="${style.fg}"/><stop offset="1" stop-color="${style.fg2}"/></radialGradient>`;
  }

  const crisp = style.dot === "square" ? ' shape-rendering="crispEdges"' : "";
  let body = `<path d="${dotsPath(n, isDark, style.dot, X, Y)}" fill="${fill}"${crisp}/>`;
  for (const [ex, ey] of [
    [X, Y],
    [X + n - 7, Y],
    [X, Y + n - 7],
  ]) {
    const e = eyePaths(ex, ey, style.eyeFrame, style.eyeBall);
    body += `<path d="${e.ring}" fill="${eyeFill}" fill-rule="evenodd"/><path d="${e.center}" fill="${eyeFill}"/>`;
  }

  if (hasLogo) {
    const s = ls - 1;
    const lx = X + la + 0.5;
    const ly = Y + la + 0.5;
    if (style.logo === "image" && style.logoData) {
      body +=
        `<rect x="${f(lx)}" y="${f(ly)}" width="${s}" height="${s}" rx="${f(s * 0.22)}" fill="${plate}"/>` +
        `<image href="${style.logoData}" x="${f(lx + s * 0.1)}" y="${f(ly + s * 0.1)}" width="${f(s * 0.8)}" height="${f(s * 0.8)}" preserveAspectRatio="xMidYMid meet"/>`;
    } else if (style.logo === "mono") {
      body +=
        `<rect x="${f(lx)}" y="${f(ly)}" width="${s}" height="${s}" rx="${f(s * 0.26)}" fill="${eyeFill}"/>` +
        `<text x="${f(lx + s / 2)}" y="${f(ly + s * 0.54)}" text-anchor="middle" dominant-baseline="middle" font-family="Sora, Arial, sans-serif" font-weight="800" font-size="${f(s * 0.46)}" fill="${plate}">${escapeXml((style.mono || "PL").toUpperCase())}</text>`;
    } else if (style.logo in LOGO_ICONS) {
      const k = (s * 0.62) / 24;
      body +=
        `<rect x="${f(lx)}" y="${f(ly)}" width="${s}" height="${s}" rx="${f(s * 0.26)}" fill="${plate}"/>` +
        `<g transform="translate(${f(lx + s * 0.19)},${f(ly + s * 0.19)}) scale(${f(k)})" fill="none" stroke="${style.eyeColor ?? style.fg}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${LOGO_ICONS[style.logo as keyof typeof LOGO_ICONS]}</g>`;
    }
  }

  const title = opts.title ? `<title>${escapeXml(opts.title)}</title>` : "";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${f(W)} ${f(H)}" role="img">${title}<defs>${defs}</defs>${pre}${body}${post}</svg>`;
  return { svg, modules: n, version: M.version, width: f(W), height: f(H) };
}

// ---------- scannability ----------

function luminance(color: string) {
  const h = color.replace("#", "");
  const [r, g, b] = [0, 2, 4]
    .map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string) {
  const x = luminance(a);
  const y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

export function isDarkColor(color: string) {
  return luminance(color) < 0.2;
}

export type ScanIssue = {
  level: "good" | "warn" | "bad";
  /** Message key under app.qrStudio.scan, with its variables. */
  key: string;
  vars?: Record<string, string | number>;
};

/** Heuristic readability score (0–100) with the reasons behind it. */
export function scanScore(style: QrStyle) {
  const bg = style.transparent ? "#FFFFFF" : style.bg;
  const fgs = [style.fg];
  if (style.gradient !== "none") fgs.push(style.fg2);
  if (style.eyeColor) fgs.push(style.eyeColor);
  const contrast = Math.min(...fgs.map((c) => contrastRatio(c, bg)));
  const ratio = contrast.toFixed(1);
  const issues: ScanIssue[] = [];
  let score = 100;

  if (contrast < 3) {
    score -= 50;
    issues.push({ level: "bad", key: "contrastLow", vars: { ratio } });
  } else if (contrast < 4.5) {
    score -= 15;
    issues.push({ level: "warn", key: "contrastFair", vars: { ratio } });
  } else {
    issues.push({ level: "good", key: "contrastGood", vars: { ratio } });
  }

  if (Math.max(...fgs.map(luminance)) > luminance(bg)) {
    score -= 14;
    issues.push({ level: "warn", key: "inverted" });
  }

  const hasLogo = style.logo !== "none";
  if (hasLogo && (style.ecl === "L" || style.ecl === "M")) {
    score -= 32;
    issues.push({ level: "bad", key: "logoEcl" });
  } else if (hasLogo && style.logoSize > 0.26) {
    score -= 8;
    issues.push({ level: "warn", key: "logoLarge" });
  } else if (hasLogo) {
    issues.push({ level: "good", key: "logoOk" });
  }

  if (style.margin < 2) {
    score -= 16;
    issues.push({ level: "bad", key: "marginLow" });
  } else if (style.margin < 4) {
    score -= 4;
    issues.push({ level: "warn", key: "marginFair" });
  } else {
    issues.push({ level: "good", key: "marginGood" });
  }

  if (style.dot === "diamond" || style.dot === "bars") score -= 3;
  score = Math.max(5, Math.min(100, score));
  const grade: "excellent" | "fair" | "risky" = score >= 85 ? "excellent" : score >= 60 ? "fair" : "risky";
  return { score, contrast, issues, grade };
}
