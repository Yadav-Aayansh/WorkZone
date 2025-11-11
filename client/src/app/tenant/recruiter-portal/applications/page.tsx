"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
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

interface ApplicationWithJob extends ApplicationResponse {
  job?: JobResponse;
}

function ApplicationsContent() {
  const router = useRouter();
  const [applications, setApplications] = useState<ApplicationWithJob[]>([]);
  const [jobs, setJobs] = useState<JobResponse[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<
    ApplicationWithJob[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">(
    "all"
  );
  const [jobFilter, setJobFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<ApplicationStatus | "all">("all");

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applications, searchQuery, statusFilter, jobFilter, activeTab]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load all jobs first
      const jobsResponse = await tenantJobAPI.listJobs();
      setJobs(jobsResponse);

      // Load applications for each job
      const allApplications: ApplicationWithJob[] = [];

      for (const job of jobsResponse) {
        try {
          const jobApplications =
            await tenantApplicationAPI.listJobApplications(job.id);
          // Attach job info to each application
          const applicationsWithJob = jobApplications.map((app) => ({
            ...app,
            job: job,
          }));
          allApplications.push(...applicationsWithJob);
        } catch (err) {
          console.error(`Failed to load applications for job ${job.id}:`, err);
        }
      }

      setApplications(allApplications);
    } catch (err) {
      console.error("Failed to load data:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to load applications"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...applications];

    // Tab filter (status)
    if (activeTab !== "all") {
      filtered = filtered.filter((app) => app.status === activeTab);
    }

    // Additional status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((app) => app.status === statusFilter);
    }

    // Job filter
    if (jobFilter !== "all") {
      filtered = filtered.filter((app) => app.job_id === jobFilter);
    }

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
    hired: applications.filter((a) => a.status === ApplicationStatus.HIRED)
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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Applications</h1>
          <p className="text-muted-foreground mt-1">
            Manage all job applications from one place
          </p>
        </div>
        <Button onClick={handleExportApplications} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Users className="h-4 w-4" />
              All applications
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
              Top picks
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

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Hired</CardDescription>
            <CardTitle className="text-3xl">{stats.hired}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Success!
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
                placeholder="Search by applicant, job title, or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={jobFilter} onValueChange={setJobFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by job" />
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
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value={ApplicationStatus.PENDING}>
                  Pending
                </SelectItem>
                <SelectItem value={ApplicationStatus.SHORTLISTED}>
                  Shortlisted
                </SelectItem>
                <SelectItem value={ApplicationStatus.AI_INTERVIEW_COMPLETED}>
                  AI Interview Done
                </SelectItem>
                <SelectItem value={ApplicationStatus.HUMAN_INTERVIEW_SCHEDULED}>
                  Interview Scheduled
                </SelectItem>
                <SelectItem value={ApplicationStatus.HUMAN_INTERVIEW_COMPLETED}>
                  Interview Completed
                </SelectItem>
                <SelectItem value={ApplicationStatus.OFFERED}>
                  Offered
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

      {/* Applications Table with Tabs */}
      <Card>
        <CardHeader>
          <Tabs
            value={activeTab}
            onValueChange={(value) =>
              setActiveTab(value as ApplicationStatus | "all")
            }
          >
            <TabsList>
              <TabsTrigger value="all">
                All{" "}
                <Badge variant="secondary" className="ml-2">
                  {applications.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value={ApplicationStatus.PENDING}>
                Pending{" "}
                <Badge variant="secondary" className="ml-2">
                  {stats.pending}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value={ApplicationStatus.SHORTLISTED}>
                Shortlisted{" "}
                <Badge variant="secondary" className="ml-2">
                  {stats.shortlisted}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value={ApplicationStatus.OFFERED}>
                Offered{" "}
                <Badge variant="secondary" className="ml-2">
                  {stats.offered}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value={ApplicationStatus.HIRED}>
                Hired{" "}
                <Badge variant="secondary" className="ml-2">
                  {stats.hired}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>

        <CardContent>
          {filteredApplications.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No applications found
              </h3>
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== "all" || jobFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Applications will appear here once candidates start applying"}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Job Position</TableHead>
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
                          <p className="font-medium">
                            {application.job?.title || "Unknown Position"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {application.job?.department} •{" "}
                            {application.job?.location}
                          </p>
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
                              View Details
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

export default function ApplicationsPage() {
  return (
    <TenantProtectedRoute requiredRole="RECRUITER">
      <RecruiterPortalLayout>
        <ApplicationsContent />
      </RecruiterPortalLayout>
    </TenantProtectedRoute>
  );
}
