"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { TenantProtectedRoute } from "@/components/tenant/TenantProtectedRoute";
import { RecruiterPortalLayout } from "@/components/tenant/recruiter-portal-layout";
import {
  tenantApplicationAPI,
  tenantJobAPI,
  ApplicationResponse,
  ApplicationStatus,
  JobResponse,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  Search,
  Download,
  Eye,
  MoreVertical,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Users,
  Briefcase,
  MapPin,
  Building2,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { format } from "date-fns";

// Status badge styling
const getStatusBadge = (status: ApplicationStatus) => {
  type BadgeVariant = "default" | "secondary" | "destructive" | "outline";
  const variants: Record<
    ApplicationStatus,
    {
      variant: BadgeVariant;
      icon: React.ComponentType<{ className?: string }>;
      label: string;
    }
  > = {
    [ApplicationStatus.PENDING]: {
      variant: "outline" as const,
      icon: Clock,
      label: "Pending",
    },
    [ApplicationStatus.SHORTLISTED]: {
      variant: "default" as const,
      icon: CheckCircle2,
      label: "Shortlisted",
    },
    [ApplicationStatus.AI_INTERVIEW_COMPLETED]: {
      variant: "secondary" as const,
      icon: CheckCircle2,
      label: "AI Interview Done",
    },
    [ApplicationStatus.HUMAN_INTERVIEW_SCHEDULED]: {
      variant: "default" as const,
      icon: Calendar,
      label: "Interview Scheduled",
    },
    [ApplicationStatus.HUMAN_INTERVIEW_COMPLETED]: {
      variant: "default" as const,
      icon: CheckCircle2,
      label: "Interview Completed",
    },
    [ApplicationStatus.OFFERED]: {
      variant: "default" as const,
      icon: TrendingUp,
      label: "Offered",
    },
    [ApplicationStatus.REJECTED]: {
      variant: "destructive" as const,
      icon: XCircle,
      label: "Rejected",
    },
    [ApplicationStatus.HIRED]: {
      variant: "default" as const,
      icon: CheckCircle2,
      label: "Hired",
    },
    [ApplicationStatus.WITHDRAWN]: {
      variant: "outline" as const,
      icon: AlertCircle,
      label: "Withdrawn",
    },
  };

  const config = variants[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
};

function JobApplicationsContent() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;

  const [job, setJob] = useState<JobResponse | null>(null);
  const [applications, setApplications] = useState<ApplicationResponse[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<
    ApplicationResponse[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">(
    "all"
  );

  useEffect(() => {
    if (jobId) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applications, searchQuery, statusFilter]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load job details and applications
      const [jobData, applicationsData] = await Promise.all([
        tenantJobAPI.getJob(jobId),
        tenantApplicationAPI.listJobApplications(jobId),
      ]);

      setJob(jobData);
      setApplications(applicationsData);
    } catch (err) {
      console.error("Failed to load data:", err);
      toast.error(err instanceof Error ? err.message : "Failed to load data");
      router.push("/tenant/recruiter-portal/jobs");
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...applications];

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((app) => app.status === statusFilter);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (app) =>
          app.user_id.toLowerCase().includes(query) ||
          app.id.toLowerCase().includes(query)
      );
    }

    setFilteredApplications(filtered);
  };

  // Calculate stats
  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.status === ApplicationStatus.PENDING)
      .length,
    shortlisted: applications.filter(
      (a) => a.status === ApplicationStatus.SHORTLISTED
    ).length,
    interviewed: applications.filter(
      (a) =>
        a.status === ApplicationStatus.HUMAN_INTERVIEW_COMPLETED ||
        a.status === ApplicationStatus.AI_INTERVIEW_COMPLETED
    ).length,
    offered: applications.filter((a) => a.status === ApplicationStatus.OFFERED)
      .length,
  };

  const handleViewApplication = (applicationId: string) => {
    router.push(`/tenant/recruiter-portal/applications/${applicationId}`);
  };

  const handleExportApplications = () => {
    toast.success("Export feature coming soon!");
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
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/tenant/recruiter-portal/jobs")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Applications for {job?.title}
            </h1>
            <p className="text-muted-foreground mt-1">
              Review and manage all applications for this position
            </p>
          </div>
        </div>
        <Button onClick={handleExportApplications} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Job Summary Card */}
      {job && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  <CardTitle>{job.title}</CardTitle>
                </div>
                <CardDescription className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Building2 className="h-4 w-4" />
                    {job.department}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {job.location}
                  </span>
                  <Badge variant={job.is_active ? "default" : "secondary"}>
                    {job.is_active ? "Active" : "Inactive"}
                  </Badge>
                </CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={() =>
                  router.push(`/tenant/recruiter-portal/jobs/${jobId}/edit`)
                }
              >
                Edit Job
              </Button>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Applications</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Users className="h-4 w-4" />
              All submissions
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending</CardDescription>
            <CardTitle className="text-3xl">{stats.pending}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-4 w-4" />
              Need review
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Shortlisted</CardDescription>
            <CardTitle className="text-3xl">{stats.shortlisted}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="h-4 w-4" />
              Top candidates
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Interviewed</CardDescription>
            <CardTitle className="text-3xl">{stats.interviewed}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Completed
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Offered</CardDescription>
            <CardTitle className="text-3xl">{stats.offered}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              Pending response
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by applicant ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select
              value={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(value as ApplicationStatus | "all")
              }
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  All Statuses ({applications.length})
                </SelectItem>
                <SelectItem value={ApplicationStatus.PENDING}>
                  Pending ({stats.pending})
                </SelectItem>
                <SelectItem value={ApplicationStatus.SHORTLISTED}>
                  Shortlisted ({stats.shortlisted})
                </SelectItem>
                <SelectItem value={ApplicationStatus.AI_INTERVIEW_COMPLETED}>
                  AI Interview Done
                </SelectItem>
                <SelectItem value={ApplicationStatus.HUMAN_INTERVIEW_SCHEDULED}>
                  Interview Scheduled
                </SelectItem>
                <SelectItem value={ApplicationStatus.HUMAN_INTERVIEW_COMPLETED}>
                  Interview Completed ({stats.interviewed})
                </SelectItem>
                <SelectItem value={ApplicationStatus.OFFERED}>
                  Offered ({stats.offered})
                </SelectItem>
                <SelectItem value={ApplicationStatus.REJECTED}>
                  Rejected
                </SelectItem>
                <SelectItem value={ApplicationStatus.HIRED}>Hired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Applications ({filteredApplications.length})</CardTitle>
          <CardDescription>
            {statusFilter !== "all"
              ? `Showing ${filteredApplications.length} ${statusFilter
                  .toLowerCase()
                  .replace(/_/g, " ")} applications`
              : `All applications for this position`}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {filteredApplications.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No applications found
              </h3>
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "No one has applied to this position yet"}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Applied Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Resume</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {application.user_id
                                .substring(0, 2)
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              Applicant #{application.user_id.substring(0, 8)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              ID: {application.user_id.substring(0, 12)}...
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div>
                          <p>
                            {format(
                              new Date(application.applied_on),
                              "MMM dd, yyyy"
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(
                              new Date(application.applied_on),
                              "hh:mm a"
                            )}
                          </p>
                        </div>
                      </TableCell>

                      <TableCell>
                        {getStatusBadge(application.status)}
                      </TableCell>

                      <TableCell>
                        {application.resume ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              window.open(application.resume, "_blank")
                            }
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            No resume
                          </span>
                        )}
                      </TableCell>

                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() =>
                                handleViewApplication(application.id)
                              }
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Full Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                window.open(application.resume, "_blank")
                              }
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              Download Resume
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Shortlist
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Calendar className="h-4 w-4 mr-2" />
                              Schedule Interview
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function JobApplicationsPage() {
  return (
    <TenantProtectedRoute requiredRole="RECRUITER">
      <RecruiterPortalLayout>
        <JobApplicationsContent />
      </RecruiterPortalLayout>
    </TenantProtectedRoute>
  );
}
