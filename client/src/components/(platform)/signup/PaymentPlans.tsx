// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/* eslint-disable */

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Check,
  Sparkles,
  Shield,
  CreditCard,
  Clock,
  Star,
  Zap,
  Users,
  Brain,
  FileText,
  MessageSquare,
  BarChart3,
  Headphones,
} from "lucide-react";
import { SignupData } from "@/app/(platform)/(auth)/signup/page";
import { loadRazorpayScript } from "@/lib/razorpay";
import { subscriptionAPI, CreateOrderRequest } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";

interface PaymentPlansProps {
  onNext: (data: Partial<SignupData>) => void;
  onBack: () => void;
  initialData: SignupData;
}

interface Plan {
  id: "3_months" | "6_months" | "12_months";
  duration: string;
  months: number;
  price: number;
  perMonth: number;
  originalPrice?: number;
  discount?: string;
  recommended?: boolean;
}

const plans: Plan[] = [
  {
    id: "3_months",
    duration: "3 Months",
    months: 3,
    price: 29999,
    perMonth: 9999,
  },
  {
    id: "6_months",
    duration: "6 Months",
    months: 6,
    price: 49999,
    perMonth: 8333,
    originalPrice: 59997,
    discount: "17% OFF",
    recommended: true,
  },
  {
    id: "12_months",
    duration: "12 Months",
    months: 12,
    price: 99999,
    perMonth: 8333,
    originalPrice: 119988,
    discount: "17% OFF",
  },
];

// All features included in every plan
const allFeatures = [
  { icon: <Users className="w-4 h-4" />, text: "Unlimited Employees" },
  { icon: <Brain className="w-4 h-4" />, text: "AI Resume Screening" },
  {
    icon: <MessageSquare className="w-4 h-4" />,
    text: "AI Interview Assistant",
  },
  { icon: <FileText className="w-4 h-4" />, text: "JD Builder & Templates" },
  { icon: <BarChart3 className="w-4 h-4" />, text: "Advanced Analytics" },
  { icon: <Headphones className="w-4 h-4" />, text: "Priority Support" },
];

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
      opacity: [0.2, 0.4, 0.2],
      scale: [1, 1.1, 1],
      y: [0, -15, 0],
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

export default function PaymentPlans({
  onNext,
  onBack,
  initialData,
}: PaymentPlansProps) {
  const [selectedPlan, setSelectedPlan] = useState<
    "3_months" | "6_months" | "12_months" | null
  >(initialData.plan || "6_months");
  const [isProcessing, setIsProcessing] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const { updateStatus } = useAuth();

  useEffect(() => {
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
      alert(
        "Payment gateway is not configured. Please add your Razorpay API keys."
      );
      return;
    }

    setIsProcessing(true);

    try {
      const createOrderData: CreateOrderRequest = {
        plan: selectedPlan,
      };

      const orderResponse = await subscriptionAPI.createOrder(createOrderData);

      const razorpayOptions = {
        key: razorpayKey,
        amount: orderResponse.amount,
        currency: orderResponse.currency,
        name: "WorkZone HR Management",
        description: `${plan.duration} Subscription`,
        order_id: orderResponse.id,
        prefill: {
          name: initialData.fullName || "User",
          email: initialData.email || "",
        },
        theme: {
          color: "#6366f1",
        },
        handler: async (response: any) => {
          try {
            const updateOrderData = {
              order_id: response.razorpay_order_id,
              payment_id: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            };

            const verificationResponse = await subscriptionAPI.updateOrder(
              updateOrderData
            );

            if (
              verificationResponse.account_status &&
              verificationResponse.subscription_status
            ) {
              updateStatus(
                verificationResponse.account_status,
                verificationResponse.subscription_status
              );
            }

            onNext({
              plan: selectedPlan,
              paymentId: response.razorpay_payment_id,
            });
          } catch (error: any) {
            console.error("Payment verification error:", error);
            alert(
              "Payment verification failed. Please contact support with your payment ID: " +
                response.razorpay_payment_id
            );
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          },
        },
      };

      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error("Razorpay SDK failed to load");
      }

      const razorpay = new (window as any).Razorpay(razorpayOptions);
      razorpay.open();
    } catch (error: any) {
      console.error("Payment error:", error);
      alert(error?.message || "Failed to initiate payment. Please try again.");
      setIsProcessing(false);
    }
  };

  const selectedPlanData = plans.find((p) => p.id === selectedPlan);

  return (
    <div className="h-screen w-full flex flex-col lg:flex-row overflow-hidden">
      {/* Left Panel - Duration Selection */}
      <div className="w-full lg:w-[55%] relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 p-4 lg:p-8">
        {/* Animated Background Orbs */}
        <FloatingOrb
          size={350}
          color="rgba(99, 102, 241, 0.2)"
          delay={0}
          duration={10}
          className="top-0 -left-20"
        />
        <FloatingOrb
          size={250}
          color="rgba(168, 85, 247, 0.15)"
          delay={3}
          duration={12}
          className="bottom-20 right-10"
        />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />

        <div className="relative z-10 h-full flex flex-col">
          {/* Header */}
          <div className="mb-5">
            <button
              onClick={onBack}
              className="inline-flex items-center text-sm text-indigo-300/70 hover:text-white mb-6 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to workspace
            </button>

            {/* Step Indicator */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-indigo-500/30 text-indigo-300 flex items-center justify-center text-sm font-semibold">
                  <Check className="w-4 h-4" />
                </div>
                <div className="h-1 w-12 bg-indigo-500/50 rounded-full" />
                <div className="w-8 h-8 rounded-full bg-indigo-500/30 text-indigo-300 flex items-center justify-center text-sm font-semibold">
                  <Check className="w-4 h-4" />
                </div>
                <div className="h-1 w-12 bg-indigo-500 rounded-full" />
                <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm font-semibold">
                  3
                </div>
              </div>
            </div>

            <h1 className="text-2xl lg:text-3xl font-bold text-white mb-1">
              Choose your duration
            </h1>
            <p className="text-indigo-200/70">
              All features included • Pay once, use for months
            </p>
          </div>

          {/* Duration Cards */}
          <div className="space-y-3 mb-6">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.2 }}
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative rounded-2xl p-4 cursor-pointer transition-all duration-300 ${
                  selectedPlan === plan.id
                    ? "bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border-2 border-indigo-400/50 shadow-xl shadow-indigo-500/10"
                    : "bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Radio Circle */}
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        selectedPlan === plan.id
                          ? "border-indigo-400 bg-indigo-500"
                          : "border-white/30"
                      }`}
                    >
                      {selectedPlan === plan.id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-2 h-2 rounded-full bg-white"
                        />
                      )}
                    </div>

                    {/* Duration Info */}
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold text-white">
                          {plan.duration}
                        </h3>
                        {plan.recommended && (
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            BEST VALUE
                          </span>
                        )}
                        {plan.discount && (
                          <span className="text-[10px] font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full">
                            {plan.discount}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-white/60">
                        ₹{plan.perMonth.toLocaleString()}/month
                      </p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">
                      ₹{plan.price.toLocaleString()}
                    </div>
                    {plan.originalPrice && (
                      <div className="text-sm text-white/40 line-through">
                        ₹{plan.originalPrice.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* All Features Included */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/5 rounded-2xl p-4 border border-white/10"
          >
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-indigo-400" />
              <h3 className="font-semibold text-white">
                All Features Included
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {allFeatures.map((feature, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-sm text-white/70"
                >
                  <div className="text-indigo-400">{feature.icon}</div>
                  <span>{feature.text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Payment Summary */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center p-4 lg:p-8 bg-background relative overflow-hidden">
        {/* Subtle Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.05),transparent_50%)]" />

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative z-10 max-w-md mx-auto w-full"
        >
          {/* Logo */}
          <div className="flex items-center gap-2 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">WorkZone</span>
          </div>

          {/* Order Summary */}
          <div className="mb-5">
            <h2 className="text-xl font-bold mb-1">Order Summary</h2>
            <p className="text-muted-foreground text-sm">
              Complete your subscription
            </p>
          </div>

          {/* Selected Plan Card */}
          <AnimatePresence mode="wait">
            {selectedPlanData && (
              <motion.div
                key={selectedPlanData.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="rounded-2xl border border-border/50 bg-muted/30 p-5 mb-5"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">
                        {selectedPlanData.duration}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Full access to all features
                      </p>
                    </div>
                  </div>
                  {selectedPlanData.discount && (
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded-full">
                      {selectedPlanData.discount}
                    </span>
                  )}
                </div>

                <div className="border-t border-border/50 pt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">
                      {selectedPlanData.months} months × ₹
                      {selectedPlanData.perMonth.toLocaleString()}/mo
                    </span>
                    <span>
                      ₹
                      {(
                        selectedPlanData.perMonth * selectedPlanData.months
                      ).toLocaleString()}
                    </span>
                  </div>
                  {selectedPlanData.originalPrice && (
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Discount</span>
                      <span className="text-emerald-600">
                        -₹
                        {(
                          selectedPlanData.originalPrice -
                          selectedPlanData.price
                        ).toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-lg mt-3 pt-3 border-t border-border/50">
                    <span>Total</span>
                    <span>₹{selectedPlanData.price.toLocaleString()}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Payment Button */}
          <Button
            onClick={handlePayment}
            disabled={!selectedPlan || isProcessing || !razorpayLoaded}
            className="w-full h-12 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
              />
            ) : !razorpayLoaded ? (
              "Loading Payment Gateway..."
            ) : (
              <>
                <CreditCard className="w-5 h-5 mr-2" />
                Pay ₹{selectedPlanData?.price.toLocaleString() || 0}
              </>
            )}
          </Button>

          {/* Security Badges */}
          <div className="mt-6 flex items-center justify-center gap-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Shield className="w-4 h-4 text-green-500" />
              <span>Secured by Razorpay</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="text-xs text-muted-foreground">
              256-bit encryption
            </div>
          </div>

          {/* Payment Methods */}
          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground mb-3">
              We accept all major payment methods
            </p>
            <div className="flex items-center justify-center gap-3">
              {["UPI", "Cards", "Net Banking", "Wallets"].map((method) => (
                <span
                  key={method}
                  className="text-[10px] font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full"
                >
                  {method}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
