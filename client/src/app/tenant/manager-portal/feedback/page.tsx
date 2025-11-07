import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, MessageSquare, Check, X, Star, BarChart3, Plus, Send, ThumbsUp, ThumbsDown, User, Clock } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock data
const feedbackList = [
  {
    id: 1,
    employee: "Sarah Johnson",
    role: "Senior Developer",
    avatar: "/avatars/sarah.jpg",
    date: "2023-11-10",
    type: "Team Feedback",
    category: "Teamwork",
    content: "The team collaboration during the last sprint was excellent. We managed to complete all tasks ahead of schedule.",
    sentiment: "positive",
    status: "acknowledged",
    response: "Thank you for your feedback! We'll continue to foster this collaborative environment.",
    responseDate: "2023-11-11"
  },
  {
    id: 2,
    employee: "Michael Chen",
    role: "UX Designer",
    avatar: "/avatars/michael.jpg",
    date: "2023-11-08",
    type: "Process Improvement",
    category: "Workflow",
    content: "The design review process could be more efficient. We often have to wait for feedback from multiple stakeholders.",
    sentiment: "constructive",
    status: "in-review",
    response: "",
    responseDate: ""
  },
  {
    id: 3,
    employee: "Emily Rodriguez",
    role: "QA Engineer",
    avatar: "/avatars/emily.jpg",
    date: "2023-11-05",
    type: "Recognition",
    category: "Team Member",
    content: "David did an amazing job helping the team with the recent production issue. His problem-solving skills are impressive!",
    sentiment: "positive",
    status: "acknowledged",
    response: "We appreciate you recognizing David's contribution. We'll make sure to highlight this in our next team meeting.",
    responseDate: "2023-11-06"
  },
  {
    id: 4,
    employee: "David Kim",
    role: "Frontend Developer",
    avatar: "/avatars/david.jpg",
    date: "2023-11-03",
    type: "Concern",
    category: "Tools",
    content: "The current development environment is quite slow, which affects our productivity. Can we look into performance improvements?",
    sentiment: "constructive",
    status: "in-progress",
    response: "We've created a task to investigate this issue. The infrastructure team is looking into it.",
    responseDate: "2023-11-04"
  },
];

const feedbackTemplates = [
  {
    id: 1,
    name: "Quarterly Team Feedback",
    description: "General feedback about team performance and collaboration",
    questions: 5,
    lastUsed: "2023-10-15"
  },
  {
    id: 2,
    name: "Sprint Retrospective",
    description: "Gather feedback after each sprint",
    questions: 4,
    lastUsed: "2023-11-01"
  },
  {
    id: 3,
    name: "Peer Recognition",
    description: "Recognize team members for their contributions",
    questions: 3,
    lastUsed: "2023-10-28"
  },
];

export default function TeamFeedback() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Team Feedback</h2>
        <p className="text-muted-foreground">
          Collect and manage feedback from your team members.
        </p>
      </div>

      <Tabs defaultValue="inbox" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="inbox">Inbox</TabsTrigger>
            <TabsTrigger value="sent">Sent</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          <div className="flex space-x-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search feedback..."
                className="pl-8 w-[200px] lg:w-[300px]"
              />
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Feedback
            </Button>
          </div>
        </div>

        <TabsContent value="inbox" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Feedback Received</CardTitle>
                <div className="flex space-x-2">
                  <Select>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Feedback</SelectItem>
                      <SelectItem value="unread">Unread</SelectItem>
                      <SelectItem value="acknowledged">Acknowledged</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>From</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Content</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feedbackList.map((feedback) => (
                    <TableRow key={feedback.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center mr-2">
                            <User className="h-4 w-4" />
                          </div>
                          <div>
                            <div>{feedback.employee}</div>
                            <div className="text-xs text-muted-foreground">{feedback.role}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{feedback.type}</Badge>
                        <div className="text-xs text-muted-foreground mt-1">{feedback.category}</div>
                      </TableCell>
                      <TableCell className="max-w-[300px]">
                        <div className="line-clamp-2">{feedback.content}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{feedback.date}</div>
                        <div className="text-xs text-muted-foreground">
                          {feedback.responseDate ? `Replied: ${feedback.responseDate}` : 'No response yet'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {feedback.status === 'acknowledged' && (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            <Check className="h-3 w-3 mr-1" />
                            Acknowledged
                          </Badge>
                        )}
                        {feedback.status === 'in-review' && (
                          <Badge variant="secondary">In Review</Badge>
                        )}
                        {feedback.status === 'in-progress' && (
                          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                            In Progress
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Feedback Templates</CardTitle>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Template
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {feedbackTemplates.map((template) => (
                  <Card key={template.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{template.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {template.questions} questions
                          </p>
                        </div>
                        <Button variant="ghost" size="icon">
                          <MessageSquare className="h-5 w-5" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {template.description}
                      </p>
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>Last used: {template.lastUsed}</span>
                        <div className="space-x-2">
                          <Button variant="outline" size="sm">Edit</Button>
                          <Button size="sm">Use Template</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{feedbackList.length}</div>
                <p className="text-xs text-muted-foreground">
                  +12.5% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
                <Send className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">75%</div>
                <p className="text-xs text-muted-foreground">
                  +5% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Positive Sentiment</CardTitle>
                <ThumbsUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">65%</div>
                <p className="text-xs text-muted-foreground">
                  +8% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Response Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1.2 days</div>
                <p className="text-xs text-muted-foreground">
                  -0.5 days from last month
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Feedback Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center bg-muted/50 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Feedback trends visualization</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* New Feedback Modal (hidden by default) */}
      <div className="hidden fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>New Feedback</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Feedback Type</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="praise">Praise</SelectItem>
                    <SelectItem value="suggestion">Suggestion</SelectItem>
                    <SelectItem value="concern">Concern</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="teamwork">Teamwork</SelectItem>
                    <SelectItem value="communication">Communication</SelectItem>
                    <SelectItem value="tools">Tools & Resources</SelectItem>
                    <SelectItem value="process">Process</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Your Feedback</label>
              <Textarea placeholder="Share your feedback here..." className="min-h-[150px]" />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline">Cancel</Button>
              <Button>Submit Feedback</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
