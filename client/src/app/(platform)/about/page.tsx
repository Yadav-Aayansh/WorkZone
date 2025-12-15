"use client";
import React, { useRef } from "react";
import { HeroHeader } from "@/components/(platform)/plaform-landing/header";
import { PlatformFooter } from "@/components/(platform)/plaform-landing/platform-footer";
import { motion, useScroll, useTransform } from "framer-motion";
import { Github, Linkedin, Sparkles, Crown } from "lucide-react";

// Types
interface TeamMember {
  name: string;
  role: string;
  description: string;
  github: string | null;
  linkedin: string | null;
  gradient: string;
  glowColor: string;
  lightGlow: string;
}

// Static Data
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
    lightGlow: "shadow-cyan-200/50",
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
    lightGlow: "shadow-purple-200/50",
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
    lightGlow: "shadow-orange-200/50",
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
    lightGlow: "shadow-emerald-200/50",
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
    lightGlow: "shadow-rose-200/50",
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
    lightGlow: "shadow-indigo-200/50",
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
    lightGlow: "shadow-pink-200/50",
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
    lightGlow: "shadow-teal-200/50",
  },
];

// Memoized Card
const MemberCard = React.memo(function MemberCard({
  member,
  index,
  isFirst,
}: {
  member: TeamMember;
  index: number;
  isFirst: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: isFirst ? 0.9 : 0.7,
        delay: index * 0.08,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      // RESPONSIVE FIX: md:col-span-2 ensures Lead card is full width on tablet, 
      // but lg:col-span-1 ensures it fits into the 2-column grid on desktop.
      className={`group relative h-full transform-gpu isolate ${
        isFirst ? "md:col-span-2 lg:col-span-1" : ""
      }`}
    >
      {/* Glow effect */}
      <div
        className={`absolute rounded-[36px] bg-gradient-to-r ${member.gradient} transition-all duration-700 will-change-transform ${
          isFirst
            ? "-inset-3 opacity-[0.25] blur-2xl group-hover:opacity-[0.35] group-hover:-inset-4 dark:-inset-6 dark:opacity-20 dark:blur-3xl dark:group-hover:opacity-40 dark:group-hover:-inset-8"
            : "-inset-2 opacity-[0.15] blur-xl group-hover:opacity-[0.25] group-hover:-inset-3 dark:-inset-4 dark:opacity-0 dark:blur-3xl dark:group-hover:opacity-25 dark:group-hover:-inset-5"
        }`}
      />
      {/* Card */}
      <div
        className={`relative h-full overflow-hidden backface-hidden ${
          isFirst ? "rounded-[32px]" : "rounded-[28px]"
        } ${
          isFirst
            ? `shadow-2xl ${member.lightGlow} dark:shadow-none`
            : `shadow-xl shadow-gray-200/80 dark:shadow-none`
        }`}
      >
        <div className="absolute inset-0 bg-white dark:bg-white/[0.03] dark:backdrop-blur-2xl" />
        
        {/* Gradient border */}
        <div
          className={`absolute inset-0 p-[2px] dark:p-[1px] bg-gradient-to-br ${member.gradient} ${
            isFirst
              ? "opacity-60 group-hover:opacity-80 dark:opacity-50 dark:group-hover:opacity-70"
              : "opacity-40 group-hover:opacity-60 dark:opacity-30 dark:group-hover:opacity-50"
          } transition-opacity duration-500 ${isFirst ? "rounded-[32px]" : "rounded-[28px]"}`}
        >
          <div
            className={`absolute inset-[2px] dark:inset-[1px] bg-white dark:bg-[#0c0c14]/95 dark:backdrop-blur-2xl ${
              isFirst ? "rounded-[30px] dark:rounded-[31px]" : "rounded-[26px] dark:rounded-[27px]"
            }`}
          />
        </div>

        {isFirst && (
          <div className="absolute inset-0 rounded-[32px] overflow-hidden pointer-events-none">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-[100%] will-change-transform bg-[conic-gradient(from_0deg,transparent_0%,transparent_40%,rgba(6,182,212,0.15)_50%,transparent_60%,transparent_100%)] dark:bg-[conic-gradient(from_0deg,transparent_0%,transparent_40%,rgba(6,182,212,0.3)_50%,transparent_60%,transparent_100%)]"
            />
          </div>
        )}

        {/* Content */}
        <div
          className={`relative h-full flex flex-col ${
            isFirst ? "p-8 md:p-10" : "p-6 md:p-8"
          }`}
        >
          {/* Header */}
          <div className="flex items-start gap-5 mb-5">
            <div className="relative shrink-0">
              {isFirst && (
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                  className="absolute -inset-4 rounded-2xl border border-cyan-400/30 dark:border-cyan-500/20 border-dashed will-change-transform"
                />
              )}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className={`absolute rounded-2xl border border-dashed will-change-transform ${
                  isFirst ? "-inset-3" : "-inset-2"
                } ${
                  member.glowColor === "cyan"
                    ? "border-cyan-400/40 dark:border-cyan-500/30"
                    : member.glowColor === "purple"
                    ? "border-purple-400/40 dark:border-purple-500/30"
                    : "border-gray-400/40 dark:border-gray-500/30"
                }`}
              />
              <div
                className={`relative bg-gradient-to-br ${member.gradient} p-[2px] ${
                  isFirst
                    ? `w-20 h-20 rounded-2xl shadow-lg ${member.lightGlow} dark:shadow-cyan-500/20`
                    : "w-16 h-16 rounded-2xl shadow-md"
                }`}
              >
                <div
                  className={`w-full h-full bg-white dark:bg-[#0c0c14] flex items-center justify-center overflow-hidden rounded-[14px]`}
                >
                  <span
                    className={`relative font-bold bg-gradient-to-br ${member.gradient} bg-clip-text text-transparent ${
                      isFirst ? "text-xl" : "text-lg"
                    }`}
                  >
                    {member.name.split(" ").map((n) => n[0]).join("")}
                  </span>
                </div>
              </div>
            </div>
            {/* Name & Role */}
            <div className="flex-1 min-w-0 pt-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3
                  className={`font-semibold text-gray-900 dark:text-white tracking-tight ${
                    isFirst ? "text-xl" : "text-lg"
                  }`}
                >
                  {member.name}
                </h3>
                {isFirst && (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider bg-gradient-to-r from-cyan-100 to-blue-100 dark:from-cyan-500/20 dark:to-blue-500/20 text-cyan-700 dark:text-cyan-300/90 border border-cyan-300 dark:border-cyan-500/20">
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
                  className={`font-medium text-gray-500 dark:text-white/50 ${
                    isFirst ? "text-sm" : "text-xs"
                  }`}
                >
                  {member.role}
                </span>
              </div>
            </div>
          </div>
          {/* Description */}
          <p
            className={`leading-relaxed transition-colors duration-300 flex-1 mb-6 ${
              isFirst
                ? "text-sm text-gray-600 dark:text-white/50 group-hover:text-gray-800 dark:group-hover:text-white/70"
                : "text-sm text-gray-500 dark:text-white/40 group-hover:text-gray-700 dark:group-hover:text-white/60"
            }`}
          >
            {member.description}
          </p>
          {/* Buttons */}
          <div className="flex gap-3 mt-auto">
             <SocialButton link={member.github} type="github" gradient={member.gradient} isFirst={isFirst} />
             <SocialButton link={member.linkedin} type="linkedin" gradient={member.gradient} isFirst={isFirst} />
          </div>
        </div>
      </div>
    </motion.div>
  );
});

function SocialButton({ link, type, gradient, isFirst }: { link: string | null; type: 'github' | 'linkedin'; gradient: string; isFirst: boolean }) {
    const Icon = type === 'github' ? Github : Linkedin;
    const label = type === 'github' ? 'GitHub' : 'LinkedIn';

    if (!link) {
        return (
            <div
                className={`flex-1 flex items-center justify-center gap-2 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 cursor-not-allowed ${
                  isFirst ? "px-5 py-3" : "px-4 py-2.5"
                }`}
              >
                <Icon
                  size={isFirst ? 15 : 14}
                  className="text-gray-300 dark:text-white/20"
                />
                <span
                  className={`text-gray-300 dark:text-white/20 ${
                    isFirst ? "text-sm" : "text-xs"
                  }`}
                >
                  {label}
                </span>
            </div>
        )
    }

    return (
        <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="group/btn relative flex-1 overflow-hidden"
      >
        <div
          className={`absolute inset-0 bg-gradient-to-r ${gradient} rounded-xl opacity-0 blur-xl group-hover/btn:opacity-30 transition-opacity duration-300`}
        />
        <div
          className={`relative flex items-center justify-center gap-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-white/[0.05] dark:backdrop-blur-xl border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 dark:hover:bg-white/[0.08] transition-all duration-300 ${
            isFirst ? "px-5 py-3" : "px-4 py-2.5"
          }`}
        >
          <Icon
            size={isFirst ? 15 : 14}
            className="text-gray-700 dark:text-white/70"
          />
          <span
            className={`font-medium text-gray-700 dark:text-white/70 ${
              isFirst ? "text-sm" : "text-xs"
            }`}
          >
            {label}
          </span>
        </div>
      </a>
    )
}

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
        y: [0, -20, 0],
        scale: [1, 1.05, 1],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={`absolute rounded-full bg-gradient-to-br ${gradient} pointer-events-none transform-gpu will-change-transform`}
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
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const y2 = useTransform(scrollYProgress, [0, 1], ["0%", "-10%"]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-[#08080c] dark:to-[#08080c] overflow-hidden transition-colors duration-300">
      <HeroHeader />
      <main className="relative">
        <div className="fixed inset-0 pointer-events-none">
          <motion.div style={{ y: y1 }} className="absolute inset-0 hidden md:block will-change-transform">
            <FloatingOrb
              size={700}
              gradient="from-cyan-400/30 to-blue-400/30 dark:from-cyan-600/20 dark:to-blue-600/20"
              blur={140}
              top="-15%"
              left="-15%"
              duration={12}
            />
             <FloatingOrb
              size={500}
              gradient="from-pink-400/20 to-rose-400/20 dark:from-pink-600/15 dark:to-rose-600/15"
              blur={100}
              top="55%"
              left="5%"
              duration={18}
            />
          </motion.div>

           {/* Mobile/Tablet Orbs (Static, no parallax) */}
           <div className="absolute inset-0 md:hidden">
            <FloatingOrb
              size={300}
              gradient="from-cyan-400/20 to-blue-400/20 dark:from-cyan-600/15 dark:to-blue-600/15"
              blur={80}
              top="-5%"
              left="-10%"
              duration={10}
            />
             <FloatingOrb
              size={250}
              gradient="from-pink-400/15 to-rose-400/15 dark:from-pink-600/10 dark:to-rose-600/10"
              blur={60}
              top="60%"
              left="-5%"
              duration={15}
            />
          </div>

          <motion.div style={{ y: y2 }} className="absolute inset-0 hidden md:block will-change-transform">
            <FloatingOrb
              size={600}
              gradient="from-violet-400/25 to-purple-400/25 dark:from-violet-600/20 dark:to-purple-600/20"
              blur={120}
              top="10%"
              left="55%"
              duration={15}
            />
          </motion.div>

          {/* Grid overlay */}
          <div
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(0,0,0,0.04) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(0,0,0,0.04) 1px, transparent 1px)
              `,
              backgroundSize: "80px 80px",
            }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(255,255,255,0.9)_80%)] dark:bg-[radial-gradient(ellipse_at_center,transparent_0%,#08080c_75%)]" />
        </div>

        <div className="relative py-20 md:py-28 z-10">
          <div className="mx-auto max-w-6xl px-6">
            <motion.div 
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.8 }}
               className="text-center mb-16 md:mb-24"
            >
              <div className="inline-block mb-10">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/40 via-purple-400/40 to-pink-400/40 dark:from-cyan-500/30 dark:via-purple-500/30 dark:to-pink-500/30 rounded-full blur-2xl" />
                  <div className="relative px-6 py-3 rounded-full bg-white dark:bg-white/[0.06] backdrop-blur-2xl border border-gray-200 dark:border-white/15 shadow-lg dark:shadow-2xl">
                    <div className="flex items-center gap-3">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 dark:bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 dark:from-emerald-400 dark:to-cyan-400" />
                      </span>
                      <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                        IIT Madras • Software Engineering 2024
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative mb-8">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {/* RESPONSIVE FIX: Adjusted blur text size for md screens */}
                  <div className="text-6xl md:text-7xl lg:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 blur-3xl opacity-20 dark:opacity-30">
                    The Team Behind WorkZone
                  </div>
                </div>
                {/* RESPONSIVE FIX: Clamped text size for md screens to prevent overflow */}
                <h1 className="relative text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                  <span className="text-gray-900 dark:text-white">The </span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500">
                    Team Behind WorkZone
                  </span>
                </h1>
              </div>

              <p className="text-lg md:text-xl text-gray-600 dark:text-white/40 max-w-2xl mx-auto leading-relaxed">
                A passionate team building{" "}
                <span className="text-gray-900 dark:text-white/80 font-semibold">
                  WorkZone.tech
                </span>{" "}
                — the future of intelligent HR automation.
              </p>
            </motion.div>

            {/* RESPONSIVE FIX: Changed to md:grid-cols-2 to force 2 columns on iPad */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {teamMembers.map((member, index) => (
                <MemberCard
                  key={member.name}
                  member={member}
                  index={index}
                  isFirst={index === 0}
                />
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="mt-20 text-center"
            >
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 via-purple-400/20 to-pink-400/20 dark:from-cyan-500/20 dark:via-purple-500/20 dark:to-pink-500/20 rounded-2xl blur-2xl" />
                <div className="relative px-10 py-6 rounded-2xl bg-white dark:bg-white/[0.04] backdrop-blur-2xl border border-gray-200 dark:border-white/10 shadow-lg dark:shadow-none">
                  <p className="text-gray-600 dark:text-white/40 text-sm">
                    Crafted with 💜 at{" "}
                    <span className="text-gray-900 dark:text-white/70 font-semibold">
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