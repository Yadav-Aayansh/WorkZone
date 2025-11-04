"use client";

import { useState } from "react";
import { TenantProtectedRoute } from "@/components/tenant/TenantProtectedRoute";
import { RecruiterPortalLayout } from "@/components/tenant/recruiter-portal-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Search,
  Filter,
  Download,
  CheckCircle,
  XCircle,
  Calendar,
  MoreVertical,
} from "lucide-react";
import { useRouter } from "next/navigation";
import candidatesData from "@/data/tenant/candidates.json";
import jobsData from "@/data/tenant/jobs.json";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

function CandidatesContent() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [jobFilter, setJobFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [scoreFilter, setScoreFilter] = useState("all");

  // Filter candidates
  const filteredCandidates = candidatesData.filter((candidate) => {
    const matchesSearch =
      candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.jobTitle.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesJob = jobFilter === "all" || candidate.jobId === jobFilter;
    const matchesStatus =
      statusFilter === "all" || candidate.status === statusFilter;

    let matchesScore = true;
    if (scoreFilter === "high") matchesScore = candidate.aiScore >= 80;
    else if (scoreFilter === "medium")
      matchesScore = candidate.aiScore >= 60 && candidate.aiScore < 80;
    else if (scoreFilter === "low") matchesScore = candidate.aiScore < 60;

    return matchesSearch && matchesJob && matchesStatus && matchesScore;
  });

  const getCandidateStatusBadge = (status: string) => {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleShortlist = (candidateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toast.success("Candidate shortlisted successfully!");
  };

  const handleReject = (candidateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toast.success("Candidate rejected successfully!");
  };

  const handleScheduleInterview = (
    candidateId: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    router.push(`/tenant/recruiter-portal/interviews?candidate=${candidateId}`);
  };

  const handleExport = () => {
    toast.success("Candidates exported successfully!");
  };

  const stats = {
    total: candidatesData.length,
    shortlisted: candidatesData.filter((c) => c.status === "shortlisted")
      .length,
    underReview: candidatesData.filter((c) => c.status === "under_review")
      .length,
    rejected: candidatesData.filter((c) => c.status === "rejected").length,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Candidates</h1>
          <p className="text-muted-foreground mt-1">
            Manage and review all job applicants
          </p>
        </div>
        <Button onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Candidates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
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
              Under Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
              {stats.underReview}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Rejected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">
              {stats.rejected}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold">Filters</h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search candidates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Job Filter */}
              <Select value={jobFilter} onValueChange={setJobFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Jobs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Jobs</SelectItem>
                  {jobsData.map((job) => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="shortlisted">Shortlisted</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              {/* Score Filter */}
              <Select value={scoreFilter} onValueChange={setScoreFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Scores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Scores</SelectItem>
                  <SelectItem value="high">High (80-100)</SelectItem>
                  <SelectItem value="medium">Medium (60-79)</SelectItem>
                  <SelectItem value="low">Low (&lt;60)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Job Applied</TableHead>
                <TableHead className="text-center">AI Score</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applied Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCandidates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="text-muted-foreground">
                      No candidates found matching your criteria
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCandidates.map((candidate) => (
                  <TableRow
                    key={candidate.id}
                    className="cursor-pointer hover:bg-accent/50"
                    onClick={() =>
                      router.push(
                        `/tenant/recruiter-portal/candidates/${candidate.id}`
                      )
                    }
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {candidate.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold">{candidate.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {candidate.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px]">
                        <div className="font-medium truncate">
                          {candidate.jobTitle}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {candidate.location}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span
                          className={`text-2xl font-bold ${getScoreColor(
                            candidate.aiScore
                          )}`}
                        >
                          {candidate.aiScore}
                        </span>
                        {getScoreBadge(candidate.aiScore)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {candidate.experience}
                        <div className="text-muted-foreground">
                          {candidate.currentCompany}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getCandidateStatusBadge(candidate.status)}
                    </TableCell>
                    <TableCell>{formatDate(candidate.appliedDate)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          asChild
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(
                                `/tenant/recruiter-portal/candidates/${candidate.id}`
                              );
                            }}
                          >
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={(e) => handleShortlist(candidate.id, e)}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Shortlist
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) =>
                              handleScheduleInterview(candidate.id, e)
                            }
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            Schedule Interview
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={(e) => handleReject(candidate.id, e)}
                            className="text-destructive"
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject
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

export default function CandidatesPage() {
  return (
    <TenantProtectedRoute allowedRoles={["recruiter"]}>
      <RecruiterPortalLayout>
        <CandidatesContent />
      </RecruiterPortalLayout>
    </TenantProtectedRoute>
  );
}
