/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import { TextEffect } from "@/components/ui/text-effect";
import { AnimatedGroup } from "@/components/ui/animated-group";

const transitionVariants = {
  item: {
    hidden: {
      opacity: 0,
      filter: "blur(12px)",
      y: 12,
    },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: {
        type: "spring",
        bounce: 0.3,
        duration: 1.5,
      },
    },
  },
};

export const PricingHero = () => {
  return (
    <section className="relative overflow-hidden pt-24 md:pt-32">
      {/* Background Effects */}
      <div
        aria-hidden
        className="absolute inset-0 isolate hidden opacity-65 lg:block"
      >
        <div className="absolute left-0 top-0 h-[800px] w-[560px] -translate-y-[350px] -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(250,100%,85%,.08)_0,hsla(250,100%,55%,.02)_50%,hsla(250,100%,45%,0)_80%)]" />
        <div className="absolute right-0 top-0 h-[800px] w-[560px] -translate-y-[350px] rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(280,100%,85%,.08)_0,hsla(280,100%,55%,.02)_50%,hsla(280,100%,45%,0)_80%)]" />
      </div>

      <div
        aria-hidden
        className="absolute inset-0 -z-10 size-full bg-gradient-to-b from-background via-primary/5 to-background"
      />

      <div className="mx-auto max-w-7xl px-6 pb-12">
        <div className="text-center">
          {/* Badge */}
          <AnimatedGroup variants={transitionVariants}>
            <Badge variant="outline" className="mb-6 px-4 py-1.5">
              <Sparkles className="mr-2 h-3.5 w-3.5 text-primary" />
              Simple, Transparent Pricing
            </Badge>
          </AnimatedGroup>

          {/* Main Heading */}
          <TextEffect
            preset="fade-in-blur"
            speedSegment={0.3}
            as="h1"
            className="mx-auto mt-4 max-w-5xl text-balance text-5xl font-bold md:text-7xl lg:mt-4 xl:text-[5.5rem] leading-[1.1]"
          >
            Choose the{" "}
            <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Perfect Plan
            </span>{" "}
            for Your Team
          </TextEffect>

          {/* Subheading */}
          <TextEffect
            per="line"
            preset="fade-in-blur"
            speedSegment={0.3}
            delay={0.5}
            as="p"
            className="mx-auto mt-6 max-w-3xl text-balance text-lg text-muted-foreground md:text-xl"
          >
            All features included in every plan. Choose the duration that works
            best for your business and unlock unlimited potential.
          </TextEffect>
        </div>
      </div>
    </section>
  );
};
