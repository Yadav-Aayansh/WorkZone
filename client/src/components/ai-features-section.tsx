"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  BrainCircuit,
  MessageSquare,
  FileText,
  Sparkles,
  Wand2,
  Target,
} from "lucide-react";
import { ReactNode } from "react";
import { motion } from "framer-motion";

const aiFeatures = [
  {
    icon: <BrainCircuit className="size-7" />,
    title: "Smart Resume Analysis",
    description:
      "Our AI instantly analyzes resumes, extracts key skills, and ranks candidates based on your job requirements.",
    gradient: "from-blue-500 to-cyan-500",
    bgGradient: "from-blue-500/10 to-cyan-500/10",
  },
  {
    icon: <MessageSquare className="size-7" />,
    title: "AI Interview Copilot",
    description:
      "Get real-time suggestions, follow-up questions, and comprehensive candidate assessments during interviews.",
    gradient: "from-purple-500 to-pink-500",
    bgGradient: "from-purple-500/10 to-pink-500/10",
  },
  {
    icon: <FileText className="size-7" />,
    title: "Document Generation",
    description:
      "Instantly create offer letters, contracts, appraisals, and HR documents with AI-powered templates.",
    gradient: "from-orange-500 to-red-500",
    bgGradient: "from-orange-500/10 to-red-500/10",
  },
  {
    icon: <Wand2 className="size-7" />,
    title: "JD Builder",
    description:
      "Generate compelling job descriptions tailored to your requirements with our intelligent JD builder.",
    gradient: "from-emerald-500 to-teal-500",
    bgGradient: "from-emerald-500/10 to-teal-500/10",
  },
  {
    icon: <Target className="size-7" />,
    title: "Performance Insights",
    description:
      "AI-driven performance analysis and personalized development recommendations for your team.",
    gradient: "from-rose-500 to-pink-500",
    bgGradient: "from-rose-500/10 to-pink-500/10",
  },
  {
    icon: <Sparkles className="size-7" />,
    title: "Learning Paths",
    description:
      "Personalized learning recommendations and skill development paths powered by AI analysis.",
    gradient: "from-indigo-500 to-violet-500",
    bgGradient: "from-indigo-500/10 to-violet-500/10",
  },
];

export default function AIFeaturesSection() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Premium Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/[0.02] to-background" />

      {/* Animated Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px]" />

      {/* Radial Glow */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px]">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-[120px] opacity-30" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 md:mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-sm font-medium text-primary">AI-Powered</span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Supercharge HR with{" "}
            <span className="relative">
              <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Artificial Intelligence
              </span>
              <svg
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 300 12"
                fill="none"
              >
                <path
                  d="M2 10C50 4 100 4 150 6C200 8 250 4 298 10"
                  stroke="url(#gradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient
                    id="gradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="50%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
          </h2>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Unlock unprecedented efficiency with intelligent automation that
            learns, adapts, and delivers results.
          </p>
        </motion.div>

        {/* Features Grid - Bento Style */}
        <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {aiFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="group relative h-full overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10">
                {/* Gradient Background */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />

                {/* Animated Shine */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                </div>

                <CardContent className="relative p-8">
                  {/* Icon with Glow */}
                  <div className="relative w-fit mb-6">
                    <div
                      className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} rounded-2xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500`}
                    />
                    <div
                      className={`relative p-4 rounded-2xl bg-gradient-to-br ${feature.bgGradient} border border-primary/10 group-hover:border-primary/30 transition-all duration-500`}
                    >
                      <div
                        className={`bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent`}
                      >
                        {feature.icon}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Bottom Accent */}
                  <div
                    className={`absolute bottom-0 left-0 h-1 w-0 group-hover:w-full bg-gradient-to-r ${feature.gradient} transition-all duration-500 rounded-full`}
                  />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom Gradient Line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
    </section>
  );
}
