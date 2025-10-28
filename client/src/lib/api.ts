const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

// ============ Type Definitions ============
export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface SignupResponse {
  access_token: string;
  refresh_token: string;
  account_status: string;
  subscription_status: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  account_status: string;
  subscription_status: string;
}

export interface OnboardingRequest {
  tenant_id: string;
  brand_name: string;
  logo: File;
}

export interface OnboardingResponse {
  account_status: string;
  subscription_status: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  account_status: string;
  subscription_status: string;
}

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

export class APIError extends Error {
  constructor(
    public status: number, 
    message: string, 
    public details?: any,
    public isTokenExpired: boolean = false
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Token management utilities
let refreshPromise: Promise<string> | null = null;

const getStoredTokens = () => {
  if (typeof window === 'undefined') return { accessToken: null, refreshToken: null };
  return {
    accessToken: localStorage.getItem('access_token'),
    refreshToken: localStorage.getItem('refresh_token')
  };
};

const setStoredTokens = (accessToken: string, refreshToken: string) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
};

const clearStoredTokens = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('account_status');
  localStorage.removeItem('subscription_status');
};

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
      isTokenExpired = response.status === 401 && 
        (errorMessage.toLowerCase().includes('token') || 
         errorMessage.toLowerCase().includes('unauthorized') ||
         errorMessage.toLowerCase().includes('expired'));
    } catch {
      // If we can't parse the error as JSON, use the status text
      errorMessage = response.statusText || errorMessage;
      isTokenExpired = response.status === 401;
    }
    
    throw new APIError(response.status, errorMessage, errorDetails, isTokenExpired);
  }
  
  return response.json();
}

// Refresh access token using refresh token
async function refreshAccessToken(): Promise<string> {
  const { refreshToken } = getStoredTokens();
  
  if (!refreshToken) {
    throw new APIError(401, 'No refresh token available', null, true);
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
      clearStoredTokens();
      throw new APIError(401, 'Failed to refresh token', null, true);
    }
    
    const data: RefreshTokenResponse = await response.json();
    setStoredTokens(data.access_token, data.refresh_token);
    
    // Also update status in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('account_status', data.account_status);
      localStorage.setItem('subscription_status', data.subscription_status);
    }
    
    return data.access_token;
  } catch (error) {
    clearStoredTokens();
    throw new APIError(401, 'Token refresh failed', null, true);
  }
}

async function apiRequest<T>(
  url: string, 
  options: RequestInit, 
  retries: number = 1,
  requiresAuth: boolean = false
): Promise<T> {
  let lastError: Error;
  let currentAccessToken: string | null = null;
  
  // Get access token if authentication is required
  if (requiresAuth) {
    const { accessToken } = getStoredTokens();
    currentAccessToken = accessToken;
  }
  
  for (let i = 0; i <= retries; i++) {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers as Record<string, string>,
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
      if (error instanceof APIError && error.isTokenExpired && requiresAuth && i === 0) {
        try {
          // Use shared refresh promise to avoid multiple concurrent refresh requests
          if (!refreshPromise) {
            refreshPromise = refreshAccessToken();
          }
          
          currentAccessToken = await refreshPromise;
          refreshPromise = null;
          
          // Retry the request with new token
          continue;
        } catch (refreshError) {
          refreshPromise = null;
          // If refresh fails, throw the original error
          throw error;
        }
      }
      
      // Don't retry on client errors (4xx) except for token expiration
      if (error instanceof APIError && error.status >= 400 && error.status < 500 && !error.isTokenExpired) {
        throw error;
      }
      
      // Don't retry on the last attempt
      if (i === retries) {
        break;
      }
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
  
  // Handle network errors
  if (lastError!.name === 'TypeError' || lastError!.message.includes('fetch')) {
    throw new APIError(0, 'Network error. Please check your internet connection and try again.');
  }
  
  throw lastError!;
}

export const authAPI = {
  async signup(data: SignupRequest): Promise<SignupResponse> {
    return apiRequest<SignupResponse>(`${BASE_URL}/api/platform/auth/signup`, {
      method: 'POST',
      body: JSON.stringify(data),
    }, 2, false);
  },

  async login(data: LoginRequest): Promise<LoginResponse> {
    return apiRequest<LoginResponse>(`${BASE_URL}/api/platform/auth/login`, {
      method: 'POST',
      body: JSON.stringify(data),
    }, 2, false);
  },

  async onboarding(data: OnboardingRequest): Promise<OnboardingResponse> {
    const formData = new FormData();
    formData.append('tenant_id', data.tenant_id);
    formData.append('brand_name', data.brand_name);
    formData.append('logo', data.logo);

    // Handle FormData requests with authentication and retry logic
    let lastError: Error;
    let currentAccessToken = getStoredTokens().accessToken;
    
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
        
        // Handle token expiration with automatic refresh
        if (error instanceof APIError && error.isTokenExpired && i === 0) {
          try {
            if (!refreshPromise) {
              refreshPromise = refreshAccessToken();
            }
            
            currentAccessToken = await refreshPromise;
            refreshPromise = null;
            
            // Retry the request with new token
            continue;
          } catch (refreshError) {
            refreshPromise = null;
            throw error;
          }
        }
        
        // Don't retry on client errors (4xx) except for token expiration
        if (error instanceof APIError && error.status >= 400 && error.status < 500 && !error.isTokenExpired) {
          throw error;
        }
        
        // Don't retry on the last attempt
        if (i === 2) {
          break;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
    
    // Handle network errors
    if (lastError!.name === 'TypeError' || lastError!.message.includes('fetch')) {
      throw new APIError(0, 'Network error. Please check your internet connection and try again.');
    }
    
    throw lastError!;
  },

  async refreshToken(): Promise<RefreshTokenResponse> {
    const { refreshToken } = getStoredTokens();
    
    if (!refreshToken) {
      throw new APIError(401, 'No refresh token available', null, true);
    }
    
    return apiRequest<RefreshTokenResponse>(`${BASE_URL}/api/platform/auth/refresh`, {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    }, 1, false);
  },

  async logout(): Promise<void> {
    try {
      // If there's a logout endpoint, call it here
      // await apiRequest(`${BASE_URL}/api/platform/auth/logout`, {
      //   method: 'POST',
      // }, 1, true);
    } catch (error) {
      // Even if logout fails, we should clear local tokens
      console.warn('Logout request failed:', error);
    } finally {
      clearStoredTokens();
    }
  },

  // Utility methods
  isAuthenticated(): boolean {
    const { accessToken } = getStoredTokens();
    return !!accessToken;
  },

  getTokens() {
    return getStoredTokens();
  },

  clearTokens() {
    clearStoredTokens();
  }
};

export const subscriptionAPI = {
  async createOrder(data: CreateOrderRequest): Promise<CreateOrderResponse> {
    // GET request with query parameters
    const queryParams = new URLSearchParams({ plan: data.plan });
    return apiRequest<CreateOrderResponse>(
      `${BASE_URL}/api/platform/subscription?${queryParams.toString()}`, 
      {
        method: 'GET',
      }, 
      2, 
      true
    );
  },

  async updateOrder(data: UpdateOrderRequest): Promise<UpdateOrderResponse> {
    return apiRequest<UpdateOrderResponse>(`${BASE_URL}/api/platform/subscription`, {
      method: 'POST',
      body: JSON.stringify(data),
    }, 2, true);
  }
};

// APIError is already exported above