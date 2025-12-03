"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TenantProtectedRoute } from "@/components/tenant/TenantProtectedRoute";
import { ModernManagerLayout } from "@/components/common/layout/ModernManagerLayout";
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
import {
  Loader2,
  User,
  Mail,
  Briefcase,
  FileText,
  Shield,
  Hash,
  Copy,
  CheckCircle,
  Building2,
  Users,
  ClipboardCheck,
} from "lucide-react";
import { toast } from "sonner";
import { useTenant } from "@/providers/tenant-provider";

function ManagerProfileContent() {
  const { tenant } = useTenant();
  const [profile, setProfile] = useState<ManagerProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);

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

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success(`${field} copied to clipboard!`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast.error(`Failed to copy ${field}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-96">
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
    .map((n: string) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <h1 className="text-3xl font-bold">Manager Profile</h1>
      </motion.div>

      {/* Manager ID Highlight Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 border-purple-200 dark:border-purple-800">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
              <Hash className="h-5 w-5" />
              Your Manager ID
            </CardTitle>
            <CardDescription>
              Share this ID with HR when adding employees to your team
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <code className="flex-1 text-lg font-mono bg-white dark:bg-slate-900 px-4 py-3 rounded-lg border border-purple-200 dark:border-purple-800 truncate">
                {profile.manager_id}
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  copyToClipboard(profile.manager_id, "Manager ID")
                }
                className="h-12 w-12 flex-shrink-0 border-purple-200 hover:bg-purple-100 dark:border-purple-800 dark:hover:bg-purple-900/50"
              >
                {copiedField === "Manager ID" ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <Copy className="h-5 w-5 text-purple-600" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24 ring-4 ring-purple-100 dark:ring-purple-900">
                <AvatarFallback className="text-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-3xl mb-2">{profile.name}</CardTitle>
                <CardDescription className="text-lg flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {profile.email}
                </CardDescription>
                {profile.title && (
                  <CardDescription className="text-base flex items-center gap-2 mt-1">
                    <Briefcase className="h-4 w-4" />
                    {profile.title}
                  </CardDescription>
                )}
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <Badge
                    variant="secondary"
                    className="gap-1 bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                  >
                    <Shield className="h-3 w-3" />
                    Manager
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <Building2 className="h-3 w-3" />
                    {tenant?.brandName || "WorkZone"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Profile Details Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
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
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  User ID
                </label>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-mono bg-muted px-3 py-2 rounded flex-1 truncate">
                    {profile.user_id}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 flex-shrink-0"
                    onClick={() => copyToClipboard(profile.user_id, "User ID")}
                  >
                    {copiedField === "User ID" ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  Manager ID
                </label>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-mono bg-muted px-3 py-2 rounded flex-1 truncate">
                    {profile.manager_id}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 flex-shrink-0"
                    onClick={() =>
                      copyToClipboard(profile.manager_id, "Manager ID")
                    }
                  >
                    {copiedField === "Manager ID" ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Full Name
                </label>
                <p className="text-sm bg-muted px-3 py-2 rounded">
                  {profile.name}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </label>
                <p className="text-sm bg-muted px-3 py-2 rounded">
                  {profile.email}
                </p>
              </div>
              {profile.title && (
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Job Title
                  </label>
                  <p className="text-sm bg-muted px-3 py-2 rounded">
                    {profile.title}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Responsibilities Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Manager Responsibilities
            </CardTitle>
            <CardDescription>
              Your role and access within the organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg hover:shadow-md transition-shadow">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded">
                  <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-sm">Team Management</p>
                  <p className="text-sm text-muted-foreground">
                    Oversee team members, assign tasks, and track progress
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg hover:shadow-md transition-shadow">
                <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded">
                  <ClipboardCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-medium text-sm">Leave Approvals</p>
                  <p className="text-sm text-muted-foreground">
                    Review and approve leave requests from team members
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg hover:shadow-md transition-shadow">
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
      </motion.div>
    </div>
  );
}

export default function ManagerProfilePage() {
  return (
    <TenantProtectedRoute allowedRoles={["manager"]}>
      <ModernManagerLayout>
        <ManagerProfileContent />
      </ModernManagerLayout>
    </TenantProtectedRoute>
  );
}
