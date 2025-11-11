"use client";

import { useState, useEffect } from "react";
import { TenantProtectedRoute } from "@/components/tenant/TenantProtectedRoute";
import { RecruiterPortalLayout } from "@/components/tenant/recruiter-portal-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  Users,
  Calendar,
  TrendingUp,
  Plus,
  Eye,
  Clock,
  Loader2,
  CheckCircle2,
  Gift,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  tenantJobAPI,
  tenantApplicationAPI,
  ApplicationResponse,
  ApplicationStatus,
  JobResponse,
} from "@/lib/api";
import { toast } from "sonner";
import { startOfWeek, addDays, isSameDay } from "date-fns";

interface ApplicationWithJob extends ApplicationResponse {
  job?: JobResponse;
}

function DashboardContent() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [jobs, setJobs] = useState<JobResponse[]>([]);
  const [applications, setApplications] = useState<ApplicationWithJob[]>([]);

  useEffect(() => {
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadDashboardData = async () => {
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

      // Sort by date (newest first)
      allApplications.sort(
        (a, b) =>
          new Date(b.applied_on).getTime() - new Date(a.applied_on).getTime()
      );

      setApplications(allApplications);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to load dashboard data"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate KPIs from real data
  const activeJobs = jobs.filter((job) => job.is_active).length;
  const totalApplications = applications.length;
  const pendingApplications = applications.filter(
    (app) => app.status === ApplicationStatus.PENDING
  ).length;
  const shortlistedApplications = applications.filter(
    (app) => app.status === ApplicationStatus.SHORTLISTED
  ).length;
  const interviewScheduled = applications.filter(
    (app) =>
      app.status === ApplicationStatus.HUMAN_INTERVIEW_SCHEDULED ||
      app.status === ApplicationStatus.AI_INTERVIEW_COMPLETED
  ).length;
  const offersExtended = applications.filter(
    (app) => app.status === ApplicationStatus.OFFERED
  ).length;
  const hired = applications.filter(
    (app) => app.status === ApplicationStatus.HIRED
  ).length;

  // Calculate this week's applications data
  const startOfThisWeek = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const applicationsThisWeek = weekDays.map((day, index) => {
    const date = addDays(startOfThisWeek, index);
    const count = applications.filter((app) =>
      isSameDay(new Date(app.applied_on), date)
    ).length;
    return { day, applications: count };
  });

  // Get recent applicants (last 5)
  const recentApplicants = applications.slice(0, 5);

  const kpiCards = [
    {
      title: "Active Jobs",
      value: activeJobs,
      icon: Briefcase,
      description: "Currently open positions",
      trend: `${jobs.length} total jobs`,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
    },
    {
      title: "Total Applications",
      value: totalApplications,
      icon: Users,
      description: "All applications received",
      trend: `${pendingApplications} pending review`,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/20",
    },
    {
      title: "Shortlisted",
      value: shortlistedApplications,
      icon: CheckCircle2,
      description: "Ready for interview",
      trend: `${interviewScheduled} interviews scheduled`,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
    },
    {
      title: "Offers & Hired",
      value: offersExtended + hired,
      icon: Gift,
      description: "Offers extended",
      trend: `${hired} successfully hired`,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
    },
  ];

  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.SHORTLISTED:
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case ApplicationStatus.PENDING:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case ApplicationStatus.REJECTED:
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case ApplicationStatus.HIRED:
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";
      case ApplicationStatus.OFFERED:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const formatStatusLabel = (status: ApplicationStatus) => {
    return status
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return "Yesterday";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here&apos;s your recruitment overview.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => router.push("/tenant/recruiter-portal/interviews")}
          >
            <Calendar className="mr-2 h-4 w-4" />
            Schedule Interview
          </Button>
          <Button
            onClick={() => router.push("/tenant/recruiter-portal/jobs/create")}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Job
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.title} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {kpi.title}
                </CardTitle>
                <div className={`rounded-full p-2 ${kpi.bgColor}`}>
                  <Icon className={`h-4 w-4 ${kpi.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{kpi.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {kpi.description}
                </p>
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {kpi.trend}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Chart Section */}
      <Card>
        <CardHeader>
          <CardTitle>Applications This Week</CardTitle>
          <CardDescription>
            Daily application trends for the current week
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={applicationsThisWeek}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="day"
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
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Bar
                dataKey="applications"
                fill="hsl(var(--primary))"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Applicants Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Applicants</CardTitle>
              <CardDescription>
                Latest applications across all job postings
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                router.push("/tenant/recruiter-portal/applications")
              }
            >
              View All
              <Eye className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentApplicants.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No applications yet</p>
              <p className="text-sm mt-2">
                Applications will appear here when candidates apply
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentApplicants.map((applicant) => (
                <div
                  key={applicant.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() =>
                    router.push(
                      `/tenant/recruiter-portal/applications/${applicant.id}`
                    )
                  }
                >
                  <div className="flex items-center gap-4 flex-1">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {applicant.user_id.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-semibold">
                        Applicant #{applicant.user_id.substring(0, 8)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {applicant.job?.title || "Unknown Position"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <Badge
                      variant="outline"
                      className={getStatusColor(applicant.status)}
                    >
                      {formatStatusLabel(applicant.status)}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground min-w-[80px] justify-end">
                      <Clock className="h-3 w-3" />
                      {formatDate(applicant.applied_on)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function RecruiterDashboard() {
  return (
    <TenantProtectedRoute allowedRoles={["recruiter"]}>
      <RecruiterPortalLayout>
        <DashboardContent />
      </RecruiterPortalLayout>
    </TenantProtectedRoute>
  );
}
