"use client";

import { useTenant } from "@/providers/tenant-provider";
import { useTenantAuth } from "@/providers/tenant-auth-provider";
import { TenantProtectedRoute } from "@/components/tenant/TenantProtectedRoute";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { LogOut, User, Briefcase, UserPlus, Calendar } from "lucide-react";

function RecruiterPortalContent() {
  const { tenant } = useTenant();
  const { logout, userRole } = useTenantAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold">Recruiter Portal</h1>
            <p className="text-muted-foreground">
              Manage recruitment at {tenant?.brandName}
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Role Badge */}
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium capitalize">
            Role: {userRole}
          </span>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <Briefcase className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Job Postings</CardTitle>
              <CardDescription>Create and manage job openings</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Manage Jobs</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <UserPlus className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Candidate Pipeline</CardTitle>
              <CardDescription>
                Review applications and track candidates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">View Candidates</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Calendar className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Interview Scheduling</CardTitle>
              <CardDescription>Schedule and manage interviews</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Schedule Interview</Button>
            </CardContent>
          </Card>
        </div>

        {/* Info Alert */}
        <Card className="border-primary/50">
          <CardHeader>
            <CardTitle className="text-lg">🎉 Welcome Recruiter!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              This is a test recruiter portal page. Protected route is working
              correctly! Only recruiters can access this page.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function RecruiterPortalPage() {
  return (
    <TenantProtectedRoute allowedRoles={["recruiter"]}>
      <RecruiterPortalContent />
    </TenantProtectedRoute>
  );
}
