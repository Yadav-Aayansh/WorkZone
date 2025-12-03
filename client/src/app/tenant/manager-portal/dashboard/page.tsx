"use client";

import { useState, useEffect } from "react";
import { TenantProtectedRoute } from "@/components/tenant/TenantProtectedRoute";
import { ModernManagerLayout } from "@/components/common/layout/ModernManagerLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  CheckSquare,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowRight,
  Calendar,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  tenantLeaveAPI,
  tenantManagerAPI,
  LeaveRequestResponse,
  LeaveRequestStatus,
  LeaveRequestType,
  ManagerProfileResponse,
} from "@/lib/api";
import { toast } from "sonner";

function DashboardContent() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [pendingLeaves, setPendingLeaves] = useState<LeaveRequestResponse[]>(
    []
  );
  const [managerProfile, setManagerProfile] =
    useState<ManagerProfileResponse | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [pendingData, profileData] = await Promise.all([
        tenantLeaveAPI.getPendingApprovals(),
        tenantManagerAPI.getProfile(),
      ]);
      setPendingLeaves(pendingData);
      setManagerProfile(profileData);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to load dashboard data"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (leaveId: string) => {
    try {
      await tenantLeaveAPI.approveLeave(leaveId);
      toast.success("Leave request approved!");
      loadDashboardData();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to approve leave"
      );
    }
  };

  const handleReject = async (leaveId: string) => {
    try {
      await tenantLeaveAPI.rejectLeave(leaveId, {
        rejection_reason: "Rejected by manager",
      });
      toast.success("Leave request rejected");
      loadDashboardData();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to reject leave"
      );
    }
  };

  const getStatusBadge = (status: LeaveRequestStatus) => {
    switch (status) {
      case LeaveRequestStatus.PENDING:
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
          >
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
      case LeaveRequestStatus.APPROVED:
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
          >
            <CheckCircle className="mr-1 h-3 w-3" />
            Approved
          </Badge>
        );
      case LeaveRequestStatus.REJECTED:
        return (
          <Badge
            variant="outline"
            className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
          >
            <XCircle className="mr-1 h-3 w-3" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatLeaveType = (type: LeaveRequestType) => {
    return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const calculateDays = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manager Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your team and approve requests
          </p>
        </div>
        <Button onClick={() => router.push("/tenant/manager-portal/leaves")}>
          <CheckSquare className="mr-2 h-4 w-4" />
          View All Requests
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Approvals
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingLeaves.length}</div>
            <p className="text-xs text-muted-foreground">
              leave requests waiting
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">active employees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              On Leave Today
            </CardTitle>
            <Calendar className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">team members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">reviews pending</p>
          </CardContent>
        </Card>
      </div>

      {/* Manager Info Card */}
      {managerProfile && (
        <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 border-purple-200 dark:border-purple-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              Your Manager Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{managerProfile.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{managerProfile.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Manager ID</p>
                <p className="font-mono text-sm">{managerProfile.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Role</p>
                <Badge className="mt-1">Manager</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Leave Requests */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Pending Leave Requests</CardTitle>
            <CardDescription>
              Review and approve team leave requests
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/tenant/manager-portal/leaves")}
          >
            View All
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {pendingLeaves.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50 text-green-500" />
              <p className="font-medium">All caught up!</p>
              <p className="text-sm">No pending leave requests to review</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingLeaves.slice(0, 5).map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {formatLeaveType(request.leave_type)} Leave
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(request.start_date)} -{" "}
                        {formatDate(request.end_date)}(
                        {calculateDays(request.start_date, request.end_date)}{" "}
                        days)
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Reason: {request.reason}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(request.status)}
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      onClick={() => handleApprove(request.id)}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleReject(request.id)}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ManagerDashboardPage() {
  return (
    <TenantProtectedRoute allowedRoles={["manager"]}>
      <ModernManagerLayout>
        <DashboardContent />
      </ModernManagerLayout>
    </TenantProtectedRoute>
  );
}
