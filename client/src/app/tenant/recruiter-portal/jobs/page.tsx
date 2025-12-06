// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/* eslint-disable */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TenantProtectedRoute } from "@/components/tenant/TenantProtectedRoute";
import { tenantJobAPI, JobResponse, tenantApplicationAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  Loader2,
  Briefcase,
  Users,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import { ModernRecruiterLayout } from "@/components/common/layout/ModernRecruiterLayout";
import { JobCard } from "@/components/dashboard/recruiter/JobCard";
import { KPICard } from "@/components/dashboard/shared/KPICard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface JobWithStats extends JobResponse {
  applicationsCount?: number;
  interviewsCount?: number;
  hiredCount?: number;
}

function JobsManagementContent() {
  const router = useRouter();
  const [jobs, setJobs] = useState<JobWithStats[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [deleteJobId, setDeleteJobId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [closeJobId, setCloseJobId] = useState<string | null>(null);
  const [topXCandidates, setTopXCandidates] = useState<string>("");
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [jobs, searchQuery, statusFilter, locationFilter]);

  const loadJobs = async () => {
    setIsLoading(true);
    try {
      const jobsData = await tenantJobAPI.listJobs();

      // Load application counts for each job
      const jobsWithStats = await Promise.all(
        jobsData.map(async (job) => {
          try {
            const applications = await tenantApplicationAPI.listJobApplications(
              job.id
            );
            return {
              ...job,
              applicationsCount: applications.length,
              interviewsCount: applications.filter(
                (app) =>
                  app.status === "HUMAN_INTERVIEW_SCHEDULED" ||
                  app.status === "AI_INTERVIEW_COMPLETED"
              ).length,
              hiredCount: applications.filter((app) => app.status === "HIRED")
                .length,
            };
          } catch (err) {
            console.error(
              `Failed to load applications for job ${job.id}:`,
              err
            );
            return {
              ...job,
              applicationsCount: 0,
              interviewsCount: 0,
              hiredCount: 0,
            };
          }
        })
      );

      setJobs(jobsWithStats);
    } catch (err: any) {
      console.error("Failed to load jobs:", err);
      toast.error(err.message || "Failed to load jobs");
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...jobs];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(query) ||
          job.department.toLowerCase().includes(query) ||
          job.location.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      if (statusFilter === "active") {
        filtered = filtered.filter((job) => job.is_active && job.is_open);
      } else if (statusFilter === "closed") {
        filtered = filtered.filter((job) => !job.is_open);
      } else if (statusFilter === "draft") {
        filtered = filtered.filter((job) => !job.is_active);
      }
    }

    // Location filter
    if (locationFilter !== "all") {
      filtered = filtered.filter((job) => job.location === locationFilter);
    }

    setFilteredJobs(filtered);
  };

  const handleDeleteJob = async () => {
    if (!deleteJobId) return;

    setIsDeleting(true);
    try {
      await tenantJobAPI.deleteJob(deleteJobId);
      setJobs((prev) => prev.filter((j) => j.id !== deleteJobId));
      toast.success("Job deleted successfully");
      setDeleteJobId(null);
    } catch (err: any) {
      console.error("Failed to delete job:", err);
      toast.error(err.message || "Failed to delete job");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseJob = async (jobId: string) => {
    setCloseJobId(jobId);
  };

  const confirmCloseJob = async () => {
    if (!closeJobId) return;
    setIsClosing(true);
    try {
      const topX = topXCandidates ? parseInt(topXCandidates) : undefined;
      await tenantJobAPI.closeJob(
        closeJobId,
        topX ? { top_x: topX } : undefined
      );
      setJobs((prev) =>
        prev.map((j) => (j.id === closeJobId ? { ...j, is_open: false } : j))
      );
      toast.success(
        `Job closed successfully!${
          topX ? ` Top ${topX} candidates will be shortlisted.` : ""
        }`
      );
      setCloseJobId(null);
      setTopXCandidates("");
    } catch (err: any) {
      console.error("Failed to close job:", err);
      toast.error(err.message || "Failed to close job");
    } finally {
      setIsClosing(false);
    }
  };

  const handleReopenJob = async (jobId: string) => {
    try {
      await tenantJobAPI.reopenJob(jobId);
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, is_open: true } : j))
      );
      toast.success("Job reopened successfully");
    } catch (err: any) {
      console.error("Failed to reopen job:", err);
      toast.error(err.message || "Failed to reopen job");
    }
  };

  // Calculate KPIs
  const totalJobs = jobs.length;
  const activeJobs = jobs.filter((j) => j.is_active && j.is_open).length;
  const totalApplications = jobs.reduce(
    (sum, job) => sum + (job.applicationsCount || 0),
    0
  );
  const totalHired = jobs.reduce((sum, job) => sum + (job.hiredCount || 0), 0);

  // Get unique locations for filter
  const locations = Array.from(new Set(jobs.map((j) => j.location)));

  const calculateProgress = (job: JobWithStats) => {
    const total = job.applicationsCount || 0;
    const hired = job.hiredCount || 0;
    if (total === 0) return 0;
    return Math.round((hired / total) * 100);
  };

  const calculateDaysRemaining = (closingDate?: string) => {
    if (!closingDate) return undefined;
    const today = new Date();
    const closing = new Date(closingDate);
    const diffTime = closing.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  return (
    <ModernRecruiterLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Active Roles
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage your job postings and track applications
            </p>
          </div>
          <Button
            size="default"
            onClick={() => router.push("/tenant/recruiter-portal/jobs/create")}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Job
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <KPICard
            title="Total Applied"
            value={totalApplications}
            trend={{
              value: 12,
              direction: "up",
              label: "vs last month",
            }}
            icon={<Users className="h-5 w-5" />}
            variant="purple"
          />

          <KPICard
            title="Active Jobs"
            value={activeJobs}
            icon={<Briefcase className="h-5 w-5" />}
            variant="blue"
          />

          <KPICard
            title="Total Hired"
            value={totalHired}
            trend={{
              value: 8,
              direction: "up",
              label: "vs last month",
            }}
            icon={<CheckCircle className="h-5 w-5" />}
            variant="green"
          />

          <KPICard
            title="Total Jobs"
            value={totalJobs}
            icon={<Briefcase className="h-5 w-5" />}
            variant="orange"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by Job title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>

          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locations.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" className="w-full sm:w-auto">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <line x1="4" y1="21" x2="4" y2="14"></line>
              <line x1="4" y1="10" x2="4" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12" y2="3"></line>
              <line x1="20" y1="21" x2="20" y2="16"></line>
              <line x1="20" y1="12" x2="20" y2="3"></line>
              <line x1="1" y1="14" x2="7" y2="14"></line>
              <line x1="9" y1="8" x2="15" y2="8"></line>
              <line x1="17" y1="16" x2="23" y2="16"></line>
            </svg>
            Filters
          </Button>
        </div>

        {/* Jobs Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Loading jobs...</span>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No jobs found</p>
            <p className="text-sm mt-2">
              {searchQuery || statusFilter !== "all" || locationFilter !== "all"
                ? "Try adjusting your filters"
                : "Create your first job posting to get started"}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                id={job.id}
                title={job.title}
                company={job.department}
                creator={{
                  name: "Recruiter",
                }}
                totalApplied={job.applicationsCount || 0}
                totalInterviews={job.interviewsCount || 0}
                hired={job.hiredCount || 0}
                location={job.location}
                jobType={job.job_type}
                employmentType={job.employment_type}
                dateRange={
                  job.closing_date
                    ? {
                        start: job.created_at,
                        end: job.closing_date,
                      }
                    : undefined
                }
                daysRemaining={calculateDaysRemaining(job.closing_date)}
                progress={calculateProgress(job)}
                status={
                  !job.is_active ? "draft" : job.is_open ? "active" : "closed"
                }
                isOpen={job.is_open}
                onClick={() =>
                  router.push(`/tenant/recruiter-portal/jobs/${job.id}`)
                }
                onEdit={() =>
                  router.push(`/tenant/recruiter-portal/jobs/${job.id}/edit`)
                }
                onDelete={() => setDeleteJobId(job.id)}
                onClose={() => handleCloseJob(job.id)}
                onReopen={() => handleReopenJob(job.id)}
                onViewApplications={() =>
                  router.push(
                    `/tenant/recruiter-portal/applications?job=${job.id}`
                  )
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteJobId !== null}
        onOpenChange={(open) => !open && setDeleteJobId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Job</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this job? This action cannot be
              undone and all associated applications will be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteJob}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Close Job Dialog */}
      <Dialog
        open={closeJobId !== null}
        onOpenChange={(open) => !open && setCloseJobId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Close Job Posting</DialogTitle>
            <DialogDescription>
              Closing this job will stop accepting new applications. You can
              optionally specify how many top candidates to shortlist based on
              AI resume scoring.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="topX">
                Number of candidates to shortlist (optional)
              </Label>
              <Input
                id="topX"
                type="number"
                min="1"
                placeholder="Enter a number"
                value={topXCandidates}
                onChange={(e) => setTopXCandidates(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Leave empty to close without auto-shortlisting.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCloseJobId(null);
                setTopXCandidates("");
              }}
              disabled={isClosing}
            >
              Cancel
            </Button>
            <Button onClick={confirmCloseJob} disabled={isClosing}>
              {isClosing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Closing...
                </>
              ) : (
                "Close Job"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ModernRecruiterLayout>
  );
}

export default function JobsManagementPage() {
  return (
    <TenantProtectedRoute allowedRoles={["recruiter"]}>
      <JobsManagementContent />
    </TenantProtectedRoute>
  );
}
