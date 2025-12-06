"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Eye, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Applicant {
  id: string;
  name: string;
  role: string;
  level?: string;
  appliedDate: string;
  status: string;
  avatar?: string;
}

export interface RecentApplicantsProps {
  applicants: Applicant[];
  onViewDetails?: (id: string) => void;
  onShortlist?: (id: string) => void;
  onReject?: (id: string) => void;
  loading?: boolean;
  className?: string;
}

export function RecentApplicants({
  applicants,
  onViewDetails,
  onShortlist,
  onReject,
  loading = false,
  className,
}: RecentApplicantsProps) {
  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes("shortlist")) {
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    }
    if (statusLower.includes("pending") || statusLower.includes("applied")) {
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
    }
    if (statusLower.includes("reject")) {
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    }
    if (statusLower.includes("interview")) {
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    }
    return "bg-muted text-muted-foreground";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  if (loading) {
    return (
      <Card className={cn("border-none shadow-sm", className)}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Recent Applicants
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="animate-pulse flex items-center gap-3 p-3"
              >
                <div className="h-10 w-10 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-none shadow-sm", className)}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Recent Applicants
        </CardTitle>
      </CardHeader>
      <CardContent>
        {applicants.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            <p>No recent applicants</p>
          </div>
        ) : (
          <div className="space-y-1">
            {applicants.map((applicant) => (
              <div
                key={applicant.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors group"
              >
                {/* Avatar */}
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {applicant.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 className="font-medium text-sm truncate">
                      {applicant.name}
                    </h4>
                    {applicant.level && (
                      <Badge variant="outline" className="text-xs">
                        {applicant.level}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="truncate">{applicant.role}</span>
                    <span>•</span>
                    <span>{formatDate(applicant.appliedDate)}</span>
                  </div>
                </div>

                {/* Status Badge */}
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-xs whitespace-nowrap",
                    getStatusColor(applicant.status)
                  )}
                >
                  {applicant.status}
                </Badge>

                {/* Actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => onViewDetails?.(applicant.id)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onShortlist?.(applicant.id)}
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Shortlist
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onReject?.(applicant.id)}
                      className="text-destructive"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Reject
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
