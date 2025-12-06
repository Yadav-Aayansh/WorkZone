"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TenantProtectedRoute } from "@/components/tenant/TenantProtectedRoute";
import { ModernRecruiterLayout } from "@/components/common/layout/ModernRecruiterLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  FileText,
  Loader2,
  Sparkles,
  Users,
  Briefcase,
  CheckCircle,
  Clock,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import {
  tenantJobAPI,
  tenantApplicationAPI,
  JobResponse,
  ApplicationResponse,
  ApplicationStatus,
} from "@/lib/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

function ResumeScoringContent() {
  const router = useRouter();
  const [jobs, setJobs] = useState<JobResponse[]>([]);
  const [applications, setApplications] = useState<ApplicationResponse[]>([]);
  const [selectedJob, setSelectedJob] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const jobsData = await tenantJobAPI.listJobs();
      setJobs(jobsData);

      // Load applications for all jobs
      const allApplications: ApplicationResponse[] = [];
      for (const job of jobsData) {
        try {
          const jobApps = await tenantApplicationAPI.listJobApplications(
            job.id
          );
          allApplications.push(...jobApps);
        } catch (err) {
          console.error(`Failed to load applications for job ${job.id}:`, err);
        }
      }
      setApplications(allApplications);
    } catch (err) {
      console.error("Failed to load data:", err);
      toast.error(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.SHORTLISTED:
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            Shortlisted
          </Badge>
        );
      case ApplicationStatus.REJECTED:
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
            Rejected
          </Badge>
        );
      case ApplicationStatus.PENDING:
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
            Pending
          </Badge>
        );
      case ApplicationStatus.AI_INTERVIEW_COMPLETED:
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
            AI Interview Done
          </Badge>
        );
      case ApplicationStatus.HIRED:
        return (
          <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
            Hired
          </Badge>
        );
      default:
        return <Badge variant="outline">{status.replace(/_/g, " ")}</Badge>;
    }
  };

  const filteredApplications =
    selectedJob === "all"
      ? applications
      : applications.filter((a) => a.job_id === selectedJob);

  // Group applications by job for stats
  const applicationsByJob = applications.reduce((acc, app) => {
    acc[app.job_id] = (acc[app.job_id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Count by status
  const statusCounts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const stats = {
    total: applications.length,
    pending: statusCounts[ApplicationStatus.PENDING] || 0,
    shortlisted: statusCounts[ApplicationStatus.SHORTLISTED] || 0,
    activeJobs: jobs.filter((j) => j.is_open).length,
  };

  const getJobTitle = (jobId: string) => {
    const job = jobs.find((j) => j.id === jobId);
    return job?.title || "Unknown Position";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resume Scoring</h1>
          <p className="text-muted-foreground mt-1">
            AI-powered resume analysis and candidate matching
          </p>
        </div>
      </div>

      {/* Info Alert */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>How Resume Scoring Works</AlertTitle>
        <AlertDescription>
          Resume scores are calculated automatically when you{" "}
          <strong>close a job posting</strong>. When closing a job, you can
          specify how many top candidates to shortlist, and our AI will analyze
          all resumes against the job description to rank candidates. Go to a
          job&apos;s detail page and click &quot;Close Job&quot; to trigger AI
          scoring.
        </AlertDescription>
      </Alert>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
              {stats.pending}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Shortlisted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {stats.shortlisted}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Active Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {stats.activeJobs}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Jobs with Applications */}
      <Card>
        <CardHeader>
          <CardTitle>Jobs Ready for AI Scoring</CardTitle>
          <CardDescription>
            Close a job to trigger AI resume ranking and shortlisting
          </CardDescription>
        </CardHeader>
        <CardContent>
          {jobs.length === 0 ? (
            <div className="text-center py-8">
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No jobs found</p>
              <Button
                variant="link"
                onClick={() =>
                  router.push("/tenant/recruiter-portal/jobs/create")
                }
              >
                Create a job posting
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{job.title}</span>
                      {job.is_open ? (
                        <Badge variant="outline" className="text-green-600">
                          Open
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-500">
                          Closed
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {job.department} • {job.location} •{" "}
                      {applicationsByJob[job.id] || 0} applications
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {job.is_open && (applicationsByJob[job.id] || 0) > 0 && (
                      <Button
                        size="sm"
                        onClick={() =>
                          router.push(`/tenant/recruiter-portal/jobs/${job.id}`)
                        }
                      >
                        <Sparkles className="mr-2 h-4 w-4" />
                        View & Close Job
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        router.push(`/tenant/recruiter-portal/jobs/${job.id}`)
                      }
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Applications</CardTitle>
              <CardDescription>
                View all applications across jobs
              </CardDescription>
            </div>
            <Select value={selectedJob} onValueChange={setSelectedJob}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Filter by Job" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Jobs</SelectItem>
                {jobs.map((job) => (
                  <SelectItem key={job.id} value={job.id}>
                    {job.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>Job Position</TableHead>
                <TableHead>Applied On</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="text-muted-foreground">
                      No applications found
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredApplications.map((app) => (
                  <TableRow
                    key={app.id}
                    className="cursor-pointer hover:bg-accent/50"
                    onClick={() =>
                      router.push(
                        `/tenant/recruiter-portal/applications/${app.id}`
                      )
                    }
                  >
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-semibold">
                          Applicant #{app.id.slice(0, 8)}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          Resume attached
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {getJobTitle(app.job_id)}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(app.applied_on)}
                    </TableCell>
                    <TableCell>{getStatusBadge(app.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(
                            `/tenant/recruiter-portal/applications/${app.id}`
                          );
                        }}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ResumeScoringPage() {
  return (
    <TenantProtectedRoute allowedRoles={["recruiter"]}>
      <ModernRecruiterLayout>
        <ResumeScoringContent />
      </ModernRecruiterLayout>
    </TenantProtectedRoute>
  );
}
