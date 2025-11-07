export default function AssessmentsPage() {
  const assessments = [
    {
      id: 1,
      title: 'Frontend Development Test',
      jobTitle: 'Senior Frontend Developer',
      company: 'TechCorp',
      status: 'Pending',
      dueDate: '2023-11-10T23:59:59',
      timeLimit: 60, // minutes
      questions: 15,
      statusColor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
    },
    {
      id: 2,
      title: 'Problem Solving Assessment',
      jobTitle: 'Product Manager',
      company: 'InnovateX',
      status: 'Completed',
      completedDate: '2023-10-28T14:30:00',
      score: '85/100',
      statusColor: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
    },
    {
      id: 3,
      title: 'UI/UX Design Challenge',
      jobTitle: 'UX Designer',
      company: 'DesignHub',
      status: 'Expired',
      dueDate: '2023-10-20T23:59:59',
      statusColor: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
    }
  ];

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Assessments</h1>
        <p className="text-muted-foreground">
          Complete your pending assessments and view results
        </p>
      </div>

      <div className="space-y-4">
        {assessments.map((assessment) => (
          <div key={assessment.id} className="rounded-lg border p-6 hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-medium">{assessment.title}</h3>
                <p className="text-muted-foreground">
                  {assessment.jobTitle} • {assessment.company}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${assessment.statusColor}`}>
                    {assessment.status}
                  </span>
                  {assessment.dueDate && (
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                      Due: {formatDate(assessment.dueDate)}
                    </span>
                  )}
                  {assessment.timeLimit && (
                    <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800 dark:bg-purple-900/50 dark:text-purple-300">
                      {assessment.timeLimit} min
                    </span>
                  )}
                </div>
              </div>
              <div className="mt-4 sm:mt-0 space-x-2">
                {assessment.status === 'Pending' && assessment.dueDate && new Date(assessment.dueDate) > new Date() ? (
                  <a
                    href={`/tenant/applicant-portal/assessments/${assessment.id}`}
                    className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    Start Assessment
                  </a>
                ) : assessment.status === 'Completed' ? (
                  <a
                    href={`/tenant/applicant-portal/assessments/${assessment.id}/results`}
                    className="inline-flex items-center justify-center rounded-md bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20"
                  >
                    View Results
                  </a>
                ) : (
                  <span className="inline-flex items-center justify-center rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-500 cursor-not-allowed">
                    {assessment.status}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
