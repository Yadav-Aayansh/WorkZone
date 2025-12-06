"use client";

import { useTenant } from "@/providers/tenant-provider";
import { Loader } from "@/components/ui/loader";
import {
  TenantHeader,
  TenantHero,
  TenantFeatures,
  TenantBenefits,
  TenantCTA,
  TenantFooter,
} from "@/components/tenant/landing";

export default function TenantHomePage() {
  const { tenant, isLoading } = useTenant();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader />
      </div>
    );
  }

  if (!tenant) {
    return null; // Layout will handle error state
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Navigation */}
      <TenantHeader />

      {/* Main Content */}
      <main className="relative">
        {/* Hero Section */}
        <TenantHero />

        {/* Features Section */}
        <TenantFeatures />

        {/* Benefits Section */}
        <TenantBenefits />

        {/* Call to Action */}
        <TenantCTA />
      </main>

      {/* Footer */}
      <TenantFooter />
    </div>
  );
}
