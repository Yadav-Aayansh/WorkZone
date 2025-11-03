"use client";

import { useParams, useRouter } from "next/navigation";
import { TenantProtectedRoute } from "@/components/tenant/TenantProtectedRoute";
import { RecruiterPortalLayout } from "@/components/tenant/recruiter-portal-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Briefcase,
  Video,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  FileText,
  Download,
  Star,
} from "lucide-react";
import interviewsData from "@/data/tenant/interviews.json";
import { toast } from "sonner";

function AIInterviewReportContent() {
  const params = useParams();
  const router = useRouter();
  const interviewId = params.id as string;

  const interview = interviewsData.find((i) => i.id === interviewId);

  if (!interview || !interview.report) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Interview Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The AI interview report you're looking for doesn't exist or hasn't
            been completed.
          </p>
          <Button
            onClick={() => router.push("/tenant/recruiter-portal/interviews")}
          >
            Back to Interviews
          </Button>
        </div>
      </div>
    );
  }

  const report = interview.report;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getRecommendationBadge = (recommendation: string) => {
    switch (recommendation) {
      case "Strong Yes":
        return (
          <Badge className="bg-green-600 text-white text-lg px-4 py-1">
            <Star className="mr-2 h-5 w-5" />
            Strong Yes
          </Badge>
        );
      case "Yes":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-lg px-4 py-1">
            Yes
          </Badge>
        );
      case "Maybe":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 text-lg px-4 py-1">
            Maybe
          </Badge>
        );
      case "No":
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 text-lg px-4 py-1">
            No
          </Badge>
        );
      default:
        return <Badge variant="outline">{recommendation}</Badge>;
    }
  };

  const handleProceed = () => {
    toast.success("Candidate moved to next round!");
    router.push("/tenant/recruiter-portal/candidates");
  };

  const handleReject = () => {
    toast.success("Candidate rejected!");
    router.push("/tenant/recruiter-portal/candidates");
  };

  const handleDownloadReport = () => {
    toast.success("Downloading report...");
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Button
          variant="ghost"
          className="w-fit"
          onClick={() => router.push("/tenant/recruiter-portal/interviews")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Interviews
        </Button>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Video className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              <h1 className="text-3xl font-bold tracking-tight">
                AI Interview Report
              </h1>
            </div>
            <p className="text-muted-foreground">
              Detailed analysis and assessment of the AI interview
            </p>
          </div>
          <Button variant="outline" onClick={handleDownloadReport}>
            <Download className="mr-2 h-4 w-4" />
            Download Report
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Interview Details */}
          <Card>
            <CardHeader>
              <CardTitle>Interview Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Candidate
                    </div>
                    <div className="font-semibold">
                      {interview.candidateName}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Position
                    </div>
                    <div className="font-semibold">{interview.jobTitle}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="text-sm text-muted-foreground">Date</div>
                    <div className="font-semibold">
                      {formatDate(interview.scheduledDate)}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Duration
                    </div>
                    <div className="font-semibold">
                      {interview.duration} minutes
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Overall Assessment */}
          <Card>
            <CardHeader>
              <CardTitle>Overall Assessment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-sm font-medium mb-2">Overall Score</div>
                  <Progress value={report.overallScore * 10} className="h-3" />
                </div>
                <div
                  className={`ml-6 text-5xl font-bold ${getScoreColor(
                    report.overallScore * 10
                  )}`}
                >
                  {report.overallScore}/10
                </div>
              </div>

              <Separator />

              {/* Score Breakdown */}
              <div className="space-y-4">
                <h4 className="font-semibold">Detailed Scores</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Communication Skills
                      </span>
                      <span
                        className={`font-semibold ${getScoreColor(
                          report.communicationScore * 10
                        )}`}
                      >
                        {report.communicationScore}/10
                      </span>
                    </div>
                    <Progress
                      value={report.communicationScore * 10}
                      className="h-2"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Technical Knowledge
                      </span>
                      <span
                        className={`font-semibold ${getScoreColor(
                          report.technicalScore * 10
                        )}`}
                      >
                        {report.technicalScore}/10
                      </span>
                    </div>
                    <Progress
                      value={report.technicalScore * 10}
                      className="h-2"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Problem Solving
                      </span>
                      <span
                        className={`font-semibold ${getScoreColor(
                          report.problemSolvingScore * 10
                        )}`}
                      >
                        {report.problemSolvingScore}/10
                      </span>
                    </div>
                    <Progress
                      value={report.problemSolvingScore * 10}
                      className="h-2"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Strengths */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                <CardTitle className="text-green-600 dark:text-green-400">
                  Key Strengths
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {report.strengths.map((strength, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-900/50"
                  >
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                      <span>{strength}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Weaknesses */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
                <CardTitle className="text-red-600 dark:text-red-400">
                  Areas for Improvement
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {report.weaknesses.map((weakness, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50"
                  >
                    <div className="flex items-start gap-3">
                      <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                      <span>{weakness}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Interview Transcript */}
          <Card>
            <CardHeader>
              <CardTitle>Interview Transcript</CardTitle>
              <CardDescription>
                Complete conversation from the AI interview
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {report.transcript.map((message, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg ${
                      message.speaker === "AI"
                        ? "bg-purple-100 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-900/50"
                        : "bg-blue-100 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/50"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className={`font-semibold ${
                          message.speaker === "AI"
                            ? "text-purple-600 dark:text-purple-400"
                            : "text-blue-600 dark:text-blue-400"
                        }`}
                      >
                        {message.speaker}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                    <div className="text-sm">{message.message}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Recommendation */}
          <Card>
            <CardHeader>
              <CardTitle>AI Recommendation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                {getRecommendationBadge(report.recommendation)}
              </div>
              <Separator />
              <div className="text-sm text-muted-foreground">
                {report.recommendationReason}
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {report.suggestedNextSteps.map(
                  (step: string, index: number) => (
                    <div
                      key={index}
                      className="p-3 rounded-lg bg-accent text-sm flex items-start gap-2"
                    >
                      <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold flex-shrink-0">
                        {index + 1}
                      </div>
                      <span>{step}</span>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Take Action</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
                onClick={handleProceed}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Proceed to Next Round
              </Button>
              <Button className="w-full" variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Manual Interview
              </Button>
              <Button
                className="w-full bg-destructive hover:bg-destructive/90"
                onClick={handleReject}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Reject Candidate
              </Button>
            </CardContent>
          </Card>

          {/* Interview Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Interview Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Questions Asked</span>
                <span className="font-semibold">
                  {report.transcript.filter((m) => m.speaker === "AI").length}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Responses Given</span>
                <span className="font-semibold">
                  {
                    report.transcript.filter((m) => m.speaker === "Candidate")
                      .length
                  }
                </span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Completion Rate</span>
                <span className="font-semibold">100%</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function AIInterviewReportPage() {
  return (
    <TenantProtectedRoute allowedRoles={["recruiter"]}>
      <RecruiterPortalLayout>
        <AIInterviewReportContent />
      </RecruiterPortalLayout>
    </TenantProtectedRoute>
  );
}
