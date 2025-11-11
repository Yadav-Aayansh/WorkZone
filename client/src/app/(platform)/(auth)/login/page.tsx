"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/logo";
import { useAuth } from "@/providers/auth-provider";
import { useToast } from "@/providers/toast-provider";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const { redirectAfterAuth } = useAuth();
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (_data: LoginFormData) => {
    setIsLoading(true);
    setError("");

    setTimeout(() => {
      showToast({
        type: "success",
        title: "Welcome back!",
        message: "Successfully logged in.",
      });
      redirectAfterAuth("ACTIVE");
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-purple-900 via-purple-700 to-indigo-900 p-4 md:p-8">
      {/* Animated gradient orbs */}
      <div className="absolute top-[-100px] left-[-100px] w-[300px] h-[300px] bg-purple-500/40 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-[-120px] right-[-100px] w-[350px] h-[350px] bg-pink-500/30 rounded-full blur-3xl animate-[pulse_6s_ease-in-out_infinite]" />
      <div className="absolute top-[30%] right-[20%] w-40 h-40 bg-indigo-400/20 rounded-full blur-3xl animate-[float_8s_ease-in-out_infinite]" />

      {/* Floating sparkles */}
      <motion.div
        animate={{ y: [0, -10, 0], opacity: [0.6, 1, 0.6] }}
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08)_0%,transparent_70%)]"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7 }}
        className="relative w-full max-w-5xl flex rounded-[2.5rem] overflow-hidden shadow-[0_0_80px_rgba(128,0,255,0.25)] border border-purple-300/20 bg-white/10 backdrop-blur-2xl"
      >
        {/* Animated border glow */}
        <div className="absolute inset-0 rounded-[2.5rem] border-2 border-transparent bg-gradient-to-r from-purple-500 via-fuchsia-500 to-indigo-500 animate-[spin_6s_linear_infinite] bg-[length:400%_400%] opacity-20" />

        {/* Left Side */}
        <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-center items-center text-white overflow-hidden">
          {/* Subtle animated glow */}
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
            className="absolute inset-0 bg-gradient-to-b from-purple-800/60 via-indigo-900/60 to-purple-950/70"
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="relative z-10 text-center px-10"
          >
            <Logo className="w-32 mx-auto mb-8" />
            <motion.h1
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="text-5xl font-extrabold bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent drop-shadow-lg mb-4"
            >
              Welcome Back 👋
            </motion.h1>
            <p className="text-lg text-purple-100/90 leading-relaxed max-w-md mx-auto">
              Manage, track, and empower your workforce — all from one beautiful
              dashboard.
            </p>
          </motion.div>
        </div>

        {/* Right Side */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-12 bg-white/90 backdrop-blur-lg relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="w-full max-w-md"
          >
            <Link
              href="/"
              className="inline-flex items-center text-sm text-purple-600 hover:text-purple-800 mb-8 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Link>

            <div className="mb-8 text-center">
              <h2 className="text-3xl font-extrabold text-purple-800 mb-2">
                Log in
              </h2>
              <p className="text-sm text-muted-foreground">
                Don’t have an account?{" "}
                <Link
                  href="/signup"
                  className="text-purple-700 font-semibold hover:underline"
                >
                  Create one
                </Link>
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <motion.div whileHover={{ scale: 1.02 }}>
                <Label htmlFor="email" className="text-sm font-semibold">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="you@example.com"
                  className="mt-1.5 h-12 text-sm rounded-xl border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-400/40 transition-all"
                />
                {errors.email && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.email.message}
                  </p>
                )}
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }}>
                <Label htmlFor="password" className="text-sm font-semibold">
                  Password
                </Label>
                <div className="relative mt-1.5">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    placeholder="••••••••"
                    className="h-12 pr-10 text-sm rounded-xl border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-400/40 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-500 hover:text-purple-700"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.password.message}
                  </p>
                )}
              </motion.div>

              <div className="flex items-center justify-end">
                <Link
                  href="/forgot-password"
                  className="text-sm text-purple-700 hover:underline font-medium"
                >
                  Forgot Password?
                </Link>
              </div>

              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 text-sm font-semibold rounded-xl bg-gradient-to-r from-purple-700 via-fuchsia-600 to-indigo-600 text-white shadow-lg relative overflow-hidden"
                >
                  <span className="relative z-10">
                    {isLoading ? "Logging in..." : "Log in"}
                  </span>
                  <motion.div
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{
                      repeat: Infinity,
                      duration: 2.5,
                      ease: "linear",
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  />
                </Button>
              </motion.div>
            </form>

            <div className="mt-6 flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                id="terms"
                className="w-3.5 h-3.5 rounded border-purple-300 text-purple-600 focus:ring-purple-500"
              />
              <label htmlFor="terms" className="text-muted-foreground">
                I agree to the{" "}
                <Link
                  href="/terms"
                  className="text-purple-700 hover:underline"
                >
                  Terms & Conditions
                </Link>
              </label>
            </div>

            <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-purple-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white/90 px-3 text-muted-foreground">
                  or continue with
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              {/* Google Button  */}
              <Button
                type="button"
                variant="outline"
                className="h-11 text-sm rounded-xl border-purple-300 hover:bg-purple-50 text-purple-700 flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48">
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.7 1.22 9.18 3.6l6.83-6.83C36.09 2.64 30.43 0 24 0 14.64 0 6.4 5.34 2.45 13.11l7.91 6.14C12.1 13.08 17.56 9.5 24 9.5z"
                  />
                  <path
                    fill="#34A853"
                    d="M46.15 24.55c0-1.6-.15-3.13-.43-4.55H24v8.61h12.44c-.54 2.77-2.16 5.13-4.6 6.72l7.11 5.52c4.16-3.83 6.6-9.47 6.6-16.3z"
                  />
                  <path
                    fill="#4A90E2"
                    d="M9.36 28.25A14.5 14.5 0 0 1 9 24c0-1.47.25-2.88.71-4.2l-7.91-6.14A23.98 23.98 0 0 0 0 24c0 3.91.94 7.6 2.58 10.86l7.78-6.61z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M24 48c6.48 0 11.91-2.13 15.88-5.79l-7.11-5.52C30.69 38.74 27.51 40 24 40c-6.45 0-11.91-3.58-14.64-8.75l-7.78 6.61C6.4 42.66 14.64 48 24 48z"
                  />
                </svg>
                Google
              </Button>

              {/* Facebook Button */}
              <Button
                type="button"
                variant="outline"
                className="h-11 text-sm rounded-xl border-purple-300 hover:bg-purple-50 text-purple-700 flex items-center justify-center"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
              </Button>
            </div>
          </div>

          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
