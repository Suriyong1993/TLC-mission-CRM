import { cn } from "@/lib/utils/cn";

type AttitudeLevel = "ดี" | "ปานกลาง" | "น้อย" | "unknown";
type AvatarSize = "sm" | "md" | "lg";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  attitude?: AttitudeLevel;
  size?: AvatarSize;
  src?: string;
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: "h-7 w-7 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-lg",
};

const attitudeGradients: Record<AttitudeLevel, string> = {
  "ดี": "from-emerald-500 to-teal-500",
  ปานกลาง: "from-blue-500 to-indigo-500",
  น้อย: "from-rose-500 to-orange-500",
  unknown: "from-gray-500 to-slate-500",
};

function getInitial(name: string): string {
  return name.charAt(0);
}

export function Avatar({
  name,
  attitude = "unknown",
  size = "md",
  src,
  className,
  ...props
}: AvatarProps) {
  if (src) {
    return (
      <div
        className={cn(
          "relative rounded-full overflow-hidden ring-2 ring-white/20",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        <img
          src={src}
          alt={name}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative rounded-full flex items-center justify-center",
        "bg-gradient-to-br text-white font-sarabun font-semibold",
        attitudeGradients[attitude],
        sizeClasses[size],
        className
      )}
      aria-label={name}
      {...props}
    >
      {getInitial(name)}
    </div>
  );
}
