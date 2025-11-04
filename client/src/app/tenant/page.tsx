"use client";

import {
  TenantHeader,
  TenantHero,
  TenantFeatures,
  TenantBenefits,
  TenantCTA,
  TenantFooter,
} from "@/components/tenant/landing";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Navigation */}
      <TenantHeader />

      {/* Main Content */}
      <main className="relative">
        <TenantHero />
        <TenantFeatures />
        <TenantBenefits />
        <TenantCTA />
      </main>

      {/* Footer */}
      <TenantFooter />
    </div>
  );
}
