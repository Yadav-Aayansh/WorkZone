// Re-export from new API structure for backwards compatibility
export * from './api/index';

// Legacy type aliases for backwards compatibility
export type { PlatformSignupRequest as SignupRequest } from './api/index';
export type { PlatformSignupResponse as SignupResponse } from './api/index';
export type { PlatformLoginRequest as LoginRequest } from './api/index';
export type { PlatformLoginResponse as LoginResponse } from './api/index';
export type { PlatformRefreshTokenRequest as RefreshTokenRequest } from './api/index';
export type { PlatformRefreshTokenResponse as RefreshTokenResponse } from './api/index';
export { PlatformAPIError as APIError } from './api/index';
