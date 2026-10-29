"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useToast } from "@/components/ui/Toast";
import { localizedPath } from "@/i18n/path";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/cn";
import type { QrStyle } from "@/lib/qr-style";
import { QrSvg } from "./QrSvg";
import { isValidDestination } from "./QrStudio";

type QrRow = {
  id: string;
  name: string;
  destination: string;
  dynamic: boolean;
  shortUrl: string;
  encodedText: string;
  style: QrStyle;
  scans: number;
  updatedAt: string;
  daily: number[];
};

type Share = { label: string; count: number; percent: number };
type Detail = { total: number; devices: Share[]; cities: Share[]; since: string };

const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);

function Sparkline({ data }: { data: number[] }) {
  const w = 120;
  const h = 24;
  const max = Math.max(...data, 1);
  const pts = data.map((v, i) => [
    +((i / Math.max(data.length - 1, 1)) * (w - 4) + 2).toFixed(2),
    +(h - 3 - (v / max) * (h - 6)).toFixed(2),
  ]);
  const line = pts.map((p) => p.join(",")).join(" ");
  const last = pts[pts.length - 1];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-6 w-full max-w-[120px]" aria-hidden>
      <polygon points={`2,${h} ${line} ${w - 2},${h}`} fill="var(--color-primary-fixed)" />
      <polyline points={line} fill="none" stroke="var(--color-primary-container)" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
      {last ? <circle cx={last[0]} cy={last[1]} r={2.2} fill="var(--color-primary-container)" /> : null}
    </svg>
  );
}

function DailyChart({ data, since, numLocale }: { data: number[]; since: string; numLocale: string }) {
  const W = 340;
  const H = 150;
  const L = 30;
  const B = 20;
  const max = Math.max(...data, 1);
  const step = max > 200 ? 100 : max > 80 ? 50 : max > 30 ? 20 : max > 10 ? 5 : max > 4 ? 2 : 1;
  const top = Math.ceil(max / step) * step;
  const bw = (W - L) / data.length;
  const ticks: number[] = [];
  for (let v = 0; v <= top; v += step) ticks.push(v);
  const y = (v: number) => H - B - (v / top) * (H - B - 8);
  const start = new Date(since);
  const dayLabel = (i: number) =>
    new Date(start.getTime() + i * 86_400_000).toLocaleDateString(numLocale, { day: "numeric", month: "short" });
  const labelIdx = [0, Math.floor(data.length / 2), data.length - 1];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto min-w-[300px]" role="img">
      {ticks.map((v) => (
        <g key={v}>
          <line x1={L} x2={W} y1={y(v)} y2={y(v)} stroke="var(--color-outline-variant)" strokeOpacity={0.5} />
          <text x={L - 6} y={y(v)} textAnchor="end" dominantBaseline="middle" fontSize={10} fill="var(--color-on-surface-variant)">
            {v}
          </text>
        </g>
      ))}
      {data.map((v, i) => {
        const h = (v / top) * (H - B - 8);
        return (
          <rect
            key={i}
            x={L + i * bw + 1.5}
            y={H - B - h}
            width={Math.max(bw - 3, 1)}
            height={h}
            rx={1.5}
            fill={i >= data.length - 7 ? "var(--color-primary-container)" : "var(--color-primary-fixed-dim)"}
          >
            <title>{`${dayLabel(i)} · ${v}`}</title>
          </rect>
        );
      })}
      {labelIdx.map((i, k) => (
        <text
          key={i}
          x={L + i * bw + bw / 2}
          y={H - 4}
          textAnchor={k === 0 ? "start" : k === 2 ? "end" : "middle"}
          fontSize={10}
          fill="var(--color-on-surface-variant)"
        >
          {dayLabel(i)}
        </text>
      ))}
    </svg>
  );
}

function ShareList({ title, items, labelOf }: { title: string; items: Share[]; labelOf: (s: string) => string }) {
  return (
    <div className="flex flex-col gap-space-xs">
      <span className="text-label-sm text-on-surface-variant">{title}</span>
      {items.map((s) => (
        <div key={s.label} className="grid grid-cols-[84px_minmax(0,1fr)_40px] items-center gap-space-sm text-body-sm">
          <span className="truncate">{labelOf(s.label)}</span>
          <span className="h-2 rounded-full bg-surface-container overflow-hidden">
            <span className="block h-full rounded-full bg-on-surface" style={{ width: `${s.percent}%` }} />
          </span>
          <span className="text-right tabular-nums text-on-surface-variant">{s.percent} %</span>
        </div>
      ))}
    </div>
  );
}

export function QrCodesView() {
  const router = useRouter();
  const { locale, t } = useI18n();
  const { toast } = useToast();
  const numLocale = locale === "en" ? "en-US" : "fr-FR";
  const nf = useMemo(() => new Intl.NumberFormat(numLocale), [numLocale]);

  const [rows, setRows] = useState<QrRow[]>([]);
  const [totalScans, setTotalScans] = useState(0);
  const [since, setSince] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<(Detail & { id: string }) | null>(null);
  const [draft, setDraft] = useState<{ id: string; value: string } | null>(null);
  const [updating, setUpdating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/qr-codes");
        if (res.status === 401) {
          router.push(localizedPath(locale, "/connexion"));
          return;
        }
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? t("app.qrCodes.errorLoad"));
          return;
        }
        setRows(data.qrCodes);
        setTotalScans(data.stats.total);
        setSince(data.stats.since);
        setSelectedId((cur) => cur ?? data.qrCodes[0]?.id ?? null);
      } catch {
        setError(t("common.networkError"));
      } finally {
        setLoading(false);
      }
    })();
  }, [router, locale, t]);

  const selected = rows.find((r) => r.id === selectedId) ?? null;
  const selectedDetail = detail && detail.id === selectedId ? detail : null;
  const destDraft = draft && draft.id === selectedId ? draft.value : (selected?.destination ?? "");

  useEffect(() => {
    if (!selectedId) return;
    let cancelled = false;
    void fetch(`/api/qr-codes/${selectedId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data) setDetail({ ...data.stats, id: selectedId });
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  async function updateDestination() {
    if (!selected || !isValidDestination(destDraft.trim())) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/qr-codes/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination: destDraft.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? t("common.serverError"));
        return;
      }
      setRows((all) => all.map((r) => (r.id === selected.id ? { ...r, destination: data.qrCode.destination } : r)));
      toast(t("app.qrCodes.updated", { url: data.qrCode.destination }));
    } catch {
      toast(t("common.networkError"));
    } finally {
      setUpdating(false);
    }
  }

  async function remove() {
    if (!selected) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/qr-codes/${selected.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast(data.error ?? t("common.serverError"));
        return;
      }
      const remaining = rows.filter((r) => r.id !== selected.id);
      setRows(remaining);
      setSelectedId(remaining[0]?.id ?? null);
      toast(t("app.qrCodes.deleted"));
    } catch {
      toast(t("common.networkError"));
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  async function copyShort(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      toast(t("app.qrCodes.copiedShort"));
    } catch {
      toast(t("app.qrStudio.export.copyFailed"));
    }
  }

  const dynamicCount = rows.filter((r) => r.dynamic).length;
  const top = rows.reduce<QrRow | null>((best, r) => (sum(r.daily) > (best ? sum(best.daily) : 0) ? r : best), null);

  return (
    <div className="flex flex-col gap-space-lg w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
        <div>
          <h1 className="text-headline-lg font-bold text-on-surface">{t("app.qrCodes.title")}</h1>
          <p className="text-body-md text-on-surface-variant mt-1">{t("app.qrCodes.subtitle")}</p>
        </div>
        <Button href="/app/qr-codes/nouveau">
          <Icon name="add" /> {t("app.qrCodes.create")}
        </Button>
      </div>

      {loading ? (
        <p className="text-body-md text-on-surface-variant">{t("app.qrCodes.loading")}</p>
      ) : error ? (
        <div className="rounded-lg bg-error-container text-on-error-container p-space-md">{error}</div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl bg-surface-container-lowest p-space-xl text-center shadow-sm">
          <Icon name="qr_code_2" className="text-4xl text-primary mb-space-sm" />
          <h2 className="text-headline-md font-semibold mb-2">{t("app.qrCodes.emptyTitle")}</h2>
          <p className="text-body-md text-on-surface-variant mb-space-md">{t("app.qrCodes.emptyBody")}</p>
          <Button href="/app/qr-codes/nouveau">{t("app.qrCodes.emptyCta")}</Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md">
            <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm">
              <p className="text-label-sm text-on-surface-variant">{t("app.qrCodes.kpiScans")}</p>
              <p className="text-headline-xl font-bold tabular-nums">{nf.format(totalScans)}</p>
            </div>
            <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm">
              <p className="text-label-sm text-on-surface-variant">{t("app.qrCodes.kpiCodes")}</p>
              <p className="text-headline-xl font-bold tabular-nums">{rows.length}</p>
              <p className="text-body-sm text-on-surface-variant">
                {t("app.qrCodes.kpiCodesDetail", { dynamic: dynamicCount, static: rows.length - dynamicCount })}
              </p>
            </div>
            <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm min-w-0">
              <p className="text-label-sm text-on-surface-variant">{t("app.qrCodes.kpiTop")}</p>
              {top ? (
                <>
                  <p className="text-headline-md font-semibold truncate">{top.name}</p>
                  <p className="text-body-sm text-on-surface-variant tabular-nums">
                    {nf.format(sum(top.daily))} · {t("app.qrCodes.last30")}
                  </p>
                </>
              ) : (
                <p className="text-body-md text-on-surface-variant mt-1">{t("app.qrCodes.kpiTopNone")}</p>
              )}
            </div>
          </div>

          <div className="grid gap-space-md xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] items-start">
            <div role="listbox" aria-label={t("app.qrCodes.title")} className="rounded-2xl bg-surface-container-lowest shadow-sm overflow-hidden">
              <div className="hidden sm:grid grid-cols-[52px_minmax(0,1fr)_100px_130px] gap-space-md px-space-md py-space-sm border-b border-outline-variant/30 text-label-sm text-on-surface-variant">
                <span />
                <span>{t("app.qrCodes.colName")}</span>
                <span>{t("app.qrCodes.colType")}</span>
                <span className="text-right">{t("app.qrCodes.colScans")}</span>
              </div>
              {rows.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  role="option"
                  aria-selected={r.id === selectedId}
                  onClick={() => setSelectedId(r.id)}
                  className={cn(
                    "grid w-full grid-cols-[44px_minmax(0,1fr)_84px] sm:grid-cols-[52px_minmax(0,1fr)_100px_130px] items-center gap-space-md px-space-md py-space-sm text-left border-b border-outline-variant/20 last:border-b-0 transition-colors",
                    r.id === selectedId ? "bg-primary-fixed/40" : "hover:bg-surface-container-low",
                  )}
                >
                  <span className="rounded-lg p-1" style={{ background: r.style.bg }}>
                    <QrSvg text={r.encodedText} style={{ ...r.style, margin: 1, frame: "none" }} />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-label-md text-on-surface">{r.name}</span>
                    <span className="block truncate font-mono text-[12px] text-on-surface-variant">{r.destination}</span>
                  </span>
                  <span className="hidden sm:block">
                    <Badge tone={r.dynamic ? "primary" : "neutral"}>
                      {r.dynamic ? t("app.qrCodes.dynamic") : t("app.qrCodes.static")}
                    </Badge>
                  </span>
                  <span className="flex flex-col items-end gap-0.5">
                    <span className="text-label-md tabular-nums">{r.dynamic ? nf.format(sum(r.daily.slice(-14))) : "—"}</span>
                    {r.dynamic ? <Sparkline data={r.daily.slice(-14)} /> : null}
                  </span>
                </button>
              ))}
            </div>

            {selected ? (
              <section className="rounded-2xl bg-surface-container-lowest shadow-sm p-space-lg flex flex-col gap-space-lg min-w-0">
                <div className="grid grid-cols-[88px_minmax(0,1fr)] items-center gap-space-md">
                  <span className="rounded-xl p-1.5" style={{ background: selected.style.bg }}>
                    <QrSvg text={selected.encodedText} style={{ ...selected.style, margin: 1 }} title={selected.name} />
                  </span>
                  <div className="min-w-0 flex flex-col gap-1">
                    <Badge tone={selected.dynamic ? "primary" : "neutral"} className="self-start">
                      {selected.dynamic ? t("app.qrCodes.dynamic") : t("app.qrCodes.static")}
                    </Badge>
                    <h2 className="text-headline-md font-semibold text-on-surface truncate">{selected.name}</h2>
                    <p className="text-body-sm text-on-surface-variant">
                      {t("app.qrCodes.modified", {
                        date: new Date(selected.updatedAt).toLocaleDateString(numLocale, { day: "numeric", month: "long" }),
                      })}
                    </p>
                    {selected.dynamic ? (
                      <button
                        type="button"
                        onClick={() => void copyShort(selected.shortUrl)}
                        className="flex items-center gap-1 self-start font-mono text-code-sm text-primary-container hover:underline"
                        title={t("app.qrCodes.copyShort")}
                      >
                        {selected.shortUrl.replace(/^https?:\/\//, "")}
                        <Icon name="content_copy" className="text-[14px]" />
                      </button>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="qr-destination" className="text-label-sm text-on-surface-variant">
                    {t("app.qrCodes.destination")}
                  </label>
                  <div className="flex gap-space-sm">
                    <input
                      id="qr-destination"
                      value={destDraft}
                      disabled={!selected.dynamic}
                      onChange={(e) => setDraft({ id: selected.id, value: e.target.value })}
                      className="h-11 w-full min-w-0 rounded-lg border border-transparent bg-surface-container-low px-space-md font-mono text-code-sm outline-none focus:border-primary-container disabled:opacity-60"
                    />
                    {selected.dynamic ? (
                      <Button
                        variant="brand"
                        className="shrink-0 whitespace-nowrap"
                        onClick={() => void updateDestination()}
                        disabled={updating || destDraft.trim() === selected.destination || !isValidDestination(destDraft.trim())}
                      >
                        {t("app.qrCodes.update")}
                      </Button>
                    ) : null}
                  </div>
                  <p className="text-body-sm text-on-surface-variant">
                    {selected.dynamic ? t("app.qrCodes.dynamicNote") : t("app.qrCodes.staticNote")}
                  </p>
                </div>

                {selected.dynamic ? (
                  <>
                    <div className="flex flex-col gap-space-xs">
                      <div className="flex items-baseline justify-between gap-space-sm">
                        <span className="text-label-sm text-on-surface-variant">{t("app.qrCodes.daily")}</span>
                        <span className="text-body-sm">
                          <strong className="tabular-nums text-on-surface">{nf.format(sum(selected.daily))}</strong>{" "}
                          <span className="text-on-surface-variant">{t("app.qrCodes.last30")}</span>
                        </span>
                      </div>
                      <div className="overflow-x-auto">
                        {since ? <DailyChart data={selected.daily} since={since} numLocale={numLocale} /> : null}
                      </div>
                      <span className="text-[11px] text-on-surface-variant">{t("app.qrCodes.lastWeek")}</span>
                    </div>
                    {selectedDetail && selectedDetail.total > 0 ? (
                      <div className="grid gap-space-lg sm:grid-cols-2">
                        <ShareList
                          title={t("app.qrCodes.devices")}
                          items={selectedDetail.devices}
                          labelOf={(d) => t(`app.qrCodes.deviceNames.${d}`)}
                        />
                        {selectedDetail.cities.length ? (
                          <ShareList title={t("app.qrCodes.cities")} items={selectedDetail.cities} labelOf={(c) => c} />
                        ) : null}
                      </div>
                    ) : selectedDetail ? (
                      <p className="text-body-sm text-on-surface-variant">{t("app.qrCodes.noData")}</p>
                    ) : null}
                  </>
                ) : (
                  <p className="rounded-lg bg-surface-container-low p-space-sm text-body-sm text-on-surface-variant">
                    {t("app.qrCodes.staticNoStats")}
                  </p>
                )}

                <div className="flex flex-wrap gap-space-xs">
                  <Button href={`/app/qr-codes/${selected.id}`} variant="brand" size="sm">
                    <Icon name="edit" className="text-[18px]" /> {t("app.qrCodes.editStyle")}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(true)}>
                    <Icon name="delete" className="text-[18px]" /> {t("app.qrCodes.delete")}
                  </Button>
                </div>
              </section>
            ) : null}
          </div>
        </>
      )}

      <ConfirmModal
        open={confirmDelete}
        title={t("app.qrCodes.deleteTitle")}
        description={t("app.qrCodes.deleteBody")}
        confirmLabel={t("app.qrCodes.delete")}
        tone="danger"
        confirming={deleting}
        onConfirm={() => void remove()}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
