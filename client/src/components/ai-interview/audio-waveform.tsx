"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface AudioWaveformProps {
  analyserData: Uint8Array | null;
  isRecording: boolean;
  barCount?: number;
  height?: number;
}

export function AudioWaveform({
  analyserData,
  isRecording,
  barCount = 40,
  height = 120,
}: AudioWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !analyserData) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const barWidth = canvas.width / barCount;
    const bufferLength = analyserData.length;
    const step = Math.floor(bufferLength / barCount);

    // Draw bars
    for (let i = 0; i < barCount; i++) {
      const dataIndex = i * step;
      const value = analyserData[dataIndex] || 0;
      const barHeight = (value / 255) * canvas.height;
      const x = i * barWidth;
      const y = (canvas.height - barHeight) / 2;

      // Gradient for each bar
      const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
      gradient.addColorStop(0, "hsl(var(--primary))");
      gradient.addColorStop(1, "hsl(var(--primary) / 0.5)");

      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, barWidth - 2, barHeight);
    }
  }, [analyserData, barCount]);

  if (!isRecording) {
    // Show idle state with animated bars
    return (
      <div
        className="flex items-center justify-center gap-1"
        style={{ height: `${height}px` }}
      >
        {Array.from({ length: barCount }).map((_, i) => (
          <motion.div
            key={i}
            className="w-1 rounded-full bg-primary/20"
            animate={{
              height: [10, 20, 10],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.05,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className="flex items-center justify-center"
      style={{ height: `${height}px` }}
    >
      <canvas
        ref={canvasRef}
        width={800}
        height={height}
        className="w-full h-full"
      />
    </div>
  );
}
