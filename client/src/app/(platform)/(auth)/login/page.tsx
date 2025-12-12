"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  Shield,
  Zap,
  BarChart3,
  Lock,
} from "lucide-react";
import { useState, useEffect } from "react";
import { authAPI, APIError } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";
import { useToast } from "@/providers/toast-provider";
import { useTheme } from "next-themes";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

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

const features = [
  {
    icon: <Zap className="w-5 h-5" />,
    title: "AI-Powered Hiring",
    description: "Smart resume screening & interview assistance",
  },
  {
    icon: <BarChart3 className="w-5 h-5" />,
    title: "Real-time Analytics",
    description: "Track your hiring pipeline efficiently",
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: "Enterprise Security",
    description: "Bank-level encryption for your data",
  },
];

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [activeFeature, setActiveFeature] = useState(0);
  const [mounted, setMounted] = useState(false);
  const { login, redirectAfterAuth } = useAuth();
  const { showToast } = useToast();
  const { resolvedTheme } = useTheme();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Mount effect for theme-aware logo
  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Theme-aware logo source
  const logoSrc = mounted
    ? resolvedTheme === "dark"
      ? "/assets/images/WorkZone_Light.png"
      : "/assets/images/WorkZone_Dark.png"
    : "/assets/images/WorkZone_Dark.png";

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await authAPI.login({
        email: data.email,
        password: data.password,
      });

      await login(response);

      showToast({
        type: "success",
        title: "Welcome back!",
        message: "Successfully logged in.",
      });

      redirectAfterAuth(response.account_status);
    } catch (err) {
      if (err instanceof APIError) {
        setError(err.message);
        showToast({
          type: "error",
          title: "Login failed",
          message: err.message,
        });
      } else {
        const errorMessage = "An unexpected error occurred. Please try again.";
        setError(errorMessage);
        showToast({
          type: "error",
          title: "Login failed",
          message: errorMessage,
        });
      }
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
              <Image
                src="/assets/images/WorkZone_Light.png"
                alt="WorkZone"
                width={40}
                height={40}
                className="object-contain"
                priority
              />
              <span className="text-2xl font-bold text-white">WorkZone</span>
            </div>
          </motion.div>

          {/* Welcome Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              Welcome back
            </h1>
            <p className="text-lg text-indigo-200/70 max-w-md">
              Access your HR dashboard and continue managing your workforce with
              AI-powered tools.
            </p>
          </motion.div>

          {/* Feature Carousel */}
          <div className="max-w-md">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeFeature}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    {features[activeFeature].icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {features[activeFeature].title}
                    </h3>
                    <p className="text-sm text-indigo-200/70">
                      {features[activeFeature].description}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Feature Indicators */}
            <div className="flex gap-2 mt-4">
              {features.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveFeature(index)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === activeFeature
                      ? "w-8 bg-indigo-400"
                      : "w-1.5 bg-white/30 hover:bg-white/50"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Tagline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12 flex items-center gap-3"
          >
            <div className="flex -space-x-2">
              {[
                "from-indigo-400 to-purple-500",
                "from-purple-400 to-pink-500",
                "from-pink-400 to-rose-500",
              ].map((gradient, i) => (
                <div
                  key={i}
                  className={`w-8 h-8 rounded-full bg-gradient-to-br ${gradient} border-2 border-slate-950`}
                />
              ))}
            </div>
            <p className="text-sm text-indigo-200/70">
              Built for modern HR teams
            </p>
          </motion.div>
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
              <Image
                src={logoSrc}
                alt="WorkZone"
                width={32}
                height={32}
                className="object-contain"
                priority
              />
              <span className="text-xl font-bold">WorkZone</span>
            </div>
          </div>

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-1">Sign in</h1>
            <p className="text-muted-foreground text-sm">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="text-primary hover:underline font-medium"
              >
                Create one
              </Link>
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
                Email
              </Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="name@company.com"
                className="h-11 px-4 rounded-xl border-border/50 bg-muted/30 focus:bg-background transition-colors"
              />
              {errors.email && (
                <p className="text-xs text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  placeholder="••••••••"
                  className="h-11 px-4 pr-12 rounded-xl border-border/50 bg-muted/30 focus:bg-background transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40"
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                />
              ) : (
                <>
                  Sign in
                  <ArrowRight className="ml-2 w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          {/* Security Badge */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Lock className="w-3 h-3" />
            <span>Secured with 256-bit encryption</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
