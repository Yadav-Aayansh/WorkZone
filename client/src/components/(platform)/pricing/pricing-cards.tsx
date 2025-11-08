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
    name: "3 Months",
    description: "Perfect for getting started",
    price: "₹29,999",
    period: "for 3 months",
    icon: Sparkles,
    popular: false,
    features: [
      "Unlimited employees",
      "AI-powered resume screening",
      "Automated interview scheduling",
      "Performance management",
      "Advanced analytics & reports",
      "Document generation",
      "Leave management",
      "Employee self-service portal",
      "Custom branding",
      "Email support",
      "50 GB storage",
    ],
    cta: "Get Started",
    href: "/(auth)/signup",
    color: "blue",
  },
  {
    name: "6 Months",
    description: "Best value for growing companies",
    price: "₹49,999",
    period: "for 6 months",
    originalPrice: "₹59,999",
    discount: "Save 17%",
    icon: Zap,
    popular: true,
    features: [
      "Unlimited employees",
      "AI-powered resume screening",
      "Automated interview scheduling",
      "Performance management",
      "Advanced analytics & reports",
      "Document generation",
      "Leave management",
      "Employee self-service portal",
      "Custom branding",
      "Priority support",
      "100 GB storage",
      "API access",
    ],
    cta: "Get Started",
    href: "/(auth)/signup",
    color: "purple",
  },
  {
    name: "1 Year",
    description: "Maximum savings for long-term growth",
    price: "₹99,999",
    period: "for 12 months",
    originalPrice: "₹1,19,999",
    discount: "Save 17%",
    icon: Rocket,
    popular: false,
    features: [
      "Unlimited employees",
      "Full AI suite (GenAI tools)",
      "AI interview assistant",
      "Automated interview scheduling",
      "Performance management",
      "Advanced analytics & reports",
      "Predictive analytics",
      "Document generation",
      "Leave management",
      "Employee self-service portal",
      "Custom branding",
      "24/7 premium support",
      "Unlimited storage",
      "API access",
      "Custom integrations",
    ],
    cta: "Get Started",
    href: "/(auth)/signup",
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

                {plan.discount && !plan.popular && (
                  <div className="absolute -top-4 left-0 right-0 flex justify-center">
                    <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white border-0">
                      {plan.discount}
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
                    {plan.originalPrice && (
                      <div className="mb-1">
                        <span className="text-lg text-muted-foreground line-through">
                          {plan.originalPrice}
                        </span>
                      </div>
                    )}
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-5xl font-bold tracking-tight">
                        {plan.price}
                      </span>
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
