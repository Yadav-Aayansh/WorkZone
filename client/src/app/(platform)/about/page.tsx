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

// Team member interface
interface TeamMember {
  name: string;
  role: string;
  description: string;
  github: string | null;
  linkedin: string | null;
  note?: string;
}

// Animated team section component
function TeamSection({ teamName, members, index, singleCard = false }: { teamName: string; members: TeamMember[]; index: number; singleCard?: boolean }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={fadeInUp}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.005 }}
      className="relative group bg-card/60 backdrop-blur-md border border-primary/20 rounded-3xl p-8 md:p-10 shadow-xl overflow-hidden transition-colors duration-300 hover:border-primary/40"
    >
      {/* Gradient border on hover */}
      <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-primary/20 via-purple-500/20 to-pink-500/20" />
      </div>

      <h2 className="text-2xl md:text-3xl font-bold mb-8 bg-gradient-to-r from-primary via-purple-400 to-primary bg-clip-text text-transparent">
        {teamName}
      </h2>

      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className={`grid gap-6 ${singleCard ? 'grid-cols-1 max-w-2xl mx-auto' : 'grid-cols-1 md:grid-cols-2'}`}
      >
        {members.map((member, memberIndex) => (
          <MemberCard key={memberIndex} member={member} index={memberIndex} isFullWidth={singleCard} />
        ))}
      </motion.div>
    </motion.div>
  );
}

// Animated member card component
function MemberCard({ member, index, isFullWidth = false }: { member: TeamMember; index: number; isFullWidth?: boolean }) {
  return (
    <motion.div
      variants={fadeInLeft}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ 
        scale: 1.02,
        boxShadow: "0 0 30px rgba(168,85,247,0.25)"
      }}
      className={`relative flex flex-col sm:flex-row items-center sm:items-start gap-5 bg-gradient-to-br from-primary/5 to-purple-500/5 border border-primary/20 rounded-2xl p-6 transition-colors duration-300 hover:border-primary/40 hover:from-primary/10 hover:to-purple-500/8 ${isFullWidth ? 'w-full' : ''}`}
    >
      {/* AVATAR */}
      <div className="relative flex flex-col items-center shrink-0 z-10">
        <motion.div
          whileHover={{ scale: 1.08 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-primary/40 shadow-[0_0_12px_2px_rgba(168,85,247,0.3)] hover:border-primary hover:shadow-[0_0_20px_4px_rgba(168,85,247,0.4)] bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center"
        >
          <span className="text-2xl font-bold text-primary">
            {member.name.split(' ').map(n => n[0]).join('')}
          </span>
        </motion.div>

        <h3 className="mt-3 text-base md:text-lg font-semibold text-white text-center leading-tight">
          {member.name}
        </h3>
        <p className="text-xs text-primary/70 text-center mt-1">
          {member.role}
        </p>
      </div>

      {/* DESCRIPTION */}
      <div className="relative flex-1 space-y-3 z-10 text-center sm:text-left">
        <p className="text-white/80 text-sm md:text-base leading-relaxed">
          {member.description}
        </p>

        {/* Note for members without links */}
        {member.note && (
          <p className="text-xs text-muted-foreground italic">
            {member.note}
          </p>
        )}

        {/* ICON BUTTONS */}
        <div className="flex gap-3 pt-1 justify-center sm:justify-start">
          {member.github ? (
            <motion.a
              href={member.github}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="p-2 rounded-full bg-white/10 border border-white/20 hover:bg-primary/30 hover:border-primary/50 hover:shadow-[0_0_12px_rgba(168,85,247,0.4)] transition-colors duration-200"
            >
              <Github size={18} className="text-white" />
            </motion.a>
          ) : (
            <div className="p-2 rounded-full bg-white/5 border border-white/10 opacity-50 cursor-not-allowed">
              <Github size={18} className="text-white/50" />
            </div>
          )}

          {member.linkedin ? (
            <motion.a
              href={member.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="p-2 rounded-full bg-white/10 border border-white/20 hover:bg-blue-500/30 hover:border-blue-400/50 hover:shadow-[0_0_12px_rgba(59,130,246,0.4)] transition-colors duration-200"
            >
              <Linkedin size={18} className="text-white" />
            </motion.a>
          ) : (
            <div className="p-2 rounded-full bg-white/5 border border-white/10 opacity-50 cursor-not-allowed">
              <Linkedin size={18} className="text-white/50" />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function AboutPage() {
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-100px" });

  // Team data organized by section
  const teamSections = [
    {
      name: "Product Managers",
      singleCard: false,
      members: [
        {
          name: "Mayank Tripathi",
          role: "Product Lead",
          description:
            "Led client meetings, prepared presentation slides, and supported overall team communication and coordination throughout the project.",
          github: null,
          linkedin: null,
          // note: "Github & LinkedIn: available in README.md"
        },
        {
          name: "Achal Deep",
          role: "AI Product Manager",
          description:
            "Facilitated requirement-gathering discussions, defined the core problem statement, coordinated team workflows, created milestone reports, and led complete project documentation.",
          github: "https://github.com/achaldeep",
          linkedin: "https://www.linkedin.com/in/achaldeep"
        }
      ]
    },
    {
      name: "Frontend Developers",
      singleCard: false,
      members: [
        {
          name: "Sandesh Apparala",
          role: "Frontend Lead & Experience Architect",
          description:
            "Developed the full frontend end-to-end, shaping every screen, animation, and workflow into a polished, smooth, and user-centered experience.",
          github: "https://github.com/sandeshapparala",
          linkedin: "https://www.linkedin.com/in/sandeshapparala"
        },
        {
          name: "Abhishek Pandey",
          role: "Frontend Developer",
          description:
            "Handled UI designs, component development, dashboard layouts, and wireframe creation for the project.",
          github: "https://github.com/Avi-11007",
          linkedin: "https://www.linkedin.com/in/abhishek-pandey-21944324a"
        }
      ]
    },
    {
      name: "Backend Developers",
      singleCard: true,
      members: [
        {
          name: "Aayansh Yadav",
          role: "Backend Lead & System Architect",
          description:
            "Engineered multi-tenant, subdomain-driven backend, designed the database, built 50+ production APIs, and executed complete cloud deployment.",
          github: "https://github.com/Yadav-Aayansh",
          linkedin: "https://www.linkedin.com/in/Yadav-Aayansh"
        }
      ]
    },
    {
      name: "GenAI Engineers",
      singleCard: false,
      members: [
        {
          name: "Shreyas Jani",
          role: "AI & Automation Engineer",
          description:
            "Built intelligent modules for resume ranking, document generation (emails, feedback reports, JDs), and developed APIs for auto-allocated query ticketing and personalized learning path generation.",
          github: "https://github.com/JaniShreyas",
          linkedin: "https://www.linkedin.com/in/janishreyas"
        },
        {
          name: "Rishab Panwar",
          role: "GenAI Developer",
          description:
            "Developed functions of STT-TTS powered AI interview assistant and a semantic RAG HR policy assistant; both integrated with Redis sessions and cloud file storage.",
          github: "https://github.com/JaniShreyas",
          linkedin: "https://www.linkedin.com/in/janishreyas"
        }
      ]
    },
    {
      name: "QA Engineers",
      singleCard: true,
      members: [
        {
          name: "Raghav Rao Ghanathe",
          role: "QA Engineer",
          description:
            "Tested APIs, validated functionality, ensured smooth delivery and collaborated with the team for quality assurance.",
          github: "https://github.com/raghav42513",
          linkedin: "https://www.linkedin.com/in/raghav-rao-ghanathe"
        }
      ]
    }
  ];

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

            {/* TEAM SECTIONS */}
            <div className="space-y-10 mt-16">
              {teamSections.map((section, index) => (
                <TeamSection 
                  key={section.name} 
                  teamName={section.name} 
                  members={section.members} 
                  index={index}
                  singleCard={section.singleCard}
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
