"use client";

import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { RequireAuth } from "@/components/auth/ProtectedRoute";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Building2,
  CreditCard,
  CheckCircle,
  UserPlus,
} from "lucide-react";

export default function DashboardPage() {
  const { logout, accountStatus, subscriptionStatus } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
  };

  const handleContinueOnboarding = () => {
    router.push("/signup");
  };

  const handleContinueSubscription = () => {
    // Redirect directly to payment step (step 3) in signup flow
    router.push("/signup?step=3");
  };

  const handleInviteEmployee = () => {
    router.push("/invite");
  };

  const getStatusColor = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "subscription":
        return "bg-orange-100 text-orange-800";
      case "onboarding":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSubscriptionColor = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "not_started":
        return "bg-gray-100 text-gray-800";
      case "expired":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSubscriptionLabel = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "Active";
      case "not_started":
        return "Not Started";
      case "expired":
        return "Expired";
      default:
        return "Unknown";
    }
  };

  const getAccountLabel = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "Active";
      case "subscription":
        return "Subscription Pending";
      case "onboarding":
        return "Onboarding";
      default:
        return "Pending";
    }
  };

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-3">
                <Logo className="w-8" />
                <h1 className="text-xl font-semibold">WorkZone Dashboard</h1>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-sm text-muted-foreground">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-2 ${getStatusColor(
                      accountStatus
                    )}`}
                  >
                    {getAccountLabel(accountStatus)}
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSubscriptionColor(
                      subscriptionStatus
                    )}`}
                  >
                    {getSubscriptionLabel(subscriptionStatus)}
                  </span>
                </div>
                <Button variant="outline" onClick={handleLogout} size="sm">
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="py-16">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-12 h-12 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>

                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Welcome to WorkZone!
                </h2>

                <p className="text-gray-600 text-lg">
                  Let's get your HR management system fully set up.
                </p>
              </div>

              {/* Status Cards */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="p-6 bg-white rounded-xl border shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Account Setup
                      </h3>
                      <p className="text-sm text-gray-500">
                        Company onboarding
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        accountStatus
                      )}`}
                    >
                      {accountStatus?.toLowerCase() === "onboarding"
                        ? "In Progress"
                        : accountStatus?.toLowerCase() === "active"
                        ? "Completed"
                        : accountStatus || "Not Started"}
                    </span>
                    {accountStatus?.toLowerCase() === "onboarding" && (
                      <Button
                        onClick={handleContinueOnboarding}
                        size="sm"
                        className="ml-4"
                      >
                        Continue Setup
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="p-6 bg-white rounded-xl border shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Subscription
                      </h3>
                      <p className="text-sm text-gray-500">Choose your plan</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getSubscriptionColor(
                        subscriptionStatus
                      )}`}
                    >
                      {getSubscriptionLabel(subscriptionStatus)}
                    </span>
                    {(accountStatus?.toLowerCase() === "subscription" ||
                      (accountStatus?.toLowerCase() === "active" &&
                        subscriptionStatus?.toLowerCase() !== "active")) && (
                      <Button
                        onClick={handleContinueSubscription}
                        size="sm"
                        variant="outline"
                        className="ml-4"
                      >
                        {subscriptionStatus &&
                        subscriptionStatus?.toLowerCase() !== "not_started"
                          ? "Manage Plan"
                          : "Choose Plan"}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Next Steps Section */}
              <div className="bg-white rounded-xl border shadow-sm p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  What's Next?
                </h3>

                {accountStatus?.toLowerCase() === "onboarding" && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Building2 className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900 mb-1">
                          Complete Company Onboarding
                        </h4>
                        <p className="text-sm text-blue-700 mb-3">
                          Set up your company profile, upload your logo, and
                          configure your workspace settings.
                        </p>
                        <Button
                          onClick={handleContinueOnboarding}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Continue Onboarding
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {accountStatus?.toLowerCase() === "subscription" && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <CreditCard className="w-5 h-5 text-orange-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-orange-900 mb-1">
                          Choose Your Subscription Plan
                        </h4>
                        <p className="text-sm text-orange-700 mb-3">
                          Select a plan that fits your company size and needs to
                          unlock all HR management features.
                        </p>
                        <Button
                          onClick={handleContinueSubscription}
                          className="bg-orange-600 hover:bg-orange-700"
                        >
                          View Plans
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {accountStatus?.toLowerCase() === "active" && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium text-green-900 mb-1">
                          Setup Complete!
                        </h4>
                        <p className="text-sm text-green-700 mb-3">
                          Your WorkZone account is fully configured. You can now
                          start managing your workforce.
                        </p>
                        <div className="flex gap-3 flex-wrap">
                          <Button
                            onClick={handleInviteEmployee}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <UserPlus className="w-4 h-4 mr-2" />
                            Invite Employee
                          </Button>
                          <Button variant="outline">View Features</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {!accountStatus && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Building2 className="w-5 h-5 text-gray-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">
                          Get Started
                        </h4>
                        <p className="text-sm text-gray-700 mb-3">
                          Let's set up your company profile and get you started
                          with WorkZone.
                        </p>
                        <Button onClick={handleContinueOnboarding}>
                          Start Setup
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </RequireAuth>
  );
}
