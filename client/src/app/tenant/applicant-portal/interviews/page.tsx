export default function InterviewsPage() {
  const upcomingInterviews = [
    {
      id: 1,
      jobTitle: 'Senior Frontend Developer',
      company: 'TechCorp',
      type: 'Technical Interview',
      date: '2023-11-06T14:00:00',
      meetingLink: 'https://meet.google.com/abc-xyz-123',
      interviewer: 'Sarah Johnson',
      status: 'Scheduled'
    },
    {
      id: 2,
      jobTitle: 'Product Manager',
      company: 'InnovateX',
      type: 'HR Interview',
      date: '2023-11-07T11:00:00',
      meetingLink: 'https://zoom.us/j/1234567890',
      interviewer: 'Michael Chen',
      status: 'Scheduled'
    }
  ];

  const pastInterviews = [
    {
      id: 3,
      jobTitle: 'UX Designer',
      company: 'DesignHub',
      type: 'Portfolio Review',
      date: '2023-10-25T10:30:00',
      status: 'Completed',
      feedback: 'Positive'
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
    <div className="space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Interviews</h1>
        <p className="text-muted-foreground">
          Manage your upcoming and past interviews
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Upcoming Interviews</h2>
          <div className="space-y-4">
            {upcomingInterviews.length > 0 ? (
              upcomingInterviews.map((interview) => (
                <div key={interview.id} className="rounded-lg border p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-lg font-medium">{interview.jobTitle}</h3>
                      <p className="text-muted-foreground">{interview.company}</p>
                      <p className="mt-2 text-sm">
                        <span className="font-medium">Interviewer:</span> {interview.interviewer}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Type:</span> {interview.type}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Scheduled:</span> {formatDate(interview.date)}
                      </p>
                    </div>
                    <div className="mt-4 sm:mt-0 space-y-2">
                      <a
                        href={interview.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex w-full justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                      >
                        Join Meeting
                      </a>
                      <button className="inline-flex w-full justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
                        Reschedule
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No upcoming interviews scheduled.</p>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Past Interviews</h2>
          <div className="space-y-4">
            {pastInterviews.length > 0 ? (
              pastInterviews.map((interview) => (
                <div key={interview.id} className="rounded-lg border p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-lg font-medium">{interview.jobTitle}</h3>
                      <p className="text-muted-foreground">{interview.company}</p>
                      <p className="mt-2 text-sm">
                        <span className="font-medium">Type:</span> {interview.type}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Date:</span> {formatDate(interview.date)}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Status:</span> {interview.status}
                        {interview.feedback && (
                          <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                            interview.feedback === 'Positive' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' 
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
                          }`}>
                            {interview.feedback} Feedback
                          </span>
                        )}
                      </p>
                    </div>
                    <button className="mt-4 sm:mt-0 inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
                      View Details
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No past interviews found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
