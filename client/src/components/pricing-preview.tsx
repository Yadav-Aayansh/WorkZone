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
import { Check, Sparkles, Zap, Rocket, ArrowRight, Shield } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const featuredPlans = [
  {
    name: "Starter",
    duration: "3 Months",
    description: "Perfect for trying out the platform",
    price: "₹29,999",
    pricePerMonth: "₹9,999/mo",
    icon: Sparkles,
    popular: false,
    features: [
      "Unlimited employees",
      "All core HR features",
      "AI Resume Analysis",
      "Email support",
      "Basic analytics",
    ],
    cta: "Get Started",
    href: "/signup",
    gradient: "from-blue-500 to-cyan-500",
    bgGradient: "from-blue-500/10 to-cyan-500/10",
  },
  {
    name: "Growth",
    duration: "6 Months",
    description: "Best value for growing teams",
    price: "₹49,999",
    pricePerMonth: "₹8,333/mo",
    icon: Zap,
    popular: true,
    features: [
      "Everything in Starter",
      "AI Interview Copilot",
      "Document Generation",
      "Priority support",
      "Advanced analytics",
    ],
    cta: "Get Started",
    href: "/signup",
    gradient: "from-indigo-500 via-purple-500 to-pink-500",
    bgGradient: "from-purple-500/10 to-pink-500/10",
  },
  {
    name: "Enterprise",
    duration: "12 Months",
    description: "Maximum savings for enterprises",
    price: "₹99,999",
    pricePerMonth: "₹8,333/mo",
    icon: Rocket,
    popular: false,
    features: [
      "Everything in Growth",
      "Custom integrations",
      "Dedicated account manager",
      "24/7 phone support",
      "Custom training sessions",
    ],
    cta: "Contact Sales",
    href: "/signup",
    gradient: "from-orange-500 to-red-500",
    bgGradient: "from-orange-500/10 to-red-500/10",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export default function PricingPreview() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Premium Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px]" />

      {/* Radial Glow */}
      <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[1000px] h-[600px]">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-purple-500/10 to-transparent rounded-full blur-[100px] opacity-40" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 md:mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm mb-6">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              Simple Pricing
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Invest in Your{" "}
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Team's Success
            </span>
          </h2>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your needs. All plans include our complete
            feature set with no hidden costs.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-6 lg:gap-8 grid-cols-1 md:grid-cols-3 max-w-6xl mx-auto mb-12"
        >
          {featuredPlans.map((plan, index) => {
            const Icon = plan.icon;

            return (
              <motion.div key={index} variants={cardVariants}>
                <Card
                  className={cn(
                    "group relative flex flex-col h-full transition-all duration-500 border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-2xl",
                    plan.popular
                      ? "border-2 border-primary/50 shadow-2xl shadow-primary/20 md:scale-105 z-10"
                      : "hover:border-primary/30 hover:shadow-primary/10"
                  )}
                >
                  {/* Gradient Overlay on Hover */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${plan.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl`}
                  />

                  {/* Shine Effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden rounded-xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                  </div>

                  {plan.popular && (
                    <div className="absolute -top-4 left-0 right-0 flex justify-center z-20">
                      <Badge className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white border-0 shadow-lg px-4 py-1">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="relative text-center pb-4 pt-8">
                    {/* Icon with Glow */}
                    <div className="mx-auto mb-4 relative">
                      <div
                        className={`absolute inset-0 bg-gradient-to-r ${plan.gradient} rounded-2xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500`}
                      />
                      <div
                        className={`relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${plan.bgGradient} border border-primary/20 group-hover:border-primary/40 transition-all duration-500`}
                      >
                        <Icon
                          className={`h-7 w-7 bg-gradient-to-r ${plan.gradient} bg-clip-text text-primary`}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <CardTitle className="text-2xl font-bold">
                        {plan.name}
                      </CardTitle>
                      <p className="text-sm font-medium text-primary">
                        {plan.duration}
                      </p>
                      <CardDescription className="text-sm">
                        {plan.description}
                      </CardDescription>
                    </div>
                  </CardHeader>

                  <CardContent className="relative flex-1 pb-6">
                    {/* Price */}
                    <div className="mb-6 text-center">
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                          {plan.price}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {plan.pricePerMonth} • billed once
                      </p>
                    </div>

                    {/* Features */}
                    <ul className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <li
                          key={featureIndex}
                          className="flex items-start gap-3"
                        >
                          <div
                            className={`mt-0.5 flex-shrink-0 rounded-full p-0.5 bg-gradient-to-r ${plan.gradient}`}
                          >
                            <Check className="h-3.5 w-3.5 text-white" />
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardFooter className="relative pt-4 pb-8">
                    <Button
                      asChild
                      className={cn(
                        "w-full h-12 text-base font-medium group/btn relative overflow-hidden",
                        plan.popular
                          ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/25"
                          : "bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 hover:border-primary/40"
                      )}
                    >
                      <Link href={plan.href}>
                        {plan.cta}
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                      </Link>
                    </Button>
                  </CardFooter>

                  {/* Bottom Gradient Line */}
                  <div
                    className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${plan.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-b-xl`}
                  />
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* View All Plans Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex justify-center"
        >
          <Button
            asChild
            variant="outline"
            className="group relative h-12 px-8 overflow-hidden border-primary/30 hover:border-primary/50 bg-background/50 backdrop-blur-sm"
          >
            <Link href="/pricing" className="flex items-center gap-2">
              <span>View All Plans & Compare</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground"
        >
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-green-500" />
            <span>No credit card required</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            <span>14-day free trial</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-green-500" />
            <span>Cancel anytime</span>
          </div>
        </motion.div>
      </div>

      {/* Bottom Gradient Line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
    </section>
  );
}
