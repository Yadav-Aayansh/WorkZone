"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  UserPlus,
} from "lucide-react";
import { useToast } from "@/providers/toast-provider";
import { Logo } from "@/components/logo";
import { RequireAuth } from "@/components/auth/ProtectedRoute";
import { platformClientAPI, PlatformAPIError } from "@/lib/api";

export default function InviteEmployeePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    email: "",
    name: "",
    role: "employee" as "employee" | "manager" | "recruiter",
    manager_id: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validate manager_id is provided for employees
    if (formData.role === "employee" && !formData.manager_id.trim()) {
      setError("Manager ID is required for employees");
      return;
    }

    setIsSubmitting(true);

    try {
      const requestData: {
        email: string;
        name: string;
        role: "employee" | "manager" | "recruiter";
        manager_id?: string;
      } = {
        email: formData.email,
        name: formData.name,
        role: formData.role,
      };

      // Only include manager_id for employees
      if (formData.role === "employee" && formData.manager_id.trim()) {
        requestData.manager_id = formData.manager_id.trim();
      }

      await platformClientAPI.inviteUser(requestData);

      setSuccess(true);
      showToast({
        type: "success",
        title: "Invitation sent!",
        message: `Successfully invited ${formData.email} as ${formData.role}`,
      });

      // Reset form
      setFormData({
        email: "",
        name: "",
        role: "employee",
        manager_id: "",
      });

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err) {
      if (err instanceof PlatformAPIError) {
        setError(err.message);
        showToast({
          type: "error",
          title: "Invitation failed",
          message: err.message,
        });
      } else {
        const errorMessage = "Failed to send invitation. Please try again.";
        setError(errorMessage);
        showToast({
          type: "error",
          title: "Invitation failed",
          message: errorMessage,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Header */}
        <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-sm border-b dark:border-gray-700 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-3">
                <Logo className="w-8" />
                <h1 className="text-xl font-semibold dark:text-white">
                  Invite Employee
                </h1>
              </div>
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard")}
                className="dark:border-gray-600"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8 text-center">
            <div className="inline-flex w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl items-center justify-center mx-auto mb-4 shadow-lg transform hover:scale-105 transition-transform">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">
              Invite Team Member
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Send an invitation to join your organization workspace
            </p>
          </div>

          <Card className="border-none shadow-2xl dark:bg-gray-800">
            <CardHeader className="space-y-1 pb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-lg flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <CardTitle className="text-lg dark:text-white">
                    Invitation Details
                  </CardTitle>
                  <CardDescription className="dark:text-gray-400">
                    Fill in the information to send an invitation
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="bg-green-50 border-green-200 text-green-800">
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>
                      Invitation sent successfully! The user will receive an
                      email with a signup link. Redirecting to dashboard...
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-3">
                  <Label
                    htmlFor="email"
                    className="text-base font-medium dark:text-white"
                  >
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="employee@company.com"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    required
                    disabled={isSubmitting || success}
                    className="w-full h-11 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <p className="text-xs text-muted-foreground dark:text-gray-400 flex items-center gap-1">
                    📧 The invitation link will be sent to this email address
                  </p>
                </div>

                <div className="space-y-3">
                  <Label
                    htmlFor="name"
                    className="text-base font-medium dark:text-white"
                  >
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    required
                    minLength={3}
                    disabled={isSubmitting || success}
                    className="w-full h-11 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <p className="text-xs text-muted-foreground dark:text-gray-400 flex items-center gap-1">
                    👤 Employee&apos;s full name (minimum 3 characters)
                  </p>
                </div>

                <div className="space-y-3">
                  <Label
                    htmlFor="role"
                    className="text-base font-medium dark:text-white"
                  >
                    Select Role *
                  </Label>
                  <div className="grid grid-cols-1 gap-3">
                    <label
                      className={`flex items-start gap-4 p-5 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${
                        formData.role === "employee"
                          ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-md"
                          : "border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700"
                      } ${
                        isSubmitting || success
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value="employee"
                        checked={formData.role === "employee"}
                        onChange={(e) => handleChange("role", e.target.value)}
                        disabled={isSubmitting || success}
                        className="mt-1 w-4 h-4 text-indigo-600"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 dark:text-white mb-1">
                          👤 Employee
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Standard access for team members with basic HR
                          features
                        </div>
                      </div>
                    </label>

                    <label
                      className={`flex items-start gap-4 p-5 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${
                        formData.role === "manager"
                          ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-md"
                          : "border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700"
                      } ${
                        isSubmitting || success
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value="manager"
                        checked={formData.role === "manager"}
                        onChange={(e) => handleChange("role", e.target.value)}
                        disabled={isSubmitting || success}
                        className="mt-1 w-4 h-4 text-purple-600"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 dark:text-white mb-1">
                          👨‍💼 Manager
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Can manage team members, approve leave requests &
                          reviews
                        </div>
                      </div>
                    </label>

                    <label
                      className={`flex items-start gap-4 p-5 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${
                        formData.role === "recruiter"
                          ? "border-green-500 bg-green-50 dark:bg-green-900/20 shadow-md"
                          : "border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700"
                      } ${
                        isSubmitting || success
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value="recruiter"
                        checked={formData.role === "recruiter"}
                        onChange={(e) => handleChange("role", e.target.value)}
                        disabled={isSubmitting || success}
                        className="mt-1 w-4 h-4 text-green-600"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 dark:text-white mb-1">
                          🎯 Recruiter
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Full access to recruitment, job postings & applicant
                          management
                        </div>
                      </div>
                    </label>
                  </div>
                  <p className="text-xs text-muted-foreground dark:text-gray-400 flex items-center gap-1">
                    🔐 Role determines their access level and permissions
                  </p>
                </div>

                {/* Manager ID field - only shown when role is employee */}
                {formData.role === "employee" && (
                  <div className="space-y-3">
                    <Label
                      htmlFor="manager_id"
                      className="text-base font-medium dark:text-white"
                    >
                      Manager ID *
                    </Label>
                    <Input
                      id="manager_id"
                      type="text"
                      placeholder="Enter manager's UUID"
                      value={formData.manager_id}
                      onChange={(e) =>
                        handleChange("manager_id", e.target.value)
                      }
                      required={formData.role === "employee"}
                      disabled={isSubmitting || success}
                      className="w-full h-11 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    <p className="text-xs text-muted-foreground dark:text-gray-400 flex items-center gap-1">
                      👨‍💼 The UUID of the manager who will supervise this
                      employee
                    </p>
                  </div>
                )}

                <div className="flex gap-4 pt-6 border-t dark:border-gray-700">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/dashboard")}
                    disabled={isSubmitting}
                    className="flex-1 h-11 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || success}
                    className="flex-1 h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Sending Invitation...
                      </>
                    ) : success ? (
                      <>
                        <CheckCircle2 className="mr-2 h-5 w-5" />
                        Invitation Sent!
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-5 w-5" />
                        Send Invitation
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    </RequireAuth>
  );
}
