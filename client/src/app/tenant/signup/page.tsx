// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/* eslint-disable */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTenant } from "@/providers/tenant-provider";
import { useTenantAuth } from "@/providers/tenant-auth-provider";
import { tenantAuthAPI, extractUserDataFromToken } from "@/lib/api/tenant";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function TenantSignupPage() {
  const router = useRouter();
  const { tenant, isLoading: tenantLoading } = useTenant();
  const { login: setAuthState, redirectAfterAuth } = useTenantAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError(null);
  };

  const validateForm = (): boolean => {
    if (formData.name.length < 3) {
      setError("Name must be at least 3 characters long");
      return false;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
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
      // Call backend signup API (only applicant role allowed for public signup)
      const response = await tenantAuthAPI.signup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: "applicant", // Backend only allows applicant for public signup
      });

      // Extract user data from JWT token
      const userData = extractUserDataFromToken(response.access_token);

      if (!userData) {
        throw new Error("Failed to extract user data from token");
      }

      // Set auth state in TenantAuthProvider
      await setAuthState({
        access_token: response.access_token,
        refresh_token: response.refresh_token,
        role: userData.role,
        user_id: userData.userId,
      });

      // Redirect based on user role (should be applicant -> /careers)
      redirectAfterAuth(userData.role);
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading while tenant data is being fetched
  if (tenantLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          {/* Tenant Logo */}
          {tenant?.logo && (
            <div className="flex justify-center">
              <img
                src={tenant.logo}
                alt={tenant.brandName}
                className="h-12 object-contain"
              />
            </div>
          )}

          <div className="space-y-2 text-center">
            <CardTitle className="text-2xl font-bold">
              Join {tenant?.brandName || "Our Team"}
            </CardTitle>
            <CardDescription>
              Create an account to apply for open positions
            </CardDescription>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
                minLength={3}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">
                Must be at least 8 characters long
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength={8}
                disabled={isSubmitting}
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Create Account
                </>
              )}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-primary hover:underline font-medium"
              >
                Sign in
              </Link>
            </div>

            <div className="text-center text-sm text-muted-foreground pt-4 border-t">
              <p>
                Invited by {tenant?.brandName}?{" "}
                <Link
                  href="/signup/invited"
                  className="text-primary hover:underline font-medium"
                >
                  Use invitation link
                </Link>
              </p>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
