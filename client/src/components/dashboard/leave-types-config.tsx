"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Calendar,
  Briefcase,
  Heart,
  Baby,
  Palmtree,
  Save,
  RefreshCw,
  Info,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  platformWorkspaceAPI,
  LeaveTypeConfig,
  LeaveTypesRequest,
  LeaveTypesResponse,
} from "@/lib/api";

interface LeaveTypeCardProps {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  config: LeaveTypeConfig;
  onChange: (config: LeaveTypeConfig) => void;
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
}

const LeaveTypeCard = ({
  title,
  description,
  icon,
  color,
  config,
  onChange,
  isEnabled,
  onToggle,
}: LeaveTypeCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className={`relative overflow-hidden border-2 transition-all duration-300 ${
          isEnabled
            ? "border-transparent shadow-lg hover:shadow-xl"
            : "border-dashed border-gray-300 dark:border-gray-700 opacity-60"
        }`}
      >
        {/* Gradient Background */}
        <div
          className={`absolute inset-0 opacity-5 ${color}`}
          style={{
            background: isEnabled
              ? `linear-gradient(135deg, ${color.replace("bg-", "var(--")})`
              : "transparent",
          }}
        />

        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`p-3 rounded-xl ${color} bg-opacity-10 dark:bg-opacity-20`}
              >
                {icon}
              </div>
              <div>
                <CardTitle className="text-lg font-semibold dark:text-white">
                  {title}
                </CardTitle>
                <CardDescription className="text-sm dark:text-gray-400">
                  {description}
                </CardDescription>
              </div>
            </div>
            <Switch checked={isEnabled} onCheckedChange={onToggle} />
          </div>
        </CardHeader>

        <AnimatePresence>
          {isEnabled && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CardContent className="space-y-5 pt-2">
                {/* Days Allocation */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium dark:text-gray-300">
                      Days per Year
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-4 h-4 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Number of leave days allocated annually</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="relative">
                    <Input
                      type="number"
                      min={1}
                      max={365}
                      value={config.days}
                      onChange={(e) =>
                        onChange({
                          ...config,
                          days: parseInt(e.target.value) || 1,
                        })
                      }
                      className="pr-16 text-lg font-semibold dark:bg-gray-800 dark:border-gray-700"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500 dark:text-gray-400">
                      days
                    </span>
                  </div>
                </div>

                {/* Feature Toggles */}
                <div className="grid grid-cols-1 gap-4">
                  {/* Carry Forward */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <ArrowRight className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-sm dark:text-white">
                          Carry Forward
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Allow unused leaves to carry over
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={config.carry_forward}
                      onCheckedChange={(checked) =>
                        onChange({ ...config, carry_forward: checked })
                      }
                    />
                  </div>

                  {/* Max Carry (only if carry forward enabled) */}
                  <AnimatePresence>
                    {config.carry_forward && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="pl-4 border-l-2 border-blue-200 dark:border-blue-800"
                      >
                        <div className="space-y-2">
                          <Label className="text-sm font-medium dark:text-gray-300">
                            Maximum Carry Forward Days
                          </Label>
                          <Input
                            type="number"
                            min={1}
                            max={config.days}
                            value={config.max_carry || ""}
                            onChange={(e) =>
                              onChange({
                                ...config,
                                max_carry:
                                  parseInt(e.target.value) || undefined,
                              })
                            }
                            placeholder="Enter max days"
                            className="dark:bg-gray-800 dark:border-gray-700"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Encashable */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <Sparkles className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="font-medium text-sm dark:text-white">
                          Encashable
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Convert unused leaves to cash
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={config.encashable}
                      onCheckedChange={(checked) =>
                        onChange({ ...config, encashable: checked })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};

const defaultConfig: LeaveTypeConfig = {
  days: 12,
  carry_forward: false,
  max_carry: undefined,
  encashable: false,
};

interface LeaveTypeState {
  enabled: boolean;
  config: LeaveTypeConfig;
}

// Static list of leave type IDs for useEffect
const LEAVE_TYPE_IDS = [
  "casual",
  "sick",
  "earned",
  "maternity",
  "paternity",
] as const;

export function LeaveTypesConfig() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasExistingConfig, setHasExistingConfig] = useState(false);
  const [leaveTypes, setLeaveTypes] = useState<Record<string, LeaveTypeState>>({
    casual: { enabled: true, config: { ...defaultConfig, days: 12 } },
    sick: { enabled: true, config: { ...defaultConfig, days: 10 } },
    earned: {
      enabled: true,
      config: {
        ...defaultConfig,
        days: 15,
        carry_forward: true,
        max_carry: 30,
      },
    },
    maternity: { enabled: true, config: { ...defaultConfig, days: 180 } },
    paternity: { enabled: true, config: { ...defaultConfig, days: 15 } },
  });

  const leaveTypeInfo = [
    {
      id: "casual",
      title: "Casual Leave",
      description: "For personal matters and short breaks",
      icon: (
        <Palmtree className="w-5 h-5 text-orange-600 dark:text-orange-400" />
      ),
      color: "bg-orange-500",
    },
    {
      id: "sick",
      title: "Sick Leave",
      description: "For medical emergencies and illness",
      icon: <Heart className="w-5 h-5 text-red-600 dark:text-red-400" />,
      color: "bg-red-500",
    },
    {
      id: "earned",
      title: "Earned Leave",
      description: "Accumulated vacation time",
      icon: <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      color: "bg-blue-500",
    },
    {
      id: "maternity",
      title: "Maternity Leave",
      description: "For expecting mothers",
      icon: <Baby className="w-5 h-5 text-pink-600 dark:text-pink-400" />,
      color: "bg-pink-500",
    },
    {
      id: "paternity",
      title: "Paternity Leave",
      description: "For new fathers",
      icon: (
        <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
      ),
      color: "bg-purple-500",
    },
  ];

  // Fetch existing configuration
  useEffect(() => {
    const fetchLeaveTypes = async () => {
      try {
        setIsLoading(true);
        const response = await platformWorkspaceAPI.getLeaveTypes();

        // Check if any leave types are configured
        const hasConfig = Object.values(response).some((val) => val !== null);
        setHasExistingConfig(hasConfig);

        if (hasConfig) {
          const newLeaveTypes: Record<string, LeaveTypeState> = {};

          for (const typeId of LEAVE_TYPE_IDS) {
            const serverConfig = response[typeId as keyof LeaveTypesResponse];
            if (serverConfig) {
              newLeaveTypes[typeId] = {
                enabled: true,
                config: {
                  days: serverConfig.days || defaultConfig.days,
                  carry_forward: serverConfig.carry_forward || false,
                  max_carry: serverConfig.max_carry || undefined,
                  encashable: serverConfig.encashable || false,
                },
              };
            } else {
              newLeaveTypes[typeId] = {
                enabled: false,
                config: { ...defaultConfig },
              };
            }
          }

          setLeaveTypes(newLeaveTypes);
        }
      } catch (error: unknown) {
        // If 404, no config exists yet - use defaults
        const apiError = error as { status?: number };
        if (apiError?.status !== 404) {
          toast.error("Failed to load leave configuration");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaveTypes();
  }, []);

  const handleSave = async () => {
    try {
      setIsSaving(true);

      const request: LeaveTypesRequest = {};

      for (const [key, value] of Object.entries(leaveTypes)) {
        if (value.enabled) {
          request[key as keyof LeaveTypesRequest] = value.config;
        }
      }

      if (hasExistingConfig) {
        await platformWorkspaceAPI.updateLeaveTypes(request);
      } else {
        await platformWorkspaceAPI.createLeaveTypes(request);
        setHasExistingConfig(true);
      }

      toast.success("Leave configuration saved successfully!", {
        description:
          "Your team can now apply for leaves based on these settings.",
        icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
      });
    } catch (error: unknown) {
      const apiError = error as { message?: string };
      toast.error("Failed to save configuration", {
        description: apiError?.message || "Please try again later.",
        icon: <AlertCircle className="w-5 h-5 text-red-500" />,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setLeaveTypes({
      casual: { enabled: true, config: { ...defaultConfig, days: 12 } },
      sick: { enabled: true, config: { ...defaultConfig, days: 10 } },
      earned: {
        enabled: true,
        config: {
          ...defaultConfig,
          days: 15,
          carry_forward: true,
          max_carry: 30,
        },
      },
      maternity: { enabled: true, config: { ...defaultConfig, days: 180 } },
      paternity: { enabled: true, config: { ...defaultConfig, days: 15 } },
    });
    toast.info("Reset to default values");
  };

  const updateLeaveType = (id: string, config: LeaveTypeConfig) => {
    setLeaveTypes((prev) => ({
      ...prev,
      [id]: { ...prev[id], config },
    }));
  };

  const toggleLeaveType = (id: string, enabled: boolean) => {
    setLeaveTypes((prev) => ({
      ...prev,
      [id]: { ...prev[id], enabled },
    }));
  };

  const enabledCount = Object.values(leaveTypes).filter(
    (t) => t.enabled
  ).length;
  const totalDays = Object.values(leaveTypes)
    .filter((t) => t.enabled)
    .reduce((sum, t) => sum + t.config.days, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin mx-auto text-indigo-600" />
          <p className="text-gray-500 dark:text-gray-400">
            Loading configuration...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-none shadow-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm">Leave Types Enabled</p>
                <p className="text-3xl font-bold mt-1">{enabledCount}</p>
              </div>
              <Calendar className="w-10 h-10 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm">Total Days Available</p>
                <p className="text-3xl font-bold mt-1">{totalDays}</p>
              </div>
              <Sparkles className="w-10 h-10 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm">Configuration Status</p>
                <p className="text-lg font-semibold mt-1">
                  {hasExistingConfig ? "Configured" : "Not Set"}
                </p>
              </div>
              {hasExistingConfig ? (
                <CheckCircle2 className="w-10 h-10 opacity-80" />
              ) : (
                <AlertCircle className="w-10 h-10 opacity-80" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leave Type Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {leaveTypeInfo.map((info, index) => (
          <motion.div
            key={info.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <LeaveTypeCard
              {...info}
              config={leaveTypes[info.id].config}
              isEnabled={leaveTypes[info.id].enabled}
              onChange={(config) => updateLeaveType(info.id, config)}
              onToggle={(enabled) => toggleLeaveType(info.id, enabled)}
            />
          </motion.div>
        ))}
      </div>

      {/* Action Buttons */}
      <Card className="border-none shadow-xl dark:bg-gray-800">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {hasExistingConfig
                  ? "Update your leave policy configuration"
                  : "Configure leave policies for your organization"}
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleReset}
                className="dark:border-gray-600 dark:hover:bg-gray-700"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving || enabledCount === 0}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 min-w-[140px]"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {hasExistingConfig ? "Update Config" : "Save Config"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
