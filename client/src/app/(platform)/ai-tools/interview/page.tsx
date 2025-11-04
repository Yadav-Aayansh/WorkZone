"use client";

import React from "react";
import { HeroHeader } from "@/components/(platform)/plaform-landing/header";
import { PlatformFooter } from "@/components/(platform)/plaform-landing/platform-footer";
import { InterviewAssistant } from "@/components/ai/InterviewAssistant";
import { Badge } from "@/components/ui/badge";
import { Brain } from "lucide-react";

export default function InterviewPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Navigation */}
      <HeroHeader />

      {/* Main Content */}
      <main className="relative pt-24 md:pt-32 pb-20">
        {/* Background Effects */}
        <div
          aria-hidden
          className="absolute inset-0 isolate hidden opacity-65 lg:block -z-10"
        >
          <div className="absolute left-0 top-0 h-[800px] w-[560px] -translate-y-[350px] -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(250,100%,85%,.08)_0,hsla(250,100%,55%,.02)_50%,hsla(250,100%,45%,0)_80%)]" />
          <div className="absolute right-0 top-0 h-[800px] w-[560px] -translate-y-[350px] rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(280,100%,85%,.08)_0,hsla(280,100%,55%,.02)_50%,hsla(280,100%,45%,0)_80%)]" />
        </div>

        <div
          aria-hidden
          className="absolute inset-0 -z-10 size-full bg-gradient-to-b from-background via-primary/5 to-background"
        />

        <div className="mx-auto max-w-7xl px-6">
          {/* Page Header */}
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 px-4 py-1.5">
              <Brain className="mr-2 h-3.5 w-3.5 text-primary" />
              AI-Powered Interviews
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              AI Interview{" "}
              <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Assistant
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Generate intelligent interview questions and analyze candidate
              responses with AI-powered insights and recommendations.
            </p>
          </div>

          {/* Interview Assistant Component */}
          <InterviewAssistant />
        </div>
      </main>

      {/* Footer */}
      <PlatformFooter />
    </div>
  );
}
