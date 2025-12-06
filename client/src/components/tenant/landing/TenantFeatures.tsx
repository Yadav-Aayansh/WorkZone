"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  BarChart3,
  Briefcase,
  Search,
  Sparkles,
  TrendingUp,
  Shield,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: Users,
    title: "Employee Portal",
    description:
      "Comprehensive self-service portal for leave management, payslips, and performance reviews.",
    link: "/tenant/login",
    linkText: "Access Portal",
    color: "indigo",
  },
  {
    icon: BarChart3,
    title: "Manager Dashboard",
    description:
      "Powerful tools for team management, approvals, and data-driven insights.",
    link: "/tenant/login",
    linkText: "Manage Team",
    color: "purple",
  },
  {
    icon: Briefcase,
    title: "Recruiter Hub",
    description:
      "End-to-end recruitment management with applicant tracking and interview scheduling.",
    link: "/tenant/login",
    linkText: "Start Hiring",
    color: "blue",
  },
  {
    icon: Search,
    title: "Career Opportunities",
    description:
      "Browse open positions, apply seamlessly, and track your application status.",
    link: "/tenant/careers",
    linkText: "View Jobs",
    color: "green",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Tools",
    description:
      "Smart resume screening, interview preparation, and intelligent recommendations.",
    link: "#",
    linkText: "Coming Soon",
    color: "pink",
    badge: "Coming Soon",
  },
  {
    icon: TrendingUp,
    title: "Analytics & Insights",
    description:
      "Real-time workforce analytics and performance metrics for strategic decisions.",
    link: "/tenant/login",
    linkText: "View Analytics",
    color: "orange",
  },
];

const colorClasses = {
  indigo: {
    bg: "bg-indigo-100 dark:bg-indigo-950",
    icon: "text-indigo-600 dark:text-indigo-400",
  },
  purple: {
    bg: "bg-purple-100 dark:bg-purple-950",
    icon: "text-purple-600 dark:text-purple-400",
  },
  blue: {
    bg: "bg-blue-100 dark:bg-blue-950",
    icon: "text-blue-600 dark:text-blue-400",
  },
  green: {
    bg: "bg-green-100 dark:bg-green-950",
    icon: "text-green-600 dark:text-green-400",
  },
  pink: {
    bg: "bg-pink-100 dark:bg-pink-950",
    icon: "text-pink-600 dark:text-pink-400",
  },
  orange: {
    bg: "bg-orange-100 dark:bg-orange-950",
    icon: "text-orange-600 dark:text-orange-400",
  },
};

export const TenantFeatures = () => {
  return (
    <section className="py-20 md:py-32 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 to-background -z-10" />

      <div className="mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 px-4 py-1.5">
            <Shield className="mr-2 h-3.5 w-3.5" />
            Comprehensive Solutions
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Everything You Need in{" "}
            <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              One Platform
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Streamline your HR operations with our integrated suite of tools
            designed for modern workplaces.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const colors =
              colorClasses[feature.color as keyof typeof colorClasses];

            return (
              <Card
                key={index}
                className="group relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl"
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl ${colors.bg} transition-transform duration-300 group-hover:scale-110`}
                    >
                      <Icon className={`h-7 w-7 ${colors.icon}`} />
                    </div>
                    {feature.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {feature.badge}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6 min-h-[60px]">
                    {feature.description}
                  </p>
                  {feature.link !== "#" ? (
                    <Link href={feature.link}>
                      <Button
                        variant="ghost"
                        className="group/btn p-0 h-auto font-semibold text-primary hover:text-primary/80"
                      >
                        {feature.linkText}
                        <Zap className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      variant="ghost"
                      disabled
                      className="p-0 h-auto font-semibold text-muted-foreground"
                    >
                      {feature.linkText}
                    </Button>
                  )}
                </CardContent>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
