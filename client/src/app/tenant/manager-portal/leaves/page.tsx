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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Calendar,
  RefreshCw,
  AlertCircle,
  FileText,
} from "lucide-react";
import {
  tenantLeaveAPI,
  LeaveRequestResponse,
  LeaveRequestStatus,
  LeaveRequestType,
} from "@/lib/api";
import { toast } from "sonner";

function LeaveApprovalsContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [pendingLeaves, setPendingLeaves] = useState<LeaveRequestResponse[]>(
    []
  );
  const [activeTab, setActiveTab] = useState("pending");
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [selectedLeaveId, setSelectedLeaveId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadPendingLeaves();
  }, []);

  const loadPendingLeaves = async () => {
    setIsLoading(true);
    try {
      const data = await tenantLeaveAPI.getPendingApprovals();
      setPendingLeaves(data);
    } catch (err) {
      console.error("Failed to load pending leaves:", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to load pending leave requests"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (leaveId: string) => {
    setIsSubmitting(true);
    try {
      await tenantLeaveAPI.approveLeave(leaveId);
      toast.success("Leave request approved successfully!");
      loadPendingLeaves();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to approve leave request"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const openRejectDialog = (leaveId: string) => {
    setSelectedLeaveId(leaveId);
    setRejectionReason("");
    setIsRejectDialogOpen(true);
  };

  const handleReject = async () => {
    if (!selectedLeaveId) return;
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    setIsSubmitting(true);
    try {
      await tenantLeaveAPI.rejectLeave(selectedLeaveId, {
        rejection_reason: rejectionReason.trim(),
      });
      toast.success("Leave request rejected");
      setIsRejectDialogOpen(false);
      setSelectedLeaveId(null);
      setRejectionReason("");
      loadPendingLeaves();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to reject leave request"
      );
    } finally {
      setIsSubmitting(false);
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
      case LeaveRequestStatus.CANCELLED:
        return (
          <Badge
            variant="outline"
            className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
          >
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getLeaveTypeBadge = (type: LeaveRequestType) => {
    const colorMap: Record<LeaveRequestType, string> = {
      [LeaveRequestType.CASUAL]:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      [LeaveRequestType.SICK]:
        "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      [LeaveRequestType.EARNED]:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      [LeaveRequestType.MATERNITY]:
        "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400",
      [LeaveRequestType.PATERNITY]:
        "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    };

    return (
      <Badge variant="outline" className={colorMap[type]}>
        {type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
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

  const pendingRequests = pendingLeaves.filter(
    (l) => l.status === LeaveRequestStatus.PENDING
  );
  const approvedRequests = pendingLeaves.filter(
    (l) => l.status === LeaveRequestStatus.APPROVED
  );
  const rejectedRequests = pendingLeaves.filter(
    (l) => l.status === LeaveRequestStatus.REJECTED
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Leave Approvals</h1>
          <p className="text-muted-foreground">
            Review and manage team leave requests
          </p>
        </div>
        <Button variant="outline" onClick={loadPendingLeaves}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-yellow-200 dark:border-yellow-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {pendingRequests.length}
            </div>
            <p className="text-xs text-muted-foreground">
              requests awaiting review
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-200 dark:border-green-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {approvedRequests.length}
            </div>
            <p className="text-xs text-muted-foreground">requests approved</p>
          </CardContent>
        </Card>

        <Card className="border-red-200 dark:border-red-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {rejectedRequests.length}
            </div>
            <p className="text-xs text-muted-foreground">requests rejected</p>
          </CardContent>
        </Card>
      </div>

      {/* Leave Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Leave Requests</CardTitle>
          <CardDescription>All leave requests from your team</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="pending" className="gap-2">
                <Clock className="h-4 w-4" />
                Pending ({pendingRequests.length})
              </TabsTrigger>
              <TabsTrigger value="approved" className="gap-2">
                <CheckCircle className="h-4 w-4" />
                Approved ({approvedRequests.length})
              </TabsTrigger>
              <TabsTrigger value="rejected" className="gap-2">
                <XCircle className="h-4 w-4" />
                Rejected ({rejectedRequests.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending">
              {pendingRequests.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50 text-green-500" />
                  <p className="font-medium">All caught up!</p>
                  <p className="text-sm">No pending leave requests to review</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Leave Type</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Days</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          {getLeaveTypeBadge(request.leave_type)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm">
                                {formatDate(request.start_date)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                to {formatDate(request.end_date)}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {calculateDays(
                              request.start_date,
                              request.end_date
                            )}{" "}
                            days
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div
                            className="max-w-xs truncate"
                            title={request.reason}
                          >
                            {request.reason}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => handleApprove(request.id)}
                              disabled={isSubmitting}
                            >
                              <CheckCircle className="mr-1 h-4 w-4" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => openRejectDialog(request.id)}
                              disabled={isSubmitting}
                            >
                              <XCircle className="mr-1 h-4 w-4" />
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="approved">
              {approvedRequests.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">No approved requests</p>
                  <p className="text-sm">
                    Approved leave requests will appear here
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Leave Type</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Days</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {approvedRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          {getLeaveTypeBadge(request.leave_type)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm">
                                {formatDate(request.start_date)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                to {formatDate(request.end_date)}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {calculateDays(
                              request.start_date,
                              request.end_date
                            )}{" "}
                            days
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div
                            className="max-w-xs truncate"
                            title={request.reason}
                          >
                            {request.reason}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="rejected">
              {rejectedRequests.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">No rejected requests</p>
                  <p className="text-sm">
                    Rejected leave requests will appear here
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Leave Type</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Days</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Rejection Reason</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rejectedRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          {getLeaveTypeBadge(request.leave_type)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm">
                                {formatDate(request.start_date)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                to {formatDate(request.end_date)}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {calculateDays(
                              request.start_date,
                              request.end_date
                            )}{" "}
                            days
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div
                            className="max-w-xs truncate"
                            title={request.reason}
                          >
                            {request.reason}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div
                            className="max-w-xs truncate text-red-600"
                            title={request.rejection_reason || ""}
                          >
                            {request.rejection_reason || "-"}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Rejection Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Reject Leave Request
            </DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this leave request. This
              will be shared with the employee.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rejection-reason">Rejection Reason</Label>
              <Textarea
                id="rejection-reason"
                placeholder="Enter the reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRejectDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isSubmitting || !rejectionReason.trim()}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rejecting...
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject Request
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function ManagerLeavesPage() {
  return (
    <TenantProtectedRoute allowedRoles={["manager"]}>
      <ModernManagerLayout>
        <LeaveApprovalsContent />
      </ModernManagerLayout>
    </TenantProtectedRoute>
  );
}
