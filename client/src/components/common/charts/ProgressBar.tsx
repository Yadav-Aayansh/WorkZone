import { cn } from "@/lib/utils";

export interface ProgressBarProps {
  value: number; // 0-100
  variant?: "primary" | "success" | "warning" | "error";
  showLabel?: boolean;
  animated?: boolean;
  height?: "sm" | "md" | "lg";
  className?: string;
}

export function ProgressBar({
  value,
  variant = "primary",
  showLabel = false,
  animated = true,
  height = "md",
  className,
}: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  const variantClasses = {
    primary: "bg-primary",
    success: "bg-green-500",
    warning: "bg-yellow-500",
    error: "bg-red-500",
  };

  const heightClasses = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  };

  return (
    <div className={cn("space-y-2", className)}>
      {showLabel && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">{clampedValue}%</span>
        </div>
      )}
      <div
        className={cn(
          "w-full bg-muted rounded-full overflow-hidden",
          heightClasses[height]
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all",
            variantClasses[variant],
            animated && "duration-500 ease-out"
          )}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
}
