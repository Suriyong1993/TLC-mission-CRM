import { cn } from "@/lib/utils/cn";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
  "inline-flex items-center justify-center font-sarabun font-medium transition-all duration-200 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky/50 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.97]",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-r from-sky to-water text-white hover:brightness-110 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]",
        secondary:
          "glass-1 text-text-soft hover:bg-ink-lift hover:text-text-main",
        ghost:
          "bg-transparent text-text-soft hover:bg-ink-lift/50 hover:text-text-main border border-transparent hover:border-line",
        danger:
          "bg-gradient-to-r from-alert to-[#f97316] text-white hover:brightness-110",
        spirit:
          "bg-gradient-to-r from-spirit to-sky text-white hover:brightness-110 hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]",
      },
      size: {
        sm: "h-9 px-3 text-xs gap-1.5",
        md: "h-11 px-4 text-sm gap-2",
        lg: "h-12 px-6 text-base gap-2",
        icon: "h-9 w-9 rounded-md",
        fab: "h-[52px] w-[52px] rounded-full md:h-14 md:w-14",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export function Button({
  variant,
  size,
  loading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="opacity-70">{children}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
