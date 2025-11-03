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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Download,
  TrendingUp,
  Calendar,
  DollarSign,
  Eye,
} from "lucide-react";
import payslipsData from "@/data/tenant/payslips.json";
import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function PayslipsPage() {
  const [selectedPayslip, setSelectedPayslip] = useState<any>(null);

  const latestPayslip = payslipsData[0];

  const chartData = payslipsData
    .slice(0, 6)
    .reverse()
    .map((p) => ({
      month: p.month.split(" ")[0].substring(0, 3),
      salary: p.netSalary,
    }));

  return (
    <EmployeePortalLayout>
      <div className="space-y-6">
        {/* Current Payslip Highlight */}
        <Card className="border-2 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <FileText className="h-6 w-6 text-blue-600" />
                  Latest Payslip
                </CardTitle>
                <CardDescription className="text-base mt-1">
                  {latestPayslip.month}
                </CardDescription>
              </div>
              <Badge className="bg-green-500 text-white">
                {latestPayslip.status === "paid" ? "Paid" : "Processing"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/70 dark:bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-white/50 dark:border-white/10">
                    <p className="text-sm text-blue-700 dark:text-blue-400 mb-1">
                      Gross Earnings
                    </p>
                    <p className="text-3xl font-bold text-blue-900 dark:text-blue-300">
                      ₹{latestPayslip.earnings.total.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-white/70 dark:bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-white/50 dark:border-white/10">
                    <p className="text-sm text-red-700 dark:text-red-400 mb-1">
                      Total Deductions
                    </p>
                    <p className="text-3xl font-bold text-red-900 dark:text-red-300">
                      ₹{latestPayslip.deductions.total.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 mb-2">Net Salary</p>
                      <p className="text-5xl font-bold">
                        ₹{latestPayslip.netSalary.toLocaleString()}
                      </p>
                      <p className="text-green-100 mt-3 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Paid on{" "}
                        {new Date(latestPayslip.payDate).toLocaleDateString(
                          "en-US",
                          { month: "long", day: "numeric", year: "numeric" }
                        )}
                      </p>
                    </div>
                    <TrendingUp className="h-16 w-16 text-green-200 opacity-50" />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                        onClick={() => setSelectedPayslip(latestPayslip)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Payslip Details</DialogTitle>
                        <DialogDescription>
                          {selectedPayslip?.month}
                        </DialogDescription>
                      </DialogHeader>
                      {selectedPayslip && (
                        <div className="space-y-6">
                          <div className="bg-muted rounded-lg p-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">
                                  Pay Period
                                </p>
                                <p className="font-semibold">
                                  {selectedPayslip.month}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">
                                  Pay Date
                                </p>
                                <p className="font-semibold">
                                  {new Date(
                                    selectedPayslip.payDate
                                  ).toLocaleDateString("en-US", {
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">
                                  Working Days
                                </p>
                                <p className="font-semibold">
                                  {selectedPayslip.workingDays}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">
                                  Present Days
                                </p>
                                <p className="font-semibold">
                                  {selectedPayslip.presentDays}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-3 text-green-700 dark:text-green-400">
                              Earnings
                            </h4>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Basic Salary</span>
                                <span className="font-semibold">
                                  ₹
                                  {selectedPayslip.earnings.basicSalary.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>HRA</span>
                                <span className="font-semibold">
                                  ₹
                                  {selectedPayslip.earnings.hra.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Conveyance Allowance</span>
                                <span className="font-semibold">
                                  ₹
                                  {selectedPayslip.earnings.conveyanceAllowance.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Special Allowance</span>
                                <span className="font-semibold">
                                  ₹
                                  {selectedPayslip.earnings.specialAllowance.toLocaleString()}
                                </span>
                              </div>
                              {selectedPayslip.earnings.performanceBonus >
                                0 && (
                                <div className="flex justify-between text-sm">
                                  <span>Performance Bonus</span>
                                  <span className="font-semibold text-green-600">
                                    ₹
                                    {selectedPayslip.earnings.performanceBonus.toLocaleString()}
                                  </span>
                                </div>
                              )}
                              <Separator />
                              <div className="flex justify-between font-bold text-green-700 dark:text-green-400">
                                <span>Total Earnings</span>
                                <span>
                                  ₹
                                  {selectedPayslip.earnings.total.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-3 text-red-700 dark:text-red-400">
                              Deductions
                            </h4>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Provident Fund</span>
                                <span className="font-semibold">
                                  ₹
                                  {selectedPayslip.deductions.providentFund.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Professional Tax</span>
                                <span className="font-semibold">
                                  ₹
                                  {selectedPayslip.deductions.professionalTax.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Income Tax</span>
                                <span className="font-semibold">
                                  ₹
                                  {selectedPayslip.deductions.incomeTax.toLocaleString()}
                                </span>
                              </div>
                              <Separator />
                              <div className="flex justify-between font-bold text-red-700 dark:text-red-400">
                                <span>Total Deductions</span>
                                <span>
                                  ₹
                                  {selectedPayslip.deductions.total.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-4 text-white">
                            <div className="flex justify-between items-center">
                              <span className="text-lg font-semibold">
                                Net Salary
                              </span>
                              <span className="text-3xl font-bold">
                                ₹{selectedPayslip.netSalary.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>

                  <Button variant="outline" className="flex-1">
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                </div>
              </div>

              <div className="bg-white/70 dark:bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-white/50 dark:border-white/10">
                <h4 className="text-sm font-semibold text-muted-foreground mb-4">
                  Attendance
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Working Days</span>
                    <Badge variant="outline">{latestPayslip.workingDays}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Present Days</span>
                    <Badge className="bg-green-500">
                      {latestPayslip.presentDays}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Leave Days</span>
                    <Badge className="bg-blue-500">
                      {latestPayslip.leaveDays}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">LOP</span>
                    <Badge variant="outline">{latestPayslip.lop}</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Salary Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Salary Trend</CardTitle>
            <CardDescription>
              Your net salary over the last 6 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                  />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [
                      `₹${value.toLocaleString()}`,
                      "Net Salary",
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="salary"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--primary))", r: 6 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Payslip History */}
        <Card>
          <CardHeader>
            <CardTitle>Payslip History</CardTitle>
            <CardDescription>
              View and download your previous payslips
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Pay Date</TableHead>
                  <TableHead>Gross Earnings</TableHead>
                  <TableHead>Deductions</TableHead>
                  <TableHead>Net Salary</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payslipsData.map((payslip) => (
                  <TableRow key={payslip.id}>
                    <TableCell className="font-medium">
                      {payslip.month}
                    </TableCell>
                    <TableCell>
                      {new Date(payslip.payDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="font-semibold text-green-600 dark:text-green-400">
                      ₹{payslip.earnings.total.toLocaleString()}
                    </TableCell>
                    <TableCell className="font-semibold text-red-600 dark:text-red-400">
                      ₹{payslip.deductions.total.toLocaleString()}
                    </TableCell>
                    <TableCell className="font-bold">
                      ₹{payslip.netSalary.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-500">Paid</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedPayslip(payslip)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                        </Dialog>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
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
