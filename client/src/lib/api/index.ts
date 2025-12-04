// Platform API exports
export {
  platformAuthAPI,
  platformOnboardingAPI,
  platformSubscriptionAPI,
  platformClientAPI,
  platformWorkspaceAPI,
  PlatformAPIError,
  getPlatformTokens,
  setPlatformTokens,
  clearPlatformTokens,
} from './platform';

export type {
  PlatformSignupRequest,
  PlatformSignupResponse,
  PlatformLoginRequest,
  PlatformLoginResponse,
  PlatformRefreshTokenRequest,
  PlatformRefreshTokenResponse,
  OnboardingRequest,
  OnboardingResponse,
  CreateOrderRequest,
  CreateOrderResponse,
  UpdateOrderRequest,
  UpdateOrderResponse,
  TenantAvailabilityRequest,
  TenantAvailabilityResponse,
  InviteUserRequest,
  InviteUserResponse,
  LeaveTypeConfig,
  LeaveTypesRequest,
  LeaveTypesResponse,
  PolicyDocument,
  PolicyListResponse,
} from './platform';

// Tenant API exports
export {
  tenantAuthAPI,
  tenantConfigAPI,
  tenantTestAPI,
  tenantJobAPI,
  tenantApplicationAPI,
  tenantAIInterviewAPI,
  tenantApplicantAPI,
  tenantRecruiterAPI,
  tenantManagerAPI,
  tenantEmployeeAPI,
  tenantLeaveAPI,
  TenantAPIError,
  getTenantSubdomain,
  getTenantTokens,
  setTenantTokens,
  clearTenantTokens,
  ApplicationStatus,
  LeaveRequestType,
  LeaveRequestStatus,
} from './tenant';

export type {
  TenantUserSignupRequest,
  TenantUserSignupInvitedRequest,
  TenantUserSignupResponse,
  TenantUserLoginRequest,
  TenantUserLoginResponse,
  TenantUserRefreshRequest,
  TenantUserRefreshResponse,
  TenantConfig,
  CreateJobRequest,
  UpdateJobRequest,
  JobResponse,
  ListJobsRequest,
  JDBuilderPrompt,
  GeneratedJD,
  ApplicationResponse,
  AIInterviewSessionResponse,
  CreateAIInterviewRequest,
  ApplicantProfileResponse,
  RecruiterProfileResponse,
  ManagerProfileResponse,
  EmployeeProfileResponse,
  EmployeeInfo,
  HelpdeskQueryRequest,
  HelpdeskResponse,
  ApplyLeaveRequest,
  RejectLeaveRequest,
  LeaveRequestResponse,
  LeaveBalanceResponse,
} from './tenant';

// Backwards compatibility - import for creating combined API
import { platformAuthAPI, platformOnboardingAPI, platformSubscriptionAPI } from './platform';

// Create a combined authAPI that includes onboarding for backwards compatibility
export const authAPI = {
  ...platformAuthAPI,
  onboarding: platformOnboardingAPI.onboard,
};

export { platformOnboardingAPI as onboardingAPI };
export { platformSubscriptionAPI as subscriptionAPI };
