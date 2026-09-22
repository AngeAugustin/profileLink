import { cn } from "@/lib/cn";

/** Shared sober heading for profile sections (Expériences, Formations, etc.). */
export const profileSectionTitleClass =
  "text-[15px] font-semibold tracking-tight mb-4";

export type TimelineExperience = {
  id: string;
  title: string;
  company: string;
  location?: string | null;
  period: string;
  highlights?: string | null;
};

type ExperienceTimelineProps = {
  experiences: TimelineExperience[];
  title?: string;
  className?: string;
  accentClassName?: string;
  dotClassName?: string;
  /** Job title color */
  jobTitleClassName?: string;
  /** Section heading color */
  headingClassName?: string;
  companyClassName?: string;
  bodyClassName?: string;
  lineClassName?: string;
  pillClassName?: string;
  descriptionOffsetClassName?: string;
};

/** Parses "2022 — Présent (Paris / Hybride)" into period + location when location is empty. */
export function splitPeriodLocation(
  period: string,
  location?: string | null,
): { period: string; location: string } {
  if (location?.trim()) {
    return { period, location: location.trim() };
  }
  const match = period.match(/^(.*?)\s*\((.+)\)\s*$/);
  if (match) {
    return { period: match[1]!.trim(), location: match[2]!.trim() };
  }
  return { period, location: "" };
}

export function formatExperiencePeriod(opts: {
  startDate: string;
  endDate?: string | null;
  current?: boolean;
  presentLabel?: string;
}): string {
  const end = opts.current
    ? (opts.presentLabel ?? "Aujourd'hui")
    : (opts.endDate ?? "");
  if (!end) return opts.startDate;
  return `${opts.startDate} - ${end}`;
}

export function ExperienceTimeline({
  experiences,
  title,
  className,
  accentClassName = "text-primary",
  dotClassName = "bg-primary",
  jobTitleClassName = "text-on-surface",
  headingClassName = "text-on-surface",
  companyClassName = "text-on-surface-variant",
  bodyClassName = "text-on-surface-variant",
  lineClassName = "border-outline-variant/40",
  pillClassName = "bg-surface-container text-on-surface-variant",
  descriptionOffsetClassName = "md:pt-6",
}: ExperienceTimelineProps) {
  if (experiences.length === 0) return null;

  return (
    <div className={cn("w-full", className)}>
      {title ? (
        <h2 className={cn(profileSectionTitleClass, headingClassName)}>{title}</h2>
      ) : null}

      <ol className={cn("relative ml-1.5 border-l pl-6 space-y-8", lineClassName)}>
        {experiences.map((exp) => {
          const { period, location } = splitPeriodLocation(
            exp.period,
            exp.location,
          );
          return (
            <li key={exp.id} className="relative">
              <span
                className={cn(
                  "absolute -left-[1.625rem] top-1.5 size-2.5 rounded-full",
                  dotClassName,
                )}
                aria-hidden
              />
              <div className="grid grid-cols-1 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.25fr)] gap-3 md:gap-8 items-start">
                <div className="min-w-0">
                  <p
                    className={cn(
                      "text-[13px] font-medium leading-snug",
                      accentClassName,
                    )}
                  >
                    {period}
                  </p>
                  <h3
                    className={cn(
                      "mt-1 text-base font-semibold leading-snug tracking-tight",
                      jobTitleClassName,
                    )}
                  >
                    {exp.title}
                  </h3>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <p className={cn("text-body-sm font-medium", companyClassName)}>
                      {exp.company}
                    </p>
                    {location ? (
                      <span
                        className={cn(
                          "inline-flex max-w-full truncate rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                          pillClassName,
                        )}
                      >
                        {location}
                      </span>
                    ) : null}
                  </div>
                </div>
                {exp.highlights ? (
                  <p
                    className={cn(
                      "text-body-sm leading-relaxed whitespace-pre-line",
                      descriptionOffsetClassName,
                      bodyClassName,
                    )}
                  >
                    {exp.highlights}
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
