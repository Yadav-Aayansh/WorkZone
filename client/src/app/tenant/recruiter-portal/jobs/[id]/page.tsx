"use client";

import { useParams, useRouter } from "next/navigation";
import { TenantProtectedRoute } from "@/components/tenant/TenantProtectedRoute";
import { RecruiterPortalLayout } from "@/components/tenant/recruiter-portal-layout";
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
  TrendingUp,
  Eye,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import jobsData from "@/data/tenant/jobs.json";
import candidatesData from "@/data/tenant/candidates.json";
import analyticsData from "@/data/tenant/analytics.json";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

function JobDetailsContent() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  // Find job data
  const job = jobsData.find((j) => j.id === jobId);

  // Get candidates for this job
  const jobCandidates = candidatesData.filter((c) => c.jobId === jobId);

  // Get analytics for this job
  const jobAnalytics =
    analyticsData.jobAnalytics[
      jobId as keyof typeof analyticsData.jobAnalytics
    ];

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            Active
          </Badge>
        );
      case "closed":
        return (
          <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400">
            Closed
          </Badge>
        );
      case "draft":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
            Draft
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatSalary = (min: number, max: number) => {
    return `₹${(min / 100000).toFixed(1)}L - ₹${(max / 100000).toFixed(1)}L`;
  };

  const getCandidateStatusBadge = (status: string) => {
    switch (status) {
      case "shortlisted":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            Shortlisted
          </Badge>
        );
      case "under_review":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
            Under Review
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const handleCopyJobLink = () => {
    const jobLink = `${window.location.origin}/tenant/careers/${jobId}`;
    navigator.clipboard.writeText(jobLink);
    toast.success("Job link copied to clipboard!");
  };

  const handleCloseJob = () => {
    toast.success("Job closed successfully!");
  };

  const handleArchiveJob = () => {
    toast.success("Job archived successfully!");
  };

  // Pie chart data for status breakdown
  const statusPieData = jobAnalytics?.statusBreakdown || [];
  const COLORS = ["#fbbf24", "#10b981", "#ef4444"];

  // Source breakdown data
  const sourceData = jobAnalytics?.sourceBreakdown || [];

  // Applications over time data
  const applicationsData = jobAnalytics?.applicationsByDate || [];

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
              {getStatusBadge(job.status)}
            </div>
            <p className="text-muted-foreground mt-1">
              Posted on {formatDate(job.createdAt)} by {job.postedBy}
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
              <DropdownMenuItem onClick={handleCloseJob}>
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
            <div className="text-2xl font-bold">{job.applications}</div>
            <p className="text-xs text-muted-foreground">
              {jobAnalytics?.views || 0} views
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
              {job.shortlistedCount}
            </div>
            <p className="text-xs text-muted-foreground">
              {((job.shortlistedCount / job.applications) * 100).toFixed(1)}% of
              total
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
              {job.interviewsScheduled}
            </div>
            <p className="text-xs text-muted-foreground">
              {job.interviewsScheduled} candidates
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
              {job.rejectedCount}
            </div>
            <p className="text-xs text-muted-foreground">
              {((job.rejectedCount / job.applications) * 100).toFixed(1)}% of
              total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="applicants">
            Applicants ({jobCandidates.length})
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
                        {formatSalary(job.salary.min, job.salary.max)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Experience
                      </p>
                      <p className="font-medium">{job.experience}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Description */}
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {job.description}
                  </p>
                </div>

                <Separator />

                {/* Requirements */}
                <div>
                  <h4 className="font-semibold mb-2">Requirements</h4>
                  <ul className="space-y-1 text-sm list-disc list-inside text-muted-foreground">
                    {job.requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>

                <Separator />

                {/* Responsibilities */}
                <div>
                  <h4 className="font-semibold mb-2">Responsibilities</h4>
                  <ul className="space-y-1 text-sm list-disc list-inside text-muted-foreground">
                    {job.responsibilities.map((resp, index) => (
                      <li key={index}>{resp}</li>
                    ))}
                  </ul>
                </div>

                <Separator />

                {/* Skills */}
                <div>
                  <h4 className="font-semibold mb-2">Required Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
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
              {jobCandidates.length === 0 ? (
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
                      <TableHead className="text-center">AI Score</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobCandidates.map((candidate) => (
                      <TableRow
                        key={candidate.id}
                        className="cursor-pointer hover:bg-accent/50"
                        onClick={() =>
                          router.push(
                            `/tenant/recruiter-portal/candidates/${candidate.id}`
                          )
                        }
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {candidate.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-semibold">
                                {candidate.name}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {candidate.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatDate(candidate.appliedDate)}
                        </TableCell>
                        <TableCell className="text-center">
                          <span
                            className={`text-2xl font-bold ${getScoreColor(
                              candidate.aiScore
                            )}`}
                          >
                            {candidate.aiScore}
                          </span>
                        </TableCell>
                        <TableCell>
                          {getCandidateStatusBadge(candidate.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(
                                `/tenant/recruiter-portal/candidates/${candidate.id}`
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
                <CardDescription>Daily application trends</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={applicationsData}>
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
              </CardContent>
            </Card>

            {/* Application Status Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Application Status</CardTitle>
                <CardDescription>Current status distribution</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusPieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.status}: ${entry.count}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {statusPieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Source Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Application Sources</CardTitle>
                <CardDescription>
                  Where candidates found this job
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={sourceData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-muted"
                    />
                    <XAxis
                      dataKey="source"
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
                    <Bar
                      dataKey="count"
                      fill="hsl(var(--primary))"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Conversion Funnel */}
            <Card>
              <CardHeader>
                <CardTitle>Hiring Funnel</CardTitle>
                <CardDescription>
                  Candidate conversion at each stage
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    stage: "Applications",
                    count: job.applications,
                    color: "bg-blue-500",
                  },
                  {
                    stage: "Shortlisted",
                    count: job.shortlistedCount,
                    color: "bg-green-500",
                  },
                  {
                    stage: "Interviews",
                    count: job.interviewsScheduled,
                    color: "bg-purple-500",
                  },
                  {
                    stage: "Rejected",
                    count: job.rejectedCount,
                    color: "bg-red-500",
                  },
                ].map((item) => (
                  <div key={item.stage}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{item.stage}</span>
                      <span className="text-sm text-muted-foreground">
                        {item.count} (
                        {((item.count / job.applications) * 100).toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`${item.color} h-2 rounded-full transition-all`}
                        style={{
                          width: `${(item.count / job.applications) * 100}%`,
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
    </div>
  );
}

export default function JobDetailsPage() {
  return (
    <TenantProtectedRoute allowedRoles={["recruiter"]}>
      <RecruiterPortalLayout>
        <JobDetailsContent />
      </RecruiterPortalLayout>
    </TenantProtectedRoute>
  );
}
