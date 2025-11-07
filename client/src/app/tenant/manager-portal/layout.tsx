"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  BarChart3,
  FileText,
  MessageSquare,
  Settings,
  LogOut,
  Sun,
  Moon,
  Search,
  X,
  Menu,
  ChevronLeft,
  ChevronRight,
  Bell,
  UserCheck,
  Star,
  CreditCard,
  MessageCircle
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
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Import Chatbot component
const Chatbot = dynamic(() => import("@/components/chatbot"), { ssr: false });

const navigation = [
  {
    name: "Dashboard",
    href: "/tenant/manager-portal/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Team Members",
    href: "/tenant/manager-portal/team",
    icon: Users,
  },
  {
    name: "Leave Management",
    href: "/tenant/manager-portal/leave",
    icon: CalendarCheck,
  },
  {
    name: "Performance Reviews",
    href: "/tenant/manager-portal/performance",
    icon: BarChart3,
  },
  {
    name: "Expense Approvals",
    href: "/tenant/manager-portal/expenses",
    icon: CreditCard,
  },
  {
    name: "Team Feedback",
    href: "/tenant/manager-portal/feedback",
    icon: MessageCircle,
  },
];

// Mock manager data
const managerData = {
  name: "Alex Johnson",
  email: "alex.johnson@example.com",
  teamSize: 8,
  pendingApprovals: 3,
  avatar: "/avatars/alex.jpg",
};

export default function ManagerPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatbotOpen, setChatbotOpen] = useState(false);

  // Fix for hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Chatbot Dialog */}
      <Dialog open={chatbotOpen} onOpenChange={setChatbotOpen}>
        <DialogContent className="sm:max-w-[425px] max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-primary">Manager Assistant</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-4 py-4">
            {/* Chat messages will go here */}
            <div className="text-center text-muted-foreground text-sm">
              How can I assist you with your management tasks today?
            </div>
          </div>
          <form className="p-4 pt-0">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Type your message..."
                className="flex-1"
              />
              <Button type="submit" size="sm">
                Send
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 bg-card/80 backdrop-blur-md ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between p-4 h-14">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary-gradient flex items-center justify-center text-primary-foreground font-bold text-sm shadow-md flex-shrink-0">
                M
              </div>
              {!isCollapsed && <span className="font-bold text-foreground">WorkZone</span>}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group",
                    isActive
                      ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-white"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground dark:hover:bg-muted/50"
                  )}
                >
                  <div className={cn(
                    "p-1.5 rounded-lg transition-colors flex-shrink-0",
                    isActive 
                      ? "bg-primary/10 text-primary dark:bg-primary/30"
                      : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                  )}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  {!isCollapsed && (
                    <>
                      <span className={cn(
                        isActive ? "font-semibold" : "font-medium",
                        "whitespace-nowrap"
                      )}>
                        {item.name}
                      </span>
                      {item.name === "Leave Management" && managerData.pendingApprovals > 0 && (
                        <span className="ml-auto bg-primary text-primary-foreground text-xs font-medium px-2 py-0.5 rounded-full">
                          {managerData.pendingApprovals}
                        </span>
                      )}
                      {isActive && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                      )}
                    </>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Bottom section */}
          <div className="p-2 mt-auto">
            <div className="space-y-1">
              <Link
                href="/tenant/manager-portal/settings"
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  pathname === "/tenant/manager-portal/settings"
                    ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-white"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground dark:hover:bg-muted/50"
                )}
              >
                <div className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  pathname === "/tenant/manager-portal/settings"
                    ? "bg-primary/10 text-primary dark:bg-primary/30 dark:text-white"
                    : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary dark:bg-muted/50"
                )}>
                  <Settings className="h-5 w-5" />
                </div>
                {!isCollapsed && <span>Settings</span>}
              </Link>
              <button
                onClick={() => {}}
                className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <div className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-foreground dark:group-hover:bg-primary/20"
                )}>
                  <LogOut className="h-5 w-5" />
                </div>
                {!isCollapsed && <span>Logout</span>}
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className={`transition-all duration-300 bg-gradient-to-br from-background via-background to-muted/10 ${isCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
        {/* Mobile header */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 bg-card/80 backdrop-blur-sm px-4 py-3 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-gradient flex items-center justify-center text-primary-foreground font-bold text-sm shadow-md">
              M
            </div>
            <span className="font-bold text-foreground">Manager Portal</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="text-muted-foreground hover:text-foreground"
              title={mounted ? `Switch to ${theme === "dark" ? "light" : "dark"} mode` : "Toggle theme"}
            >
              {mounted ? (
                theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )
              ) : (
                <div className="h-5 w-5" />
              )}
            </Button>
          </div>
        </header>

        {/* Desktop header */}
        <header className="hidden lg:flex sticky top-0 z-30 items-center justify-between bg-card/80 backdrop-blur-sm px-6 py-3">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold">
              {navigation.find((item) => pathname.startsWith(item.href))?.name ||
                "Dashboard"}
            </h1>
            <span className="text-sm text-muted-foreground">•</span>
            <span className="text-sm text-muted-foreground">Manager Dashboard</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search team, leaves, expenses..."
                className="pl-10 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              className="relative text-muted-foreground hover:text-foreground"
              title="Notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-destructive text-[10px] text-destructive-foreground flex items-center justify-center">
                2
              </span>
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setChatbotOpen(true)}
              className="relative text-muted-foreground hover:text-foreground"
              title="Chat with Assistant"
            >
              <MessageSquare className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary text-[10px] text-primary-foreground flex items-center justify-center">
                1
              </span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="text-muted-foreground hover:text-foreground"
              title={mounted ? `Switch to ${theme === "dark" ? "light" : "dark"} mode` : "Toggle theme"}
            >
              {mounted ? (
                theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )
              ) : (
                <div className="h-5 w-5" />
              )}
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-2 hover:bg-muted/50 group">
                  <Avatar className="h-8 w-8 border border-muted group-hover:border-primary/50 transition-colors">
                    <AvatarImage src={managerData.avatar} alt={managerData.name} />
                    <AvatarFallback className="bg-primary-gradient text-primary-foreground font-semibold dark:text-white">
                      {managerData.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:flex flex-col items-start">
                    <span className="text-sm font-medium text-foreground">
                      {managerData.name.split(" ")[0]}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {managerData.email.split("@")[0]}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{managerData.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {managerData.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/tenant/manager-portal/profile" className="w-full cursor-pointer">
                    <UserCheck className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/tenant/manager-portal/settings" className="w-full cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8 bg-transparent">{children}</main>
      </div>
    </div>
  );
}
