"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TenantProtectedRoute } from "@/components/tenant/TenantProtectedRoute";
import { ModernRecruiterLayout } from "@/components/common/layout/ModernRecruiterLayout";
import { tenantJobAPI } from "@/lib/api";
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
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Loader2,
  Briefcase,
  MapPin,
  Building2,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function CreateJobContent() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    department: "",
    location: "",
    description: "",
  });

  const steps = [
    { number: 1, title: "Basic Info", icon: Briefcase },
    { number: 2, title: "Details", icon: FileText },
    { number: 3, title: "Review", icon: CheckCircle2 },
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError(null);
  };

  const validateStep = (step: number): boolean => {
    if (step === 1) {
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
    }
    if (step === 2) {
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
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setError(null);
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setError(null);
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(2)) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await tenantJobAPI.createJob({
        title: formData.title.trim(),
        department: formData.department.trim(),
        location: formData.location.trim(),
        description: formData.description.trim(),
      });

      toast.success("Job created successfully!");
      router.push("/tenant/recruiter-portal/jobs");
    } catch (err: unknown) {
      console.error("Failed to create job:", err);
      const message =
        err instanceof Error
          ? err.message
          : "Failed to create job. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModernRecruiterLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/tenant/recruiter-portal/jobs")}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create New Job</h1>
            <p className="text-muted-foreground mt-1">
              Fill in the details to create a job posting
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === step.number;
                const isCompleted = currentStep > step.number;

                return (
                  <div key={step.number} className="flex items-center flex-1">
                    <div className="flex flex-col items-center gap-2">
                      <div
                        className={cn(
                          "h-12 w-12 rounded-full flex items-center justify-center border-2 transition-all",
                          isActive &&
                            "border-primary bg-primary text-primary-foreground",
                          isCompleted &&
                            "border-primary bg-primary text-primary-foreground",
                          !isActive && !isCompleted && "border-muted bg-background"
                        )}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-6 w-6" />
                        ) : (
                          <Icon className="h-6 w-6" />
                        )}
                      </div>
                      <span
                        className={cn(
                          "text-sm font-medium",
                          isActive && "text-primary",
                          !isActive && "text-muted-foreground"
                        )}
                      >
                        {step.title}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={cn(
                          "h-0.5 flex-1 mx-4 transition-colors",
                          isCompleted ? "bg-primary" : "bg-muted"
                        )}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>
              {currentStep === 1 && "Basic Information"}
              {currentStep === 2 && "Job Details"}
              {currentStep === 3 && "Review & Submit"}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 &&
                "Enter the basic information about the job position"}
              {currentStep === 2 &&
                "Provide detailed information about the role"}
              {currentStep === 3 &&
                "Review your job posting before publishing"}
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Step 1: Basic Info */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Job Title <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="e.g., Senior Software Engineer"
                      value={formData.title}
                      onChange={handleChange}
                      maxLength={50}
                      className="text-lg"
                    />
                    <p className="text-sm text-muted-foreground">
                      {formData.title.length}/50 characters
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="department"
                      className="flex items-center gap-2"
                    >
                      <Building2 className="h-4 w-4" />
                      Department <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="department"
                      name="department"
                      placeholder="e.g., Engineering, Marketing, Sales"
                      value={formData.department}
                      onChange={handleChange}
                      maxLength={50}
                    />
                    <p className="text-sm text-muted-foreground">
                      {formData.department.length}/50 characters
                    </p>
                  </div>
                </div>
              )}

              {/* Step 2: Details */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="location" className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Location <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="location"
                      name="location"
                      placeholder="e.g., Remote, Bangalore, New York"
                      value={formData.location}
                      onChange={handleChange}
                      maxLength={25}
                    />
                    <p className="text-sm text-muted-foreground">
                      {formData.location.length}/25 characters
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="description"
                      className="flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      Job Description <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Describe the role, responsibilities, requirements, and what makes this position exciting..."
                      value={formData.description}
                      onChange={handleChange}
                      rows={12}
                      className="resize-none"
                    />
                    <p className="text-sm text-muted-foreground">
                      Provide a comprehensive description of the role
                    </p>
                  </div>
                </div>
              )}

              {/* Step 3: Review */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="rounded-lg border bg-muted/50 p-6 space-y-4">
                    <div className="space-y-2">
                      <Label className="text-muted-foreground flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        Job Title
                      </Label>
                      <p className="text-lg font-semibold">{formData.title}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-muted-foreground flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          Department
                        </Label>
                        <p className="font-medium">{formData.department}</p>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-muted-foreground flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Location
                        </Label>
                        <p className="font-medium">{formData.location}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-muted-foreground flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Description
                      </Label>
                      <p className="whitespace-pre-wrap text-sm">
                        {formData.description}
                      </p>
                    </div>
                  </div>

                  <Alert>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>
                      Please review all information carefully before publishing
                      the job posting.
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={
                    currentStep === 1
                      ? () => router.push("/tenant/recruiter-portal/jobs")
                      : handleBack
                  }
                  disabled={isSubmitting}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {currentStep === 1 ? "Cancel" : "Back"}
                </Button>

                {currentStep < 3 ? (
                  <Button type="button" onClick={handleNext}>
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Create Job
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </form>
        </Card>
      </div>
    </ModernRecruiterLayout>
  );
}

export default function CreateJobPage() {
  return (
    <TenantProtectedRoute allowedRoles={["recruiter"]}>
      <CreateJobContent />
    </TenantProtectedRoute>
  );
}
