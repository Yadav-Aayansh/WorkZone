"use client";

import React from "react";
import { HeroHeader } from "@/components/(platform)/plaform-landing/header";
import { PlatformFooter } from "@/components/(platform)/plaform-landing/platform-footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Server,
  Palette,
  Layout,
  Brain,
  Network,
  GitBranch,
  TestTube,
} from "lucide-react";

const teamMembers = [
  {
    name: "Mayank",
    role: "Team Leader",
    description:
      "Leads strategy and architecture, ensuring every module aligns with the vision.",
    icon: User,
    color: "from-blue-500 to-cyan-500",
  },
  {
    name: "Aayansh",
    role: "Backend Lead",
    description:
      "Crafts secure APIs and tenant systems using FastAPI and PostgreSQL.",
    icon: Server,
    color: "from-purple-500 to-pink-500",
  },
  {
    name: "Sandesh",
    role: "Frontend Engineer",
    description: "Designs intuitive interfaces with Next.js and shadcn/ui.",
    icon: Palette,
    color: "from-orange-500 to-red-500",
  },
  {
    name: "Abhishek",
    role: "Frontend Engineer",
    description:
      "Builds scalable and responsive UI flows for all roles and dashboards.",
    icon: Layout,
    color: "from-green-500 to-emerald-500",
  },
  {
    name: "Rishabh",
    role: "AI Developer",
    description:
      "Integrates AI workflows using LangChain, GPT, and automation agents.",
    icon: Brain,
    color: "from-violet-500 to-purple-500",
  },
  {
    name: "Shreyas",
    role: "AI/ML Engineer",
    description: "Trains and evaluates ML models powering HR analytics.",
    icon: Network,
    color: "from-indigo-500 to-blue-500",
  },
  {
    name: "Achal Deep",
    role: "Code Manager",
    description:
      "Maintains code quality, version control, and team coordination.",
    icon: GitBranch,
    color: "from-teal-500 to-cyan-500",
  },
  {
    name: "Raghav Rao",
    role: "Tester",
    description:
      "Ensures every feature works seamlessly with rigorous testing.",
    icon: TestTube,
    color: "from-rose-500 to-pink-500",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Navigation */}
      <HeroHeader />

      {/* Main Content */}
      <main className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />

        {/* Radial Gradient Spotlight */}
        <div className="absolute left-1/2 top-20 -translate-x-1/2 w-[1000px] h-[1000px] bg-primary/20 rounded-full blur-[150px] opacity-20" />

        <div className="relative py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-6">
            {/* Header Section */}
            <div className="text-center mb-16 md:mb-20">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                <span className="text-sm font-medium text-primary">
                  IIT Madras Project
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Meet the People Behind{" "}
                <span className="bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent">
                  WorkZone.tech
                </span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                A passionate team of innovators from IIT Madras, combining
                expertise in backend engineering, AI, design, and testing to
                build the future of intelligent HR systems.
              </p>
            </div>

            {/* Team Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {teamMembers.map((member, index) => {
                const Icon = member.icon;
                return (
                  <Card
                    key={index}
                    className="group relative overflow-hidden border-primary/10 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10"
                  >
                    {/* Gradient Background Effect */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${member.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                    />

                    {/* Shine Effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </div>

                    <CardContent className="relative p-6 space-y-4">
                      {/* Icon Container with Glow */}
                      <div className="relative w-fit mx-auto">
                        <div
                          className={`absolute inset-0 bg-gradient-to-br ${member.color} rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-all duration-500`}
                        />
                        <div className="relative bg-primary/10 backdrop-blur-sm p-4 rounded-2xl border border-primary/20 group-hover:border-primary/40 group-hover:bg-primary/20 transition-all duration-500">
                          <Icon className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-500" />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="text-center space-y-2">
                        <h3 className="text-xl font-bold group-hover:text-primary transition-colors duration-300">
                          {member.name}
                        </h3>
                        <Badge
                          variant="outline"
                          className="border-primary/30 text-primary/80 group-hover:border-primary group-hover:text-primary transition-colors duration-300"
                        >
                          {member.role}
                        </Badge>
                        <p className="text-sm text-muted-foreground leading-relaxed pt-2">
                          {member.description}
                        </p>
                      </div>

                      {/* Decorative Bottom Border */}
                      <div
                        className={`h-1 w-0 group-hover:w-full bg-gradient-to-r ${member.color} transition-all duration-500 rounded-full mx-auto`}
                      />
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Bottom Note */}
            <div className="mt-16 text-center">
              <p className="text-muted-foreground">
                🎓 Built as part of Software Engineering Course at IIT Madras
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <PlatformFooter />
    </div>
  );
}
