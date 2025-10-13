"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AccountCreation from "@/components/signup/AccountCreation";
import WorkspaceOnboarding from "@/components/signup/WorkspaceOnboarding";
import PaymentPlans from "@/components/signup/PaymentPlans";
import SuccessPage from "@/components/signup/SuccessPage";

export interface SignupData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  companyName: string;
  logo: File | null;
  tenantId: string;
  plan: "3-month" | "6-month" | "12-month" | null;
  paymentId?: string;
}

export default function SignupPage() {
  const [step, setStep] = useState(1);
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
