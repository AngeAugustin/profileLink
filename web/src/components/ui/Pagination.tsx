"use client";

import { useMemo, useState, useEffect } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { useT } from "@/i18n/provider";

export const DEFAULT_PAGE_SIZE = 10;

export function useClientPagination<T>(
  items: T[],
  pageSize = DEFAULT_PAGE_SIZE,
  resetKey?: string | number,
) {
  const [page, setPage] = useState(1);
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);

  useEffect(() => {
    setPage(1);
  }, [resetKey, pageSize]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return {
    page,
    setPage,
    pageSize,
    total,
    totalPages,
    pageItems,
    from,
    to,
  };
}

function buildPageList(current: number, totalPages: number): (number | "ellipsis")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = new Set<number>();
  pages.add(1);
  pages.add(totalPages);
  for (let i = current - 1; i <= current + 1; i++) {
    if (i >= 1 && i <= totalPages) pages.add(i);
  }

  const sorted = [...pages].sort((a, b) => a - b);
  const result: (number | "ellipsis")[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const n = sorted[i]!;
    if (i > 0 && n - sorted[i - 1]! > 1) {
      result.push("ellipsis");
    }
    result.push(n);
  }
  return result;
}

type PaginationProps = {
  page: number;
  totalPages: number;
  total: number;
  from: number;
  to: number;
  onPageChange: (page: number) => void;
  className?: string;
};

export function Pagination({
  page,
  totalPages,
  total,
  from,
  to,
  onPageChange,
  className,
}: PaginationProps) {
  const t = useT();

  if (total === 0 || totalPages <= 1) return null;

  const pages = buildPageList(page, totalPages);

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-space-md py-space-md border-t border-outline-variant/20",
        className,
      )}
    >
      <p className="text-body-sm text-on-surface-variant tabular-nums">
        {t("common.pagination.range", { from, to, total })}
      </p>

      <nav
        aria-label={t("common.pagination.label")}
        className="flex items-center gap-1 flex-wrap"
      >
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label={t("common.pagination.prev")}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          <Icon name="chevron_left" className="text-[20px]" />
        </button>

        {pages.map((item, index) =>
          item === "ellipsis" ? (
            <span
              key={`e-${index}`}
              className="inline-flex h-9 min-w-9 items-center justify-center text-on-surface-variant px-1"
              aria-hidden
            >
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              aria-label={t("common.pagination.page", { page: item })}
              aria-current={item === page ? "page" : undefined}
              className={cn(
                "inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-label-sm font-semibold tabular-nums transition-colors",
                item === page
                  ? "bg-primary-container text-on-primary"
                  : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface",
              )}
            >
              {item}
            </button>
          ),
        )}

        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label={t("common.pagination.next")}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          <Icon name="chevron_right" className="text-[20px]" />
        </button>
      </nav>
    </div>
  );
}
