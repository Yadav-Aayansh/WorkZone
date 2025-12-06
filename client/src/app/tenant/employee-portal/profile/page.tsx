"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { TenantProtectedRoute } from "@/components/tenant/TenantProtectedRoute";
import { ModernEmployeeLayout } from "@/components/common/layout/ModernEmployeeLayout";
import { tenantEmployeeAPI, EmployeeProfileResponse } from "@/lib/api";
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
  Clock,
  Copy,
  CheckCircle,
  Hash,
  Building2,
  Download,
  ExternalLink,
  FileUp,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useTenant } from "@/providers/tenant-provider";
import { Input } from "@/components/ui/input";

function EmployeeProfileContent() {
  const { tenant } = useTenant();
  const [profile, setProfile] = useState<EmployeeProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const data = await tenantEmployeeAPI.getProfile();
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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (file.type !== "application/pdf") {
        toast.error("Please select a PDF file");
        return;
      }
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUploadResume = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }

    setIsUploading(true);
    try {
      await tenantEmployeeAPI.updateProfile(selectedFile);
      toast.success("Resume uploaded successfully!");
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      // Reload profile to get updated resume URL
      await loadProfile();
    } catch (err: unknown) {
      console.error("Failed to upload resume:", err);
      const message =
        err instanceof Error ? err.message : "Failed to upload resume";
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <h1 className="text-3xl font-bold">My Profile</h1>
      </motion.div>

      {/* Employee ID Highlight Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <Hash className="h-5 w-5" />
              Your Employee ID
            </CardTitle>
            <CardDescription>
              Your unique identifier in the organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <code className="flex-1 text-lg font-mono bg-white dark:bg-slate-900 px-4 py-3 rounded-lg border border-blue-200 dark:border-blue-800 truncate">
                {profile.employee_id}
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  copyToClipboard(profile.employee_id, "Employee ID")
                }
                className="h-12 w-12 flex-shrink-0 border-blue-200 hover:bg-blue-100 dark:border-blue-800 dark:hover:bg-blue-900/50"
              >
                {copiedField === "Employee ID" ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <Copy className="h-5 w-5 text-blue-600" />
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
              <Avatar className="h-24 w-24 ring-4 ring-blue-100 dark:ring-blue-900">
                <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
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
                  <Badge variant="secondary" className="gap-1">
                    <User className="h-3 w-3" />
                    Employee
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
                  Employee ID
                </label>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-mono bg-muted px-3 py-2 rounded flex-1 truncate">
                    {profile.employee_id}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 flex-shrink-0"
                    onClick={() =>
                      copyToClipboard(profile.employee_id, "Employee ID")
                    }
                  >
                    {copiedField === "Employee ID" ? (
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
                <div className="space-y-2">
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

      {/* Resume Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileUp className="h-5 w-5" />
              Resume / CV
            </CardTitle>
            <CardDescription>
              Your uploaded resume for learning path generation and career
              development
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current Resume Status */}
            {profile.resume ? (
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-lg">
                    <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-green-800 dark:text-green-200">
                      Resume Uploaded
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      Your resume is available for AI-powered features
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-green-300 hover:bg-green-100 dark:border-green-700 dark:hover:bg-green-900/50"
                    onClick={() => window.open(profile.resume!, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-green-300 hover:bg-green-100 dark:border-green-700 dark:hover:bg-green-900/50"
                    asChild
                  >
                    <a href={profile.resume} download>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </a>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-6 bg-muted/50 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                <div className="p-3 bg-muted rounded-full mb-3">
                  <FileUp className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="font-medium text-muted-foreground">
                  No Resume Uploaded
                </p>
                <p className="text-sm text-muted-foreground/70 text-center mt-1 max-w-md">
                  Upload your resume to enable AI-powered learning path
                  recommendations
                </p>
              </div>
            )}

            {/* Upload New Resume Section */}
            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-3">
                {profile.resume ? "Update Your Resume" : "Upload Your Resume"}
              </p>
              <div className="space-y-3">
                {/* Hidden file input */}
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="resume-upload"
                />

                {/* File selection area */}
                {!selectedFile ? (
                  <label
                    htmlFor="resume-upload"
                    className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
                  >
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="font-medium text-sm">
                      Click to select PDF file
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PDF only, max 10MB
                    </p>
                  </label>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded">
                        <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-blue-800 dark:text-blue-200">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={clearSelectedFile}
                      className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {/* Upload button */}
                {selectedFile && (
                  <Button
                    onClick={handleUploadResume}
                    disabled={isUploading}
                    className="w-full"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Resume
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Access Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Quick Access
            </CardTitle>
            <CardDescription>Your employee tools and resources</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg hover:shadow-md transition-shadow">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded">
                  <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-medium">Leave Management</p>
                  <p className="text-sm text-muted-foreground">
                    Apply for leaves and view balance
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950/30 rounded-lg hover:shadow-md transition-shadow">
                <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded">
                  <Clock className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-medium">Attendance</p>
                  <p className="text-sm text-muted-foreground">
                    Track your attendance and hours
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg hover:shadow-md transition-shadow">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded">
                  <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="font-medium">Documents</p>
                  <p className="text-sm text-muted-foreground">
                    Access company documents and policies
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-orange-50 dark:bg-orange-950/30 rounded-lg hover:shadow-md transition-shadow">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded">
                  <User className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="font-medium">Team Directory</p>
                  <p className="text-sm text-muted-foreground">
                    View colleagues and contact information
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

export default function EmployeeProfilePage() {
  return (
    <TenantProtectedRoute allowedRoles={["employee"]}>
      <ModernEmployeeLayout>
        <EmployeeProfileContent />
      </ModernEmployeeLayout>
    </TenantProtectedRoute>
  );
}
