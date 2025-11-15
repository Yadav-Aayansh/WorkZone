"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MicSelector } from "@/components/ui/ai/mic-selector";
import { tenantAIInterviewAPI } from "@/lib/api";
import { CheckCircle2, Mic, AlertTriangle, Info, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function InterviewSetupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const applicationId = searchParams.get("application_id");

  const [selectedMic, setSelectedMic] = useState<string>("");
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isMicPermissionGranted, setIsMicPermissionGranted] = useState(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);

  // Check microphone permission on mount
  useEffect(() => {
    checkMicrophonePermission();
  }, []);

  const checkMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      setIsMicPermissionGranted(true);
    } catch {
      setIsMicPermissionGranted(false);
    }
  };

  const startInterview = async () => {
    if (!applicationId) {
      toast.error("No application ID provided");
      return;
    }

    if (!isMicPermissionGranted) {
      toast.error("Please grant microphone permission before starting");
      return;
    }

    try {
      setIsCreatingSession(true);

      // Create AI interview session
      const session = await tenantAIInterviewAPI.createSession(applicationId);
      toast.success("Interview session created");

      // Navigate to interview page
      router.push(`/tenant/applicant-portal/interview/active/${session.id}`);
    } catch (err) {
      console.error("Failed to start interview:", err);

      const errorMessage =
        err instanceof Error ? err.message : "Failed to start interview";

      if (errorMessage.includes("already been created")) {
        toast.error(
          "You have already started an interview for this application"
        );
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsCreatingSession(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">AI Interview Setup</h1>
          <p className="text-lg text-muted-foreground">
            Prepare for your AI-powered interview session
          </p>
        </div>

        {/* Instructions Card */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-500" />
              Interview Instructions
            </CardTitle>
            <CardDescription>
              Please read carefully before starting your interview
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <div>
                  <h4 className="font-medium">Total Questions: 10</h4>
                  <p className="text-sm text-muted-foreground">
                    You will be asked between 5-10 questions depending on your
                    responses
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-orange-600 font-bold">2</span>
                </div>
                <div>
                  <h4 className="font-medium">Poor Answer Limit: 3</h4>
                  <p className="text-sm text-muted-foreground">
                    The interview will end early if you give 3 or more
                    unclear/poor responses
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 font-bold">3</span>
                </div>
                <div>
                  <h4 className="font-medium">Voice or Text Mode</h4>
                  <p className="text-sm text-muted-foreground">
                    You can switch between voice and text input anytime during
                    the interview
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-600 font-bold">4</span>
                </div>
                <div>
                  <h4 className="font-medium">AI-Powered Questions</h4>
                  <p className="text-sm text-muted-foreground">
                    Questions are generated based on your resume and the job
                    description
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-red-600 font-bold">5</span>
                </div>
                <div>
                  <h4 className="font-medium">Estimated Time: 15-20 minutes</h4>
                  <p className="text-sm text-muted-foreground">
                    Please ensure you have a stable internet connection and
                    quiet environment
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Microphone Setup Card */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="w-5 h-5" />
              Microphone Setup
            </CardTitle>
            <CardDescription>
              Configure your microphone for voice responses
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="flex items-center gap-3">
                {isMicPermissionGranted ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span className="font-medium">
                      Microphone Permission Granted
                    </span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                    <span className="font-medium">
                      Microphone Permission Required
                    </span>
                  </>
                )}
              </div>
              <Badge
                variant={isMicPermissionGranted ? "default" : "destructive"}
              >
                {isMicPermissionGranted ? "Ready" : "Not Ready"}
              </Badge>
            </div>

            {isMicPermissionGranted && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Microphone</label>
                <MicSelector
                  value={selectedMic}
                  onValueChange={setSelectedMic}
                  muted={isMicMuted}
                  onMutedChange={setIsMicMuted}
                />
              </div>
            )}

            {!isMicPermissionGranted && (
              <Alert>
                <Info className="w-4 h-4" />
                <AlertDescription>
                  Click &quot;Test Microphone&quot; below to grant permission.
                  You can also use text mode if you prefer.
                </AlertDescription>
              </Alert>
            )}

            {!isMicPermissionGranted && (
              <Button
                onClick={checkMicrophonePermission}
                variant="outline"
                className="w-full"
              >
                <Mic className="w-4 h-4 mr-2" />
                Test Microphone
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Requirements Checklist */}
        <Card>
          <CardHeader>
            <CardTitle>Before You Start</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>Find a quiet environment</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>Ensure stable internet connection</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>Have your resume ready for reference</span>
              </div>
              <div className="flex items-center gap-2">
                {isMicPermissionGranted ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                )}
                <span>Microphone configured (for voice mode)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Start Button */}
        <div className="flex justify-center pt-4">
          <Button
            size="lg"
            onClick={startInterview}
            disabled={isCreatingSession || !applicationId}
            className="px-12 py-6 text-lg"
          >
            {isCreatingSession ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Creating Session...
              </>
            ) : (
              "Start Interview"
            )}
          </Button>
        </div>

        {!applicationId && (
          <Alert variant="destructive">
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              No application ID provided. Please start the interview from your
              applications page.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
