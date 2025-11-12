"use client";

import React from "react";
import { HeroHeader } from "@/components/(platform)/plaform-landing/header";
import { PricingHero } from "@/components/(platform)/pricing/pricing-hero";
import { PricingCards } from "@/components/(platform)/pricing/pricing-cards";
import { PricingFAQ } from "@/components/(platform)/pricing/pricing-faq";
import { PlatformCTA } from "@/components/(platform)/plaform-landing/platform-cta";
import { PlatformFooter } from "@/components/(platform)/plaform-landing/platform-footer";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Navigation */}
      <HeroHeader />

      {/* Main Content */}
      <main className="relative">
        {/* Hero Section */}
        <PricingHero />

        {/* Pricing Cards */}
        <PricingCards />

        {/* FAQ Section */}
        <PricingFAQ />

        {/* Call to Action */}
        <PlatformCTA />
      </main>

      {/* Footer */}
      <PlatformFooter />
    </div>
  );
}
