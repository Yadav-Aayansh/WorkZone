"use client";

import { useState, useEffect } from "react";
import { TenantProtectedRoute } from "@/components/tenant/TenantProtectedRoute";
import { ModernRecruiterLayout } from "@/components/common/layout/ModernRecruiterLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Send,
  Loader2,
  RefreshCw,
  Inbox,
  Tag,
  Sparkles,
  MessageCircle,
} from "lucide-react";
import { tenantQueryAPI, QueryResponse } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

function QueriesManagementContent() {
  const [queries, setQueries] = useState<QueryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedQuery, setSelectedQuery] = useState<QueryResponse | null>(
    null
  );
  const [responseText, setResponseText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("open");

  useEffect(() => {
    loadQueries();
  }, []);

  const loadQueries = async () => {
    setIsLoading(true);
    try {
      const data = await tenantQueryAPI.getAssignedQueries();
      setQueries(data);
    } catch (err) {
      console.error("Failed to load queries:", err);
      toast.error("Failed to load queries");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRespond = async () => {
    if (!selectedQuery || !responseText.trim()) {
      toast.error("Please enter a response");
      return;
    }

    setIsSubmitting(true);
    try {
      await tenantQueryAPI.respondToQuery(selectedQuery.id, {
        response_text: responseText.trim(),
      });

      // Update local state
      setQueries((prev) =>
        prev.map((q) =>
          q.id === selectedQuery.id
            ? { ...q, status: "closed", response_text: responseText.trim() }
            : q
        )
      );

      toast.success("Response sent successfully!");
      setSelectedQuery(null);
      setResponseText("");
    } catch (err) {
      console.error("Failed to respond:", err);
      toast.error("Failed to send response. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency?.toLowerCase()) {
      case "critical":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800";
      case "high":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800";
      case "low":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-800";
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency?.toLowerCase()) {
      case "critical":
        return <AlertCircle className="w-4 h-4" />;
      case "high":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getCategoryLabel = (category: string | null) => {
    if (!category) return "General";
    return category.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const openQueries = queries.filter((q) => q.status === "open");
  const closedQueries = queries.filter((q) => q.status === "closed");

  // Stats
  const criticalCount = openQueries.filter(
    (q) => q.urgency === "critical"
  ).length;
  const highCount = openQueries.filter((q) => q.urgency === "high").length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-indigo-500" />
            Employee Queries
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage and respond to employee questions and concerns
          </p>
        </div>
        <Button onClick={loadQueries} variant="outline" disabled={isLoading}>
          <RefreshCw
            className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")}
          />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-none shadow-lg dark:bg-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Total Open
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {openQueries.length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <Inbox className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg dark:bg-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Critical
                </p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {criticalCount}
                </p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg dark:bg-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  High Priority
                </p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {highCount}
                </p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg dark:bg-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Resolved
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {closedQueries.length}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Queries Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="bg-gray-100 dark:bg-gray-800 p-1">
          <TabsTrigger value="open" className="flex items-center gap-2">
            <Inbox className="w-4 h-4" />
            Open ({openQueries.length})
          </TabsTrigger>
          <TabsTrigger value="closed" className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Resolved ({closedQueries.length})
          </TabsTrigger>
        </TabsList>

        {/* Open Queries */}
        <TabsContent value="open" className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
          ) : openQueries.length === 0 ? (
            <Card className="border-none shadow-lg dark:bg-gray-800">
              <CardContent className="py-12">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    All caught up!
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    No open queries to respond to.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <AnimatePresence>
              {openQueries
                .sort((a, b) => {
                  const urgencyOrder = {
                    critical: 0,
                    high: 1,
                    medium: 2,
                    low: 3,
                  };
                  return (
                    (urgencyOrder[a.urgency as keyof typeof urgencyOrder] ||
                      4) -
                    (urgencyOrder[b.urgency as keyof typeof urgencyOrder] || 4)
                  );
                })
                .map((query, index) => (
                  <motion.div
                    key={query.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card
                      className={cn(
                        "border-l-4 shadow-lg hover:shadow-xl transition-all cursor-pointer dark:bg-gray-800",
                        query.urgency === "critical" && "border-l-red-500",
                        query.urgency === "high" && "border-l-orange-500",
                        query.urgency === "medium" && "border-l-yellow-500",
                        query.urgency === "low" && "border-l-green-500"
                      )}
                      onClick={() => setSelectedQuery(query)}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            {/* Badges */}
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                              <Badge
                                className={cn(
                                  "text-xs",
                                  getUrgencyColor(query.urgency)
                                )}
                              >
                                {getUrgencyIcon(query.urgency)}
                                <span className="ml-1 capitalize">
                                  {query.urgency}
                                </span>
                              </Badge>
                              {query.category && (
                                <Badge variant="outline" className="text-xs">
                                  <Tag className="w-3 h-3 mr-1" />
                                  {getCategoryLabel(query.category)}
                                </Badge>
                              )}
                            </div>

                            {/* AI Summary */}
                            <div className="flex items-start gap-2 mb-3">
                              <Sparkles className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {query.ai_summary || "No summary available"}
                              </p>
                            </div>

                            {/* Query Preview */}
                            {query.query_text && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                &quot;{query.query_text}&quot;
                              </p>
                            )}
                          </div>

                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedQuery(query);
                            }}
                          >
                            <MessageCircle className="w-4 h-4 mr-1" />
                            Respond
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
            </AnimatePresence>
          )}
        </TabsContent>

        {/* Closed Queries */}
        <TabsContent value="closed" className="space-y-4">
          {closedQueries.length === 0 ? (
            <Card className="border-none shadow-lg dark:bg-gray-800">
              <CardContent className="py-12">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <Inbox className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No resolved queries yet
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Resolved queries will appear here.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <AnimatePresence>
              {closedQueries.map((query, index) => (
                <motion.div
                  key={query.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="border-none shadow-lg dark:bg-gray-800">
                    <CardContent className="p-5">
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Resolved
                              </Badge>
                              {query.category && (
                                <Badge variant="outline" className="text-xs">
                                  {getCategoryLabel(query.category)}
                                </Badge>
                              )}
                            </div>
                            {query.ai_summary && (
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {query.ai_summary}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Response */}
                        {query.response_text && (
                          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                            <p className="text-xs text-green-700 dark:text-green-400 font-medium mb-2 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Your Response
                            </p>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              {query.response_text}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </TabsContent>
      </Tabs>

      {/* Response Dialog */}
      <Dialog
        open={!!selectedQuery}
        onOpenChange={() => setSelectedQuery(null)}
      >
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-500" />
              Respond to Query
            </DialogTitle>
            <DialogDescription>
              Review the employee&apos;s query and provide a helpful response.
            </DialogDescription>
          </DialogHeader>

          {selectedQuery && (
            <div className="space-y-4 py-4">
              {/* Query Info */}
              <div className="space-y-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    className={cn(
                      "text-xs",
                      getUrgencyColor(selectedQuery.urgency)
                    )}
                  >
                    {getUrgencyIcon(selectedQuery.urgency)}
                    <span className="ml-1 capitalize">
                      {selectedQuery.urgency} Priority
                    </span>
                  </Badge>
                  {selectedQuery.category && (
                    <Badge variant="outline" className="text-xs">
                      <Tag className="w-3 h-3 mr-1" />
                      {getCategoryLabel(selectedQuery.category)}
                    </Badge>
                  )}
                </div>

                {/* AI Summary */}
                {selectedQuery.ai_summary && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                    <Sparkles className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-amber-700 dark:text-amber-400 font-medium mb-1">
                        AI Summary
                      </p>
                      <p className="text-sm text-amber-800 dark:text-amber-300">
                        {selectedQuery.ai_summary}
                      </p>
                    </div>
                  </div>
                )}

                {/* Full Query */}
                {selectedQuery.query_text && (
                  <div className="p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600">
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-2">
                      Employee&apos;s Query
                    </p>
                    <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                      {selectedQuery.query_text}
                    </p>
                  </div>
                )}
              </div>

              {/* Response Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Your Response
                </label>
                <Textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Type your response to the employee's query..."
                  className="min-h-[150px] resize-none"
                />
                <p className="text-xs text-gray-500">
                  Your response will be sent to the employee and the query will
                  be marked as resolved.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedQuery(null);
                setResponseText("");
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRespond}
              disabled={!responseText.trim() || isSubmitting}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Response
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function RecruiterQueriesPage() {
  return (
    <TenantProtectedRoute allowedRoles={["recruiter"]}>
      <ModernRecruiterLayout>
        <QueriesManagementContent />
      </ModernRecruiterLayout>
    </TenantProtectedRoute>
  );
}
