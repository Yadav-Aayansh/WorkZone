// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/* eslint-disable */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TenantProtectedRoute } from "@/components/tenant/TenantProtectedRoute";
import {
  tenantApplicationAPI,
  tenantJobAPI,
  tenantApplicantAPI,
  tenantAIInterviewAPI,
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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Briefcase,
  MapPin,
  Building2,
  Calendar,
  Loader2,
  MoreVertical,
  Eye,
  Trash2,
  FileText,
  AlertCircle,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import { useTenant } from "@/providers/tenant-provider";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ApplicationWithJob extends ApplicationResponse {
  job?: JobResponse;
}

function ApplicantApplicationsContent() {
  const router = useRouter();
  const { tenant } = useTenant();
  const [applications, setApplications] = useState<ApplicationWithJob[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<
    ApplicationWithJob[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadApplications();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [applications, searchQuery]);

  const loadApplications = async () => {
    setIsLoading(true);
    try {
      // Get all applications for the current user
      const myApps = await tenantApplicationAPI.myApplications();

      // Get job details for each application
      const applicationsWithJobs: ApplicationWithJob[] = await Promise.all(
        myApps.map(async (app) => {
          try {
            const job = await tenantJobAPI.getJob(app.job_id);
            return { ...app, job };
          } catch (error) {
            console.error(`Failed to load job ${app.job_id}:`, error);
            return app; // Return without job if fetch fails
          }
        })
      );

      setApplications(applicationsWithJobs);
    } catch (err: any) {
      console.error("Failed to load applications:", err);
      toast.error(err.message || "Failed to load applications");
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...applications];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (app) =>
          app.job?.title.toLowerCase().includes(query) ||
          app.job?.department.toLowerCase().includes(query) ||
          app.job?.location.toLowerCase().includes(query)
      );
    }

    setFilteredApplications(filtered);
  };

  const handleWithdrawApplication = async (applicationId: string) => {
    if (
      !confirm(
        "Are you sure you want to withdraw this application? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await tenantApplicationAPI.withdrawApplication(applicationId);
      toast.success("Application withdrawn successfully");
      loadApplications(); // Reload
    } catch (err: any) {
      console.error("Failed to withdraw application:", err);
      toast.error(err.message || "Failed to withdraw application");
    }
  };

  const handleStartInterview = (applicationId: string) => {
    // Navigate to setup page with application ID
    router.push(
      `/tenant/applicant-portal/interview/setup?application_id=${applicationId}`
    );
  };

  const canStartInterview = (status: ApplicationStatus) => {
    // Allow starting interview only for SHORTLISTED applications (not PENDING)
    return status === ApplicationStatus.SHORTLISTED;
  };

  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.PENDING:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case ApplicationStatus.SHORTLISTED:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case ApplicationStatus.AI_INTERVIEW_COMPLETED:
      case ApplicationStatus.HUMAN_INTERVIEW_SCHEDULED:
      case ApplicationStatus.HUMAN_INTERVIEW_COMPLETED:
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case ApplicationStatus.OFFERED:
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case ApplicationStatus.HIRED:
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200";
      case ApplicationStatus.REJECTED:
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case ApplicationStatus.WITHDRAWN:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatStatus = (status: ApplicationStatus) => {
    // Display status in uppercase with spaces
    return status.split("_").join(" ");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {tenant?.logo && (
                <img
                  src={tenant.logo}
                  alt={tenant.brandName}
                  className="h-10 object-contain"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  My Applications
                </h1>
                <p className="text-sm text-muted-foreground">
                  Track your job applications at {tenant?.brandName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/tenant/careers")}
              >
                <Briefcase className="w-4 h-4 mr-2" />
                Browse Jobs
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <Card className="mb-6 shadow-lg">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                placeholder="Search applications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">
              Loading your applications...
            </span>
          </div>
        )}

        {/* Applications List */}
        {!isLoading && filteredApplications.length === 0 ? (
          <Card className="shadow-lg">
            <CardContent className="py-12 text-center">
              <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                No Applications Yet
              </h3>
              <p className="text-muted-foreground mb-6">
                Start browsing open positions and submit your first application
              </p>
              <Button onClick={() => router.push("/tenant/careers")}>
                <Briefcase className="w-4 h-4 mr-2" />
                Browse Open Positions
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredApplications.map((app) => (
              <Card key={app.id} className="hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-bold">
                          {app.job?.title || "Unknown Position"}
                        </h3>
                        <Badge className={getStatusColor(app.status)}>
                          {formatStatus(app.status)}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-1">
                          <Building2 className="w-4 h-4" />
                          <span>{app.job?.department || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{app.job?.location || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            Applied{" "}
                            {new Date(app.applied_on).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground">
                        Application ID: {app.id}
                      </p>

                      {/* AI Interview Button */}
                      {canStartInterview(app.status) && (
                        <div className="mt-4">
                          <Button
                            onClick={() => handleStartInterview(app.id)}
                            className="gap-2"
                            size="sm"
                          >
                            <Video className="w-4 h-4" />
                            Start AI Interview
                          </Button>
                        </div>
                      )}
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(`/tenant/careers/${app.job_id}`)
                          }
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Job
                        </DropdownMenuItem>
                        {app.status === ApplicationStatus.PENDING && (
                          <DropdownMenuItem
                            onClick={() => handleWithdrawApplication(app.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Withdraw Application
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function ApplicantApplicationsPage() {
  return (
    <TenantProtectedRoute allowedRoles={["applicant", "employee"]}>
      <ApplicantApplicationsContent />
    </TenantProtectedRoute>
  );
}
