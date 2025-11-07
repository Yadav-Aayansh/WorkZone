export default function DashboardPage() {
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
            <a
              href="/tenant/applicant-portal/job-search"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
            >
              Find Jobs
            </a>
            <a
              href="/tenant/applicant-portal/resume"
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground"
            >
              Update Resume
            </a>
          </div>
        </div>
      </div>

      {/* Rest of the dashboard content */}
      {/* ... */}
    </div>
  );
}
