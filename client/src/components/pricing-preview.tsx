"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Zap, Rocket, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const featuredPlans = [
  {
    name: "3 Months",
    description: "Perfect for getting started",
    price: "₹29,999",
    period: "for 3 months",
    icon: Sparkles,
    popular: false,
    features: ["Unlimited employees", "All AI features", "Email support"],
    cta: "Get Started",
    href: "/signup",
    color: "blue",
  },
  {
    name: "6 Months",
    description: "Best value for growing companies",
    price: "₹49,999",
    period: "for 6 months",
    icon: Zap,
    popular: true,
    features: ["Unlimited employees", "All AI features", "Priority support"],
    cta: "Get Started",
    href: "/signup",
    color: "purple",
  },
  {
    name: "1 Year",
    description: "Maximum savings",
    price: "₹99,999",
    period: "for 12 months",
    icon: Rocket,
    popular: false,
    features: ["Unlimited employees", "All AI features", "24/7 support"],
    cta: "Get Started",
    href: "/signup",
    color: "pink",
  },
];

export default function PricingPreview() {
  return (
    <section className="relative py-16 md:py-20 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="text-center mb-10 md:mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 mb-4">
            <span className="text-sm font-medium text-primary">Pricing</span>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3">
            Choose Your{" "}
            <span className="bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent">
              Perfect Plan
            </span>
          </h2>

          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Start free and scale as you grow. No credit card required.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-6 md:gap-6 grid-cols-1 md:grid-cols-3 max-w-6xl mx-auto mb-10">
          {featuredPlans.map((plan, index) => {
            const Icon = plan.icon;

            return (
              <Card
                key={index}
                className={cn(
                  "relative flex flex-col h-full transition-all duration-300 hover:shadow-xl border-primary/10 bg-card/50 backdrop-blur-sm",
                  plan.popular &&
                    "border-2 border-primary/30 shadow-2xl shadow-primary/10 md:scale-105"
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-0 right-0 flex justify-center">
                    <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 shadow-lg">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4 pt-6">
                  <div className="mx-auto mb-3 relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-xl blur-lg" />
                    <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription className="mt-1 text-sm">
                    {plan.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1 pb-4">
                  <div className="mb-4 text-center">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-3xl md:text-4xl font-bold tracking-tight">
                        {plan.price}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {plan.period}
                    </p>
                  </div>

                  <ul className="space-y-2">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-2">
                        <div className="mt-0.5 flex-shrink-0">
                          <Check className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="pt-3 pb-5">
                  <Button
                    asChild
                    className={cn(
                      "w-full group",
                      plan.popular &&
                        "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    )}
                  >
                    <Link href={plan.href}>
                      {plan.cta}
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* View All Plans Button */}
        <div className="flex justify-center">
          <Button
            asChild
            variant="outline"
            className="group relative overflow-hidden border-primary/30 hover:border-primary/50 hover:bg-primary/5"
          >
            <Link href="/pricing" className="flex items-center gap-2">
              <span>View All Plans</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>

        {/* Trust Badge */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            🔒 No credit card required • Cancel anytime • Free 14-day trial
          </p>
        </div>
      </div>
    </section>
  );
}
