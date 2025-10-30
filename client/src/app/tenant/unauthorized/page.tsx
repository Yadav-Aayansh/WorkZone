"use client";

import { useRouter } from "next/navigation";
import { useTenantAuth } from "@/providers/tenant-auth-provider";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

/**
 * Unauthorized page - Shown when user tries to access route without proper role
 */
export default function UnauthorizedPage() {
  const { userRole, redirectAfterAuth } = useTenantAuth();
  const router = useRouter();

  const handleGoToDashboard = () => {
    if (userRole) {
      redirectAfterAuth(userRole);
    } else {
      router.push("/");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center space-y-6 p-8 max-w-md">
        <div className="flex justify-center">
          <ShieldAlert className="h-24 w-24 text-destructive" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground">
            You don&apos;t have permission to access this page.
          </p>
        </div>

        {userRole && (
          <p className="text-sm text-muted-foreground">
            Your current role:{" "}
            <span className="font-semibold capitalize">{userRole}</span>
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={handleGoToDashboard}>Go to Dashboard</Button>
          <Button variant="outline" onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
