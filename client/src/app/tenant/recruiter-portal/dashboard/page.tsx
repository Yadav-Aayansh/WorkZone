// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/* eslint-disable */

"use client";

import { useState, useEffect } from "react";
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
import {
  Briefcase,
  Users,
  Eye,
  Clock,
  Loader2,
  UserCheck,
  Calendar,
} from "lucide-react";
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
import { KPICard } from "@/components/dashboard/shared/KPICard";
import { ScheduleCard } from "@/components/dashboard/shared/ScheduleCard";
import { RecentApplicants } from "@/components/dashboard/recruiter/RecentApplicants";

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
  const shortlistedApplications = applications.filter(
    (app) => app.status === ApplicationStatus.SHORTLISTED
  ).length;
  const interviewScheduled = applications.filter(
    (app) =>
      app.status === ApplicationStatus.HUMAN_INTERVIEW_SCHEDULED ||
      app.status === ApplicationStatus.AI_INTERVIEW_COMPLETED
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

  // Generate chart data from applications this week
  const chartData = applicationsThisWeek.map((item) => item.applications);

  // Get recent applicants (last 5)
  const recentApplicants = applications.slice(0, 5);

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
    <div className="space-y-6">
      {/* Header - Clean and Simple */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of your recruitment metrics
        </p>
      </div>

      {/* Main Grid Layout */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Left Side */}
        <div className="space-y-6">
          {/* KPI Cards Row */}
          <div className="grid gap-4 md:grid-cols-3">
            <KPICard
              title="Total Applicants"
              value={totalApplications.toLocaleString()}
              trend={{
                value: 10,
                direction: "up",
                label: "vs last week",
              }}
              icon={<Users className="h-5 w-5" />}
              chartData={chartData}
              variant="purple"
            />

            <KPICard
              title="Active Jobs"
              value={activeJobs}
              trend={{
                value: 30,
                direction: "up",
                label: "vs last week",
              }}
              icon={<Briefcase className="h-5 w-5" />}
              chartData={chartData}
              variant="blue"
            />

            <KPICard
              title="Shortlisted"
              value={shortlistedApplications}
              trend={{
                value: 5,
                direction: "up",
                label: "vs last week",
              }}
              icon={<UserCheck className="h-5 w-5" />}
              chartData={chartData}
              variant="green"
            />
          </div>

          {/* Application Tracker */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Application Tracker
              </CardTitle>
              <CardDescription>
                Notes applied by candidates in your company
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-6">
                {/* On-Site */}
                <div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-2">
                      On-Site
                    </div>
                    <div className="text-3xl font-bold">
                      {Math.floor(totalApplications * 0.15)}
                    </div>
                    <div className="mt-4 flex items-end gap-1 h-24">
                      {chartData.map((value, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-gray-200 rounded-sm"
                          style={{
                            height: `${
                              ((value + 1) / Math.max(...chartData, 1)) * 100
                            }%`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Hybrid */}
                <div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-2">
                      Hybrid
                    </div>
                    <div className="text-3xl font-bold">
                      {Math.floor(totalApplications * 0.3)}
                    </div>
                    <div className="mt-4 flex items-end gap-1 h-24">
                      {chartData.map((value, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-gray-200 rounded-sm"
                          style={{
                            height: `${
                              ((value + 1) / Math.max(...chartData, 1)) * 100
                            }%`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Remote */}
                <div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-2">
                      Remote
                    </div>
                    <div className="text-3xl font-bold">
                      {Math.floor(totalApplications * 0.55)}
                    </div>
                    <div className="mt-4 flex items-end gap-1 h-24">
                      {chartData.map((value, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-gray-200 rounded-sm"
                          style={{
                            height: `${
                              ((value + 1) / Math.max(...chartData, 1)) * 100
                            }%`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side - Schedule */}
        <div>
          <ScheduleCard
            items={recentApplicants.slice(0, 3).map((app, idx) => ({
              id: app.id,
              title: `Interview with Candidate`,
              description: `Discussion for ${app.job?.title || "position"}`,
              startTime: "09:00",
              endTime: "09:30",
              date: app.applied_on,
              participants: [
                {
                  name: `Applicant ${app.user_id.substring(0, 4)}`,
                },
              ],
              status: "pending" as const,
              type: "interview" as const,
            }))}
            loading={isLoading}
          />
        </div>
      </div>

      {/* Recent Applicants Table */}
      <RecentApplicants
        applicants={recentApplicants.map((app) => ({
          id: app.id,
          name: `Applicant #${app.user_id.substring(0, 8)}`,
          role: app.job?.title || "Unknown Position",
          level: app.job?.job_type,
          appliedDate: app.applied_on,
          status: formatStatusLabel(app.status),
        }))}
        onViewDetails={(id) =>
          router.push(`/tenant/recruiter-portal/applications/${id}`)
        }
        loading={isLoading}
      />
    </div>
  );
}

export default function RecruiterDashboard() {
  return (
    <TenantProtectedRoute allowedRoles={["recruiter"]}>
      <ModernRecruiterLayout>
        <DashboardContent />
      </ModernRecruiterLayout>
    </TenantProtectedRoute>
  );
}
