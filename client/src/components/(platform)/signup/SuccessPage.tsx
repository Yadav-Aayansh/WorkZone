// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/* eslint-disable */

"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  CheckCircle2,
  Building2,
  ArrowRight,
  Sparkles,
  Users,
  Calendar,
  Mail,
  Globe,
  Clock,
} from "lucide-react";
import { SignupData } from "@/app/(platform)/(auth)/signup/page";
import Link from "next/link";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";

interface SuccessPageProps {
  signupData: SignupData;
}

// Floating particle component
const FloatingParticle = ({
  delay,
  duration,
  size,
  color,
  className,
}: {
  delay: number;
  duration: number;
  size: number;
  color: string;
  className?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{
      opacity: [0, 1, 0],
      scale: [0.5, 1, 0.5],
      y: [0, -100, -200],
      x: [0, Math.random() * 40 - 20, Math.random() * 80 - 40],
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: "easeOut",
    }}
    className={`absolute rounded-full ${className}`}
    style={{
      width: size,
      height: size,
      background: color,
    }}
  />
);

export default function SuccessPage({ signupData }: SuccessPageProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Enhanced confetti celebration
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;

    const colors = ["#6366f1", "#8b5cf6", "#a855f7", "#22c55e", "#fbbf24"];

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function () {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        particleCount,
        startVelocity: 40,
        spread: 360,
        ticks: 80,
        zIndex: 0,
        colors,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        particleCount,
        startVelocity: 40,
        spread: 360,
        ticks: 80,
        zIndex: 0,
        colors,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  const planNames = {
    "3_months": "3 Months",
    "6_months": "6 Months",
    "12_months": "12 Months",
  } as const;

  const planIcons = {
    "3_months": <Clock className="w-5 h-5" />,
    "6_months": <Clock className="w-5 h-5" />,
    "12_months": <Clock className="w-5 h-5" />,
  } as const;

  return (
    <div className="h-screen w-full flex relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />

        {/* Animated Gradient Orbs */}
        <motion.div
          animate={{
            opacity: [0.3, 0.5, 0.3],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-[100px]"
        />
        <motion.div
          animate={{
            opacity: [0.2, 0.4, 0.2],
            scale: [1, 1.15, 1],
          }}
          transition={{ duration: 10, repeat: Infinity, delay: 2 }}
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-purple-600/20 blur-[100px]"
        />
        <motion.div
          animate={{
            opacity: [0.2, 0.35, 0.2],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 12, repeat: Infinity, delay: 4 }}
          className="absolute top-1/2 right-1/3 w-[300px] h-[300px] rounded-full bg-emerald-600/15 blur-[80px]"
        />

        {/* Floating Particles */}
        {[...Array(15)].map((_, i) => (
          <FloatingParticle
            key={i}
            delay={i * 0.5}
            duration={4 + Math.random() * 3}
            size={4 + Math.random() * 6}
            color={
              ["#6366f1", "#8b5cf6", "#22c55e", "#fbbf24"][
                Math.floor(Math.random() * 4)
              ]
            }
            className={`left-[${10 + Math.random() * 80}%] bottom-[${
              10 + Math.random() * 20
            }%]`}
            style={{
              left: `${10 + Math.random() * 80}%`,
              bottom: `${10 + Math.random() * 20}%`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full p-4 md:p-8">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-6"
        >
          <Image
            src="/assets/images/WorkZone_Light.png"
            alt="WorkZone"
            width={40}
            height={40}
            className="object-contain"
            priority
          />
          <span className="text-2xl font-bold text-white">WorkZone</span>
        </motion.div>

        {/* Success Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-2xl"
        >
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-6 md:p-8">
            {/* Success Icon */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  delay: 0.4,
                  type: "spring",
                  stiffness: 200,
                  damping: 10,
                }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 mb-4 shadow-lg shadow-emerald-500/30"
              >
                <CheckCircle2 className="w-10 h-10 text-white" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-2xl md:text-3xl font-bold text-white mb-2"
              >
                You're All Set! 🎉
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-indigo-200/80 text-lg"
              >
                Your workspace is ready to transform HR
              </motion.p>
            </div>

            {/* Workspace Info Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-5 mb-6 border border-white/10"
            >
              {/* Company Header */}
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/10">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {signupData.companyName}
                  </h2>
                  <div className="flex items-center gap-1.5 text-indigo-300/80 text-sm">
                    <Globe className="w-3.5 h-3.5" />
                    <span>{signupData.tenantId}.workzone.tech</span>
                  </div>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <div className="flex items-center gap-2 text-indigo-300/60 text-xs mb-2">
                    <Users className="w-3.5 h-3.5" />
                    Owner
                  </div>
                  <p className="text-white font-medium truncate">
                    {signupData.fullName}
                  </p>
                </div>

                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <div className="flex items-center gap-2 text-indigo-300/60 text-xs mb-2">
                    <Mail className="w-3.5 h-3.5" />
                    Email
                  </div>
                  <p className="text-white font-medium truncate">
                    {signupData.email}
                  </p>
                </div>

                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <div className="flex items-center gap-2 text-indigo-300/60 text-xs mb-2">
                    <Calendar className="w-3.5 h-3.5" />
                    Plan
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-emerald-400">
                      {signupData.plan && planIcons[signupData.plan]}
                    </div>
                    <p className="text-white font-medium text-sm">
                      {signupData.plan
                        ? planNames[signupData.plan]
                        : "Not selected"}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="text-center"
            >
              <Button
                asChild
                size="lg"
                className="h-14 px-10 text-base font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-xl shadow-lg shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40 hover:scale-105"
              >
                <Link href="/dashboard">
                  Launch Dashboard
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </motion.div>

            {/* Email Confirmation */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mt-8 text-center text-sm text-indigo-200/50"
            >
              ✉️ A confirmation email has been sent to{" "}
              <span className="text-indigo-300">{signupData.email}</span>
            </motion.p>
          </div>
        </motion.div>

        {/* Quick Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-8 flex flex-wrap justify-center gap-4"
        >
          {[
            "Set up your first job posting",
            "Invite team members",
            "Configure AI features",
          ].map((tip, index) => (
            <div
              key={index}
              className="flex items-center gap-2 text-sm text-indigo-200/60 bg-white/5 px-4 py-2 rounded-full border border-white/10"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {tip}
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
