"use client";

import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Sparkles,
  Eye,
  Save,
  Send,
  X,
  Plus,
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function CreateJobContent() {
  const router = useRouter();
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    department: "",
    location: "",
    type: "full-time",
    experience: "",
    salaryMin: "",
    salaryMax: "",
    description: "",
    requirements: [] as string[],
    responsibilities: [] as string[],
    skills: [] as string[],
  });

  const [currentRequirement, setCurrentRequirement] = useState("");
  const [currentResponsibility, setCurrentResponsibility] = useState("");
  const [currentSkill, setCurrentSkill] = useState("");

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) {
      toast.error("Please enter a job description or requirements");
      return;
    }

    setIsGenerating(true);

    // Simulate AI generation
    setTimeout(() => {
      const mockData = {
        title: "Senior Full Stack Developer",
        department: "Engineering",
        location: "Bangalore, India",
        type: "full-time",
        experience: "5-8 years",
        salaryMin: "2000000",
        salaryMax: "3500000",
        description: `We are looking for an experienced Full Stack Developer to join our engineering team. You will work on building scalable web applications using modern technologies.

In this role, you will collaborate with cross-functional teams to define, design, and ship new features. You will work with cutting-edge technologies and contribute to architectural decisions.`,
        requirements: [
          "5+ years of experience in full-stack development",
          "Strong proficiency in React and Node.js",
          "Experience with TypeScript and modern JavaScript",
          "Knowledge of PostgreSQL or similar databases",
          "Experience with cloud platforms (AWS/Azure/GCP)",
        ],
        responsibilities: [
          "Design and develop scalable web applications",
          "Collaborate with cross-functional teams",
          "Write clean, maintainable code",
          "Participate in code reviews",
          "Mentor junior developers",
        ],
        skills: ["React", "Node.js", "TypeScript", "PostgreSQL", "AWS"],
      };

      setFormData(mockData);
      setIsGenerating(false);
      toast.success("Job description generated successfully!");
    }, 2000);
  };

  const addItem = (
    type: "requirements" | "responsibilities" | "skills",
    value: string,
    setter: (value: string) => void
  ) => {
    if (value.trim()) {
      setFormData((prev) => ({
        ...prev,
        [type]: [...prev[type], value.trim()],
      }));
      setter("");
    }
  };

  const removeItem = (
    type: "requirements" | "responsibilities" | "skills",
    index: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  };

  const handleSave = (status: "draft" | "active") => {
    // Validation
    if (!formData.title || !formData.department) {
      toast.error("Please fill in required fields");
      return;
    }

    // Save logic here
    toast.success(
      status === "draft" ? "Job saved as draft" : "Job posted successfully!"
    );

    router.push("/tenant/recruiter-portal/jobs");
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Create Job Posting
            </h1>
            <p className="text-muted-foreground mt-1">
              Use AI to generate job description or create manually
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setShowPreview(true)}>
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button variant="outline" onClick={() => handleSave("draft")}>
            <Save className="mr-2 h-4 w-4" />
            Save Draft
          </Button>
          <Button onClick={() => handleSave("active")}>
            <Send className="mr-2 h-4 w-4" />
            Post Job
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* AI Generator Section */}
        <Card className="lg:sticky lg:top-6 h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Job Description Generator
            </CardTitle>
            <CardDescription>
              Describe the job in natural language and let AI create a complete
              job description
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="ai-prompt">Job Description / Requirements</Label>
              <Textarea
                id="ai-prompt"
                placeholder="E.g., 'We need a senior full stack developer with 5+ years experience in React and Node.js. Should be able to work on scalable web applications and lead a small team...'"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                rows={8}
                className="mt-2"
              />
            </div>
            <Button
              className="w-full"
              onClick={handleAIGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate with AI
                </>
              )}
            </Button>
            <div className="text-xs text-muted-foreground">
              <strong>Tip:</strong> Be specific about skills, experience, and
              responsibilities for better results
            </div>
          </CardContent>
        </Card>

        {/* Manual Form Section */}
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Essential details about the position
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Job Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Senior Full Stack Developer"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="mt-2"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="department">Department *</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) =>
                      setFormData({ ...formData, department: value })
                    }
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                      <SelectItem value="Product">Product</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                      <SelectItem value="HR">Human Resources</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="type">Employment Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="intern">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Bangalore, India"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="experience">Experience Required</Label>
                  <Input
                    id="experience"
                    placeholder="e.g., 5-8 years"
                    value={formData.experience}
                    onChange={(e) =>
                      setFormData({ ...formData, experience: e.target.value })
                    }
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label>Salary Range (INR per annum)</Label>
                <div className="grid gap-4 sm:grid-cols-2 mt-2">
                  <Input
                    type="number"
                    placeholder="Min (e.g., 2000000)"
                    value={formData.salaryMin}
                    onChange={(e) =>
                      setFormData({ ...formData, salaryMin: e.target.value })
                    }
                  />
                  <Input
                    type="number"
                    placeholder="Max (e.g., 3500000)"
                    value={formData.salaryMax}
                    onChange={(e) =>
                      setFormData({ ...formData, salaryMax: e.target.value })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job Description */}
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Enter detailed job description..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={6}
              />
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card>
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
              <CardDescription>Add job requirements one by one</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., 5+ years of experience in full-stack development"
                  value={currentRequirement}
                  onChange={(e) => setCurrentRequirement(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addItem(
                        "requirements",
                        currentRequirement,
                        setCurrentRequirement
                      );
                    }
                  }}
                />
                <Button
                  size="icon"
                  onClick={() =>
                    addItem(
                      "requirements",
                      currentRequirement,
                      setCurrentRequirement
                    )
                  }
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {formData.requirements.map((req, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-3 bg-accent/50 rounded-lg"
                  >
                    <span className="flex-1 text-sm">{req}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => removeItem("requirements", index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Responsibilities */}
          <Card>
            <CardHeader>
              <CardTitle>Responsibilities</CardTitle>
              <CardDescription>
                Key responsibilities for this role
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., Design and develop scalable web applications"
                  value={currentResponsibility}
                  onChange={(e) => setCurrentResponsibility(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addItem(
                        "responsibilities",
                        currentResponsibility,
                        setCurrentResponsibility
                      );
                    }
                  }}
                />
                <Button
                  size="icon"
                  onClick={() =>
                    addItem(
                      "responsibilities",
                      currentResponsibility,
                      setCurrentResponsibility
                    )
                  }
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {formData.responsibilities.map((resp, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-3 bg-accent/50 rounded-lg"
                  >
                    <span className="flex-1 text-sm">{resp}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => removeItem("responsibilities", index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle>Required Skills</CardTitle>
              <CardDescription>Add skills as tags</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., React"
                  value={currentSkill}
                  onChange={(e) => setCurrentSkill(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addItem("skills", currentSkill, setCurrentSkill);
                    }
                  }}
                />
                <Button
                  size="icon"
                  onClick={() =>
                    addItem("skills", currentSkill, setCurrentSkill)
                  }
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="pl-3 pr-1 py-1"
                  >
                    {skill}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 ml-1"
                      onClick={() => removeItem("skills", index)}
                    >
                      <X className="h-2 w-2" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Job Posting Preview</DialogTitle>
            <DialogDescription>
              This is how your job posting will appear to candidates
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            <div>
              <h2 className="text-2xl font-bold">
                {formData.title || "Job Title"}
              </h2>
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  {formData.department || "Department"}
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {formData.location || "Location"}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formData.experience || "Experience"}
                </div>
                {formData.salaryMin && formData.salaryMax && (
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />₹
                    {parseInt(formData.salaryMin).toLocaleString("en-IN")} - ₹
                    {parseInt(formData.salaryMax).toLocaleString("en-IN")}
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {formData.description && (
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-sm whitespace-pre-line">
                  {formData.description}
                </p>
              </div>
            )}

            {formData.requirements.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Requirements</h3>
                <ul className="space-y-1 text-sm list-disc list-inside">
                  {formData.requirements.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>
            )}

            {formData.responsibilities.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Responsibilities</h3>
                <ul className="space-y-1 text-sm list-disc list-inside">
                  {formData.responsibilities.map((resp, index) => (
                    <li key={index}>{resp}</li>
                  ))}
                </ul>
              </div>
            )}

            {formData.skills.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function CreateJobPage() {
  return (
    <TenantProtectedRoute allowedRoles={["recruiter"]}>
      <RecruiterPortalLayout>
        <CreateJobContent />
      </RecruiterPortalLayout>
    </TenantProtectedRoute>
  );
}
