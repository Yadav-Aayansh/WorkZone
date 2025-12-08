"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  FileText,
  Inbox,
  Plus,
  Search,
  User,
  MessageSquare,
} from "lucide-react";
import { CollapsibleSidebar } from "@/components/common/layout/CollapsibleSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { useTenant } from "@/providers/tenant-provider";
import { useTenantAuth } from "@/providers/tenant-auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navItems = [
  {
    title: "Dashboard",
    href: "/tenant/recruiter-portal/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Jobs",
    href: "/tenant/recruiter-portal/jobs",
    icon: Briefcase,
  },
  {
    title: "Applications",
    href: "/tenant/recruiter-portal/applications",
    icon: Inbox,
  },
  {
    title: "Candidates",
    href: "/tenant/recruiter-portal/candidates",
    icon: Users,
  },
  {
    title: "Employee Queries",
    href: "/tenant/recruiter-portal/queries",
    icon: MessageSquare,
  },
  {
    title: "Resume Scoring",
    href: "/tenant/recruiter-portal/resume-scoring",
    icon: FileText,
  },
  {
    title: "Profile",
    href: "/tenant/recruiter-portal/profile",
    icon: User,
  },
];

export function ModernRecruiterLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { tenant } = useTenant();
  const { logout, userId } = useTenantAuth();

  const handleLogout = async () => {
    await logout();
    router.push("/tenant/login");
  };

  return (
    <SidebarProvider defaultOpen={false}>
      {/* Collapsible Sidebar */}
      <CollapsibleSidebar
        navItems={navItems}
        user={{
          name: "Recruiter",
          role: "Recruiter Portal",
          id: userId || "---",
        }}
        brandName={tenant?.brandName || "WorkZone"}
        brandLogo={tenant?.logo}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <SidebarInset>
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
          {/* Search Bar */}
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search jobs, candidates, applications..."
                className="pl-10 bg-muted/50"
              />
            </div>
          </div>

          {/* Quick Actions & Profile */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Create Job Button */}
            <Button
              size="sm"
              onClick={() =>
                router.push("/tenant/recruiter-portal/jobs/create")
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Job
            </Button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-full"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage src="/avatars/recruiter.jpg" />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      R
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">Recruiter</p>
                    <p className="text-xs text-muted-foreground">
                      ID: {userId || "---"}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() =>
                    router.push("/tenant/recruiter-portal/profile")
                  }
                >
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive"
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex flex-1 flex-col gap-4 p-6 bg-gradient-to-br from-white via-gray-50/50 to-gray-100/30 dark:from-background dark:via-background dark:to-neutral-800/30">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
