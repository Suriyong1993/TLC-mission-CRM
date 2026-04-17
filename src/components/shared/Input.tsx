import { cn } from "@/lib/utils/cn";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  heavyEntry?: boolean;
}

export function Input({
  label,
  error,
  heavyEntry = false,
  className,
  id,
  ...props
}: InputProps) {
  const inputId = id || label?.replace(/\s+/g, "-").toLowerCase();

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-[11px] uppercase tracking-wider text-text-soft font-sarabun font-medium"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          "w-full rounded-md border border-line bg-ink-input text-text-main",
          "font-sarabun text-sm placeholder:text-text-ghost",
          "h-11 px-3",
          "transition-all duration-200",
          "focus:border-sky focus:ring-2 focus:ring-sky/25 focus:outline-none",
          error && "border-alert focus:border-alert focus:ring-alert/25",
          heavyEntry && "input-heavy-entry",
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-xs text-alert" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
