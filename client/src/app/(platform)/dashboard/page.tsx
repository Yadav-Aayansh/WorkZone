"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { RequireAuth } from "@/components/auth/ProtectedRoute";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Building2,
  UserPlus,
  Moon,
  Sun,
  Users,
  TrendingUp,
  LayoutDashboard,
  Settings,
  LogOut,
  Palette,
  Bell,
  CreditCard,
  BarChart3,
  FileText,
  Calendar,
  Globe,
  Shield,
  Loader2,
  RefreshCw,
  Search,
  Briefcase,
  Crown,
  User,
} from "lucide-react";
import { LeaveTypesConfig } from "@/components/dashboard/leave-types-config";
import { PolicyDocumentsManager } from "@/components/dashboard/policy-documents-manager";
import { CustomDomainManager } from "@/components/dashboard/custom-domain-manager";
import { platformClientAPI, ClientMember } from "@/lib/api";
import { toast } from "sonner";

type Tab = "overview" | "team" | "settings";

// Mock tenant data - will be replaced with real API data
const mockTenantData = {
  brandName: "Acme Corporation",
  logo: null, // Will be actual logo URL from backend
  tenantId: "acme-corp",
  teamCount: 0, // Real count from backend
};

export default function DashboardPage() {
  const { logout } = useAuth();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [tenantTheme, setTenantTheme] = useState({
    primaryColor: "#6366f1",
    secondaryColor: "#8b5cf6",
  });

  // Members state
  const [members, setMembers] = useState<ClientMember[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [membersSearchQuery, setMembersSearchQuery] = useState("");

  // Load members on initial load and when team tab is active
  useEffect(() => {
    loadMembers();
  }, []);

  useEffect(() => {
    if (activeTab === "team" && members.length === 0) {
      loadMembers();
    }
  }, [activeTab]);

  const loadMembers = async () => {
    setIsLoadingMembers(true);
    try {
      const data = await platformClientAPI.getMembers();
      setMembers(data);
    } catch (err) {
      console.error("Failed to load members:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to load members"
      );
    } finally {
      setIsLoadingMembers(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "manager":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300";
      case "employee":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
      case "recruiter":
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
      case "applicant":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case "manager":
        return <Crown className="h-3 w-3 mr-1" />;
      case "recruiter":
        return <Briefcase className="h-3 w-3 mr-1" />;
      default:
        return <User className="h-3 w-3 mr-1" />;
    }
  };

  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(membersSearchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(membersSearchQuery.toLowerCase()) ||
      member.role.toLowerCase().includes(membersSearchQuery.toLowerCase())
  );

  const handleLogout = async () => {
    await logout();
  };

  const handleInviteEmployee = () => {
    router.push("/invite");
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleColorChange = (type: "primary" | "secondary", color: string) => {
    setTenantTheme((prev) => ({
      ...prev,
      [type === "primary" ? "primaryColor" : "secondaryColor"]: color,
    }));
  };

  // Sidebar navigation items
  const navItems = [
    { id: "overview" as Tab, label: "Overview", icon: LayoutDashboard },
    { id: "team" as Tab, label: "Team", icon: Users },
    { id: "settings" as Tab, label: "Settings", icon: Settings },
  ];

  return (
    <RequireAuth>
      <div className="flex h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-900 dark:via-[#1a0b2e] dark:to-gray-900 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-r border-gray-200 dark:border-gray-700 flex flex-col">
          {/* Logo & Brand */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              {mockTenantData.logo ? (
                <img
                  src={mockTenantData.logo}
                  alt={mockTenantData.brandName}
                  className="w-10 h-10 rounded-lg object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
              )}
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white">
                  {mockTenantData.brandName}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {mockTenantData.tenantId}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 dark:hover:bg-gray-800"
              onClick={toggleTheme}
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
              <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {/* Header */}
          <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 px-8 py-4 sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {activeTab === "overview"
                    ? "Dashboard Overview"
                    : activeTab === "team"
                    ? "Team Management"
                    : "Settings"}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {activeTab === "overview"
                    ? "Welcome back! Here's your workspace overview"
                    : activeTab === "team"
                    ? "Manage your team members and invitations"
                    : "Customize your workspace settings"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </Button>
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <Logo className="w-6" />
                  <span className="text-sm font-medium dark:text-white">
                    WorkZone
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="border-none shadow-lg hover:shadow-xl transition-shadow dark:bg-gray-800">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                            Team Members
                          </p>
                          <p className="text-3xl font-bold dark:text-white">
                            {members.length}
                          </p>
                        </div>
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                          <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-none shadow-lg hover:shadow-xl transition-shadow dark:bg-gray-800">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                            Active Projects
                          </p>
                          <p className="text-3xl font-bold dark:text-white">
                            0
                          </p>
                        </div>
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                          <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-none shadow-lg hover:shadow-xl transition-shadow dark:bg-gray-800">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                            This Month
                          </p>
                          <p className="text-3xl font-bold dark:text-white">
                            0
                          </p>
                        </div>
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                          <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-none shadow-lg hover:shadow-xl transition-shadow dark:bg-gray-800">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                            Documents
                          </p>
                          <p className="text-3xl font-bold dark:text-white">
                            0
                          </p>
                        </div>
                        <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                          <FileText className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Actions */}
                <Card className="border-none shadow-xl dark:bg-gray-800">
                  <CardHeader>
                    <CardTitle className="text-xl dark:text-white">
                      Quick Actions
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400">
                      Common tasks to get you started
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <Button
                        onClick={handleInviteEmployee}
                        className="h-24 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <UserPlus className="w-6 h-6" />
                          <span className="font-semibold">
                            Invite Team Member
                          </span>
                        </div>
                      </Button>

                      <Button
                        variant="outline"
                        className="h-24 dark:border-gray-600 dark:hover:bg-gray-700"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <CreditCard className="w-6 h-6" />
                          <span className="font-semibold">Billing & Plans</span>
                        </div>
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => setActiveTab("settings")}
                        className="h-24 dark:border-gray-600 dark:hover:bg-gray-700"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <Settings className="w-6 h-6" />
                          <span className="font-semibold">
                            Workspace Settings
                          </span>
                        </div>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="border-none shadow-xl dark:bg-gray-800">
                  <CardHeader>
                    <CardTitle className="text-xl dark:text-white">
                      Recent Activity
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400">
                      Latest updates from your workspace
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                      <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No recent activity to display</p>
                      <p className="text-sm">Start by inviting team members</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "team" && (
              <div className="space-y-6">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="border-none shadow-lg dark:bg-gray-800">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                          <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold dark:text-white">
                            {members.length}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Total Members
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-none shadow-lg dark:bg-gray-800">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                          <Crown className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold dark:text-white">
                            {
                              members.filter(
                                (m) => m.role.toLowerCase() === "manager"
                              ).length
                            }
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Managers
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-none shadow-lg dark:bg-gray-800">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                          <Briefcase className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold dark:text-white">
                            {
                              members.filter(
                                (m) => m.role.toLowerCase() === "recruiter"
                              ).length
                            }
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Recruiters
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-none shadow-lg dark:bg-gray-800">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                          <User className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold dark:text-white">
                            {
                              members.filter(
                                (m) => m.role.toLowerCase() === "employee"
                              ).length
                            }
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Employees
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Members List */}
                <Card className="border-none shadow-xl dark:bg-gray-800">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <CardTitle className="text-xl dark:text-white">
                          Team Members
                        </CardTitle>
                        <CardDescription className="dark:text-gray-400">
                          Manage your workspace members
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={loadMembers}
                          disabled={isLoadingMembers}
                          className="dark:border-gray-600"
                        >
                          <RefreshCw
                            className={`h-4 w-4 ${
                              isLoadingMembers ? "animate-spin" : ""
                            }`}
                          />
                        </Button>
                        <Button
                          onClick={handleInviteEmployee}
                          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          Invite Member
                        </Button>
                      </div>
                    </div>
                    {members.length > 0 && (
                      <div className="relative mt-4">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search by name, email, or role..."
                          value={membersSearchQuery}
                          onChange={(e) =>
                            setMembersSearchQuery(e.target.value)
                          }
                          className="pl-10 dark:bg-gray-700 dark:border-gray-600"
                        />
                      </div>
                    )}
                  </CardHeader>
                  <CardContent>
                    {isLoadingMembers ? (
                      <div className="flex items-center justify-center py-16">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : members.length === 0 ? (
                      <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                        <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium mb-2">
                          No team members yet
                        </p>
                        <p className="text-sm mb-6">
                          Invite your first team member to get started
                        </p>
                        <Button
                          onClick={handleInviteEmployee}
                          className="bg-gradient-to-r from-indigo-600 to-purple-600"
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          Send Invitation
                        </Button>
                      </div>
                    ) : filteredMembers.length === 0 ? (
                      <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                        <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium mb-2">
                          No members found
                        </p>
                        <p className="text-sm">Try a different search term</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filteredMembers.map((member, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:shadow-md transition-shadow"
                          >
                            <Avatar className="h-12 w-12">
                              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                                {getInitials(member.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold dark:text-white truncate">
                                {member.name}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                {member.email}
                              </p>
                              <Badge
                                className={`mt-1 ${getRoleBadgeColor(
                                  member.role
                                )}`}
                              >
                                {getRoleIcon(member.role)}
                                {member.role.charAt(0).toUpperCase() +
                                  member.role.slice(1)}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-6">
                {/* Settings Tabs */}
                <Tabs defaultValue="general" className="w-full">
                  <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid h-auto p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
                    <TabsTrigger
                      value="general"
                      className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm rounded-lg px-4 py-2.5 gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      <span className="hidden sm:inline">General</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="domains"
                      className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm rounded-lg px-4 py-2.5 gap-2"
                    >
                      <Globe className="w-4 h-4" />
                      <span className="hidden sm:inline">Domains</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="leave-types"
                      className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm rounded-lg px-4 py-2.5 gap-2"
                    >
                      <Calendar className="w-4 h-4" />
                      <span className="hidden sm:inline">Leave Types</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="policies"
                      className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm rounded-lg px-4 py-2.5 gap-2"
                    >
                      <Shield className="w-4 h-4" />
                      <span className="hidden sm:inline">Policies</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="theme"
                      className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm rounded-lg px-4 py-2.5 gap-2"
                    >
                      <Palette className="w-4 h-4" />
                      <span className="hidden sm:inline">Theme</span>
                    </TabsTrigger>
                  </TabsList>

                  {/* General Settings Tab */}
                  <TabsContent value="general" className="mt-6">
                    <Card className="border-none shadow-xl dark:bg-gray-800">
                      <CardHeader>
                        <CardTitle className="text-xl dark:text-white">
                          Workspace Information
                        </CardTitle>
                        <CardDescription className="dark:text-gray-400">
                          Basic details about your workspace
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label className="dark:text-gray-300">
                            Organization Name
                          </Label>
                          <Input
                            value={mockTenantData.brandName}
                            readOnly
                            className="mt-2 dark:bg-gray-700 dark:border-gray-600"
                          />
                        </div>
                        <div>
                          <Label className="dark:text-gray-300">
                            Workspace ID
                          </Label>
                          <Input
                            value={mockTenantData.tenantId}
                            readOnly
                            className="mt-2 dark:bg-gray-700 dark:border-gray-600"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Custom Domains Tab */}
                  <TabsContent value="domains" className="mt-6">
                    <CustomDomainManager />
                  </TabsContent>

                  {/* Leave Types Tab */}
                  <TabsContent value="leave-types" className="mt-6">
                    <LeaveTypesConfig />
                  </TabsContent>

                  {/* Policies Tab */}
                  <TabsContent value="policies" className="mt-6">
                    <PolicyDocumentsManager />
                  </TabsContent>

                  {/* Theme Tab */}
                  <TabsContent value="theme" className="mt-6">
                    <Card className="border-none shadow-xl dark:bg-gray-800">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-lg">
                            <Palette className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div>
                            <CardTitle className="text-xl dark:text-white">
                              Theme Customization
                            </CardTitle>
                            <CardDescription className="dark:text-gray-400">
                              Customize your tenant&apos;s color scheme
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <Label className="dark:text-gray-300">
                              Primary Color
                            </Label>
                            <div className="flex gap-3">
                              <Input
                                type="color"
                                value={tenantTheme.primaryColor}
                                onChange={(e) =>
                                  handleColorChange("primary", e.target.value)
                                }
                                className="w-16 h-16 p-1 cursor-pointer"
                              />
                              <div className="flex-1">
                                <Input
                                  type="text"
                                  value={tenantTheme.primaryColor}
                                  onChange={(e) =>
                                    handleColorChange("primary", e.target.value)
                                  }
                                  className="dark:bg-gray-700 dark:border-gray-600"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  Main brand color
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <Label className="dark:text-gray-300">
                              Secondary Color
                            </Label>
                            <div className="flex gap-3">
                              <Input
                                type="color"
                                value={tenantTheme.secondaryColor}
                                onChange={(e) =>
                                  handleColorChange("secondary", e.target.value)
                                }
                                className="w-16 h-16 p-1 cursor-pointer"
                              />
                              <div className="flex-1">
                                <Input
                                  type="text"
                                  value={tenantTheme.secondaryColor}
                                  onChange={(e) =>
                                    handleColorChange(
                                      "secondary",
                                      e.target.value
                                    )
                                  }
                                  className="dark:bg-gray-700 dark:border-gray-600"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  Accent color
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="p-6 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                          <h4 className="font-medium mb-4 dark:text-white">
                            Preview
                          </h4>
                          <div className="space-y-3">
                            <div
                              className="h-12 rounded-lg flex items-center justify-center text-white font-medium"
                              style={{
                                background: `linear-gradient(to right, ${tenantTheme.primaryColor}, ${tenantTheme.secondaryColor})`,
                              }}
                            >
                              Button Preview
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div
                                className="h-20 rounded-lg"
                                style={{
                                  backgroundColor: tenantTheme.primaryColor,
                                }}
                              />
                              <div
                                className="h-20 rounded-lg"
                                style={{
                                  backgroundColor: tenantTheme.secondaryColor,
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
                          <Button
                            variant="outline"
                            className="dark:border-gray-600"
                          >
                            Reset to Default
                          </Button>
                          <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                            Save Theme
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        </main>
      </div>
    </RequireAuth>
  );
}
