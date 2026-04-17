import { cn } from "@/lib/utils/cn";

interface GroupCodePillProps extends React.HTMLAttributes<HTMLSpanElement> {
  code: string;
  bodyColor?: string;
}

export function GroupCodePill({
  code,
  bodyColor,
  className,
  ...props
}: GroupCodePillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-jetbrains font-semibold border",
        bodyColor
          ? "border-current/40 bg-current/10"
          : "border-line bg-ink-lift/50 text-text-soft",
        className
      )}
      style={bodyColor ? { color: bodyColor, borderColor: `${bodyColor}40` } : undefined}
      {...props}
    >
      {code}
    </span>
  );
}
