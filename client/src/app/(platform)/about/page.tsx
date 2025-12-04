"use client";

import React from "react";
import { HeroHeader } from "@/components/(platform)/plaform-landing/header";
import { PlatformFooter } from "@/components/(platform)/plaform-landing/platform-footer";
import {
  User,
  Server,
  Palette,
  Layout,
  Brain,
  Network,
  GitBranch,
  TestTube,
  Github,
  Linkedin
} from "lucide-react";

export default function AboutPage() {
  const groupedTeams = {
    "Product Management": [
      {
        name: "Mayank",
        role: "Team Leader",
        description:
          "Leads strategy and architecture, ensuring every module aligns with the vision.",
        icon: User,
      },
      {
        name: "Achal Deep",
        role: "Code Manager",
        description:
          "Maintains code quality, version control, and team coordination.",
        icon: GitBranch,
      },
    ],
    "Frontend Developers": [
      {
        name: "Sandesh",
        role: "Frontend Engineer",
        description: "Designs intuitive interfaces with Next.js and shadcn/ui.",
        icon: Palette,
      },
      {
        name: "Abhishek",
        role: "Frontend Engineer",
        description:
          "Builds scalable and responsive UI flows for all roles and dashboards.",
        icon: Layout,
      },
    ],
    "Backend Developer": [
      {
        name: "Aayansh",
        role: "Backend Lead",
        description:
          "Crafts secure APIs and tenant systems using FastAPI and PostgreSQL.",
        icon: Server,
      },
    ],
    "GenAI Engineers": [
      {
        name: "Rishabh",
        role: "AI Developer",
        description:
          "Integrates AI workflows using LangChain, GPT, and automation agents.",
        icon: Brain,
      },
      {
        name: "Shreyas",
        role: "AI/ML Engineer",
        description: "Trains and evaluates ML models powering HR analytics.",
        icon: Network,
      },
    ],
    "QA Engineers": [
      {
        name: "Raghav Rao",
        role: "Tester",
        description:
          "Ensures every feature works seamlessly with rigorous testing.",
        icon: TestTube,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <HeroHeader />

      <main className="relative overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
        <div className="absolute left-1/2 top-20 -translate-x-1/2 w-[1000px] h-[1000px] bg-primary/20 rounded-full blur-[150px] opacity-20" />

        <div className="relative py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-6">
            
            {/* HEADER */}
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
                expertise in backend engineering, AI, design, and testing.
              </p>
            </div>

            {/* TEAM SECTION */}
            <div className="space-y-16 mt-20">
              {Object.entries(groupedTeams).map(([teamName, members]) => (
                <div
                  key={teamName}
                  className="bg-card/60 backdrop-blur-md border border-primary/20 rounded-3xl p-10 shadow-xl"
                >
                  <h2 className="text-3xl font-bold mb-8 text-primary">
                    {teamName}
                  </h2>

                  <div className="flex flex-row flex-wrap gap-6">
                    {members.map((member, index) => {
                      return (
                        <div
                          key={index}
                          className="
                            flex flex-row w-full md:w-[48%] items-center gap-6 
                            bg-primary/5 border border-primary/20 rounded-2xl p-6 
                            transition-all duration-300
                            hover:bg-primary/10 
                            hover:shadow-xl 
                            hover:border-primary/40
                            hover:[box-shadow:0_0_20px_rgba(168,85,247,0.4)]
                          "
                        >
                          {/* AVATAR */}
                          <div className="flex flex-col items-center w-32">
                            <div
                              className="
                                w-20 h-20 rounded-full overflow-hidden 
                                border border-primary/40
                                shadow-[0_0_12px_2px_rgba(168,85,247,0.45)]
                                hover:shadow-[0_0_20px_4px_rgba(168,85,247,0.7)]
                                transition-all duration-300
                              "
                            >
                              <img
                                src="https://api.dicebear.com/7.x/bottts/svg?seed=cartoon"
                                alt="avatar"
                                className="w-full h-full"
                              />
                            </div>

                            <h3 className="mt-3 text-lg font-semibold text-white">
                              {member.name}
                            </h3>
                            <p className="text-xs text-primary/70">
                              {member.role}
                            </p>
                          </div>

                          {/* DESCRIPTION */}
                          <div className="flex-1 space-y-2">
                            <p className="text-white/80">
                              {member.description}
                            </p>

                            {/* ICON BUTTONS */}
                            <div className="flex gap-4 pt-2">
                              <a
                                href="#"
                                className="
                                  p-2 rounded-full 
                                  bg-white/10 border border-white/20
                                  hover:bg-white/20 hover:scale-110
                                  transition-all
                                "
                              >
                                <Github size={18} className="text-white" />
                              </a>

                              <a
                                href="#"
                                className="
                                  p-2 rounded-full 
                                  bg-white/10 border border-white/20
                                  hover:bg-white/20 hover:scale-110
                                  transition-all
                                "
                              >
                                <Linkedin size={18} className="text-white" />
                              </a>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* FOOTNOTE */}
            <div className="mt-16 text-center">
              <p className="text-muted-foreground">
                🎓 Built as part of Software Engineering Course at IIT Madras
              </p>
            </div>

          </div>
        </div>
      </main>

      <PlatformFooter />
    </div>
  );
}
