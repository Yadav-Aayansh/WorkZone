import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar, 
  Clock, 
  Users, 
  ArrowRight, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  CreditCard, 
  BarChart3 
} from "lucide-react";

// Mock data
const teamMembers = [
  { 
    id: 1, 
    name: "Sarah Johnson", 
    role: "Senior Developer",
    avatar: "/avatars/sarah.jpg",
    status: "active",
    performance: 85
  },
  { 
    id: 2, 
    name: "Michael Chen", 
    role: "UX Designer",
    avatar: "/avatars/michael.jpg",
    status: "on leave",
    performance: 92
  },
  { 
    id: 3, 
    name: "Emily Rodriguez", 
    role: "QA Engineer",
    avatar: "/avatars/emily.jpg",
    status: "active",
    performance: 78
  },
  { 
    id: 4, 
    name: "David Kim", 
    role: "Frontend Developer",
    avatar: "/avatars/david.jpg",
    status: "active",
    performance: 88
  },
];

const pendingLeaves = [
  { 
    id: 1, 
    name: "Michael Chen", 
    type: "Vacation", 
    date: "2023-11-15 to 2023-11-18", 
    days: 3 
  },
  { 
    id: 2, 
    name: "Sarah Johnson", 
    type: "Sick Leave", 
    date: "2023-11-20", 
    days: 1 
  },
];

const pendingExpenses = [
  { 
    id: 1, 
    name: "David Kim", 
    category: "Conference", 
    amount: 450, 
    date: "2023-11-10" 
  },
  { 
    id: 2, 
    name: "Emily Rodriguez", 
    category: "Training", 
    amount: 299, 
    date: "2023-11-12" 
  },
];

export default function ManagerDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening with your team.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Size</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamMembers.length}</div>
            <p className="text-xs text-muted-foreground">
              {teamMembers.filter(m => m.status === 'active').length} active now
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Leaves</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingLeaves.length}</div>
            <p className="text-xs text-muted-foreground">
              {pendingLeaves.length > 0 ? 'Needs your review' : 'All caught up!'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expense Approvals</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingExpenses.length}</div>
            <p className="text-xs text-muted-foreground">
              {pendingExpenses.length > 0 ? 'Waiting for approval' : 'All clear'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Performance</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(teamMembers.reduce((acc, curr) => acc + curr.performance, 0) / teamMembers.length)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Average performance score
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Team Members */}
        <Card className="col-span-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Team Members</CardTitle>
              <Button variant="ghost" size="sm" className="text-primary">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback>
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium leading-none">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-24">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span>Performance</span>
                        <span>{member.performance}%</span>
                      </div>
                      <Progress value={member.performance} className="h-2" />
                    </div>
                    <Badge 
                      variant={member.status === 'active' ? 'outline' : 'secondary'}
                      className={member.status === 'active' ? 'text-green-600 border-green-600' : ''}
                    >
                      {member.status === 'active' ? 'Active' : 'On Leave'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="col-span-3 space-y-4">
          {/* Pending Leaves */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pending Leave Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingLeaves.length > 0 ? (
                <div className="space-y-4">
                  {pendingLeaves.map((leave) => (
                    <div key={leave.id} className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{leave.name}</p>
                        <p className="text-sm text-muted-foreground">{leave.type}</p>
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                          <Calendar className="mr-1 h-3 w-3" />
                          {leave.date}
                          <span className="mx-2">•</span>
                          <Clock className="mr-1 h-3 w-3" />
                          {leave.days} {leave.days > 1 ? 'days' : 'day'}
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                          <XCircle className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
                  <p className="text-sm text-muted-foreground">No pending leave requests</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pending Expenses */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Expense Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingExpenses.length > 0 ? (
                <div className="space-y-4">
                  {pendingExpenses.map((expense) => (
                    <div key={expense.id} className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{expense.name}</p>
                        <p className="text-sm text-muted-foreground">{expense.category}</p>
                        <div className="text-sm text-muted-foreground mt-1">
                          ${expense.amount} • {expense.date}
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Button variant="outline" size="sm" className="h-8">
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
                  <p className="text-sm text-muted-foreground">No pending expenses</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
