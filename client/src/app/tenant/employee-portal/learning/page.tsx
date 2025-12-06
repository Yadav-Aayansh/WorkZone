"use client";

import { useState, useEffect } from "react";
import { TenantProtectedRoute } from "@/components/tenant/TenantProtectedRoute";
import { ModernEmployeeLayout } from "@/components/common/layout/ModernEmployeeLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  GraduationCap,
  Target,
  Sparkles,
  Loader2,
  Plus,
  ExternalLink,
  Video,
  FileText,
  BookMarked,
  Code,
  Brain,
  Rocket,
  CheckCircle2,
  Clock,
  ArrowRight,
  Lightbulb,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  tenantLearningAPI,
  LearningPlanResponse,
  SkillArea,
  LearningResource,
} from "@/lib/api";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

// Resource type icon mapping
const getResourceIcon = (type: string) => {
  const lowerType = type.toLowerCase();
  if (lowerType.includes("video")) return <Video className="h-4 w-4" />;
  if (lowerType.includes("course"))
    return <GraduationCap className="h-4 w-4" />;
  if (lowerType.includes("article")) return <FileText className="h-4 w-4" />;
  if (lowerType.includes("documentation") || lowerType.includes("doc"))
    return <BookMarked className="h-4 w-4" />;
  if (lowerType.includes("code") || lowerType.includes("tutorial"))
    return <Code className="h-4 w-4" />;
  return <BookOpen className="h-4 w-4" />;
};

// Resource type color mapping
const getResourceColor = (type: string) => {
  const lowerType = type.toLowerCase();
  if (lowerType.includes("video"))
    return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
  if (lowerType.includes("course"))
    return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
  if (lowerType.includes("article"))
    return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
  if (lowerType.includes("documentation") || lowerType.includes("doc"))
    return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
  return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
};

// Skill card component
function SkillCard({
  skill,
  index,
  isExpanded,
  onToggle,
}: {
  skill: SkillArea;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const completedResources = 0; // In future, track completion
  const totalResources = skill.resources.length;
  const progress =
    totalResources > 0 ? (completedResources / totalResources) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-indigo-500 dark:border-l-indigo-400 overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                  <Brain className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <CardTitle className="text-lg font-semibold">
                  {skill.skill_name}
                </CardTitle>
              </div>
              <CardDescription className="text-sm leading-relaxed">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <span>{children}</span>,
                    strong: ({ children }) => (
                      <strong className="font-semibold text-foreground">
                        {children}
                      </strong>
                    ),
                  }}
                >
                  {skill.reason}
                </ReactMarkdown>
              </CardDescription>
            </div>
            <Badge variant="secondary" className="shrink-0">
              {totalResources} resources
            </Badge>
          </div>

          {/* Progress bar */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <Button
            variant="ghost"
            className="w-full justify-between hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
            onClick={onToggle}
          >
            <span className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              View Learning Resources
            </span>
            <ChevronRight
              className={`h-4 w-4 transition-transform duration-200 ${
                isExpanded ? "rotate-90" : ""
              }`}
            />
          </Button>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-4 space-y-3">
                  {skill.resources.map((resource, resourceIndex) => (
                    <ResourceCard
                      key={resourceIndex}
                      resource={resource}
                      index={resourceIndex}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Resource card component
function ResourceCard({
  resource,
  index,
}: {
  resource: LearningResource;
  index: number;
}) {
  return (
    <motion.a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-all duration-200 group/resource"
    >
      <div
        className={`p-2 rounded-lg ${getResourceColor(resource.type)} shrink-0`}
      >
        {getResourceIcon(resource.type)}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm truncate group-hover/resource:text-indigo-600 dark:group-hover/resource:text-indigo-400 transition-colors">
          {resource.title}
        </h4>
        <p className="text-xs text-muted-foreground mt-0.5">{resource.type}</p>
      </div>
      <ExternalLink className="h-4 w-4 text-muted-foreground group-hover/resource:text-indigo-600 dark:group-hover/resource:text-indigo-400 transition-colors shrink-0" />
    </motion.a>
  );
}

// Learning plan card for the grid view
function LearningPlanCard({
  plan,
  index,
  onSelect,
  isSelected,
}: {
  plan: LearningPlanResponse;
  index: number;
  onSelect: () => void;
  isSelected: boolean;
}) {
  const totalResources = plan.skill_areas.reduce(
    (acc, skill) => acc + skill.resources.length,
    0
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        className={`cursor-pointer transition-all duration-300 h-full ${
          isSelected
            ? "ring-2 ring-indigo-500 dark:ring-indigo-400 shadow-lg"
            : "hover:shadow-md"
        }`}
        onClick={onSelect}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shrink-0">
              <Rocket className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base font-semibold line-clamp-2">
                {plan.plan_title}
              </CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  {plan.skill_areas.length} skills
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {totalResources} resources
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground line-clamp-3">
            <ReactMarkdown
              components={{
                p: ({ children }) => <span>{children}</span>,
              }}
            >
              {plan.plan_summary}
            </ReactMarkdown>
          </p>
          <div className="mt-4 flex items-center text-sm text-indigo-600 dark:text-indigo-400 font-medium">
            <span>View Details</span>
            <ArrowRight className="h-4 w-4 ml-1" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Empty state component
function EmptyState({ onGenerate }: { onGenerate: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full blur-2xl opacity-20 animate-pulse" />
        <div className="relative p-6 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30">
          <GraduationCap className="h-16 w-16 text-indigo-600 dark:text-indigo-400" />
        </div>
      </div>
      <h3 className="mt-6 text-2xl font-bold text-center">
        Start Your Learning Journey
      </h3>
      <p className="mt-2 text-muted-foreground text-center max-w-md">
        Generate a personalized learning path based on your career goals. Our AI
        will curate the best resources to help you grow.
      </p>
      <Button
        onClick={onGenerate}
        className="mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
        size="lg"
      >
        <Sparkles className="mr-2 h-5 w-5" />
        Generate Your First Learning Path
      </Button>
    </motion.div>
  );
}

// Generate dialog component
function GenerateDialog({
  open,
  onOpenChange,
  onGenerate,
  isGenerating,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (goal: string) => void;
  isGenerating: boolean;
}) {
  const [careerGoal, setCareerGoal] = useState("");

  const suggestedGoals = [
    "Become a Senior Software Engineer",
    "Transition to Data Science",
    "Learn Cloud Architecture",
    "Master Machine Learning",
    "Become a Tech Lead",
    "Learn Full-Stack Development",
  ];

  const handleSubmit = () => {
    if (!careerGoal.trim()) {
      toast.error("Please enter your career goal");
      return;
    }
    onGenerate(careerGoal);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Target className="h-6 w-6 text-indigo-600" />
            Set Your Career Goal
          </DialogTitle>
          <DialogDescription>
            Tell us what you want to achieve, and we&apos;ll create a
            personalized learning path just for you.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="career-goal" className="text-sm font-medium">
              What&apos;s your career goal?
            </Label>
            <Textarea
              id="career-goal"
              placeholder="e.g., I want to become a senior full-stack developer with expertise in cloud technologies..."
              value={careerGoal}
              onChange={(e) => setCareerGoal(e.target.value)}
              className="min-h-[100px] resize-none"
              disabled={isGenerating}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">
              Quick suggestions
            </Label>
            <div className="flex flex-wrap gap-2">
              {suggestedGoals.map((goal) => (
                <Badge
                  key={goal}
                  variant="outline"
                  className="cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:border-indigo-300 transition-colors"
                  onClick={() => !isGenerating && setCareerGoal(goal)}
                >
                  {goal}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isGenerating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isGenerating || !careerGoal.trim()}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Path
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Detailed view of a learning plan
function LearningPlanDetail({
  plan,
  onBack,
}: {
  plan: LearningPlanResponse;
  onBack: () => void;
}) {
  const [expandedSkills, setExpandedSkills] = useState<Set<number>>(new Set());

  const toggleSkill = (index: number) => {
    const newExpanded = new Set(expandedSkills);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSkills(newExpanded);
  };

  const expandAll = () => {
    setExpandedSkills(new Set(plan.skill_areas.map((_, i) => i)));
  };

  const collapseAll = () => {
    setExpandedSkills(new Set());
  };

  const totalResources = plan.skill_areas.reduce(
    (acc, skill) => acc + skill.resources.length,
    0
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="mb-2 -ml-2"
          >
            <ChevronRight className="h-4 w-4 rotate-180 mr-1" />
            Back to Plans
          </Button>
          <h2 className="text-2xl font-bold">{plan.plan_title}</h2>
          <p className="mt-2 text-muted-foreground">
            <ReactMarkdown
              components={{
                p: ({ children }) => <span>{children}</span>,
              }}
            >
              {plan.plan_summary}
            </ReactMarkdown>
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/50 dark:to-background">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/50">
              <Brain className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{plan.skill_areas.length}</p>
              <p className="text-xs text-muted-foreground">Skills to Learn</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/50 dark:to-background">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/50">
              <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalResources}</p>
              <p className="text-xs text-muted-foreground">Total Resources</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-white dark:from-green-950/50 dark:to-background">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/50">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">0</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/50 dark:to-background">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/50">
              <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalResources}</p>
              <p className="text-xs text-muted-foreground">Remaining</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Learning Path</h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={expandAll}>
            Expand All
          </Button>
          <Button variant="outline" size="sm" onClick={collapseAll}>
            Collapse All
          </Button>
        </div>
      </div>

      {/* Skills */}
      <div className="space-y-4">
        {plan.skill_areas.map((skill, index) => (
          <SkillCard
            key={index}
            skill={skill}
            index={index}
            isExpanded={expandedSkills.has(index)}
            onToggle={() => toggleSkill(index)}
          />
        ))}
      </div>
    </motion.div>
  );
}

function LearningContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [learningPaths, setLearningPaths] = useState<LearningPlanResponse[]>(
    []
  );
  const [selectedPlan, setSelectedPlan] = useState<LearningPlanResponse | null>(
    null
  );
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);

  useEffect(() => {
    loadLearningPaths();
  }, []);

  const loadLearningPaths = async () => {
    setIsLoading(true);
    try {
      const paths = await tenantLearningAPI.getMyPaths();
      setLearningPaths(paths);
    } catch (err) {
      console.error("Failed to load learning paths:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to load learning paths"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async (careerGoal: string) => {
    setIsGenerating(true);
    try {
      const newPath = await tenantLearningAPI.generatePath({
        career_goal: careerGoal,
      });
      // Reload all paths from server to avoid duplicates
      await loadLearningPaths();
      setSelectedPlan(newPath);
      setShowGenerateDialog(false);
      toast.success("Learning path generated successfully!");
    } catch (err) {
      console.error("Failed to generate learning path:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to generate learning path"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto" />
          <p className="mt-4 text-muted-foreground">
            Loading your learning paths...
          </p>
        </div>
      </div>
    );
  }

  // Show detailed view if a plan is selected
  if (selectedPlan) {
    return (
      <LearningPlanDetail
        plan={selectedPlan}
        onBack={() => setSelectedPlan(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Learning Paths</h1>
          <p className="text-muted-foreground mt-1">
            AI-powered personalized learning recommendations for your career
            growth
          </p>
        </div>
        {learningPaths.length > 0 && (
          <Button
            onClick={() => setShowGenerateDialog(true)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Learning Path
          </Button>
        )}
      </div>

      {/* Content */}
      {learningPaths.length === 0 ? (
        <EmptyState onGenerate={() => setShowGenerateDialog(true)} />
      ) : (
        <>
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-indigo-100">Total Paths</p>
                    <p className="text-3xl font-bold mt-1">
                      {learningPaths.length}
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-white/20">
                    <Rocket className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100">Skills to Learn</p>
                    <p className="text-3xl font-bold mt-1">
                      {learningPaths.reduce(
                        (acc, p) => acc + p.skill_areas.length,
                        0
                      )}
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-white/20">
                    <Brain className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-orange-500 to-amber-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100">Total Resources</p>
                    <p className="text-3xl font-bold mt-1">
                      {learningPaths.reduce(
                        (acc, p) =>
                          acc +
                          p.skill_areas.reduce(
                            (a, s) => a + s.resources.length,
                            0
                          ),
                        0
                      )}
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-white/20">
                    <BookOpen className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Learning Paths Grid */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Your Learning Paths</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {learningPaths.map((plan, index) => (
                <LearningPlanCard
                  key={index}
                  plan={plan}
                  index={index}
                  isSelected={false}
                  onSelect={() => setSelectedPlan(plan)}
                />
              ))}
            </div>
          </div>

          {/* Tips Section */}
          <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border-indigo-200 dark:border-indigo-800">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900/50 shrink-0">
                  <Lightbulb className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    Pro Tips for Effective Learning
                  </h3>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Set aside dedicated time each day for learning
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Focus on one skill at a time for better retention
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Practice with real projects to reinforce your learning
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Join communities related to your learning topics
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Generate Dialog */}
      <GenerateDialog
        open={showGenerateDialog}
        onOpenChange={setShowGenerateDialog}
        onGenerate={handleGenerate}
        isGenerating={isGenerating}
      />
    </div>
  );
}

export default function LearningPage() {
  return (
    <TenantProtectedRoute allowedRoles={["employee"]}>
      <ModernEmployeeLayout>
        <div className="container max-w-7xl mx-auto py-6 px-4 sm:px-6">
          <LearningContent />
        </div>
      </ModernEmployeeLayout>
    </TenantProtectedRoute>
  );
}
