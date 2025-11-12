"use client";

import { useState } from "react";
// import { TenantProtectedRoute } from "@/components/tenant/TenantProtectedRoute";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  FileText,
  Download,
  Trash2,
  MoreVertical,
  CheckCircle,
  XCircle,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import jobsData from "@/data/tenant/jobs.json";

interface ScoredResume {
  id: string;
  fileName: string;
  candidateName: string;
  jobId: string;
  jobTitle: string;
  uploadedDate: string;
  aiScore: number;
  status: "pending" | "scored" | "shortlisted" | "rejected";
  skills: string[];
  experience: string;
  education: string;
  strengths: string[];
  weaknesses: string[];
}

function ResumeScoringContent() {
  const [selectedJob, setSelectedJob] = useState<string>("all");
  const [dragActive, setDragActive] = useState(false);
  const [isScoring, setIsScoring] = useState(false);

  // Mock scored resumes data
  const [scoredResumes, setScoredResumes] = useState<ScoredResume[]>([
    {
      id: "resume-1",
      fileName: "rahul_sharma_resume.pdf",
      candidateName: "Rahul Sharma",
      jobId: "job-1",
      jobTitle: "Senior Full Stack Developer",
      uploadedDate: "2025-11-01T10:30:00Z",
      aiScore: 87,
      status: "scored",
      skills: ["React", "Node.js", "TypeScript", "AWS", "Docker"],
      experience: "6 years",
      education: "B.Tech - IIT Delhi",
      strengths: [
        "Strong technical skills in required tech stack",
        "Excellent cloud platform experience",
        "Leadership experience",
      ],
      weaknesses: [
        "Limited PostgreSQL experience",
        "Could benefit from microservices experience",
      ],
    },
    {
      id: "resume-2",
      fileName: "priya_patel_resume.pdf",
      candidateName: "Priya Patel",
      jobId: "job-2",
      jobTitle: "DevOps Engineer",
      uploadedDate: "2025-11-02T14:20:00Z",
      aiScore: 92,
      status: "shortlisted",
      skills: ["Kubernetes", "Docker", "AWS", "Terraform", "Jenkins"],
      experience: "5 years",
      education: "B.E. - Mumbai University",
      strengths: [
        "Expert-level Kubernetes knowledge",
        "Strong automation skills",
        "Excellent problem-solving abilities",
      ],
      weaknesses: [
        "Limited experience with Azure",
        "Could improve documentation skills",
      ],
    },
    {
      id: "resume-3",
      fileName: "amit_kumar_resume.pdf",
      candidateName: "Amit Kumar",
      jobId: "job-1",
      jobTitle: "Senior Full Stack Developer",
      uploadedDate: "2025-11-03T09:15:00Z",
      aiScore: 65,
      status: "scored",
      skills: ["React", "JavaScript", "Node.js", "MongoDB"],
      experience: "4 years",
      education: "B.Tech - NIT Trichy",
      strengths: [
        "Good understanding of React ecosystem",
        "Strong JavaScript fundamentals",
      ],
      weaknesses: [
        "Lacks TypeScript experience",
        "Limited cloud platform exposure",
        "No experience with testing frameworks",
      ],
    },
  ]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files: FileList) => {
    const file = files[0];
    if (file && file.type === "application/pdf") {
      toast.success(`Uploading ${file.name}...`);

      // Simulate AI scoring
      setIsScoring(true);
      setTimeout(() => {
        const newResume: ScoredResume = {
          id: `resume-${Date.now()}`,
          fileName: file.name,
          candidateName: "New Candidate",
          jobId: selectedJob === "all" ? "job-1" : selectedJob,
          jobTitle:
            jobsData.find(
              (j) => j.id === (selectedJob === "all" ? "job-1" : selectedJob)
            )?.title || "",
          uploadedDate: new Date().toISOString(),
          aiScore: Math.floor(Math.random() * 30) + 70,
          status: "scored",
          skills: ["React", "JavaScript", "Node.js"],
          experience: "3-5 years",
          education: "B.Tech",
          strengths: ["Good technical foundation", "Relevant experience"],
          weaknesses: ["Could improve cloud skills"],
        };
        setScoredResumes([newResume, ...scoredResumes]);
        setIsScoring(false);
        toast.success("Resume scored successfully!");
      }, 2000);
    } else {
      toast.error("Please upload a PDF file");
    }
  };

  const handleShortlist = (id: string) => {
    setScoredResumes((resumes) =>
      resumes.map((r) =>
        r.id === id ? { ...r, status: "shortlisted" as const } : r
      )
    );
    toast.success("Resume shortlisted!");
  };

  const handleReject = (id: string) => {
    setScoredResumes((resumes) =>
      resumes.map((r) =>
        r.id === id ? { ...r, status: "rejected" as const } : r
      )
    );
    toast.success("Resume rejected!");
  };

  const handleDelete = (id: string) => {
    setScoredResumes((resumes) => resumes.filter((r) => r.id !== id));
    toast.success("Resume deleted!");
  };

  const handleBulkScore = () => {
    toast.info("Scoring all pending resumes...");
    setTimeout(() => {
      toast.success("All resumes scored successfully!");
    }, 1500);
  };

  const handleExport = () => {
    toast.success("Exporting resume analysis...");
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80)
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
          Excellent
        </Badge>
      );
    if (score >= 60)
      return (
        <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
          Good
        </Badge>
      );
    return (
      <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
        Poor
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "shortlisted":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            Shortlisted
          </Badge>
        );
      case "scored":
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
            Scored
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
            Rejected
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
            Pending
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredResumes =
    selectedJob === "all"
      ? scoredResumes
      : scoredResumes.filter((r) => r.jobId === selectedJob);

  const stats = {
    total: scoredResumes.length,
    scored: scoredResumes.filter((r) => r.status === "scored").length,
    shortlisted: scoredResumes.filter((r) => r.status === "shortlisted").length,
    pending: scoredResumes.filter((r) => r.status === "pending").length,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resume Scoring</h1>
          <p className="text-muted-foreground mt-1">
            AI-powered resume analysis and candidate matching
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={handleBulkScore}>
            <Sparkles className="mr-2 h-4 w-4" />
            Bulk Score
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Resumes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Scored
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {stats.scored}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Shortlisted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {stats.shortlisted}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
              {stats.pending}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Resumes</CardTitle>
          <CardDescription>
            Drag and drop PDF resumes or click to browse
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Select value={selectedJob} onValueChange={setSelectedJob}>
                <SelectTrigger className="w-[300px]">
                  <SelectValue placeholder="Select Job Position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Positions</SelectItem>
                  {jobsData.map((job) => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div
              className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                dragActive
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-accent/50"
              } ${isScoring ? "opacity-50 pointer-events-none" : ""}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="file-upload"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept=".pdf"
                onChange={handleFileInput}
                disabled={isScoring}
              />
              <div className="flex flex-col items-center gap-4">
                {isScoring ? (
                  <>
                    <Sparkles className="h-12 w-12 text-primary animate-pulse" />
                    <div className="space-y-2">
                      <div className="text-lg font-semibold">
                        AI is analyzing the resume...
                      </div>
                      <div className="text-sm text-muted-foreground">
                        This will take just a moment
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <Upload className="h-12 w-12 text-muted-foreground" />
                    <div className="space-y-2">
                      <div className="text-lg font-semibold">
                        Drag and drop resume here
                      </div>
                      <div className="text-sm text-muted-foreground">
                        or click to browse files (PDF only)
                      </div>
                    </div>
                    <Button type="button" variant="outline" size="sm">
                      <FileText className="mr-2 h-4 w-4" />
                      Browse Files
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scored Resumes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Scored Resumes</CardTitle>
          <CardDescription>
            AI-analyzed resumes with matching scores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate / File</TableHead>
                <TableHead>Job Position</TableHead>
                <TableHead className="text-center">AI Score</TableHead>
                <TableHead>Key Skills</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResumes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="text-muted-foreground">
                      No resumes uploaded yet. Start by uploading some resumes
                      above.
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredResumes.map((resume) => (
                  <TableRow
                    key={resume.id}
                    className="cursor-pointer hover:bg-accent/50"
                  >
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-semibold">
                          {resume.candidateName}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {resume.fileName}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px]">
                        <div className="font-medium truncate">
                          {resume.jobTitle}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {resume.experience}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-full max-w-[80px]">
                          <Progress value={resume.aiScore} className="h-2" />
                        </div>
                        <span
                          className={`text-2xl font-bold ${getScoreColor(
                            resume.aiScore
                          )}`}
                        >
                          {resume.aiScore}
                        </span>
                        {getScoreBadge(resume.aiScore)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {resume.skills.slice(0, 3).map((skill, idx) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="text-xs"
                          >
                            {skill}
                          </Badge>
                        ))}
                        {resume.skills.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{resume.skills.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(resume.status)}</TableCell>
                    <TableCell className="text-sm">
                      {formatDate(resume.uploadedDate)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <TrendingUp className="mr-2 h-4 w-4" />
                            View Analysis
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Download Resume
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleShortlist(resume.id)}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Shortlist
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleReject(resume.id)}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(resume.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ResumeScoringPage() {
  return (
    <ModernRecruiterLayout>
      <ResumeScoringContent />
    </ModernRecruiterLayout>
  );
}
