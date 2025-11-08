"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  FileSearch,
  MessageSquare,
  FileText,
  TrendingUp,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const aiFeatures = [
  {
    icon: FileSearch,
    title: "AI Resume Scoring",
    description:
      "Automatically evaluate resumes with intelligent scoring out of 100. Get unbiased, skill-based rankings with detailed feedback for every candidate.",
    tags: ["GenAI", "Automation", "Bias-Free"],
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: MessageSquare,
    title: "AI Interview Assistant",
    description:
      "Conduct first-round interviews with our intelligent chatbot. Adaptive questioning based on resumes and job requirements with comprehensive evaluation reports.",
    tags: ["Conversational AI", "Adaptive", "Smart"],
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: TrendingUp,
    title: "Performance Analytics",
    description:
      "AI-generated performance summaries from centralized data. Identify achievements, skill gaps, and get personalized development recommendations.",
    tags: ["Predictive", "Data-Driven", "Insights"],
    gradient: "from-orange-500 to-red-500",
  },
  {
    icon: FileText,
    title: "Document Generator",
    description:
      "Auto-generate offer letters, rejection emails, and HR documents using natural language generation with consistent branding and compliance.",
    tags: ["NLG", "Templates", "Automated"],
    gradient: "from-green-500 to-emerald-500",
  },
  {
    icon: GraduationCap,
    title: "Learning Recommendations",
    description:
      "Personalized course and resource suggestions based on employee roles, skills, and career goals. Encourage continuous learning and development.",
    tags: ["Personalized", "Growth", "Smart"],
    gradient: "from-indigo-500 to-blue-500",
  },
  {
    icon: Brain,
    title: "HR Knowledge Assistant",
    description:
      "RAG-powered chatbot that answers HR policy questions instantly. Get accurate, conversational responses about leaves, benefits, and procedures.",
    tags: ["RAG", "24/7", "Instant"],
    gradient: "from-pink-500 to-rose-500",
  },
];

export const AIFeatures = () => {
  return (
    <section className="py-20 md:py-32 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 to-background -z-10" />

      <div className="mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 px-4 py-1.5">
            <Sparkles className="mr-2 h-3.5 w-3.5 text-primary" />
            Generative AI Tools
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Intelligent HR{" "}
            <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              Powered by AI
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Leverage cutting-edge AI to make smarter decisions, eliminate bias,
            and enhance every touchpoint of the employee lifecycle.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {aiFeatures.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <Card
                key={index}
                className="group relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl"
              >
                <div
                  className={cn(
                    "absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-10 blur-2xl group-hover:opacity-20 transition-opacity",
                    feature.gradient
                  )}
                />

                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={cn(
                        "flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br transition-transform duration-300 group-hover:scale-110",
                        feature.gradient
                      )}
                    >
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-xl mb-2">
                    {feature.title}
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    {feature.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {feature.tags.map((tag, tagIndex) => (
                      <Badge
                        key={tagIndex}
                        variant="secondary"
                        className="text-xs"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
