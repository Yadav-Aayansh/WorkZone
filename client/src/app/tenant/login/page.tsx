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
import { AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";

export default function TenantLoginPage() {
  const router = useRouter();
  const { tenant, isLoading: tenantLoading } = useTenant();
  const { login: setAuthState, redirectAfterAuth } = useTenantAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Call backend login API
      const response = await tenantAuthAPI.login({
        email: formData.email,
        password: formData.password,
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

      // Redirect based on user role
      redirectAfterAuth(userData.role);
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Invalid email or password. Please try again.");
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
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to your {tenant?.brandName || "employee"} account
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary hover:underline"
                  tabIndex={-1}
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="text-primary hover:underline font-medium"
              >
                Apply now
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
