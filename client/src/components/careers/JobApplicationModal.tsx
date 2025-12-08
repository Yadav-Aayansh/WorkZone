// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/* eslint-disable */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { tenantApplicationAPI, JobResponse } from "@/lib/api";
import {
  Loader2,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

interface JobApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: JobResponse;
  isAuthenticated: boolean;
}

export function JobApplicationModal({
  isOpen,
  onClose,
  job,
  isAuthenticated,
}: JobApplicationModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resume, setResume] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      if (!allowedTypes.includes(file.type)) {
        setError("Please upload a PDF or Word document");
        setResume(null);
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        setResume(null);
        return;
      }

      setResume(file);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      router.push(`/tenant/login?returnUrl=/tenant/careers/${job.id}`);
      return;
    }

    if (!resume) {
      setError("Please upload your resume");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await tenantApplicationAPI.applyToJob(job.id, resume);
      setSuccess(true);
      toast.success("Application submitted successfully!");

      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
        // Optionally redirect to applications page
        router.push("/tenant/applicant-portal/applications");
      }, 2000);
    } catch (err: any) {
      console.error("Failed to submit application:", err);
      setError(err.message || "Failed to submit application");
      toast.error(err.message || "Failed to submit application");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting && !success) {
      setResume(null);
      setError(null);
      setSuccess(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Apply for {job.title}</DialogTitle>
          <DialogDescription>
            {job.department} • {job.location}
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              Application Submitted!
            </h3>
            <p className="text-muted-foreground">
              We&#39;ve received your application. You&#39;ll hear from us soon.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Resume Upload */}
            <div className="space-y-2">
              <Label htmlFor="resume" className="text-base font-semibold">
                Resume / CV <span className="text-red-500">*</span>
              </Label>
              <div className="flex items-center gap-4">
                <label
                  htmlFor="resume"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-8 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary hover:bg-accent/50 transition-colors"
                >
                  {resume ? (
                    <>
                      <FileText className="w-6 h-6 text-primary" />
                      <div className="text-left">
                        <p className="font-medium text-sm">{resume.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(resume.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-muted-foreground" />
                      <div className="text-center">
                        <p className="font-medium text-sm">
                          Click to upload resume
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PDF, DOC, DOCX (Max 5MB)
                        </p>
                      </div>
                    </>
                  )}
                </label>
                <Input
                  id="resume"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeChange}
                  className="hidden"
                  disabled={isSubmitting}
                />
              </div>
              {resume && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setResume(null)}
                  disabled={isSubmitting}
                >
                  Remove file
                </Button>
              )}
            </div>

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Job Closed Warning */}
            {!job.is_open && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This job posting is currently closed and not accepting
                  applications.
                </AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !resume || !job.is_open}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Application"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
