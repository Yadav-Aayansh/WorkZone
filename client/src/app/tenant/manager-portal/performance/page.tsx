import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, User, Star, Award, BarChart3, Calendar, Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock data
const teamMembers = [
  { 
    id: 1, 
    name: "Sarah Johnson", 
    role: "Senior Developer",
    avatar: "/avatars/sarah.jpg",
    performance: 85,
    lastReview: "2023-10-15",
    nextReview: "2024-01-15",
    goals: 4,
    completedGoals: 3,
    status: "on-track"
  },
  { 
    id: 2, 
    name: "Michael Chen", 
    role: "UX Designer",
    avatar: "/avatars/michael.jpg",
    performance: 92,
    lastReview: "2023-11-01",
    nextReview: "2024-02-01",
    goals: 5,
    completedGoals: 5,
    status: "exceeding"
  },
  { 
    id: 3, 
    name: "Emily Rodriguez", 
    role: "QA Engineer",
    avatar: "/avatars/emily.jpg",
    performance: 78,
    lastReview: "2023-09-20",
    nextReview: "2023-12-20",
    goals: 3,
    completedGoals: 1,
    status: "needs-improvement"
  },
  { 
    id: 4, 
    name: "David Kim", 
    role: "Frontend Developer",
    avatar: "/avatars/david.jpg",
    performance: 88,
    lastReview: "2023-11-05",
    nextReview: "2024-02-05",
    goals: 4,
    completedGoals: 2,
    status: "on-track"
  },
];

const reviewTemplates = [
  {
    id: 1,
    name: "Quarterly Review Q4 2023",
    period: "Q4 2023",
    status: "draft",
    dueDate: "2023-12-15",
    participants: 8
  },
  {
    id: 2,
    name: "Annual Review 2023",
    period: "2023",
    status: "in-progress",
    dueDate: "2024-01-31",
    participants: 12
  },
  {
    id: 3,
    name: "Q1 2024 Goals",
    period: "Q1 2024",
    status: "upcoming",
    dueDate: "2024-03-31",
    participants: 10
  },
];

export default function PerformanceReviews() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Performance Reviews</h2>
        <p className="text-muted-foreground">
          Track and manage team performance and reviews.
        </p>
      </div>

      <Tabs defaultValue="team" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="team">Team Performance</TabsTrigger>
            <TabsTrigger value="reviews">Review Cycles</TabsTrigger>
            <TabsTrigger value="goals">Team Goals</TabsTrigger>
          </TabsList>
          <div className="flex space-x-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="pl-8 w-[200px] lg:w-[300px]"
              />
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Review
            </Button>
          </div>
        </div>

        <TabsContent value="team" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Team Average</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(teamMembers.reduce((acc, curr) => acc + curr.performance, 0) / teamMembers.length)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  +2.3% from last quarter
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Top Performer</CardTitle>
                <Award className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Michael Chen</div>
                <p className="text-xs text-muted-foreground">
                  92% performance score
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Goals Completion</CardTitle>
                <Star className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">68%</div>
                <div className="mt-2">
                  <Progress value={68} className="h-2" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Reviews</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">
                  Next: Dec 15, 2023
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Team Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Team Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead>Goals Progress</TableHead>
                    <TableHead>Last Review</TableHead>
                    <TableHead>Next Review</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-muted/50 flex items-center justify-center mr-3">
                            <User className="h-5 w-5" />
                          </div>
                          <div>
                            <div>{member.name}</div>
                            <div className="text-xs text-muted-foreground">{member.role}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{member.role}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="w-16 mr-2">
                            <Progress value={member.performance} className="h-2" />
                          </div>
                          <span>{member.performance}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="w-16 mr-2">
                            <Progress 
                              value={(member.completedGoals / member.goals) * 100} 
                              className="h-2" 
                            />
                          </div>
                          <span>{member.completedGoals}/{member.goals}</span>
                        </div>
                      </TableCell>
                      <TableCell>{member.lastReview}</TableCell>
                      <TableCell>{member.nextReview}</TableCell>
                      <TableCell>
                        {member.status === 'exceeding' && (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            Exceeding
                          </Badge>
                        )}
                        {member.status === 'on-track' && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                            On Track
                          </Badge>
                        )}
                        {member.status === 'needs-improvement' && (
                          <Badge variant="destructive" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                            Needs Improvement
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Review Cycles</CardTitle>
                <div className="flex space-x-2">
                  <Select>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Reviews</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Review Name</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Participants</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviewTemplates.map((review) => (
                    <TableRow key={review.id}>
                      <TableCell className="font-medium">{review.name}</TableCell>
                      <TableCell>{review.period}</TableCell>
                      <TableCell>
                        {review.status === 'draft' && (
                          <Badge variant="outline">Draft</Badge>
                        )}
                        {review.status === 'in-progress' && (
                          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                            In Progress
                          </Badge>
                        )}
                        {review.status === 'upcoming' && (
                          <Badge variant="secondary">Upcoming</Badge>
                        )}
                      </TableCell>
                      <TableCell>{review.dueDate}</TableCell>
                      <TableCell>{review.participants} team members</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Team Goals</CardTitle>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Goal
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {teamMembers.map((member) => (
                  <div key={member.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-muted/50 flex items-center justify-center">
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium">{member.name}</h3>
                          <p className="text-sm text-muted-foreground">{member.role}</p>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {member.completedGoals} of {member.goals} goals completed
                      </div>
                    </div>
                    <Progress 
                      value={(member.completedGoals / member.goals) * 100} 
                      className="h-2" 
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
