import { cn } from "@/lib/utils/cn";

type SizeType = "BIG" | "STD" | "MINI" | "—";

interface SizeBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  size: SizeType;
}

const sizeStyles: Record<SizeType, string> = {
  BIG: "bg-growth/15 text-growth border-growth/40 shadow-[0_0_8px_rgba(16,185,129,0.2)]",
  STD: "bg-water/15 text-water border-water/40 shadow-[0_0_8px_rgba(6,182,212,0.2)]",
  MINI: "bg-spirit/15 text-spirit border-spirit/40 shadow-[0_0_8px_rgba(139,92,246,0.2)]",
  "—": "bg-text-ghost/10 text-text-ghost border-text-ghost/20",
};

export function classifySize(count: number): SizeType {
  if (count >= 12) return "BIG";
  if (count >= 7) return "STD";
  if (count >= 1) return "MINI";
  return "—";
}

export function SizeBadge({ size, className, ...props }: SizeBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-sarabun font-semibold border transition-colors duration-200",
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {size}
    </span>
  );
}
