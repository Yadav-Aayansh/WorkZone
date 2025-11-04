"use client";

import { EmployeePortalLayout } from "@/components/tenant/employee-portal-layout";
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
  DialogTrigger,
} from "@/components/ui/dialog";
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
  Calendar,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
} from "lucide-react";
import leavesData from "@/data/tenant/leaves.json";
import { useState } from "react";

export default function LeavesPage() {
  const [open, setOpen] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-500">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-500">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getLeaveTypeBadge = (type: string) => {
    switch (type) {
      case "casual":
        return (
          <Badge
            variant="outline"
            className="bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400"
          >
            Casual
          </Badge>
        );
      case "sick":
        return (
          <Badge
            variant="outline"
            className="bg-pink-50 dark:bg-pink-950/30 text-pink-700 dark:text-pink-400"
          >
            Sick
          </Badge>
        );
      case "earned":
        return (
          <Badge
            variant="outline"
            className="bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-400"
          >
            Earned
          </Badge>
        );
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <EmployeePortalLayout>
      <div className="space-y-6">
        {/* Leave Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-2 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200 dark:border-purple-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-400">
                Casual Leave
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-purple-900 dark:text-purple-300">
                    {leavesData.balance.casual.available}
                  </span>
                  <span className="text-lg text-purple-600 dark:text-purple-500">
                    / {leavesData.balance.casual.total}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-purple-600 dark:text-purple-500">
                      Available
                    </span>
                    <span className="font-semibold text-purple-900 dark:text-purple-300">
                      {leavesData.balance.casual.available} days
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-purple-600 dark:text-purple-500">
                      Used
                    </span>
                    <span className="font-semibold text-purple-900 dark:text-purple-300">
                      {leavesData.balance.casual.used} days
                    </span>
                  </div>
                  <div className="w-full bg-purple-200 dark:bg-purple-900/30 rounded-full h-2">
                    <div
                      className="bg-purple-600 dark:bg-purple-500 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          (leavesData.balance.casual.available /
                            leavesData.balance.casual.total) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950/20 dark:to-pink-900/20 border-pink-200 dark:border-pink-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-pink-700 dark:text-pink-400">
                Sick Leave
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-pink-900 dark:text-pink-300">
                    {leavesData.balance.sick.available}
                  </span>
                  <span className="text-lg text-pink-600 dark:text-pink-500">
                    / {leavesData.balance.sick.total}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-pink-600 dark:text-pink-500">
                      Available
                    </span>
                    <span className="font-semibold text-pink-900 dark:text-pink-300">
                      {leavesData.balance.sick.available} days
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-pink-600 dark:text-pink-500">
                      Used
                    </span>
                    <span className="font-semibold text-pink-900 dark:text-pink-300">
                      {leavesData.balance.sick.used} days
                    </span>
                  </div>
                  <div className="w-full bg-pink-200 dark:bg-pink-900/30 rounded-full h-2">
                    <div
                      className="bg-pink-600 dark:bg-pink-500 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          (leavesData.balance.sick.available /
                            leavesData.balance.sick.total) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-950/20 dark:to-teal-900/20 border-teal-200 dark:border-teal-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-teal-700 dark:text-teal-400">
                Earned Leave
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-teal-900 dark:text-teal-300">
                    {leavesData.balance.earned.available}
                  </span>
                  <span className="text-lg text-teal-600 dark:text-teal-500">
                    / {leavesData.balance.earned.total}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-teal-600 dark:text-teal-500">
                      Available
                    </span>
                    <span className="font-semibold text-teal-900 dark:text-teal-300">
                      {leavesData.balance.earned.available} days
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-teal-600 dark:text-teal-500">
                      Used
                    </span>
                    <span className="font-semibold text-teal-900 dark:text-teal-300">
                      {leavesData.balance.earned.used} days
                    </span>
                  </div>
                  <div className="w-full bg-teal-200 dark:bg-teal-900/30 rounded-full h-2">
                    <div
                      className="bg-teal-600 dark:bg-teal-500 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          (leavesData.balance.earned.available /
                            leavesData.balance.earned.total) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Apply Leave Button */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              size="lg"
              className="w-full bg-employee-gradient hover:opacity-90 text-white shadow-employee"
            >
              <Plus className="mr-2 h-5 w-5" />
              Apply for Leave
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Apply for Leave</DialogTitle>
              <DialogDescription>
                Submit your leave request. You'll be notified once it's
                reviewed.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="leave-type">Leave Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="casual">
                      Casual Leave ({leavesData.balance.casual.available}{" "}
                      available)
                    </SelectItem>
                    <SelectItem value="sick">
                      Sick Leave ({leavesData.balance.sick.available} available)
                    </SelectItem>
                    <SelectItem value="earned">
                      Earned Leave ({leavesData.balance.earned.available}{" "}
                      available)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="from-date">From Date</Label>
                  <Input id="from-date" type="date" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="to-date">To Date</Label>
                  <Input id="to-date" type="date" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="reason">Reason</Label>
                <Textarea
                  id="reason"
                  placeholder="Enter reason for leave..."
                  className="min-h-[100px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => setOpen(false)}
                className="bg-employee-gradient"
              >
                Submit Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Leave Applications */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Leave Applications</CardTitle>
                <CardDescription>
                  Track your leave requests and their status
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>From Date</TableHead>
                  <TableHead>To Date</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Approver</TableHead>
                  <TableHead>Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leavesData.applications.map((leave) => (
                  <TableRow key={leave.id}>
                    <TableCell>{getLeaveTypeBadge(leave.type)}</TableCell>
                    <TableCell className="font-medium">
                      {new Date(leave.fromDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="font-medium">
                      {new Date(leave.toDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {leave.days} {leave.days === 1 ? "day" : "days"}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(leave.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {leave.approver}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                      {leave.remarks || leave.reason}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </EmployeePortalLayout>
  );
}
