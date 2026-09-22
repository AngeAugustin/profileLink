"use client";

import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

export function ResourcesSearchField({
  placeholder,
  className,
}: {
  placeholder: string;
  className?: string;
}) {
  return (
    <div className={cn("relative w-full min-w-0", className)}>
      <Icon
        name="search"
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]"
      />
      <input
        type="search"
        readOnly
        placeholder={placeholder}
        className="w-full h-9 pl-11 pr-space-md rounded-lg bg-surface-container-lowest border border-outline-variant/30 text-body-sm text-on-surface placeholder:text-on-surface-variant shadow-sm outline-none focus:ring-2 focus:ring-primary/25"
        onFocus={(e) => e.currentTarget.blur()}
      />
    </div>
  );
}
