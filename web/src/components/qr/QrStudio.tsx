"use client";

import { useId, useMemo, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useT } from "@/i18n/provider";
import { cn } from "@/lib/cn";
import {
  DEFAULT_STYLE,
  DOT_SHAPES,
  ECLS,
  EYE_BALLS,
  EYE_FRAMES,
  FRAMES,
  LOGO_ICONS,
  QR_TEMPLATES,
  dotsPath,
  eyePaths,
  isDarkColor,
  renderStyledQr,
  scanScore,
  templateStyle,
  type QrStyle,
} from "@/lib/qr-style";
import { downloadQrPng, downloadQrSvg, slugifyFilename } from "./export";
import { QrSvg } from "./QrSvg";

export type QrStudioValue = {
  name: string;
  destination: string;
  dynamic: boolean;
  style: QrStyle;
};

type QrStudioProps = {
  value: QrStudioValue;
  onChange: (value: QrStudioValue) => void;
  /** "public" hides saving and the name field; dynamic codes need an account. */
  mode: "public" | "app";
  canDynamic: boolean;
  /** Short link of a saved dynamic code; null before the first save. */
  shortUrl?: string | null;
  onSave?: () => void;
  saving?: boolean;
  saveLabel?: string;
};

type Tab = "content" | "pattern" | "corners" | "colors" | "logo" | "frame";

const TABS: { id: Tab; icon: string }[] = [
  { id: "content", icon: "link" },
  { id: "pattern", icon: "grain" },
  { id: "corners", icon: "crop_free" },
  { id: "colors", icon: "palette" },
  { id: "logo", icon: "image" },
  { id: "frame", icon: "crop_portrait" },
];

const SWATCHES = ["#111418", "#1D4ED8", "#0037B0", "#A33900", "#0A6E55", "#B0124F", "#3B2A1A"];
const LOGO_KINDS = ["none", "link", "fork", "pin", "camera", "mono"] as const;
const PNG_SIZES = [1024, 2048, 4096] as const;
const MAX_LOGO_BYTES = 200 * 1024;
const PLACEHOLDER_CODE = "xxxxxx";

export function isValidDestination(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/** Text the symbol encodes: the short link for dynamic codes, the destination otherwise. */
export function encodedTextFor(value: QrStudioValue, shortUrl?: string | null) {
  if (!value.dynamic) return value.destination.trim() || "https://profilelink.me";
  if (shortUrl) return shortUrl;
  // Same value on server and client, so the preview hydrates cleanly.
  const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "https://profilelink.me";
  return `${base}/r/${PLACEHOLDER_CODE}`;
}

// ---------- small building blocks ----------

const SAMPLE = ["11011", "10110", "01101", "11001", "10111"];

function DotSample({ shape }: { shape: QrStyle["dot"] }) {
  const d = dotsPath(5, (r, c) => r >= 0 && c >= 0 && r < 5 && c < 5 && SAMPLE[r][c] === "1", shape, 0, 0);
  return (
    <svg viewBox="-.3 -.3 5.6 5.6" className="w-10 h-10" aria-hidden>
      <path d={d} fill="currentColor" />
    </svg>
  );
}

function EyeSample({ frame, ball }: { frame: QrStyle["eyeFrame"]; ball: QrStyle["eyeBall"] }) {
  const e = eyePaths(0, 0, frame, ball);
  return (
    <svg viewBox="-.4 -.4 7.8 7.8" className="w-8 h-8" aria-hidden>
      <path d={e.ring} fill="currentColor" fillRule="evenodd" />
      <path d={e.center} fill="currentColor" />
    </svg>
  );
}

function Tile({
  pressed,
  label,
  onClick,
  children,
}: {
  pressed: boolean;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1.5 rounded-xl border px-1 pt-2.5 pb-2 text-[12px] transition-all",
        pressed
          ? "border-primary-container bg-primary-fixed/40 text-on-surface font-semibold ring-2 ring-primary-fixed"
          : "border-outline-variant/40 bg-surface-container-lowest text-on-surface-variant hover:border-outline",
      )}
    >
      <span className="text-on-surface">{children}</span>
      {label}
    </button>
  );
}

function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div role="group" aria-label={label} className="flex gap-1 rounded-xl bg-surface-container p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={o.value === value}
          onClick={() => onChange(o.value)}
          className={cn(
            "flex-1 h-8 rounded-lg px-1 text-[12px] font-semibold whitespace-nowrap transition-all",
            o.value === value
              ? "bg-surface-container-lowest text-on-surface shadow-sm"
              : "text-on-surface-variant hover:text-on-surface",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Switch({
  checked,
  onChange,
  label,
  hint,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint?: string;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <label htmlFor={id} className={cn("flex items-center justify-between gap-space-md", disabled && "opacity-60")}>
      <span className="min-w-0">
        <span className="block text-label-md text-on-surface">{label}</span>
        {hint ? <span className="block text-body-sm text-on-surface-variant">{hint}</span> : null}
      </span>
      <input
        id={id}
        type="checkbox"
        role="switch"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className={cn(
          "relative h-6 w-10 shrink-0 rounded-full transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-primary-container",
          checked ? "bg-primary-container" : "bg-outline-variant",
        )}
      >
        <span
          className={cn(
            "absolute top-1 left-1 h-4 w-4 rounded-full bg-white shadow transition-transform",
            checked && "translate-x-4",
          )}
        />
      </span>
    </label>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [draft, setDraft] = useState<string | null>(null);
  function commit(raw: string) {
    const v = raw.trim().startsWith("#") ? raw.trim() : `#${raw.trim()}`;
    if (/^#[0-9a-fA-F]{6}$/.test(v)) onChange(v.toUpperCase());
    setDraft(null);
  }
  return (
    <div className="flex items-center gap-space-sm">
      <input
        type="color"
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value.toUpperCase())}
        className="h-11 w-11 shrink-0 cursor-pointer rounded-lg border border-outline-variant/40 bg-surface-container-lowest p-1"
      />
      <input
        aria-label={label}
        value={draft ?? value}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={(e) => commit(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && commit(e.currentTarget.value)}
        className="h-11 w-full min-w-0 rounded-lg border border-transparent bg-surface-container-low px-space-md font-mono text-code-sm uppercase outline-none focus:border-primary-container focus:bg-surface-container-lowest"
      />
    </div>
  );
}

function FieldLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="block text-label-sm text-on-surface-variant">
      {children}
    </label>
  );
}

// ---------- studio ----------

export function QrStudio({ value, onChange, mode, canDynamic, shortUrl, onSave, saving, saveLabel }: QrStudioProps) {
  const t = useT();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>("content");
  const [format, setFormat] = useState<"svg" | "png">("png");
  const [pngSize, setPngSize] = useState<(typeof PNG_SIZES)[number]>(2048);
  const ids = { name: useId(), dest: useId(), mono: useId(), frameText: useId(), logoSize: useId(), margin: useId(), size: useId(), upload: useId() };

  const { style } = value;
  const setStyle = (patch: Partial<QrStyle>) => onChange({ ...value, style: { ...style, ...patch } });

  const text = encodedTextFor(value, shortUrl);
  const rendered = useMemo(() => renderStyledQr(text, style), [text, style]);
  const scan = useMemo(() => scanScore(style), [style]);
  const destinationValid = isValidDestination(value.destination.trim());
  const filename = slugifyFilename(value.name || value.destination.replace(/^https?:\/\//, ""));
  const quietCm = Math.max(2, Math.ceil((rendered.modules + 2 * style.margin) * 0.4) / 10);
  const gradeColor =
    scan.grade === "excellent" ? "text-emerald-600" : scan.grade === "fair" ? "text-amber-600" : "text-error";
  const gaugeStroke = scan.grade === "excellent" ? "#059669" : scan.grade === "fair" ? "#D97706" : "#BA1A1A";
  const circumference = 2 * Math.PI * 26;

  function applyTemplate(id: string) {
    const next = templateStyle(id);
    // Keep the user's own uploaded logo when switching looks.
    if (style.logo === "image" && style.logoData) {
      next.logo = "image";
      next.logoData = style.logoData;
      if (next.ecl === "L" || next.ecl === "M") next.ecl = "H";
    }
    onChange({ ...value, style: next });
    toast(t("app.qrStudio.templates.applied", { name: t(`app.qrStudio.templates.names.${id}`) }));
  }

  function onUpload(file: File | undefined) {
    if (!file) return;
    if (!/^image\/(png|jpeg|webp|svg\+xml)$/.test(file.type)) {
      toast(t("app.qrStudio.logo.badType"));
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      toast(t("app.qrStudio.logo.tooLarge"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const raised = style.ecl === "L" || style.ecl === "M";
      setStyle({ logo: "image", logoData: String(reader.result), ecl: raised ? "H" : style.ecl });
      if (raised) toast(t("app.qrStudio.logo.eclRaised"));
    };
    reader.readAsDataURL(file);
  }

  async function exportFile() {
    try {
      if (format === "svg") downloadQrSvg(text, style, filename);
      else await downloadQrPng(text, style, filename, pngSize);
      toast(t("app.qrStudio.export.downloaded", { format: format.toUpperCase() }));
    } catch {
      toast(t("app.qrStudio.export.failed"));
    }
  }

  async function copySvg() {
    try {
      await navigator.clipboard.writeText(rendered.svg);
      toast(t("app.qrStudio.export.copied"));
    } catch {
      toast(t("app.qrStudio.export.copyFailed"));
    }
  }

  const panelTitle = "text-headline-md font-semibold text-on-surface";

  return (
    <div className="grid gap-space-md lg:grid-cols-[340px_minmax(0,1fr)] 2xl:grid-cols-[360px_minmax(0,1fr)_300px] items-start">
      {/* Controls */}
      <section className="order-2 lg:order-1 rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/20 overflow-hidden grid grid-cols-1 sm:grid-cols-[76px_minmax(0,1fr)] lg:min-h-[620px]">
        <div
          role="tablist"
          aria-label={t("app.qrStudio.content.title")}
          className="flex sm:flex-col gap-1 overflow-x-auto no-scrollbar bg-surface-container-low border-b sm:border-b-0 sm:border-r border-outline-variant/30 p-1.5"
        >
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              onClick={() => setTab(item.id)}
              className={cn(
                "flex flex-1 sm:flex-none flex-col items-center gap-1 rounded-lg px-1 py-2 text-[11px] transition-all min-w-14",
                tab === item.id
                  ? "bg-surface-container-lowest text-primary-container font-bold shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface",
              )}
            >
              <Icon name={item.icon} className="text-[20px]" />
              {t(`app.qrStudio.tabs.${item.id}`)}
            </button>
          ))}
        </div>

        <div className="p-space-md sm:p-space-lg flex flex-col gap-space-lg min-w-0" role="tabpanel">
          {tab === "content" ? (
            <>
              <h2 className={panelTitle}>{t("app.qrStudio.content.title")}</h2>
              {mode === "app" ? (
                <div className="flex flex-col gap-1.5">
                  <FieldLabel htmlFor={ids.name}>{t("app.qrStudio.content.name")}</FieldLabel>
                  <input
                    id={ids.name}
                    value={value.name}
                    maxLength={80}
                    placeholder={t("app.qrStudio.content.namePh")}
                    onChange={(e) => onChange({ ...value, name: e.target.value })}
                    className="h-11 w-full rounded-lg border border-transparent bg-surface-container-low px-space-md outline-none focus:border-primary-container focus:bg-surface-container-lowest"
                  />
                </div>
              ) : null}
              <div className="flex flex-col gap-1.5">
                <FieldLabel htmlFor={ids.dest}>{t("app.qrStudio.content.destination")}</FieldLabel>
                <input
                  id={ids.dest}
                  type="url"
                  inputMode="url"
                  value={value.destination}
                  placeholder={t("app.qrStudio.content.destinationPh")}
                  onChange={(e) => onChange({ ...value, destination: e.target.value })}
                  aria-invalid={!destinationValid}
                  className={cn(
                    "h-11 w-full rounded-lg border bg-surface-container-low px-space-md font-mono text-code-sm outline-none focus:bg-surface-container-lowest",
                    destinationValid ? "border-transparent focus:border-primary-container" : "border-error",
                  )}
                />
                {!destinationValid ? (
                  <p className="text-body-sm text-error">{t("app.qrStudio.content.invalidUrl")}</p>
                ) : null}
              </div>
              <div className="rounded-xl bg-surface-container-low p-space-md flex flex-col gap-space-sm">
                <Switch
                  checked={value.dynamic}
                  disabled={!canDynamic}
                  onChange={(v) => onChange({ ...value, dynamic: v })}
                  label={t("app.qrStudio.content.dynamic")}
                  hint={
                    canDynamic
                      ? t("app.qrStudio.content.dynamicHint")
                      : mode === "public"
                        ? t("app.qrStudio.content.dynamicPublic")
                        : t("app.qrStudio.content.dynamicPro")
                  }
                />
                {value.dynamic ? (
                  <div className="rounded-lg bg-surface-container-lowest border border-outline-variant/30 px-space-sm py-2">
                    <span className="block text-[11px] uppercase tracking-wider text-on-surface-variant">
                      {t("app.qrStudio.content.encoded")}
                    </span>
                    <span className="block font-mono text-code-sm text-primary-container break-all">
                      {shortUrl ?? t("app.qrStudio.content.encodedPending")}
                    </span>
                  </div>
                ) : null}
              </div>
              <div className="flex flex-col gap-1.5">
                <FieldLabel>{t("app.qrStudio.content.ecl")}</FieldLabel>
                <Segmented
                  label={t("app.qrStudio.content.ecl")}
                  value={style.ecl}
                  onChange={(ecl) => setStyle({ ecl })}
                  options={ECLS.map((e) => ({ value: e, label: `${e} ${{ L: 7, M: 15, Q: 25, H: 30 }[e]}%` }))}
                />
                <p className="text-body-sm text-on-surface-variant">{t("app.qrStudio.content.eclHint")}</p>
              </div>
            </>
          ) : null}

          {tab === "pattern" ? (
            <>
              <h2 className={panelTitle}>{t("app.qrStudio.pattern.title")}</h2>
              <p className="text-body-sm text-on-surface-variant -mt-space-sm">{t("app.qrStudio.pattern.hint")}</p>
              <div className="grid grid-cols-3 gap-space-sm">
                {DOT_SHAPES.map((shape) => (
                  <Tile
                    key={shape}
                    pressed={style.dot === shape}
                    label={t(`app.qrStudio.pattern.shapes.${shape}`)}
                    onClick={() => setStyle({ dot: shape })}
                  >
                    <DotSample shape={shape} />
                  </Tile>
                ))}
              </div>
            </>
          ) : null}

          {tab === "corners" ? (
            <>
              <h2 className={panelTitle}>{t("app.qrStudio.corners.title")}</h2>
              <div className="flex flex-col gap-1.5">
                <FieldLabel>{t("app.qrStudio.corners.frame")}</FieldLabel>
                <div className="grid grid-cols-4 gap-space-sm">
                  {EYE_FRAMES.map((frame) => (
                    <Tile
                      key={frame}
                      pressed={style.eyeFrame === frame}
                      label={t(`app.qrStudio.corners.shapes.${frame}`)}
                      onClick={() => setStyle({ eyeFrame: frame })}
                    >
                      <EyeSample frame={frame} ball="square" />
                    </Tile>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <FieldLabel>{t("app.qrStudio.corners.center")}</FieldLabel>
                <div className="grid grid-cols-5 gap-space-xs">
                  {EYE_BALLS.map((ball) => (
                    <Tile
                      key={ball}
                      pressed={style.eyeBall === ball}
                      label={t(`app.qrStudio.corners.shapes.${ball}`)}
                      onClick={() => setStyle({ eyeBall: ball })}
                    >
                      <EyeSample frame="square" ball={ball} />
                    </Tile>
                  ))}
                </div>
              </div>
              <Switch
                checked={!!style.eyeColor}
                onChange={(v) => setStyle({ eyeColor: v ? "#A33900" : null })}
                label={t("app.qrStudio.corners.custom")}
              />
              {style.eyeColor ? (
                <ColorField
                  label={t("app.qrStudio.colors.cornerColor")}
                  value={style.eyeColor}
                  onChange={(eyeColor) => setStyle({ eyeColor })}
                />
              ) : null}
            </>
          ) : null}

          {tab === "colors" ? (
            <>
              <h2 className={panelTitle}>{t("app.qrStudio.colors.title")}</h2>
              <div className="flex flex-col gap-1.5">
                <FieldLabel>{t("app.qrStudio.colors.fg")}</FieldLabel>
                <ColorField label={t("app.qrStudio.colors.fg")} value={style.fg} onChange={(fg) => setStyle({ fg })} />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {SWATCHES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      aria-label={c}
                      onClick={() => setStyle({ fg: c })}
                      className="h-7 w-7 rounded-full border-2 border-surface-container-lowest ring-1 ring-outline-variant/50"
                      style={{ background: c }}
                    />
                  ))}
                </div>
              </div>
              <div className="rounded-xl bg-surface-container-low p-space-md flex flex-col gap-space-md">
                <Switch
                  checked={style.gradient !== "none"}
                  onChange={(v) => setStyle({ gradient: v ? "linear" : "none" })}
                  label={t("app.qrStudio.colors.gradient")}
                />
                {style.gradient !== "none" ? (
                  <>
                    <ColorField label={t("app.qrStudio.colors.second")} value={style.fg2} onChange={(fg2) => setStyle({ fg2 })} />
                    <Segmented
                      label={t("app.qrStudio.colors.gradient")}
                      value={style.gradient}
                      onChange={(gradient) => setStyle({ gradient })}
                      options={[
                        { value: "linear", label: t("app.qrStudio.colors.linear") },
                        { value: "radial", label: t("app.qrStudio.colors.radial") },
                      ]}
                    />
                  </>
                ) : null}
              </div>
              <div className="flex flex-col gap-1.5">
                <FieldLabel>{t("app.qrStudio.colors.bg")}</FieldLabel>
                <ColorField label={t("app.qrStudio.colors.bg")} value={style.bg} onChange={(bg) => setStyle({ bg })} />
              </div>
              <Switch
                checked={style.transparent}
                onChange={(transparent) => setStyle({ transparent })}
                label={t("app.qrStudio.colors.transparent")}
              />
            </>
          ) : null}

          {tab === "logo" ? (
            <>
              <h2 className={panelTitle}>{t("app.qrStudio.logo.title")}</h2>
              <div className="grid grid-cols-3 gap-space-sm">
                {LOGO_KINDS.map((kind) => (
                  <Tile
                    key={kind}
                    pressed={style.logo === kind}
                    label={t(`app.qrStudio.logo.kinds.${kind}`)}
                    onClick={() => setStyle({ logo: kind })}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                      dangerouslySetInnerHTML={{
                        __html:
                          kind === "none"
                            ? '<path d="M5 5l14 14M19 5 5 19"/>'
                            : kind === "mono"
                              ? '<text x="12" y="16.5" text-anchor="middle" font-size="12" font-weight="800" fill="currentColor" stroke="none">AB</text>'
                              : LOGO_ICONS[kind],
                      }}
                    />
                  </Tile>
                ))}
              </div>
              {style.logo === "mono" ? (
                <div className="flex flex-col gap-1.5">
                  <FieldLabel htmlFor={ids.mono}>{t("app.qrStudio.logo.initials")}</FieldLabel>
                  <input
                    id={ids.mono}
                    maxLength={2}
                    value={style.mono}
                    onChange={(e) => setStyle({ mono: e.target.value })}
                    className="h-11 w-24 rounded-lg border border-transparent bg-surface-container-low px-space-md uppercase outline-none focus:border-primary-container"
                  />
                </div>
              ) : null}
              <label
                htmlFor={ids.upload}
                className={cn(
                  "flex cursor-pointer flex-col items-center gap-1 rounded-xl border-[1.5px] border-dashed p-space-md text-center transition-colors",
                  style.logo === "image"
                    ? "border-primary-container bg-primary-fixed/30"
                    : "border-outline-variant hover:border-primary-container",
                )}
              >
                {style.logo === "image" && style.logoData ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={style.logoData} alt="" className="h-12 w-12 object-contain" />
                ) : (
                  <Icon name="upload" className="text-[24px] text-primary-container" />
                )}
                <span className="text-label-md text-on-surface">
                  {style.logoData ? t("app.qrStudio.logo.replace") : t("app.qrStudio.logo.upload")}
                </span>
                <span className="text-body-sm text-on-surface-variant">{t("app.qrStudio.logo.uploadHint")}</span>
                <input
                  id={ids.upload}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="sr-only"
                  onChange={(e) => {
                    onUpload(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
              </label>
              {style.logoData && style.logo !== "image" ? (
                <Button variant="outline" size="sm" onClick={() => setStyle({ logo: "image" })}>
                  {t("app.qrStudio.logo.kinds.image")}
                </Button>
              ) : null}
              <div className="flex flex-col gap-1.5">
                <FieldLabel htmlFor={ids.logoSize}>
                  {t("app.qrStudio.logo.size", { value: Math.round(style.logoSize * 100) })}
                </FieldLabel>
                <input
                  id={ids.logoSize}
                  type="range"
                  min={14}
                  max={30}
                  value={Math.round(style.logoSize * 100)}
                  onChange={(e) => setStyle({ logoSize: Number(e.target.value) / 100 })}
                  className="w-full accent-primary-container"
                />
              </div>
            </>
          ) : null}

          {tab === "frame" ? (
            <>
              <h2 className={panelTitle}>{t("app.qrStudio.frame.title")}</h2>
              <div className="grid grid-cols-4 gap-space-sm">
                {FRAMES.map((frame) => (
                  <Tile
                    key={frame}
                    pressed={style.frame === frame}
                    label={t(`app.qrStudio.frame.kinds.${frame}`)}
                    onClick={() => setStyle({ frame })}
                  >
                    <FrameIcon kind={frame} />
                  </Tile>
                ))}
              </div>
              {style.frame !== "none" ? (
                <div className="flex flex-col gap-1.5">
                  <FieldLabel htmlFor={ids.frameText}>{t("app.qrStudio.frame.text")}</FieldLabel>
                  <input
                    id={ids.frameText}
                    maxLength={24}
                    value={style.frameText}
                    onChange={(e) => setStyle({ frameText: e.target.value })}
                    className="h-11 w-full rounded-lg border border-transparent bg-surface-container-low px-space-md outline-none focus:border-primary-container focus:bg-surface-container-lowest"
                  />
                </div>
              ) : null}
              <div className="flex flex-col gap-1.5">
                <FieldLabel htmlFor={ids.margin}>{t("app.qrStudio.frame.margin", { value: style.margin })}</FieldLabel>
                <input
                  id={ids.margin}
                  type="range"
                  min={0}
                  max={6}
                  value={style.margin}
                  onChange={(e) => setStyle({ margin: Number(e.target.value) })}
                  className="w-full accent-primary-container"
                />
                <p className="text-body-sm text-on-surface-variant">{t("app.qrStudio.frame.marginHint")}</p>
              </div>
            </>
          ) : null}
        </div>
      </section>

      {/* Preview */}
      <section className="order-1 lg:order-2 flex flex-col gap-space-md min-w-0">
        <div className="rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/20 overflow-hidden">
          <div
            className="grid place-items-center p-space-lg sm:p-space-xl min-h-[360px] lg:min-h-[520px]"
            style={{
              backgroundImage: "radial-gradient(var(--color-outline-variant) 1px, transparent 1px)",
              backgroundSize: "18px 18px",
            }}
          >
            <div
              className={cn(
                "w-full max-w-[400px] rounded-2xl",
                style.transparent &&
                  "bg-[conic-gradient(#e6e8ea_25%,transparent_0_50%,#e6e8ea_0_75%,transparent_0)] bg-[length:16px_16px]",
              )}
            >
              <div
                role="img"
                aria-label={t("app.qrStudio.previewAlt")}
                className="[&>svg]:block [&>svg]:w-full [&>svg]:h-auto drop-shadow-[0_18px_28px_rgba(15,23,42,0.14)]"
                dangerouslySetInnerHTML={{ __html: rendered.svg }}
              />
            </div>
          </div>
          <dl className="grid grid-cols-2 sm:grid-cols-4 border-t border-outline-variant/30">
            {[
              [t("app.qrStudio.specs.version"), `v${rendered.version}`],
              [t("app.qrStudio.specs.modules"), `${rendered.modules} × ${rendered.modules}`],
              [t("app.qrStudio.specs.ecl"), `${style.ecl} · ${{ L: 7, M: 15, Q: 25, H: 30 }[style.ecl]} %`],
              [t("app.qrStudio.specs.minSize"), `${quietCm.toFixed(1)} cm`],
            ].map(([k, v], i) => (
              <div
                key={k}
                className={cn(
                  "px-space-md py-space-sm border-outline-variant/30",
                  i % 2 === 0 && "border-r",
                  i === 1 && "sm:border-r",
                  i < 2 && "border-b sm:border-b-0",
                )}
              >
                <dt className="text-[11px] uppercase tracking-wider text-on-surface-variant">{k}</dt>
                <dd className="font-mono text-code-sm text-on-surface tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Side: readability, templates, export */}
      <aside className="order-3 lg:col-span-2 2xl:col-span-1 grid gap-space-md sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-1 items-start">
        <div className="rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/20 p-space-lg flex flex-col gap-space-md">
          <h2 className="text-label-md text-on-surface">{t("app.qrStudio.scan.title")}</h2>
          <div className="flex items-center gap-space-md">
            <svg viewBox="0 0 64 64" className="h-16 w-16 shrink-0" aria-hidden>
              <circle cx="32" cy="32" r="26" fill="none" stroke="var(--color-surface-container)" strokeWidth="7" />
              <circle
                cx="32"
                cy="32"
                r="26"
                fill="none"
                stroke={gaugeStroke}
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray={`${(circumference * scan.score) / 100} ${circumference}`}
                transform="rotate(-90 32 32)"
              />
              <text x="32" y="33" textAnchor="middle" dominantBaseline="middle" fontSize="15" fontWeight="600" fill="var(--color-on-surface)">
                {scan.score}
              </text>
            </svg>
            <div>
              <p className={cn("text-headline-md font-bold", gradeColor)}>{t(`app.qrStudio.scan.grades.${scan.grade}`)}</p>
              <p className="text-body-sm text-on-surface-variant">{t("app.qrStudio.scan.outOf")}</p>
            </div>
          </div>
          <ul className="flex flex-col gap-space-xs">
            {scan.issues.map((issue) => (
              <li key={issue.key} className="flex gap-space-sm text-body-sm text-on-surface-variant">
                <span
                  aria-hidden
                  className={cn(
                    "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                    issue.level === "good" ? "bg-emerald-500" : issue.level === "warn" ? "bg-amber-500" : "bg-error",
                  )}
                />
                {t(`app.qrStudio.scan.${issue.key}`, issue.vars)}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/20 p-space-lg flex flex-col gap-space-md">
          <h2 className="text-label-md text-on-surface">{t("app.qrStudio.templates.quick")}</h2>
          <div className="grid grid-cols-4 gap-1.5">
            {QR_TEMPLATES.slice(0, 8).map((tpl) => {
              const s = { ...templateStyle(tpl.id), margin: 1, frame: "none" as const, logo: "none" as const, ecl: "L" as const };
              const name = t(`app.qrStudio.templates.names.${tpl.id}`);
              return (
                <button
                  key={tpl.id}
                  type="button"
                  title={name}
                  aria-label={t("app.qrStudio.templates.apply", { name })}
                  onClick={() => applyTemplate(tpl.id)}
                  className="aspect-square rounded-lg border border-outline-variant/40 p-1 hover:border-on-surface transition-colors"
                  style={{ background: s.bg }}
                >
                  <QrSvg text="profilelink" style={s} />
                </button>
              );
            })}
          </div>
          <Button variant="ghost" size="sm" onClick={() => onChange({ ...value, style: DEFAULT_STYLE })}>
            <Icon name="restart_alt" className="text-[18px]" /> {t("app.qrStudio.reset")}
          </Button>
        </div>

        <div className="rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/20 p-space-lg flex flex-col gap-space-md">
          <h2 className="text-label-md text-on-surface">{t("app.qrStudio.export.title")}</h2>
          <Segmented
            label={t("app.qrStudio.export.format")}
            value={format}
            onChange={setFormat}
            options={[
              { value: "png", label: "PNG" },
              { value: "svg", label: "SVG" },
            ]}
          />
          {format === "png" ? (
            <div className="flex flex-col gap-1.5">
              <FieldLabel htmlFor={ids.size}>{t("app.qrStudio.export.size")}</FieldLabel>
              <select
                id={ids.size}
                value={pngSize}
                onChange={(e) => setPngSize(Number(e.target.value) as (typeof PNG_SIZES)[number])}
                className="h-11 w-full rounded-lg bg-surface-container-low px-space-sm outline-none border border-transparent focus:border-primary-container"
              >
                {PNG_SIZES.map((s) => (
                  <option key={s} value={s}>
                    {t(`app.qrStudio.export.sizes.${s}`)}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
          <Button variant="brand" onClick={() => void exportFile()} disabled={!destinationValid}>
            <Icon name="download" className="text-[18px]" /> {t("app.qrStudio.export.download")}
          </Button>
          <Button variant="outline" onClick={() => void copySvg()} disabled={!destinationValid}>
            <Icon name="code" className="text-[18px]" /> {t("app.qrStudio.export.copySvg")}
          </Button>
          {mode === "app" && onSave ? (
            <Button onClick={onSave} disabled={saving || !destinationValid || !value.name.trim()}>
              <Icon name="save" className="text-[18px]" />
              {saving ? t("app.qrStudio.saving") : (saveLabel ?? t("app.qrStudio.save"))}
            </Button>
          ) : null}
        </div>
      </aside>
    </div>
  );
}

function FrameIcon({ kind }: { kind: QrStyle["frame"] }) {
  return (
    <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden>
      {kind === "none" ? <rect x="6" y="6" width="12" height="12" rx="1" /> : null}
      {kind === "label" ? (
        <>
          <rect x="4" y="2" width="16" height="20" rx="3" fill="currentColor" />
          <rect x="6.5" y="4.5" width="11" height="11" rx="1.5" fill="var(--color-surface-container-lowest)" stroke="none" />
        </>
      ) : null}
      {kind === "bubble" ? (
        <>
          <rect x="6" y="2" width="12" height="4" rx="2" fill="currentColor" />
          <rect x="5" y="9" width="14" height="13" rx="1.5" />
        </>
      ) : null}
      {kind === "ticket" ? (
        <>
          <rect x="4" y="2" width="16" height="20" rx="3" />
          <path d="M4 17h16" strokeDasharray="2 2" />
        </>
      ) : null}
    </svg>
  );
}

/** Background for showing a template on its own colors (dark templates need their own ground). */
export function templateGround(style: QrStyle) {
  return isDarkColor(style.bg) ? style.bg : undefined;
}
