"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Upload,
  FileText,
  Sparkles,
  TrendingUp,
  Download,
  CheckCircle2,
  AlertCircle,
  Star,
} from "lucide-react";

// Mock data
const mockResumes = [
  { name: "JohnDoe.pdf", size: "245 KB" },
  { name: "SarahCV.pdf", size: "312 KB" },
  { name: "MikeSmith.pdf", size: "198 KB" },
];

const mockResults = [
  {
    id: 1,
    candidate: "John Doe",
    experience: "5 years",
    skillsMatch: 92,
    matchPercent: 92,
    summary:
      "Excellent match with strong React & Node.js background. Leadership experience aligns well.",
    strengths: ["Full-stack expertise", "Team leadership", "Problem solving"],
  },
  {
    id: 2,
    candidate: "Sarah Chen",
    experience: "3 years",
    skillsMatch: 85,
    matchPercent: 85,
    summary:
      "Strong technical skills in frontend. Fast learner with good project portfolio.",
    strengths: ["React mastery", "UI/UX focus", "Quick adaptation"],
  },
  {
    id: 3,
    candidate: "Mike Smith",
    experience: "7 years",
    skillsMatch: 78,
    matchPercent: 78,
    summary:
      "Solid backend experience but limited frontend exposure. Good database skills.",
    strengths: ["Backend architecture", "Database optimization", "API design"],
  },
];

export function ResumeScorer() {
  const [jobDescription, setJobDescription] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [jdAnalyzed, setJdAnalyzed] = useState(false);
  const [scoring, setScoring] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleAnalyzeJD = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setJdAnalyzed(true);
    }, 1500);
  };

  const handleRunScoring = () => {
    setScoring(true);
    setTimeout(() => {
      setScoring(false);
      setShowResults(true);
    }, 2500);
  };

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
    }, 1000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600 dark:text-green-400";
    if (score >= 70) return "text-yellow-600 dark:text-yellow-400";
    return "text-orange-600 dark:text-orange-400";
  };

  const getScoreVariant = (
    score: number
  ): "default" | "secondary" | "destructive" | "outline" => {
    if (score >= 85) return "default";
    if (score >= 70) return "secondary";
    return "outline";
  };

  const topCandidate = mockResults[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Main Content - 9 columns */}
      <div className="lg:col-span-9 space-y-6">
        {/* Job Description Card */}
        <Card className="border-2 hover:border-primary/20 transition-colors">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle>Job Description</CardTitle>
            </div>
            <CardDescription>
              Paste the job description to analyze required skills and
              qualifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Paste job description here...&#10;&#10;Example:&#10;We're looking for a Senior Full Stack Developer with 5+ years experience in React, Node.js, and TypeScript. Must have strong problem-solving skills and experience leading small teams..."
              className="min-h-[150px] resize-none"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
            <Button
              onClick={handleAnalyzeJD}
              disabled={!jobDescription || analyzing || jdAnalyzed}
              className="w-full sm:w-auto"
            >
              {analyzing ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                  Analyzing...
                </>
              ) : jdAnalyzed ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  JD Analyzed
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Analyze JD
                </>
              )}
            </Button>
            {jdAnalyzed && (
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <p className="text-sm text-muted-foreground">
                  ✓ Identified 8 key skills · 3 required qualifications ·
                  Experience level: Senior
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upload Resumes Card */}
        <Card className="border-2 hover:border-primary/20 transition-colors">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              <CardTitle>Upload Resumes</CardTitle>
            </div>
            <CardDescription>
              Upload candidate resumes to score against the job description
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Dropzone */}
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm font-medium mb-1">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-muted-foreground">
                PDF, DOC, DOCX (Max 5MB per file)
              </p>
            </div>

            {/* Mock uploaded files */}
            <div className="space-y-2">
              <p className="text-sm font-medium">
                Uploaded Resumes ({mockResumes.length})
              </p>
              {mockResumes.map((resume, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">{resume.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {resume.size}
                      </p>
                    </div>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
              ))}
            </div>

            <Button
              onClick={handleRunScoring}
              disabled={!jdAnalyzed || scoring || showResults}
              className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
              size="lg"
            >
              {scoring ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                  Running AI Analysis...
                </>
              ) : showResults ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Scoring Complete
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Run AI Scoring
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results Card */}
        {showResults && (
          <Card className="border-2 border-primary/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <CardTitle>AI Scoring Results</CardTitle>
                  </div>
                  <CardDescription>
                    {mockResults.length} candidates analyzed and ranked by match
                    score
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={handleExport}
                  disabled={exporting}
                >
                  {exporting ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Export Report
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="w-full">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Candidate</TableHead>
                      <TableHead>Experience</TableHead>
                      <TableHead>Skills Match</TableHead>
                      <TableHead>Match %</TableHead>
                      <TableHead>Summary</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockResults.map((result) => (
                      <TableRow key={result.id}>
                        <TableCell className="font-medium">
                          {result.candidate}
                        </TableCell>
                        <TableCell>{result.experience}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Progress
                              value={result.skillsMatch}
                              className="h-2"
                            />
                            <span className="text-xs text-muted-foreground">
                              {result.skillsMatch}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getScoreVariant(result.matchPercent)}>
                            <span
                              className={getScoreColor(result.matchPercent)}
                            >
                              {result.matchPercent}%
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <p className="text-sm line-clamp-2">
                            {result.summary}
                          </p>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Sidebar - 3 columns */}
      <div className="lg:col-span-3 space-y-6">
        {/* AI Insights Card */}
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-purple-500/5 sticky top-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">AI Insights</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {showResults ? (
              <>
                {/* Top Candidate */}
                <div className="p-4 bg-card rounded-lg border border-primary/30">
                  <div className="flex items-start gap-3 mb-3">
                    <Star className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm">Top Candidate</p>
                      <p className="text-lg font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                        {topCandidate.candidate}
                      </p>
                      <p className="text-2xl font-bold text-primary mt-1">
                        {topCandidate.matchPercent}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Strengths */}
                <div>
                  <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Key Strengths
                  </p>
                  <ul className="space-y-2">
                    {topCandidate.strengths.map((strength, index) => (
                      <li
                        key={index}
                        className="text-sm flex items-start gap-2 text-muted-foreground"
                      >
                        <span className="text-primary mt-1">•</span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Stats */}
                <div className="pt-4 border-t space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Total Analyzed
                    </span>
                    <span className="font-semibold">{mockResults.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      High Match (85%+)
                    </span>
                    <span className="font-semibold text-green-600">2</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Medium Match (70-84%)
                    </span>
                    <span className="font-semibold text-yellow-600">1</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  Run AI scoring to view insights and top candidates
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tips Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">💡 Pro Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>• Upload multiple resumes for batch analysis</p>
            <p>• More detailed JDs yield better matching</p>
            <p>• Review AI summaries for quick insights</p>
            <p>• Export reports for team discussions</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
