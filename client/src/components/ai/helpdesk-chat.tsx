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
} from "lucide-react";
import { toast } from "sonner";
import { tenantEmployeeAPI, HelpdeskResponse } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* Floating Header */}
      <div className="sticky top-0 z-10 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-b border-gray-200/50 dark:border-gray-800/50">
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

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Welcome State */}
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center min-h-[60vh]"
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

              {/* Tip */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="flex items-center gap-2 mt-10 text-sm text-gray-400 dark:text-gray-500"
              >
                <Lightbulb className="w-4 h-4" />
                <span>Press Enter to send, Shift+Enter for new line</span>
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
                      <div className="flex flex-col gap-1 max-w-[85%]">
                        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
                          <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">
                            {message.content}
                          </p>
                        </div>
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
      <div className="sticky bottom-0 border-t border-gray-200/50 dark:border-gray-800/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <form onSubmit={handleSubmit}>
            <div className="relative flex items-end gap-2 p-2 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                disabled={isLoading}
                rows={1}
                className="flex-1 resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 min-h-[44px] max-h-[200px] py-3 px-2"
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
