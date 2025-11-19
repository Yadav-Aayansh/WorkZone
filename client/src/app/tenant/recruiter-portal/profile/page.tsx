"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TenantProtectedRoute } from "@/components/tenant/TenantProtectedRoute";
import { ModernRecruiterLayout } from "@/components/common/layout/ModernRecruiterLayout";
import { tenantRecruiterAPI, RecruiterProfileResponse } from "@/lib/api";
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
  TrendingUp,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { useTenant } from "@/providers/tenant-provider";

function RecruiterProfileContent() {
  const router = useRouter();
  const { tenant } = useTenant();
  const [profile, setProfile] = useState<RecruiterProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const data = await tenantRecruiterAPI.getProfile();
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
      <ModernRecruiterLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </ModernRecruiterLayout>
    );
  }

  if (!profile) {
    return (
      <ModernRecruiterLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
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
      </ModernRecruiterLayout>
    );
  }

  const initials = profile.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <ModernRecruiterLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">My Profile</h1>

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
                    Recruiter
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

        {/* Jobs Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recruitment Statistics
            </CardTitle>
            <CardDescription>
              Overview of your job postings and activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {profile.jobs?.length || 0}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Total Job Postings
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {profile.jobs?.filter((job) => job.is_open).length || 0}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Active Jobs
                </p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-950/30 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {profile.jobs?.length || 0}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Managed Positions
                </p>
              </div>
            </div>

            {profile.jobs && profile.jobs.length > 0 && (
              <div className="mt-6 space-y-3">
                <h3 className="font-semibold text-sm">Recent Job Postings</h3>
                {profile.jobs.slice(0, 5).map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{job.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {job.department} • {job.location}
                      </p>
                    </div>
                    <Badge variant={job.is_open ? "default" : "secondary"}>
                      {job.is_open ? "Open" : "Closed"}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        router.push(`/tenant/recruiter-portal/jobs/${job.id}`)
                      }
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ModernRecruiterLayout>
  );
}

export default function RecruiterProfilePage() {
  return (
    <TenantProtectedRoute allowedRoles={["recruiter"]}>
      <RecruiterProfileContent />
    </TenantProtectedRoute>
  );
}
