"use client";

import { Card, CardContent } from "@/components/ui/card";
import { BrainCircuit, MessageSquare, FileText } from "lucide-react";
import { ReactNode } from "react";

export default function AIFeaturesSection() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />

      {/* Animated Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />

      {/* Radial Gradient Spotlight */}
      <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] opacity-20" />

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="text-center mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-sm font-medium text-primary">AI-Powered</span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-foreground to-foreground/60 bg-clip-text text-transparent">
            Supercharge Your HR with{" "}
            <span className="bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent animate-gradient">
              AI
            </span>
          </h2>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Unlock efficiency with our intelligent tools.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {/* AI Resume Scorer */}
          <FeatureCard
            icon={<BrainCircuit className="size-8" />}
            title="AI Resume Scorer"
            description="Automatically screen and rank candidates based on job requirements."
            gradient="from-blue-500/20 to-cyan-500/20"
            delay="0"
          />

          {/* AI Interview Assistant */}
          <FeatureCard
            icon={<MessageSquare className="size-8" />}
            title="AI Interview Assistant"
            description="Get real-time suggestions and analysis during interviews."
            gradient="from-purple-500/20 to-pink-500/20"
            delay="100"
          />

          {/* AI Document Generation */}
          <FeatureCard
            icon={<FileText className="size-8" />}
            title="AI Document Generation"
            description="Instantly create offer letters, contracts, and more."
            gradient="from-orange-500/20 to-red-500/20"
            delay="200"
          />
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
    </section>
  );
}

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  gradient: string;
  delay: string;
}

function FeatureCard({
  icon,
  title,
  description,
  gradient,
  delay,
}: FeatureCardProps) {
  return (
    <Card
      className="group relative overflow-hidden border-primary/10 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Gradient Background Effect */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
      />

      {/* Shine Effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </div>

      <CardContent className="relative p-8 space-y-4">
        {/* Icon Container with Glow */}
        <div className="relative w-fit">
          <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl group-hover:bg-primary/40 transition-all duration-500" />
          <div className="relative bg-primary/10 backdrop-blur-sm p-4 rounded-2xl border border-primary/20 group-hover:border-primary/40 group-hover:bg-primary/20 transition-all duration-500">
            <div className="text-primary group-hover:scale-110 transition-transform duration-500">
              {icon}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h3 className="text-xl font-semibold group-hover:text-primary transition-colors duration-300">
            {title}
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {description}
          </p>
        </div>

        {/* Decorative Bottom Border */}
        <div className="h-1 w-0 group-hover:w-full bg-gradient-to-r from-primary/50 via-primary to-primary/50 transition-all duration-500 rounded-full" />
      </CardContent>
    </Card>
  );
}
