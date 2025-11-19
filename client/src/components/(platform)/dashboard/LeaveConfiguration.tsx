"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Calendar,
  Check,
  Loader2,
  Plus,
  Settings,
  AlertCircle,
  Save,
} from "lucide-react";
import {
  platformWorkspaceAPI,
  type LeaveTypesRequest,
  type LeaveTypesResponse,
} from "@/lib/api";
import { useToast } from "@/providers/toast-provider";

// Type definitions for leave configuration
interface LeaveTypeConfig {
  days: number;
  carry_forward: boolean;
  max_carry?: number;
  encashable: boolean;
}

interface LeaveConfigFormData {
  casual?: LeaveTypeConfig;
  sick?: LeaveTypeConfig;
  earned?: LeaveTypeConfig;
  maternity?: LeaveTypeConfig;
  paternity?: LeaveTypeConfig;
}

interface LeaveTypeFormProps {
  name: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  data: LeaveTypeConfig;
  onChange: (data: LeaveTypeConfig) => void;
}

function LeaveTypeForm({
  name,
  label,
  icon,
  description,
  enabled,
  onToggle,
  data,
  onChange,
}: LeaveTypeFormProps) {
  return (
    <Card className={enabled ? "border-primary/50" : ""}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">{icon}</div>
            <div>
              <CardTitle className="text-lg">{label}</CardTitle>
              <CardDescription className="text-sm">
                {description}
              </CardDescription>
            </div>
          </div>
          <Switch checked={enabled} onCheckedChange={onToggle} />
        </div>
      </CardHeader>

      {enabled && (
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Days */}
            <div className="space-y-2">
              <Label htmlFor={`${name}-days`}>Number of Days</Label>
              <Input
                id={`${name}-days`}
                type="number"
                min={1}
                max={365}
                value={data.days}
                onChange={(e) =>
                  onChange({ ...data, days: parseInt(e.target.value) || 0 })
                }
                className="w-full"
              />
            </div>

            {/* Carry Forward */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor={`${name}-carry-forward`}>Carry Forward</Label>
                <Switch
                  id={`${name}-carry-forward`}
                  checked={data.carry_forward}
                  onCheckedChange={(checked) =>
                    onChange({ ...data, carry_forward: checked })
                  }
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Allow unused leaves to carry to next year
              </p>
            </div>

            {/* Max Carry (only if carry forward is enabled) */}
            {data.carry_forward && (
              <div className="space-y-2">
                <Label htmlFor={`${name}-max-carry`}>
                  Max Carry Forward Days
                </Label>
                <Input
                  id={`${name}-max-carry`}
                  type="number"
                  min={0}
                  max={365}
                  value={data.max_carry || 0}
                  onChange={(e) =>
                    onChange({
                      ...data,
                      max_carry: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full"
                />
              </div>
            )}

            {/* Encashable */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor={`${name}-encashable`}>Encashable</Label>
                <Switch
                  id={`${name}-encashable`}
                  checked={data.encashable}
                  onCheckedChange={(checked) =>
                    onChange({ ...data, encashable: checked })
                  }
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Allow employees to cash unused leaves
              </p>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export default function LeaveConfiguration() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasExisting, setHasExisting] = useState(false);
  const [error, setError] = useState<string>("");
  const { showToast } = useToast();

  // Track which leave types are enabled
  const [enabledLeaves, setEnabledLeaves] = useState({
    casual: false,
    sick: false,
    earned: false,
    maternity: false,
    paternity: false,
  });

  // Form data for each leave type
  const [leaveData, setLeaveData] = useState<LeaveConfigFormData>({
    casual: { days: 12, carry_forward: true, max_carry: 5, encashable: false },
    sick: { days: 10, carry_forward: false, encashable: false },
    earned: { days: 15, carry_forward: true, max_carry: 10, encashable: true },
    maternity: { days: 180, carry_forward: false, encashable: false },
    paternity: { days: 15, carry_forward: false, encashable: false },
  });

  // Load existing configuration
  useEffect(() => {
    let mounted = true;

    const loadConfiguration = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await platformWorkspaceAPI.getLeaveTypes();

        if (!mounted) return;

        // Check if any leave types exist
        const hasData = Object.keys(response).some(
          (key) => response[key as keyof LeaveTypesResponse]
        );
        setHasExisting(hasData);

        if (hasData) {
          // Update form with existing data
          const newEnabledLeaves = {
            casual: false,
            sick: false,
            earned: false,
            maternity: false,
            paternity: false,
          };
          const newLeaveData: LeaveConfigFormData = {};

          Object.keys(response).forEach((key) => {
            const leaveType = key as keyof LeaveTypesResponse;
            const leaveConfig = response[leaveType];
            if (leaveConfig && typeof leaveConfig === "object") {
              newEnabledLeaves[leaveType] = true;
              newLeaveData[leaveType] = leaveConfig as LeaveTypeConfig;
            }
          });

          setEnabledLeaves(newEnabledLeaves);
          setLeaveData(newLeaveData);
        }
      } catch (err) {
        if (!mounted) return;

        const error = err as { status?: number; message?: string };
        if (error?.status === 404) {
          // No configuration exists yet, that's okay
          setHasExisting(false);
        } else {
          setError(error?.message || "Failed to load leave configuration");
          showToast({
            type: "error",
            title: "Failed to load",
            message: error?.message || "Could not load leave policies",
          });
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadConfiguration();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const handleSave = async () => {
    setIsSaving(true);
    setError("");

    try {
      // Build request with only enabled leave types
      const requestData: LeaveTypesRequest = {};

      Object.keys(enabledLeaves).forEach((key) => {
        const leaveType = key as keyof typeof enabledLeaves;
        if (enabledLeaves[leaveType]) {
          requestData[leaveType] = leaveData[leaveType];
        }
      });

      // Check if at least one leave type is enabled
      if (Object.keys(requestData).length === 0) {
        showToast({
          type: "error",
          title: "No leave types enabled",
          message: "Please enable at least one leave type",
        });
        setIsSaving(false);
        return;
      }

      // Call appropriate API based on whether config exists
      let response: LeaveTypesResponse;
      if (hasExisting) {
        response = await platformWorkspaceAPI.updateLeaveTypes(requestData);
        showToast({
          type: "success",
          title: "Updated successfully",
          message: "Leave policies have been updated",
        });
      } else {
        response = await platformWorkspaceAPI.createLeaveTypes(requestData);
        setHasExisting(true);
        showToast({
          type: "success",
          title: "Created successfully",
          message: "Leave policies have been created",
        });
      }

      console.log("Leave configuration saved:", response);
    } catch (err) {
      const error = err as { message?: string };
      const errorMessage =
        error?.message || "Failed to save leave configuration";
      setError(errorMessage);
      showToast({
        type: "error",
        title: "Failed to save",
        message: errorMessage,
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">
            Loading leave configuration...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Leave Configuration
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Configure leave policies for your organization
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {hasExisting ? "Update Policies" : "Create Policies"}
            </>
          )}
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Info Alert */}
      {!hasExisting && (
        <Alert>
          <Plus className="h-4 w-4" />
          <AlertDescription>
            No leave policies configured yet. Enable and configure leave types
            below to get started.
          </AlertDescription>
        </Alert>
      )}

      {/* Leave Type Forms */}
      <div className="space-y-4">
        <LeaveTypeForm
          name="casual"
          label="Casual Leave"
          icon={<Calendar className="w-5 h-5 text-primary" />}
          description="Short-term personal leaves"
          enabled={enabledLeaves.casual}
          onToggle={(enabled) =>
            setEnabledLeaves({ ...enabledLeaves, casual: enabled })
          }
          data={leaveData.casual!}
          onChange={(data) => setLeaveData({ ...leaveData, casual: data })}
        />

        <LeaveTypeForm
          name="sick"
          label="Sick Leave"
          icon={<Calendar className="w-5 h-5 text-red-500" />}
          description="Medical/health-related leaves"
          enabled={enabledLeaves.sick}
          onToggle={(enabled) =>
            setEnabledLeaves({ ...enabledLeaves, sick: enabled })
          }
          data={leaveData.sick!}
          onChange={(data) => setLeaveData({ ...leaveData, sick: data })}
        />

        <LeaveTypeForm
          name="earned"
          label="Earned Leave"
          icon={<Calendar className="w-5 h-5 text-green-500" />}
          description="Accrued leaves based on service"
          enabled={enabledLeaves.earned}
          onToggle={(enabled) =>
            setEnabledLeaves({ ...enabledLeaves, earned: enabled })
          }
          data={leaveData.earned!}
          onChange={(data) => setLeaveData({ ...leaveData, earned: data })}
        />

        <LeaveTypeForm
          name="maternity"
          label="Maternity Leave"
          icon={<Calendar className="w-5 h-5 text-pink-500" />}
          description="For expecting mothers"
          enabled={enabledLeaves.maternity}
          onToggle={(enabled) =>
            setEnabledLeaves({ ...enabledLeaves, maternity: enabled })
          }
          data={leaveData.maternity!}
          onChange={(data) => setLeaveData({ ...leaveData, maternity: data })}
        />

        <LeaveTypeForm
          name="paternity"
          label="Paternity Leave"
          icon={<Calendar className="w-5 h-5 text-blue-500" />}
          description="For new fathers"
          enabled={enabledLeaves.paternity}
          onToggle={(enabled) =>
            setEnabledLeaves({ ...enabledLeaves, paternity: enabled })
          }
          data={leaveData.paternity!}
          onChange={(data) => setLeaveData({ ...leaveData, paternity: data })}
        />
      </div>

      {/* Save Button (Bottom) */}
      <div className="flex justify-end pt-4 border-t">
        <Button onClick={handleSave} disabled={isSaving} size="lg">
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Saving Changes...
            </>
          ) : (
            <>
              <Check className="mr-2 h-5 w-5" />
              {hasExisting ? "Update Leave Policies" : "Save Leave Policies"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
