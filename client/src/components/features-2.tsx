"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Users,
  Brain,
  FileSearch,
  Calendar,
  BarChart3,
  Shield,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const features = [
  {
    icon: FileSearch,
    title: "Smart Recruitment",
    description:
      "AI-powered resume screening and candidate ranking to find the perfect fit faster.",
    gradient: "from-blue-500/20 to-cyan-500/20",
    iconColor: "text-blue-500",
  },
  {
    icon: Users,
    title: "Team Management",
    description:
      "Centralized employee data, departments, and org charts in one intuitive dashboard.",
    gradient: "from-purple-500/20 to-pink-500/20",
    iconColor: "text-purple-500",
  },
  {
    icon: Brain,
    title: "AI Interviews",
    description:
      "Intelligent interview assistance with real-time insights and scoring.",
    gradient: "from-emerald-500/20 to-teal-500/20",
    iconColor: "text-emerald-500",
  },
  {
    icon: Calendar,
    title: "Attendance & Leave",
    description:
      "Automated tracking, leave management, and shift scheduling made effortless.",
    gradient: "from-orange-500/20 to-amber-500/20",
    iconColor: "text-orange-500",
  },
  {
    icon: BarChart3,
    title: "Analytics & Reports",
    description:
      "Real-time workforce insights with customizable dashboards and reports.",
    gradient: "from-rose-500/20 to-red-500/20",
    iconColor: "text-rose-500",
  },
  {
    icon: Shield,
    title: "Compliance & Security",
    description:
      "Enterprise-grade security with role-based access and audit trails.",
    gradient: "from-indigo-500/20 to-violet-500/20",
    iconColor: "text-indigo-500",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export default function Features() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 md:mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 mb-6">
            <span className="text-sm font-medium text-primary">Features</span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Scale Your Team
            </span>
          </h2>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            A complete HR platform with intelligent automation, powerful
            analytics, and seamless integrations.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div key={index} variants={itemVariants}>
                <Card className="group relative h-full overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-500 hover:shadow-xl hover:shadow-primary/5">
                  {/* Gradient Background Effect */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                  />

                  {/* Shine Effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  </div>

                  <CardContent className="relative p-8">
                    {/* Icon */}
                    <div className="mb-6 relative w-fit">
                      <div
                        className={`absolute inset-0 ${feature.iconColor} opacity-20 rounded-2xl blur-xl group-hover:opacity-40 transition-all duration-500`}
                      />
                      <div className="relative p-4 rounded-2xl bg-muted/50 border border-border/50 group-hover:border-primary/20 group-hover:bg-muted transition-all duration-500">
                        <Icon
                          className={`h-7 w-7 ${feature.iconColor} group-hover:scale-110 transition-transform duration-500`}
                        />
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {feature.description}
                    </p>

                    {/* Learn More Link */}
                    <div className="mt-6 flex items-center gap-2 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                      <span>Learn more</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>

                    {/* Bottom Border Animation */}
                    <div className="absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-primary/50 via-primary to-primary/50 transition-all duration-500" />
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <Link
            href="/features"
            className="inline-flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all group"
          >
            <span>Explore all features</span>
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
