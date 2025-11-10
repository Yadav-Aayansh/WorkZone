import React from "react";
import HeroSection from "@/components/(platform)/plaform-landing/hero-section";
import { HeroHeader } from "@/components/(platform)/plaform-landing/header";
import FeaturesSection from "@/components/features-8";
import Features from "@/components/features-2";
import AIFeaturesSection from "@/components/ai-features-section";
import PricingPreview from "@/components/pricing-preview";
import { PlatformFooter } from "@/components/(platform)/plaform-landing/platform-footer";

const Page = () => {
  return (
    <div>
      <HeroSection />
      <HeroHeader />
      <Features />

      {/* AI Features Section with Lighting Effects */}
      <AIFeaturesSection />

      {/* <FeaturesSection /> */}

      {/* Pricing Preview Section */}
      <PricingPreview />

      <PlatformFooter />
    </div>
  );
};
export default Page;
