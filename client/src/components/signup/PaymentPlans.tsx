"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, Sparkles, Zap, Crown } from "lucide-react";
import { SignupData } from "@/app/signup/page";
import { Logo } from "@/components/logo";
import { initiatePayment, loadRazorpayScript, RazorpayResponse } from "@/lib/razorpay";

interface PaymentPlansProps {
  onNext: (data: Partial<SignupData>) => void;
  onBack: () => void;
  initialData: SignupData;
}

interface Plan {
  id: "3-month" | "6-month" | "12-month";
  name: string;
  duration: string;
  price: number;
  originalPrice?: number;
  discount?: string;
  recommended?: boolean;
  icon: React.ReactNode;
  features: string[];
}

const plans: Plan[] = [
  {
    id: "3-month",
    name: "Starter",
    duration: "3 Months",
    price: 4999,
    icon: <Sparkles className="w-5 h-5" />,
    features: ["Up to 50 employees", "Basic HR features", "Email support"],
  },
  {
    id: "6-month",
    name: "Growth",
    duration: "6 Months",
    price: 8999,
    originalPrice: 9999,
    discount: "SAVE 10%",
    recommended: true,
    icon: <Zap className="w-5 h-5" />,
    features: ["Up to 200 employees", "All HR features", "Priority support"],
  },
  {
    id: "12-month",
    name: "Enterprise",
    duration: "12 Months",
    price: 15999,
    originalPrice: 19999,
    discount: "SAVE 20%",
    icon: <Crown className="w-5 h-5" />,
    features: ["Unlimited employees", "Enterprise features", "24/7 support"],
  },
];

export default function PaymentPlans({
  onNext,
  onBack,
  initialData,
}: PaymentPlansProps) {
  const [selectedPlan, setSelectedPlan] = useState<"3-month" | "6-month" | "12-month" | null>(
    initialData.plan
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  useEffect(() => {
    // Preload Razorpay script
    loadRazorpayScript().then((loaded) => setRazorpayLoaded(loaded));
  }, []);

  const handlePayment = async () => {
    if (!selectedPlan) return;

    const plan = plans.find((p) => p.id === selectedPlan);
    if (!plan) return;

    if (!razorpayLoaded) {
      alert("Payment gateway is loading. Please try again in a moment.");
      return;
    }

    const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    if (!razorpayKey) {
      alert("Payment gateway is not configured. Please add your Razorpay API keys.");
      return;
    }

    setIsProcessing(true);

    try {
      const options = {
        key: razorpayKey,
        amount: plan.price * 100, // Razorpay accepts amount in paise (₹1 = 100 paise)
        currency: "INR",
        name: "HR Management System",
        description: `${plan.name} Plan - ${plan.duration}`,
        prefill: {
          name: initialData.fullName || "User",
          email: initialData.email || "",
        },
        theme: {
          color: "#8b5cf6", // Purple theme color
        },
        handler: (response: RazorpayResponse) => {
          console.log("Payment successful:", response);
          // Payment successful
          onNext({ 
            plan: selectedPlan,
            paymentId: response.razorpay_payment_id 
          });
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            console.log("Payment cancelled by user");
          },
        },
      };

      await initiatePayment(options);
    } catch (error) {
      console.error("Payment error:", error);
      alert("Failed to initiate payment. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 via-accent/10 to-background p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-6xl rounded-[2.5rem] overflow-hidden shadow-2xl bg-white dark:bg-card border p-8 md:p-12"
      >
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>

        <button onClick={onBack} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </button>

        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold mb-2">Choose Your Plan</h2>
          <p className="text-sm text-muted-foreground">
            Step 3 of 3 • Select the perfect subscription for your team
          </p>
        </div>

        {/* Plans - Horizontal Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.03, y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedPlan(plan.id)}
              className={`relative border-2 rounded-2xl p-5 cursor-pointer transition-all ${
                selectedPlan === plan.id
                  ? "border-primary bg-primary/5 shadow-xl"
                  : "border-border hover:border-primary/50 hover:shadow-lg"
              } ${plan.recommended ? "ring-2 ring-primary/30" : ""}`}
            >
              {plan.recommended && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                  <div className="bg-gradient-to-r from-primary to-accent text-white text-[10px] font-bold px-3 py-1 rounded-full">
                    RECOMMENDED
                  </div>
                </div>
              )}

              <div className="text-center mb-4">
                <div className={`inline-flex p-3 rounded-xl mb-3 ${selectedPlan === plan.id ? "bg-primary text-white" : "bg-muted"}`}>
                  {plan.icon}
                </div>
                <h3 className="font-bold text-base mb-1">{plan.name}</h3>
                <p className="text-xs text-muted-foreground mb-3">{plan.duration}</p>
                
                <div className="mb-3">
                  <div className="text-2xl font-bold">₹{plan.price.toLocaleString()}</div>
                  {plan.originalPrice && (
                    <div className="flex items-center justify-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground line-through">
                        ₹{plan.originalPrice.toLocaleString()}
                      </span>
                      {plan.discount && (
                        <span className="text-[10px] font-semibold text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded">
                          {plan.discount}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Check className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${selectedPlan === plan.id ? "text-primary" : "text-muted-foreground"}`} />
                    <span className="text-xs leading-relaxed">{feature}</span>
                  </div>
                ))}
              </div>

              {selectedPlan === plan.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-4 right-4 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-lg"
                >
                  <Check className="w-3.5 h-3.5 text-white" />
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        <div className="max-w-md mx-auto">
          <Button
            onClick={handlePayment}
            disabled={!selectedPlan || isProcessing || !razorpayLoaded}
            className="w-full h-11 text-sm font-medium bg-foreground text-background hover:bg-foreground/90 rounded-full"
          >
            {isProcessing 
              ? "Opening Payment Gateway..." 
              : !razorpayLoaded 
              ? "Loading Payment Gateway..."
              : `Pay ₹${plans.find(p => p.id === selectedPlan)?.price.toLocaleString() || 0}`}
          </Button>

          <p className="mt-4 text-xs text-center text-muted-foreground">
            🔒 Secured by Razorpay • UPI, Cards, Net Banking & More
          </p>
        </div>
      </motion.div>
    </div>
  );
}
