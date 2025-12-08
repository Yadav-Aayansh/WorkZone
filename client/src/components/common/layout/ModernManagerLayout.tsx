"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  Search,
  User,
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
import { Badge } from "@/components/ui/badge";

const navItems = [
  {
    title: "Dashboard",
    href: "/tenant/manager-portal/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Team Members",
    href: "/tenant/manager-portal/team",
    icon: Users,
  },
  {
    title: "Leave Approvals",
    href: "/tenant/manager-portal/leaves",
    icon: CheckSquare,
  },
  {
    title: "Profile",
    href: "/tenant/manager-portal/profile",
    icon: User,
  },
];

export function ModernManagerLayout({ children }: { children: ReactNode }) {
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
          name: "Manager",
          role: "Manager Portal",
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
                placeholder="Search team members, requests..."
                className="pl-10 bg-muted/50"
              />
            </div>
          </div>

          {/* Quick Actions & Profile */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Leave Approvals Button */}
            <Button
              size="sm"
              onClick={() => router.push("/tenant/manager-portal/leaves")}
            >
              <CheckSquare className="mr-2 h-4 w-4" />
              Leave Approvals
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
                    <AvatarImage src="/avatars/manager.jpg" />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      M
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">Manager</p>
                    <p className="text-xs text-muted-foreground">
                      ID: {userId || "---"}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => router.push("/tenant/manager-portal/profile")}
                >
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
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
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
