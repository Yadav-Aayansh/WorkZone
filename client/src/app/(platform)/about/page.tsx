"use client";

import React, { useRef } from "react";
import { HeroHeader } from "@/components/(platform)/plaform-landing/header";
import { PlatformFooter } from "@/components/(platform)/plaform-landing/platform-footer";
import { motion, useInView } from "framer-motion";
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

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const fadeInLeft = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

// Animated team section component
function TeamSection({ teamName, members, index }: { teamName: string; members: any[]; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={fadeInUp}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.01 }}
      className="relative group bg-card/60 backdrop-blur-md border border-primary/20 rounded-3xl p-10 shadow-xl overflow-hidden transition-colors duration-300 hover:border-primary/40"
    >
      {/* Gradient border on hover */}
      <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-primary/20 via-purple-500/20 to-pink-500/20" />
      </div>

      <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-primary via-purple-400 to-primary bg-clip-text text-transparent">
        {teamName}
      </h2>

      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className="flex flex-row flex-wrap gap-6"
      >
        {members.map((member, memberIndex) => (
          <MemberCard key={memberIndex} member={member} index={memberIndex} />
        ))}
      </motion.div>
    </motion.div>
  );
}

// Animated member card component
function MemberCard({ member, index }: { member: any; index: number }) {
  return (
    <motion.div
      variants={fadeInLeft}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ 
        scale: 1.02,
        boxShadow: "0 0 30px rgba(168,85,247,0.25)"
      }}
      className="relative flex flex-row w-full md:w-[48%] items-center gap-6 bg-gradient-to-br from-primary/5 to-purple-500/5 border border-primary/20 rounded-2xl p-6 transition-colors duration-300 hover:border-primary/40 hover:from-primary/10 hover:to-purple-500/8"
    >
      {/* AVATAR */}
      <div className="relative flex flex-col items-center w-32 z-10">
        <motion.div
          whileHover={{ scale: 1.08 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-primary/40 shadow-[0_0_12px_2px_rgba(168,85,247,0.3)] hover:border-primary hover:shadow-[0_0_20px_4px_rgba(168,85,247,0.4)]"
        >
          <img
            src={`https://api.dicebear.com/7.x/bottts/svg?seed=${member.name}`}
            alt="avatar"
            className="w-full h-full"
          />
        </motion.div>

        <h3 className="mt-3 text-lg font-semibold text-white group-hover:text-primary transition-colors duration-200">
          {member.name}
        </h3>
        <p className="text-xs text-primary/70">
          {member.role}
        </p>
      </div>

      {/* DESCRIPTION */}
      <div className="relative flex-1 space-y-2 z-10">
        <p className="text-white/80">
          {member.description}
        </p>

        {/* ICON BUTTONS */}
        <div className="flex gap-3 pt-2">
          <motion.a
            href="#"
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="p-2 rounded-full bg-white/10 border border-white/20 hover:bg-primary/30 hover:border-primary/50 hover:shadow-[0_0_12px_rgba(168,85,247,0.4)] transition-colors duration-200"
          >
            <Github size={18} className="text-white" />
          </motion.a>

          <motion.a
            href="#"
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="p-2 rounded-full bg-white/10 border border-white/20 hover:bg-blue-500/30 hover:border-blue-400/50 hover:shadow-[0_0_12px_rgba(59,130,246,0.4)] transition-colors duration-200"
          >
            <Linkedin size={18} className="text-white" />
          </motion.a>
        </div>
      </div>
    </motion.div>
  );
}

export default function AboutPage() {
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-100px" });

  const groupedTeams = {
    "Product Management Team": [
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
    "Frontend Team": [
      {
        name: "Sandesh",
        role: "Frontend Developer",
        description: "Designs intuitive interfaces with Next.js and shadcn/ui.",
        icon: Palette,
      },
      {
        name: "Abhishek",
        role: "Frontend Developer",
        description:
          "Builds scalable and responsive UI flows for all roles and dashboards.",
        icon: Layout,
      },
    ],
    "Backend Team": [
      {
        name: "Aayansh",
        role: "Backend Lead",
        description:
          "Crafts secure APIs and tenant systems using FastAPI and PostgreSQL.",
        icon: Server,
      },
    ],
    "GenAI Team": [
      {
        name: "Rishabh",
        role: "AI Developer",
        description:
          "Integrates AI workflows using LangChain, GPT, and automation agents.",
        icon: Brain,
      },
      {
        name: "Shreyas",
        role: "AI/ML Developer",
        description: "Trains and evaluates ML models powering HR analytics.",
        icon: Network,
      },
    ],
    "QA Team": [
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
        <div className="absolute left-1/2 top-20 -translate-x-1/2 w-[800px] h-[800px] bg-primary/15 rounded-full blur-[120px] opacity-30" />
        
        {/* Subtle ambient orbs */}
        <div className="absolute right-0 top-1/3 w-[400px] h-[400px] bg-purple-500/8 rounded-full blur-[100px]" />
        <div className="absolute left-0 bottom-1/4 w-[350px] h-[350px] bg-pink-500/8 rounded-full blur-[80px]" />

        <div className="relative py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-6">
            
            {/* HEADER */}
            <motion.div 
              ref={headerRef}
              initial={{ opacity: 0, y: 30 }}
              animate={headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-center mb-16 md:mb-20"
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={headerInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 mb-6 hover:bg-primary/10 hover:border-primary/40 transition-all duration-200 cursor-default"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                <span className="text-sm font-medium text-primary">
                  IIT Madras Project
                </span>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
              >
                Meet the People Behind{" "}
                <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  WorkZone.tech
                </span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 15 }}
                animate={headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
              >
                A passionate team of innovators from IIT Madras, combining
                expertise in backend engineering, AI, design, and testing.
              </motion.p>
            </motion.div>

            {/* TEAM SECTION */}
            <div className="space-y-12 mt-16">
              {Object.entries(groupedTeams).map(([teamName, members], index) => (
                <TeamSection 
                  key={teamName} 
                  teamName={teamName} 
                  members={members} 
                  index={index} 
                />
              ))}
            </div>

            {/* FOOTNOTE */}
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mt-16 text-center"
            >
              <p className="text-muted-foreground inline-flex items-center gap-2 hover:text-primary transition-colors duration-200 cursor-default">
                🎓 Built as part of Software Engineering Course at IIT Madras
              </p>
            </motion.div>

          </div>
        </div>
      </main>

      <PlatformFooter />
    </div>
  );
}
