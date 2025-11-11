"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  MapPin,
  Clock,
  Users,
  Calendar,
  Briefcase,
  Lock,
  LockOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ProgressBar } from "@/components/common/charts/ProgressBar";

export interface JobCardProps {
  id: string;
  title: string;
  company?: string;
  companyLogo?: string;
  creator?: {
    name: string;
    avatar?: string;
  };
  totalApplied: number;
  totalInterviews?: number;
  hired?: number;
  location?: string;
  jobType?: string;
  employmentType?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  daysRemaining?: number;
  /**
   * Progress percentage (0-100)
   * Represents the hiring pipeline progress: (hired / total applications) * 100
   * Example: If 10 people applied and 2 were hired, progress = 20%
   * This shows how effectively you're converting applications to hires
   */
  progress?: number;
  status?: "active" | "draft" | "closed" | "paused";
  isOpen?: boolean;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onClose?: () => void;
  onReopen?: () => void;
  onViewApplications?: () => void;
  className?: string;
}

export function JobCard({
  id,
  title,
  company,
  companyLogo,
  creator,
  totalApplied,
  totalInterviews = 0,
  hired = 0,
  location,
  jobType,
  employmentType,
  dateRange,
  daysRemaining,
  progress,
  status = "active",
  isOpen = true,
  onClick,
  onEdit,
  onDelete,
  onClose,
  onReopen,
  onViewApplications,
  className,
}: JobCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "draft":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "closed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
      case "paused":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getCompanyInitial = (name?: string) => {
    if (!name) return "C";
    return name.charAt(0).toUpperCase();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Generate a color for the company logo based on the company name
  const getCompanyLogoColor = (name?: string) => {
    if (!name) return "bg-purple-500";
    const colors = [
      "bg-purple-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-orange-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-teal-500",
      "bg-red-500",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <Card
      className={cn(
        "border-none shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group bg-card",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-5">
        {/* Header: Creator Info & Actions */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            {creator && (
              <>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={creator.avatar} />
                  <AvatarFallback className="text-xs bg-muted">
                    {creator.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-xs text-muted-foreground">
                  Created by
                  <span className="font-medium text-foreground ml-1">
                    {creator.name}
                  </span>
                </div>
              </>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
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
                onClick={(e) => {
                  e.stopPropagation();
                  onViewApplications?.();
                }}
              >
                <Users className="mr-2 h-4 w-4" />
                View Applications
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.();
                }}
              >
                Edit Job
              </DropdownMenuItem>
              {isOpen ? (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose?.();
                  }}
                >
                  <Lock className="mr-2 h-4 w-4" />
                  Close Job
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onReopen?.();
                  }}
                >
                  <LockOpen className="mr-2 h-4 w-4" />
                  Reopen Job
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.();
                }}
                className="text-destructive"
              >
                Delete Job
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Job Title & Company Logo */}
        <div className="flex items-start gap-3 mb-4">
          <div
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white shadow-sm",
              getCompanyLogoColor(company || title)
            )}
          >
            {companyLogo ? (
              <img
                src={companyLogo}
                alt={company}
                className="h-8 w-8 object-contain"
              />
            ) : (
              <span className="text-lg font-bold">
                {getCompanyInitial(company || title)}
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base mb-1 line-clamp-2 group-hover:text-primary transition-colors">
              {title}
            </h3>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              {employmentType && (
                <Badge variant="outline" className="text-xs">
                  {employmentType}
                </Badge>
              )}
              {jobType && (
                <Badge variant="outline" className="text-xs">
                  {jobType}
                </Badge>
              )}
              {location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{location}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">
              Total Applied
            </div>
            <div className="text-xl font-bold">{totalApplied}</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">Interviews</div>
            <div className="text-xl font-bold">{totalInterviews}</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">Hired</div>
            <div className="text-xl font-bold">{hired}</div>
          </div>
        </div>

        {/* Progress Bar */}
        {progress !== undefined && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span>Progress</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <ProgressBar value={progress} className="h-2" />
          </div>
        )}

        {/* Footer: Date Range, Days Remaining, Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {dateRange && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>
                  From: {formatDate(dateRange.start)} -{" "}
                  {formatDate(dateRange.end)}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {daysRemaining !== undefined && daysRemaining > 0 && (
              <Badge variant="secondary" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                {daysRemaining} Days Remaining
              </Badge>
            )}
            <Badge
              variant="secondary"
              className={cn("text-xs", getStatusColor(status))}
            >
              {status}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
