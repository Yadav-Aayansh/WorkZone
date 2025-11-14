"use client";
import React, { useRef, useState, useEffect } from "react";
import { Pencil, Eraser, Move, Trash2, Undo, Redo } from "lucide-react";

export default function Whiteboard() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  const [tool, setTool] = useState<"draw" | "erase" | "pan">("draw");
  const [isDrawing, setIsDrawing] = useState(false);

  const [history, setHistory] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);

  // Setup canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#ffffff"; // white on dark
      ctxRef.current = ctx;
    }

    // Save initial blank state
    saveState();
  }, []);

  // Save canvas to history
  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const data = canvas.toDataURL();
    setHistory((prev) => [...prev, data]);
    setRedoStack([]);
  };

  // Undo
  const undo = () => {
    if (history.length <= 1) return;
    const last = history[history.length - 2];
    const newRedo = history[history.length - 1];

    setRedoStack((prev) => [...prev, newRedo]);

    const img = new Image();
    img.src = last;
    img.onload = () => {
      const ctx = ctxRef.current;
      if (!ctx || !canvasRef.current) return;
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      ctx.drawImage(img, 0, 0);
      setHistory((prev) => prev.slice(0, -1));
    };
  };

  // Redo
  const redo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];

    const img = new Image();
    img.src = next;
    img.onload = () => {
      const ctx = ctxRef.current;
      if (!ctx || !canvasRef.current) return;
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      ctx.drawImage(img, 0, 0);

      setHistory((prev) => [...prev, next]);
      setRedoStack((prev) => prev.slice(0, -1));
    };
  };

  // Handle drawing
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDrawing(true);
    const ctx = ctxRef.current;
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    const ctx = ctxRef.current;
    if (!ctx) return;

    if (tool === "draw") {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = "#ffffff";
    } else if (tool === "erase") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = 15;
    }

    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.stroke();
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    const ctx = ctxRef.current;
    if (!ctx) return;

    ctx.lineWidth = 3;
    ctx.globalCompositeOperation = "source-over";
    saveState();
  };

  const clearBoard = () => {
    const ctx = ctxRef.current;
    if (!ctx || !canvasRef.current) return;

    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    saveState();
  };

  return (
    <div className="relative w-full h-full rounded-lg bg-[#1d1d1d] overflow-hidden">

      {/* TOOLBAR */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-black/40 p-2 rounded-xl flex items-center space-x-3 backdrop-blur-sm z-20">

        <button
          onClick={() => setTool("draw")}
          className={`p-2 rounded-md ${tool === "draw" ? "bg-white text-black" : "text-white"}`}
        >
          <Pencil size={18} />
        </button>

        <button
          onClick={() => setTool("erase")}
          className={`p-2 rounded-md ${tool === "erase" ? "bg-white text-black" : "text-white"}`}
        >
          <Eraser size={18} />
        </button>

        <button onClick={undo} className="p-2 text-white">
          <Undo size={18} />
        </button>

        <button onClick={redo} className="p-2 text-white">
          <Redo size={18} />
        </button>

        <button onClick={clearBoard} className="p-2 text-red-400">
          <Trash2 size={18} />
        </button>
      </div>

      {/* CANVAS */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 touch-none cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      ></canvas>
    </div>
  );
}
