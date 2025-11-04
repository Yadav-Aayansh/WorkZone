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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  HeadphonesIcon,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageSquare,
} from "lucide-react";
import ticketsData from "@/data/tenant/tickets.json";
import { useState } from "react";

export default function SupportPage() {
  const [open, setOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "resolved":
        return (
          <Badge className="bg-green-500">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Resolved
          </Badge>
        );
      case "in_progress":
        return (
          <Badge className="bg-blue-500">
            <Clock className="h-3 w-3 mr-1" />
            In Progress
          </Badge>
        );
      case "open":
        return (
          <Badge className="bg-yellow-500">
            <AlertCircle className="h-3 w-3 mr-1" />
            Open
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">High</Badge>;
      case "medium":
        return <Badge className="bg-orange-500">Medium</Badge>;
      case "low":
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      it: "bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400",
      access:
        "bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400",
      payroll:
        "bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400",
      facilities:
        "bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400",
    };
    return (
      colors[category] ||
      "bg-gray-100 dark:bg-gray-950/30 text-gray-700 dark:text-gray-400"
    );
  };

  return (
    <EmployeePortalLayout>
      <div className="space-y-6">
        {/* Header */}
        <Card className="border-2 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg">
                  <HeadphonesIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">
                    Support & Tickets
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Get help and track your support requests
                  </p>
                </div>
              </div>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Create Ticket
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Create Support Ticket</DialogTitle>
                    <DialogDescription>
                      Describe your issue and we'll get back to you soon
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        placeholder="Brief description of your issue"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="category">Category</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="it">IT Support</SelectItem>
                          <SelectItem value="access">Access Request</SelectItem>
                          <SelectItem value="payroll">Payroll</SelectItem>
                          <SelectItem value="facilities">Facilities</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Provide detailed information about your issue..."
                        className="min-h-[120px]"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={() => setOpen(false)}
                      className="bg-gradient-to-r from-blue-600 to-blue-700"
                    >
                      Submit Ticket
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200 dark:border-blue-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-400">
                Total Tickets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-blue-900 dark:text-blue-300">
                {ticketsData.length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 border-yellow-200 dark:border-yellow-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
                Open Tickets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-yellow-900 dark:text-yellow-300">
                {ticketsData.filter((t) => t.status === "open").length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-400">
                In Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-blue-900 dark:text-blue-300">
                {ticketsData.filter((t) => t.status === "in_progress").length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-700 dark:text-green-400">
                Resolved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-green-900 dark:text-green-300">
                {ticketsData.filter((t) => t.status === "resolved").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tickets Table */}
        <Card>
          <CardHeader>
            <CardTitle>My Tickets</CardTitle>
            <CardDescription>
              Track and manage your support requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ticketsData.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-medium max-w-xs">
                      <div className="truncate">{ticket.title}</div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={getCategoryColor(ticket.category)}
                        variant="outline"
                      >
                        {ticket.category}
                      </Badge>
                    </TableCell>
                    <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                    <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                    <TableCell>
                      {new Date(ticket.createdDate).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedTicket(ticket)}
                          >
                            <MessageSquare className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                          <DialogHeader>
                            <DialogTitle>{selectedTicket?.title}</DialogTitle>
                            <DialogDescription>
                              Ticket ID: {selectedTicket?.id}
                            </DialogDescription>
                          </DialogHeader>
                          {selectedTicket && (
                            <div className="space-y-4">
                              <div className="flex items-center gap-2">
                                {getStatusBadge(selectedTicket.status)}
                                {getPriorityBadge(selectedTicket.priority)}
                                <Badge
                                  className={getCategoryColor(
                                    selectedTicket.category
                                  )}
                                  variant="outline"
                                >
                                  {selectedTicket.category}
                                </Badge>
                              </div>

                              <div className="bg-muted rounded-lg p-4">
                                <p className="text-sm text-muted-foreground mb-2">
                                  Description
                                </p>
                                <p className="text-foreground">
                                  {selectedTicket.description}
                                </p>
                              </div>

                              <div className="text-sm text-muted-foreground">
                                <p>
                                  Created:{" "}
                                  {new Date(
                                    selectedTicket.createdDate
                                  ).toLocaleDateString("en-US", {
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                                {selectedTicket.assignedTo && (
                                  <p>
                                    Assigned to: {selectedTicket.assignedTo}
                                  </p>
                                )}
                              </div>

                              {selectedTicket.comments &&
                                selectedTicket.comments.length > 0 && (
                                  <div>
                                    <h4 className="font-semibold mb-3">
                                      Comments
                                    </h4>
                                    <div className="space-y-3">
                                      {selectedTicket.comments.map(
                                        (comment: any, index: number) => (
                                          <div
                                            key={index}
                                            className="bg-muted rounded-lg p-3"
                                          >
                                            <div className="flex items-center justify-between mb-2">
                                              <span className="font-semibold text-sm">
                                                {comment.by}
                                              </span>
                                              <span className="text-xs text-muted-foreground">
                                                {new Date(
                                                  comment.date
                                                ).toLocaleDateString("en-US", {
                                                  month: "short",
                                                  day: "numeric",
                                                  hour: "2-digit",
                                                  minute: "2-digit",
                                                })}
                                              </span>
                                            </div>
                                            <p className="text-sm">
                                              {comment.message}
                                            </p>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </EmployeePortalLayout>
  );
}
