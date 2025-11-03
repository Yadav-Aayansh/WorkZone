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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Users,
  Search,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Building,
  Grid3x3,
  List,
} from "lucide-react";
import teamMembersData from "@/data/tenant/team-members.json";
import { useState } from "react";

export default function TeamPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedMember, setSelectedMember] = useState<any>(null);

  const departments = Array.from(
    new Set(teamMembersData.map((m) => m.department))
  );

  const filteredMembers = teamMembersData.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment =
      departmentFilter === "all" || member.department === departmentFilter;
    return matchesSearch && matchesDepartment;
  });

  return (
    <EmployeePortalLayout>
      <div className="space-y-6">
        {/* Header */}
        <Card className="border-2 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Team Directory
                </h1>
                <p className="text-muted-foreground mt-1">
                  {teamMembersData.length} team members across{" "}
                  {departments.length} departments
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, designation, or employee ID..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select
                value={departmentFilter}
                onValueChange={setDepartmentFilter}
              >
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Members - Grid View */}
        {viewMode === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.map((member) => (
              <Card
                key={member.id}
                className="border-2 hover:shadow-xl transition-all duration-200 hover:scale-[1.02] cursor-pointer"
              >
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <Avatar className="h-24 w-24 mb-4 border-4 border-blue-500/20">
                      <AvatarImage
                        src={member.profilePhoto}
                        alt={member.name}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white text-2xl font-bold">
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>

                    <h3 className="text-xl font-bold text-foreground mb-1">
                      {member.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {member.designation}
                    </p>

                    <div className="flex flex-wrap gap-2 justify-center mb-4">
                      <Badge
                        variant="outline"
                        className="bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400"
                      >
                        {member.employeeId}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400"
                      >
                        {member.department}
                      </Badge>
                    </div>

                    <div className="w-full space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2 justify-center">
                        <Mail className="h-4 w-4" />
                        <span className="truncate">{member.email}</span>
                      </div>
                      <div className="flex items-center gap-2 justify-center">
                        <Phone className="h-4 w-4" />
                        <span>{member.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 justify-center">
                        <MapPin className="h-4 w-4" />
                        <span>{member.location}</span>
                      </div>
                    </div>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          className="w-full mt-4"
                          variant="outline"
                          onClick={() => setSelectedMember(member)}
                        >
                          View Profile
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                          <DialogTitle>Employee Profile</DialogTitle>
                          <DialogDescription>
                            {selectedMember?.employeeId}
                          </DialogDescription>
                        </DialogHeader>
                        {selectedMember && (
                          <div className="space-y-6">
                            <div className="flex items-center gap-4">
                              <Avatar className="h-20 w-20 border-4 border-blue-500/20">
                                <AvatarImage
                                  src={selectedMember.profilePhoto}
                                  alt={selectedMember.name}
                                />
                                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white text-xl font-bold">
                                  {selectedMember.name
                                    .split(" ")
                                    .map((n: string) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="text-2xl font-bold text-foreground">
                                  {selectedMember.name}
                                </h3>
                                <p className="text-muted-foreground">
                                  {selectedMember.designation}
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-muted-foreground mb-1">
                                  Employee ID
                                </p>
                                <p className="font-semibold">
                                  {selectedMember.employeeId}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground mb-1">
                                  Department
                                </p>
                                <p className="font-semibold">
                                  {selectedMember.department}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground mb-1">
                                  Location
                                </p>
                                <p className="font-semibold">
                                  {selectedMember.location}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground mb-1">
                                  Joined
                                </p>
                                <p className="font-semibold">
                                  {new Date(
                                    selectedMember.joinDate
                                  ).toLocaleDateString("en-US", {
                                    month: "short",
                                    year: "numeric",
                                  })}
                                </p>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                                <Mail className="h-5 w-5 text-blue-600" />
                                <span className="text-sm">
                                  {selectedMember.email}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                                <Phone className="h-5 w-5 text-green-600" />
                                <span className="text-sm">
                                  {selectedMember.phone}
                                </span>
                              </div>
                              {selectedMember.reportingTo && (
                                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                                  <Briefcase className="h-5 w-5 text-purple-600" />
                                  <span className="text-sm">
                                    Reports to: {selectedMember.reportingTo}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Team Members - List View */}
        {viewMode === "list" && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {filteredMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-4 p-4 rounded-xl border-2 border-border hover:bg-muted/50 transition-all duration-200 hover:shadow-md"
                  >
                    <Avatar className="h-16 w-16 border-2 border-blue-500/20">
                      <AvatarImage
                        src={member.profilePhoto}
                        alt={member.name}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white font-bold">
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h4 className="font-bold text-lg text-foreground">
                            {member.name}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {member.designation}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge
                            variant="outline"
                            className="bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400"
                          >
                            {member.employeeId}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400"
                          >
                            {member.department}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {member.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {member.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {member.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Joined{" "}
                          {new Date(member.joinDate).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </span>
                      </div>
                    </div>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          onClick={() => setSelectedMember(member)}
                        >
                          View Profile
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {filteredMembers.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No team members found
              </h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filter criteria
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </EmployeePortalLayout>
  );
}
