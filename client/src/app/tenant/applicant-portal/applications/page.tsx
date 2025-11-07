export default function ApplicationsPage() {
  const applications = [
    {
      id: 1,
      jobTitle: 'Senior Frontend Developer',
      company: 'TechCorp',
      status: 'In Review',
      date: '2023-11-01',
      statusColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
    },
    {
      id: 2,
      jobTitle: 'Product Manager',
      company: 'InnovateX',
      status: 'Interview Scheduled',
      date: '2023-11-05',
      statusColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300'
    },
    {
      id: 3,
      jobTitle: 'UX Designer',
      company: 'DesignHub',
      status: 'Application Sent',
      date: '2023-10-28',
      statusColor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">My Applications</h1>
        <p className="text-muted-foreground">
          Track the status of your job applications
        </p>
      </div>

      <div className="space-y-4">
        {applications.map((app) => (
          <div key={app.id} className="rounded-lg border p-6 hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-medium">{app.jobTitle}</h3>
                <p className="text-sm text-muted-foreground">{app.company}</p>
              </div>
              <span className={`mt-2 sm:mt-0 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${app.statusColor}`}>
                {app.status}
              </span>
            </div>
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Applied on {new Date(app.date).toLocaleDateString()}
              </p>
              <a
                href={`/tenant/applicant-portal/applications/${app.id}`}
                className="mt-2 sm:mt-0 inline-flex items-center text-sm font-medium text-primary hover:underline"
              >
                View Details
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
