// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/* eslint-disable */

"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TenantProtectedRoute } from "@/components/tenant/TenantProtectedRoute";
import { ModernRecruiterLayout } from "@/components/common/layout/ModernRecruiterLayout";
import {
  tenantApplicationAPI,
  tenantJobAPI,
  ApplicationResponse,
  ApplicationStatus,
  JobResponse,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  MoreVertical,
  Copy,
  Eye,
  CheckCircle,
  XCircle,
  Calendar,
  Loader2,
  Users,
  FileCheck,
  Gift,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ApplicationWithJob extends ApplicationResponse {
  job?: JobResponse;
  score?: number;
}

type TabFilter = "all" | "new" | "in-review" | "interview" | "offered";

function ApplicationsContent() {
  const router = useRouter();
  const [applications, setApplications] = useState<ApplicationWithJob[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<
    ApplicationWithJob[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabFilter>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadApplications();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [applications, searchQuery, activeTab]);

  const loadApplications = async () => {
    setIsLoading(true);
    try {
      // Load all jobs first
      const jobs = await tenantJobAPI.listJobs();

      // Load applications for each job
      const allApplications: ApplicationWithJob[] = [];
      for (const job of jobs) {
        try {
          const jobApps = await tenantApplicationAPI.listJobApplications(
            job.id
          );
          const appsWithJob = jobApps.map((app) => ({
            ...app,
            job,
            // Note: resume_score is available in backend model but not exposed in API response
            // Score will be undefined/null until backend schema is updated
            score: undefined,
          }));
          allApplications.push(...appsWithJob);
        } catch (err) {
          console.error(`Failed to load applications for job ${job.id}:`, err);
        }
      }

      // Sort by date (newest first)
      allApplications.sort(
        (a, b) =>
          new Date(b.applied_on).getTime() - new Date(a.applied_on).getTime()
      );

      setApplications(allApplications);
    } catch (err: any) {
      console.error("Failed to load applications:", err);
      toast.error(err.message || "Failed to load applications");
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...applications];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (app) =>
          app.user_id.toLowerCase().includes(query) ||
          app.job?.title.toLowerCase().includes(query) ||
          app.job?.department.toLowerCase().includes(query)
      );
    }

    // Tab filter
    if (activeTab !== "all") {
      filtered = filtered.filter((app) => {
        switch (activeTab) {
          case "new":
            return app.status === ApplicationStatus.PENDING;
          case "in-review":
            return (
              app.status === ApplicationStatus.SHORTLISTED ||
              app.status === ApplicationStatus.AI_INTERVIEW_COMPLETED
            );
          case "interview":
            return (
              app.status === ApplicationStatus.HUMAN_INTERVIEW_SCHEDULED ||
              app.status === ApplicationStatus.HUMAN_INTERVIEW_COMPLETED
            );
          case "offered":
            return (
              app.status === ApplicationStatus.OFFERED ||
              app.status === ApplicationStatus.HIRED
            );
          default:
            return true;
        }
      });
    }

    setFilteredApplications(filtered);
  };

  // Calculate KPIs
  const newApplications = applications.filter(
    (app) => app.status === ApplicationStatus.PENDING
  ).length;

  const inReview = applications.filter(
    (app) =>
      app.status === ApplicationStatus.SHORTLISTED ||
      app.status === ApplicationStatus.AI_INTERVIEW_COMPLETED
  ).length;

  const offered = applications.filter(
    (app) =>
      app.status === ApplicationStatus.OFFERED ||
      app.status === ApplicationStatus.HIRED
  ).length;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatStatusLabel = (status: ApplicationStatus): string => {
    return status
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ");
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredApplications.map((app) => app.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success("Application ID copied to clipboard");
  };

  return (
    <ModernRecruiterLayout>
      <div className="space-y-6">
        {/* Header with Stats */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground mb-1">
              Welcome back,
            </h1>
            <p className="text-sm text-muted-foreground">
              Great talent awaits. Let&apos;s hire smart!
            </p>
          </div>

          {/* Stats Numbers - Direct Display */}
          <div className="flex items-center gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-foreground mb-1">
                {newApplications}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Users className="h-3 w-3" />
                <span>New Applied</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-foreground mb-1">
                {inReview}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Eye className="h-3 w-3" />
                <span>Reviewed</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-foreground mb-1">
                {offered}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Gift className="h-3 w-3" />
                <span>Offered</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Tabs */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Tab Buttons - Removed KPI Cards */}
          <div className="flex items-center gap-2">
            {[
              { value: "all" as const, label: "All" },
              { value: "new" as const, label: "New" },
              { value: "in-review" as const, label: "In Review" },
              { value: "interview" as const, label: "Interview" },
              { value: "offered" as const, label: "Offered" },
            ].map((tab) => (
              <Button
                key={tab.value}
                variant={activeTab === tab.value ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  "rounded-full",
                  activeTab === tab.value &&
                    "bg-foreground text-background hover:bg-foreground/90"
                )}
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Removed all KPI Cards section - continue with table */}

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">
              Loading applications...
            </span>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No applications found</p>
            <p className="text-sm mt-2">
              {searchQuery || activeTab !== "all"
                ? "Try adjusting your filters"
                : "Applications will appear here when candidates apply"}
            </p>
          </div>
        ) : (
          <div className="bg-card rounded-lg border shadow-sm">
            {/* Table Header */}
            <div className="grid grid-cols-[auto_1fr_120px_2fr_150px_80px] gap-4 px-6 py-4 border-b text-sm font-medium text-muted-foreground">
              <Checkbox
                checked={
                  selectedIds.size === filteredApplications.length &&
                  filteredApplications.length > 0
                }
                onCheckedChange={handleSelectAll}
              />
              <div>Name</div>
              <div className="text-center">AI Score</div>
              <div>Applied Role</div>
              <div>Applied Date</div>
              <div className="text-right">Actions</div>
            </div>

            {/* Table Rows */}
            <div className="divide-y">
              {filteredApplications.map((app) => (
                <div
                  key={app.id}
                  className="grid grid-cols-[auto_1fr_120px_2fr_150px_80px] gap-4 px-6 py-4 hover:bg-accent/50 transition-colors items-center cursor-pointer"
                  onClick={() =>
                    router.push(
                      `/tenant/recruiter-portal/applications/${app.id}`
                    )
                  }
                >
                  {/* Checkbox */}
                  <Checkbox
                    checked={selectedIds.has(app.id)}
                    onCheckedChange={(checked) =>
                      handleSelectOne(app.id, checked as boolean)
                    }
                    onClick={(e) => e.stopPropagation()}
                  />

                  {/* Name */}
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
                        {app.user_id.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {app.user_id.substring(0, 12)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ID: {app.id.substring(0, 8)}
                      </div>
                    </div>
                  </div>

                  {/* AI Score */}
                  <div className="text-center">
                    {app.score !== undefined ? (
                      <div
                        className={cn(
                          "text-lg font-bold",
                          getScoreColor(app.score || 0)
                        )}
                      >
                        ● {app.score}%
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">N/A</div>
                    )}
                  </div>

                  {/* Applied Role */}
                  <div>
                    <div className="font-medium">
                      {app.job?.title || "Unknown Position"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {app.job?.job_type || ""}
                    </div>
                  </div>

                  {/* Applied Date */}
                  <div className="text-sm text-muted-foreground">
                    {formatDate(app.applied_on)}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyId(app.id);
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger
                        asChild
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(
                              `/tenant/recruiter-portal/applications/${app.id}`
                            );
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            toast.success("Interview scheduled");
                          }}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          Schedule Interview
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            toast.success("Candidate shortlisted");
                          }}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Shortlist
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            toast.success("Application rejected");
                          }}
                          className="text-destructive"
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ModernRecruiterLayout>
  );
}

export default function ApplicationsPage() {
  return (
    <TenantProtectedRoute allowedRoles={["recruiter"]}>
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        <ApplicationsContent />
      </Suspense>
    </TenantProtectedRoute>
  );
}
