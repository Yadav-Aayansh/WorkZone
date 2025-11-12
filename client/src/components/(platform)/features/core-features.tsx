"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Briefcase,
  BarChart3,
  Calendar,
  FileText,
  Shield,
  Bell,
  Settings,
  Target,
  Award,
  ClipboardCheck,
  MessageCircle,
} from "lucide-react";

const coreFeatures = [
  {
    icon: Briefcase,
    title: "Recruitment Automation",
    description:
      "End-to-end hiring process from job posting to offer generation. Applicant tracking, interview scheduling, and automated workflows.",
    color: "bg-blue-100 dark:bg-blue-950",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    icon: Users,
    title: "Employee Management",
    description:
      "Complete employee lifecycle management with self-service portals, digital onboarding, and profile management.",
    color: "bg-purple-100 dark:bg-purple-950",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
  {
    icon: Calendar,
    title: "Leave & Attendance",
    description:
      "Smart leave management with approval workflows, attendance tracking, and automated balance calculations.",
    color: "bg-green-100 dark:bg-green-950",
    iconColor: "text-green-600 dark:text-green-400",
  },
  {
    icon: Target,
    title: "Performance Management",
    description:
      "360-degree reviews, goal tracking, continuous feedback, and data-driven performance insights.",
    color: "bg-orange-100 dark:bg-orange-950",
    iconColor: "text-orange-600 dark:text-orange-400",
  },
  {
    icon: BarChart3,
    title: "Analytics & Reports",
    description:
      "Real-time workforce analytics, custom reports, attrition prediction, and actionable insights.",
    color: "bg-pink-100 dark:bg-pink-950",
    iconColor: "text-pink-600 dark:text-pink-400",
  },
  {
    icon: FileText,
    title: "Document Management",
    description:
      "Centralized document storage, automated generation, e-signatures, and compliance tracking.",
    color: "bg-indigo-100 dark:bg-indigo-950",
    iconColor: "text-indigo-600 dark:text-indigo-400",
  },
  {
    icon: Shield,
    title: "Compliance & Security",
    description:
      "Automated policy tracking, regulatory compliance, data encryption, and audit trails.",
    color: "bg-red-100 dark:bg-red-950",
    iconColor: "text-red-600 dark:text-red-400",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description:
      "Automated alerts for approvals, deadlines, policy updates, and important events.",
    color: "bg-yellow-100 dark:bg-yellow-950",
    iconColor: "text-yellow-600 dark:text-yellow-400",
  },
  {
    icon: MessageCircle,
    title: "Employee Helpdesk",
    description:
      "Ticketing system for HR queries with auto-categorization, tracking, and transparent workflows.",
    color: "bg-cyan-100 dark:bg-cyan-950",
    iconColor: "text-cyan-600 dark:text-cyan-400",
  },
  {
    icon: Award,
    title: "Recognition & Rewards",
    description:
      "Employee recognition programs, achievement tracking, and reward management.",
    color: "bg-emerald-100 dark:bg-emerald-950",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    icon: ClipboardCheck,
    title: "Onboarding & Offboarding",
    description:
      "Streamlined processes for new hires and exits with checklists, documentation, and compliance.",
    color: "bg-violet-100 dark:bg-violet-950",
    iconColor: "text-violet-600 dark:text-violet-400",
  },
  {
    icon: Settings,
    title: "Customization & Integration",
    description:
      "Custom workflows, branding options, API access, and third-party integrations.",
    color: "bg-fuchsia-100 dark:bg-fuchsia-950",
    iconColor: "text-fuchsia-600 dark:text-fuchsia-400",
  },
];

export const CoreFeatures = () => {
  return (
    <section className="py-20 md:py-32 relative">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 px-4 py-1.5">
            Complete HR Suite
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Comprehensive{" "}
            <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              Platform Features
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            All the tools you need to manage your entire HR operation from a
            single, integrated platform.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {coreFeatures.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <Card
                key={index}
                className="group relative overflow-hidden border hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
              >
                <CardHeader>
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${feature.color} transition-transform duration-300 group-hover:scale-110 mb-3`}
                  >
                    <Icon className={`h-6 w-6 ${feature.iconColor}`} />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>

                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
