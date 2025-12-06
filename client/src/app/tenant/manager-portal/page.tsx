"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { TenantProtectedRoute } from "@/components/tenant/TenantProtectedRoute";
import { Loader2 } from "lucide-react";

function ManagerPortalRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/tenant/manager-portal/dashboard");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

export default function ManagerPortalPage() {
  return (
    <TenantProtectedRoute allowedRoles={["manager"]}>
      <ManagerPortalRedirect />
    </TenantProtectedRoute>
  );
}
