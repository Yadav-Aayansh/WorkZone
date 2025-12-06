"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { TenantProtectedRoute } from "@/components/tenant/TenantProtectedRoute";
import { tenantJobAPI, type JobResponse } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

function EditJobContent() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [job, setJob] = useState<JobResponse | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    department: "",
    location: "",
    description: "",
    is_open: true,
  });

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
      setFormData({
        title: response.title,
        department: response.department,
        location: response.location,
        description: response.description,
        is_open: response.is_open,
      });
    } catch (err: unknown) {
      console.error("Failed to load job:", err);
      const errorMessage = err instanceof Error ? err.message : "Job not found";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError(null);
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      is_open: checked,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setError("Job title is required");
      return false;
    }
    if (formData.title.length > 50) {
      setError("Job title must be 50 characters or less");
      return false;
    }
    if (!formData.department.trim()) {
      setError("Department is required");
      return false;
    }
    if (formData.department.length > 50) {
      setError("Department must be 50 characters or less");
      return false;
    }
    if (!formData.location.trim()) {
      setError("Location is required");
      return false;
    }
    if (formData.location.length > 25) {
      setError("Location must be 25 characters or less");
      return false;
    }
    if (!formData.description.trim()) {
      setError("Job description is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await tenantJobAPI.updateJob(jobId, {
        title: formData.title.trim(),
        department: formData.department.trim(),
        location: formData.location.trim(),
        description: formData.description.trim(),
        is_open: formData.is_open,
      });

      toast.success("Job updated successfully!");
      router.push("/recruiter-portal/jobs");
    } catch (err: unknown) {
      console.error("Failed to update job:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to update job. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error && !job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/recruiter-portal/jobs")}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Jobs
          </Button>
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          onClick={() => router.push("/recruiter-portal/jobs")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Jobs
        </Button>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-3xl">Edit Job Posting</CardTitle>
            <CardDescription>Update the job details below</CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Job Status Switch */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="space-y-0.5">
                  <Label htmlFor="is_open" className="text-base">
                    Job Status
                  </Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formData.is_open
                      ? "This job is currently accepting applications"
                      : "This job is closed for applications"}
                  </p>
                </div>
                <Switch
                  id="is_open"
                  checked={formData.is_open}
                  onCheckedChange={handleSwitchChange}
                  disabled={isSubmitting}
                />
              </div>

              {/* Job Title */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  Job Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g., Senior Software Engineer"
                  value={formData.title}
                  onChange={handleChange}
                  maxLength={50}
                  required
                  disabled={isSubmitting}
                />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formData.title.length}/50 characters
                </p>
              </div>

              {/* Department */}
              <div className="space-y-2">
                <Label htmlFor="department">
                  Department <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="department"
                  name="department"
                  placeholder="e.g., Engineering, Marketing, Sales"
                  value={formData.department}
                  onChange={handleChange}
                  maxLength={50}
                  required
                  disabled={isSubmitting}
                />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formData.department.length}/50 characters
                </p>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">
                  Location <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="location"
                  name="location"
                  placeholder="e.g., Remote, Bangalore, New York"
                  value={formData.location}
                  onChange={handleChange}
                  maxLength={25}
                  required
                  disabled={isSubmitting}
                />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formData.location.length}/25 characters
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">
                  Job Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe the role, responsibilities, requirements, and what makes this position exciting..."
                  value={formData.description}
                  onChange={handleChange}
                  rows={12}
                  required
                  disabled={isSubmitting}
                  className="resize-none"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Provide a detailed description of the role
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/recruiter-portal/jobs")}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating Job...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Update Job Posting
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default function EditJobPage() {
  return (
    <TenantProtectedRoute allowedRoles={["recruiter"]}>
      <EditJobContent />
    </TenantProtectedRoute>
  );
}
