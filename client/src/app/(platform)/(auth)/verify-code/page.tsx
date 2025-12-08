"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Mail,
  Shield,
  KeyRound,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

// Floating orb component
const FloatingOrb = ({
  size,
  color,
  delay,
  duration,
  className,
}: {
  size: number;
  color: string;
  delay: number;
  duration: number;
  className?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{
      opacity: [0.3, 0.5, 0.3],
      scale: [1, 1.1, 1],
      y: [0, -20, 0],
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: "easeInOut",
    }}
    className={`absolute rounded-full blur-3xl ${className}`}
    style={{
      width: size,
      height: size,
      background: color,
    }}
  />
);

const steps = [
  {
    number: "1",
    title: "Enter email",
    description: "Provided account email",
    icon: <Mail className="w-4 h-4" />,
    completed: true,
  },
  {
    number: "2",
    title: "Verify code",
    description: "Enter the code sent to you",
    icon: <Shield className="w-4 h-4" />,
    completed: false,
    active: true,
  },
  {
    number: "3",
    title: "New password",
    description: "Create a secure password",
    icon: <KeyRound className="w-4 h-4" />,
    completed: false,
  },
];

function VerifyCodeContent() {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [countdown, setCountdown] = useState(120);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "your email";

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleVerify = async () => {
    if (code.length !== 4) return;

    setIsLoading(true);
    setError("");
    try {
      console.log("Verifying code:", code);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      router.push("/reset-password");
    } catch (err) {
      console.error(err);
      setError("Invalid verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = () => {
    setCountdown(120);
    setCode("");
    console.log("Resending code");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const maskedEmail =
    email.length > 20
      ? `${email.slice(0, 3)}***${email.slice(email.indexOf("@"))}`
      : email;

  return (
    <div className="h-screen w-full flex overflow-hidden">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
        {/* Animated Background Orbs */}
        <FloatingOrb
          size={400}
          color="rgba(99, 102, 241, 0.25)"
          delay={0}
          duration={10}
          className="top-0 -left-20"
        />
        <FloatingOrb
          size={300}
          color="rgba(168, 85, 247, 0.2)"
          delay={2}
          duration={12}
          className="bottom-10 right-10"
        />
        <FloatingOrb
          size={200}
          color="rgba(59, 130, 246, 0.15)"
          delay={4}
          duration={14}
          className="top-1/2 right-1/4"
        />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center w-full p-12">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">WorkZone</span>
            </div>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              Check your inbox
            </h1>
            <p className="text-lg text-indigo-200/70 max-w-md">
              We&apos;ve sent a 4-digit verification code to your email. Enter
              it below to continue.
            </p>
          </motion.div>

          {/* Steps */}
          <div className="max-w-md space-y-3">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                  step.active
                    ? "bg-white/10 border border-white/20"
                    : step.completed
                    ? "bg-white/5 border border-white/5"
                    : "bg-white/5 border border-white/5"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    step.completed
                      ? "bg-emerald-500/20"
                      : step.active
                      ? "bg-gradient-to-br from-indigo-500 to-purple-600"
                      : "bg-white/10"
                  }`}
                >
                  {step.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    step.icon
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    {step.title}
                  </h3>
                  <p className="text-xs text-indigo-200/60">
                    {step.description}
                  </p>
                </div>
                {step.active && (
                  <div className="w-2 h-2 rounded-full bg-indigo-400 ml-auto animate-pulse" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-4 md:p-8 bg-background relative overflow-hidden">
        {/* Subtle Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(99,102,241,0.05),transparent_50%)]" />

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md relative z-10"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden mb-6 flex justify-center">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">WorkZone</span>
            </div>
          </div>

          {/* Back Link */}
          <Link
            href="/forgot-password"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
            Back
          </Link>

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-1">Enter verification code</h1>
            <p className="text-muted-foreground text-sm">
              We sent a code to{" "}
              <span className="font-medium text-foreground">{maskedEmail}</span>
            </p>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-xl"
              >
                <p className="text-sm text-destructive">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* OTP Input */}
          <div className="space-y-6">
            <div className="flex flex-col items-center">
              <InputOTP
                maxLength={4}
                value={code}
                onChange={(value) => setCode(value)}
                className="gap-3"
              >
                <InputOTPGroup className="gap-3">
                  {[0, 1, 2, 3].map((index) => (
                    <InputOTPSlot
                      key={index}
                      index={index}
                      className="w-14 h-14 text-xl font-semibold rounded-xl border-2 border-border/50 bg-muted/30 focus:bg-background focus:border-primary transition-all"
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>

              {/* Timer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-4 flex items-center gap-2 text-sm text-muted-foreground"
              >
                {countdown > 0 ? (
                  <>
                    <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center">
                      <span className="text-xs font-medium">
                        {formatTime(countdown)}
                      </span>
                    </div>
                    <span>until you can resend</span>
                  </>
                ) : (
                  <button
                    onClick={handleResend}
                    className="flex items-center gap-2 text-primary hover:underline font-medium group"
                  >
                    <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                    Resend code
                  </button>
                )}
              </motion.div>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleVerify}
              disabled={isLoading || code.length !== 4}
              className="w-full h-11 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40 disabled:opacity-50"
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                />
              ) : (
                <>
                  Verify & continue
                  <ArrowRight className="ml-2 w-4 h-4" />
                </>
              )}
            </Button>

            {/* Help Text */}
            <p className="text-center text-xs text-muted-foreground">
              Didn&apos;t receive the email? Check your spam folder or{" "}
              <Link
                href="/forgot-password"
                className="text-primary hover:underline"
              >
                try a different email
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function VerifyCodePage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-full flex items-center justify-center bg-background">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full"
          />
        </div>
      }
    >
      <VerifyCodeContent />
    </Suspense>
  );
}
