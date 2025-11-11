import { cn } from "@/lib/utils";

export interface MiniBarChartProps {
  data: number[];
  height?: number;
  color?: "purple" | "blue" | "pink" | "green" | "orange";
  animated?: boolean;
  className?: string;
}

export function MiniBarChart({
  data,
  height = 40,
  color = "purple",
  animated = true,
  className,
}: MiniBarChartProps) {
  if (!data || data.length === 0) {
    return null;
  }

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const colorClasses = {
    purple: "bg-[var(--chart-purple)]",
    blue: "bg-[var(--chart-blue)]",
    pink: "bg-pink-500",
    green: "bg-[var(--chart-green)]",
    orange: "bg-[var(--chart-orange)]",
  };

  return (
    <div
      className={cn("flex items-end justify-between gap-0.5", className)}
      style={{ height: `${height}px` }}
    >
      {data.map((value, index) => {
        const normalizedValue = ((value - min) / range) * 100;
        return (
          <div
            key={index}
            className={cn(
              "flex-1 rounded-t-sm opacity-80",
              colorClasses[color],
              animated && "transition-all duration-300 hover:opacity-100"
            )}
            style={{
              height: `${Math.max(normalizedValue, 5)}%`,
            }}
          />
        );
      })}
    </div>
  );
}
