"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Mail,
  Sparkles,
  Shield,
  KeyRound,
  CheckCircle2,
} from "lucide-react";
import { useRouter } from "next/navigation";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

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
    description: "Provide your account email",
    icon: <Mail className="w-4 h-4" />,
  },
  {
    number: "2",
    title: "Verify code",
    description: "Enter the code sent to you",
    icon: <Shield className="w-4 h-4" />,
  },
  {
    number: "3",
    title: "New password",
    description: "Create a secure password",
    icon: <KeyRound className="w-4 h-4" />,
  },
];

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setError("");
    try {
      // TODO: Implement forgot password API call
      console.log(data);
      // Redirect to verify code page
      router.push(`/verify-code?email=${encodeURIComponent(data.email)}`);
    } catch (err) {
      console.error(err);
      setError("Failed to send verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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
              Reset your password
            </h1>
            <p className="text-lg text-indigo-200/70 max-w-md">
              No worries! It happens to the best of us. We&apos;ll help you
              regain access to your account securely.
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
                  index === 0
                    ? "bg-white/10 border border-white/20"
                    : "bg-white/5 border border-white/5"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    index === 0
                      ? "bg-gradient-to-br from-indigo-500 to-purple-600"
                      : "bg-white/10"
                  }`}
                >
                  {step.icon}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    {step.title}
                  </h3>
                  <p className="text-xs text-indigo-200/60">
                    {step.description}
                  </p>
                </div>
                {index === 0 && (
                  <CheckCircle2 className="w-5 h-5 text-indigo-400 ml-auto" />
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
            href="/login"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
            Back to sign in
          </Link>

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-1">Forgot password?</h1>
            <p className="text-muted-foreground text-sm">
              Enter your email and we&apos;ll send you a verification code.
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

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">
                Email address
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="john@company.com"
                  className="h-11 pl-11 pr-4 rounded-xl border-border/50 bg-muted/30 focus:bg-background transition-colors"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40"
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                />
              ) : (
                <>
                  Send verification code
                  <ArrowRight className="ml-2 w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          {/* Sign In Link */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link
              href="/login"
              className="text-primary hover:underline font-medium"
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
