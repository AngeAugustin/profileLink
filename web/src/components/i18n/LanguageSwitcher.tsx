"use client";

import { usePathname, useRouter } from "next/navigation";
import { locales, type Locale } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/cn";

function FlagFR({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 16"
      className={className}
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="8" height="16" fill="#002654" />
      <rect x="8" width="8" height="16" fill="#fff" />
      <rect x="16" width="8" height="16" fill="#CE1126" />
    </svg>
  );
}

function FlagUS({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 16"
      className={className}
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="24" height="16" fill="#B22234" />
      <rect y="1.23" width="24" height="1.23" fill="#fff" />
      <rect y="3.69" width="24" height="1.23" fill="#fff" />
      <rect y="6.15" width="24" height="1.23" fill="#fff" />
      <rect y="8.62" width="24" height="1.23" fill="#fff" />
      <rect y="11.08" width="24" height="1.23" fill="#fff" />
      <rect y="13.54" width="24" height="1.23" fill="#fff" />
      <rect width="9.6" height="8.62" fill="#3C3B6E" />
    </svg>
  );
}

const FLAGS: Record<
  Locale,
  { Flag: (props: { className?: string }) => React.ReactElement; label: string }
> = {
  fr: { Flag: FlagFR, label: "Français" },
  en: { Flag: FlagUS, label: "English" },
};

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, t } = useI18n();
  const pathname = usePathname();
  const router = useRouter();

  function switchTo(next: Locale) {
    if (next === locale) return;
    const segments = pathname.split("/");
    if (segments.length > 1 && locales.includes(segments[1] as Locale)) {
      segments[1] = next;
    } else {
      segments.splice(1, 0, next);
    }
    const target = segments.join("/") || `/${next}`;
    document.cookie = `NEXT_LOCALE=${next};path=/;max-age=31536000;samesite=lax`;
    router.push(target);
    router.refresh();
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-lg bg-surface-container p-0.5 gap-0.5",
        className,
      )}
      role="group"
      aria-label={t("common.language")}
    >
      {locales.map((l) => {
        const { Flag, label } = FLAGS[l];
        return (
          <button
            key={l}
            type="button"
            onClick={() => switchTo(l)}
            title={label}
            aria-label={label}
            aria-pressed={locale === l}
            className={cn(
              "px-1.5 py-1 rounded-md transition-all",
              locale === l
                ? "bg-surface-container-lowest shadow-sm ring-1 ring-primary/25"
                : "opacity-70 hover:opacity-100",
            )}
          >
            <Flag className="w-6 h-4 rounded-[2px] overflow-hidden shadow-sm ring-1 ring-black/10" />
          </button>
        );
      })}
    </div>
  );
}
