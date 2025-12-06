"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Users, Zap, Shield, TrendingUp, Clock } from "lucide-react";

const benefits = [
  {
    icon: Clock,
    title: "Save Time",
    description: "Reduce HR admin work by 70%",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Users,
    title: "Better Hiring",
    description: "Improve candidate quality by 45%",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: TrendingUp,
    title: "Data-Driven",
    description: "Make decisions backed by AI insights",
    gradient: "from-orange-500 to-red-500",
  },
  {
    icon: Shield,
    title: "Secure & Compliant",
    description: "Enterprise-grade security standards",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    icon: Zap,
    title: "Fast Setup",
    description: "Go live in less than 24 hours",
    gradient: "from-yellow-500 to-orange-500",
  },
  {
    icon: Building2,
    title: "Scalable",
    description: "Grows with your organization",
    gradient: "from-indigo-500 to-purple-500",
  },
];

export const FeaturesBenefits = () => {
  return (
    <section className="py-20 md:py-32 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background -z-10" />

      <div className="mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Why Teams Love{" "}
            <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              WorkZone
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Measurable results that drive real business impact.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;

            return (
              <Card
                key={index}
                className="group relative overflow-hidden border hover:border-primary/50 transition-all duration-300 hover:shadow-xl text-center"
              >
                <CardContent className="pt-8 pb-6">
                  <div
                    className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${benefit.gradient} mb-4 transition-transform duration-300 group-hover:scale-110`}
                  >
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
