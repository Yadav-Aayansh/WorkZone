"use client";

import { useState, useEffect } from "react";
import { TenantProtectedRoute } from "@/components/tenant/TenantProtectedRoute";
import { ModernRecruiterLayout } from "@/components/common/layout/ModernRecruiterLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Filter,
  Download,
  MoreVertical,
  Loader2,
  Users,
  Eye,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  tenantJobAPI,
  tenantApplicationAPI,
  ApplicationResponse,
  ApplicationStatus,
  JobResponse,
} from "@/lib/api";

interface ApplicationWithJob extends ApplicationResponse {
  job?: JobResponse;
}

function CandidatesContent() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [jobFilter, setJobFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [jobs, setJobs] = useState<JobResponse[]>([]);
  const [applications, setApplications] = useState<ApplicationWithJob[]>([]);

  useEffect(() => {
    loadCandidatesData();
  }, []);

  const loadCandidatesData = async () => {
    setIsLoading(true);
    try {
      // Load all jobs
      const jobsData = await tenantJobAPI.listJobs();
      setJobs(jobsData);

      // Load applications for all jobs
      const allApplications: ApplicationWithJob[] = [];
      for (const job of jobsData) {
        try {
          const jobApps = await tenantApplicationAPI.listJobApplications(
            job.id
          );
          const appsWithJob = jobApps.map((app) => ({ ...app, job }));
          allApplications.push(...appsWithJob);
        } catch (err) {
          console.error(`Failed to load applications for job ${job.id}:`, err);
        }
      }

      setApplications(allApplications);
    } catch (err) {
      console.error("Failed to load candidates data:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to load candidates data"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Filter candidates (applications)
  const filteredCandidates = applications.filter((candidate) => {
    const matchesSearch =
      candidate.user_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.job?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.job?.department
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesJob = jobFilter === "all" || candidate.job_id === jobFilter;
    const matchesStatus =
      statusFilter === "all" || candidate.status === statusFilter;

    return matchesSearch && matchesJob && matchesStatus;
  });

  const getCandidateStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.SHORTLISTED:
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            Shortlisted
          </Badge>
        );
      case ApplicationStatus.PENDING:
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
            Pending Review
          </Badge>
        );
      case ApplicationStatus.REJECTED:
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
            Rejected
          </Badge>
        );
      case ApplicationStatus.OFFERED:
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
            Offered
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading candidates...</p>
        </div>
      </div>
    );
  }

  const stats = {
    total: applications.length,
    shortlisted: applications.filter(
      (c) => c.status === ApplicationStatus.SHORTLISTED
    ).length,
    pending: applications.filter((c) => c.status === ApplicationStatus.PENDING)
      .length,
    rejected: applications.filter(
      (c) => c.status === ApplicationStatus.REJECTED
    ).length,
  };

  return (
    <ModernRecruiterLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Candidates</h1>
          <p className="text-muted-foreground mt-1">
            Manage and review all job applicants
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Candidates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
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
              <CardTitle className="text-sm font-medium text-muted-foreground">
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
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Rejected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                {stats.rejected}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold">Filters</h3>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search candidates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Job Filter */}
                <Select value={jobFilter} onValueChange={setJobFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Jobs" />
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

                {/* Status Filter */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value={ApplicationStatus.PENDING}>
                      Pending Review
                    </SelectItem>
                    <SelectItem value={ApplicationStatus.SHORTLISTED}>
                      Shortlisted
                    </SelectItem>
                    <SelectItem value={ApplicationStatus.OFFERED}>
                      Offered
                    </SelectItem>
                    <SelectItem value={ApplicationStatus.HIRED}>
                      Hired
                    </SelectItem>
                    <SelectItem value={ApplicationStatus.REJECTED}>
                      Rejected
                    </SelectItem>
                  </SelectContent>
                </Select>

                {/* Empty placeholder for 4th column */}
                <div></div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredCandidates.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No candidates found</p>
                <p className="text-sm mt-2">Try adjusting your filters</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidate</TableHead>
                    <TableHead>Job Applied</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Applied Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCandidates.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <div className="text-muted-foreground">
                          No candidates found matching your criteria
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCandidates.map((candidate) => (
                      <TableRow
                        key={candidate.id}
                        className="cursor-pointer hover:bg-accent/50"
                        onClick={() =>
                          router.push(
                            `/tenant/recruiter-portal/applications/${candidate.id}`
                          )
                        }
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                {candidate.user_id
                                  .substring(0, 2)
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-semibold">
                                Applicant #{candidate.user_id.substring(0, 8)}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                ID: {candidate.user_id.substring(0, 12)}...
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[250px]">
                            <div className="font-medium truncate">
                              {candidate.job?.title || "Unknown Position"}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {candidate.job?.department} •{" "}
                              {candidate.job?.location}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getCandidateStatusBadge(candidate.status)}
                        </TableCell>
                        <TableCell>
                          {formatDate(candidate.applied_on)}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              asChild
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(
                                    `/tenant/recruiter-portal/applications/${candidate.id}`
                                  );
                                }}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              {candidate.resume && (
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(candidate.resume, "_blank");
                                  }}
                                >
                                  <Download className="mr-2 h-4 w-4" />
                                  Download Resume
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </ModernRecruiterLayout>
  );
}

export default function CandidatesPage() {
  return (
    <TenantProtectedRoute allowedRoles={["recruiter"]}>
      <CandidatesContent />
    </TenantProtectedRoute>
  );
}
