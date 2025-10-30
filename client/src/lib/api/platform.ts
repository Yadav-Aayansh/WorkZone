// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/* eslint-disable */

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

// ============ Platform Type Definitions ============

// Auth Types
export interface PlatformSignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface PlatformSignupResponse {
  access_token: string;
  refresh_token: string;
  account_status: string;
  subscription_status: string;
}

export interface PlatformLoginRequest {
  email: string;
  password: string;
}

export interface PlatformLoginResponse {
  access_token: string;
  refresh_token: string;
  account_status: string;
  subscription_status: string;
}

export interface PlatformRefreshTokenRequest {
  refresh_token: string;
}

export interface PlatformRefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  account_status: string;
  subscription_status: string;
}

// Onboarding Types
export interface OnboardingRequest {
  tenant_id: string;
  brand_name: string;
  logo: File;
}

export interface OnboardingResponse {
  account_status: string;
  subscription_status: string;
}

// Subscription Types
export interface CreateOrderRequest {
  plan: '3_months' | '6_months' | '12_months';
}

export interface CreateOrderResponse {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string | null;
  status: string;
  attempts: number;
  notes: any[];
  created_at: number;
}

export interface UpdateOrderRequest {
  order_id: string;
  payment_id: string;
  signature: string;
}

export interface UpdateOrderResponse {
  account_status: string;
  subscription_status: string;
}

// ============ Error Handling ============
export class PlatformAPIError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: any,
    public isTokenExpired: boolean = false
  ) {
    super(message);
    this.name = 'PlatformAPIError';
  }
}

// ============ Token Management ============
let platformRefreshPromise: Promise<string> | null = null;

const getPlatformTokens = () => {
  if (typeof window === 'undefined') return { accessToken: null, refreshToken: null };
  return {
    accessToken: localStorage.getItem('access_token'),
    refreshToken: localStorage.getItem('refresh_token'),
  };
};

const setPlatformTokens = (accessToken: string, refreshToken: string) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
};

const clearPlatformTokens = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('account_status');
  localStorage.removeItem('subscription_status');
};

// ============ HTTP Utilities ============
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`;
    let errorDetails = null;
    let isTokenExpired = false;

    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorData.message || errorMessage;
      errorDetails = errorData;

      isTokenExpired =
        response.status === 401 &&
        (errorMessage.toLowerCase().includes('token') ||
          errorMessage.toLowerCase().includes('unauthorized') ||
          errorMessage.toLowerCase().includes('expired'));
    } catch {
      errorMessage = response.statusText || errorMessage;
      isTokenExpired = response.status === 401;
    }

    throw new PlatformAPIError(response.status, errorMessage, errorDetails, isTokenExpired);
  }

  return response.json();
}

// Refresh platform access token
async function refreshPlatformAccessToken(): Promise<string> {
  const { refreshToken } = getPlatformTokens();

  if (!refreshToken) {
    throw new PlatformAPIError(401, 'No refresh token available', null, true);
  }

  try {
    const response = await fetch(`${BASE_URL}/api/platform/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      clearPlatformTokens();
      throw new PlatformAPIError(401, 'Failed to refresh token', null, true);
    }

    const data: PlatformRefreshTokenResponse = await response.json();
    setPlatformTokens(data.access_token, data.refresh_token);

    // Also update status in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('account_status', data.account_status);
      localStorage.setItem('subscription_status', data.subscription_status);
    }

    return data.access_token;
  } catch (error) {
    clearPlatformTokens();
    throw new PlatformAPIError(401, 'Token refresh failed', null, true);
  }
}

// Generic API request function for platform routes
async function platformApiRequest<T>(
  url: string,
  options: RequestInit,
  retries: number = 1,
  requiresAuth: boolean = false
): Promise<T> {
  let lastError: Error;
  let currentAccessToken: string | null = null;

  if (requiresAuth) {
    const { accessToken } = getPlatformTokens();
    currentAccessToken = accessToken;
  }

  for (let i = 0; i <= retries; i++) {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
      };

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
      if (error instanceof PlatformAPIError && error.isTokenExpired && requiresAuth && i === 0) {
        try {
          if (!platformRefreshPromise) {
            platformRefreshPromise = refreshPlatformAccessToken();
          }

          currentAccessToken = await platformRefreshPromise;
          platformRefreshPromise = null;

          continue;
        } catch (refreshError) {
          platformRefreshPromise = null;
          throw error;
        }
      }

      if (error instanceof PlatformAPIError && error.status >= 400 && error.status < 500 && !error.isTokenExpired) {
        throw error;
      }

      if (i === retries) {
        break;
      }

      await new Promise((resolve) => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }

  if (lastError!.name === 'TypeError' || lastError!.message.includes('fetch')) {
    throw new PlatformAPIError(0, 'Network error. Please check your internet connection and try again.');
  }

  throw lastError!;
}

// ============ Platform Auth API ============
export const platformAuthAPI = {
  async signup(data: PlatformSignupRequest): Promise<PlatformSignupResponse> {
    return platformApiRequest<PlatformSignupResponse>(`${BASE_URL}/api/platform/auth/signup`, {
      method: 'POST',
      body: JSON.stringify(data),
    }, 2, false);
  },

  async login(data: PlatformLoginRequest): Promise<PlatformLoginResponse> {
    return platformApiRequest<PlatformLoginResponse>(`${BASE_URL}/api/platform/auth/login`, {
      method: 'POST',
      body: JSON.stringify(data),
    }, 2, false);
  },

  async refreshToken(): Promise<PlatformRefreshTokenResponse> {
    const { refreshToken } = getPlatformTokens();

    if (!refreshToken) {
      throw new PlatformAPIError(401, 'No refresh token available', null, true);
    }

    return platformApiRequest<PlatformRefreshTokenResponse>(`${BASE_URL}/api/platform/auth/refresh`, {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    }, 1, false);
  },

  async logout(): Promise<void> {
    try {
      // If there's a logout endpoint, call it here
    } catch (error) {
      console.warn('Logout request failed:', error);
    } finally {
      clearPlatformTokens();
    }
  },

  isAuthenticated(): boolean {
    const { accessToken } = getPlatformTokens();
    return !!accessToken;
  },

  getTokens() {
    return getPlatformTokens();
  },

  clearTokens() {
    clearPlatformTokens();
  },
};

// ============ Platform Onboarding API ============
export const platformOnboardingAPI = {
  async onboard(data: OnboardingRequest): Promise<OnboardingResponse> {
    const formData = new FormData();
    formData.append('tenant_id', data.tenant_id);
    formData.append('brand_name', data.brand_name);
    formData.append('logo', data.logo);

    let lastError: Error;
    let currentAccessToken = getPlatformTokens().accessToken;

    for (let i = 0; i <= 2; i++) {
      try {
        const headers: Record<string, string> = {};

        if (currentAccessToken) {
          headers['Authorization'] = `Bearer ${currentAccessToken}`;
        }

        const response = await fetch(`${BASE_URL}/api/platform/onboarding`, {
          method: 'POST',
          headers,
          body: formData,
        });

        return await handleResponse<OnboardingResponse>(response);
      } catch (error) {
        lastError = error as Error;

        if (error instanceof PlatformAPIError && error.isTokenExpired && i === 0) {
          try {
            if (!platformRefreshPromise) {
              platformRefreshPromise = refreshPlatformAccessToken();
            }

            currentAccessToken = await platformRefreshPromise;
            platformRefreshPromise = null;

            continue;
          } catch (refreshError) {
            platformRefreshPromise = null;
            throw error;
          }
        }

        if (error instanceof PlatformAPIError && error.status >= 400 && error.status < 500 && !error.isTokenExpired) {
          throw error;
        }

        if (i === 2) {
          break;
        }

        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }

    if (lastError!.name === 'TypeError' || lastError!.message.includes('fetch')) {
      throw new PlatformAPIError(0, 'Network error. Please check your internet connection and try again.');
    }

    throw lastError!;
  },
};

// ============ Platform Subscription API ============
export const platformSubscriptionAPI = {
  async createOrder(data: CreateOrderRequest): Promise<CreateOrderResponse> {
    const queryParams = new URLSearchParams({ plan: data.plan });
    return platformApiRequest<CreateOrderResponse>(
      `${BASE_URL}/api/platform/subscription?${queryParams.toString()}`,
      {
        method: 'GET',
      },
      2,
      true
    );
  },

  async updateOrder(data: UpdateOrderRequest): Promise<UpdateOrderResponse> {
    return platformApiRequest<UpdateOrderResponse>(`${BASE_URL}/api/platform/subscription`, {
      method: 'POST',
      body: JSON.stringify(data),
    }, 2, true);
  },
};

// ============ Platform Client API ============
export interface TenantAvailabilityRequest {
  tenant_id: string;
}

export interface TenantAvailabilityResponse {
  available: boolean;
}

export interface InviteUserRequest {
  email: string;
  role: 'employee' | 'manager' | 'recruiter';
  name?: string;
}

export interface InviteUserResponse {
  message: string;
  invitation_token?: string;
}

export const platformClientAPI = {
  /**
   * Check if a tenant_id is available
   */
  async checkTenantAvailability(tenantId: string): Promise<TenantAvailabilityResponse> {
    const queryParams = new URLSearchParams({ tenant_id: tenantId });
    return platformApiRequest<TenantAvailabilityResponse>(
      `${BASE_URL}/api/platform/tenant-availability?${queryParams.toString()}`,
      {
        method: 'GET',
      },
      2,
      false
    );
  },

  /**
   * Invite a user to the tenant organization (requires authentication)
   */
  async inviteUser(data: InviteUserRequest): Promise<InviteUserResponse> {
    return platformApiRequest<InviteUserResponse>(`${BASE_URL}/api/platform/invite`, {
      method: 'POST',
      body: JSON.stringify(data),
    }, 2, true);
  },
};

// Export utility functions
export { getPlatformTokens, setPlatformTokens, clearPlatformTokens };
