import { cn } from "@/lib/cn";

export function MarketingPageIntro({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <section
      className={cn(
        "max-w-7xl mx-auto px-gutter pt-space-xl pb-space-md w-full",
        align === "center" && "text-center",
        className,
      )}
    >
      {eyebrow ? (
        <span className="text-label-md text-primary font-semibold uppercase tracking-wider">
          {eyebrow}
        </span>
      ) : null}
      <h1
        className={cn(
          "text-headline-xl-mobile md:text-headline-xl text-on-surface font-bold",
          eyebrow && "mt-2",
          align === "center" && "max-w-3xl mx-auto",
        )}
      >
        {title}
      </h1>
      {subtitle ? (
        <p
          className={cn(
            "text-body-md text-on-surface-variant mt-space-sm",
            align === "center" && "max-w-2xl mx-auto",
          )}
        >
          {subtitle}
        </p>
      ) : null}
    </section>
  );
}
