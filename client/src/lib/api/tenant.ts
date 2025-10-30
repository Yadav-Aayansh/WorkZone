// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/* eslint-disable */

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

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

  // For localhost testing: company.localhost
  if (hostname.includes('localhost')) {
    const parts = hostname.split('.');
    if (parts.length >= 2) {
      return parts[0]; // Return 'company' from 'company.localhost'
    }
    return null;
  }

  // For production: company.workzone.tech
  const parts = hostname.split('.');
  if (parts.length >= 3) {
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
    const response = await fetch(`${BASE_URL}/api/tenant/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
    return tenantApiRequest<TenantUserSignupResponse>(`${BASE_URL}/api/tenant/auth/signup`, {
      method: 'POST',
      body: JSON.stringify(data),
    }, 2, false);
  },

  /**
   * Signup with invitation token
   */
  async signupInvited(data: TenantUserSignupInvitedRequest): Promise<TenantUserSignupResponse> {
    return tenantApiRequest<TenantUserSignupResponse>(`${BASE_URL}/api/tenant/auth/signup/invited`, {
      method: 'POST',
      body: JSON.stringify(data),
    }, 2, false);
  },

  /**
   * Login for tenant user
   */
  async login(data: TenantUserLoginRequest): Promise<TenantUserLoginResponse> {
    return tenantApiRequest<TenantUserLoginResponse>(`${BASE_URL}/api/tenant/auth/login`, {
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

    return tenantApiRequest<TenantUserRefreshResponse>(`${BASE_URL}/api/tenant/auth/refresh`, {
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

// ============ Tenant Test API ============
export const tenantTestAPI = {
  /**
   * Test endpoint to verify tenant detection
   */
  async test(): Promise<string> {
    return tenantApiRequest<string>(`${BASE_URL}/api/tenant/test`, {
      method: 'GET',
    }, 1, false);
  },
};

// Export utility functions for use in other files
export { getTenantSubdomain, getTenantTokens, setTenantTokens, clearTenantTokens };

