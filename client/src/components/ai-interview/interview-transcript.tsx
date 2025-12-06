"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Bot, User } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";

interface TranscriptEntry {
  type: "question" | "answer";
  text: string;
  timestamp: Date;
}

interface InterviewTranscriptProps {
  entries: TranscriptEntry[];
}

export function InterviewTranscript({ entries }: InterviewTranscriptProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new entries are added
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries]);

  return (
    <Card className="h-full border-2">
      <div className="p-4 border-b bg-muted/50">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Interview Transcript
        </h3>
      </div>

      <ScrollArea className="h-[calc(100%-57px)]" ref={scrollRef}>
        <div className="p-4 space-y-4">
          {entries.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm py-8">
              Interview transcript will appear here...
            </div>
          ) : (
            entries.map((entry, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex gap-3 ${
                  entry.type === "answer" ? "flex-row-reverse" : ""
                }`}
              >
                {/* Avatar */}
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    entry.type === "question"
                      ? "bg-primary/10 text-primary"
                      : "bg-secondary/10 text-secondary-foreground"
                  }`}
                >
                  {entry.type === "question" ? (
                    <Bot className="w-4 h-4" />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                </div>

                {/* Message bubble */}
                <div
                  className={`flex-1 max-w-[85%] ${
                    entry.type === "answer" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`px-4 py-2.5 rounded-2xl ${
                      entry.type === "question"
                        ? "bg-primary/10 text-foreground rounded-tl-none"
                        : "bg-secondary/20 text-foreground rounded-tr-none"
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {entry.text}
                    </p>
                  </div>
                  <div
                    className={`text-xs text-muted-foreground mt-1 ${
                      entry.type === "answer" ? "text-right" : ""
                    }`}
                  >
                    {entry.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}
