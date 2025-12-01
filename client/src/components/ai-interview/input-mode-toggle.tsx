"use client";

import { motion } from "framer-motion";
import { Mic, Keyboard } from "lucide-react";

interface InputModeToggleProps {
  mode: "voice" | "text";
  onChange: (mode: "voice" | "text") => void;
  disabled?: boolean;
}

export function InputModeToggle({
  mode,
  onChange,
  disabled,
}: InputModeToggleProps) {
  return (
    <div className="relative inline-flex items-center bg-muted rounded-full p-1 shadow-inner">
      {/* Sliding background */}
      <motion.div
        className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-primary rounded-full shadow-lg"
        animate={{
          left: mode === "voice" ? "4px" : "calc(50% + 0px)",
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 35,
        }}
      />

      {/* Voice button */}
      <button
        onClick={() => onChange("voice")}
        disabled={disabled}
        className={`relative z-10 flex items-center gap-2 px-6 py-2.5 rounded-full transition-colors ${
          mode === "voice"
            ? "text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <Mic className="w-4 h-4" />
        <span className="font-medium text-sm">Voice</span>
      </button>

      {/* Text button */}
      <button
        onClick={() => onChange("text")}
        disabled={disabled}
        className={`relative z-10 flex items-center gap-2 px-6 py-2.5 rounded-full transition-colors ${
          mode === "text"
            ? "text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <Keyboard className="w-4 h-4" />
        <span className="font-medium text-sm">Text</span>
      </button>
    </div>
  );
}
