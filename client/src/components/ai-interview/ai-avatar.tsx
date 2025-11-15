"use client";

import { motion } from "framer-motion";
import { Bot, Sparkles } from "lucide-react";

interface AiAvatarProps {
  isPlaying: boolean;
  size?: "sm" | "md" | "lg";
}

export function AiAvatar({ isPlaying, size = "md" }: AiAvatarProps) {
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };

  const iconSizes = {
    sm: 24,
    md: 32,
    lg: 40,
  };

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer glow rings */}
      {isPlaying && (
        <>
          <motion.div
            className={`absolute ${sizeClasses[size]} rounded-full bg-primary/20`}
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className={`absolute ${sizeClasses[size]} rounded-full bg-primary/30`}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 0, 0.7],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.3,
            }}
          />
        </>
      )}

      {/* Main avatar */}
      <motion.div
        className={`relative ${sizeClasses[size]} rounded-full bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center shadow-2xl border-4 border-background`}
        animate={
          isPlaying
            ? {
                scale: [1, 1.05, 1],
              }
            : {}
        }
        transition={{
          duration: 1,
          repeat: isPlaying ? Infinity : 0,
          ease: "easeInOut",
        }}
      >
        {/* Sparkles when speaking */}
        {isPlaying && (
          <>
            <motion.div
              className="absolute -top-2 -right-2"
              animate={{
                scale: [0, 1, 0],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: 0,
              }}
            >
              <Sparkles className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            </motion.div>
            <motion.div
              className="absolute -bottom-2 -left-2"
              animate={{
                scale: [0, 1, 0],
                rotate: [0, -180, -360],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: 0.5,
              }}
            >
              <Sparkles className="w-4 h-4 text-blue-400 fill-blue-400" />
            </motion.div>
          </>
        )}

        {/* Bot icon */}
        <Bot className="text-white" size={iconSizes[size]} strokeWidth={2.5} />
      </motion.div>

      {/* Equalizer bars when speaking */}
      {isPlaying && (
        <div className="absolute bottom-0 flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1 bg-primary/60 rounded-full"
              animate={{
                height: [8, 16, 8],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
