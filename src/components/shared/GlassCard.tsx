import { cn } from "@/lib/utils/cn";

type GlassLevel = 0 | 1 | 2 | 3;

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  level?: GlassLevel;
  accentLine?: "sky" | "gold" | "alert" | "spirit" | "none";
  hover?: boolean;
}

const glassClasses: Record<GlassLevel, string> = {
  0: "glass-0",
  1: "glass-1",
  2: "glass-2",
  3: "glass-3",
};

const accentLineClasses = {
  sky: "accent-line-sky",
  gold: "accent-line-gold",
  alert: "accent-line-alert",
  spirit: "accent-line-spirit",
  none: "",
};

export function GlassCard({
  level = 1,
  accentLine = "none",
  hover = false,
  className,
  children,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(
        glassClasses[level],
        "rounded-lg overflow-hidden",
        hover &&
          "transition-all duration-200 hover:scale-[1.01] hover:shadow-lg",
        className
      )}
      {...props}
    >
      {accentLine !== "none" && (
        <div
          className={cn("h-[2px] w-full", accentLineClasses[accentLine])}
        />
      )}
      {children}
    </div>
  );
}
