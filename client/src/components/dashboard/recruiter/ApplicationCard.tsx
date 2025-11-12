"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Eye,
  CheckCircle,
  X,
  Calendar,
  Clock,
  FileText,
  Mail,
  Phone,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface ApplicationCardProps {
  id: string;
  candidateName?: string;
  candidateEmail?: string;
  candidatePhone?: string;
  jobTitle: string;
  jobType?: string;
  appliedDate: string;
  status: string;
  score?: number;
  experience?: string;
  skills?: string[];
  resumeUrl?: string;
  onClick?: () => void;
  onView?: () => void;
  onShortlist?: () => void;
  onReject?: () => void;
  onScheduleInterview?: () => void;
  className?: string;
}

export function ApplicationCard({
  id,
  candidateName,
  candidateEmail,
  candidatePhone,
  jobTitle,
  jobType,
  appliedDate,
  status,
  score,
  experience,
  skills = [],
  resumeUrl,
  onClick,
  onView,
  onShortlist,
  onReject,
  onScheduleInterview,
  className,
}: ApplicationCardProps) {
  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes("shortlist") || statusLower.includes("hired")) {
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-blue-600 dark:text-blue-400";
    if (score >= 40) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
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

  const getCandidateInitials = () => {
    if (!candidateName) return "AP";
    return candidateName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
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
        {/* Header: Candidate Info & Actions */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Avatar className="h-12 w-12 shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                {getCandidateInitials()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base mb-1 truncate group-hover:text-primary transition-colors">
                {candidateName || `Applicant #${id.substring(0, 8)}`}
              </h3>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                {candidateEmail && (
                  <div className="flex items-center gap-1 truncate">
                    <Mail className="h-3 w-3 shrink-0" />
                    <span className="truncate">{candidateEmail}</span>
                  </div>
                )}
                {candidatePhone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3 shrink-0" />
                    <span>{candidatePhone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onView?.();
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              {resumeUrl && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(resumeUrl, "_blank");
                  }}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  View Resume
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onScheduleInterview?.();
                }}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Interview
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onShortlist?.();
                }}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Shortlist
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onReject?.();
                }}
                className="text-destructive"
              >
                <X className="mr-2 h-4 w-4" />
                Reject
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Job Title & Type */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="font-medium text-sm text-foreground">
              {jobTitle}
            </div>
            {jobType && (
              <Badge variant="outline" className="text-xs">
                {jobType}
              </Badge>
            )}
          </div>

          {/* Skills */}
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {skills.slice(0, 4).map((skill, idx) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className="text-xs font-normal"
                >
                  {skill}
                </Badge>
              ))}
              {skills.length > 4 && (
                <Badge variant="secondary" className="text-xs font-normal">
                  +{skills.length - 4}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {score !== undefined && (
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="text-xs text-muted-foreground mb-1">Score</div>
              <div className={cn("text-xl font-bold", getScoreColor(score))}>
                {score}%
              </div>
            </div>
          )}

          {experience && (
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="text-xs text-muted-foreground mb-1">
                Experience
              </div>
              <div className="text-xl font-bold">{experience}</div>
            </div>
          )}

          <div className="bg-muted/50 rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">Applied</div>
            <div className="text-sm font-medium">{formatDate(appliedDate)}</div>
          </div>
        </div>

        {/* Footer: Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{formatDate(appliedDate)}</span>
          </div>

          <Badge
            variant="secondary"
            className={cn("text-xs", getStatusColor(status))}
          >
            {status}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
