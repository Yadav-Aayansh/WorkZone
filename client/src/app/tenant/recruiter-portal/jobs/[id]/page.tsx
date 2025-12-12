// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/* eslint-disable */

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { TenantProtectedRoute } from "@/components/tenant/TenantProtectedRoute";
import { ModernRecruiterLayout } from "@/components/common/layout/ModernRecruiterLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ReactMarkdown from "react-markdown";
import {
  ArrowLeft,
  Edit,
  Archive,
  Share2,
  Copy,
  MoreVertical,
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  Users,
  Calendar,
  Eye,
  CheckCircle,
  XCircle,
  Loader2,
  Inbox,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  tenantJobAPI,
  tenantApplicationAPI,
  JobResponse,
  ApplicationResponse,
  ApplicationStatus,
} from "@/lib/api";

function JobDetailsContent() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const [job, setJob] = useState<JobResponse | null>(null);
  const [applications, setApplications] = useState<ApplicationResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [topXCandidates, setTopXCandidates] = useState<string>("");
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (jobId) {
      loadJobData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  const loadJobData = async () => {
    setIsLoading(true);
    try {
      const [jobData, applicationsData] = await Promise.all([
        tenantJobAPI.getJob(jobId),
        tenantApplicationAPI.listJobApplications(jobId),
      ]);
      setJob(jobData);
      setApplications(applicationsData);
    } catch (err) {
      console.error("Failed to load job data:", err);
      toast.error(err instanceof Error ? err.message : "Failed to load job");
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate stats from real applications
  const statusCounts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pendingCount = statusCounts[ApplicationStatus.PENDING] || 0;
  const shortlistedCount = statusCounts[ApplicationStatus.SHORTLISTED] || 0;
  const aiInterviewCount =
    statusCounts[ApplicationStatus.AI_INTERVIEW_COMPLETED] || 0;
  const humanInterviewScheduledCount =
    statusCounts[ApplicationStatus.HUMAN_INTERVIEW_SCHEDULED] || 0;
  const humanInterviewCompletedCount =
    statusCounts[ApplicationStatus.HUMAN_INTERVIEW_COMPLETED] || 0;
  const offeredCount = statusCounts[ApplicationStatus.OFFERED] || 0;
  const rejectedCount = statusCounts[ApplicationStatus.REJECTED] || 0;
  const hiredCount = statusCounts[ApplicationStatus.HIRED] || 0;
  const withdrawnCount = statusCounts[ApplicationStatus.WITHDRAWN] || 0;

  // Build analytics data from real applications
  const statusPieData = Object.entries(statusCounts)
    .filter(([_, count]) => count > 0)
    .map(([status, count]) => ({ status, count }));

  // Group applications by date for timeline chart
  const applicationsByDate = applications.reduce((acc, app) => {
    const date = new Date(app.applied_at || app.created_at).toLocaleDateString(
      "en-US",
      { month: "short", day: "numeric" }
    );
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const applicationsTimelineData = Object.entries(applicationsByDate)
    .slice(-7) // Last 7 days
    .map(([date, count]) => ({ date, count }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Job Not Found</h2>
          <p className="text-muted-foreground mt-2">
            The job you&apos;re looking for doesn&apos;t exist.
          </p>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
          Active
        </Badge>
      );
    }
    return (
      <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400">
        Closed
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatSalary = (min?: number, max?: number) => {
    if (!min || !max) return "Not specified";
    return `₹${(min / 100000).toFixed(1)}L - ₹${(max / 100000).toFixed(1)}L`;
  };

  const handleCopyJobLink = () => {
    const jobLink = `${window.location.origin}/tenant/careers/${jobId}`;
    navigator.clipboard.writeText(jobLink);
    toast.success("Job link copied to clipboard!");
  };

  const handleCloseJob = async () => {
    try {
      if (!job) return;
      setIsClosing(true);

      const topX = topXCandidates ? parseInt(topXCandidates) : undefined;
      const updated = await tenantJobAPI.closeJob(
        job.id,
        topX ? { top_x: topX } : undefined
      );
      setJob(updated);
      setShowCloseDialog(false);
      setTopXCandidates("");
      toast.success(
        `Job closed successfully!${
          topX ? ` Top ${topX} candidates will be shortlisted.` : ""
        }`
      );
    } catch (err: any) {
      console.error("Failed to close job:", err);
      toast.error(err.message || "Failed to close job");
    } finally {
      setIsClosing(false);
    }
  };

  const handleArchiveJob = () => {
    toast.success("Job archived successfully!");
  };

  // Pie chart colors for status breakdown
  const COLORS = [
    "#fbbf24",
    "#10b981",
    "#ef4444",
    "#8b5cf6",
    "#3b82f6",
    "#ec4899",
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{job.title}</h1>
              {getStatusBadge(job.is_active)}
            </div>
            <p className="text-muted-foreground mt-1">
              Posted on {formatDate(job.created_at)}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="icon" onClick={handleCopyJobLink}>
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Share2 className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() =>
                  router.push(`/tenant/recruiter-portal/jobs/${jobId}/edit`)
                }
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Job
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setShowCloseDialog(true)}
                disabled={!job?.is_open}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Close Job
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleArchiveJob}
                className="text-destructive"
              >
                <Archive className="mr-2 h-4 w-4" />
                Archive Job
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            onClick={() =>
              router.push(`/tenant/recruiter-portal/jobs/${jobId}/edit`)
            }
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Job
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Applications
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{applications.length}</div>
            <p className="text-xs text-muted-foreground">
              {applications.length} applicants
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shortlisted</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {
                applications.filter(
                  (a) => a.status === ApplicationStatus.SHORTLISTED
                ).length
              }
            </div>
            <p className="text-xs text-muted-foreground">
              {applications.length > 0
                ? (
                    (applications.filter(
                      (a) => a.status === ApplicationStatus.SHORTLISTED
                    ).length /
                      applications.length) *
                    100
                  ).toFixed(1)
                : 0}
              % of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Interviews Scheduled
            </CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {
                applications.filter(
                  (a) =>
                    a.status === ApplicationStatus.HUMAN_INTERVIEW_SCHEDULED ||
                    a.status === ApplicationStatus.HUMAN_INTERVIEW_COMPLETED
                ).length
              }
            </div>
            <p className="text-xs text-muted-foreground">
              {
                applications.filter(
                  (a) =>
                    a.status === ApplicationStatus.HUMAN_INTERVIEW_SCHEDULED ||
                    a.status === ApplicationStatus.HUMAN_INTERVIEW_COMPLETED
                ).length
              }{" "}
              candidates
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {
                applications.filter(
                  (a) => a.status === ApplicationStatus.REJECTED
                ).length
              }
            </div>
            <p className="text-xs text-muted-foreground">
              {applications.length > 0
                ? (
                    (applications.filter(
                      (a) => a.status === ApplicationStatus.REJECTED
                    ).length /
                      applications.length) *
                    100
                  ).toFixed(1)
                : 0}
              % of total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* View Applications Button */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-lg">Application Management</CardTitle>
          <CardDescription>
            View and manage all applications for this position
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            className="w-full sm:w-auto"
            onClick={() =>
              router.push(`/tenant/recruiter-portal/jobs/${jobId}/applications`)
            }
          >
            <Inbox className="mr-2 h-4 w-4" />
            View All Applications ({applications.length})
          </Button>
        </CardContent>
      </Card>

      {/* Tabs Section */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="applicants">
            Applicants ({applications.length})
          </TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Job Details Card */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Basic Info */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Department
                      </p>
                      <p className="font-medium">{job.department}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-medium">{job.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Salary Range
                      </p>
                      <p className="font-medium">
                        {formatSalary(job.min_salary, job.max_salary)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Experience
                      </p>
                      <p className="font-medium">{job.required_experience}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Description */}
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <div className="text-sm text-muted-foreground [&>h1]:text-xl [&>h1]:font-bold [&>h1]:mt-4 [&>h1]:mb-2 [&>h2]:text-lg [&>h2]:font-semibold [&>h2]:mt-3 [&>h2]:mb-1.5 [&>h3]:text-base [&>h3]:font-medium [&>h3]:mt-2 [&>h3]:mb-1 [&>p]:my-2 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:my-2 [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:my-2 [&>li]:my-0.5 [&>*]:text-muted-foreground">
                    <ReactMarkdown>{job.description}</ReactMarkdown>
                  </div>
                </div>

                {job.required_skills && job.required_skills.length > 0 && (
                  <>
                    <Separator />
                    {/* Skills */}
                    <div>
                      <h4 className="font-semibold mb-2">Required Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {job.required_skills.map((skill, index) => (
                          <Badge key={index} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Side Panel */}
            <div className="space-y-4">
              {/* Application Dates */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Timeline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Created</p>
                    <p className="text-sm font-medium">
                      {formatDate(job.createdAt)}
                    </p>
                  </div>
                  {job.closingDate && (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Closing Date
                      </p>
                      <p className="text-sm font-medium">
                        {formatDate(job.closingDate)}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Employment Type
                    </p>
                    <p className="text-sm font-medium capitalize">{job.type}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() =>
                      router.push(
                        `/tenant/recruiter-portal/candidates?job=${jobId}`
                      )
                    }
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View All Applicants
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() =>
                      router.push(
                        `/tenant/recruiter-portal/interviews?job=${jobId}`
                      )
                    }
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule Interview
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={handleCopyJobLink}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Job Link
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Applicants Tab */}
        <TabsContent value="applicants" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Applicants</CardTitle>
              <CardDescription>
                Candidates who have applied for this position
              </CardDescription>
            </CardHeader>
            <CardContent>
              {applications.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No applicants yet for this position
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Candidate</TableHead>
                      <TableHead>Applied Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((application) => (
                      <TableRow
                        key={application.id}
                        className="cursor-pointer hover:bg-accent/50"
                        onClick={() =>
                          router.push(
                            `/tenant/recruiter-portal/applications/${application.id}`
                          )
                        }
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-primary/10 text-primary">
                                A{application.id.slice(0, 1).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-semibold">
                                Applicant #{application.id.slice(0, 8)}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                User ID: {application.user_id.slice(0, 8)}...
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatDate(application.applied_on)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              application.status ===
                              ApplicationStatus.SHORTLISTED
                                ? "default"
                                : application.status ===
                                  ApplicationStatus.REJECTED
                                ? "destructive"
                                : application.status === ApplicationStatus.HIRED
                                ? "default"
                                : "secondary"
                            }
                          >
                            {application.status.replace(/_/g, " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(
                                `/tenant/recruiter-portal/applications/${application.id}`
                              );
                            }}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Applications Over Time */}
            <Card>
              <CardHeader>
                <CardTitle>Applications Over Time</CardTitle>
                <CardDescription>Recent application trends</CardDescription>
              </CardHeader>
              <CardContent>
                {applicationsTimelineData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={applicationsTimelineData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-muted"
                      />
                      <XAxis
                        dataKey="date"
                        className="text-xs"
                        tick={{ fill: "hsl(var(--muted-foreground))" }}
                      />
                      <YAxis
                        className="text-xs"
                        tick={{ fill: "hsl(var(--muted-foreground))" }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={{ fill: "hsl(var(--primary))" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    No application data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Application Status Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Application Status</CardTitle>
                <CardDescription>Current status distribution</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                {statusPieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={statusPieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) =>
                          `${entry.status.replace(/_/g, " ")}: ${entry.count}`
                        }
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {statusPieData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    No applications yet
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Conversion Funnel */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Hiring Funnel</CardTitle>
                <CardDescription>
                  Candidate conversion at each stage
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    stage: "Total Applications",
                    count: applications.length,
                    color: "bg-blue-500",
                  },
                  {
                    stage: "Pending Review",
                    count: pendingCount,
                    color: "bg-yellow-500",
                  },
                  {
                    stage: "Shortlisted",
                    count: shortlistedCount,
                    color: "bg-green-500",
                  },
                  {
                    stage: "AI Interview Completed",
                    count: aiInterviewCount,
                    color: "bg-cyan-500",
                  },
                  {
                    stage: "Human Interview",
                    count:
                      humanInterviewScheduledCount +
                      humanInterviewCompletedCount,
                    color: "bg-purple-500",
                  },
                  {
                    stage: "Offered",
                    count: offeredCount,
                    color: "bg-indigo-500",
                  },
                  {
                    stage: "Hired",
                    count: hiredCount,
                    color: "bg-emerald-500",
                  },
                  {
                    stage: "Rejected",
                    count: rejectedCount,
                    color: "bg-red-500",
                  },
                ]
                  .filter(
                    (item) =>
                      item.count > 0 || item.stage === "Total Applications"
                  )
                  .map((item) => (
                    <div key={item.stage}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">
                          {item.stage}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {item.count}{" "}
                          {applications.length > 0
                            ? `(${(
                                (item.count / applications.length) *
                                100
                              ).toFixed(1)}%)`
                            : ""}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className={`${item.color} h-2 rounded-full transition-all`}
                          style={{
                            width:
                              applications.length > 0
                                ? `${(item.count / applications.length) * 100}%`
                                : "0%",
                          }}
                        />
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Close Job Dialog */}
      <Dialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
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
                max={applications.length}
                placeholder={`Enter a number (max: ${applications.length})`}
                value={topXCandidates}
                onChange={(e) => setTopXCandidates(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Leave empty to close without auto-shortlisting. Current
                applicants: {applications.length}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCloseDialog(false)}
              disabled={isClosing}
            >
              Cancel
            </Button>
            <Button onClick={handleCloseJob} disabled={isClosing}>
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
    </div>
  );
}

export default function JobDetailsPage() {
  return (
    <TenantProtectedRoute allowedRoles={["recruiter"]}>
      <ModernRecruiterLayout>
        <JobDetailsContent />
      </ModernRecruiterLayout>
    </TenantProtectedRoute>
  );
}
