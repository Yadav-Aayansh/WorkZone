export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  account_status: string;
  subscription_status: string;
}

export const tokenManager = {
  setTokens(tokens: AuthTokens): void {
    localStorage.setItem('access_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);
    localStorage.setItem('account_status', tokens.account_status);
    localStorage.setItem('subscription_status', tokens.subscription_status);
  },

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  },

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  },

  getAccountStatus(): string | null {
    return localStorage.getItem('account_status');
  },

  getSubscriptionStatus(): string | null {
    return localStorage.getItem('subscription_status');
  },

  clearTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('account_status');
    localStorage.removeItem('subscription_status');
  },

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  },
};