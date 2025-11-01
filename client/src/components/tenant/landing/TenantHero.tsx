/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextEffect } from "@/components/ui/text-effect";
import { AnimatedGroup } from "@/components/ui/animated-group";
import { useTenant } from "@/providers/tenant-provider";

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

export const TenantHero = () => {
  const { tenant } = useTenant();

  return (
    <section className="relative overflow-hidden pt-24 md:pt-32">
      {/* Background Effects */}
      <div
        aria-hidden
        className="absolute inset-0 isolate hidden opacity-65 lg:block"
      >
        <div className="absolute left-0 top-0 h-[800px] w-[560px] -translate-y-[350px] -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(250,100%,85%,.08)_0,hsla(250,100%,55%,.02)_50%,hsla(250,100%,45%,0)_80%)]" />
        <div className="absolute left-0 top-0 h-[800px] w-60 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(250,100%,85%,.06)_0,hsla(250,100%,45%,.02)_80%,transparent_100%)] [translate:5%_-50%]" />
        <div className="absolute right-0 top-0 h-[800px] w-[560px] -translate-y-[350px] rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(280,100%,85%,.08)_0,hsla(280,100%,55%,.02)_50%,hsla(280,100%,45%,0)_80%)]" />
      </div>

      <div
        aria-hidden
        className="absolute inset-0 -z-10 size-full bg-gradient-to-b from-background via-primary/5 to-background"
      />

      <div className="mx-auto max-w-7xl px-6 pb-16">
        <div className="text-center lg:mx-auto">
          {/* Announcement Badge */}
          <AnimatedGroup variants={transitionVariants}>
            <Link
              href="#features"
              className="hover:bg-background bg-muted group mx-auto flex w-fit items-center gap-4 rounded-full border p-1 pl-4 shadow-md transition-all duration-300 dark:border-t-white/5"
            >
              <span className="flex items-center gap-2 text-sm text-foreground">
                <Sparkles className="h-4 w-4 text-primary" />
                AI-Powered HR Solutions
              </span>
              <span className="block h-4 w-0.5 border-l bg-border"></span>
              <div className="bg-background group-hover:bg-muted size-6 overflow-hidden rounded-full transition-all duration-500">
                <div className="flex w-12 -translate-x-1/2 transition-transform duration-500 ease-in-out group-hover:translate-x-0">
                  <span className="flex size-6">
                    <ArrowRight className="m-auto size-3" />
                  </span>
                  <span className="flex size-6">
                    <ArrowRight className="m-auto size-3" />
                  </span>
                </div>
              </div>
            </Link>
          </AnimatedGroup>

          {/* Main Heading */}
          <h1 className="mx-auto mt-8 max-w-5xl text-balance text-5xl font-bold md:text-7xl lg:mt-8 xl:text-[5.5rem] leading-[1.1] animate-in fade-in slide-in-from-bottom-4 duration-1000">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
              {tenant?.brandName || "Company"}
            </span>
          </h1>

          {/* Subheading */}
          <p className="mx-auto mt-6 max-w-3xl text-balance text-lg text-muted-foreground md:text-xl animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
            Transform your workplace with our comprehensive HR platform.
            Streamline recruitment, empower employees, and drive growth with
            intelligent solutions designed for modern teams.
          </p>

          {/* CTA Buttons */}
          <AnimatedGroup
            variants={{
              container: {
                visible: {
                  transition: {
                    staggerChildren: 0.05,
                    delayChildren: 0.75,
                  },
                },
              },
              ...transitionVariants,
            }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <div
              key={1}
              className="bg-foreground/10 rounded-[calc(var(--radius-xl)+0.125rem)] border p-0.5 shadow-lg"
            >
              <Button
                asChild
                size="lg"
                className="rounded-xl px-8 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                <Link href="/tenant/careers">
                  <span className="text-nowrap">Explore Careers</span>
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
            <Button
              key={2}
              asChild
              size="lg"
              variant="outline"
              className="h-12 rounded-xl px-8 text-base font-semibold hover:bg-muted"
            >
              <Link href="/tenant/login">
                <span className="text-nowrap">Employee Portal</span>
              </Link>
            </Button>
          </AnimatedGroup>

          {/* Stats Section */}
          <AnimatedGroup
            variants={{
              container: {
                visible: {
                  transition: {
                    staggerChildren: 0.1,
                    delayChildren: 1,
                  },
                },
              },
              ...transitionVariants,
            }}
            className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3 max-w-3xl mx-auto"
          >
            <div className="flex flex-col items-center gap-2 rounded-2xl border bg-card/50 backdrop-blur-sm p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-2">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div className="text-3xl font-bold">500+</div>
              <div className="text-sm text-muted-foreground">Team Members</div>
            </div>

            <div className="flex flex-col items-center gap-2 rounded-2xl border bg-card/50 backdrop-blur-sm p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-500/10 mb-2">
                <TrendingUp className="h-6 w-6 text-purple-500" />
              </div>
              <div className="text-3xl font-bold">98%</div>
              <div className="text-sm text-muted-foreground">
                Satisfaction Rate
              </div>
            </div>

            <div className="flex flex-col items-center gap-2 rounded-2xl border bg-card/50 backdrop-blur-sm p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-pink-500/10 mb-2">
                <Sparkles className="h-6 w-6 text-pink-500" />
              </div>
              <div className="text-3xl font-bold">24/7</div>
              <div className="text-sm text-muted-foreground">AI Support</div>
            </div>
          </AnimatedGroup>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </section>
  );
};
