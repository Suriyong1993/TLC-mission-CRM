import { cn } from "@/lib/utils/cn";

type AttitudeLevel = "ดี" | "ปานกลาง" | "น้อย";

interface AttitudeBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  level: AttitudeLevel;
  showDot?: boolean;
}

const attitudeStyles: Record<AttitudeLevel, string> = {
  "ดี": "bg-growth/10 text-growth border-growth/30",
  ปานกลาง: "bg-gold/10 text-gold border-gold/30",
  น้อย: "bg-alert/10 text-alert border-alert/30",
};

const dotStyles: Record<AttitudeLevel, string> = {
  "ดี": "bg-growth",
  ปานกลาง: "bg-gold",
  น้อย: "bg-alert pulse-dot",
};

export function AttitudeBadge({
  level,
  showDot = true,
  className,
  ...props
}: AttitudeBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-xs font-sarabun font-medium border",
        attitudeStyles[level],
        className
      )}
      {...props}
    >
      {showDot && (
        <span className={cn("h-1.5 w-1.5 rounded-full", dotStyles[level])} />
      )}
      {level}
    </span>
  );
}
