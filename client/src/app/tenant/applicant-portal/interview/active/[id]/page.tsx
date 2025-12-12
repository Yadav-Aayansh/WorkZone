"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MicSelector } from "@/components/ui/ai/mic-selector";
import { BarVisualizer, AgentState } from "@/components/ui/ai/bar-visualizer";
import { LiveWaveform } from "@/components/ui/ai/live-waveform";
import { getTenantBackendUrl } from "@/lib/api/tenant";
import {
  Mic,
  Send,
  Square,
  MessageSquare,
  Volume2,
  VolumeX,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Slider } from "@/components/ui/slider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import AITextLoading from "@/components/kokonutui/ai-text-loading";

export default function ActiveInterviewPage() {
  const params = useParams();
  const router = useRouter();
  const interviewId = params.id as string;

  // Connection & Question State
  const [status, setStatus] = useState<
    "connecting" | "connected" | "disconnected"
  >("connecting");
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [questionNum, setQuestionNum] = useState(0);
  const [totalQuestions] = useState(10); // Fixed to 10 questions max
  const [poorAnswers, setPoorAnswers] = useState(0);
  const [processingStatus, setProcessingStatus] = useState<string>("");

  // Timer state
  const [elapsedTime, setElapsedTime] = useState(0);
  const startTimeRef = useRef<number>(Date.now());

  // AI State for visualizer
  const [aiState, setAiState] = useState<AgentState>("connecting");

  // Input Mode
  const [currentMode, setCurrentMode] = useState<"voice" | "text">("voice");
  const [textInput, setTextInput] = useState("");

  // Voice Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [selectedMic, setSelectedMic] = useState<string>("");
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  // Audio Playback
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [aiVolume, setAiVolume] = useState(1.0);
  const [lastQuestionAudioUrl, setLastQuestionAudioUrl] = useState<string>("");

  // Refs
  const wsRef = useRef<WebSocket | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const aiVolumeRef = useRef<number>(1.0);
  const isAudioMutedRef = useRef<boolean>(false);
  const blobUrlRef = useRef<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const hadAudioInputRef = useRef<boolean>(false);

  // WebSocket Connection
  useEffect(() => {
    const backendUrl = getTenantBackendUrl().replace("http", "ws");
    const ws = new WebSocket(
      `${backendUrl}/api/tenant/ai-interview/ws/${interviewId}`
    );
    wsRef.current = ws;

    let pingInterval: NodeJS.Timeout;

    const playAudioHandler = (url: string) => {
      if (audioRef.current) {
        setAiState("speaking");
        audioRef.current.src = url;
        audioRef.current.muted = isAudioMutedRef.current;
        audioRef.current.volume = aiVolumeRef.current;
        setLastQuestionAudioUrl(url);
        audioRef.current
          .play()
          .catch((e) => console.log("Audio play failed:", e));
      }
    };

    ws.onopen = () => {
      console.log("Connected");
      setStatus("connected");
      setAiState("listening");

      pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "ping" }));
        }
      }, 30000);
    };

    

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("=== BACKEND RESPONSE ===");
        console.log("Full Response:", JSON.stringify(data, null, 2));
        console.log("Message Type:", data.type);
        console.log("========================");

        // Handle different message types from backend
        switch (data.type) {
          case "status":
            // Status messages: connecting, loading, preparing, generating report
            console.log("Status:", data.message);
            setProcessingStatus(data.message || "Processing...");

            // Update AI state based on status message
            if (
              data.message?.toLowerCase().includes("preparing") ||
              data.message?.toLowerCase().includes("generating")
            ) {
              setAiState("thinking");
            } else if (
              data.message?.toLowerCase().includes("connecting") ||
              data.message?.toLowerCase().includes("loading")
            ) {
              setAiState("connecting");
            }
            break;

          case "question":
            // Question from backend (StartInterviewResponse or ProcessAnswerResponse)
            console.log("Question data received:", {
              has_question_text: !!data.question_text,
              question_text: data.question_text?.question,
              question_index: data.question_index,
              poor_answer_count: data.poor_answer_count,
              clarification: data.clarification,
              total_questions_asked: data.total_questions_asked,
              status: data.status,
            });

            setProcessingStatus(""); // Clear processing status

            // Handle clarification vs regular question
            if (data.status === "clarification_needed" && data.clarification) {
              // It's a clarification response - show clarification text
              console.log("Displaying clarification:", data.clarification);
              setCurrentQuestion(data.clarification);
              // Don't update questionNum during clarifications
            } else if (data.question_text) {
              // Regular question flow
              const displayText =
                data.question_text.question || "Waiting for question...";
              console.log("Displaying question:", displayText);
              setCurrentQuestion(displayText);

              // Update question number for new questions (not clarifications)
              if (data.question_index !== undefined) {
                setQuestionNum(data.question_index + 1); // +1 because backend is 0-indexed
              }
            }

            // Update stats
            if (data.poor_answer_count !== undefined) {
              setPoorAnswers(data.poor_answer_count);
            }

            // Set AI state based on status
            if (data.status === "completed") {
              setAiState("thinking"); // Generating report
            } else if (data.question_audio_url) {
              playAudioHandler(data.question_audio_url);
            } else {
              setAiState("listening");
            }
            break;

          case "report":
            // Final report - redirect to report page
            router.push(
              `/tenant/applicant-portal/interview/report/${interviewId}?report=${encodeURIComponent(
                data.report
              )}`
            );
            break;

          case "error":
            console.error("Error from backend:", data.message);
            setAiState("listening");
            break;

          default:
            console.warn("Unknown message type:", data.type);
            break;
        }
      } catch (error) {
        console.error("Failed to parse message:", error);
        // If it's not JSON, might be legacy format - try as markdown report
        if (typeof event.data === "string" && event.data.includes("#")) {
          router.push(
            `/tenant/applicant-portal/interview/report/${interviewId}?report=${encodeURIComponent(
              event.data
            )}`
          );
        }
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setStatus("disconnected");
      setAiState("thinking");
    };

    ws.onclose = () => {
      console.log("WebSocket closed");
      setStatus("disconnected");
    };

    return () => {
      ws.close();
    };
  }, [interviewId, router]);

  // Timer effect - update elapsed time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Format elapsed time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Handle audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      setAiState("listening");
    };

    audio.addEventListener("ended", handleEnded);
    return () => audio.removeEventListener("ended", handleEnded);
  }, []);

  // Toggle audio mute
  const toggleAudioMute = () => {
    const newMuteState = !isAudioMuted;
    isAudioMutedRef.current = newMuteState;
    setIsAudioMuted(newMuteState);
    if (audioRef.current) {
      audioRef.current.muted = newMuteState;
    }
  };

  // Handle volume change
  const handleVolumeChange = (value: number) => {
    aiVolumeRef.current = value;
    setAiVolume(value);
    if (audioRef.current) {
      audioRef.current.volume = value;
    }
  };

  // Replay last question
  const replayQuestion = () => {
    if (lastQuestionAudioUrl && audioRef.current) {
      setAiState("speaking");
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((e) => console.log("Replay failed:", e));
    }
  };

  // Text Input Submit
  const submitText = () => {
    const trimmedText = textInput.trim();

    // Validate: must have at least 1 character (backend requires min_length=1)
    if (!trimmedText || trimmedText.length === 0) {
      return;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      setAiState("thinking");
      setProcessingStatus("Processing your answer...");
      // Send as plain text (backend receives it as message["text"])
      wsRef.current.send(trimmedText);
      setTextInput("");
    }
  };

  // Voice Recording
  const startRecording = async () => {
    try {
      hadAudioInputRef.current = false; // Reset tracking
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: selectedMic ? { exact: selectedMic } : undefined,
          channelCount: 1,
          sampleRate: 48000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      setMediaStream(stream);
      audioChunksRef.current = [];

      // Set up audio level monitoring
      try {
        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);

        audioContextRef.current = audioContext;
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const updateAudioLevel = () => {
          if (analyserRef.current) {
            analyserRef.current.getByteFrequencyData(dataArray);
            const average =
              dataArray.reduce((a, b) => a + b) / dataArray.length;
            const normalized = Math.min(average / 128, 1); // Normalize to 0-1

            // Track if we ever detected audio input
            if (normalized > 0.05) {
              hadAudioInputRef.current = true;
            }

            animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
          }
        };

        updateAudioLevel();
        console.log("Audio level monitoring started");
      } catch (error) {
        console.error("Failed to set up audio monitoring:", error);
      }

      // Check supported MIME types and use the best available
      let mimeType = "audio/webm;codecs=opus";
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        if (MediaRecorder.isTypeSupported("audio/webm")) {
          mimeType = "audio/webm";
        } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
          mimeType = "audio/mp4";
        } else {
          mimeType = ""; // Let browser choose
        }
      }

      const options = mimeType ? { mimeType } : {};
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          console.log("Audio chunk received:", event.data.size, "bytes");
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        console.log(
          "Recording stopped, total chunks:",
          audioChunksRef.current.length
        );
        const blob = new Blob(audioChunksRef.current, {
          type: mimeType || "audio/webm",
        });
        console.log("Final blob size:", blob.size, "bytes");
        console.log("Blob type:", blob.type);

        // Clean up old blob URL if exists
        if (blobUrlRef.current) {
          URL.revokeObjectURL(blobUrlRef.current);
        }

        // Create new blob URL
        const blobUrl = URL.createObjectURL(blob);
        blobUrlRef.current = blobUrl;
        console.log("Blob URL created:", blobUrl);

        setRecordedBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
        setMediaStream(null);
      };

      mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event);
      };

      // Start recording with 1 second timeslice for better data collection
      mediaRecorder.start(1000);
      setIsRecording(true);
      console.log("Recording started with mimeType:", mimeType);
    } catch (error) {
      console.error("Microphone permission denied:", error);
      alert(
        "Microphone access denied. Please allow microphone access to record audio."
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      console.log("Stopping recording...");
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      // Clean up audio monitoring
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      analyserRef.current = null;
    }
  };

  const submitAudio = async () => {
    if (!recordedBlob) return;

    // Warn if no audio input was detected during recording
    if (!hadAudioInputRef.current) {
      console.warn("Warning: No audio input was detected during recording!");
      if (!confirm("No audio was detected during recording. Send anyway?")) {
        return;
      }
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      setAiState("thinking");
      setProcessingStatus("Processing your answer...");

      console.log("Sending audio:", {
        size: recordedBlob.size,
        type: recordedBlob.type,
        hadAudioInput: hadAudioInputRef.current,
      });

      const arrayBuffer = await recordedBlob.arrayBuffer();
      console.log("ArrayBuffer size:", arrayBuffer.byteLength);

      wsRef.current.send(arrayBuffer);
      setRecordedBlob(null);

      // Clean up blob URL
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    }
  };

  const clearRecording = () => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    setRecordedBlob(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <audio ref={audioRef} />

      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold">AI Interview</h1>
              <span
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium",
                  status === "connected"
                    ? "bg-green-500/10 text-green-600 dark:text-green-400"
                    : "bg-red-500/10 text-red-600 dark:text-red-400"
                )}
              >
                {status}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left Panel - Question Text */}
        <div className="w-full lg:w-80 xl:w-96 border-r bg-card/30 p-6 overflow-y-auto">
          <div className="space-y-6">
            {/* Question Header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                {questionNum}
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Question
                </p>
                <p className="text-sm font-medium">
                  {questionNum > 0
                    ? `${questionNum}/${totalQuestions}`
                    : `${totalQuestions} Total`}
                </p>
              </div>
            </div>

            {/* Question Text */}
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50 border">
                {processingStatus ? (
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <p className="text-base leading-relaxed text-muted-foreground italic">
                      {processingStatus}
                    </p>
                  </div>
                ) : (
                  <p className="text-base leading-relaxed">
                    {currentQuestion || "Waiting for question..."}
                  </p>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-3 pt-4 border-t">
              <h3 className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                Interview Stats
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <p className="text-xs text-muted-foreground mb-1">
                    Elapsed Time
                  </p>
                  <p className="text-2xl font-bold">
                    {formatTime(elapsedTime)}
                  </p>
                </div>
                <div
                  className={cn(
                    "p-3 rounded-lg border",
                    poorAnswers >= 2
                      ? "bg-destructive/10 border-destructive/20"
                      : "bg-destructive/5 border-destructive/10"
                  )}
                >
                  <p className="text-xs text-muted-foreground mb-1">
                    Poor Answers
                  </p>
                  <p className="text-2xl font-bold">{poorAnswers}/3</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Center - Audio Visualizer */}
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="w-full max-w-4xl space-y-4">
            {/* Poor Answer Warning */}
            {poorAnswers >= 2 && (
              <Alert
                variant={poorAnswers === 2 ? "default" : "destructive"}
                className="shadow-lg"
              >
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>
                  {poorAnswers === 2
                    ? "Warning: You have 2 poor answers. The interview will end if you reach 3."
                    : "Critical: You have reached 3 poor answers. The interview is ending."}
                </AlertDescription>
              </Alert>
            )}

            {/* Main Visualizer */}
            <div className="flex items-center justify-center">
              <BarVisualizer
                state={aiState}
                barCount={20}
                mediaStream={isRecording ? mediaStream : null}
                demo={!isRecording && aiState === "speaking"}
                centerAlign={true}
                className="w-full max-w-2xl"
              />
            </div>

            {/* AI State Label */}
            <div className="text-center min-h-[120px] flex items-center justify-center">
              {/* Show backend status if available, otherwise show AI state */}
              {processingStatus ? (
                <AITextLoading texts={[processingStatus]} interval={2000} />
              ) : (
                <>
                  {aiState === "connecting" && (
                    <AITextLoading
                      texts={["Connecting to interview..."]}
                      interval={2000}
                    />
                  )}
                  {aiState === "listening" && (
                    <div className="space-y-2">
                      <p className="text-lg font-medium">
                        Awaiting Your Response
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Share your thoughts using voice or text
                      </p>
                    </div>
                  )}
                  {aiState === "speaking" && (
                    <div className="space-y-2">
                      <p className="text-lg font-medium">
                        Interviewer Speaking
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Please listen to the question carefully
                      </p>
                    </div>
                  )}
                  {aiState === "thinking" && (
                    <AITextLoading texts={["Processing..."]} interval={2000} />
                  )}
                </>
              )}
            </div>

            {/* Controls Section - Replay & Volume below wave bar */}
            <div className="flex items-center justify-between max-w-2xl mx-auto w-full">
              <Button
                variant="ghost"
                size="sm"
                onClick={replayQuestion}
                disabled={!lastQuestionAudioUrl || aiState === "speaking"}
                className="gap-2 h-9"
              >
                <RotateCcw className="w-4 h-4" />
                Replay Question
              </Button>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 h-9">
                    {isAudioMuted ? (
                      <VolumeX className="w-4 h-4" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                    Volume
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">AI Volume</label>
                      <span className="text-sm text-muted-foreground">
                        {Math.round(aiVolume * 100)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <VolumeX className="w-4 h-4 text-muted-foreground" />
                      <Slider
                        value={[aiVolume]}
                        onValueChange={([value]) => handleVolumeChange(value)}
                        max={1}
                        step={0.1}
                        className="flex-1"
                      />
                      <Volume2 className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleAudioMute}
                      className="w-full"
                    >
                      {isAudioMuted ? (
                        <>
                          <VolumeX className="w-4 h-4 mr-2" />
                          Unmute
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-4 h-4 mr-2" />
                          Mute
                        </>
                      )}
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Input Section */}
            {currentMode === "voice" && (
              <div className="w-full max-w-3xl mx-auto space-y-4">
                {/* Live Waveform - Hidden initially, shows when recording */}
                <div
                  className={cn(
                    "transition-all duration-300 overflow-hidden rounded-lg border bg-muted/30",
                    isRecording ? "h-24 opacity-100" : "h-0 opacity-0 border-0"
                  )}
                >
                  <LiveWaveform
                    active={isRecording}
                    processing={aiState === "thinking"}
                    deviceId={selectedMic}
                    mode="static"
                    height={96}
                    barWidth={3}
                    barGap={2}
                    sensitivity={1.5}
                    fadeEdges
                  />
                </div>

                {!recordedBlob ? (
                  /* Recording Controls */
                  <div className="flex items-center justify-center gap-3">
                    {!isRecording && (
                      <MicSelector
                        value={selectedMic}
                        onValueChange={setSelectedMic}
                        muted={isMicMuted}
                        onMutedChange={setIsMicMuted}
                        disabled={isRecording}
                      />
                    )}

                    {!isRecording ? (
                      <Button
                        size="lg"
                        onClick={startRecording}
                        disabled={isMicMuted}
                        className="gap-2 min-w-[180px]"
                      >
                        <Mic className="w-5 h-5" />
                        Start Recording
                      </Button>
                    ) : (
                      <Button
                        size="lg"
                        variant="destructive"
                        onClick={stopRecording}
                        className="gap-2 min-w-[180px]"
                      >
                        <Square className="w-5 h-5" />
                        Stop Recording
                      </Button>
                    )}

                    {!isRecording && (
                      <Button
                        variant="ghost"
                        size="lg"
                        onClick={() => setCurrentMode("text")}
                        className="gap-2"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Text Mode
                      </Button>
                    )}
                  </div>
                ) : (
                  /* Recording Preview */
                  <div className="space-y-4">
                    <div className="flex items-center justify-center p-4 rounded-lg bg-muted/50 border">
                      <audio
                        ref={previewAudioRef}
                        src={blobUrlRef.current || undefined}
                        controls
                        preload="metadata"
                        className="max-w-md"
                        onLoadedMetadata={(e) => {
                          const audio = e.currentTarget;
                          console.log("Audio metadata loaded:", {
                            duration: audio.duration,
                            readyState: audio.readyState,
                            networkState: audio.networkState,
                          });
                        }}
                        onError={(e) => {
                          const audio = e.currentTarget;
                          console.error("Audio error:", {
                            error: audio.error,
                            src: audio.src,
                            readyState: audio.readyState,
                          });
                        }}
                        onCanPlay={() => console.log("Audio can play")}
                      />
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      <Button
                        onClick={submitAudio}
                        size="lg"
                        className="gap-2 min-w-[140px]"
                      >
                        <Send className="w-4 h-4" />
                        Send
                      </Button>
                      <Button
                        onClick={clearRecording}
                        variant="outline"
                        size="lg"
                        className="min-w-[140px]"
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Text Input */}
            {currentMode === "text" && (
              <div className="w-full max-w-3xl mx-auto">
                <div className="flex flex-col gap-3">
                  <div className="relative">
                    <Textarea
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && e.ctrlKey) {
                          e.preventDefault();
                          submitText();
                        }
                      }}
                      placeholder="Type your answer here... (Ctrl+Enter to send)"
                      className="min-h-[120px] resize-none text-base p-4 pr-32"
                      disabled={aiState === "thinking"}
                    />
                    <div className="absolute bottom-3 right-3 flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentMode("voice")}
                        className="gap-2"
                      >
                        <Mic className="w-4 h-4" />
                        Voice
                      </Button>
                      <Button
                        onClick={submitText}
                        disabled={!textInput.trim() || aiState === "thinking"}
                        size="sm"
                        className="gap-2"
                      >
                        <Send className="w-4 h-4" />
                        Send
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    {textInput.trim().length} characters • Press Ctrl+Enter to
                    send
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
