"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Send,
  Bot,
  User,
  Sparkles,
  MessageSquare,
  Lightbulb,
  Calendar,
  FileText,
  Shield,
  HelpCircle,
  Trash2,
  ArrowUp,
  ExternalLink,
  ChevronRight,
  BookOpen,
  TicketPlus,
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import {
  tenantEmployeeAPI,
  tenantQueryAPI,
  HelpdeskResponse,
  QueryResponse,
} from "@/lib/api";
import { cn } from "@/lib/utils";
import { useTenant } from "@/providers/tenant-provider";
import ReactMarkdown from "react-markdown";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

// GCS bucket for policy documents
const GCS_BUCKET_NAME =
  process.env.NEXT_PUBLIC_GCS_BUCKET_NAME || "workzone-bucket";

// Build full GCS URL for policy document
const getGCSPolicyUrl = (fileName: string, tenantId: string): string => {
  // Full path: platform/policies/{tenant_id}/{filename}
  const fullPath = `platform/policies/${tenantId}/${fileName}`;
  const encodedPath = fullPath.split("/").map(encodeURIComponent).join("/");
  return `https://storage.googleapis.com/${GCS_BUCKET_NAME}/${encodedPath}`;
};

interface Source {
  source?: string; // filename/blob path from backend
  category?: string; // leave, payroll, benefits, policies
  relevance_score?: number;
  [key: string]: unknown;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  sources?: Source[];
  suggestions?: string[];
  confidence?: number;
  current_topic?: string;
}

const suggestedQuestions = [
  {
    icon: Calendar,
    text: "What is my leave balance?",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: FileText,
    text: "How do I apply for leave?",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: Shield,
    text: "What are the company policies?",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    icon: HelpCircle,
    text: "Who is my manager?",
    gradient: "from-orange-500 to-amber-500",
  },
];

// Animated loading text component
function ThinkingAnimation() {
  const texts = [
    "Thinking...",
    "Analyzing your query...",
    "Searching policies...",
    "Generating response...",
  ];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % texts.length);
    }, 1500);
    return () => clearInterval(timer);
  }, [texts.length]);

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={currentIndex}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent font-medium"
      >
        {texts[currentIndex]}
      </motion.span>
    </AnimatePresence>
  );
}

export function HelpdeskChat() {
  const { tenant } = useTenant();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Query/Ticket state
  const [isRaiseQueryDialogOpen, setIsRaiseQueryDialogOpen] = useState(false);
  const [queryText, setQueryText] = useState("");
  const [isSubmittingQuery, setIsSubmittingQuery] = useState(false);
  const [raisedQueries, setRaisedQueries] = useState<QueryResponse[]>([]);
  const [showMyQueries, setShowMyQueries] = useState(false);
  const [isLoadingQueries, setIsLoadingQueries] = useState(false);

  // Load queries on mount
  useEffect(() => {
    loadMyQueries();
  }, []);

  const loadMyQueries = async () => {
    setIsLoadingQueries(true);
    try {
      const queries = await tenantQueryAPI.getMyQueries();
      setRaisedQueries(queries);
    } catch (error) {
      console.error("Failed to load queries:", error);
    } finally {
      setIsLoadingQueries(false);
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Focus textarea on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`;
    }
  }, [input]);

  const generateMessageId = () => {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const sendMessage = useCallback(
    async (messageText: string) => {
      if (!messageText.trim() || isLoading) return;

      const userMessage: Message = {
        id: generateMessageId(),
        role: "user",
        content: messageText.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setIsLoading(true);

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }

      try {
        const response: HelpdeskResponse = await tenantEmployeeAPI.helpdesk({
          query: messageText.trim(),
          chat_id: chatId || undefined,
        });

        if (response.chat_id) {
          setChatId(response.chat_id);
        }

        const assistantMessage: Message = {
          id: generateMessageId(),
          role: "assistant",
          content: response.answer,
          timestamp: new Date(),
          sources: response.sources as Source[],
          suggestions: response.suggestions,
          confidence: response.confidence,
          current_topic: response.current_topic,
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (error) {
        console.error("Helpdesk error:", error);
        toast.error("Failed to get response. Please try again.");

        const errorMessage: Message = {
          id: generateMessageId(),
          role: "assistant",
          content:
            "I apologize, but I encountered an error processing your request. Please try again or contact HR directly for assistance.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
        textareaRef.current?.focus();
      }
    },
    [chatId, isLoading]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setChatId(null);
    toast.success("Chat cleared");
    textareaRef.current?.focus();
  };

  // Raise Query to HR/Recruiter
  const handleRaiseQuery = async () => {
    if (!queryText.trim()) {
      toast.error("Please describe your query");
      return;
    }

    setIsSubmittingQuery(true);
    try {
      const response = await tenantQueryAPI.createQuery({
        query_text: queryText.trim(),
      });

      setRaisedQueries((prev) => [response, ...prev]);
      setQueryText("");
      setIsRaiseQueryDialogOpen(false);

      toast.success("Query submitted successfully! HR will respond soon.", {
        description: `Query ID: ${response.id.slice(0, 8)}... | Priority: ${
          response.urgency
        }`,
      });
    } catch (error) {
      console.error("Failed to raise query:", error);
      toast.error("Failed to submit query. Please try again.");
    } finally {
      setIsSubmittingQuery(false);
    }
  };

  // Get urgency badge color
  const getUrgencyColor = (urgency: string) => {
    switch (urgency?.toLowerCase()) {
      case "critical":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "high":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
      case "medium":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "low":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "closed":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "open":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-gradient-to-b from-background to-background/95">
      {/* Floating Header */}
      <div className="shrink-0 backdrop-blur-xl bg-background/70 border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-40 group-hover:opacity-60 transition duration-300"></div>
                <div className="relative w-11 h-11 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Bot className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  WorkZone AI
                  <Sparkles className="w-4 h-4 text-amber-500" />
                </h1>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Your intelligent HR assistant
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* My Queries Button - always show */}
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => {
                  setShowMyQueries(!showMyQueries);
                  if (!showMyQueries) loadMyQueries(); // Refresh when opening
                }}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  showMyQueries
                    ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                )}
              >
                <Clock className="w-4 h-4" />
                My Queries{" "}
                {raisedQueries.length > 0 && `(${raisedQueries.length})`}
              </motion.button>

              {/* Raise Query Button */}
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => setIsRaiseQueryDialogOpen(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 transition-all shadow-md hover:shadow-lg"
              >
                <TicketPlus className="w-4 h-4" />
                Raise Query
              </motion.button>

              {messages.length > 0 && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={clearChat}
                  className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Raise Query Dialog */}
      <Dialog
        open={isRaiseQueryDialogOpen}
        onOpenChange={setIsRaiseQueryDialogOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TicketPlus className="w-5 h-5 text-orange-500" />
              Raise a Query to HR
            </DialogTitle>
            <DialogDescription>
              Can&apos;t find what you need? Submit a query and our HR team will
              respond to you directly.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Describe your query
              </label>
              <Textarea
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                placeholder="Please describe your question or concern in detail. Our HR team will review and respond to you..."
                className="min-h-[150px] resize-none"
              />
              <p className="text-xs text-gray-500">
                Your query will be automatically categorized and prioritized
                using AI.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRaiseQueryDialogOpen(false)}
              disabled={isSubmittingQuery}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRaiseQuery}
              disabled={!queryText.trim() || isSubmittingQuery}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
            >
              {isSubmittingQuery ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <TicketPlus className="w-4 h-4 mr-2" />
                  Submit Query
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* My Queries Panel */}
          {showMyQueries && raisedQueries.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-800"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-500" />
                  My Raised Queries
                </h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={loadMyQueries}
                    disabled={isLoadingQueries}
                    className="text-gray-500"
                  >
                    <RefreshCw
                      className={cn(
                        "w-4 h-4",
                        isLoadingQueries && "animate-spin"
                      )}
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMyQueries(false)}
                    className="text-gray-500"
                  >
                    Hide
                  </Button>
                </div>
              </div>
              {isLoadingQueries ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                </div>
              ) : raisedQueries.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No queries raised yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {raisedQueries.map((query) => (
                    <div
                      key={query.id}
                      className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm"
                    >
                      <div className="space-y-3">
                        {/* Header with badges */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            className={cn(
                              "text-xs",
                              getStatusColor(query.status)
                            )}
                          >
                            {query.status === "open" ? (
                              <>
                                <AlertCircle className="w-3 h-3 mr-1" /> Open
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-3 h-3 mr-1" /> Closed
                              </>
                            )}
                          </Badge>
                          <Badge
                            className={cn(
                              "text-xs",
                              getUrgencyColor(query.urgency)
                            )}
                          >
                            {query.urgency}
                          </Badge>
                          {query.category && (
                            <Badge variant="outline" className="text-xs">
                              {query.category.replace(/_/g, " ")}
                            </Badge>
                          )}
                        </div>

                        {/* Query text */}
                        <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">
                            Your Query
                          </p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {query.query_text}
                          </p>
                        </div>

                        {/* AI Summary */}
                        {query.ai_summary && (
                          <div className="flex items-start gap-2 text-xs text-amber-600 dark:text-amber-400">
                            <Sparkles className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            <span>{query.ai_summary}</span>
                          </div>
                        )}

                        {/* Response from HR */}
                        {query.response_text && (
                          <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                            <p className="text-xs text-green-600 dark:text-green-400 mb-1 font-medium flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              HR Response
                            </p>
                            <p className="text-sm text-green-800 dark:text-green-300">
                              {query.response_text}
                            </p>
                          </div>
                        )}

                        {/* Footer */}
                        <p className="text-xs text-gray-400">
                          ID: {query.id.slice(0, 8)}...
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Welcome State */}
          {messages.length === 0 && !showMyQueries && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center py-12"
            >
              {/* Animated Logo */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                className="relative mb-8"
              >
                <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full blur-2xl opacity-30 animate-pulse"></div>
                <div className="relative w-24 h-24 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl">
                  <MessageSquare className="w-12 h-12 text-white" />
                </div>
              </motion.div>

              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-3xl font-bold text-gray-900 dark:text-white mb-3 text-center"
              >
                How can I help you today?
              </motion.h2>

              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-10"
              >
                Ask me anything about leave policies, company guidelines, HR
                queries, and more.
              </motion.p>

              {/* Suggested Questions Grid */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl"
              >
                {suggestedQuestions.map((question, index) => {
                  const Icon = question.icon;
                  return (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => sendMessage(question.text)}
                      className="group relative p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-transparent hover:shadow-lg transition-all duration-300 text-left overflow-hidden"
                    >
                      <div
                        className={cn(
                          "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300",
                          question.gradient
                        )}
                      />
                      <div className="relative flex items-center gap-3">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-inner",
                            question.gradient
                          )}
                        >
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                          {question.text}
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </motion.div>
            </motion.div>
          )}

          {/* Messages */}
          <div className="space-y-6">
            <AnimatePresence initial={false}>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className={cn(
                    "flex gap-3",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {/* Assistant Message */}
                  {message.role === "assistant" && (
                    <>
                      <div className="flex-shrink-0">
                        <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-md">
                          <Bot className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 max-w-[85%]">
                        {/* Main Answer */}
                        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
                          {/* Topic Badge */}
                          {message.current_topic && (
                            <div className="mb-2">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
                                <BookOpen className="w-3 h-3" />
                                {message.current_topic}
                              </span>
                            </div>
                          )}

                          <div className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed [&>h1]:text-lg [&>h1]:font-bold [&>h1]:mt-3 [&>h1]:mb-1.5 [&>h2]:text-base [&>h2]:font-semibold [&>h2]:mt-2.5 [&>h2]:mb-1 [&>h3]:text-sm [&>h3]:font-medium [&>h3]:mt-2 [&>h3]:mb-1 [&>p]:my-1.5 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:my-1.5 [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:my-1.5 [&>li]:my-0.5">
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                          </div>
                        </div>

                        {/* Sources Section */}
                        {message.sources &&
                          message.sources.length > 0 &&
                          message.sources.some((s) => s.source) && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.2 }}
                              className="bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-xl px-3 py-2"
                            >
                              <div className="flex items-center gap-1.5 mb-2">
                                <FileText className="w-3.5 h-3.5 text-indigo-500" />
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                                  Sources (
                                  {
                                    message.sources.filter((s) => s.source)
                                      .length
                                  }
                                  )
                                </span>
                              </div>
                              <div className="space-y-1.5">
                                {message.sources
                                  .filter((s) => s.source)
                                  .slice(0, 3)
                                  .map((source, idx) => {
                                    const fileName =
                                      source.source || "Document";
                                    const displayName = fileName
                                      .replace(/[-_]/g, " ")
                                      .replace(/\.[^/.]+$/, "");
                                    const fileUrl =
                                      source.source && tenant?.id
                                        ? getGCSPolicyUrl(
                                            source.source,
                                            tenant.id
                                          )
                                        : null;

                                    // If we have a valid URL, render as a link; otherwise just show info
                                    if (fileUrl) {
                                      return (
                                        <a
                                          key={idx}
                                          href={fileUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="flex items-start gap-2 p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-xs hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all cursor-pointer group"
                                        >
                                          <FileText className="w-3.5 h-3.5 text-indigo-500 mt-0.5 flex-shrink-0" />
                                          <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-700 dark:text-gray-300 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                                              {displayName}
                                            </p>
                                            {source.category && (
                                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 mt-1">
                                                {source.category}
                                              </span>
                                            )}
                                          </div>
                                          <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-indigo-500 flex-shrink-0" />
                                        </a>
                                      );
                                    }

                                    // No valid URL - render as non-clickable div
                                    return (
                                      <div
                                        key={idx}
                                        className="flex items-start gap-2 p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-xs"
                                      >
                                        <FileText className="w-3.5 h-3.5 text-indigo-500 mt-0.5 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                          <p className="font-medium text-gray-700 dark:text-gray-300 truncate">
                                            {displayName}
                                          </p>
                                          {source.category && (
                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 mt-1">
                                              {source.category}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                              </div>
                            </motion.div>
                          )}

                        {/* Suggestions Section */}
                        {message.suggestions &&
                          message.suggestions.length > 0 && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.3 }}
                              className="flex flex-col gap-1.5"
                            >
                              <div className="flex items-center gap-1.5 px-1">
                                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                  Follow-up questions
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {message.suggestions
                                  .slice(0, 4)
                                  .map((suggestion, idx) => (
                                    <motion.button
                                      key={idx}
                                      whileHover={{ scale: 1.02 }}
                                      whileTap={{ scale: 0.98 }}
                                      onClick={() => sendMessage(suggestion)}
                                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all"
                                    >
                                      <ChevronRight className="w-3 h-3 text-indigo-500" />
                                      <span className="truncate max-w-[200px]">
                                        {suggestion}
                                      </span>
                                    </motion.button>
                                  ))}
                              </div>
                            </motion.div>
                          )}

                        <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                    </>
                  )}

                  {/* User Message */}
                  {message.role === "user" && (
                    <>
                      <div className="flex flex-col gap-1 max-w-[85%] items-end">
                        <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl rounded-tr-md px-4 py-3 shadow-md">
                          <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">
                            {message.content}
                          </p>
                        </div>
                        <span className="text-xs text-gray-400 dark:text-gray-500 mr-1">
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                      <div className="flex-shrink-0">
                        <Avatar className="w-9 h-9">
                          <AvatarFallback className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                            <User className="w-5 h-5" />
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    </>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Thinking Indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3"
              >
                <div className="flex-shrink-0">
                  <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-md">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 1, 0.5],
                          }}
                          transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            delay: i * 0.15,
                          }}
                        />
                      ))}
                    </div>
                    <ThinkingAnimation />
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Fixed Input Bar */}
      <div className="shrink-0 border-t border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <form onSubmit={handleSubmit}>
            <div className="relative flex items-end gap-2 p-2 rounded-2xl border border-border bg-card shadow-lg focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-all">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                disabled={isLoading}
                rows={1}
                className="flex-1 resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm placeholder:text-muted-foreground min-h-[44px] max-h-[200px] py-3 px-2"
              />

              <div className="flex items-center gap-2 pb-1">
                {/* Character count */}
                {input.length > 0 && (
                  <span className="text-xs text-gray-400 tabular-nums">
                    {input.length}
                  </span>
                )}

                {/* Send Button */}
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim() || isLoading}
                  className={cn(
                    "w-10 h-10 rounded-xl transition-all duration-200",
                    input.trim() && !isLoading
                      ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:shadow-lg hover:scale-105 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-400"
                  )}
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <Send className="w-4 h-4" />
                    </motion.div>
                  ) : (
                    <ArrowUp className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>

            {/* Keyboard hint */}
            <div className="flex items-center justify-center gap-4 mt-2 text-xs text-gray-400 dark:text-gray-500">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-[10px] font-medium">
                  Enter
                </kbd>
                to send
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-[10px] font-medium">
                  Shift
                </kbd>
                +
                <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-[10px] font-medium">
                  Enter
                </kbd>
                new line
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
