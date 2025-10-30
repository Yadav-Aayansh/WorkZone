"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { Logo } from "@/components/logo";
import { useRouter, useSearchParams } from "next/navigation";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

function VerifyCodeContent() {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(24);
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
    console.log("Verifying code:", code);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    // Redirect to reset password page
    router.push("/reset-password");
  };

  const handleResend = () => {
    setCountdown(24);
    console.log("Resending code");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
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
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(200,100,255,0.3),transparent_70%)]" />

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative z-10 flex flex-col justify-center px-12 text-white"
          >
            <div className="mb-8">
              <Logo className="w-32" />
            </div>

            <h1 className="text-4xl font-bold mb-4">Secure Verification</h1>

            <p className="text-lg text-white/90 mb-8 leading-relaxed">
              Enter the verification code sent to your email to confirm your
              identity
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
                      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                    />
                  </svg>
                </div>
                <p className="text-sm text-white/90">
                  One-time code valid for 10 minutes
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
                <p className="text-sm text-white/90">
                  Multi-factor authentication
                </p>
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
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <p className="text-sm text-white/90">Protected against fraud</p>
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
              href="/forgot-password"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
            </Link>

            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-3">Verification Code</h2>
              <p className="text-sm text-muted-foreground">
                We sent you verification code on{" "}
                <span className="font-medium text-foreground">
                  {email.length > 25 ? `...${email.slice(-20)}` : email}
                </span>
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col items-center">
                <InputOTP
                  maxLength={4}
                  value={code}
                  onChange={(value) => setCode(value)}
                  className="gap-3"
                >
                  <InputOTPGroup className="gap-3">
                    <InputOTPSlot
                      index={0}
                      className="w-16 h-16 text-2xl rounded-2xl border-2"
                    />
                    <InputOTPSlot
                      index={1}
                      className="w-16 h-16 text-2xl rounded-2xl border-2"
                    />
                    <InputOTPSlot
                      index={2}
                      className="w-16 h-16 text-2xl rounded-2xl border-2"
                    />
                    <InputOTPSlot
                      index={3}
                      className="w-16 h-16 text-2xl rounded-2xl border-2"
                    />
                  </InputOTPGroup>
                </InputOTP>

                <div className="mt-4 text-sm text-muted-foreground">
                  Resend Code in:{" "}
                  <span className="font-semibold text-foreground">
                    {formatTime(countdown)}
                  </span>
                </div>
              </div>

              <Button
                onClick={handleVerify}
                disabled={isLoading || code.length !== 4}
                className="w-full h-12 text-sm font-medium bg-foreground text-background hover:bg-foreground/90 rounded-full"
              >
                {isLoading ? "Verifying..." : "Verify Code"}
              </Button>

              {countdown === 0 && (
                <button
                  onClick={handleResend}
                  className="w-full text-sm text-primary hover:underline font-medium"
                >
                  Resend Verification Code
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

export default function VerifyCodePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-900 via-accent/80 to-purple-900">
          <div className="text-white">Loading...</div>
        </div>
      }
    >
      <VerifyCodeContent />
    </Suspense>
  );
}
