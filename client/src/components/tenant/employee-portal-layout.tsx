"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Clock,
  Calendar,
  FileText,
  User,
  Megaphone,
  ScrollText,
  Palmtree,
  HeadphonesIcon,
  Users,
  Menu,
  X,
  LogOut,
  Sun,
  Moon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";

const navigation = [
  {
    name: "Dashboard",
    href: "/tenant/employee-portal/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Attendance",
    href: "/tenant/employee-portal/attendance",
    icon: Clock,
  },
  { name: "Leaves", href: "/tenant/employee-portal/leaves", icon: Calendar },
  {
    name: "Payslips",
    href: "/tenant/employee-portal/payslips",
    icon: FileText,
  },
  { name: "Profile", href: "/tenant/employee-portal/profile", icon: User },
  {
    name: "Announcements",
    href: "/tenant/employee-portal/announcements",
    icon: Megaphone,
  },
  {
    name: "Policies",
    href: "/tenant/employee-portal/policies",
    icon: ScrollText,
  },
  {
    name: "Holidays",
    href: "/tenant/employee-portal/holidays",
    icon: Palmtree,
  },
  {
    name: "Support",
    href: "/tenant/employee-portal/support",
    icon: HeadphonesIcon,
  },
  { name: "Team", href: "/tenant/employee-portal/team", icon: Users },
];

// Mock employee data
const employeeData = {
  name: "Priya Sharma",
  email: "priya.sharma@workzone.tech",
  employeeId: "WZ001",
  designation: "Senior Software Engineer",
  avatar: "/avatars/priya.jpg",
};

export function EmployeePortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-72 bg-card border-r border-border transition-transform duration-300 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-employee-gradient flex items-center justify-center text-foreground font-bold shadow-employee">
                WZ
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">WorkZone</h2>
                <p className="text-xs text-muted-foreground">Employee Portal</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-employee-gradient text-foreground shadow-employee"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-5 w-5 flex-shrink-0",
                      isActive && "animate-pulse"
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-border">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-muted transition-colors">
                  <Avatar className="h-10 w-10 border-2 border-employee">
                    <AvatarImage
                      src={employeeData.avatar}
                      alt={employeeData.name}
                    />
                    <AvatarFallback className="bg-employee-gradient text-white font-semibold">
                      {employeeData.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold text-foreground">
                      {employeeData.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {employeeData.employeeId}
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{employeeData.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {employeeData.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                  {theme === "dark" ? (
                    <>
                      <Sun className="mr-2 h-4 w-4" />
                      <span>Light Mode</span>
                    </>
                  ) : (
                    <>
                      <Moon className="mr-2 h-4 w-4" />
                      <span>Dark Mode</span>
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600 dark:text-red-400">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Mobile header */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 px-4 py-3 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-employee-gradient flex items-center justify-center text-white font-bold text-sm shadow-md">
              WZ
            </div>
            <span className="font-bold text-foreground">WorkZone</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </header>

        {/* Desktop header with theme toggle */}
        <header className="hidden lg:flex sticky top-0 z-30 items-center justify-between border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 px-8 py-4">
          <div>
            <h1 className="text-2xl font-bold text-employee">
              {navigation.find((item) => item.href === pathname)?.name ||
                "Dashboard"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Welcome back, {employeeData.name.split(" ")[0]}!
            </p>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="rounded-xl"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
