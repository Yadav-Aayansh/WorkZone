"use client";

import { useState, useEffect } from "react";
import { useTenant } from "@/providers/tenant-provider";
import { useTenantAuth } from "@/providers/tenant-auth-provider";
import { tenantJobAPI, JobResponse } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  MapPin,
  Building2,
  Search,
  Filter,
  Loader2,
  AlertCircle,
  LogOut,
  User,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function CareersPage() {
  const { tenant } = useTenant();
  const { isAuthenticated, logout, userRole } = useTenantAuth();
  const router = useRouter();

  const [jobs, setJobs] = useState<JobResponse[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [showOpenOnly, setShowOpenOnly] = useState(true);

  // Load jobs on mount
  useEffect(() => {
    loadJobs();
  }, []);

  // Apply filters when jobs or filter criteria change
  useEffect(() => {
    applyFilters();
  }, [jobs, searchQuery, selectedDepartment, selectedLocation, showOpenOnly]);

  const loadJobs = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await tenantJobAPI.listJobs({
        is_open: showOpenOnly ? true : undefined,
      });
      setJobs(response);
    } catch (err: any) {
      console.error("Failed to load jobs:", err);
      setError(err.message || "Failed to load job listings");
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...jobs];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(query) ||
          job.description.toLowerCase().includes(query) ||
          job.department.toLowerCase().includes(query) ||
          job.location.toLowerCase().includes(query)
      );
    }

    // Department filter
    if (selectedDepartment !== "all") {
      filtered = filtered.filter(
        (job) => job.department === selectedDepartment
      );
    }

    // Location filter
    if (selectedLocation !== "all") {
      filtered = filtered.filter((job) => job.location === selectedLocation);
    }

    // Open jobs only filter
    if (showOpenOnly) {
      filtered = filtered.filter((job) => job.is_open);
    }

    setFilteredJobs(filtered);
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  // Extract unique departments and locations for filters
  const departments = Array.from(new Set(jobs.map((job) => job.department)));
  const locations = Array.from(new Set(jobs.map((job) => job.location)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {tenant?.logo && (
                <img
                  src={tenant.logo}
                  alt={tenant.brandName}
                  className="h-10 object-contain"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Careers at {tenant?.brandName}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Join our team and make an impact
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isAuthenticated && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/${userRole}-portal`)}
                  >
                    <User className="w-4 h-4 mr-2" />
                    My Portal
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </>
              )}
              {!isAuthenticated && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push("/login")}
                  >
                    Login
                  </Button>
                  <Button size="sm" onClick={() => router.push("/signup")}>
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Find Your Next Opportunity
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Explore open positions and join our talented team
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8 shadow-lg">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search jobs by title, description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Department Filter */}
              <Select
                value={selectedDepartment}
                onValueChange={setSelectedDepartment}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Department" />
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

              {/* Location Filter */}
              <Select
                value={selectedLocation}
                onValueChange={setSelectedLocation}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {loc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Show closed jobs toggle */}
            <div className="mt-4 flex items-center gap-2">
              <input
                type="checkbox"
                id="showOpen"
                checked={showOpenOnly}
                onChange={(e) => setShowOpenOnly(e.target.checked)}
                className="rounded"
              />
              <label
                htmlFor="showOpen"
                className="text-sm text-gray-600 dark:text-gray-400"
              >
                Show only open positions
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-gray-600 dark:text-gray-400">
              Loading job listings...
            </span>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Results Count */}
        {!isLoading && !error && (
          <div className="mb-6">
            <p className="text-gray-600 dark:text-gray-400">
              {filteredJobs.length === 0 ? (
                "No jobs found matching your criteria"
              ) : (
                <>
                  Showing {filteredJobs.length} of {jobs.length}{" "}
                  {filteredJobs.length === 1 ? "position" : "positions"}
                </>
              )}
            </p>
          </div>
        )}

        {/* Job Listings */}
        {!isLoading && !error && (
          <div className="grid gap-6">
            {filteredJobs.length === 0 ? (
              <Card className="p-12 text-center">
                <Briefcase className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No Jobs Found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Try adjusting your search criteria or check back later for new
                  opportunities
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedDepartment("all");
                    setSelectedLocation("all");
                    setShowOpenOnly(true);
                  }}
                >
                  Clear Filters
                </Button>
              </Card>
            ) : (
              filteredJobs.map((job) => (
                <Card
                  key={job.id}
                  className="hover:shadow-xl transition-shadow cursor-pointer group"
                  onClick={() => router.push(`/careers/${job.id}`)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                            {job.title}
                          </h3>
                          {!job.is_open && (
                            <Badge variant="secondary">Closed</Badge>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                          <div className="flex items-center gap-1">
                            <Building2 className="w-4 h-4" />
                            <span>{job.department}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{job.location}</span>
                          </div>
                        </div>

                        <p className="text-gray-700 dark:text-gray-300 line-clamp-2 mb-4">
                          {job.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Posted{" "}
                            {new Date(job.created_at).toLocaleDateString()}
                          </p>
                          <Button
                            variant="ghost"
                            className="group-hover:bg-primary group-hover:text-white transition-colors"
                          >
                            View Details
                            <ChevronRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p>© 2025 {tenant?.brandName}. All rights reserved.</p>
            <p className="text-sm mt-2">
              Powered by WorkZone - Modern Recruitment Platform
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
