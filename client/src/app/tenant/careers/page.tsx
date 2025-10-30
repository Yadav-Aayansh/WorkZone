"use client";

import { useTenant } from "@/providers/tenant-provider";
import { useTenantAuth } from "@/providers/tenant-auth-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { LogOut, User, Briefcase, Search, MapPin } from "lucide-react";

export default function CareersPage() {
  const { tenant } = useTenant();
  const { isAuthenticated, logout, userRole } = useTenantAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  // Sample job listings (will be replaced with API data later)
  const sampleJobs = [
    {
      id: 1,
      title: "Senior Software Engineer",
      department: "Engineering",
      location: "Remote",
      type: "Full-time",
    },
    {
      id: 2,
      title: "Product Manager",
      department: "Product",
      location: "Hybrid",
      type: "Full-time",
    },
    {
      id: 3,
      title: "UX Designer",
      department: "Design",
      location: "On-site",
      type: "Full-time",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {tenant?.logo && (
              <img
                src={tenant.logo}
                alt={tenant.brandName}
                className="h-8 object-contain"
              />
            )}
            <h1 className="text-xl font-bold">{tenant?.brandName} Careers</h1>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated && userRole && (
              <>
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4" />
                  <span className="capitalize">{userRole}</span>
                </div>
                <Button variant="outline" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </>
            )}
            {!isAuthenticated && (
              <>
                <Button variant="outline" onClick={() => router.push("/login")}>
                  Sign In
                </Button>
                <Button onClick={() => router.push("/signup")}>
                  Apply Now
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-16">
        <div className="container mx-auto px-4 text-center space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">Join Our Team</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Be part of {tenant?.brandName}&apos;s journey. We&apos;re hiring
            talented people to help us build the future.
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <Button size="lg">
              <Search className="mr-2 h-5 w-5" />
              Browse All Jobs
            </Button>
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="container mx-auto px-4 py-16">
        <div className="space-y-8">
          <div className="space-y-2">
            <h3 className="text-3xl font-bold">Open Positions</h3>
            <p className="text-muted-foreground">
              {sampleJobs.length} open positions available
            </p>
          </div>

          <div className="grid gap-6">
            {sampleJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-xl">{job.title}</CardTitle>
                      <CardDescription className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-4 w-4" />
                          {job.department}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {job.location}
                        </span>
                        <span className="text-primary font-medium">
                          {job.type}
                        </span>
                      </CardDescription>
                    </div>
                    <Button>Apply Now</Button>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Auth Status Info */}
      {isAuthenticated && (
        <section className="container mx-auto px-4 py-8">
          <Card className="border-primary/50">
            <CardHeader>
              <CardTitle className="text-lg">
                ✅ You&apos;re Signed In!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This is the careers page (public route). As an applicant, you
                can view and apply for jobs. Protected route testing is working
                correctly!
              </p>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}
