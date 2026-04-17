import { cn } from "@/lib/utils/cn";
import { Button } from "./Button";

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  emoji: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  emoji,
  title,
  description,
  actionLabel,
  onAction,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center min-h-[200px] text-center px-4 py-8",
        className
      )}
      {...props}
    >
      <span className="text-5xl mb-3 animate-[float_3s_ease-in-out_infinite]">
        {emoji}
      </span>
      <h3 className="font-sarabun font-semibold text-text-main text-lg mb-1 thai-text">
        {title}
      </h3>
      <p className="font-sarabun text-text-soft text-sm mb-4 thai-text max-w-xs">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
