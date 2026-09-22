import { cn } from "@/lib/cn";

type BadgeProps = {
  children: React.ReactNode;
  tone?: "primary" | "tertiary" | "success" | "warning" | "neutral" | "secondary";
  className?: string;
};

const tones = {
  primary: "bg-primary-fixed text-on-primary-fixed",
  tertiary: "bg-tertiary-fixed text-on-tertiary-fixed",
  success: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-700",
  neutral: "bg-surface-container text-on-surface-variant",
  secondary: "bg-secondary-container text-on-secondary-fixed",
};

export function Badge({ children, tone = "neutral", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full font-label-sm text-label-sm font-bold",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
