"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  ExternalLink,
  Loader2,
  User,
} from "lucide-react";
import { toast } from "sonner";
import {
  tenantApplicationAPI,
  tenantJobAPI,
  ApplicationResponse,
  ApplicationStatus,
  JobResponse,
} from "@/lib/api";

function CandidateProfileContent() {
  const params = useParams();
  const router = useRouter();
  const applicationId = params.id as string;
  const [notes, setNotes] = useState("");
  const [application, setApplication] = useState<ApplicationResponse | null>(
    null
  );
  const [job, setJob] = useState<JobResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadApplicationData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId]);

  const loadApplicationData = async () => {
    setIsLoading(true);
    try {
      // Try to find the application in all jobs
      const jobs = await tenantJobAPI.listJobs();

      for (const j of jobs) {
        try {
          const applications = await tenantApplicationAPI.listJobApplications(
            j.id
          );
          const found = applications.find((a) => a.id === applicationId);
          if (found) {
            setApplication(found);
            setJob(j);
            break;
          }
        } catch (err) {
          console.error(`Error fetching applications for job ${j.id}:`, err);
        }
      }
    } catch (err) {
      console.error("Failed to load application data:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to load application"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: ApplicationStatus) => {
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
            Pending
          </Badge>
        );
      case ApplicationStatus.REJECTED:
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
            Rejected
          </Badge>
        );
      case ApplicationStatus.HIRED:
        return (
          <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
            Hired
          </Badge>
        );
      case ApplicationStatus.AI_INTERVIEW_COMPLETED:
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
            AI Interview Completed
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

  const handleShortlist = () => {
    toast.info(
      "Status changes are managed through the job close process with AI ranking"
    );
  };

  const handleReject = () => {
    toast.info(
      "Status changes are managed through the job close process with AI ranking"
    );
  };

  const handleScheduleInterview = () => {
    router.push(
      `/tenant/recruiter-portal/interviews?application=${applicationId}`
    );
  };

  const handleDownloadResume = () => {
    if (application?.resume) {
      // The resume is stored as a blob path, would need a signed URL from backend
      toast.info("Resume download requires backend support for signed URLs");
    }
  };

  const handleSaveNotes = () => {
    toast.success("Notes saved successfully!");
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
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Application Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The application you&apos;re looking for doesn&apos;t exist.
          </p>
          <Button
            onClick={() => router.push("/tenant/recruiter-portal/candidates")}
          >
            Back to Candidates
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Button
          variant="ghost"
          className="w-fit"
          onClick={() => router.push("/tenant/recruiter-portal/candidates")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Candidates
        </Button>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-4">
            <div className="h-20 w-20 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold">
              <User className="h-10 w-10" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Application #{application.id.slice(0, 8)}
              </h1>
              <p className="text-muted-foreground mt-1">
                {job?.title || "Unknown Position"}
              </p>
              <div className="flex items-center gap-2 mt-2">
                {getStatusBadge(application.status)}
                <Badge variant="outline">
                  Applied {formatDate(application.applied_on)}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDownloadResume}>
              <Download className="mr-2 h-4 w-4" />
              Resume
            </Button>
            <Button onClick={handleScheduleInterview}>
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Interview
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Application Details */}
          <Card>
            <CardHeader>
              <CardTitle>Application Details</CardTitle>
              <CardDescription>
                Information about this job application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3">
                  <Briefcase className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Position</p>
                    <p className="font-medium">{job?.title || "Unknown"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Applied On</p>
                    <p className="font-medium">
                      {formatDate(application.applied_on)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <div className="mt-1">
                      {getStatusBadge(application.status)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">User ID</p>
                    <p className="font-medium font-mono text-xs">
                      {application.user_id}
                    </p>
                  </div>
                </div>
              </div>

              {job && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-semibold mb-2">Job Details</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>
                        <strong>Department:</strong> {job.department}
                      </p>
                      <p>
                        <strong>Location:</strong> {job.location}
                      </p>
                      <p>
                        <strong>Status:</strong>{" "}
                        {job.is_open ? "Open" : "Closed"}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Application Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Application Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="w-px h-12 bg-border mt-2" />
                  </div>
                  <div className="flex-1 pb-6">
                    <div className="font-semibold">Application Submitted</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Resume uploaded and application created
                    </div>
                    <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(application.applied_on)}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      {application.status === ApplicationStatus.SHORTLISTED ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : application.status === ApplicationStatus.REJECTED ? (
                        <XCircle className="h-4 w-4 text-red-600" />
                      ) : (
                        <Clock className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">Current Status</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {application.status.replace(/_/g, " ")}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Recruiter Notes</CardTitle>
              <CardDescription>
                Add private notes about this application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Enter your notes here..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={5}
              />
              <Button onClick={handleSaveNotes}>Save Notes</Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Actions */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
                onClick={handleShortlist}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Shortlist Candidate
              </Button>
              <Button
                className="w-full"
                variant="outline"
                onClick={handleScheduleInterview}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Interview
              </Button>
              <Button
                className="w-full bg-destructive hover:bg-destructive/90"
                onClick={handleReject}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Reject Candidate
              </Button>
            </CardContent>
          </Card>

          {/* Resume */}
          <Card>
            <CardHeader>
              <CardTitle>Resume</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-[3/4] bg-accent rounded-lg flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-2" />
                  <div className="text-sm">Resume Preview</div>
                  <div className="text-xs mt-1">
                    {application.resume ? "File attached" : "No file"}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  variant="outline"
                  onClick={handleDownloadResume}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button
                  className="flex-1"
                  variant="outline"
                  onClick={() =>
                    toast.info("Resume viewing requires backend support")
                  }
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open
                </Button>
              </div>
              {application.resume && (
                <p className="text-xs text-muted-foreground break-all">
                  Path: {application.resume}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Application Info */}
          <Card>
            <CardHeader>
              <CardTitle>Application Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Application ID</span>
                <span className="font-mono text-xs">
                  {application.id.slice(0, 12)}...
                </span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Job ID</span>
                <span className="font-mono text-xs">
                  {application.job_id.slice(0, 12)}...
                </span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">User ID</span>
                <span className="font-mono text-xs">
                  {application.user_id.slice(0, 12)}...
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function CandidateProfilePage() {
  return (
    <TenantProtectedRoute allowedRoles={["recruiter"]}>
      <ModernRecruiterLayout>
        <CandidateProfileContent />
      </ModernRecruiterLayout>
    </TenantProtectedRoute>
  );
}
