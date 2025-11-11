"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTenant } from "@/providers/tenant-provider";
import { useTenantAuth } from "@/providers/tenant-auth-provider";
import { tenantJobAPI, JobResponse } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  Building2,
  Calendar,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function JobDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { tenant } = useTenant();
  const { isAuthenticated } = useTenantAuth();

  const [job, setJob] = useState<JobResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const jobId = params.id as string;

  useEffect(() => {
    if (jobId) {
      loadJob();
    }
  }, [jobId]);

  const loadJob = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await tenantJobAPI.getJob(jobId);
      setJob(response);
    } catch (err: any) {
      console.error("Failed to load job:", err);
      setError(err.message || "Failed to load job details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (!isAuthenticated) {
      // Redirect to signup/login with return URL
      router.push(`/signup?returnUrl=/careers/${jobId}`);
    } else {
      // TODO: Open application modal or redirect to application page
      alert("Application feature coming soon!");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Loading job details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Button
            variant="ghost"
            onClick={() => router.push("/careers")}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Careers
          </Button>

          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error || "Job not found"}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            {tenant?.logo && (
              <img
                src={tenant.logo}
                alt={tenant.brandName}
                className="h-10 object-contain"
              />
            )}
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {tenant?.brandName} Careers
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          onClick={() => router.push("/careers")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to All Jobs
        </Button>

        {/* Job Header Card */}
        <Card className="mb-8 shadow-xl">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <CardTitle className="text-3xl">{job.title}</CardTitle>
                  <Badge
                    variant={job.is_open ? "default" : "secondary"}
                    className="text-sm"
                  >
                    {job.is_open ? (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Open
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3 mr-1" />
                        Closed
                      </>
                    )}
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    <span>{job.department}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Posted {new Date(job.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {job.is_open && (
                <Button size="lg" onClick={handleApply} className="ml-4">
                  <Briefcase className="w-4 h-4 mr-2" />
                  Apply Now
                </Button>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Job Description */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle>About This Role</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                {job.description}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Job Details */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Department
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  {job.department}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Location
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  {job.location}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Posted Date
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  {new Date(job.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Last Updated
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  {new Date(job.updated_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Apply Section */}
        {job.is_open && (
          <Card className="shadow-xl border-primary/50">
            <CardHeader>
              <CardTitle>Ready to Apply?</CardTitle>
              <CardDescription>
                Join {tenant?.brandName} and be part of our team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-gray-600 dark:text-gray-400">
                  {isAuthenticated
                    ? "Click the button to start your application"
                    : "Sign up or log in to apply for this position"}
                </p>
                <Button size="lg" onClick={handleApply}>
                  <Briefcase className="w-4 h-4 mr-2" />
                  {isAuthenticated ? "Start Application" : "Sign Up to Apply"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {!job.is_open && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This position is currently closed and not accepting applications.
              Check back later or browse other open positions.
            </AlertDescription>
          </Alert>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p>© 2025 {tenant?.brandName}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
