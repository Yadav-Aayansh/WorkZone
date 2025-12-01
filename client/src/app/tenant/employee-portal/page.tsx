"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { TenantProtectedRoute } from "@/components/tenant/TenantProtectedRoute";
import { Loader2 } from "lucide-react";

function EmployeePortalRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/tenant/employee-portal/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Redirecting to dashboard...</p>
      </div>
    </div>
  );
}

export default function EmployeePortalPage() {
  return (
    <TenantProtectedRoute allowedRoles={["employee"]}>
      <EmployeePortalRedirect />
    </TenantProtectedRoute>
  );
}
