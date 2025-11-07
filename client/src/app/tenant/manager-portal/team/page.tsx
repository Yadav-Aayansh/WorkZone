import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Search, Filter, ArrowUpDown, Mail, Phone, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock data
const teamMembers = [
  { 
    id: 1, 
    name: "Sarah Johnson", 
    role: "Senior Developer",
    email: "sarah.johnson@example.com",
    phone: "+1 (555) 123-4567",
    department: "Engineering",
    joinDate: "2020-05-15",
    avatar: "/avatars/sarah.jpg",
    status: "active",
    performance: 85,
    skills: ["React", "TypeScript", "Node.js", "AWS"]
  },
  { 
    id: 2, 
    name: "Michael Chen", 
    role: "UX Designer",
    email: "michael.chen@example.com",
    phone: "+1 (555) 234-5678",
    department: "Design",
    joinDate: "2019-08-22",
    avatar: "/avatars/michael.jpg",
    status: "on leave",
    performance: 92,
    skills: ["Figma", "UI/UX", "Prototyping", "User Research"]
  },
  { 
    id: 3, 
    name: "Emily Rodriguez", 
    role: "QA Engineer",
    email: "emily.rodriguez@example.com",
    phone: "+1 (555) 345-6789",
    department: "Quality Assurance",
    joinDate: "2021-02-10",
    avatar: "/avatars/emily.jpg",
    status: "active",
    performance: 78,
    skills: ["Manual Testing", "Automation", "Jest", "Cypress"]
  },
  { 
    id: 4, 
    name: "David Kim", 
    role: "Frontend Developer",
    email: "david.kim@example.com",
    phone: "+1 (555) 456-7890",
    department: "Engineering",
    joinDate: "2022-01-05",
    avatar: "/avatars/david.jpg",
    status: "active",
    performance: 88,
    skills: ["React", "TypeScript", "Next.js", "Tailwind CSS"]
  },
  { 
    id: 5, 
    name: "Jessica Lee", 
    role: "Product Manager",
    email: "jessica.lee@example.com",
    phone: "+1 (555) 567-8901",
    department: "Product",
    joinDate: "2018-11-15",
    avatar: "/avatars/jessica.jpg",
    status: "active",
    performance: 90,
    skills: ["Agile", "Scrum", "Product Strategy", "Roadmapping"]
  },
];

export default function TeamPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Team Members</h2>
        <p className="text-muted-foreground">
          Manage your team members and view their details.
        </p>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4">
        <div className="w-full md:w-1/3 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search team members..."
            className="pl-10 w-full"
          />
        </div>
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full md:w-auto">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>All Members</DropdownMenuItem>
              <DropdownMenuItem>Active</DropdownMenuItem>
              <DropdownMenuItem>On Leave</DropdownMenuItem>
              <DropdownMenuItem>By Department</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full md:w-auto">
                <ArrowUpDown className="mr-2 h-4 w-4" />
                Sort By
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>Name (A-Z)</DropdownMenuItem>
              <DropdownMenuItem>Join Date (Newest)</DropdownMenuItem>
              <DropdownMenuItem>Performance (High-Low)</DropdownMenuItem>
              <DropdownMenuItem>Department</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Team Members Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {teamMembers.map((member) => (
          <Card key={member.id} className="overflow-hidden">
            <div className="relative">
              <div className="h-24 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
              <div className="absolute -bottom-10 left-4">
                <Avatar className="h-20 w-20 border-4 border-background">
                  <AvatarImage src={member.avatar} alt={member.name} />
                  <AvatarFallback>
                    {member.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="absolute top-2 right-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">More options</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>View Profile</DropdownMenuItem>
                    <DropdownMenuItem>Send Message</DropdownMenuItem>
                    <DropdownMenuItem>Edit Details</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">Remove from Team</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <CardHeader className="pt-12">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{member.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </div>
                <Badge 
                  variant={member.status === 'active' ? 'outline' : 'secondary'}
                  className={member.status === 'active' 
                    ? 'text-green-600 border-green-600' 
                    : 'text-amber-600 border-amber-600'}
                >
                  {member.status === 'active' ? 'Active' : 'On Leave'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Mail className="mr-2 h-4 w-4" />
                  <span>{member.email}</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Phone className="mr-2 h-4 w-4" />
                  <span>{member.phone}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Performance</span>
                  <span className="font-medium">{member.performance}%</span>
                </div>
                <Progress value={member.performance} className="h-2" />
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {member.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="pt-2">
                <Button variant="outline" className="w-full">
                  View Full Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Team Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Team Size</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamMembers.length}</div>
            <p className="text-xs text-muted-foreground">
              {teamMembers.filter(m => m.status === 'active').length} active members
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg. Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(teamMembers.reduce((acc, curr) => acc + curr.performance, 0) / teamMembers.length)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Across all team members
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(teamMembers.map(m => m.department)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              Different departments
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Array.from(new Set(teamMembers.flatMap(m => m.skills))).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Unique skills in team
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
