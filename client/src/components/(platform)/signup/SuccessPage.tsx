// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/* eslint-disable */

"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Building2, ArrowRight } from "lucide-react";
import { SignupData } from "@/app/(platform)/(auth)/signup/page";
import { Logo } from "@/components/logo";
import Link from "next/link";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";

interface SuccessPageProps {
  signupData: SignupData;
}

export default function SuccessPage({ signupData }: SuccessPageProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const duration = 2 * 1000;
    const animationEnd = Date.now() + duration;

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function () {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 30 * (timeLeft / duration);

      confetti({
        particleCount,
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        zIndex: 0,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        particleCount,
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        zIndex: 0,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  const planNames = {
    "3_months": "Starter (3 Months)",
    "6_months": "Growth (6 Months)",
    "12_months": "Enterprise (12 Months)",
  } as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <div className="text-center mb-8">
          <Logo className="mx-auto mb-6" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-3xl shadow-2xl border p-8 md:p-12 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: "spring", bounce: 0.5 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 mb-6"
          >
            <CheckCircle2 className="w-10 h-10 text-white" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-3xl md:text-4xl font-bold mb-3"
          >
            Your Workspace is Ready! 🎉
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-muted-foreground mb-8"
          >
            Welcome to WorkZone!
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-6 mb-8 border"
          >
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <div className="text-left">
                <h2 className="text-xl font-bold">{signupData.companyName}</h2>
                <p className="text-sm text-muted-foreground">
                  {signupData.tenantId}.workzone.tech
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-3 text-left text-sm">
              <div className="bg-background/50 rounded-xl p-3">
                <p className="text-xs text-muted-foreground mb-1">Owner</p>
                <p className="font-semibold">{signupData.fullName}</p>
              </div>
              <div className="bg-background/50 rounded-xl p-3">
                <p className="text-xs text-muted-foreground mb-1">Plan</p>
                <p className="font-semibold text-sm">
                  {signupData.plan
                    ? planNames[signupData.plan]
                    : "Not selected"}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Button
              asChild
              size="lg"
              className="w-full md:w-auto h-11 px-8 text-sm font-medium bg-gradient-to-r from-primary to-accent hover:opacity-90 rounded-full"
            >
              <Link href="/dashboard">
                Go to Dashboard
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-6 text-xs text-muted-foreground"
          >
            A confirmation email has been sent to {signupData.email}
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
}
