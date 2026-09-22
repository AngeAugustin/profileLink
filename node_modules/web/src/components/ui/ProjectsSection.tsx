import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import { profileSectionTitleClass } from "@/components/ui/ExperienceTimeline";
import { normalizeExternalHref } from "@/lib/social-icons";

export type ProjectItem = {
  id: string;
  title: string;
  role?: string;
  description?: string;
  url?: string | null;
  year?: string;
  tags?: string;
};

type ProjectsSectionProps = {
  title: string;
  projects: ProjectItem[];
  viewLabel?: string;
  className?: string;
  headingClassName?: string;
  cardClassName?: string;
  titleClassName?: string;
  metaClassName?: string;
  bodyClassName?: string;
  tagClassName?: string;
  linkClassName?: string;
  iconWrapClassName?: string;
};

function parseTags(tags?: string): string[] {
  if (!tags?.trim()) return [];
  return tags
    .split(/[,·|]/)
    .map((t) => t.trim())
    .filter(Boolean);
}

export function ProjectsSection({
  title,
  projects,
  viewLabel = "Voir le projet",
  className,
  headingClassName = "text-on-surface",
  cardClassName = "border-outline-variant/20 bg-surface-container-low/60",
  titleClassName = "text-on-surface",
  metaClassName = "text-on-surface-variant",
  bodyClassName = "text-on-surface-variant",
  tagClassName = "bg-surface-container text-on-surface-variant",
  linkClassName = "text-primary",
  iconWrapClassName = "bg-primary/10 text-primary",
}: ProjectsSectionProps) {
  if (projects.length === 0) return null;

  return (
    <section className={className}>
      <h2 className={cn(profileSectionTitleClass, headingClassName)}>{title}</h2>
      <div className="flex flex-col gap-2">
        {projects.map((project) => {
          const tags = parseTags(project.tags);
          const href = project.url?.trim()
            ? normalizeExternalHref(project.url)
            : null;
          const meta = [project.role, project.year].filter(Boolean).join(" · ");

          return (
            <article
              key={project.id}
              className={cn(
                "rounded-xl border px-space-md py-space-md",
                cardClassName,
              )}
            >
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    "shrink-0 size-9 rounded-lg flex items-center justify-center",
                    iconWrapClassName,
                  )}
                >
                  <Icon name="work" className="text-[18px]" />
                </span>
                <div className="min-w-0 flex-1">
                  <h3
                    className={cn(
                      "text-base font-semibold tracking-tight leading-snug",
                      titleClassName,
                    )}
                  >
                    {project.title}
                  </h3>
                  {meta ? (
                    <p className={cn("mt-0.5 text-body-sm", metaClassName)}>
                      {meta}
                    </p>
                  ) : null}
                </div>
              </div>

              {project.description ? (
                <p
                  className={cn(
                    "mt-space-sm text-body-sm leading-relaxed whitespace-pre-line",
                    bodyClassName,
                  )}
                >
                  {project.description}
                </p>
              ) : null}

              {(tags.length > 0 || href) && (
                <div className="mt-space-sm flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  {tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 min-w-0">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className={cn(
                            "rounded-md px-2 py-0.5 text-[11px] font-semibold",
                            tagClassName,
                          )}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span />
                  )}
                  {href ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "inline-flex items-center gap-1 text-label-sm font-semibold shrink-0 hover:underline",
                        linkClassName,
                      )}
                    >
                      {viewLabel}
                      <Icon name="open_in_new" className="text-[14px]" />
                    </a>
                  ) : null}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
