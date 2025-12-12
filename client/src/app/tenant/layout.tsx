"use client";

import { useTenant } from "@/providers/tenant-provider";
import { useEffect } from "react";
import { Loader } from "@/components/ui/loader";

export default function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { tenant, isLoading, error, isTenantRoute } = useTenant();

  useEffect(() => {
    // If not a tenant route, redirect to platform
    if (!isLoading && !isTenantRoute) {
      const platformUrl =
        process.env.NEXT_PUBLIC_PLATFORM_URL || "http://localhost:3000";
      window.location.href = platformUrl;
    }
  }, [isLoading, isTenantRoute]);

  // Update favicon based on tenant logo
  useEffect(() => {
    if (tenant?.logo) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = tenant.logo;
    }
  }, [tenant]);

  // Update document title based on tenant brand name
  useEffect(() => {
    if (tenant?.brandName) {
      document.title = tenant.brandName;
    } else {
      document.title = "WorkZone.tech"; // Fallback for tenant routes if brandName is missing
    }
  }, [tenant]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Loader className="mx-auto mb-4" />
          <p className="text-gray-600">Loading workspace...</p>
        </div>
      </div>
    );
  }

  // Error state - Tenant not found
  if (error || !tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-lg shadow-xl p-8 text-center">
            {/* Error Icon */}
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            {/* Error Message */}
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Workspace Not Found
            </h1>
            <p className="text-gray-600 mb-6">
              {error === "Tenant not found"
                ? "This workspace doesn't exist or has been removed."
                : "We couldn't load this workspace. Please try again later."}
            </p>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => {
                  const platformUrl =
                    process.env.NEXT_PUBLIC_PLATFORM_URL ||
                    "http://localhost:3000";
                  window.location.href = platformUrl;
                }}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Go to Home
              </button>
              <button
                onClick={() => {
                  const platformUrl =
                    process.env.NEXT_PUBLIC_PLATFORM_URL ||
                    "http://localhost:3000";
                  window.location.href = `${platformUrl}/signup`;
                }}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Create Your Workspace
              </button>
            </div>

            {/* Help Text */}
            <p className="text-sm text-gray-500 mt-6">
              Need help?{" "}
              <a
                href="mailto:support@workzone.tech"
                className="text-indigo-600 hover:underline"
              >
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Success state - Render tenant content with branding
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Tenant branding can be accessed via useTenant() in child components */}
      {children}
    </div>
  );
}
