"use client";

import { TenantProtectedRoute } from "@/components/tenant/TenantProtectedRoute";
import { ModernEmployeeLayout } from "@/components/common/layout/ModernEmployeeLayout";
import { HelpdeskChat } from "@/components/ai/helpdesk-chat";

function HelpdeskContent() {
  return (
    <div className="h-[calc(100vh-4rem)]">
      <HelpdeskChat />
    </div>
  );
}

export default function HelpdeskPage() {
  return (
    <TenantProtectedRoute allowedRoles={["employee"]}>
      <ModernEmployeeLayout>
        <HelpdeskContent />
      </ModernEmployeeLayout>
    </TenantProtectedRoute>
  );
}
