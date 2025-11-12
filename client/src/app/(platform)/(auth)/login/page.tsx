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
import { authAPI, APIError } from "@/lib/api";
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
  const { login, redirectAfterAuth } = useAuth();
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await authAPI.login({
        email: data.email,
        password: data.password,
      });

      // Store tokens and update auth state
      await login(response);

      showToast({
        type: "success",
        title: "Welcome back!",
        message: "Successfully logged in.",
      });

      // Redirect based on account status
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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-900 via-accent/80 to-purple-900 p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl flex rounded-[2.5rem] overflow-hidden shadow-2xl bg-card border"
      >
        {/* Left Side - Image */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-purple-950 via-accent/90 to-purple-950">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(200,100,255,0.3),transparent_70%)]" />

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative z-10 flex flex-col justify-center px-12 text-white"
          >
            <div className="mb-8">
              <Logo className="w-32" />
            </div>

            <h1 className="text-4xl font-bold mb-4">Welcome Back!</h1>

            <p className="text-lg text-white/90 mb-8 leading-relaxed">
              Access your HR dashboard and manage your workforce efficiently
            </p>

            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <p className="text-sm text-white/90">
                  Real-time workforce insights
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <p className="text-sm text-white/90">Secure & encrypted data</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="text-sm text-white/90">
                  24/7 system availability
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-12 bg-white dark:bg-card">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="w-full max-w-md"
          >
            <div className="lg:hidden mb-6 flex justify-center">
              <Logo />
            </div>

            <Link
              href="/client/public"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
            </Link>

            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">Log in</h2>
              <p className="text-sm text-muted-foreground">
                Don&#39;t have an account?{" "}
                <Link
                  href="/signup"
                  className="text-foreground hover:underline font-medium"
                >
                  Create an Account
                </Link>
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="john52martinez@gmail.com"
                  className="mt-1.5 h-12 text-sm rounded-full"
                />
                {errors.email && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative mt-1.5">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    placeholder="Password"
                    className="h-12 pr-10 text-sm rounded-full"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end">
                <Link
                  href="/forgot-password"
                  className="text-sm text-foreground hover:underline font-medium"
                >
                  Forgot Password?
                </Link>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 text-sm font-medium bg-foreground text-background hover:bg-foreground/90 rounded-full"
              >
                {isLoading ? "Logging in..." : "Log in"}
              </Button>
            </form>

            <div className="mt-6">
              <div className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  id="terms"
                  className="w-3.5 h-3.5 rounded border-border"
                />
                <label htmlFor="terms" className="text-muted-foreground">
                  I agree to the{" "}
                  <Link
                    href="/terms"
                    className="text-foreground hover:underline"
                  >
                    Terms & Condition
                  </Link>
                </label>
              </div>
            </div>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white dark:bg-card px-3 text-muted-foreground">
                    or
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 text-sm rounded-full"
                  onClick={() => {}}
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 text-sm rounded-full"
                  onClick={() => {}}
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Continue with Facebook
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
