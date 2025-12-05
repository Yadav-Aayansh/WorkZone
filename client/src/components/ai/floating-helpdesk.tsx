"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Bot,
  User,
  Sparkles,
  MessageSquare,
  X,
  Minus,
  ArrowUp,
  Lightbulb,
  Calendar,
  FileText,
  Shield,
  HelpCircle,
  Trash2,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import { tenantEmployeeAPI, HelpdeskResponse } from "@/lib/api";
import { cn } from "@/lib/utils";

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

const quickActions = [
  {
    icon: Calendar,
    text: "Leave balance",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: FileText,
    text: "Apply leave",
    gradient: "from-emerald-500 to-teal-500",
  },
  { icon: Shield, text: "Policies", gradient: "from-violet-500 to-purple-500" },
  { icon: HelpCircle, text: "Help", gradient: "from-orange-500 to-amber-500" },
];

// Animated loading text
function ThinkingDots() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.1,
            }}
          />
        ))}
      </div>
      <span className="text-xs text-gray-500 dark:text-gray-400">
        Thinking...
      </span>
    </div>
  );
}

export function FloatingHelpdesk() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [hasUnread, setHasUnread] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Focus textarea when opening
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        100
      )}px`;
    }
  }, [input]);

  // Clear unread when opening
  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
    }
  }, [isOpen]);

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

        // Show unread indicator if minimized
        if (isMinimized) {
          setHasUnread(true);
        }
      } catch (error) {
        console.error("Helpdesk error:", error);
        toast.error("Failed to get response");

        const errorMessage: Message = {
          id: generateMessageId(),
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
        textareaRef.current?.focus();
      }
    },
    [chatId, isLoading, isMinimized]
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
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 group"
          >
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity animate-pulse" />

              {/* Button */}
              <div className="relative w-14 h-14 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-xl">
                <Bot className="w-7 h-7 text-white" />
              </div>

              {/* Unread badge */}
              {hasUnread && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                >
                  <span className="text-[10px] text-white font-bold">!</span>
                </motion.span>
              )}

              {/* Tooltip */}
              <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
                  AI Helpdesk
                  <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-900 dark:border-l-gray-100" />
                </div>
              </div>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              height: isMinimized ? "auto" : 520,
            }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex-shrink-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold flex items-center gap-1.5">
                      WorkZone AI
                      <Sparkles className="w-4 h-4 text-amber-300" />
                    </h3>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                      <span className="text-white/80 text-xs">
                        Always here to help
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {messages.length > 0 && (
                    <button
                      onClick={clearChat}
                      className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                      title="Clear chat"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                    title={isMinimized ? "Expand" : "Minimize"}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                    title="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <AnimatePresence>
              {!isMinimized && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-col flex-1 min-h-0"
                >
                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[320px]">
                    {/* Welcome state */}
                    {messages.length === 0 && (
                      <div className="text-center py-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <MessageSquare className="w-8 h-8 text-indigo-500" />
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          Hi! How can I help you today?
                        </p>

                        {/* Quick Actions */}
                        <div className="grid grid-cols-2 gap-2">
                          {quickActions.map((action, idx) => {
                            const Icon = action.icon;
                            return (
                              <motion.button
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => sendMessage(action.text)}
                                className="flex items-center gap-2 p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 bg-white dark:bg-gray-800 transition-all text-left"
                              >
                                <div
                                  className={cn(
                                    "w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center",
                                    action.gradient
                                  )}
                                >
                                  <Icon className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                  {action.text}
                                </span>
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Messages */}
                    {messages.map((message, messageIdx) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-2"
                      >
                        <div
                          className={cn(
                            "flex gap-2",
                            message.role === "user"
                              ? "justify-end"
                              : "justify-start"
                          )}
                        >
                          {message.role === "assistant" && (
                            <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Bot className="w-4 h-4 text-white" />
                            </div>
                          )}

                          <div
                            className={cn(
                              "max-w-[75%] rounded-2xl px-3 py-2",
                              message.role === "user"
                                ? "bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-tr-md"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-md"
                            )}
                          >
                            {/* Topic Badge */}
                            {message.role === "assistant" &&
                              message.current_topic && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 mb-1">
                                  <BookOpen className="w-2.5 h-2.5" />
                                  {message.current_topic}
                                </span>
                              )}
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                              {message.content}
                            </p>
                            <p
                              className={cn(
                                "text-[10px] mt-1",
                                message.role === "user"
                                  ? "text-indigo-200"
                                  : "text-gray-400"
                              )}
                            >
                              {formatTime(message.timestamp)}
                            </p>
                          </div>

                          {message.role === "user" && (
                            <Avatar className="w-7 h-7 flex-shrink-0">
                              <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs">
                                <User className="w-4 h-4" />
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>

                        {/* Suggestions - only show for the last assistant message */}
                        {message.role === "assistant" &&
                          message.suggestions &&
                          message.suggestions.length > 0 &&
                          messageIdx === messages.length - 1 && (
                            <motion.div
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.2 }}
                              className="ml-9 flex flex-wrap gap-1"
                            >
                              {message.suggestions
                                .slice(0, 3)
                                .map((suggestion, idx) => (
                                  <motion.button
                                    key={idx}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => sendMessage(suggestion)}
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all"
                                  >
                                    <ChevronRight className="w-2.5 h-2.5 text-indigo-500" />
                                    <span className="truncate max-w-[120px]">
                                      {suggestion}
                                    </span>
                                  </motion.button>
                                ))}
                            </motion.div>
                          )}
                      </motion.div>
                    ))}

                    {/* Loading */}
                    {isLoading && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-2"
                      >
                        <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-md px-3 py-2">
                          <ThinkingDots />
                        </div>
                      </motion.div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div className="flex-shrink-0 p-3 border-t border-gray-100 dark:border-gray-800">
                    <form onSubmit={handleSubmit}>
                      <div className="flex items-end gap-2 p-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all">
                        <Textarea
                          ref={textareaRef}
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="Type a message..."
                          disabled={isLoading}
                          rows={1}
                          className="flex-1 resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm placeholder:text-gray-400 min-h-[36px] max-h-[100px] py-2 px-1"
                        />
                        <Button
                          type="submit"
                          size="icon"
                          disabled={!input.trim() || isLoading}
                          className={cn(
                            "w-8 h-8 rounded-lg transition-all flex-shrink-0",
                            input.trim() && !isLoading
                              ? "bg-gradient-to-r from-indigo-500 to-purple-500 hover:shadow-md text-white"
                              : "bg-gray-200 dark:bg-gray-700 text-gray-400"
                          )}
                        >
                          <ArrowUp className="w-4 h-4" />
                        </Button>
                      </div>
                    </form>
                    <p className="text-[10px] text-gray-400 text-center mt-2">
                      <Lightbulb className="w-3 h-3 inline mr-1" />
                      Press Enter to send
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
