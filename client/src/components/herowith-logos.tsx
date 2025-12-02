"use client";

import clsx from "clsx";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Play, Shield, Clock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { HeroHeader } from "./(platform)/plaform-landing/header";

const FUIHeroWithBorders = () => {
  return (
    <>
      <HeroHeader />
      <section className="relative min-h-[calc(100vh+300px)] overflow-hidden bg-[linear-gradient(to_bottom,#fff,#e0e7ff_30%,#c7d2fe_50%,#a5b4fc_80%)] dark:bg-[linear-gradient(to_bottom,#000,#0c0a20_20%,#1e1b4b_45%,#19143a_75%,#19143a_20%)]">
        {/* Bottom Curved Section - Original Premium Design */}
        <div className="absolute left-1/2 top-[calc(100%-120px)] lg:top-[calc(100%-200px)] h-[500px] w-[700px] md:h-[600px] md:w-[1100px] lg:h-[850px] lg:w-[120%] -translate-x-1/2 rounded-[100%] border-t-2 border-indigo-400/50 bg-background dark:bg-background shadow-[0_-30px_60px_-15px_rgba(99,102,241,0.3)]">
          <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-indigo-500/10 to-transparent rounded-t-[100%]" />
        </div>

        {/* Original Vertical Border Grid - Premium Look */}
        <div className="absolute left-0 top-0 z-0 grid h-full w-full grid-cols-[clamp(28px,10vw,120px)_auto_clamp(28px,10vw,120px)] border-b border-border/20">
          <div className="col-span-1 flex h-full items-center justify-center" />
          <div className="col-span-1 flex h-full items-center justify-center border-x border-white/10 dark:border-white/5" />
          <div className="col-span-1 flex h-full items-center justify-center" />
        </div>

        {/* Blur Effects */}
        <figure className="bg-indigo-500/30 pointer-events-none absolute -bottom-[70%] left-1/2 z-0 block aspect-square w-[520px] -translate-x-1/2 rounded-full blur-[200px]" />
        <figure className="bg-purple-500/20 pointer-events-none absolute left-[4vw] top-[64px] z-0 hidden aspect-square w-[32vw] rounded-full opacity-50 blur-[100px] md:block" />
        <figure className="bg-indigo-500/20 pointer-events-none absolute bottom-[-50px] right-[7vw] z-0 hidden aspect-square w-[30vw] rounded-full opacity-50 blur-[100px] md:block" />

        {/* Main Content */}
        <div className="relative z-10 flex flex-col divide-y divide-white/10 pt-24 md:pt-28">
          {/* Announcement Badge */}
          <div className="flex flex-col items-center justify-end pb-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Link
                href="/features"
                className="group inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 backdrop-blur-sm hover:bg-indigo-500/20 transition-all duration-300"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                <span className="text-sm font-medium text-indigo-800 dark:text-indigo-200">
                  Now with AI-Powered HR Automation
                </span>
                <ArrowRight className="h-4 w-4 text-indigo-700 dark:text-indigo-300 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </motion.div>
          </div>

          {/* Hero Text */}
          <div>
            <div className="mx-auto flex max-w-[85vw] shrink-0 flex-col items-center justify-center gap-4 px-2 py-8 sm:px-10 lg:px-24">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-pretty text-center text-4xl sm:text-5xl md:text-6xl lg:text-[clamp(50px,7vw,80px)] font-bold leading-[1.1] tracking-tight text-gray-900 dark:text-white"
              >
                Your Complete{" "}
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  HR Ecosystem
                </span>
                <br />
                Powered by AI
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl text-pretty text-center leading-relaxed"
              >
                Streamline recruitment, onboarding, and team management with
                intelligent automation. Built for modern HR teams.
              </motion.p>
            </div>
          </div>

          {/* CTA Buttons - Original Stacked Layout */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex items-start justify-center divide-y divide-white/10 px-8 sm:px-24"
          >
            <div className="flex w-full max-w-[80vw] flex-col items-center justify-start md:!max-w-[392px]">
              <Link href="/demo" className="cursor-pointer w-full">
                <div className="!h-14 flex-col items-center justify-center rounded-none !text-base flex w-full !border-x !border-y-0 border-white/10 !bg-transparent backdrop-blur-xl transition-colors duration-150 hover:!bg-black/5 dark:hover:!bg-white/5 text-gray-800 dark:text-white font-medium">
                  Learn more
                </div>
              </Link>
              <Link href="/signup" className="cursor-pointer w-full">
                <div className="text-white !h-14 flex-col items-center justify-center rounded-none border-none !text-base flex w-full border-[1.2px] border-white/5 bg-gradient-to-tr from-purple-800 via-purple-700 to-purple-400 font-medium transition-all duration-300 hover:opacity-90">
                  Get started
                </div>
              </Link>
            </div>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-6 py-6 text-sm text-gray-600 dark:text-gray-300"
          >
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-green-500" />
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-green-500" />
              <span>Setup in minutes</span>
            </div>
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="relative mx-auto max-w-5xl px-6 py-8"
          >
            {/* Dashboard Image Container - No border effects, clean design */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/30">
              {/* Browser Top Bar */}
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-800/95 border-b border-white/5">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="flex items-center justify-center gap-2 px-4 py-1.5 bg-gray-700/60 rounded-lg max-w-xs mx-auto">
                    <span className="text-xs text-gray-400">
                      app.workzone.tech
                    </span>
                  </div>
                </div>
              </div>

              {/* Image */}
              <Image
                className="w-full h-auto block"
                src="/assets/images/herodash.png"
                alt="WorkZone Dashboard Preview"
                width={2700}
                height={1440}
                priority
              />
            </div>
          </motion.div>

          {/* Logo Cloud - Positioned on black curve */}
          <div className="relative z-20 mx-auto max-w-7xl pt-12">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="text-center text-sm text-gray-300 mb-2"
            >
              Built with industry-leading technologies
            </motion.p>
            <AnimatedLogoCloud />
          </div>
        </div>
      </section>
    </>
  );
};

export default FUIHeroWithBorders;

const logos = [
  {
    name: "Next.js",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg",
  },
  {
    name: "TypeScript",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg",
  },
  {
    name: "Tailwind CSS",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg",
  },
  {
    name: "Python",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg",
  },
  {
    name: "FastAPI",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/fastapi/fastapi-original.svg",
  },
  {
    name: "PostgreSQL",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original.svg",
  },
  {
    name: "Redis",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/redis/redis-original.svg",
  },
  {
    name: "Docker",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-original.svg",
  },
];

const AnimatedLogoCloud = () => {
  return (
    <div className="w-full py-6">
      <div className="mx-auto w-full px-4 md:px-8">
        <div
          className="group relative flex gap-12 overflow-hidden"
          style={{
            maskImage:
              "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
          }}
        >
          {[...Array(2)].map((_, index) => (
            <div
              key={index}
              className="flex shrink-0 animate-logo-scroll flex-row items-center gap-16"
            >
              {logos.map((logo, key) => (
                <div
                  key={key}
                  className="flex flex-col items-center justify-center gap-2 px-2"
                >
                  <img
                    src={logo.url}
                    className="h-10 w-10 object-contain opacity-80 hover:opacity-100 transition-opacity grayscale hover:grayscale-0"
                    alt={logo.name}
                    title={logo.name}
                  />
                  <span className="text-xs text-white/60 font-medium whitespace-nowrap">
                    {logo.name}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
