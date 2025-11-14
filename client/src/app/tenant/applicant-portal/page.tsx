"use client";

import { useRouter } from "next/navigation";
import { TenantProtectedRoute } from "@/components/tenant/TenantProtectedRoute";
import { useTenant } from "@/providers/tenant-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Briefcase, FileText, Calendar, User } from "lucide-react";

function ApplicantPortalContent() {
  const router = useRouter();
  const { tenant } = useTenant();

  const menuItems = [
    {
      title: "Browse Jobs",
      description: "Explore open positions and find your next opportunity",
      icon: Briefcase,
      href: "/tenant/careers",
      color: "bg-blue-500",
    },
    {
      title: "My Applications",
      description: "Track the status of your job applications",
      icon: FileText,
      href: "/tenant/applicant-portal/applications",
      color: "bg-green-500",
    },
    {
      title: "Profile",
      description: "Manage your profile and preferences",
      icon: User,
      href: "/tenant/applicant-portal/profile",
      color: "bg-purple-500",
      disabled: true,
    },
    {
      title: "Interviews",
      description: "View scheduled interviews and assessments",
      icon: Calendar,
      href: "/tenant/applicant-portal/interviews",
      color: "bg-orange-500",
      disabled: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            {tenant?.logo && (
              <img
                src={tenant.logo}
                alt={tenant.brandName}
                className="h-12 object-contain"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Applicant Portal
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Welcome to {tenant?.brandName} Careers
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Your Career Hub
          </h2>
          <p className="text-muted-foreground">
            Manage your job search and applications in one place
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.title}
                className={`hover:shadow-xl transition-all ${
                  item.disabled
                    ? "opacity-60 cursor-not-allowed"
                    : "cursor-pointer hover:scale-[1.02]"
                }`}
                onClick={() => !item.disabled && router.push(item.href)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2 flex items-center gap-2">
                        {item.title}
                        {item.disabled && (
                          <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-1 rounded">
                            Coming Soon
                          </span>
                        )}
                      </CardTitle>
                      <CardDescription>{item.description}</CardDescription>
                    </div>
                    <div className={`${item.color} p-3 rounded-lg text-white`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                </CardHeader>
                {!item.disabled && (
                  <CardContent>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(item.href);
                      }}
                    >
                      Go to {item.title} →
                    </Button>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <Card className="mt-8 shadow-lg">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Get started with these common tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button onClick={() => router.push("/tenant/careers")}>
              <Briefcase className="w-4 h-4 mr-2" />
              Browse All Jobs
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                router.push("/tenant/applicant-portal/applications")
              }
            >
              <FileText className="w-4 h-4 mr-2" />
              View My Applications
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default function ApplicantPortalPage() {
  return (
    <TenantProtectedRoute allowedRoles={["applicant", "employee"]}>
      <ApplicantPortalContent />
    </TenantProtectedRoute>
  );
}
