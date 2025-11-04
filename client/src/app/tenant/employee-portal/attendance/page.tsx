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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Clock,
  Calendar,
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertCircle,
  LogIn,
  LogOut,
  Timer,
} from "lucide-react";
import attendanceData from "@/data/tenant/attendance.json";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useState, useEffect } from "react";

export default function AttendancePage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "present":
        return (
          <Badge className="bg-green-500">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Present
          </Badge>
        );
      case "late":
        return (
          <Badge className="bg-yellow-500">
            <AlertCircle className="h-3 w-3 mr-1" />
            Late
          </Badge>
        );
      case "half_day":
        return (
          <Badge className="bg-orange-500">
            <Clock className="h-3 w-3 mr-1" />
            Half Day
          </Badge>
        );
      case "leave":
        return (
          <Badge className="bg-blue-500">
            <Calendar className="h-3 w-3 mr-1" />
            Leave
          </Badge>
        );
      case "absent":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Absent
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <EmployeePortalLayout>
      <div className="space-y-6">
        {/* Check In/Out Card */}
        <Card className="border-2 bg-gradient-to-br from-card via-card to-muted/20">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Clock className="h-6 w-6 text-blue-500" />
              Attendance Tracker
            </CardTitle>
            <CardDescription>
              {currentTime.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Check In/Out Actions */}
              <div className="lg:col-span-2">
                {attendanceData.todayStatus.isCheckedIn ? (
                  <div className="space-y-4">
                    <div className="bg-green-50 dark:bg-green-950/20 rounded-2xl p-6 border-2 border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                          <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <h3 className="font-bold text-green-900 dark:text-green-300">
                            Checked In
                          </h3>
                          <p className="text-sm text-green-700 dark:text-green-400">
                            You're logged in for today
                          </p>
                        </div>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-bold text-green-900 dark:text-green-300 font-mono">
                          {attendanceData.todayStatus.checkInTime}
                        </span>
                        <span className="text-lg text-green-600 dark:text-green-500">
                          AM
                        </span>
                      </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-950/20 rounded-2xl p-6 border-2 border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl animate-pulse">
                          <Timer className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h3 className="font-bold text-blue-900 dark:text-blue-300">
                            Time Elapsed
                          </h3>
                          <p className="text-sm text-blue-700 dark:text-blue-400">
                            Working hours today
                          </p>
                        </div>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-bold text-blue-900 dark:text-blue-300 font-mono">
                          {formatElapsedTime(elapsedTime)}
                        </span>
                      </div>
                    </div>

                    <Button
                      size="lg"
                      className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg shadow-red-500/20 h-14 text-lg"
                    >
                      <LogOut className="mr-2 h-5 w-5" />
                      Check Out Now
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 rounded-2xl p-8 border-2 border-dashed border-gray-300 dark:border-gray-700 text-center">
                      <div className="inline-flex p-4 bg-gray-200 dark:bg-gray-800 rounded-full mb-4">
                        <Clock className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-300 mb-2">
                        Ready to start your day?
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Click below to check in and begin tracking your work
                        hours
                      </p>
                    </div>

                    <Button
                      size="lg"
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg shadow-green-500/20 h-14 text-lg"
                    >
                      <LogIn className="mr-2 h-5 w-5" />
                      Check In Now
                    </Button>
                  </div>
                )}
              </div>

              {/* Current Time */}
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 rounded-2xl p-6 border-2 border-purple-200 dark:border-purple-800">
                <div className="text-center">
                  <p className="text-sm text-purple-700 dark:text-purple-400 mb-4">
                    Current Time
                  </p>
                  <div className="text-6xl font-bold text-purple-900 dark:text-purple-300 font-mono mb-2">
                    {currentTime.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  <div className="text-2xl text-purple-700 dark:text-purple-400 font-mono">
                    {
                      currentTime
                        .toLocaleTimeString("en-US", { second: "2-digit" })
                        .split(" ")[0]
                        .split(":")[2]
                    }
                  </div>
                  <p className="text-sm text-purple-600 dark:text-purple-500 mt-4">
                    {currentTime.toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-700 dark:text-green-400">
                Attendance Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-green-900 dark:text-green-300">
                  {attendanceData.currentMonth.attendancePercentage}%
                </span>
              </div>
              <p className="text-xs text-green-600 dark:text-green-500 mt-2">
                {attendanceData.currentMonth.presentDays}/
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

          <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 border-yellow-200 dark:border-yellow-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
                Late Days
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-yellow-900 dark:text-yellow-300">
                  {attendanceData.currentMonth.lateDays}
                </span>
                <span className="text-sm text-yellow-600 dark:text-yellow-500">
                  days
                </span>
              </div>
              <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-2">
                This month
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-400">
                Leave Days
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-purple-900 dark:text-purple-300">
                  {attendanceData.currentMonth.leaveDays}
                </span>
                <span className="text-sm text-purple-600 dark:text-purple-500">
                  days
                </span>
              </div>
              <p className="text-xs text-purple-600 dark:text-purple-500 mt-2">
                This month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for History and Chart */}
        <Tabs defaultValue="history" className="space-y-4">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="history">Attendance History</TabsTrigger>
            <TabsTrigger value="chart">Weekly Trend</TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Attendance Records</CardTitle>
                <CardDescription>
                  Your attendance for the last 20 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Check In</TableHead>
                      <TableHead>Check Out</TableHead>
                      <TableHead>Hours</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendanceData.records.map((record) => (
                      <TableRow key={record.date}>
                        <TableCell className="font-medium">
                          {new Date(record.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </TableCell>
                        <TableCell>{record.checkInTime || "-"}</TableCell>
                        <TableCell>{record.checkOutTime || "-"}</TableCell>
                        <TableCell className="font-semibold">
                          {record.totalHours > 0
                            ? `${record.totalHours} hrs`
                            : "-"}
                        </TableCell>
                        <TableCell>{getStatusBadge(record.status)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {record.remarks}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chart" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Working Hours</CardTitle>
                <CardDescription>
                  Your daily working hours for this week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={attendanceData.weeklyTrend}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-muted"
                      />
                      <XAxis dataKey="day" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar
                        dataKey="hours"
                        fill="hsl(var(--primary))"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </EmployeePortalLayout>
  );
}
