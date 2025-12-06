"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Home, FileText } from "lucide-react";
import ReactMarkdown from "react-markdown";

function InterviewReportContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const report = searchParams.get("report") || "";

  return (
    <div className="min-h-screen p-4 lg:p-8 bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-green-500/10">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
          </div>
          <h1 className="text-4xl font-bold">Interview Completed!</h1>
          <p className="text-lg text-muted-foreground">
            Great job! Here&apos;s your detailed performance report
          </p>
        </motion.div>

        {/* Report Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-8 shadow-2xl border-2">
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-3xl font-bold mb-4 pb-2 border-b">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-2xl font-bold mt-8 mb-3">{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-xl font-semibold mt-6 mb-2">
                      {children}
                    </h3>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc pl-6 space-y-2 my-4">
                      {children}
                    </ul>
                  ),
                  li: ({ children }) => (
                    <li className="text-muted-foreground">{children}</li>
                  ),
                  p: ({ children }) => (
                    <p className="my-4 leading-relaxed text-foreground">
                      {children}
                    </p>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold text-foreground">
                      {children}
                    </strong>
                  ),
                  hr: () => <hr className="my-8 border-border" />,
                }}
              >
                {report}
              </ReactMarkdown>
            </div>
          </Card>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex gap-4 justify-center"
        >
          <Button
            size="lg"
            variant="outline"
            onClick={() => router.push("/tenant/applicant-portal")}
          >
            <Home className="w-5 h-5 mr-2" />
            Back to Portal
          </Button>
          <Button size="lg" onClick={() => window.print()}>
            <FileText className="w-5 h-5 mr-2" />
            Download Report
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

export default function InterviewReportPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      }
    >
      <InterviewReportContent />
    </Suspense>
  );
}
