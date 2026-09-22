import { cn } from "@/lib/cn";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
};

export function Input({ label, hint, className, id, ...props }: InputProps) {
  const inputId = id ?? props.name;
  return (
    <div className="w-full">
      {label ? (
        <label
          htmlFor={inputId}
          className="block font-label-sm text-label-sm text-on-surface mb-1"
        >
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        className={cn(
          "w-full h-11 px-space-md rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:bg-surface-container-lowest outline-none shadow-sm transition-all border border-transparent focus:border-primary-container",
          className,
        )}
        {...props}
      />
      {hint ? (
        <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">{hint}</p>
      ) : null}
    </div>
  );
}

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
};

export function Textarea({ label, className, id, ...props }: TextareaProps) {
  const inputId = id ?? props.name;
  return (
    <div className="w-full">
      {label ? (
        <label
          htmlFor={inputId}
          className="block font-label-sm text-label-sm text-on-surface mb-1"
        >
          {label}
        </label>
      ) : null}
      <textarea
        id={inputId}
        className={cn(
          "w-full min-h-28 px-space-md py-space-sm rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:bg-surface-container-lowest outline-none shadow-sm transition-all border border-transparent focus:border-primary-container resize-y",
          className,
        )}
        {...props}
      />
    </div>
  );
}
