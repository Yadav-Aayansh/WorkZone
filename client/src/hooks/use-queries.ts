import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  tenantJobAPI,
  tenantApplicationAPI,
  tenantQueryAPI,
  tenantLeaveAPI,
  tenantLearningAPI,
  tenantEmployeeAPI,
  JobResponse,
  ApplicationResponse,
  ApplicationStatus,
  LeaveRequestResponse,
  LeaveBalanceResponse,
  ApplyLeaveRequest,
  LearningPlanResponse,
} from "@/lib/api";

// ============================================
// Query Keys - Centralized for easy invalidation
// ============================================
export const queryKeys = {
  // Jobs
  jobs: ["jobs"] as const,
  jobsWithStats: ["jobs", "withStats"] as const,
  job: (id: string) => ["jobs", id] as const,

  // Applications
  applications: ["applications"] as const,
  jobApplications: (jobId: string) => ["applications", "job", jobId] as const,
  application: (id: string) => ["applications", id] as const,
  allApplications: ["applications", "all"] as const,

  // Queries (Employee queries/tickets)
  myQueries: ["queries", "my"] as const,
  assignedQueries: ["queries", "assigned"] as const,

  // Leaves (Employee)
  leaveBalance: ["leaves", "balance"] as const,
  myLeaveRequests: ["leaves", "my"] as const,
  pendingApprovals: ["leaves", "pending"] as const,

  // Learning
  learningPlans: ["learning", "plans"] as const,

  // Team
  team: ["team"] as const,
};

// ============================================
// Jobs Hooks
// ============================================

export function useJobs() {
  return useQuery({
    queryKey: queryKeys.jobs,
    queryFn: () => tenantJobAPI.listJobs(),
  });
}

export interface JobWithStats extends JobResponse {
  applicationsCount?: number;
  interviewsCount?: number;
  hiredCount?: number;
}

export function useJobsWithStats() {
  return useQuery({
    queryKey: queryKeys.jobsWithStats,
    queryFn: async (): Promise<JobWithStats[]> => {
      const jobsData = await tenantJobAPI.listJobs();

      // Load application counts for each job
      const jobsWithStats = await Promise.all(
        jobsData.map(async (job) => {
          try {
            const applications = await tenantApplicationAPI.listJobApplications(
              job.id
            );
            return {
              ...job,
              applicationsCount: applications.length,
              interviewsCount: applications.filter(
                (app) =>
                  app.status === ApplicationStatus.HUMAN_INTERVIEW_SCHEDULED ||
                  app.status === ApplicationStatus.AI_INTERVIEW_COMPLETED
              ).length,
              hiredCount: applications.filter((app) => app.status === ApplicationStatus.HIRED)
                .length,
            };
          } catch (err) {
            console.error(
              `Failed to load applications for job ${job.id}:`,
              err
            );
            return {
              ...job,
              applicationsCount: 0,
              interviewsCount: 0,
              hiredCount: 0,
            };
          }
        })
      );

      return jobsWithStats;
    },
  });
}

export function useJob(jobId: string) {
  return useQuery({
    queryKey: queryKeys.job(jobId),
    queryFn: () => tenantJobAPI.getJob(jobId),
    enabled: !!jobId,
  });
}

export function useCreateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof tenantJobAPI.createJob>[0]) =>
      tenantJobAPI.createJob(data),
    onSuccess: () => {
      // Invalidate jobs list to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs });
    },
  });
}

export function useUpdateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      jobId,
      data,
    }: {
      jobId: string;
      data: Parameters<typeof tenantJobAPI.updateJob>[1];
    }) => tenantJobAPI.updateJob(jobId, data),
    onSuccess: (_, variables) => {
      // Invalidate both the specific job and the list
      queryClient.invalidateQueries({ queryKey: queryKeys.job(variables.jobId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs });
    },
  });
}

export function useCloseJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobId: string) => tenantJobAPI.closeJob(jobId),
    onSuccess: (_, jobId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.job(jobId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs });
      queryClient.invalidateQueries({ queryKey: queryKeys.jobsWithStats });
    },
  });
}

// ============================================
// Applications Hooks
// ============================================

export function useJobApplications(jobId: string) {
  return useQuery({
    queryKey: queryKeys.jobApplications(jobId),
    queryFn: () => tenantApplicationAPI.listJobApplications(jobId),
    enabled: !!jobId,
  });
}

export function useApplication(applicationId: string) {
  return useQuery({
    queryKey: queryKeys.application(applicationId),
    queryFn: () => tenantApplicationAPI.getApplication(applicationId),
    enabled: !!applicationId,
  });
}

// Hook to get all applications across all jobs (for dashboard/candidates page)
export function useAllApplications() {
  const { data: jobs = [], isLoading: isLoadingJobs } = useJobs();

  return useQuery({
    queryKey: queryKeys.allApplications,
    queryFn: async () => {
      const allApplications: (ApplicationResponse & { job?: JobResponse })[] = [];

      for (const job of jobs) {
        try {
          const jobApps = await tenantApplicationAPI.listJobApplications(job.id);
          const appsWithJob = jobApps.map((app) => ({ ...app, job }));
          allApplications.push(...appsWithJob);
        } catch (err) {
          console.error(`Failed to load applications for job ${job.id}:`, err);
        }
      }

      // Sort by date (newest first)
      allApplications.sort(
        (a, b) =>
          new Date(b.applied_on).getTime() - new Date(a.applied_on).getTime()
      );

      return allApplications;
    },
    enabled: !isLoadingJobs && jobs.length > 0,
  });
}

// ============================================
// Employee Queries Hooks
// ============================================

export function useMyQueries() {
  return useQuery({
    queryKey: queryKeys.myQueries,
    queryFn: () => tenantQueryAPI.getMyQueries(),
  });
}

export function useAssignedQueries() {
  return useQuery({
    queryKey: queryKeys.assignedQueries,
    queryFn: () => tenantQueryAPI.getAssignedQueries(),
  });
}

export function useCreateQuery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof tenantQueryAPI.createQuery>[0]) =>
      tenantQueryAPI.createQuery(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.myQueries });
    },
  });
}

export function useRespondToQuery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      queryId,
      data,
    }: {
      queryId: string;
      data: Parameters<typeof tenantQueryAPI.respondToQuery>[1];
    }) => tenantQueryAPI.respondToQuery(queryId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assignedQueries });
    },
  });
}

// ============================================
// Employee Leave Hooks
// ============================================

export function useLeaveBalance() {
  return useQuery({
    queryKey: queryKeys.leaveBalance,
    queryFn: () => tenantLeaveAPI.getLeaveBalance(),
  });
}

export function useMyLeaveRequests() {
  return useQuery({
    queryKey: queryKeys.myLeaveRequests,
    queryFn: () => tenantLeaveAPI.getMyLeaveRequests(),
  });
}

export function usePendingApprovals() {
  return useQuery({
    queryKey: queryKeys.pendingApprovals,
    queryFn: () => tenantLeaveAPI.getPendingApprovals(),
  });
}

export function useApplyLeave() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ApplyLeaveRequest) => tenantLeaveAPI.applyLeave(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.myLeaveRequests });
      queryClient.invalidateQueries({ queryKey: queryKeys.leaveBalance });
    },
  });
}

export function useApproveLeave() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (leaveRequestId: string) => tenantLeaveAPI.approveLeave(leaveRequestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pendingApprovals });
    },
  });
}

export function useRejectLeave() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ leaveRequestId, reason }: { leaveRequestId: string; reason: string }) =>
      tenantLeaveAPI.rejectLeave(leaveRequestId, { rejection_reason: reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pendingApprovals });
    },
  });
}

// ============================================
// Learning Hooks
// ============================================

export function useLearningPlans() {
  return useQuery({
    queryKey: queryKeys.learningPlans,
    queryFn: () => tenantLearningAPI.getMyPaths(),
  });
}

export function useGenerateLearningPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (careerGoal: string) => tenantLearningAPI.generatePath({ career_goal: careerGoal }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.learningPlans });
    },
  });
}

// ============================================
// Team Hooks
// ============================================

export function useTeam() {
  return useQuery({
    queryKey: queryKeys.team,
    queryFn: () => tenantEmployeeAPI.getTeam(),
  });
}