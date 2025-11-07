import { ApplicantPortalLayout } from "@/components/tenant/applicant-portal-layout";
import { Button } from "@/components/ui/button";
import { Briefcase, Calendar, FileText, Upload, Search } from "lucide-react";
import Link from "next/link";

export default function ApplicantPortalPage() {
  // Mock data
  const stats = [
    { name: 'Applications', value: '3', icon: FileText, change: '+1 from last week' },
    { name: 'Interviews', value: '2', icon: Calendar, change: '1 tomorrow' },
    { name: 'Saved Jobs', value: '5', icon: Briefcase, change: '3 new' },
  ];

  const recentApplications = [
    { 
      id: 1, 
      title: 'Senior Frontend Developer', 
      company: 'TechCorp', 
      status: 'In Review', 
      date: '2023-11-01',
      statusColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
    },
    { 
      id: 2, 
      title: 'Product Manager', 
      company: 'InnovateX', 
      status: 'Interview Scheduled', 
      date: '2023-11-05',
      statusColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300'
    },
    { 
      id: 3, 
      title: 'UX Designer', 
      company: 'DesignHub', 
      status: 'Application Sent', 
      date: '2023-10-28',
      statusColor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
    },
  ];

  const recommendedJobs = [
    {
      id: 1,
      title: 'Full Stack Developer',
      company: 'WebCraft',
      type: 'Full-time',
      location: 'Remote',
      salary: '$90,000 - $120,000',
      posted: '2 days ago',
      skills: ['React', 'Node.js', 'TypeScript', 'AWS']
    },
    {
      id: 2,
      title: 'DevOps Engineer',
      company: 'CloudScale',
      type: 'Full-time',
      location: 'New York, NY',
      salary: '$110,000 - $140,000',
      posted: '1 week ago',
      skills: ['Docker', 'Kubernetes', 'AWS', 'Terraform']
    },
    {
      id: 3,
      title: 'UI/UX Designer',
      company: 'PixelPerfect',
      type: 'Contract',
      location: 'San Francisco, CA',
      salary: '$70 - $90/hr',
      posted: '3 days ago',
      skills: ['Figma', 'Sketch', 'UI/UX', 'Prototyping']
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-6 rounded-2xl">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Welcome back, Aarav! 👋
          </h1>
          <p className="mt-2 text-muted-foreground">
            You have 2 upcoming interviews this week. Don't forget to prepare and review the job descriptions.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <Button asChild>
              <Link href="/tenant/applicant-portal/job-search" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Find Jobs
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/tenant/applicant-portal/resume" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Update Resume
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-card rounded-xl border p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
                <p className="mt-1 text-2xl font-semibold">{stat.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{stat.change}</p>
              </div>
              <div className="rounded-lg bg-primary/10 p-3 text-primary">
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Applications */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Applications</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/tenant/applicant-portal/applications">View All</Link>
            </Button>
          </div>
          <div className="space-y-3">
            {recentApplications.map((app) => (
              <div key={app.id} className="rounded-lg border p-4 hover:shadow-md transition-shadow bg-card">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">{app.title}</h3>
                    <p className="text-sm text-muted-foreground">{app.company}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${app.statusColor}`}>
                    {app.status}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Applied on {new Date(app.date).toLocaleDateString()}</span>
                  <Button variant="ghost" size="sm" className="h-6 text-xs" asChild>
                    <Link href={`/tenant/applicant-portal/applications/${app.id}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Jobs */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recommended for You</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/tenant/applicant-portal/job-search">See More</Link>
            </Button>
          </div>
          <div className="space-y-3">
            {recommendedJobs.map((job) => (
              <div key={job.id} className="rounded-lg border p-4 hover:shadow-md transition-shadow bg-card">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">{job.title}</h3>
                    <p className="text-sm text-muted-foreground">{job.company} • {job.location}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{job.posted}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {job.skills.map((skill, i) => (
                    <span 
                      key={i} 
                      className="text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="font-medium">{job.salary}</span>
                  <Button size="sm" asChild>
                    <Link href={`/tenant/applicant-portal/job-search/${job.id}`}>
                      Apply Now
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming Interviews */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Upcoming Interviews</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/tenant/applicant-portal/interviews">View All</Link>
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-lg border p-4 bg-card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium">Interview with {i === 1 ? 'TechCorp' : 'InnovateX'}</h3>
                  <p className="text-sm text-muted-foreground">
                    {i === 1 ? 'Technical Interview' : 'HR Interview'}
                  </p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300">
                  {i === 1 ? 'Today' : 'Tomorrow'}
                </span>
              </div>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Nov {i === 1 ? '6' : '7'}, 2023 • {i === 1 ? '2:00 PM' : '11:00 AM'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{i === 1 ? 'Google Meet' : 'Zoom'}</span>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  Reschedule
                </Button>
                <Button size="sm" className="flex-1" asChild>
                  <Link href={i === 1 ? '#' : '#'}>
                    Join Meeting
                  </Link>
                </Button>
              </div>
            </div>
          ))}
          <div className="rounded-lg border-2 border-dashed p-6 flex flex-col items-center justify-center text-center hover:border-primary/30 transition-colors">
            <Calendar className="h-8 w-8 text-muted-foreground mb-2" />
            <h3 className="text-sm font-medium">No more interviews scheduled</h3>
            <p className="text-xs text-muted-foreground mt-1">Apply to more positions to get interview calls</p>
            <Button variant="ghost" size="sm" className="mt-3" asChild>
              <Link href="/tenant/applicant-portal/job-search">
                Browse Jobs
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
