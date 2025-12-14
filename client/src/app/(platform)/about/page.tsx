"use client";

import React, { useRef } from "react";
import { HeroHeader } from "@/components/(platform)/plaform-landing/header";
import { PlatformFooter } from "@/components/(platform)/plaform-landing/platform-footer";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { Github, Linkedin, Sparkles, Crown } from "lucide-react";

interface TeamMember {
  name: string;
  role: string;
  description: string;
  github: string | null;
  linkedin: string | null;
  gradient: string;
  glowColor: string;
}

const teamMembers: TeamMember[] = [
  {
    name: "Aayansh Yadav",
    role: "Backend Lead & System Architect",
    description:
      "Engineered multi-tenant, subdomain-driven backend, designed the database, built 50+ production APIs, and executed complete cloud deployment.",
    github: "https://github.com/Yadav-Aayansh",
    linkedin: "https://www.linkedin.com/in/Yadav-Aayansh",
    gradient: "from-cyan-400 via-blue-500 to-violet-600",
    glowColor: "cyan",
  },
  {
    name: "Sandesh Apparala",
    role: "Frontend Lead & Experience Architect",
    description:
      "Developed the full frontend end-to-end, shaping every screen, animation, and workflow into a polished, smooth, and user-centered experience.",
    github: "https://github.com/sandeshapparala",
    linkedin: "https://www.linkedin.com/in/sandeshapparala",
    gradient: "from-violet-500 via-purple-500 to-fuchsia-500",
    glowColor: "purple",
  },
  {
    name: "Rishab Panwar",
    role: "GenAI Developer",
    description:
      "Developed STT-TTS powered AI interview assistant and semantic RAG HR policy assistant with Redis sessions and cloud storage.",
    github: "https://github.com/JaniShreyas",
    linkedin: "https://www.linkedin.com/in/janishreyas",
    gradient: "from-amber-500 via-orange-500 to-red-500",
    glowColor: "orange",
  },
  {
    name: "Shreyas Jani",
    role: "AI & Automation Engineer",
    description:
      "Built intelligent modules for resume ranking, document generation, and APIs for query ticketing and learning path generation.",
    github: "https://github.com/JaniShreyas",
    linkedin: "https://www.linkedin.com/in/janishreyas",
    gradient: "from-emerald-500 via-teal-500 to-cyan-500",
    glowColor: "emerald",
  },
  {
    name: "Achal Deep",
    role: "AI Product Manager",
    description:
      "Facilitated requirement-gathering, defined core problem statement, coordinated workflows, and led complete project documentation.",
    github: "https://github.com/achaldeep",
    linkedin: "https://www.linkedin.com/in/achaldeep",
    gradient: "from-pink-500 via-rose-500 to-red-500",
    glowColor: "rose",
  },
  {
    name: "Mayank Tripathi",
    role: "Product Lead",
    description:
      "Led client meetings, prepared presentation slides, and supported overall team communication and coordination.",
    github: "https://github.com/mayanktripathii",
    linkedin: "https://linkedin.com/in/mayanktripathi10",
    gradient: "from-blue-500 via-indigo-500 to-violet-500",
    glowColor: "indigo",
  },
  {
    name: "Abhishek Pandey",
    role: "Frontend Developer",
    description:
      "Handled UI designs, component development, dashboard layouts, and wireframe creation for the project.",
    github: "https://github.com/Avi-11007",
    linkedin: "https://www.linkedin.com/in/abhishek-pandey-21944324a",
    gradient: "from-fuchsia-500 via-pink-500 to-rose-500",
    glowColor: "pink",
  },
  {
    name: "Raghav Rao Ghanathe",
    role: "QA Engineer",
    description:
      "Tested APIs, validated functionality, ensured smooth delivery and collaborated with the team for quality assurance.",
    github: "https://github.com/raghav42513",
    linkedin: "https://www.linkedin.com/in/raghav-rao-ghanathe",
    gradient: "from-teal-500 via-emerald-500 to-green-500",
    glowColor: "teal",
  },
];

function MemberCard({
  member,
  index,
  isFirst,
}: {
  member: TeamMember;
  index: number;
  isFirst: boolean;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{
        duration: isFirst ? 0.9 : 0.7,
        delay: index * 0.08,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      className={`group relative h-full ${isFirst ? "md:col-span-2 lg:col-span-1" : ""}`}
    >
  
      <div
        className={`absolute rounded-[36px] bg-gradient-to-r ${member.gradient} blur-3xl transition-all duration-700 ${
          isFirst
            ? "-inset-6 opacity-20 group-hover:opacity-40 group-hover:-inset-8"
            : "-inset-4 opacity-0 group-hover:opacity-25 group-hover:-inset-5"
        }`}
      />

      {/* Card */}
      <div
        className={`relative h-full overflow-hidden ${
          isFirst ? "rounded-[32px]" : "rounded-[28px]"
        }`}
      >
     
        <div className="absolute inset-0 bg-white/[0.03] backdrop-blur-2xl" />

    
        <div
          className={`absolute inset-0 p-[1px] bg-gradient-to-br ${member.gradient} ${
            isFirst
              ? "opacity-50 group-hover:opacity-70"
              : "opacity-30 group-hover:opacity-50"
          } transition-opacity duration-500 ${isFirst ? "rounded-[32px]" : "rounded-[28px]"}`}
        >
          <div
            className={`absolute inset-[1px] bg-[#0c0c14]/95 backdrop-blur-2xl ${
              isFirst ? "rounded-[31px]" : "rounded-[27px]"
            }`}
          />
        </div>

  
        {isFirst && (
          <div className="absolute inset-0 rounded-[32px] overflow-hidden pointer-events-none">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-[100%] bg-[conic-gradient(from_0deg,transparent_0%,transparent_40%,rgba(6,182,212,0.3)_50%,transparent_60%,transparent_100%)]"
            />
          </div>
        )}

    
        <div
          className={`absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent ${
            isFirst ? "via-white/40" : "via-white/25"
          } to-transparent`}
        />


        <div
          className={`absolute top-0 left-1/2 -translate-x-1/2 bg-gradient-to-b ${member.gradient} blur-3xl ${
            isFirst ? "w-3/4 h-40 opacity-[0.12]" : "w-2/3 h-32 opacity-[0.08]"
          }`}
        />

        {/* Content */}
        <div
          className={`relative h-full flex flex-col ${
            isFirst ? "p-8 md:p-10" : "p-6 md:p-8"
          }`}
        >
          {/* Header: Avatar + Info */}
          <div className="flex items-start gap-5 mb-5">
            <div className="relative shrink-0">
             
              {isFirst && (
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                  className="absolute -inset-4 rounded-2xl border border-cyan-500/20 border-dashed"
                />
              )}

              {/* Rotating ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className={`absolute rounded-2xl border border-dashed opacity-30 ${
                  isFirst ? "-inset-3" : "-inset-2"
                } ${
                  member.glowColor === "cyan"
                    ? "border-cyan-500"
                    : member.glowColor === "purple"
                    ? "border-purple-500"
                    : member.glowColor === "orange"
                    ? "border-orange-500"
                    : member.glowColor === "emerald"
                    ? "border-emerald-500"
                    : member.glowColor === "rose"
                    ? "border-rose-500"
                    : member.glowColor === "indigo"
                    ? "border-indigo-500"
                    : member.glowColor === "pink"
                    ? "border-pink-500"
                    : "border-teal-500"
                }`}
              />

              <div
                className={`relative bg-gradient-to-br ${member.gradient} p-[2px] shadow-lg ${
                  isFirst
                    ? "w-20 h-20 rounded-2xl shadow-cyan-500/20"
                    : "w-16 h-16 rounded-2xl"
                }`}
              >
                <div
                  className={`w-full h-full bg-[#0c0c14] flex items-center justify-center overflow-hidden ${
                    isFirst ? "rounded-[14px]" : "rounded-[14px]"
                  }`}
                >
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                  <span
                    className={`relative font-bold bg-gradient-to-br ${member.gradient} bg-clip-text text-transparent ${
                      isFirst ? "text-xl" : "text-lg"
                    }`}
                  >
                    {member.name.split(" ").map((n) => n[0]).join("")}
                  </span>
                </div>
              </div>

              <motion.div
                animate={{
                  scale: [1, isFirst ? 1.15 : 1.2, 1],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className={`absolute -top-1 -right-1 rounded-lg bg-gradient-to-br ${member.gradient} flex items-center justify-center shadow-lg ${
                  isFirst ? "w-6 h-6" : "w-5 h-5"
                }`}
              >
                {isFirst ? (
                  <Crown size={12} className="text-white" />
                ) : (
                  <Sparkles size={10} className="text-white" />
                )}
              </motion.div>
            </div>

            {/* Name & Role */}
            <div className="flex-1 min-w-0 pt-1">
              <div className="flex items-center gap-2 mb-1">
                <h3
                  className={`font-semibold text-white tracking-tight truncate ${
                    isFirst ? "text-xl" : "text-lg"
                  }`}
                >
                  {member.name}
                </h3>
                {isFirst && (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300/90 border border-cyan-500/20">
                    Core
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`rounded-full bg-gradient-to-r ${member.gradient} ${
                    isFirst ? "w-2 h-2" : "w-1.5 h-1.5"
                  }`}
                />
                <span
                  className={`font-medium text-white/50 truncate ${
                    isFirst ? "text-sm" : "text-xs"
                  }`}
                >
                  {member.role}
                </span>
              </div>
            </div>
          </div>

          <p
            className={`leading-relaxed transition-colors duration-300 flex-1 mb-6 ${
              isFirst
                ? "text-sm text-white/50 group-hover:text-white/70"
                : "text-sm text-white/40 group-hover:text-white/60"
            }`}
          >
            {member.description}
          </p>

          {/* Action buttons */}
          <div className="flex gap-2 mt-auto">
            {member.github ? (
              <a
                href={member.github}
                target="_blank"
                rel="noopener noreferrer"
                className="group/btn relative flex-1 overflow-hidden"
              >
                {/* Button glow */}
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${member.gradient} rounded-xl opacity-0 blur-xl group-hover/btn:opacity-30 transition-opacity duration-300`}
                />

                {/* Glass button */}
                <div
                  className={`relative flex items-center justify-center gap-2 rounded-xl bg-white/[0.05] backdrop-blur-xl border border-white/10 hover:border-white/20 hover:bg-white/[0.08] transition-all duration-300 ${
                    isFirst ? "px-5 py-3" : "px-4 py-2.5"
                  }`}
                >
                  <Github size={isFirst ? 15 : 14} className="text-white/70" />
                  <span
                    className={`font-medium text-white/70 ${
                      isFirst ? "text-sm" : "text-xs"
                    }`}
                  >
                    GitHub
                  </span>

                  {/* Shine */}
                  <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                    <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  </div>
                </div>
              </a>
            ) : (
              <div
                className={`flex-1 flex items-center justify-center gap-2 rounded-xl bg-white/[0.02] border border-white/5 cursor-not-allowed ${
                  isFirst ? "px-5 py-3" : "px-4 py-2.5"
                }`}
              >
                <Github size={isFirst ? 15 : 14} className="text-white/20" />
                <span
                  className={`text-white/20 ${isFirst ? "text-sm" : "text-xs"}`}
                >
                  GitHub
                </span>
              </div>
            )}

            {member.linkedin ? (
              <a
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="group/btn relative flex-1 overflow-hidden"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${member.gradient} rounded-xl opacity-0 blur-xl group-hover/btn:opacity-30 transition-opacity duration-300`}
                />

                <div
                  className={`relative flex items-center justify-center gap-2 rounded-xl bg-white/[0.05] backdrop-blur-xl border border-white/10 hover:border-white/20 hover:bg-white/[0.08] transition-all duration-300 ${
                    isFirst ? "px-5 py-3" : "px-4 py-2.5"
                  }`}
                >
                  <Linkedin size={isFirst ? 15 : 14} className="text-white/70" />
                  <span
                    className={`font-medium text-white/70 ${
                      isFirst ? "text-sm" : "text-xs"
                    }`}
                  >
                    LinkedIn
                  </span>

                  <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                    <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  </div>
                </div>
              </a>
            ) : (
              <div
                className={`flex-1 flex items-center justify-center gap-2 rounded-xl bg-white/[0.02] border border-white/5 cursor-not-allowed ${
                  isFirst ? "px-5 py-3" : "px-4 py-2.5"
                }`}
              >
                <Linkedin size={isFirst ? 15 : 14} className="text-white/20" />
                <span
                  className={`text-white/20 ${isFirst ? "text-sm" : "text-xs"}`}
                >
                  LinkedIn
                </span>
              </div>
            )}
          </div>
        </div>

        <div
          className={`absolute bottom-0 inset-x-0 bg-gradient-to-t ${member.gradient} pointer-events-none ${
            isFirst ? "h-24 opacity-[0.05]" : "h-20 opacity-[0.03]"
          }`}
        />
      </div>
    </motion.div>
  );
}

// Floating orb
function FloatingOrb({
  size,
  gradient,
  blur,
  top,
  left,
  duration,
}: {
  size: number;
  gradient: string;
  blur: number;
  top: string;
  left: string;
  duration: number;
}) {
  return (
    <motion.div
      animate={{
        y: [0, -40, 0],
        x: [0, 20, 0],
        scale: [1, 1.15, 1],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={`absolute rounded-full bg-gradient-to-br ${gradient} pointer-events-none`}
      style={{
        width: size,
        height: size,
        filter: `blur(${blur}px)`,
        top,
        left,
      }}
    />
  );
}

export default function AboutPage() {
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-100px" });
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const y2 = useTransform(scrollYProgress, [0, 1], ["0%", "-25%"]);

  return (
    <div className="min-h-screen bg-[#08080c] overflow-hidden">
      <HeroHeader />

      <main className="relative">
        {/* Animated background */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[#08080c]" />

          {/* Parallax orbs */}
          <motion.div style={{ y: y1 }} className="absolute inset-0">
            <FloatingOrb
              size={700}
              gradient="from-cyan-600/20 to-blue-600/20"
              blur={140}
              top="-15%"
              left="-15%"
              duration={12}
            />
            <FloatingOrb
              size={600}
              gradient="from-violet-600/20 to-purple-600/20"
              blur={120}
              top="10%"
              left="55%"
              duration={15}
            />
            <FloatingOrb
              size={500}
              gradient="from-pink-600/15 to-rose-600/15"
              blur={100}
              top="55%"
              left="5%"
              duration={18}
            />
          </motion.div>

          <motion.div style={{ y: y2 }} className="absolute inset-0">
            <FloatingOrb
              size={450}
              gradient="from-amber-600/15 to-orange-600/15"
              blur={90}
              top="35%"
              left="65%"
              duration={14}
            />
            <FloatingOrb
              size={400}
              gradient="from-emerald-600/15 to-teal-600/15"
              blur={80}
              top="75%"
              left="35%"
              duration={16}
            />
          </motion.div>

          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px)
              `,
              backgroundSize: "80px 80px",
            }}
          />

          {/* Radial vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#08080c_75%)]" />
        </div>

        <div className="relative py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-6">
            {/* Header */}
            <motion.div ref={headerRef} className="text-center mb-16 md:mb-24">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={headerInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{ duration: 0.7 }}
                className="inline-block mb-10"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/30 via-purple-500/30 to-pink-500/30 rounded-full blur-2xl" />
                  <div className="relative px-6 py-3 rounded-full bg-white/[0.06] backdrop-blur-2xl border border-white/15 shadow-2xl">
                    <div className="flex items-center gap-3">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400" />
                      </span>
                      <span className="text-sm font-medium text-white/90">
                        IIT Madras • Software Engineering 2024
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Title */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={headerInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.9, delay: 0.15 }}
                className="relative mb-8"
              >
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 blur-3xl opacity-40">
                    The Team Behind WorkZone
                  </div>
                </div>

                <h1 className="relative text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                  <span className="text-white">The </span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400">
                   Team Behind WorkZone
                  </span>
                </h1>
              </motion.div>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={headerInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-lg md:text-xl text-white/40 max-w-2xl mx-auto leading-relaxed"
              >
                A passionate team building{" "}
                <span className="text-white/80 font-medium">WorkZone.tech</span>{" "}
                the future of intelligent HR automation.
              </motion.p>

              {/* Floating dots */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={headerInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="flex justify-center gap-4 mt-12"
              >
                {[
                  "from-cyan-400 to-blue-400",
                  "from-purple-400 to-pink-400",
                  "from-amber-400 to-orange-400",
                ].map((gradient, i) => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -10, 0] }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.25,
                    }}
                    className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${gradient} shadow-lg`}
                    style={{
                      boxShadow: `0 0 20px 2px rgba(${
                        i === 0
                          ? "6,182,212"
                          : i === 1
                          ? "168,85,247"
                          : "251,146,60"
                      }, 0.4)`,
                    }}
                  />
                ))}
              </motion.div>
            </motion.div>

            {/* Team grid - 2 per row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              {teamMembers.map((member, index) => (
                <MemberCard
                  key={member.name}
                  member={member}
                  index={index}
                  isFirst={index === 0}
                />
              ))}
            </div>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="mt-20 text-center"
            >
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-2xl" />
                <div className="relative px-10 py-6 rounded-2xl bg-white/[0.04] backdrop-blur-2xl border border-white/10">
                  <p className="text-white/40 text-sm">
                    Crafted with 💜 at{" "}
                    <span className="text-white/70 font-medium">
                      Indian Institute of Technology, Madras
                    </span>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <PlatformFooter />
    </div>
  );
}