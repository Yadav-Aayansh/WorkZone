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
import { LogOut, User, Calendar, FileText, BarChart } from "lucide-react";

function EmployeePortalContent() {
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
            <h1 className="text-3xl font-bold">Employee Portal</h1>
            <p className="text-muted-foreground">
              Welcome to {tenant?.brandName || "your"} employee portal
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
              <Calendar className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Leave Management</CardTitle>
              <CardDescription>
                Request leave, check balance, view history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Request Leave</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <FileText className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Payslips</CardTitle>
              <CardDescription>
                Download payslips and tax documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">View Payslips</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <BarChart className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Performance</CardTitle>
              <CardDescription>
                View reviews, goals, and feedback
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">View Performance</Button>
            </CardContent>
          </Card>
        </div>

        {/* Info Alert */}
        <Card className="border-primary/50">
          <CardHeader>
            <CardTitle className="text-lg">🎉 Welcome!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              This is a test employee portal page. Protected route is working
              correctly! Only employees can access this page.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function EmployeePortalPage() {
  return (
    <TenantProtectedRoute allowedRoles={["employee"]}>
      <EmployeePortalContent />
    </TenantProtectedRoute>
  );
}
