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
    setIsSubmitting(true);

    try {
      // Check if the backend endpoint exists
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/platform/invite`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          body: JSON.stringify({
            email: formData.email,
            name: formData.name || undefined,
            role: formData.role,
          }),
        }
      );

      if (response.status === 404) {
        throw new Error(
          "The invite feature endpoint is not yet implemented in the backend. Please ask the backend team to add POST /api/platform/invite endpoint."
        );
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to send invitation");
      }

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
      });

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to send invitation. Please try again.";
      setError(errorMessage);
      showToast({
        type: "error",
        title: "Invitation failed",
        message: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-3">
                <Logo className="w-8" />
                <h1 className="text-xl font-semibold">Invite Employee</h1>
              </div>
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <UserPlus className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Invite Team Member</CardTitle>
                  <CardDescription>
                    Send an invitation to join your organization
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

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="employee@company.com"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    required
                    disabled={isSubmitting || success}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    The invitation link will be sent to this email address
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Full Name (Optional)</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    disabled={isSubmitting || success}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Name will be pre-filled in their signup form
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <div className="grid grid-cols-1 gap-3">
                    <label
                      className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-all ${
                        formData.role === "employee"
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-primary/50"
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
                        className="mt-1"
                      />
                      <div>
                        <div className="font-medium">Employee</div>
                        <div className="text-sm text-muted-foreground">
                          Standard access for team members
                        </div>
                      </div>
                    </label>

                    <label
                      className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-all ${
                        formData.role === "manager"
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-primary/50"
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
                        className="mt-1"
                      />
                      <div>
                        <div className="font-medium">Manager</div>
                        <div className="text-sm text-muted-foreground">
                          Can manage team members and approve requests
                        </div>
                      </div>
                    </label>

                    <label
                      className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-all ${
                        formData.role === "recruiter"
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-primary/50"
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
                        className="mt-1"
                      />
                      <div>
                        <div className="font-medium">Recruiter</div>
                        <div className="text-sm text-muted-foreground">
                          Access to recruitment and applicant management
                        </div>
                      </div>
                    </label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Determines their access level and permissions
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/dashboard")}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || success}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : success ? (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Sent!
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" />
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
