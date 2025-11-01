"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  DollarSign,
  Home,
  GraduationCap,
  Heart,
  Users2,
  Rocket,
} from "lucide-react";

const benefits = [
  {
    icon: DollarSign,
    title: "Competitive Compensation",
    description: "Industry-leading salaries and performance bonuses",
  },
  {
    icon: Home,
    title: "Flexible Work",
    description: "Remote, hybrid, and flexible scheduling options",
  },
  {
    icon: GraduationCap,
    title: "Learning & Development",
    description: "Continuous training and career advancement programs",
  },
  {
    icon: Heart,
    title: "Work-Life Balance",
    description: "Generous PTO, wellness programs, and mental health support",
  },
  {
    icon: Users2,
    title: "Inclusive Culture",
    description: "Diverse, welcoming environment that celebrates uniqueness",
  },
  {
    icon: Rocket,
    title: "Career Growth",
    description: "Clear advancement paths and leadership opportunities",
  },
];

export const TenantBenefits = () => {
  return (
    <section className="py-20 md:py-32 relative">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Why Join Our Team?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We invest in our people. Discover the benefits that make us a great
            place to work and grow your career.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;

            return (
              <Card
                key={index}
                className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/30"
              >
                <CardContent className="p-8">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                        {benefit.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
