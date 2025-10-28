"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import AccountCreation from "@/components/(platform)/signup/AccountCreation";
import WorkspaceOnboarding from "@/components/(platform)/signup/WorkspaceOnboarding";
import PaymentPlans from "@/components/(platform)/signup/PaymentPlans";
import SuccessPage from "@/components/(platform)/signup/SuccessPage";

export interface SignupData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  companyName: string;
  logo: File | null;
  tenantId: string;
  plan: "3_months" | "6_months" | "12_months" | null;
  paymentId?: string;
}

export default function SignupPage() {
  const searchParams = useSearchParams();
  const initialStep = parseInt(searchParams.get("step") || "1", 10);
  const [step, setStep] = useState(initialStep);
  const [signupData, setSignupData] = useState<SignupData>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    logo: null,
    tenantId: "",
    plan: null,
  });

  // Update step when URL parameter changes
  useEffect(() => {
    const stepParam = parseInt(searchParams.get("step") || "1", 10);
    if (stepParam >= 1 && stepParam <= 4) {
      setStep(stepParam);
    }
  }, [searchParams]);

  const handleNext = (data: Partial<SignupData>) => {
    setSignupData((prev) => ({ ...prev, ...data }));
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  return (
    <div className="min-h-screen w-full overflow-hidden bg-background">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="account"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <AccountCreation onNext={handleNext} initialData={signupData} />
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="workspace"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <WorkspaceOnboarding
              onNext={handleNext}
              onBack={handleBack}
              initialData={signupData}
            />
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="payment"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <PaymentPlans
              onNext={handleNext}
              onBack={handleBack}
              initialData={signupData}
            />
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <SuccessPage signupData={signupData} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
