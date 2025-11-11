"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { TenantProtectedRoute } from "@/components/tenant/TenantProtectedRoute";
import { ModernRecruiterLayout } from "@/components/common/layout/ModernRecruiterLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  GraduationCap,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  TrendingUp,
  TrendingDown,
  Download,
  ExternalLink,
} from "lucide-react";
import candidatesData from "@/data/tenant/candidates.json";
import { toast } from "sonner";

function CandidateProfileContent() {
  const params = useParams();
  const router = useRouter();
  const candidateId = params.id as string;
  const [notes, setNotes] = useState("");

  const candidate = candidatesData.find((c) => c.id === candidateId);

  if (!candidate) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Candidate Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The candidate you're looking for doesn't exist.
          </p>
          <Button
            onClick={() => router.push("/tenant/recruiter-portal/candidates")}
          >
            Back to Candidates
          </Button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "shortlisted":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            Shortlisted
          </Badge>
        );
      case "under_review":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
            Under Review
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleShortlist = () => {
    toast.success("Candidate shortlisted successfully!");
  };

  const handleReject = () => {
    toast.success("Candidate rejected successfully!");
  };

  const handleScheduleInterview = () => {
    router.push(`/tenant/recruiter-portal/interviews?candidate=${candidateId}`);
  };

  const handleDownloadResume = () => {
    toast.success("Resume download started!");
  };

  const handleSaveNotes = () => {
    toast.success("Notes saved successfully!");
  };

  // AI Score breakdown
  const scoreBreakdown = [
    {
      category: "Technical Skills",
      score: candidate.aiAnalysis.strengths.includes(
        "Strong technical background"
      )
        ? 90
        : 75,
    },
    {
      category: "Experience Match",
      score: candidate.aiAnalysis.strengths.includes("experience") ? 85 : 70,
    },
    {
      category: "Education",
      score: 80,
    },
    {
      category: "Communication",
      score: candidate.aiAnalysis.weaknesses.includes("experience in")
        ? 70
        : 85,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Button
          variant="ghost"
          className="w-fit"
          onClick={() => router.push("/tenant/recruiter-portal/candidates")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Candidates
        </Button>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-4">
            <div className="h-20 w-20 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold">
              {candidate.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {candidate.name}
              </h1>
              <p className="text-muted-foreground mt-1">{candidate.jobTitle}</p>
              <div className="flex items-center gap-2 mt-2">
                {getStatusBadge(candidate.status)}
                <Badge variant="outline">
                  Applied {formatDate(candidate.appliedDate)}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDownloadResume}>
              <Download className="mr-2 h-4 w-4" />
              Resume
            </Button>
            <Button onClick={handleScheduleInterview}>
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Interview
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Score Card */}
          <Card>
            <CardHeader>
              <CardTitle>AI Matching Score</CardTitle>
              <CardDescription>
                AI-powered analysis of candidate fit for {candidate.jobTitle}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Overall Score */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-sm font-medium mb-2">Overall Match</div>
                  <Progress value={candidate.aiScore} className="h-3" />
                </div>
                <div
                  className={`ml-6 text-5xl font-bold ${getScoreColor(
                    candidate.aiScore
                  )}`}
                >
                  {candidate.aiScore}
                </div>
              </div>

              <Separator />

              {/* Score Breakdown */}
              <div className="space-y-4">
                <h4 className="font-semibold">Detailed Breakdown</h4>
                {scoreBreakdown.map((item) => (
                  <div key={item.category} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {item.category}
                      </span>
                      <span
                        className={`font-semibold ${getScoreColor(item.score)}`}
                      >
                        {item.score}%
                      </span>
                    </div>
                    <Progress value={item.score} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>AI Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Strengths */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <h4 className="font-semibold text-green-600 dark:text-green-400">
                    Strengths
                  </h4>
                </div>
                <div className="grid gap-2">
                  {candidate.aiAnalysis.strengths.map((strength, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-900/50"
                    >
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{strength}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weaknesses */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
                  <h4 className="font-semibold text-red-600 dark:text-red-400">
                    Areas for Consideration
                  </h4>
                </div>
                <div className="grid gap-2">
                  {candidate.aiAnalysis.weaknesses.map((weakness, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-lg bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50"
                    >
                      <div className="flex items-start gap-2">
                        <XCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{weakness}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Professional Experience */}
          <Card>
            <CardHeader>
              <CardTitle>Professional Experience</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="font-semibold">
                      {candidate.currentCompany}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {candidate.experience}
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="flex items-start gap-3">
                  <GraduationCap className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="font-semibold">Education</div>
                    <div className="text-sm text-muted-foreground">
                      Degree information would be displayed here
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Application Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {candidate.timeline.map((event, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        {event.status === "applied" && (
                          <FileText className="h-4 w-4" />
                        )}
                        {event.status === "screening" && (
                          <CheckCircle className="h-4 w-4" />
                        )}
                        {event.status === "interview_scheduled" && (
                          <Calendar className="h-4 w-4" />
                        )}
                        {event.status === "shortlisted" && (
                          <Star className="h-4 w-4" />
                        )}
                      </div>
                      {index < candidate.timeline.length - 1 && (
                        <div className="w-px h-12 bg-border mt-2" />
                      )}
                    </div>
                    <div className="flex-1 pb-6">
                      <div className="font-semibold capitalize">
                        {event.status.replace("_", " ")}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {event.note}
                      </div>
                      <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(event.date)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Recruiter Notes</CardTitle>
              <CardDescription>
                Add private notes about this candidate
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Enter your notes here..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={5}
              />
              <Button onClick={handleSaveNotes}>Save Notes</Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Contact & Actions */}
        <div className="space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-muted-foreground">Email</div>
                  <div className="font-medium truncate">{candidate.email}</div>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground">Phone</div>
                  <div className="font-medium">{candidate.phone}</div>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground">Location</div>
                  <div className="font-medium">{candidate.location}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
                onClick={handleShortlist}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Shortlist Candidate
              </Button>
              <Button
                className="w-full"
                variant="outline"
                onClick={handleScheduleInterview}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Interview
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

          {/* Resume Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Resume</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-[3/4] bg-accent rounded-lg flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-2" />
                  <div className="text-sm">Resume Preview</div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  variant="outline"
                  onClick={handleDownloadResume}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button
                  className="flex-1"
                  variant="outline"
                  onClick={() => toast.info("Opening in new tab...")}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Notice Period</span>
                <span className="font-medium">30 days</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Expected Salary</span>
                <span className="font-medium">
                  ₹{(candidate.aiScore * 1000).toLocaleString()}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Referral</span>
                <span className="font-medium">Direct Apply</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function CandidateProfilePage() {
  return (
    <TenantProtectedRoute allowedRoles={["recruiter"]}>
      <ModernRecruiterLayout>
        <CandidateProfileContent />
      </ModernRecruiterLayout>
    </TenantProtectedRoute>
  );
}
