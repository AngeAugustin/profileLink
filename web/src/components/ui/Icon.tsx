import { cn } from "@/lib/cn";

type IconProps = {
  name: string;
  className?: string;
  filled?: boolean;
};

export function Icon({ name, className, filled }: IconProps) {
  return (
    <span
      className={cn("material-symbols-outlined", filled && "filled", className)}
      aria-hidden
    >
      {name}
    </span>
  );
}
