"use client";

import { useState, useEffect } from "react";
import { TenantProtectedRoute } from "@/components/tenant/TenantProtectedRoute";
import { tenantApplicantAPI, ApplicantProfileResponse } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  User,
  Mail,
  Briefcase,
  FileText,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { useTenant } from "@/providers/tenant-provider";

function ApplicantProfileContent() {
  const { tenant } = useTenant();
  const [profile, setProfile] = useState<ApplicantProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const data = await tenantApplicantAPI.getProfile();
      setProfile(data);
    } catch (err: unknown) {
      console.error("Failed to load profile:", err);
      const message =
        err instanceof Error ? err.message : "Failed to load profile";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Profile Not Found</CardTitle>
            <CardDescription>
              Unable to load your profile information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={loadProfile}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const initials = profile.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="container max-w-4xl mx-auto py-8 space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-3xl mb-2">{profile.name}</CardTitle>
              <CardDescription className="text-lg flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {profile.email}
              </CardDescription>
              <div className="flex items-center gap-2 mt-3">
                <Badge variant="secondary" className="gap-1">
                  <User className="h-3 w-3" />
                  Applicant
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <Briefcase className="h-3 w-3" />
                  {tenant?.brandName || "WorkZone"}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Profile Details Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription>
            Your account details and information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                User ID
              </label>
              <p className="text-sm font-mono bg-muted px-3 py-2 rounded">
                {profile.user_id}
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Profile ID
              </label>
              <p className="text-sm font-mono bg-muted px-3 py-2 rounded">
                {profile.id}
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Full Name
              </label>
              <p className="text-sm bg-muted px-3 py-2 rounded">
                {profile.name}
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Email Address
              </label>
              <p className="text-sm bg-muted px-3 py-2 rounded">
                {profile.email}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications Stats Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Application Statistics
          </CardTitle>
          <CardDescription>Overview of your job applications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {profile.applications?.length || 0}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Total Applications
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {profile.applications?.filter(
                  (app) => app.status === "shortlisted"
                ).length || 0}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Shortlisted</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-950/30 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {profile.applications?.filter(
                  (app) => app.status === "ai_interview_completed"
                ).length || 0}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Interviews Completed
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ApplicantProfilePage() {
  return (
    <TenantProtectedRoute allowedRoles={["applicant"]}>
      <ApplicantProfileContent />
    </TenantProtectedRoute>
  );
}
