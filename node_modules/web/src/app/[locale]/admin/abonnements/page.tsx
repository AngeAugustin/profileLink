"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { AdminShell } from "@/components/admin/AdminShell";
import { useAdminAccess } from "@/components/admin/useAdminAccess";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { localizedPath } from "@/i18n/path";
import { useI18n, useT } from "@/i18n/provider";
import type { PlanId } from "@/lib/admin-catalog";

type PlanCard = {
  id: PlanId;
  name: string;
  priceMonthly: number;
  accounts: number;
  profiles: number;
  mrr: number;
};

export default function AdminSubscriptionsPage() {
  return (
    <AdminShell>
      <SubscriptionsContent />
    </AdminShell>
  );
}

function SubscriptionsContent() {
  const t = useT();
  const { locale } = useI18n();
  const { toast } = useToast();
  const { ready, forbidden } = useAdminAccess();
  const dateLocale = locale === "en" ? "en-US" : "fr-FR";

  const [plans, setPlans] = useState<PlanCard[]>([]);
  const [simulatedMrr, setSimulatedMrr] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<PlanCard | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/subscriptions");
      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? t("api.server"));
        return;
      }
      setPlans(data.plans);
      setSimulatedMrr(data.simulatedMrr);
    } catch {
      toast(t("common.networkError"));
    } finally {
      setLoading(false);
    }
  }, [t, toast]);

  useEffect(() => {
    if (!ready) return;
    void load();
  }, [ready, load]);

  const mrrHint = plans
    .filter((p) => p.priceMonthly > 0)
    .map((p) => `${p.name} ${p.priceMonthly}€`)
    .join(" · ");

  if (forbidden) {
    return (
      <p className="text-body-md text-on-surface-variant">{t("admin.forbidden")}</p>
    );
  }

  return (
    <div className="flex flex-col gap-space-xl w-full">
      <div className="flex flex-wrap items-end justify-between gap-space-md">
        <div>
          <h1 className="text-headline-lg text-on-surface font-bold">
            {t("admin.subscriptionsTitle")}
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            {t("admin.subscriptionsSub")}
          </p>
        </div>
        <div className="rounded-xl bg-surface-container-lowest border border-outline-variant/20 px-space-lg py-space-md shadow-sm">
          <p className="text-label-sm text-on-surface-variant">{t("admin.mrr")}</p>
          <p className="text-headline-md font-bold text-on-surface tabular-nums">
            {loading ? "…" : `${simulatedMrr.toLocaleString(dateLocale)}€`}
          </p>
          <p className="text-[12px] text-on-surface-variant mt-1">
            {mrrHint
              ? t("admin.mrrHintDynamic", { prices: mrrHint })
              : t("admin.mrrHint")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
        {(loading
          ? (["FREE", "PRO", "TEAM"] as const).map((id) => ({
              id,
              name: "…",
              priceMonthly: 0,
              accounts: 0,
              profiles: 0,
              mrr: 0,
            }))
          : plans
        ).map((plan) => (
          <div
            key={plan.id}
            className="rounded-xl bg-surface-container-lowest shadow-sm border border-outline-variant/20 p-space-lg flex flex-col gap-space-md"
          >
            <div className="flex items-start justify-between gap-space-sm">
              <div className="min-w-0">
                <p className="text-label-sm uppercase tracking-wider text-on-surface-variant">
                  {loading ? "…" : plan.name}
                </p>
                <p className="text-headline-md font-bold text-on-surface mt-1">
                  {loading ? "…" : plan.accounts}
                </p>
                <p className="text-body-sm text-on-surface-variant">
                  {t("admin.accountsOnPlan", { count: plan.accounts })}
                </p>
              </div>
              <Badge tone={plan.id === "FREE" ? "neutral" : "tertiary"}>
                {plan.id}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-space-sm text-body-sm">
              <div className="rounded-lg bg-surface-container-low px-space-sm py-space-sm">
                <p className="text-on-surface-variant">{t("admin.priceMonth")}</p>
                <p className="font-semibold tabular-nums">
                  {plan.priceMonthly}€
                </p>
              </div>
              <div className="rounded-lg bg-surface-container-low px-space-sm py-space-sm">
                <p className="text-on-surface-variant">{t("admin.colProfiles")}</p>
                <p className="font-semibold tabular-nums">
                  {loading ? "…" : plan.profiles}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-space-sm mt-auto pt-1">
              <button
                type="button"
                disabled={loading}
                onClick={() => setEditing(plan)}
                className="inline-flex items-center gap-1 rounded-lg border border-outline-variant/50 px-space-md py-2 text-label-sm font-semibold text-on-surface hover:bg-surface-container transition-colors disabled:opacity-50"
              >
                <Icon name="edit" className="text-[16px]" />
                {t("admin.editPlan")}
              </button>
              <Link
                href={localizedPath(
                  locale,
                  `/admin/abonnements/${plan.id.toLowerCase()}`,
                )}
                className="inline-flex items-center gap-1 text-label-sm font-semibold text-primary-container hover:underline"
              >
                {t("admin.seeDetails")}
                <Icon name="chevron_right" className="text-[16px]" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {editing ? (
        <PlanEditModal
          plan={editing}
          onClose={() => setEditing(null)}
          onSaved={(updated) => {
            setPlans((prev) =>
              prev.map((p) =>
                p.id === updated.plan
                  ? {
                      ...p,
                      name: updated.name,
                      priceMonthly: updated.priceMonthly,
                      mrr: p.accounts * updated.priceMonthly,
                    }
                  : p,
              ),
            );
            setSimulatedMrr((prev) => {
              const old = plans.find((p) => p.id === updated.plan);
              if (!old) return prev;
              return prev - old.mrr + old.accounts * updated.priceMonthly;
            });
            setEditing(null);
          }}
        />
      ) : null}
    </div>
  );
}

function PlanEditModal({
  plan,
  onClose,
  onSaved,
}: {
  plan: PlanCard;
  onClose: () => void;
  onSaved: (offer: { plan: PlanId; name: string; priceMonthly: number }) => void;
}) {
  const t = useT();
  const { toast } = useToast();
  const titleId = useId();
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState(plan.name);
  const [price, setPrice] = useState(String(plan.priceMonthly));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !saving) onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, saving]);

  async function save() {
    const trimmed = name.trim();
    const priceMonthly = Number(price.replace(",", "."));
    if (!trimmed || Number.isNaN(priceMonthly) || priceMonthly < 0) {
      toast(t("api.invalid"));
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/subscriptions/${plan.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed, priceMonthly }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? t("api.server"));
        return;
      }
      toast(t("admin.planSaved"));
      onSaved(data.plan);
    } catch {
      toast(t("common.networkError"));
    } finally {
      setSaving(false);
    }
  }

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-space-md">
      <button
        type="button"
        aria-label={t("common.close")}
        className="absolute inset-0 bg-on-surface/40 backdrop-blur-[2px]"
        onClick={() => {
          if (!saving) onClose();
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-md rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-xl p-space-lg"
      >
        <div className="flex items-start gap-space-md mb-space-lg">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/8 text-primary">
            <Icon name="edit" className="text-[22px]" />
          </span>
          <div className="min-w-0">
            <h2
              id={titleId}
              className="text-headline-md font-semibold text-on-surface"
            >
              {t("admin.editPlanTitle")}
            </h2>
            <p className="mt-0.5 text-body-sm text-on-surface-variant">
              {t("admin.editPlanSub", { id: plan.id })}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-space-md">
          <Input
            label={t("admin.planName")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
            autoFocus
          />
          <Input
            label={t("admin.priceMonth")}
            type="number"
            min={0}
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            hint={t("admin.priceHint")}
          />
        </div>

        <div className="mt-space-lg flex flex-col-reverse sm:flex-row sm:justify-end gap-space-sm">
          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="inline-flex h-9 items-center justify-center rounded-lg border border-outline-variant/50 px-space-md text-label-sm font-semibold text-on-surface hover:bg-surface-container transition-colors disabled:opacity-50"
          >
            {t("common.cancel")}
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => void save()}
            className="inline-flex h-9 items-center justify-center rounded-lg bg-primary-container px-space-md text-label-sm font-semibold text-on-primary hover:bg-primary transition-colors disabled:opacity-50"
          >
            {saving ? t("common.loading") : t("common.save")}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
