"use client";

import { EmployeePortalLayout } from "@/components/tenant/employee-portal-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Megaphone,
  Search,
  AlertCircle,
  Calendar,
  User,
  Paperclip,
} from "lucide-react";
import announcementsData from "@/data/tenant/announcements.json";
import { useState } from "react";

export default function AnnouncementsPage() {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAnnouncements = announcementsData.filter((announcement) => {
    const matchesFilter = filter === "all" || announcement.category === filter;
    const matchesSearch =
      announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      announcement.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const featuredAnnouncement =
    announcementsData.find((a) => a.isImportant) || announcementsData[0];

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      event:
        "bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400",
      policy:
        "bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400",
      company:
        "bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400",
      celebration:
        "bg-pink-100 dark:bg-pink-950/30 text-pink-700 dark:text-pink-400",
      important: "bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400",
    };
    return (
      colors[category] ||
      "bg-gray-100 dark:bg-gray-950/30 text-gray-700 dark:text-gray-400"
    );
  };

  return (
    <EmployeePortalLayout>
      <div className="space-y-6">
        {/* Featured Announcement */}
        <Card className="border-2 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-4 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg">
                <Megaphone className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <Badge variant="destructive" className="mb-2">
                      Featured
                    </Badge>
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                      {featuredAnnouncement.title}
                    </h2>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {featuredAnnouncement.postedBy}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(
                          featuredAnnouncement.postedDate
                        ).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                  <Badge
                    className={getCategoryColor(featuredAnnouncement.category)}
                  >
                    {featuredAnnouncement.category}
                  </Badge>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {featuredAnnouncement.content}
                </p>
                {featuredAnnouncement.attachments &&
                  featuredAnnouncement.attachments.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                      <Paperclip className="h-4 w-4" />
                      <span>
                        {featuredAnnouncement.attachments.length} attachment(s)
                      </span>
                    </div>
                  )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>All Announcements</CardTitle>
            <CardDescription>
              Stay updated with company news and updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search announcements..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="event">Events</SelectItem>
                  <SelectItem value="policy">Policies</SelectItem>
                  <SelectItem value="company">Company</SelectItem>
                  <SelectItem value="celebration">Celebrations</SelectItem>
                  <SelectItem value="important">Important</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              {filteredAnnouncements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="flex items-start gap-4 p-6 rounded-xl border border-border hover:bg-muted/50 transition-all duration-200 hover:shadow-md"
                >
                  <div
                    className={`p-3 rounded-lg ${
                      announcement.priority === "high"
                        ? "bg-red-100 dark:bg-red-950/30"
                        : "bg-blue-100 dark:bg-blue-950/30"
                    }`}
                  >
                    {announcement.isImportant ? (
                      <AlertCircle
                        className={`h-6 w-6 ${
                          announcement.priority === "high"
                            ? "text-red-600 dark:text-red-400"
                            : "text-blue-600 dark:text-blue-400"
                        }`}
                      />
                    ) : (
                      <Megaphone className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-bold text-foreground text-lg">
                        {announcement.title}
                      </h4>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {announcement.isImportant && (
                          <Badge variant="destructive">Important</Badge>
                        )}
                        <Badge
                          className={getCategoryColor(announcement.category)}
                        >
                          {announcement.category}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-muted-foreground leading-relaxed mb-3">
                      {announcement.content}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {announcement.postedBy}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(announcement.postedDate).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </span>
                      {announcement.attachments &&
                        announcement.attachments.length > 0 && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                              <Paperclip className="h-4 w-4" />
                              {announcement.attachments.length} attachment(s)
                            </span>
                          </>
                        )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredAnnouncements.length === 0 && (
              <div className="text-center py-12">
                <Megaphone className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No announcements found
                </h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </EmployeePortalLayout>
  );
}
