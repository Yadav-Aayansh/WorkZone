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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  Sparkles,
  Copy,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Brain,
  ClipboardCheck,
} from "lucide-react";

// Mock data
const mockQuestions = [
  "Can you explain your experience with React hooks and how you've used them to optimize component performance?",
  "Describe a challenging technical problem you solved recently. What was your approach?",
  "How do you ensure code quality and maintainability in a team environment?",
  "What's your experience with state management solutions like Redux or Context API?",
  "Can you walk me through your process for debugging a complex production issue?",
];

const mockAnalysis = {
  summary:
    "Strong technical knowledge with good communication. Shows leadership potential but could improve on system design thinking.",
  strengths: [
    "Clear articulation of technical concepts",
    "Good problem-solving approach",
    "Team collaboration experience",
    "Proactive learning attitude",
  ],
  weaknesses: [
    "Limited experience with system architecture",
    "Could provide more specific examples",
    "Needs more depth in performance optimization",
  ],
  recommendation: "Proceed to next round - Good fit for mid-level position",
  score: 82,
};

export function InterviewAssistant() {
  const [jobTitle, setJobTitle] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [generating, setGenerating] = useState(false);
  const [questions, setQuestions] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const [transcript, setTranscript] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<typeof mockAnalysis | null>(null);

  const handleGenerateQuestions = () => {
    setGenerating(true);
    setTimeout(() => {
      setQuestions(mockQuestions);
      setGenerating(false);
    }, 2000);
  };

  const handleCopyQuestions = () => {
    const text = questions.join("\n\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAnalyzeInterview = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalysis(mockAnalysis);
      setAnalyzing(false);
    }, 2500);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-orange-600 dark:text-orange-400";
  };

  return (
    <Tabs defaultValue="generate" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="generate">Generate Questions</TabsTrigger>
        <TabsTrigger value="analyze">Analyze Answers</TabsTrigger>
      </TabsList>

      {/* Tab 1: Generate Questions */}
      <TabsContent value="generate" className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Card */}
          <Card className="border-2 hover:border-primary/20 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                <CardTitle>Interview Setup</CardTitle>
              </div>
              <CardDescription>
                Configure interview parameters to generate relevant questions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input
                  id="jobTitle"
                  placeholder="e.g., Senior Full Stack Developer"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Experience Level</Label>
                <Select
                  value={experienceLevel}
                  onValueChange={setExperienceLevel}
                >
                  <SelectTrigger id="experience">
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="junior">Junior (0-2 years)</SelectItem>
                    <SelectItem value="mid">Mid-level (3-5 years)</SelectItem>
                    <SelectItem value="senior">Senior (5+ years)</SelectItem>
                    <SelectItem value="lead">
                      Lead/Principal (8+ years)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4">
                <Button
                  onClick={handleGenerateQuestions}
                  disabled={!jobTitle || !experienceLevel || generating}
                  className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                  size="lg"
                >
                  {generating ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                      Generating Questions...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Questions
                    </>
                  )}
                </Button>
              </div>

              {questions.length > 0 && (
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <p className="text-sm text-muted-foreground">
                    ✓ {questions.length} AI-generated questions ready
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Output Card */}
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    <CardTitle>Generated Questions</CardTitle>
                  </div>
                  <CardDescription>
                    AI-curated questions for your interview
                  </CardDescription>
                </div>
                {questions.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyQuestions}
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy All
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {questions.length > 0 ? (
                <div className="space-y-4">
                  {questions.map((question, index) => (
                    <div
                      key={index}
                      className="p-4 bg-muted/50 rounded-lg border hover:border-primary/30 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <Badge variant="outline" className="mt-0.5">
                          Q{index + 1}
                        </Badge>
                        <p className="text-sm leading-relaxed">{question}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">
                    Configure interview setup and click Generate Questions
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tips Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              💡 Question Generation Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">Technical Depth</p>
              <p className="text-xs text-muted-foreground">
                Questions adapt to experience level
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Behavioral Mix</p>
              <p className="text-xs text-muted-foreground">
                Combines technical & soft skills
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Role-Specific</p>
              <p className="text-xs text-muted-foreground">
                Tailored to job requirements
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">STAR Format</p>
              <p className="text-xs text-muted-foreground">
                Encourages structured responses
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Tab 2: Analyze Answers */}
      <TabsContent value="analyze" className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Transcript Input Card */}
          <Card className="border-2 hover:border-primary/20 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-primary" />
                <CardTitle>Interview Transcript</CardTitle>
              </div>
              <CardDescription>
                Paste the interview transcript or candidate answers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Paste interview transcript here...&#10;&#10;Example:&#10;Q: Tell me about your React experience&#10;A: I've been working with React for 3 years, focusing on performance optimization and state management..."
                className="min-h-[300px] resize-none"
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
              />

              <Button
                onClick={handleAnalyzeInterview}
                disabled={!transcript || analyzing}
                className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                size="lg"
              >
                {analyzing ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                    Analyzing Interview...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Analyze Interview
                  </>
                )}
              </Button>

              {analysis && (
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <p className="text-sm text-muted-foreground">
                    ✓ Analysis complete • Confidence: High
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Analysis Output Card */}
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                <CardTitle>AI Analysis</CardTitle>
              </div>
              <CardDescription>
                Comprehensive evaluation and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analysis ? (
                <div className="space-y-6">
                  {/* Score */}
                  <div className="p-4 bg-gradient-to-br from-primary/5 to-purple-500/5 rounded-lg border border-primary/20 text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      Overall Score
                    </p>
                    <p
                      className={`text-4xl font-bold ${getScoreColor(
                        analysis.score
                      )}`}
                    >
                      {analysis.score}%
                    </p>
                  </div>

                  {/* Summary */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <MessageSquare className="h-4 w-4 text-primary" />
                      <h4 className="font-semibold">Summary</h4>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {analysis.summary}
                    </p>
                  </div>

                  {/* Strengths */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <h4 className="font-semibold">Strengths</h4>
                    </div>
                    <ul className="space-y-2">
                      {analysis.strengths.map((strength, index) => (
                        <li
                          key={index}
                          className="text-sm flex items-start gap-2 text-muted-foreground"
                        >
                          <span className="text-green-500 mt-1">•</span>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Weaknesses */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      <h4 className="font-semibold">Areas for Improvement</h4>
                    </div>
                    <ul className="space-y-2">
                      {analysis.weaknesses.map((weakness, index) => (
                        <li
                          key={index}
                          className="text-sm flex items-start gap-2 text-muted-foreground"
                        >
                          <span className="text-yellow-500 mt-1">•</span>
                          {weakness}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Recommendation */}
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <div className="flex items-start gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-primary mt-0.5" />
                      <h4 className="font-semibold">Recommendation</h4>
                    </div>
                    <p className="text-sm font-medium">
                      {analysis.recommendation}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">
                    Paste interview transcript and click Analyze Interview
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Analysis Tips Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">💡 Analysis Insights</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">Communication</p>
              <p className="text-xs text-muted-foreground">
                Evaluates clarity and articulation
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Technical Depth</p>
              <p className="text-xs text-muted-foreground">
                Assesses knowledge and expertise
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Problem Solving</p>
              <p className="text-xs text-muted-foreground">
                Analyzes approach and reasoning
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Cultural Fit</p>
              <p className="text-xs text-muted-foreground">
                Identifies team compatibility
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
