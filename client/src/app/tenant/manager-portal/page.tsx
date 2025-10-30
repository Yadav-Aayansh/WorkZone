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
import { LogOut, User, Users, CheckSquare, TrendingUp } from "lucide-react";

function ManagerPortalContent() {
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
            <h1 className="text-3xl font-bold">Manager Portal</h1>
            <p className="text-muted-foreground">
              Manage your team at {tenant?.brandName}
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
              <Users className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Team Overview</CardTitle>
              <CardDescription>
                View and manage your team members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">View Team</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CheckSquare className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Leave Approvals</CardTitle>
              <CardDescription>
                Review and approve leave requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Pending Approvals</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <TrendingUp className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Performance Reviews</CardTitle>
              <CardDescription>Conduct reviews and set goals</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Review Team</Button>
            </CardContent>
          </Card>
        </div>

        {/* Info Alert */}
        <Card className="border-primary/50">
          <CardHeader>
            <CardTitle className="text-lg">🎉 Welcome Manager!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              This is a test manager portal page. Protected route is working
              correctly! Only managers can access this page.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ManagerPortalPage() {
  return (
    <TenantProtectedRoute allowedRoles={["manager"]}>
      <ManagerPortalContent />
    </TenantProtectedRoute>
  );
}
