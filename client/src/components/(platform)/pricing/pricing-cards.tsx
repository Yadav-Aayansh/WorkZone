/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
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
import { Check, Sparkles, Zap, Rocket } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const pricingPlans = [
  {
    name: "Starter",
    description: "Perfect for small teams getting started",
    price: "Free",
    period: "forever",
    icon: Zap,
    popular: false,
    features: [
      "Up to 10 employees",
      "Basic job posting",
      "Employee self-service portal",
      "Leave management",
      "Basic analytics",
      "Email support",
      "1 GB storage",
    ],
    cta: "Get Started",
    href: "/(auth)/register",
    color: "blue",
  },
  {
    name: "Professional",
    description: "Best for growing companies",
    price: "$49",
    period: "per month",
    icon: Sparkles,
    popular: true,
    features: [
      "Up to 100 employees",
      "AI-powered resume screening",
      "Automated interview scheduling",
      "Performance management",
      "Advanced analytics & reports",
      "Document generation",
      "Priority support",
      "50 GB storage",
      "Custom branding",
      "API access",
    ],
    cta: "Start Free Trial",
    href: "/(auth)/register",
    color: "purple",
  },
  {
    name: "Enterprise",
    description: "Advanced features for large organizations",
    price: "Custom",
    period: "contact sales",
    icon: Rocket,
    popular: false,
    features: [
      "Unlimited employees",
      "Full AI suite (GenAI tools)",
      "AI interview assistant",
      "Predictive analytics",
      "Custom integrations",
      "Dedicated account manager",
      "24/7 premium support",
      "Unlimited storage",
      "Custom domain mapping",
      "SSO & advanced security",
      "Compliance tracking",
      "White-label option",
    ],
    cta: "Contact Sales",
    href: "#contact",
    color: "pink",
  },
];

const iconColorClasses = {
  blue: "text-blue-600 dark:text-blue-400",
  purple: "text-purple-600 dark:text-purple-400",
  pink: "text-pink-600 dark:text-pink-400",
};

const cardColorClasses = {
  blue: "hover:border-blue-500/50",
  purple:
    "border-purple-500/50 shadow-2xl shadow-purple-500/20 dark:shadow-purple-500/10 scale-105",
  pink: "hover:border-pink-500/50",
};

export const PricingCards = () => {
  return (
    <section className="py-16 md:py-24 relative">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-8 md:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-start">
          {pricingPlans.map((plan, index) => {
            const Icon = plan.icon;
            const iconColor =
              iconColorClasses[plan.color as keyof typeof iconColorClasses];
            const cardColor =
              cardColorClasses[plan.color as keyof typeof cardColorClasses];

            return (
              <Card
                key={index}
                className={cn(
                  "relative flex flex-col h-full transition-all duration-300",
                  cardColor,
                  plan.popular && "border-2"
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-0 right-0 flex justify-center">
                    <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-8">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                    <Icon className={cn("h-8 w-8", iconColor)} />
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription className="mt-2">
                    {plan.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1">
                  <div className="mb-8 text-center">
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-5xl font-bold tracking-tight">
                        {plan.price}
                      </span>
                      {plan.price !== "Custom" && plan.price !== "Free" && (
                        <span className="text-muted-foreground">/mo</span>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {plan.period}
                    </p>
                  </div>

                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button
                    asChild
                    className={cn(
                      "w-full",
                      plan.popular &&
                        "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    )}
                    size="lg"
                  >
                    <Link href={plan.href}>{plan.cta}</Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
