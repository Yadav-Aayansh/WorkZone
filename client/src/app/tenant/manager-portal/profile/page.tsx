"use client";

import { useState, useEffect } from "react";
import { TenantProtectedRoute } from "@/components/tenant/TenantProtectedRoute";
import { tenantManagerAPI, ManagerProfileResponse } from "@/lib/api";
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
import { Loader2, User, Mail, Briefcase, FileText, Shield } from "lucide-react";
import { toast } from "sonner";
import { useTenant } from "@/providers/tenant-provider";

function ManagerProfileContent() {
  const { tenant } = useTenant();
  const [profile, setProfile] = useState<ManagerProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const data = await tenantManagerAPI.getProfile();
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
      <h1 className="text-3xl font-bold">Manager Profile</h1>

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
                  <Shield className="h-3 w-3" />
                  Manager
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

      {/* Responsibilities Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Manager Responsibilities
          </CardTitle>
          <CardDescription>
            Your role and access within the organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded">
                <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-sm">Team Management</p>
                <p className="text-sm text-muted-foreground">
                  Oversee team members, assign tasks, and track progress
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
              <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded">
                <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-medium text-sm">Leave Approvals</p>
                <p className="text-sm text-muted-foreground">
                  Review and approve leave requests from team members
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded">
                <Briefcase className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="font-medium text-sm">Performance Reviews</p>
                <p className="text-sm text-muted-foreground">
                  Conduct performance evaluations and provide feedback
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ManagerProfilePage() {
  return (
    <TenantProtectedRoute allowedRoles={["manager"]}>
      <ManagerProfileContent />
    </TenantProtectedRoute>
  );
}
