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
  Clock,
  Calendar,
  FileText,
  LogIn,
  LogOut,
  TrendingUp,
  Megaphone,
  AlertCircle,
  CheckCircle2,
  Timer,
} from "lucide-react";
import Link from "next/link";
import employeeProfile from "@/data/tenant/employee-profile.json";
import attendanceData from "@/data/tenant/attendance.json";
import leavesData from "@/data/tenant/leaves.json";
import announcementsData from "@/data/tenant/announcements.json";
import { useEffect, useState } from "react";

export default function EmployeeDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());

      // Calculate elapsed time since check-in
      if (
        attendanceData.todayStatus.isCheckedIn &&
        attendanceData.todayStatus.checkInTime
      ) {
        const checkInParts = attendanceData.todayStatus.checkInTime.split(":");
        const checkInTime = new Date();
        checkInTime.setHours(
          parseInt(checkInParts[0]),
          parseInt(checkInParts[1]),
          parseInt(checkInParts[2])
        );
        const elapsed = Math.floor(
          (currentTime.getTime() - checkInTime.getTime()) / 1000
        );
        setElapsedTime(elapsed);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [currentTime]);

  const formatElapsedTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const recentAnnouncements = announcementsData.slice(0, 3);

  return (
    <EmployeePortalLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="relative overflow-hidden rounded-2xl bg-background p-8 text-foreground shadow-employee">
          <div className="absolute top-0 right-0 w-64 h-64 bg-foreground/10 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-foreground/5 rounded-full -ml-48 -mb-48 blur-3xl" />

          <div className="relative z-10">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">
                  Welcome back, {employeeProfile.name.split(" ")[0]}! 👋
                </h1>
                <p className="text-foreground/90 text-lg mb-6">
                  {currentTime.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>

                <div className="flex flex-wrap gap-4">
                  <div className="bg-foreground/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/30">
                    <p className="text-xs text-foreground/80 mb-1">
                      Employee ID
                    </p>
                    <p className="text-lg font-bold">
                      {employeeProfile.employeeId}
                    </p>
                  </div>
                  <div className="bg-foreground/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/30">
                    <p className="text-xs text-foreground/80 mb-1">
                      Department
                    </p>
                    <p className="text-lg font-bold">
                      {employeeProfile.department}
                    </p>
                  </div>
                  <div className="bg-foreground/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/30">
                    <p className="text-xs text-foreground/80 mb-1">
                      Designation
                    </p>
                    <p className="text-lg font-bold">
                      {employeeProfile.designation}
                    </p>
                  </div>
                </div>
              </div>

              <div className="hidden lg:block text-8xl opacity-20">🎯</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Check In/Out */}
          <Card className="border-2 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {attendanceData.todayStatus.isCheckedIn ? (
                  <>
                    <LogOut className="h-5 w-5 text-red-500" />
                    Check Out
                  </>
                ) : (
                  <>
                    <LogIn className="h-5 w-5 text-green-500" />
                    Check In
                  </>
                )}
              </CardTitle>
              <CardDescription>
                {attendanceData.todayStatus.isCheckedIn
                  ? "End your work day"
                  : "Start your work day"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {attendanceData.todayStatus.isCheckedIn ? (
                <div className="space-y-4">
                  <div className="bg-green-50 dark:bg-green-950/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-400 mb-2">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-sm font-medium">Checked In</span>
                    </div>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-300">
                      {attendanceData.todayStatus.checkInTime}
                    </p>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-950/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 mb-2">
                      <Timer className="h-4 w-4" />
                      <span className="text-sm font-medium">Time Elapsed</span>
                    </div>
                    <p className="text-3xl font-bold text-blue-900 dark:text-blue-300 font-mono">
                      {formatElapsedTime(elapsedTime)}
                    </p>
                  </div>

                  <Button className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg shadow-red-500/20">
                    <LogOut className="mr-2 h-4 w-4" />
                    Check Out Now
                  </Button>
                </div>
              ) : (
                <Button className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg shadow-green-500/20">
                  <LogIn className="mr-2 h-4 w-4" />
                  Check In Now
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Apply Leave */}
          <Card className="border-2 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-orange-500" />
                Apply Leave
              </CardTitle>
              <CardDescription>Request time off</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-purple-50 dark:bg-purple-950/20 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
                    <p className="text-xs text-purple-600 dark:text-purple-400 mb-1">
                      Casual
                    </p>
                    <p className="text-xl font-bold text-purple-900 dark:text-purple-300">
                      {leavesData.balance.casual.available}
                    </p>
                  </div>
                  <div className="bg-pink-50 dark:bg-pink-950/20 rounded-lg p-3 border border-pink-200 dark:border-pink-800">
                    <p className="text-xs text-pink-600 dark:text-pink-400 mb-1">
                      Sick
                    </p>
                    <p className="text-xl font-bold text-pink-900 dark:text-pink-300">
                      {leavesData.balance.sick.available}
                    </p>
                  </div>
                  <div className="bg-teal-50 dark:bg-teal-950/20 rounded-lg p-3 border border-teal-200 dark:border-teal-800">
                    <p className="text-xs text-teal-600 dark:text-teal-400 mb-1">
                      Earned
                    </p>
                    <p className="text-xl font-bold text-teal-900 dark:text-teal-300">
                      {leavesData.balance.earned.available}
                    </p>
                  </div>
                </div>

                <Link href="/tenant/employee-portal/leaves">
                  <Button className="w-full bg-employee-gradient hover:opacity-90 text-foreground shadow-employee">
                    <Calendar className="mr-2 h-4 w-4" />
                    Apply for Leave
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* View Payslip */}
          <Card className="border-2 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" />
                Latest Payslip
              </CardTitle>
              <CardDescription>October 2025</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">
                    Net Salary
                  </p>
                  <p className="text-3xl font-bold text-blue-900 dark:text-blue-300">
                    ₹81,900
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    Paid on Nov 1, 2025
                  </p>
                </div>

                <Link href="/tenant/employee-portal/payslips">
                  <Button className="w-full" variant="outline">
                    <FileText className="mr-2 h-4 w-4" />
                    View Payslip
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-700 dark:text-green-400">
                Attendance This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-green-900 dark:text-green-300">
                  {attendanceData.currentMonth.attendancePercentage}%
                </span>
              </div>
              <p className="text-xs text-green-600 dark:text-green-500 mt-2">
                {attendanceData.currentMonth.presentDays} of{" "}
                {attendanceData.currentMonth.totalWorkingDays} days
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200 dark:border-blue-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-400">
                Total Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-blue-900 dark:text-blue-300">
                  {attendanceData.currentMonth.totalHours}
                </span>
                <span className="text-sm text-blue-600 dark:text-blue-500">
                  hrs
                </span>
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-500 mt-2">
                Avg {attendanceData.currentMonth.averageHoursPerDay} hrs/day
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border-orange-200 dark:border-orange-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-400">
                Leave Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-orange-900 dark:text-orange-300">
                  {leavesData.balance.casual.available +
                    leavesData.balance.sick.available}
                </span>
                <span className="text-sm text-orange-600 dark:text-orange-500">
                  days
                </span>
              </div>
              <p className="text-xs text-orange-600 dark:text-orange-500 mt-2">
                Available to use
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-400">
                Pending Leaves
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-purple-900 dark:text-purple-300">
                  {
                    leavesData.applications.filter(
                      (l) => l.status === "pending"
                    ).length
                  }
                </span>
                <span className="text-sm text-purple-600 dark:text-purple-500">
                  requests
                </span>
              </div>
              <p className="text-xs text-purple-600 dark:text-purple-500 mt-2">
                Awaiting approval
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Announcements */}
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Megaphone className="h-5 w-5 text-employee" />
                  Recent Announcements
                </CardTitle>
                <CardDescription>
                  Stay updated with company news
                </CardDescription>
              </div>
              <Link href="/tenant/employee-portal/announcements">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAnnouncements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="flex items-start gap-4 p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors"
                >
                  <div
                    className={`p-2 rounded-lg ${
                      announcement.priority === "high"
                        ? "bg-red-100 dark:bg-red-950/30"
                        : "bg-blue-100 dark:bg-blue-950/30"
                    }`}
                  >
                    {announcement.isImportant ? (
                      <AlertCircle
                        className={`h-5 w-5 ${
                          announcement.priority === "high"
                            ? "text-red-600 dark:text-red-400"
                            : "text-blue-600 dark:text-blue-400"
                        }`}
                      />
                    ) : (
                      <Megaphone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="font-semibold text-foreground text-sm">
                        {announcement.title}
                      </h4>
                      {announcement.isImportant && (
                        <Badge variant="destructive" className="flex-shrink-0">
                          Important
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {announcement.content}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{announcement.postedBy}</span>
                      <span>•</span>
                      <span>
                        {new Date(announcement.postedDate).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {announcement.category}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </EmployeePortalLayout>
  );
}
