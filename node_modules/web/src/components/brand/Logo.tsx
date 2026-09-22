import Link from "next/link";
import { cn } from "@/lib/cn";
import { ASSETS } from "@/lib/mock-data";

type LogoProps = {
  className?: string;
  href?: string;
  /** When true, only the mark is visible (sidebar collapsed). */
  compact?: boolean;
};

export function Logo({ className, href = "/", compact = false }: LogoProps) {
  const content = (
    <span
      className={cn(
        "flex h-8 items-center overflow-hidden",
        compact ? "w-8" : "gap-space-sm",
        className,
      )}
    >
      {/* Native img: Next/Image aspect-ratio warning is noisy for SVG logos. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={ASSETS.logo}
        alt="ProfileLink"
        width={120}
        height={32}
        className="h-8 w-auto max-w-none object-contain object-left"
      />
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center">
        {content}
      </Link>
    );
  }

  return content;
}
