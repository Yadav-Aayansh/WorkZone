"use client";

import { EmployeePortalLayout } from "@/components/tenant/employee-portal-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Palmtree, Star } from "lucide-react";
import holidaysData from "@/data/tenant/holidays.json";

export default function HolidaysPage() {
  const upcomingHolidays = holidaysData.filter(
    (holiday) => new Date(holiday.date) >= new Date()
  );
  const pastHolidays = holidaysData.filter(
    (holiday) => new Date(holiday.date) < new Date()
  );

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      national: "bg-blue-500",
      religious: "bg-purple-500",
    };
    return colors[type] || "bg-gray-500";
  };

  const getMonthHolidays = (month: number) => {
    return holidaysData.filter(
      (holiday) => new Date(holiday.date).getMonth() === month
    );
  };

  return (
    <EmployeePortalLayout>
      <div className="space-y-6">
        {/* Header */}
        <Card className="border-2 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-orange-950/20 dark:via-amber-950/20 dark:to-yellow-950/20 border-orange-200 dark:border-orange-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-orange-600 to-amber-600 rounded-2xl shadow-lg">
                <Palmtree className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Company Holidays
                </h1>
                <p className="text-muted-foreground mt-1">
                  {holidaysData.length} holidays in 2025-2026
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200 dark:border-blue-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-400">
                Total Holidays
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-blue-900 dark:text-blue-300">
                  {holidaysData.length}
                </span>
                <span className="text-lg text-blue-600 dark:text-blue-500">
                  days
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-400">
                Upcoming Holidays
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-purple-900 dark:text-purple-300">
                  {upcomingHolidays.length}
                </span>
                <span className="text-lg text-purple-600 dark:text-purple-500">
                  days
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-700 dark:text-green-400">
                Optional Holidays
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-green-900 dark:text-green-300">
                  {holidaysData.filter((h) => h.isOptional).length}
                </span>
                <span className="text-lg text-green-600 dark:text-green-500">
                  days
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Holidays */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Upcoming Holidays
            </CardTitle>
            <CardDescription>
              Plan your time off with these upcoming holidays
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingHolidays.map((holiday) => (
                <div
                  key={holiday.id}
                  className="flex items-center gap-4 p-4 rounded-xl border-2 border-border hover:bg-muted/50 transition-all duration-200 hover:shadow-md"
                >
                  <div className="flex flex-col items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl text-white shadow-lg">
                    <span className="text-xs font-medium uppercase">
                      {new Date(holiday.date).toLocaleDateString("en-US", {
                        month: "short",
                      })}
                    </span>
                    <span className="text-3xl font-bold">
                      {new Date(holiday.date).getDate()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h4 className="font-bold text-lg text-foreground">
                          {holiday.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {holiday.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {holiday.isOptional && (
                          <Badge
                            variant="outline"
                            className="bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400"
                          >
                            Optional
                          </Badge>
                        )}
                        <Badge className={getTypeColor(holiday.type)}>
                          {holiday.type}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {holiday.day}
                      </span>
                      <span>•</span>
                      <span>
                        {new Date(holiday.date).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* All Holidays - Calendar View */}
        <Card>
          <CardHeader>
            <CardTitle>Complete Holiday List</CardTitle>
            <CardDescription>All company holidays for the year</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {holidaysData.map((holiday) => {
                const isPast = new Date(holiday.date) < new Date();
                return (
                  <div
                    key={holiday.id}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      isPast
                        ? "border-muted bg-muted/20 opacity-60"
                        : "border-border hover:shadow-md hover:scale-[1.02]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex flex-col items-center justify-center w-16 h-16 rounded-lg text-white shadow-md ${
                          isPast
                            ? "bg-gray-400"
                            : "bg-gradient-to-br from-orange-500 to-amber-600"
                        }`}
                      >
                        <span className="text-xs font-medium uppercase">
                          {new Date(holiday.date).toLocaleDateString("en-US", {
                            month: "short",
                          })}
                        </span>
                        <span className="text-2xl font-bold">
                          {new Date(holiday.date).getDate()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground mb-1 truncate">
                          {holiday.name}
                        </h4>
                        <p className="text-xs text-muted-foreground mb-2">
                          {holiday.day}
                        </p>
                        <div className="flex items-center gap-2">
                          {holiday.isOptional && (
                            <Badge
                              variant="outline"
                              className="text-xs bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400"
                            >
                              Optional
                            </Badge>
                          )}
                          <Badge
                            className={`text-xs ${getTypeColor(holiday.type)}`}
                          >
                            {holiday.type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </EmployeePortalLayout>
  );
}
