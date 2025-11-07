export default function JobSearchPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Job Search</h1>
        <p className="text-muted-foreground">
          Find your next career opportunity
        </p>
      </div>
      
      {/* Search and filters will go here */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search jobs..."
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <button className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Search
          </button>
        </div>
        
        {/* Job listings will be mapped here */}
        <div className="space-y-4">
          {/* Example job card */}
          <div className="rounded-lg border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-medium">Senior Frontend Developer</h3>
                <p className="text-sm text-muted-foreground">TechCorp • Remote</p>
              </div>
              <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                Full-time
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              We're looking for an experienced Frontend Developer to join our team...
            </p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm font-medium">$90,000 - $120,000</span>
              <button className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                Apply Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
