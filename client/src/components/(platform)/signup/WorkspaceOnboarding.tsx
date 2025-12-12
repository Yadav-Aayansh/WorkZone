"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowRight,
  ArrowLeft,
  Building2,
  Loader2,
  Check,
  X,
  Globe,
  Sparkles,
  ImageIcon,
} from "lucide-react";
import { useState, useRef, useCallback } from "react";
import { SignupData } from "@/app/(platform)/(auth)/signup/page";
import Image from "next/image";
import { authAPI, APIError } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";
import { useToast } from "@/providers/toast-provider";

const workspaceSchema = z.object({
  companyName: z
    .string()
    .min(3, "Company name must be at least 3 characters")
    .max(100, "Company name must be less than 100 characters"),
  tenantId: z
    .string()
    .min(3, "Tenant ID must be at least 3 characters")
    .max(50, "Tenant ID must be less than 50 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Only lowercase letters, numbers, and hyphens allowed"
    ),
});

type WorkspaceFormData = z.infer<typeof workspaceSchema>;

interface WorkspaceOnboardingProps {
  onNext: (data: Partial<SignupData>) => void;
  onBack: () => void;
  initialData: SignupData;
}

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

export default function WorkspaceOnboarding({
  onNext,
  onBack,
  initialData,
}: WorkspaceOnboardingProps) {
  const [logo, setLogo] = useState<File | null>(initialData.logo);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isAuthenticated, updateStatus } = useAuth();
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<WorkspaceFormData>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: {
      companyName: initialData.companyName,
      tenantId: initialData.tenantId,
    },
  });

  const companyName = watch("companyName");
  const tenantId = watch("tenantId");

  const handleCompanyNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setValue("companyName", value);

    if (!tenantId || tenantId === generateTenantId(companyName)) {
      const generatedId = generateTenantId(value);
      setValue("tenantId", generatedId);
      if (generatedId.length >= 3) {
        checkTenantAvailability(generatedId);
      }
    }
  };

  const generateTenantId = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 20);
  };

  const checkTenantAvailability = useCallback(async (id: string) => {
    if (id.length < 3) {
      setIsAvailable(null);
      return;
    }

    setCheckingAvailability(true);
    try {
      const { platformClientAPI } = await import("@/lib/api");
      const response = await platformClientAPI.checkTenantAvailability(id);
      setIsAvailable(response.available);
    } catch (err) {
      console.error("Error checking tenant availability:", err);
      setIsAvailable(null);
    } finally {
      setCheckingAvailability(false);
    }
  }, []);

  const handleTenantIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setValue("tenantId", value);
    checkTenantAvailability(value);
  };

  // Valid image formats for logo upload
  const VALID_IMAGE_TYPES = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/gif",
    "image/webp",
    "image/svg+xml",
  ];
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

  const handleFileChange = (file: File) => {
    if (!file) return;

    // Check file type
    if (!VALID_IMAGE_TYPES.includes(file.type)) {
      setError(
        "Invalid file format. Please upload a PNG, JPG, GIF, WebP, or SVG image."
      );
      return;
    }

    // Check file size (5MB limit)
    if (file.size > MAX_FILE_SIZE) {
      setError("File size exceeds 5MB limit. Please upload a smaller image.");
      return;
    }

    setError(""); // Clear any previous errors
    setLogo(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileChange(file);
  };

  const onSubmit = async (data: WorkspaceFormData) => {
    if (!logo) {
      setError("Please upload a logo for your workspace.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      if (!isAuthenticated) {
        setError("Please sign up first to set up your workspace.");
        showToast({
          type: "error",
          title: "Authentication required",
          message: "Please sign up first to continue.",
        });
        return;
      }

      const response = await authAPI.onboarding({
        tenant_id: data.tenantId,
        brand_name: data.companyName,
        logo: logo,
      });

      updateStatus(response.account_status, response.subscription_status);

      showToast({
        type: "success",
        title: "Workspace setup complete!",
        message: `Welcome to ${data.companyName}. Let's choose your plan.`,
      });

      onNext({ ...data, logo });
    } catch (err) {
      if (err instanceof APIError) {
        setError(err.message);
        showToast({
          type: "error",
          title: "Workspace setup failed",
          message: err.message,
        });
      } else {
        const errorMessage = "An unexpected error occurred. Please try again.";
        setError(errorMessage);
        showToast({
          type: "error",
          title: "Workspace setup failed",
          message: errorMessage,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex overflow-hidden">
      {/* Left Panel - Interactive Preview */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
        {/* Animated Background Orbs */}
        <FloatingOrb
          size={350}
          color="rgba(99, 102, 241, 0.25)"
          delay={0}
          duration={10}
          className="top-10 -left-20"
        />
        <FloatingOrb
          size={250}
          color="rgba(168, 85, 247, 0.2)"
          delay={3}
          duration={12}
          className="bottom-20 right-20"
        />
        <FloatingOrb
          size={180}
          color="rgba(59, 130, 246, 0.15)"
          delay={5}
          duration={14}
          className="top-1/3 right-1/4"
        />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12">
          {/* Logo & Title */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
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
            <p className="text-indigo-200/70 text-sm">
              Creating your workspace
            </p>
          </motion.div>

          {/* Live Preview Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="w-full max-w-md"
          >
            {/* Browser Chrome */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-t-2xl border border-white/10 p-3">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-slate-900/50 rounded-lg px-4 py-1.5 flex items-center gap-2 text-xs">
                    <Globe className="w-3 h-3 text-slate-400" />
                    <span className="text-slate-300">
                      {tenantId || "yourcompany"}.workzone.tech
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview Content */}
            <div className="bg-gradient-to-b from-slate-900/90 to-slate-900/70 backdrop-blur-xl rounded-b-2xl border border-t-0 border-white/10 p-8">
              {/* Header Preview */}
              <div className="flex items-center gap-4 mb-8 pb-6 border-b border-white/10">
                <motion.div
                  className="w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center shadow-xl"
                  style={{
                    background: logoPreview
                      ? "transparent"
                      : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  }}
                  animate={
                    logoPreview
                      ? {}
                      : {
                          background: [
                            "linear-gradient(135deg, #6366f1, #8b5cf6)",
                            "linear-gradient(135deg, #8b5cf6, #ec4899)",
                            "linear-gradient(135deg, #ec4899, #6366f1)",
                          ],
                        }
                  }
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  {logoPreview ? (
                    <Image
                      src={logoPreview}
                      alt="Logo"
                      width={64}
                      height={64}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <Building2 className="w-8 h-8 text-white" />
                  )}
                </motion.div>
                <div>
                  <motion.h2
                    className="text-xl font-bold text-white"
                    key={companyName}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    {companyName || "Your Company"}
                  </motion.h2>
                  <p className="text-sm text-slate-400">HR Management Portal</p>
                </div>
              </div>

              {/* Mock Dashboard */}
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {["Employees", "Open Jobs", "Interviews"].map(
                    (label, index) => (
                      <motion.div
                        key={label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        className="bg-white/5 rounded-xl p-3 text-center border border-white/5"
                      >
                        <div className="text-2xl font-bold text-white mb-1">
                          --
                        </div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                          {label}
                        </div>
                      </motion.div>
                    )
                  )}
                </div>

                {/* Placeholder Content Lines */}
                <div className="space-y-2 mt-6">
                  <div className="h-3 bg-white/10 rounded-full w-full" />
                  <div className="h-3 bg-white/10 rounded-full w-4/5" />
                  <div className="h-3 bg-white/10 rounded-full w-3/5" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Bottom Info */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center text-sm text-indigo-300/50 mt-8"
          >
            Your workspace will be ready in seconds
          </motion.p>
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
          <div className="lg:hidden mb-5 flex justify-center">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">WorkZone</span>
            </div>
          </div>

          {/* Back Button */}
          <button
            onClick={onBack}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back
          </button>

          {/* Step Indicator */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-semibold">
                <Check className="w-4 h-4" />
              </div>
              <div className="h-1 w-12 bg-primary rounded-full" />
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
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
            <h1 className="text-2xl font-bold mb-1">Set up your workspace</h1>
            <p className="text-muted-foreground">
              Create your company&apos;s HR portal
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
            {/* Company Name */}
            <div className="space-y-2">
              <Label htmlFor="companyName" className="text-sm font-medium">
                Company Name
              </Label>
              <Input
                id="companyName"
                {...register("companyName")}
                onChange={handleCompanyNameChange}
                placeholder="WORKZONE"
                className="h-11 px-4 rounded-xl border-border/50 bg-muted/30 focus:bg-background transition-colors"
              />
              {errors.companyName && (
                <p className="text-xs text-destructive">
                  {errors.companyName.message}
                </p>
              )}
            </div>

            {/* Logo Upload */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Company Logo</Label>
              <div
                onDrop={handleDrop}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                className={`relative border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer ${
                  isDragging
                    ? "border-primary bg-primary/5 scale-[1.02]"
                    : "border-border/50 hover:border-primary/50 hover:bg-muted/30"
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <AnimatePresence mode="wait">
                  {logoPreview ? (
                    <motion.div
                      key="preview"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center gap-4"
                    >
                      <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-primary/20 shadow-lg">
                        <Image
                          src={logoPreview}
                          alt="Logo"
                          width={64}
                          height={64}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium truncate">
                          {logo?.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Click to change
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLogo(null);
                          setLogoPreview("");
                        }}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="upload"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-3"
                    >
                      <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center mx-auto">
                        <ImageIcon className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          Drop your logo here or{" "}
                          <span className="text-primary">browse</span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          PNG, JPG, GIF, WebP, SVG up to 5MB
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/gif,image/webp,image/svg+xml"
                onChange={(e) =>
                  e.target.files?.[0] && handleFileChange(e.target.files[0])
                }
                className="hidden"
              />
            </div>

            {/* Tenant ID */}
            <div className="space-y-2">
              <Label htmlFor="tenantId" className="text-sm font-medium">
                Workspace URL
              </Label>
              <div className="relative">
                <Input
                  id="tenantId"
                  value={tenantId}
                  onChange={handleTenantIdChange}
                  placeholder="workzone"
                  className="h-11 px-4 pr-12 rounded-xl border-border/50 bg-muted/30 focus:bg-background transition-colors"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  {checkingAvailability && (
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  )}
                  {!checkingAvailability && isAvailable === true && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center"
                    >
                      <Check className="w-3 h-3 text-white" />
                    </motion.div>
                  )}
                  {!checkingAvailability && isAvailable === false && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-5 h-5 rounded-full bg-destructive flex items-center justify-center"
                    >
                      <X className="w-3 h-3 text-white" />
                    </motion.div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Globe className="w-3 h-3" />
                <span>
                  {tenantId || "yourcompany"}
                  <span className="text-foreground">.workzone.tech</span>
                </span>
              </div>
              {errors.tenantId && (
                <p className="text-xs text-destructive">
                  {errors.tenantId.message}
                </p>
              )}
              {!checkingAvailability && isAvailable === false && (
                <p className="text-xs text-destructive">
                  This URL is already taken. Try another one.
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={
                checkingAvailability ||
                isAvailable === false ||
                isLoading ||
                !logo
              }
              className="w-full h-11 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                />
              ) : (
                <>
                  Continue to Plans
                  <ArrowRight className="ml-2 w-5 h-5" />
                </>
              )}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
