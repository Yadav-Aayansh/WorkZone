"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Check,
  Sparkles,
  Shield,
  Users,
  BarChart3,
  Brain,
} from "lucide-react";
import { useState, useEffect } from "react";
import { SignupData } from "@/app/(platform)/(auth)/signup/page";
import { authAPI, APIError } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";
import { useToast } from "@/providers/toast-provider";

const accountSchema = z
  .object({
    fullName: z
      .string()
      .min(3, "Name must be at least 3 characters")
      .max(100, "Name must be less than 100 characters"),
    email: z
      .string()
      .email("Invalid email address")
      .max(255, "Email must be less than 255 characters"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type AccountFormData = z.infer<typeof accountSchema>;

interface AccountCreationProps {
  onNext: (data: Partial<SignupData>) => void;
  initialData: SignupData;
}

// Password strength checker
const checkPasswordStrength = (password: string) => {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;
  return strength;
};

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
      opacity: [0.3, 0.6, 0.3],
      scale: [1, 1.2, 1],
      y: [0, -30, 0],
      x: [0, 15, 0],
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

export default function AccountCreation({
  onNext,
  initialData,
}: AccountCreationProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const { login } = useAuth();
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      fullName: initialData.fullName,
      email: initialData.email,
      password: initialData.password,
      confirmPassword: initialData.confirmPassword,
    },
  });

  const password = watch("password", "");
  const passwordStrength = checkPasswordStrength(password);

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Hiring",
      description: "Smart resume scoring & automated interviews",
      gradient: "from-violet-500 to-purple-600",
    },
    {
      icon: Users,
      title: "Team Management",
      description: "Centralized employee data & workflows",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description: "Data-driven HR insights & reports",
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-grade encryption & compliance",
      gradient: "from-orange-500 to-red-500",
    },
  ];

  const onSubmit = async (data: AccountFormData) => {
    if (!agreedToTerms) {
      setError("Please agree to the Terms & Conditions");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await authAPI.signup({
        name: data.fullName,
        email: data.email,
        password: data.password,
      });

      login(response);

      showToast({
        type: "success",
        title: "Account created successfully!",
        message: "Let's set up your workspace next.",
      });

      onNext(data);
    } catch (err) {
      if (err instanceof APIError) {
        setError(err.message);
        showToast({
          type: "error",
          title: "Signup failed",
          message: err.message,
        });
      } else {
        const errorMessage = "An unexpected error occurred. Please try again.";
        setError(errorMessage);
        showToast({
          type: "error",
          title: "Signup failed",
          message: errorMessage,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const strengthColors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-green-500",
  ];
  const strengthLabels = ["Weak", "Fair", "Good", "Strong"];

  return (
    <div className="h-screen w-full flex overflow-hidden">
      {/* Left Panel - Branding & Features */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-gradient-to-br from-slate-950 via-violet-950 to-slate-950">
        {/* Animated Background Orbs */}
        <FloatingOrb
          size={400}
          color="rgba(139, 92, 246, 0.3)"
          delay={0}
          duration={8}
          className="top-20 -left-20"
        />
        <FloatingOrb
          size={300}
          color="rgba(59, 130, 246, 0.2)"
          delay={2}
          duration={10}
          className="bottom-40 right-10"
        />
        <FloatingOrb
          size={200}
          color="rgba(236, 72, 153, 0.2)"
          delay={4}
          duration={12}
          className="top-1/2 left-1/3"
        />

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo & Tagline */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">WorkZone</span>
            </div>
            <p className="text-violet-200/70 text-lg max-w-md">
              The future of HR management, powered by artificial intelligence
            </p>
          </motion.div>

          {/* Features Carousel */}
          <div className="flex-1 flex items-center justify-center py-12">
            <div className="w-full max-w-lg">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFeature}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="text-center"
                >
                  {/* Feature Icon */}
                  <div
                    className={`inline-flex p-6 rounded-3xl bg-gradient-to-br ${features[activeFeature].gradient} mb-8 shadow-2xl`}
                  >
                    {(() => {
                      const Icon = features[activeFeature].icon;
                      return <Icon className="w-12 h-12 text-white" />;
                    })()}
                  </div>

                  {/* Feature Title */}
                  <h2 className="text-4xl font-bold text-white mb-4">
                    {features[activeFeature].title}
                  </h2>

                  {/* Feature Description */}
                  <p className="text-xl text-violet-200/80">
                    {features[activeFeature].description}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Feature Indicators */}
              <div className="flex justify-center gap-2 mt-12">
                {features.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveFeature(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === activeFeature
                        ? "w-8 bg-violet-500"
                        : "w-2 bg-white/20 hover:bg-white/40"
                    }`}
                  />
                ))}
              </div>

              {/* Tagline */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mt-10 flex items-center justify-center gap-3"
              >
                <div className="flex -space-x-2">
                  {[
                    "from-violet-400 to-purple-500",
                    "from-purple-400 to-pink-500",
                    "from-pink-400 to-rose-500",
                  ].map((gradient, i) => (
                    <div
                      key={i}
                      className={`w-8 h-8 rounded-full bg-gradient-to-br ${gradient} border-2 border-slate-950`}
                    />
                  ))}
                </div>
                <p className="text-sm text-violet-200/70">
                  Join the future of HR management
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-4 md:p-8 bg-background relative overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(139,92,246,0.05),transparent_50%)]" />

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md relative z-10"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden mb-5 flex justify-center">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">WorkZone</span>
            </div>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                1
              </div>
              <div className="h-1 w-12 bg-muted rounded-full" />
              <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-semibold">
                2
              </div>
              <div className="h-1 w-12 bg-muted rounded-full" />
              <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-semibold">
                3
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="mb-5">
            <h1 className="text-2xl font-bold mb-1">Create your account</h1>
            <p className="text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-primary hover:underline font-medium"
              >
                Sign in
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
                className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl"
              >
                <p className="text-sm text-destructive">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium">
                Full Name
              </Label>
              <Input
                id="fullName"
                {...register("fullName")}
                placeholder="John Doe"
                className="h-11 px-4 rounded-xl border-border/50 bg-muted/30 focus:bg-background transition-colors"
              />
              {errors.fullName && (
                <p className="text-xs text-destructive">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Work Email
              </Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="john@company.com"
                className="h-11 px-4 rounded-xl border-border/50 bg-muted/30 focus:bg-background transition-colors"
              />
              {errors.email && (
                <p className="text-xs text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  placeholder="Create a strong password"
                  className="h-12 px-4 pr-12 rounded-xl border-border/50 bg-muted/30 focus:bg-background transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {/* Password Strength Indicator */}
              {password && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-2"
                >
                  <div className="flex gap-1">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          i < passwordStrength
                            ? strengthColors[passwordStrength - 1]
                            : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Password strength:{" "}
                    <span
                      className={`font-medium ${
                        passwordStrength >= 3
                          ? "text-green-500"
                          : passwordStrength >= 2
                          ? "text-yellow-500"
                          : "text-red-500"
                      }`}
                    >
                      {strengthLabels[passwordStrength - 1] || "Too weak"}
                    </span>
                  </p>
                </motion.div>
              )}
              {errors.password && (
                <p className="text-xs text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  {...register("confirmPassword")}
                  placeholder="Confirm your password"
                  className="h-12 px-4 pr-12 rounded-xl border-border/50 bg-muted/30 focus:bg-background transition-colors"
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-destructive">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-3 pt-2">
              <button
                type="button"
                onClick={() => setAgreedToTerms(!agreedToTerms)}
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 mt-0.5 ${
                  agreedToTerms
                    ? "bg-primary border-primary"
                    : "border-muted-foreground/30 hover:border-primary/50"
                }`}
              >
                {agreedToTerms && <Check className="w-3 h-3 text-white" />}
              </button>
              <label className="text-sm text-muted-foreground leading-relaxed">
                I agree to the{" "}
                <Link href="/terms" className="text-primary hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
              </label>
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
                  Continue
                  <ArrowRight className="ml-2 w-5 h-5" />
                </>
              )}
            </Button>
          </form>

          {/* Security Badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground"
          >
            <Shield className="w-4 h-4" />
            <span>Your data is encrypted and secure</span>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
