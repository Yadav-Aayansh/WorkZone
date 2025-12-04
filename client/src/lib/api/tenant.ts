// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/* eslint-disable */

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
const PLATFORM_DOMAIN = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || 'workzone.tech';

/**
 * Check if the current hostname is a custom domain (not a subdomain of the platform)
 * Custom domains: jobs.noctivagous.me, hr.company.com
 * Platform subdomains: company.workzone.tech
 */
function isCustomDomain(): boolean {
  if (typeof window === 'undefined') return false;
  
  const hostname = window.location.hostname;
  
  // Localhost is never a custom domain
  if (hostname.includes('localhost')) return false;
  
  // If hostname doesn't end with platform domain, it's a custom domain
  return !hostname.endsWith(`.${PLATFORM_DOMAIN}`) && hostname !== PLATFORM_DOMAIN;
}

/**
 * Get tenant-specific backend URL
 * For custom domains: Pass full hostname in X-Custom-Domain header instead
 * For platform subdomains: Returns URL with tenant subdomain (e.g., http://company.api.workzone.tech)
 * Backend extracts tenant_id from hostname or custom domain header
 */
function getTenantBackendUrl(): string {
  if (typeof window === 'undefined') return BASE_URL;

  // For custom domains, backend identifies tenant via X-Custom-Domain header
  // So we use the base URL and the header will be added in fetch calls
  if (isCustomDomain()) {
    return BASE_URL;
  }

  const subdomain = getTenantSubdomain();
  if (!subdomain) return BASE_URL;

  // Parse BASE_URL to add subdomain
  try {
    const url = new URL(BASE_URL);
    
    // For localhost: subdomain.localhost:8000
    if (url.hostname === 'localhost') {
      return `${url.protocol}//${subdomain}.${url.hostname}:${url.port}`;
    }
    
    // For production: subdomain.api.workzone.tech or subdomain.workzone.tech
    // Check if hostname already has subdomain
    const parts = url.hostname.split('.');
    if (parts.length >= 2) {
      return `${url.protocol}//${subdomain}.${url.hostname}${url.port ? ':' + url.port : ''}`;
    }
    
    return BASE_URL;
  } catch (error) {
    console.error('Failed to construct tenant backend URL:', error);
    return BASE_URL;
  }
}

/**
 * Get custom domain header if on a custom domain
 * Backend uses this header to identify the tenant for custom domains
 */
function getCustomDomainHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  
  if (isCustomDomain()) {
    return { 'X-Custom-Domain': window.location.hostname };
  }
  
  return {};
}

// ============ Type Definitions ============

// Auth Types
export interface TenantUserSignupRequest {
  name: string;
  email: string;
  password: string;
  role: 'employee' | 'manager' | 'recruiter' | 'applicant';
}

export interface TenantUserSignupInvitedRequest {
  token: string;
  password: string;
}

export interface TenantUserSignupResponse {
  access_token: string;
  refresh_token: string;
}

export interface TenantUserLoginRequest {
  email: string;
  password: string;
}

export interface TenantUserLoginResponse {
  access_token: string;
  refresh_token: string;
}

export interface TenantUserRefreshRequest {
  refresh_token: string;
}

export interface TenantUserRefreshResponse {
  access_token: string;
  refresh_token: string;
}

// ============ Error Handling ============
export class TenantAPIError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: any,
    public isTokenExpired: boolean = false
  ) {
    super(message);
    this.name = 'TenantAPIError';
  }
}

// ============ Utility Functions ============

// Decode JWT token (client-side only - for extracting payload, NOT for validation)
function decodeJWT(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
}

// Extract user data from JWT token
export function extractUserDataFromToken(accessToken: string): {
  userId: string;
  email: string;
  role: string;
} | null {
  const payload = decodeJWT(accessToken);
  if (!payload) return null;

  return {
    userId: payload.sub || '',
    email: payload.email || '',
    role: payload.role || '',
  };
}

// Get tenant subdomain from current URL
function getTenantSubdomain(): string | null {
  if (typeof window === 'undefined') return null;

  const hostname = window.location.hostname;

  // For custom domains, return null - tenant will be identified via X-Custom-Domain header
  if (isCustomDomain()) {
    return null;
  }

  // For localhost testing: company.localhost
  if (hostname.includes('localhost')) {
    const parts = hostname.split('.');
    if (parts.length >= 2) {
      return parts[0]; // Return 'company' from 'company.localhost'
    }
    return null;
  }

  // For production: company.workzone.tech (or whatever PLATFORM_DOMAIN is set to)
  const parts = hostname.split('.');
  const platformParts = PLATFORM_DOMAIN.split('.');
  
  // Hostname should have more parts than the platform domain
  // e.g., company.workzone.tech (3 parts) > workzone.tech (2 parts)
  if (parts.length > platformParts.length) {
    return parts[0]; // Return 'company' from 'company.workzone.tech'
  }

  return null;
}

// Token management for tenant users
const getTenantTokens = () => {
  if (typeof window === 'undefined') return { accessToken: null, refreshToken: null };
  return {
    accessToken: localStorage.getItem('tenant_access_token'),
    refreshToken: localStorage.getItem('tenant_refresh_token'),
  };
};

const setTenantTokens = (accessToken: string, refreshToken: string) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('tenant_access_token', accessToken);
  localStorage.setItem('tenant_refresh_token', refreshToken);
};

const clearTenantTokens = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('tenant_access_token');
  localStorage.removeItem('tenant_refresh_token');
  localStorage.removeItem('tenant_user_role');
};

// Handle response errors
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`;
    let errorDetails = null;
    let isTokenExpired = false;

    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorData.message || errorMessage;
      errorDetails = errorData;

      // Check if it's a token expiration error
      isTokenExpired =
        response.status === 401 &&
        (errorMessage.toLowerCase().includes('token') ||
          errorMessage.toLowerCase().includes('unauthorized') ||
          errorMessage.toLowerCase().includes('expired'));
    } catch {
      errorMessage = response.statusText || errorMessage;
      isTokenExpired = response.status === 401;
    }

    throw new TenantAPIError(response.status, errorMessage, errorDetails, isTokenExpired);
  }

  return response.json();
}

// Refresh tenant access token
let tenantRefreshPromise: Promise<string> | null = null;

async function refreshTenantAccessToken(): Promise<string> {
  const { refreshToken } = getTenantTokens();

  if (!refreshToken) {
    throw new TenantAPIError(401, 'No refresh token available', null, true);
  }

  try {
    const response = await fetch(`${getTenantBackendUrl()}/api/tenant/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getCustomDomainHeader(), // Add custom domain header if on custom domain
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      clearTenantTokens();
      throw new TenantAPIError(401, 'Failed to refresh token', null, true);
    }

    const data: TenantUserRefreshResponse = await response.json();
    setTenantTokens(data.access_token, data.refresh_token);

    return data.access_token;
  } catch (error) {
    clearTenantTokens();
    throw new TenantAPIError(401, 'Token refresh failed', null, true);
  }
}

// Generic API request function for tenant routes
async function tenantApiRequest<T>(
  url: string,
  options: RequestInit,
  retries: number = 1,
  requiresAuth: boolean = false
): Promise<T> {
  let lastError: Error;
  let currentAccessToken: string | null = null;

  // Get access token if authentication is required
  if (requiresAuth) {
    const { accessToken } = getTenantTokens();
    currentAccessToken = accessToken;
  }

  for (let i = 0; i <= retries; i++) {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...getCustomDomainHeader(), // Add custom domain header if on custom domain
        ...(options.headers as Record<string, string>),
      };

      // Add authorization header if token is available
      if (currentAccessToken) {
        headers['Authorization'] = `Bearer ${currentAccessToken}`;
      }

      const response = await fetch(url, {
        ...options,
        headers,
      });

      return await handleResponse<T>(response);
    } catch (error) {
      lastError = error as Error;

      // Handle token expiration with automatic refresh
      if (error instanceof TenantAPIError && error.isTokenExpired && requiresAuth && i === 0) {
        try {
          // Use shared refresh promise to avoid multiple concurrent refresh requests
          if (!tenantRefreshPromise) {
            tenantRefreshPromise = refreshTenantAccessToken();
          }

          currentAccessToken = await tenantRefreshPromise;
          tenantRefreshPromise = null;

          // Retry the request with new token
          continue;
        } catch (refreshError) {
          tenantRefreshPromise = null;
          throw error;
        }
      }

      // Don't retry on client errors (4xx) except for token expiration
      if (error instanceof TenantAPIError && error.status >= 400 && error.status < 500 && !error.isTokenExpired) {
        throw error;
      }

      // Don't retry on the last attempt
      if (i === retries) {
        break;
      }

      // Wait before retrying (exponential backoff)
      await new Promise((resolve) => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }

  // Handle network errors
  if (lastError!.name === 'TypeError' || lastError!.message.includes('fetch')) {
    throw new TenantAPIError(0, 'Network error. Please check your internet connection and try again.');
  }

  throw lastError!;
}

// ============ Tenant Auth API ============
export const tenantAuthAPI = {
  /**
   * Signup for tenant user (requires invitation for certain roles)
   */
  async signup(data: TenantUserSignupRequest): Promise<TenantUserSignupResponse> {
    return tenantApiRequest<TenantUserSignupResponse>(`${getTenantBackendUrl()}/api/tenant/auth/signup`, {
      method: 'POST',
      body: JSON.stringify(data),
    }, 2, false);
  },

  /**
   * Signup with invitation token
   */
  async signupInvited(data: TenantUserSignupInvitedRequest): Promise<TenantUserSignupResponse> {
    return tenantApiRequest<TenantUserSignupResponse>(`${getTenantBackendUrl()}/api/tenant/auth/signup/invited`, {
      method: 'POST',
      body: JSON.stringify(data),
    }, 2, false);
  },

  /**
   * Login for tenant user
   */
  async login(data: TenantUserLoginRequest): Promise<TenantUserLoginResponse> {
    return tenantApiRequest<TenantUserLoginResponse>(`${getTenantBackendUrl()}/api/tenant/auth/login`, {
      method: 'POST',
      body: JSON.stringify(data),
    }, 2, false);
  },

  /**
   * Refresh tenant user access token
   */
  async refreshToken(): Promise<TenantUserRefreshResponse> {
    const { refreshToken } = getTenantTokens();

    if (!refreshToken) {
      throw new TenantAPIError(401, 'No refresh token available', null, true);
    }

    return tenantApiRequest<TenantUserRefreshResponse>(`${getTenantBackendUrl()}/api/tenant/auth/refresh`, {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    }, 1, false);
  },

  /**
   * Logout tenant user
   */
  async logout(): Promise<void> {
    try {
      // If there's a logout endpoint, call it here
      // await tenantApiRequest(`${BASE_URL}/api/tenant/auth/logout`, {
      //   method: 'POST',
      // }, 1, true);
    } catch (error) {
      console.warn('Logout request failed:', error);
    } finally {
      clearTenantTokens();
    }
  },

  // Utility methods
  isAuthenticated(): boolean {
    const { accessToken } = getTenantTokens();
    return !!accessToken;
  },

  getTokens() {
    return getTenantTokens();
  },

  clearTokens() {
    clearTenantTokens();
  },

  setTokens(accessToken: string, refreshToken: string) {
    setTenantTokens(accessToken, refreshToken);
  },
};

// ============ Tenant Config Types ============
export interface TenantConfig {
  tenant_id: string;
  brand_name: string;
  logo: string | null;
  domain: string | null;
}

// ============ Tenant Config API ============
export const tenantConfigAPI = {
  /**
   * Get tenant configuration (brand name, logo, theme, etc.)
   */
  async getConfig(): Promise<TenantConfig> {
    return tenantApiRequest<TenantConfig>(`${getTenantBackendUrl()}/api/tenant/config`, {
      method: 'GET',
    }, 2, false);
  },
};

// ============ Tenant Test API ============
export const tenantTestAPI = {
  /**
   * Test endpoint to verify tenant detection
   */
  async test(): Promise<string> {
    return tenantApiRequest<string>(`${getTenantBackendUrl()}/api/tenant/test`, {
      method: 'GET',
    }, 1, false);
  },
};

// ============ Tenant Job Types ============
export interface CreateJobRequest {
  title: string; // max 50 chars
  description: string;
  department: string; // max 50 chars
  location: string; // max 25 chars
}

export interface UpdateJobRequest {
  title?: string; // max 50 chars
  description?: string;
  department?: string; // max 50 chars
  location?: string; // max 25 chars
  is_open?: boolean;
}

export interface JobResponse {
  id: string;
  title: string;
  description: string;
  department: string;
  location: string;
  posted_by: string;
  is_open: boolean;
  created_at: string;
  updated_at: string;
}

export interface ListJobsRequest {
  search?: string;
  department?: string;
  location?: string;
  is_open?: boolean;
}

// AI JD Builder Types
export interface JDBuilderPrompt {
  prompt: string;
  company_name?: string;
  tone?: string; // default: "professional and enthusiastic"
}

export interface GeneratedJD {
  markdown_text: string;
}

// ============ Tenant Job API ============
export const tenantJobAPI = {
  /**
   * Create a new job posting (requires RECRUITER role)
   */
  async createJob(data: CreateJobRequest): Promise<JobResponse> {
    return tenantApiRequest<JobResponse>(`${getTenantBackendUrl()}/api/tenant/jobs`, {
      method: 'POST',
      body: JSON.stringify(data),
    }, 2, true);
  },

  /**
   * List all job postings with optional filters
   */
  async listJobs(params?: ListJobsRequest): Promise<JobResponse[]> {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.department) queryParams.append('department', params.department);
    if (params?.location) queryParams.append('location', params.location);
    if (params?.is_open !== undefined) queryParams.append('is_open', String(params.is_open));

    const url = queryParams.toString() 
      ? `${getTenantBackendUrl()}/api/tenant/jobs?${queryParams.toString()}`
      : `${getTenantBackendUrl()}/api/tenant/jobs`;

    return tenantApiRequest<JobResponse[]>(url, {
      method: 'GET',
    }, 2, false);
  },

  /**
   * Get a specific job by ID
   */
  async getJob(jobId: string): Promise<JobResponse> {
    return tenantApiRequest<JobResponse>(`${getTenantBackendUrl()}/api/tenant/jobs/${jobId}`, {
      method: 'GET',
    }, 2, false);
  },

  /**
   * Update a job posting (requires RECRUITER role and must be creator)
   */
  async updateJob(jobId: string, data: UpdateJobRequest): Promise<JobResponse> {
    return tenantApiRequest<JobResponse>(`${getTenantBackendUrl()}/api/tenant/jobs/${jobId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }, 2, true);
  },

  /**
   * Delete a job posting (requires RECRUITER role and must be creator)
   */
  async deleteJob(jobId: string): Promise<void> {
    return tenantApiRequest<void>(`${getTenantBackendUrl()}/api/tenant/jobs/${jobId}`, {
      method: 'DELETE',
    }, 2, true);
  },

  /**
   * Close a job posting (requires RECRUITER role and must be creator)
   * Sets is_open to false to stop accepting new applications
   */
  async closeJob(jobId: string): Promise<JobResponse> {
    return tenantApiRequest<JobResponse>(`${getTenantBackendUrl()}/api/tenant/jobs/${jobId}/close`, {
      method: 'POST',
    }, 2, true);
  },

  /**
   * Reopen a job posting (requires RECRUITER role and must be creator)
   * Sets is_open to true to resume accepting applications
   */
  async reopenJob(jobId: string): Promise<JobResponse> {
    return tenantApiRequest<JobResponse>(`${getTenantBackendUrl()}/api/tenant/jobs/${jobId}`, {
      method: 'PATCH',
      body: JSON.stringify({ is_open: true }),
    }, 2, true);
  },

  /**
   * AI-powered job description enhancer
   * Converts simple prompts into professional, comprehensive job descriptions
   * @param prompt - Job description generation request
   */
  async enhanceJobDescription(prompt: JDBuilderPrompt): Promise<GeneratedJD> {
    return tenantApiRequest<GeneratedJD>(`${getTenantBackendUrl()}/api/tenant/jobs/ai/enhance-description`, {
      method: 'POST',
      body: JSON.stringify(prompt),
    }, 2, false);
  },
};

// ============ APPLICATION API ============

/**
 * Application Status Enum
 * Represents the lifecycle of a job application
 */
export enum ApplicationStatus {
  PENDING = "pending",
  SHORTLISTED = "shortlisted",
  AI_INTERVIEW_COMPLETED = "ai_interview_completed",
  HUMAN_INTERVIEW_SCHEDULED = "human_interview_scheduled",
  HUMAN_INTERVIEW_COMPLETED = "human_interview_completed",
  OFFERED = "offered",
  REJECTED = "rejected",
  HIRED = "hired",
  WITHDRAWN = "withdrawn",
}

/**
 * Application Response
 */
export interface ApplicationResponse {
  id: string;
  job_id: string;
  user_id: string;
  status: ApplicationStatus;
  resume: string; // S3/Cloud storage path
  applied_on: string; // ISO datetime string
}

/**
 * Application API
 * Handles job application submission and management
 */
export const tenantApplicationAPI = {
  /**
   * Submit a job application with resume upload
   * Requires APPLICANT or EMPLOYEE role
   * @param jobId - UUID of the job to apply for
   * @param resume - Resume file (PDF, DOC, DOCX)
   */
  async applyToJob(jobId: string, resume: File): Promise<ApplicationResponse> {
    const formData = new FormData();
    formData.append('resume', resume);

    // Note: Don't set Content-Type header - browser will set it with boundary for multipart/form-data
    const tokens = getTenantTokens();
    if (!tokens?.accessToken) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${getTenantBackendUrl()}/api/tenant/jobs/${jobId}/apply`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokens.accessToken}`,
        ...getCustomDomainHeader(), // Add custom domain header if on custom domain
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to apply for job' }));
      throw new Error(error.detail || 'Failed to apply for job');
    }

    return response.json();
  },

  /**
   * Get current user's applications
   * Requires APPLICANT or EMPLOYEE role
   * @returns List of user's job applications
   */
  async myApplications(): Promise<ApplicationResponse[]> {
    return tenantApiRequest<ApplicationResponse[]>(
      `${getTenantBackendUrl()}/api/tenant/applications`,
      { method: 'GET' },
      2,
      true
    );
  },

  /**
   * List all applications for a specific job
   * Requires RECRUITER role
   * @param jobId - UUID of the job
   */
  async listJobApplications(jobId: string): Promise<ApplicationResponse[]> {
    return tenantApiRequest<ApplicationResponse[]>(
      `${getTenantBackendUrl()}/api/tenant/jobs/${jobId}/applications`,
      { method: 'GET' },
      2,
      true
    );
  },

  /**
   * Get details of a specific application
   * APPLICANT/EMPLOYEE: Can view own applications
   * RECRUITER: Can view all applications for their jobs
   * @param applicationId - UUID of the application
   */
  async getApplication(applicationId: string): Promise<ApplicationResponse> {
    return tenantApiRequest<ApplicationResponse>(
      `${getTenantBackendUrl()}/api/tenant/applications/${applicationId}`,
      { method: 'GET' },
      2,
      true
    );
  },

  /**
   * Withdraw a submitted application
   * Requires APPLICANT or EMPLOYEE role (own application only)
   * @param applicationId - UUID of the application to withdraw
   */
  async withdrawApplication(applicationId: string): Promise<ApplicationResponse> {
    return tenantApiRequest<ApplicationResponse>(
      `${getTenantBackendUrl()}/api/tenant/applications/${applicationId}/withdraw`,
      { method: 'DELETE' },
      2,
      true
    );
  },
};

// ============ AI INTERVIEW API ============

/**
 * AI Interview Session Response
 */
export interface AIInterviewSessionResponse {
  id: string;
  application_id: string;
  score?: number;
  report?: string;
  created_at: string;
  completed_at?: string;
}

/**
 * Create AI Interview Session Request
 */
export interface CreateAIInterviewRequest {
  application_id: string;
}

export const tenantAIInterviewAPI = {
  /**
   * Create a new AI interview session
   * @param applicationId - UUID of the job application
   * @param jobId - UUID of the job
   */
  async createSession(applicationId: string): Promise<AIInterviewSessionResponse> {
    const queryParams = new URLSearchParams({
      application_id: applicationId,
    });

    return tenantApiRequest<AIInterviewSessionResponse>(
      `${getTenantBackendUrl()}/api/tenant/ai-interview?${queryParams.toString()}`,
      { method: 'POST' },
      2,
      true
    );
  },

  /**
   * Get WebSocket URL for AI interview
   * @param interviewId - UUID of the interview session
   */
  getWebSocketUrl(interviewId: string): string {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const backendUrl = getTenantBackendUrl().replace(/^https?:/, wsProtocol);
    return `${backendUrl}/api/tenant/ai-interview/ws/${interviewId}`;
  },
};

// ============ Applicant Profile API ============

/**
 * Applicant Profile Response
 */
export interface ApplicantProfileResponse {
  user_id: string;
  applicant_id: string;
  email: string;
  name: string;
}

export const tenantApplicantAPI = {
  /**
   * Get current applicant's profile (requires APPLICANT role)
   */
  async getProfile(): Promise<ApplicantProfileResponse> {
    return tenantApiRequest<ApplicantProfileResponse>(
      `${getTenantBackendUrl()}/api/tenant/applicant/me`,
      { method: 'GET' },
      2,
      true
    );
  },
};

// ============ Recruiter Profile API ============

/**
 * Recruiter Profile Response
 */
export interface RecruiterProfileResponse {
  user_id: string;
  recruiter_id: string;
  email: string;
  name: string;
}

export const tenantRecruiterAPI = {
  /**
   * Get current recruiter's profile (requires RECRUITER role)
   */
  async getProfile(): Promise<RecruiterProfileResponse> {
    return tenantApiRequest<RecruiterProfileResponse>(
      `${getTenantBackendUrl()}/api/tenant/recruiter/me`,
      { method: 'GET' },
      2,
      true
    );
  },
};

// ============ Manager Profile API ============

/**
 * Manager Profile Response
 */
export interface ManagerProfileResponse {
  user_id: string;
  manager_id: string;
  email: string;
  name: string;
  title?: string;
}

// Alias for backward compatibility
export type { ManagerProfileResponse as ManagerProfile };

export const tenantManagerAPI = {
  /**
   * Get current manager's profile (requires MANAGER role)
   */
  async getProfile(): Promise<ManagerProfileResponse> {
    return tenantApiRequest<ManagerProfileResponse>(
      `${getTenantBackendUrl()}/api/tenant/manager/me`,
      { method: 'GET' },
      2,
      true
    );
  },
};

// ============ Employee Profile API ============

/**
 * Employee Profile Response
 */
export interface EmployeeProfileResponse {
  user_id: string;
  employee_id: string;
  email: string;
  name: string;
  title?: string;
  manager_id?: string;
  manager_name?: string;
}

/**
 * Employee Info (for helpdesk)
 */
export interface EmployeeInfo {
  name: string;
  title: string;
  granted: Record<string, number>;
  used: Record<string, number>;
  balance: Record<string, number>;
}

/**
 * Helpdesk Query Request
 */
export interface HelpdeskQueryRequest {
  query: string;
  chat_id?: string;
}

/**
 * Helpdesk Response
 */
export interface HelpdeskResponse {
  answer: string;
  chat_id: string;
  sources: Array<Record<string, unknown>>;
  suggestions: string[];
  current_topic?: string;
  confidence: number;
}

export const tenantEmployeeAPI = {
  /**
   * Get current employee's profile (requires EMPLOYEE role)
   */
  async getProfile(): Promise<EmployeeProfileResponse> {
    return tenantApiRequest<EmployeeProfileResponse>(
      `${getTenantBackendUrl()}/api/tenant/employee/me`,
      { method: 'GET' },
      2,
      true
    );
  },

  /**
   * Smart helpdesk - AI-powered assistant for employee queries
   * Can answer questions about policies, leave balance, company info, etc.
   * @param query - The question/query from the employee
   * @param chatId - Optional chat session ID for conversation continuity
   */
  async helpdesk(data: HelpdeskQueryRequest): Promise<HelpdeskResponse> {
    return tenantApiRequest<HelpdeskResponse>(
      `${getTenantBackendUrl()}/api/tenant/employee/helpdesk`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      2,
      true
    );
  },
};

// ============================================
// Leave Management Types
// ============================================

export enum LeaveRequestType {
  CASUAL = 'casual',
  SICK = 'sick',
  EARNED = 'earned',
  MATERNITY = 'maternity',
  PATERNITY = 'paternity',
}

export enum LeaveRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

export interface ApplyLeaveRequest {
  leave_type: LeaveRequestType;
  start_date: string; // ISO date string YYYY-MM-DD
  end_date: string; // ISO date string YYYY-MM-DD
  reason: string;
}

export interface RejectLeaveRequest {
  rejection_reason: string;
}

export interface LeaveRequestResponse {
  id: string;
  employee_id: string;
  manager_id: string | null;
  leave_type: LeaveRequestType;
  status: LeaveRequestStatus;
  start_date: string;
  end_date: string;
  reason: string;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeaveBalanceResponse {
  employee_id: string;
  casual: number;
  sick: number;
  earned: number;
  maternity: number;
  paternity: number;
  total_available: number;
  total_used: number;
}

// ============================================
// Tenant Leave API (Employee & Manager)
// ============================================

export const tenantLeaveAPI = {
  /**
   * Apply for leave (requires EMPLOYEE role)
   */
  async applyLeave(data: ApplyLeaveRequest): Promise<LeaveRequestResponse> {
    return tenantApiRequest<LeaveRequestResponse>(
      `${getTenantBackendUrl()}/api/tenant/leaves/apply`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      2,
      true
    );
  },

  /**
   * Get current employee's leave requests (requires EMPLOYEE role)
   */
  async getMyLeaveRequests(): Promise<LeaveRequestResponse[]> {
    return tenantApiRequest<LeaveRequestResponse[]>(
      `${getTenantBackendUrl()}/api/tenant/leaves/`,
      { method: 'GET' },
      2,
      true
    );
  },

  /**
   * Get current employee's leave balance (requires EMPLOYEE role)
   */
  async getLeaveBalance(): Promise<LeaveBalanceResponse> {
    return tenantApiRequest<LeaveBalanceResponse>(
      `${getTenantBackendUrl()}/api/tenant/leaves/balance`,
      { method: 'GET' },
      2,
      true
    );
  },

  /**
   * Get pending leave requests for approval (requires MANAGER role)
   */
  async getPendingApprovals(): Promise<LeaveRequestResponse[]> {
    return tenantApiRequest<LeaveRequestResponse[]>(
      `${getTenantBackendUrl()}/api/tenant/leaves/pending-requests`,
      { method: 'GET' },
      2,
      true
    );
  },

  /**
   * Approve a leave request (requires MANAGER role)
   */
  async approveLeave(leaveRequestId: string): Promise<LeaveRequestResponse> {
    return tenantApiRequest<LeaveRequestResponse>(
      `${getTenantBackendUrl()}/api/tenant/leaves/${leaveRequestId}/approve`,
      { method: 'POST' },
      2,
      true
    );
  },

  /**
   * Reject a leave request (requires MANAGER role)
   */
  async rejectLeave(leaveRequestId: string, data: RejectLeaveRequest): Promise<LeaveRequestResponse> {
    return tenantApiRequest<LeaveRequestResponse>(
      `${getTenantBackendUrl()}/api/tenant/leaves/${leaveRequestId}/reject`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      2,
      true
    );
  },
};

// Export utility functions for use in other files
export { getTenantSubdomain, getTenantBackendUrl, getTenantTokens, setTenantTokens, clearTenantTokens, isCustomDomain, getCustomDomainHeader };

