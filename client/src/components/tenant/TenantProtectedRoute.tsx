"use client";


import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTenantAuth } from "@/providers/tenant-auth-provider";


// 🔧 DEVELOPMENT MODE - Set to false for production
const DISABLE_AUTH_FOR_DEVELOPMENT = true;


interface TenantProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[]; // Optional role restriction
  redirectTo?: string; // Custom redirect path
  requireAuth?: boolean; // If false, just passes children through
}


/**
 * TenantProtectedRoute - Protects tenant routes based on authentication and roles
 *
 * Features:
 * - Requires tenant authentication
 * - Optional role-based access control
 * - Loading state during auth check
 * - Automatic redirect to login
 *
 * @example
 * // Require any authenticated user
 * <TenantProtectedRoute>
 *   <Dashboard />
 * </TenantProtectedRoute>
 *
 * @example
 * // Require specific role
 * <TenantProtectedRoute allowedRoles={['manager', 'hr-admin']}>
 *   <EmployeeManagement />
 * </TenantProtectedRoute>
 */
export function TenantProtectedRoute({
  children,
  allowedRoles = [],
  redirectTo = "/login",
  requireAuth = true,
}: TenantProtectedRouteProps) {
  const { isAuthenticated, isLoading, isInitialized, userRole } =
    useTenantAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);


  useEffect(() => {
    // 🔧 DEVELOPMENT MODE: Bypass all auth checks
    if (DISABLE_AUTH_FOR_DEVELOPMENT) {
      setIsChecking(false);
      return;
    }


    // Wait for auth to initialize
    if (!isInitialized) {
      return;
    }


    // If auth not required, show children
    if (!requireAuth) {
      setIsChecking(false);
      return;
    }


    // Check authentication
    if (!isAuthenticated) {
      router.push(redirectTo);
      return;
    }


    // Check role-based access if roles specified
    if (allowedRoles.length > 0 && userRole) {
      const hasAccess = allowedRoles.some(
        (role) => role.toLowerCase() === userRole.toLowerCase()
      );


      if (!hasAccess) {
        // Redirect to unauthorized page or user's default dashboard
        router.push("/unauthorized");
        return;
      }
    }


    setIsChecking(false);
  }, [
    isAuthenticated,
    isInitialized,
    userRole,
    allowedRoles,
    redirectTo,
    router,
    requireAuth,
  ]);


  // 🔧 DEVELOPMENT MODE: Skip loading and return children immediately
  if (DISABLE_AUTH_FOR_DEVELOPMENT) {
    return <>{children}</>;
  }


  // Show loading state
  if (isLoading || isChecking || !isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }


  // Show children if all checks passed
  if (
    !requireAuth ||
    (isAuthenticated &&
      (allowedRoles.length === 0 ||
        allowedRoles.some(
          (role) => role.toLowerCase() === userRole?.toLowerCase()
        )))
  ) {
    return <>{children}</>;
  }


  // Default: show nothing (redirecting)
  return null;
}


/**
 * Higher-order component version for easier use
 *
 * @example
 * const ProtectedDashboard = withTenantAuth(Dashboard, {
 *   allowedRoles: ['employee', 'manager']
 * });
 */
export function withTenantAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<TenantProtectedRouteProps, "children">
) {
  return function ProtectedComponent(props: P) {
    return (
      <TenantProtectedRoute {...options}>
        <Component {...props} />
      </TenantProtectedRoute>
    );
  };
}



