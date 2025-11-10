"use client";

import React from "react";
import { HeroHeader } from "@/components/(platform)/plaform-landing/header";
import { FeaturesHero } from "@/components/(platform)/features/features-hero";
import { AIFeatures } from "@/components/(platform)/features/ai-features";
import { CoreFeatures } from "@/components/(platform)/features/core-features";
import { FeaturesBenefits } from "@/components/(platform)/features/features-benefits";
import { PlatformCTA } from "@/components/(platform)/plaform-landing/platform-cta";
import { PlatformFooter } from "@/components/(platform)/plaform-landing/platform-footer";

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Navigation */}
      <HeroHeader />

      {/* Main Content */}
      <main className="relative">
        {/* Hero Section */}
        <FeaturesHero />

        {/* AI Features Section */}
        <AIFeatures />

        {/* Core Features Section */}
        <CoreFeatures />

        {/* Benefits Section */}
        <FeaturesBenefits />

        {/* Call to Action */}
        <PlatformCTA />
      </main>

      {/* Footer */}
      <PlatformFooter />
    </div>
  );
}
