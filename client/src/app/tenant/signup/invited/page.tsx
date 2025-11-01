// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/* eslint-disable */

"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { AlertCircle, Loader2, CheckCircle2, UserCheck } from "lucide-react";
import Link from "next/link";

function TenantInvitedSignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { tenant, isLoading: tenantLoading } = useTenant();
  const { login: setAuthState, redirectAfterAuth } = useTenantAuth();

  const [invitationToken, setInvitationToken] = useState<string | null>(null);
  const [invitedEmail, setInvitedEmail] = useState<string | null>(null);
  const [invitedRole, setInvitedRole] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDecoding, setIsDecoding] = useState(true);

  // Token paste feature states (must be at top level)
  const [pastedLink, setPastedLink] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState("");

  // Extract invitation token from URL
  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setError(
        "No invitation token found. Please use the link from your invitation email."
      );
      setIsDecoding(false);
      return;
    }

    setInvitationToken(token);

    // Decode token to extract email and role (client-side preview only)
    try {
      const userData = extractUserDataFromToken(token);
      if (userData) {
        setInvitedEmail(userData.email);
        setInvitedRole(userData.role);
      }
    } catch (err) {
      console.error("Failed to decode invitation token:", err);
      // Don't set error here - backend will validate the token
    } finally {
      setIsDecoding(false);
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError(null);
  };

  const validateForm = (): boolean => {
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

    if (!invitationToken) {
      setError("No invitation token found");
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Call backend invited signup API
      const response = await tenantAuthAPI.signupInvited({
        token: invitationToken,
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
      console.error("Invited signup error:", err);
      setError(
        err.message ||
          "Failed to complete signup. Your invitation may have expired."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading while tenant data is being fetched or token is being decoded
  if (tenantLoading || isDecoding) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handlePasteAndRedirect = () => {
    setExtracting(true);
    setExtractError("");

    try {
      // Try to extract token from the pasted link
      let token = "";

      // Check if it's a full URL
      if (pastedLink.includes("http") || pastedLink.includes("://")) {
        try {
          const url = new URL(pastedLink);
          token = url.searchParams.get("token") || "";
        } catch (urlError) {
          // If URL parsing fails, try regex
          const tokenMatch = pastedLink.match(/[?&]token=([^&]+)/);
          token = tokenMatch ? tokenMatch[1] : "";
        }
      } else if (pastedLink.includes("token=")) {
        // If it's just a query string or partial URL
        const tokenMatch = pastedLink.match(/token=([^&\s]+)/);
        token = tokenMatch ? tokenMatch[1] : "";
      } else {
        // Assume the pasted text is the token itself
        token = pastedLink.trim();
      }

      if (!token) {
        setExtractError(
          "Could not extract token from the provided link. Please check and try again."
        );
        setExtracting(false);
        return;
      }

      // Redirect to the same page with the extracted token
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set("token", token);
      window.location.href = currentUrl.toString();
    } catch (err) {
      console.error("Error extracting token:", err);
      setExtractError(
        "Failed to process the invitation link. Please try again."
      );
      setExtracting(false);
    }
  };

  // Show error if no token - with token paste feature
  if (!invitationToken) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Invalid Invitation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error ||
                  "No invitation token found. Please use the link from your invitation email."}
              </AlertDescription>
            </Alert>

            {/* Token paste feature */}
            <div className="space-y-3 pt-4 border-t">
              <div className="space-y-2">
                <Label htmlFor="pastedLink" className="text-sm font-medium">
                  Paste your invitation link here
                </Label>
                <Input
                  id="pastedLink"
                  type="text"
                  placeholder="https://example.workzone.tech/signup/invited?token=..."
                  value={pastedLink}
                  onChange={(e) => {
                    setPastedLink(e.target.value);
                    setExtractError("");
                  }}
                  disabled={extracting}
                  className="font-mono text-xs"
                />
                <p className="text-xs text-muted-foreground">
                  Paste the complete invitation link from your email
                </p>
              </div>

              {extractError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    {extractError}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handlePasteAndRedirect}
                disabled={!pastedLink.trim() || extracting}
                className="w-full"
              >
                {extracting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Continue with Invitation"
                )}
              </Button>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href="/login">Go to Login</Link>
            </Button>
          </CardFooter>
        </Card>
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
            <div className="flex justify-center mb-2">
              <div className="rounded-full bg-primary/10 p-3">
                <UserCheck className="h-6 w-6 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">
              Complete Your Invitation
            </CardTitle>
            <CardDescription>
              You&apos;ve been invited to join {tenant?.brandName || "the team"}
              {invitedRole && ` as ${invitedRole}`}
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

            {/* Show invited email (read-only) */}
            {invitedEmail && (
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={invitedEmail}
                  disabled
                  className="bg-muted"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">Create Password</Label>
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
                  Completing signup...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Complete Signup
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
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default function TenantInvitedSignupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <TenantInvitedSignupContent />
    </Suspense>
  );
}
