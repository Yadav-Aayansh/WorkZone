import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TrendIndicatorProps {
  value: number;
  direction: "up" | "down";
  label?: string;
  showIcon?: boolean;
  showValue?: boolean;
  className?: string;
}

export function TrendIndicator({
  value,
  direction,
  label,
  showIcon = true,
  showValue = true,
  className,
}: TrendIndicatorProps) {
  const isPositive = direction === "up";

  return (
    <div
      className={cn(
        "flex items-center gap-1 text-sm font-medium",
        isPositive
          ? "text-green-600 dark:text-green-400"
          : "text-red-600 dark:text-red-400",
        className
      )}
    >
      {showIcon && (
        <>
          {isPositive ? (
            <TrendingUp className="h-4 w-4" />
          ) : (
            <TrendingDown className="h-4 w-4" />
          )}
        </>
      )}
      {showValue && <span>{Math.abs(value)}%</span>}
      {label && (
        <span className="text-muted-foreground font-normal">{label}</span>
      )}
    </div>
  );
}
