"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { useAdminAccess } from "@/components/admin/useAdminAccess";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { Pagination, useClientPagination } from "@/components/ui/Pagination";
import { useToast } from "@/components/ui/Toast";
import { localizedPath } from "@/i18n/path";
import { useI18n, useT } from "@/i18n/provider";

type PlanUser = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  profiles: number;
  createdAt: string;
};

type PlanDetail = {
  id: "FREE" | "PRO" | "TEAM";
  name: string;
  priceMonthly: number;
  accounts: number;
  profiles: number;
  mrr: number;
};

export default function AdminPlanDetailPage() {
  return (
    <AdminShell>
      <PlanDetailContent />
    </AdminShell>
  );
}

function PlanDetailContent() {
  const params = useParams<{ plan: string }>();
  const t = useT();
  const { locale } = useI18n();
  const { toast } = useToast();
  const { ready, forbidden } = useAdminAccess();
  const dateLocale = locale === "en" ? "en-US" : "fr-FR";

  const [plan, setPlan] = useState<PlanDetail | null>(null);
  const [users, setUsers] = useState<PlanUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready || !params.plan) return;
    let cancelled = false;
    void (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/subscriptions/${params.plan}`);
        const data = await res.json();
        if (!res.ok) {
          if (!cancelled) toast(data.error ?? t("api.server"));
          return;
        }
        if (!cancelled) {
          setPlan(data.plan);
          setUsers(data.users);
        }
      } catch {
        if (!cancelled) toast(t("common.networkError"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ready, params.plan, t, toast]);

  const {
    page,
    setPage,
    totalPages,
    pageItems,
    from,
    to,
    total: pageTotal,
  } = useClientPagination(users, 10, params.plan);

  if (forbidden) {
    return (
      <p className="text-body-md text-on-surface-variant">{t("admin.forbidden")}</p>
    );
  }

  if (loading || !plan) {
    return (
      <p className="text-body-md text-on-surface-variant">{t("admin.loading")}</p>
    );
  }

  return (
    <div className="flex flex-col gap-space-xl w-full">
      <div>
        <Link
          href={localizedPath(locale, "/admin/abonnements")}
          className="inline-flex items-center gap-1 text-label-sm text-on-surface-variant hover:text-on-surface mb-space-sm"
        >
          <Icon name="arrow_back" className="text-[16px]" />
          {t("admin.backToPlans")}
        </Link>
        <div className="flex flex-wrap items-center gap-space-sm">
          <h1 className="text-headline-lg text-on-surface font-bold">
            {plan.name}
          </h1>
          <Badge tone="tertiary" className="uppercase tracking-wider">
            {plan.id}
          </Badge>
        </div>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">
          {t("admin.planDetailSub", {
            price: plan.priceMonthly,
            accounts: plan.accounts,
          })}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-space-md">
        {[
          { label: t("admin.accounts"), value: String(plan.accounts) },
          { label: t("admin.colProfiles"), value: String(plan.profiles) },
          { label: t("admin.priceMonth"), value: `${plan.priceMonthly}€` },
          { label: t("admin.mrr"), value: `${plan.mrr}€` },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-xl bg-surface-container-lowest shadow-sm p-space-md border border-outline-variant/20"
          >
            <p className="text-label-sm text-on-surface-variant">{kpi.label}</p>
            <p className="text-headline-md font-semibold text-on-surface tabular-nums mt-1">
              {kpi.value}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-surface-container-lowest shadow-sm overflow-hidden border border-outline-variant/20">
        <div className="px-space-lg py-space-md border-b border-outline-variant/20">
          <h2 className="text-headline-md font-semibold text-on-surface">
            {t("admin.planUsers")}
          </h2>
        </div>
        {users.length === 0 ? (
          <p className="px-space-md py-space-lg text-body-sm text-on-surface-variant">
            {t("admin.empty")}
          </p>
        ) : (
          <>
            <ul className="md:hidden divide-y divide-outline-variant/15">
              {pageItems.map((u) => {
                const href = localizedPath(locale, `/admin/utilisateurs/${u.id}`);
                const joined = new Date(u.createdAt).toLocaleDateString(dateLocale, {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                });
                return (
                  <li key={u.id}>
                    <Link
                      href={href}
                      className="flex items-start gap-3 px-space-md py-space-md active:bg-surface-container-low/60"
                    >
                      <div className="min-w-0 flex-1 flex flex-col gap-1.5">
                        <div className="min-w-0">
                          <p className="font-semibold text-on-surface truncate">
                            {u.name ?? "—"}
                          </p>
                          <p className="text-body-sm text-on-surface-variant truncate">
                            {u.email}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-on-surface-variant">
                          <span className="font-mono">{u.role}</span>
                          <span>
                            {u.profiles} {t("admin.colProfiles")}
                          </span>
                          <span>{joined}</span>
                        </div>
                      </div>
                      <Icon
                        name="chevron_right"
                        className="text-[20px] text-on-surface-variant shrink-0 mt-0.5"
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-body-sm">
                <thead className="bg-surface-container-low text-label-sm text-on-surface-variant uppercase tracking-wider">
                  <tr>
                    <th className="px-space-md py-space-sm font-semibold">
                      {t("admin.colUser")}
                    </th>
                    <th className="px-space-md py-space-sm font-semibold">
                      {t("admin.colRole")}
                    </th>
                    <th className="px-space-md py-space-sm font-semibold">
                      {t("admin.colProfiles")}
                    </th>
                    <th className="px-space-md py-space-sm font-semibold">
                      {t("admin.colJoined")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((u) => (
                    <tr
                      key={u.id}
                      className="border-t border-outline-variant/15 hover:bg-surface-container-low/60"
                    >
                      <td className="px-space-md py-space-md">
                        <Link
                          href={localizedPath(locale, `/admin/utilisateurs/${u.id}`)}
                          className="flex flex-col group"
                        >
                          <span className="font-semibold group-hover:text-primary-container">
                            {u.name ?? "—"}
                          </span>
                          <span className="text-on-surface-variant">{u.email}</span>
                        </Link>
                      </td>
                      <td className="px-space-md py-space-md font-mono text-[12px]">
                        {u.role}
                      </td>
                      <td className="px-space-md py-space-md">{u.profiles}</td>
                      <td className="px-space-md py-space-md text-on-surface-variant">
                        {new Date(u.createdAt).toLocaleDateString(dateLocale, {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        <Pagination
          page={page}
          totalPages={totalPages}
          total={pageTotal}
          from={from}
          to={to}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
