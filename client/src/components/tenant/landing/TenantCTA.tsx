"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Briefcase, UserCircle2 } from "lucide-react";
import { useTenant } from "@/providers/tenant-provider";

export const TenantCTA = () => {
  const { tenant } = useTenant();

  return (
    <section className="py-20 md:py-32 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-500/10 to-pink-500/20 -z-10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,hsl(var(--background))_100%)] -z-10" />

      <div className="mx-auto max-w-5xl px-6">
        <div className="relative rounded-3xl border-2 bg-card/80 backdrop-blur-xl p-12 md:p-16 shadow-2xl overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -z-10" />

          <div className="text-center space-y-8">
            {/* Heading */}
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold">
                Ready to Join{" "}
                <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  {tenant?.brandName}?
                </span>
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Whether you&apos;re looking for your next career opportunity or
                managing your work life, we&apos;re here for you.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button
                asChild
                size="lg"
                className="group rounded-xl px-8 text-base font-semibold shadow-lg hover:shadow-xl transition-all min-w-[200px]"
              >
                <Link href="/tenant/careers">
                  <Briefcase className="mr-2 h-5 w-5" />
                  Explore Careers
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>

              <Button
                asChild
                size="lg"
                variant="outline"
                className="group rounded-xl px-8 text-base font-semibold border-2 hover:bg-muted min-w-[200px]"
              >
                <Link href="/tenant/login">
                  <UserCircle2 className="mr-2 h-5 w-5" />
                  Employee Portal
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>

            {/* Additional Info */}
            <div className="pt-8 border-t">
              <p className="text-sm text-muted-foreground">
                Need help? Contact us at{" "}
                <a
                  href={`mailto:support@${tenant?.subdomain}.workzone.tech`}
                  className="text-primary hover:underline font-medium"
                >
                  support@{tenant?.subdomain}.workzone.tech
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
