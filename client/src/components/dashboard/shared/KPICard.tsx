"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendIndicator } from "@/components/common/indicators/TrendIndicator";
import { MiniBarChart } from "@/components/common/charts/MiniBarChart";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface KPICardProps {
  title: string;
  value: string | number;
  trend?: {
    value: number;
    direction: "up" | "down";
    label: string;
  };
  icon: React.ReactNode;
  chartData?: number[];
  variant?: "purple" | "blue" | "pink" | "green" | "orange";
  loading?: boolean;
  className?: string;
}

export function KPICard({
  title,
  value,
  trend,
  icon,
  chartData,
  variant = "purple",
  loading = false,
  className,
}: KPICardProps) {
  const variantClasses = {
    purple:
      "bg-gradient-to-br from-[var(--gradient-purple-light)] to-[var(--gradient-purple-dark)]",
    blue: "bg-gradient-to-br from-[var(--gradient-blue-light)] to-[var(--gradient-blue-dark)]",
    pink: "bg-gradient-to-br from-[var(--gradient-pink-light)] to-[var(--gradient-pink-dark)]",
    green:
      "bg-gradient-to-br from-[var(--gradient-green-light)] to-[var(--gradient-green-dark)]",
    orange:
      "bg-gradient-to-br from-[var(--gradient-orange-light)] to-[var(--gradient-orange-dark)]",
  };

  if (loading) {
    return (
      <Card className={cn("border-0", className)}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-4 w-28" />
          {chartData && <Skeleton className="h-10 w-full" />}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "border-0 shadow-sm transition-all duration-200 hover:shadow-md",
        variantClasses[variant],
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          {icon}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-4xl font-bold tracking-tight">{value}</div>
        {trend && (
          <TrendIndicator
            value={trend.value}
            direction={trend.direction}
            label={trend.label}
          />
        )}
        {chartData && chartData.length > 0 && (
          <MiniBarChart data={chartData} height={40} color={variant} />
        )}
      </CardContent>
    </Card>
  );
}
