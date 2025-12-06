"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ScheduleItem {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  date: string;
  participants?: {
    name: string;
    avatar?: string;
  }[];
  status?: "pending" | "completed" | "cancelled";
  type?: "interview" | "meeting" | "call";
}

export interface ScheduleCardProps {
  items: ScheduleItem[];
  loading?: boolean;
  className?: string;
}

export function ScheduleCard({
  items,
  loading = false,
  className,
}: ScheduleCardProps) {
  const [activeTab, setActiveTab] = useState<"today" | "tomorrow" | "week">(
    "today"
  );
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");

  const filteredItems = items.filter((item) => {
    if (filter === "all") return true;
    return item.status === filter;
  });

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getTypeIcon = (type?: string) => {
    switch (type) {
      case "interview":
        return <Users className="h-3 w-3" />;
      case "meeting":
        return <Calendar className="h-3 w-3" />;
      case "call":
        return <Clock className="h-3 w-3" />;
      default:
        return <Calendar className="h-3 w-3" />;
    }
  };

  return (
    <Card className={cn("border-none shadow-sm", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Schedule</CardTitle>

        {/* Tabs */}
        <div className="flex gap-1 mt-3 bg-muted rounded-lg p-1">
          <Button
            variant={activeTab === "today" ? "default" : "ghost"}
            size="sm"
            className="flex-1"
            onClick={() => setActiveTab("today")}
          >
            Today
          </Button>
          <Button
            variant={activeTab === "tomorrow" ? "default" : "ghost"}
            size="sm"
            className="flex-1"
            onClick={() => setActiveTab("tomorrow")}
          >
            Tomorrow
          </Button>
          <Button
            variant={activeTab === "week" ? "default" : "ghost"}
            size="sm"
            className="flex-1"
            onClick={() => setActiveTab("week")}
          >
            This Week
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mt-3">
          <Button
            variant={filter === "all" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            All
          </Button>
          <Button
            variant={filter === "pending" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setFilter("pending")}
          >
            Pending
          </Button>
          <Button
            variant={filter === "completed" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setFilter("completed")}
          >
            Completed
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {filteredItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No scheduled items</p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
              >
                {/* Time */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <Clock className="h-3 w-3" />
                  <span>
                    {item.startTime} - {item.endTime}
                  </span>
                  {item.type && (
                    <Badge variant="outline" className="ml-auto h-5 gap-1">
                      {getTypeIcon(item.type)}
                      {item.type}
                    </Badge>
                  )}
                </div>

                {/* Title & Description */}
                <h4 className="font-medium text-sm mb-1">{item.title}</h4>
                {item.description && (
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                    {item.description}
                  </p>
                )}

                {/* Participants & Status */}
                <div className="flex items-center justify-between mt-2">
                  {item.participants && item.participants.length > 0 && (
                    <div className="flex -space-x-2">
                      {item.participants.slice(0, 3).map((participant, idx) => (
                        <Avatar
                          key={idx}
                          className="h-6 w-6 border-2 border-background"
                        >
                          <AvatarImage src={participant.avatar} />
                          <AvatarFallback className="text-xs">
                            {participant.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {item.participants.length > 3 && (
                        <div className="h-6 w-6 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-medium">
                          +{item.participants.length - 3}
                        </div>
                      )}
                    </div>
                  )}

                  {item.status && (
                    <Badge
                      variant="secondary"
                      className={cn("text-xs", getStatusColor(item.status))}
                    >
                      {item.status}
                    </Badge>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
