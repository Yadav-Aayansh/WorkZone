"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, ArrowLeft, Upload, X, Building2, Loader2, Check } from "lucide-react";
import { useState, useRef } from "react";
import { SignupData } from "@/app/signup/page";
import { Logo } from "@/components/logo";
import Image from "next/image";

const workspaceSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  tenantId: z
    .string()
    .min(3, "Tenant ID must be at least 3 characters")
    .max(20, "Tenant ID must be less than 20 characters")
    .regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens allowed"),
});

type WorkspaceFormData = z.infer<typeof workspaceSchema>;

interface WorkspaceOnboardingProps {
  onNext: (data: Partial<SignupData>) => void;
  onBack: () => void;
  initialData: SignupData;
}

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
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    
    if (!tenantId) {
      const generatedId = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .slice(0, 20);
      setValue("tenantId", generatedId);
    }
  };

  const checkTenantAvailability = async (id: string) => {
    if (id.length < 3) {
      setIsAvailable(null);
      return;
    }
    
    setCheckingAvailability(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsAvailable(!id.startsWith("test"));
    setCheckingAvailability(false);
  };

  const handleTenantIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setValue("tenantId", value);
    checkTenantAvailability(value);
  };

  const handleFileChange = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      setLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileChange(file);
  };

  const onSubmit = (data: WorkspaceFormData) => {
    onNext({ ...data, logo });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-accent/10 via-primary/5 to-background p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl flex rounded-[2.5rem] overflow-hidden shadow-2xl bg-card border"
      >
        {/* Left Side - Workspace Preview */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-accent via-primary to-accent/90">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.1),transparent_50%)]" />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative z-10 flex flex-col justify-center items-center px-12 text-white"
          >
            <div className="mb-8">
              <Logo className="w-32" />
            </div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="w-full max-w-sm bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20"
            >
              <h3 className="text-sm font-medium text-white/70 mb-4 text-center">Workspace Preview</h3>
              
              {/* Preview Card */}
              <div className="bg-white rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center overflow-hidden">
                    {logoPreview ? (
                      <Image src={logoPreview} alt="Logo" width={64} height={64} className="object-contain w-full h-full" />
                    ) : (
                      <Building2 className="w-8 h-8 text-white" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">
                      {companyName || "Your Company"}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {tenantId || "yourcompany"}.workzone.tech
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="h-2 bg-primary/20 rounded-full w-full" />
                  <div className="h-2 bg-primary/20 rounded-full w-3/4" />
                  <div className="h-2 bg-primary/20 rounded-full w-1/2" />
                </div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-32 right-24 w-40 h-40 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20"
          />
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

            <button onClick={onBack} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </button>

            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">Set up your Workspace</h2>
              <p className="text-sm text-muted-foreground">
                Step 2 of 3
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <Label htmlFor="companyName" className="text-xs font-medium text-muted-foreground">
                  Brand / Company Name
                </Label>
                <Input
                  id="companyName"
                  {...register("companyName")}
                  onChange={handleCompanyNameChange}
                  placeholder="Acme Corporation"
                  className="mt-1 h-10 text-sm"
                />
                {errors.companyName && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.companyName.message}
                  </p>
                )}
              </div>

              <div>
                <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Logo
                </Label>
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors ${
                    isDragging ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  {logoPreview ? (
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden border bg-background">
                        <Image src={logoPreview} alt="Logo" width={48} height={48} className="object-contain w-full h-full" />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => { setLogo(null); setLogoPreview(""); }}
                        className="text-xs"
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-3">
                      <Upload className="w-5 h-5 text-muted-foreground" />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-sm text-primary hover:underline"
                      >
                        Upload logo
                      </button>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                  className="hidden"
                />
              </div>

              <div>
                <Label htmlFor="tenantId" className="text-xs font-medium text-muted-foreground">
                  Tenant ID
                </Label>
                <div className="mt-1 flex items-center gap-2">
                  <Input
                    id="tenantId"
                    {...register("tenantId")}
                    onChange={handleTenantIdChange}
                    placeholder="acme-corp"
                    className="h-10 text-sm"
                  />
                  {checkingAvailability && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                  {!checkingAvailability && isAvailable === true && <Check className="w-4 h-4 text-green-500" />}
                  {!checkingAvailability && isAvailable === false && <X className="w-4 h-4 text-destructive" />}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {tenantId || "yourcompany"}.workzone.tech
                </p>
                {errors.tenantId && (
                  <p className="text-xs text-destructive mt-1">{errors.tenantId.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={checkingAvailability || isAvailable === false}
                className="w-full h-10 text-sm font-medium bg-foreground text-background hover:bg-foreground/90 rounded-full"
              >
                Continue
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </form>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
