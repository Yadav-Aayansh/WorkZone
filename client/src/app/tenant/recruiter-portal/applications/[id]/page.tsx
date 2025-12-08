// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/* eslint-disable */

"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { TenantProtectedRoute } from "@/components/tenant/TenantProtectedRoute";
import { ModernRecruiterLayout } from "@/components/common/layout/ModernRecruiterLayout";
import {
  tenantApplicationAPI,
  tenantJobAPI,
  ApplicationResponse,
  ApplicationStatus,
  JobResponse,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Separator } from "@/components/ui/separator";
import ReactMarkdown from "react-markdown";
import {
  ArrowLeft,
  FileText,
  Download,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  Mail,
  MapPin,
  Building2,
  Briefcase,
  Loader2,
  AlertCircle,
  TrendingUp,
  User,
  FileCheck,
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
      color: string;
    }
  > = {
    [ApplicationStatus.PENDING]: {
      variant: "outline" as const,
      icon: Clock,
      label: "Pending Review",
      color:
        "bg-yellow-100 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700",
    },
    [ApplicationStatus.SHORTLISTED]: {
      variant: "default" as const,
      icon: CheckCircle2,
      label: "Shortlisted",
      color:
        "bg-blue-100 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700",
    },
    [ApplicationStatus.AI_INTERVIEW_COMPLETED]: {
      variant: "secondary" as const,
      icon: CheckCircle2,
      label: "AI Interview Completed",
      color:
        "bg-purple-100 dark:bg-purple-900/20 border-purple-300 dark:border-purple-700",
    },
    [ApplicationStatus.HUMAN_INTERVIEW_SCHEDULED]: {
      variant: "default" as const,
      icon: Calendar,
      label: "Interview Scheduled",
      color:
        "bg-indigo-100 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700",
    },
    [ApplicationStatus.HUMAN_INTERVIEW_COMPLETED]: {
      variant: "default" as const,
      icon: CheckCircle2,
      label: "Interview Completed",
      color:
        "bg-teal-100 dark:bg-teal-900/20 border-teal-300 dark:border-teal-700",
    },
    [ApplicationStatus.OFFERED]: {
      variant: "default" as const,
      icon: TrendingUp,
      label: "Offer Extended",
      color:
        "bg-green-100 dark:bg-green-900/20 border-green-300 dark:border-green-700",
    },
    [ApplicationStatus.REJECTED]: {
      variant: "destructive" as const,
      icon: XCircle,
      label: "Rejected",
      color: "bg-red-100 dark:bg-red-900/20 border-red-300 dark:border-red-700",
    },
    [ApplicationStatus.HIRED]: {
      variant: "default" as const,
      icon: CheckCircle2,
      label: "Hired",
      color:
        "bg-emerald-100 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700",
    },
    [ApplicationStatus.WITHDRAWN]: {
      variant: "outline" as const,
      icon: AlertCircle,
      label: "Withdrawn",
      color:
        "bg-gray-100 dark:bg-gray-900/20 border-gray-300 dark:border-gray-700",
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

function ApplicationDetailContent() {
  const router = useRouter();
  const params = useParams();
  const applicationId = params.id as string;

  const [application, setApplication] = useState<ApplicationWithJob | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [newStatus, setNewStatus] = useState<ApplicationStatus | "">("");

  useEffect(() => {
    if (applicationId) {
      loadApplication();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId]);

  const loadApplication = async () => {
    setIsLoading(true);
    try {
      const appData = await tenantApplicationAPI.getApplication(applicationId);

      // Load job details
      try {
        const jobData = await tenantJobAPI.getJob(appData.job_id);
        setApplication({ ...appData, job: jobData });
      } catch {
        setApplication(appData);
      }
    } catch (err) {
      console.error("Failed to load application:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to load application"
      );
      router.push("/tenant/recruiter-portal/applications");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (status: ApplicationStatus) => {
    if (status === ApplicationStatus.REJECTED) {
      setShowRejectDialog(true);
      setNewStatus(status);
      return;
    }

    setNewStatus(status);
    await updateStatus();
  };

  const updateStatus = async () => {
    setIsUpdating(true);
    try {
      // Note: Backend doesn't have status update endpoint yet
      // This is a placeholder for when it's implemented
      toast.info("Status update feature coming soon!");
      setNewStatus("");
      setShowRejectDialog(false);
    } catch (err) {
      console.error("Failed to update status:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to update status"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDownloadResume = () => {
    if (application?.resume) {
      window.open(application.resume, "_blank");
      toast.success("Opening resume...");
    }
  };

  const handleScheduleInterview = () => {
    toast.info("Interview scheduling feature coming soon!");
  };

  const handleSendEmail = () => {
    toast.info("Email feature coming soon!");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">
            Loading application details...
          </p>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="text-lg font-semibold">Application not found</h3>
          <Button
            onClick={() => router.push("/tenant/recruiter-portal/applications")}
          >
            Back to Applications
          </Button>
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
            onClick={() => router.push("/tenant/recruiter-portal/applications")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Application Details
            </h1>
            <p className="text-muted-foreground mt-1">
              Review and manage this application
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleSendEmail}>
            <Mail className="h-4 w-4 mr-2" />
            Send Email
          </Button>
          <Button onClick={handleScheduleInterview}>
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Interview
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column - Applicant Info */}
        <div className="md:col-span-2 space-y-6">
          {/* Applicant Card */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-2xl">
                      {application.user_id.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>
                      Applicant #{application.user_id.substring(0, 8)}
                    </CardTitle>
                    <CardDescription>
                      User ID: {application.user_id}
                    </CardDescription>
                    <div className="mt-2">
                      {getStatusBadge(application.status)}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Application ID
                    </p>
                    <p className="font-medium">
                      {application.id.substring(0, 12)}...
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Applied On</p>
                    <p className="font-medium">
                      {format(
                        new Date(application.applied_on),
                        "MMM dd, yyyy 'at' hh:mm a"
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Position Applied For
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {application.job ? (
                <>
                  <div>
                    <h3 className="text-2xl font-bold">
                      {application.job.title}
                    </h3>
                    <p className="text-muted-foreground mt-1">
                      {application.job.department} • {application.job.job_type}
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Location
                        </p>
                        <p className="font-medium">
                          {application.job.location}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Experience
                        </p>
                        <p className="font-medium">
                          {application.job.experience_required}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold mb-2">Job Description</h4>
                    <div className="text-sm text-muted-foreground [&>h1]:text-xl [&>h1]:font-bold [&>h1]:mt-4 [&>h1]:mb-2 [&>h2]:text-lg [&>h2]:font-semibold [&>h2]:mt-3 [&>h2]:mb-1.5 [&>h3]:text-base [&>h3]:font-medium [&>h3]:mt-2 [&>h3]:mb-1 [&>p]:my-2 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:my-2 [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:my-2 [&>li]:my-0.5 [&>*]:text-muted-foreground">
                      <ReactMarkdown>
                        {application.job.description}
                      </ReactMarkdown>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Required Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {application.job.skills_required &&
                      application.job.skills_required.length > 0 ? (
                        application.job.skills_required.map(
                          (skill: string, index: number) => (
                            <Badge key={index} variant="secondary">
                              {skill}
                            </Badge>
                          )
                        )
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No skills specified
                        </p>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground">
                  Job details not available
                </p>
              )}
            </CardContent>
          </Card>

          {/* Resume Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Resume
              </CardTitle>
              <CardDescription>
                Applicant&apos;s submitted resume and documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              {application.resume ? (
                <div className="border rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <FileCheck className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Resume Document</p>
                      <p className="text-sm text-muted-foreground">
                        Click to view or download
                      </p>
                    </div>
                  </div>
                  <Button onClick={handleDownloadResume}>
                    <Download className="h-4 w-4 mr-2" />
                    View Resume
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No resume submitted</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Status Management */}
        <div className="space-y-6">
          {/* Status Update Card */}
          <Card>
            <CardHeader>
              <CardTitle>Update Status</CardTitle>
              <CardDescription>Change the application status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Current Status
                </label>
                {getStatusBadge(application.status)}
              </div>

              <Separator />

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Change To
                </label>
                <Select
                  value={newStatus}
                  onValueChange={(value) =>
                    handleStatusChange(value as ApplicationStatus)
                  }
                  disabled={isUpdating}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select new status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ApplicationStatus.PENDING}>
                      Pending Review
                    </SelectItem>
                    <SelectItem value={ApplicationStatus.SHORTLISTED}>
                      Shortlist
                    </SelectItem>
                    <SelectItem
                      value={ApplicationStatus.AI_INTERVIEW_COMPLETED}
                    >
                      AI Interview Done
                    </SelectItem>
                    <SelectItem
                      value={ApplicationStatus.HUMAN_INTERVIEW_SCHEDULED}
                    >
                      Schedule Interview
                    </SelectItem>
                    <SelectItem
                      value={ApplicationStatus.HUMAN_INTERVIEW_COMPLETED}
                    >
                      Interview Completed
                    </SelectItem>
                    <SelectItem value={ApplicationStatus.OFFERED}>
                      Send Offer
                    </SelectItem>
                    <SelectItem value={ApplicationStatus.HIRED}>
                      Mark as Hired
                    </SelectItem>
                    <SelectItem value={ApplicationStatus.REJECTED}>
                      Reject
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleDownloadResume}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Resume
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleScheduleInterview}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Interview
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleSendEmail}
              >
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-destructive"
                onClick={() => {
                  setNewStatus(ApplicationStatus.REJECTED);
                  setShowRejectDialog(true);
                }}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject Application
              </Button>
            </CardContent>
          </Card>

          {/* Timeline Card */}
          <Card>
            <CardHeader>
              <CardTitle>Application Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="mt-1">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Application Submitted</p>
                    <p className="text-sm text-muted-foreground">
                      {format(
                        new Date(application.applied_on),
                        "MMM dd, yyyy 'at' hh:mm a"
                      )}
                    </p>
                  </div>
                </div>

                {application.status !== ApplicationStatus.PENDING && (
                  <div className="flex gap-3">
                    <div className="mt-1">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Status Updated</p>
                      <p className="text-sm text-muted-foreground">
                        Current: {getStatusBadge(application.status)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reject Confirmation Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Application?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject this application? This action
              cannot be undone. The candidate will be notified about the
              decision.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => updateStatus()}
              disabled={isUpdating}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Rejecting...
                </>
              ) : (
                "Reject Application"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function ApplicationDetailPage() {
  return (
    <TenantProtectedRoute requiredRole="RECRUITER">
      <ModernRecruiterLayout>
        <ApplicationDetailContent />
      </ModernRecruiterLayout>
    </TenantProtectedRoute>
  );
}
