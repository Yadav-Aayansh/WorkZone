"use client";

import { useState, useEffect } from "react";
import { TenantProtectedRoute } from "@/components/tenant/TenantProtectedRoute";
import { ModernEmployeeLayout } from "@/components/common/layout/ModernEmployeeLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Plus,
  AlertCircle,
  TrendingUp,
  CalendarDays,
  RefreshCw,
} from "lucide-react";
import {
  tenantLeaveAPI,
  LeaveRequestResponse,
  LeaveBalanceResponse,
  LeaveRequestStatus,
  LeaveRequestType,
  ApplyLeaveRequest,
} from "@/lib/api";
import { toast } from "sonner";

function LeaveManagementContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalanceResponse | null>(
    null
  );
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequestResponse[]>(
    []
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form state
  const [leaveType, setLeaveType] = useState<LeaveRequestType>(
    LeaveRequestType.CASUAL
  );
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [balanceData, requestsData] = await Promise.all([
        tenantLeaveAPI.getLeaveBalance(),
        tenantLeaveAPI.getMyLeaveRequests(),
      ]);
      setLeaveBalance(balanceData);
      setLeaveRequests(requestsData);
    } catch (err) {
      console.error("Failed to load data:", err);
      toast.error(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyLeave = async () => {
    if (!startDate || !endDate || !reason) {
      toast.error("Please fill all required fields");
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      toast.error("End date cannot be before start date");
      return;
    }

    setIsSubmitting(true);
    try {
      const request: ApplyLeaveRequest = {
        leave_type: leaveType,
        start_date: startDate,
        end_date: endDate,
        reason: reason,
      };

      await tenantLeaveAPI.applyLeave(request);
      toast.success("Leave request submitted successfully!");
      setIsDialogOpen(false);

      // Reset form
      setLeaveType(LeaveRequestType.CASUAL);
      setStartDate("");
      setEndDate("");
      setReason("");

      // Reload data
      loadData();
    } catch (err) {
      console.error("Failed to apply leave:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to submit leave request"
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

  // Calculate total leave balance (sum of all leave types)
  const totalAvailable = leaveBalance
    ? (leaveBalance.casual ?? 0) +
      (leaveBalance.sick ?? 0) +
      (leaveBalance.earned ?? 0) +
      (leaveBalance.maternity ?? 0) +
      (leaveBalance.paternity ?? 0)
    : 0;

  // Filter requests by status
  const pendingRequests = leaveRequests.filter(
    (req) => req.status === LeaveRequestStatus.PENDING
  );
  const approvedRequests = leaveRequests.filter(
    (req) => req.status === LeaveRequestStatus.APPROVED
  );
  const rejectedRequests = leaveRequests.filter(
    (req) => req.status === LeaveRequestStatus.REJECTED
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
          <h1 className="text-3xl font-bold">Leave Management</h1>
          <p className="text-muted-foreground">
            Apply for leave and track your requests
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Apply for Leave
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Apply for Leave</DialogTitle>
                <DialogDescription>
                  Fill in the details below to submit your leave request
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="leaveType">Leave Type</Label>
                  <Select
                    value={leaveType}
                    onValueChange={(value) =>
                      setLeaveType(value as LeaveRequestType)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select leave type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={LeaveRequestType.CASUAL}>
                        Casual Leave ({leaveBalance?.casual ?? 0} available)
                      </SelectItem>
                      <SelectItem value={LeaveRequestType.SICK}>
                        Sick Leave ({leaveBalance?.sick ?? 0} available)
                      </SelectItem>
                      <SelectItem value={LeaveRequestType.EARNED}>
                        Earned Leave ({leaveBalance?.earned ?? 0} available)
                      </SelectItem>
                      <SelectItem value={LeaveRequestType.MATERNITY}>
                        Maternity Leave ({leaveBalance?.maternity ?? 0}{" "}
                        available)
                      </SelectItem>
                      <SelectItem value={LeaveRequestType.PATERNITY}>
                        Paternity Leave ({leaveBalance?.paternity ?? 0}{" "}
                        available)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate || new Date().toISOString().split("T")[0]}
                    />
                  </div>
                </div>
                {startDate && endDate && (
                  <div className="text-sm text-muted-foreground">
                    Duration: {calculateDays(startDate, endDate)} day(s)
                  </div>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="reason">Reason</Label>
                  <Textarea
                    id="reason"
                    placeholder="Please provide a reason for your leave request..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button onClick={handleApplyLeave} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Request"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Leave Balance Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Casual</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leaveBalance?.casual ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sick</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leaveBalance?.sick ?? 0}</div>
            <p className="text-xs text-muted-foreground">days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Earned</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leaveBalance?.earned ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maternity</CardTitle>
            <CalendarDays className="h-4 w-4 text-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leaveBalance?.maternity ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paternity</CardTitle>
            <CalendarDays className="h-4 w-4 text-cyan-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leaveBalance?.paternity ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">days</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Available
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {totalAvailable}
            </div>
            <p className="text-xs text-muted-foreground">days</p>
          </CardContent>
        </Card>
      </div>

      {/* Leave Requests Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>My Leave Requests</CardTitle>
          <CardDescription>
            View and track your leave applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">
                All ({leaveRequests.length})
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pending ({pendingRequests.length})
              </TabsTrigger>
              <TabsTrigger value="approved">
                Approved ({approvedRequests.length})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Rejected ({rejectedRequests.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              <LeaveTable requests={leaveRequests} />
            </TabsContent>
            <TabsContent value="pending" className="mt-4">
              <LeaveTable requests={pendingRequests} />
            </TabsContent>
            <TabsContent value="approved" className="mt-4">
              <LeaveTable requests={approvedRequests} />
            </TabsContent>
            <TabsContent value="rejected" className="mt-4">
              <LeaveTable requests={rejectedRequests} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );

  function LeaveTable({ requests }: { requests: LeaveRequestResponse[] }) {
    if (requests.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No leave requests found</p>
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>From</TableHead>
            <TableHead>To</TableHead>
            <TableHead>Days</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell className="font-medium">
                {formatLeaveType(request.leave_type)}
              </TableCell>
              <TableCell>{formatDate(request.start_date)}</TableCell>
              <TableCell>{formatDate(request.end_date)}</TableCell>
              <TableCell>
                {calculateDays(request.start_date, request.end_date)}
              </TableCell>
              <TableCell
                className="max-w-[200px] truncate"
                title={request.reason}
              >
                {request.reason}
              </TableCell>
              <TableCell>{getStatusBadge(request.status)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }
}

export default function LeavesPage() {
  return (
    <TenantProtectedRoute allowedRoles={["employee"]}>
      <ModernEmployeeLayout>
        <LeaveManagementContent />
      </ModernEmployeeLayout>
    </TenantProtectedRoute>
  );
}
