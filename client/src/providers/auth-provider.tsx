"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { platformAuthAPI } from "@/lib/api";
import { useRouter } from "next/navigation";

export interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  accountStatus: string | null;
  subscriptionStatus: string | null;
  customDomain: string | null;
  isLoading: boolean;
  isInitialized: boolean;
}

interface AuthContextType extends AuthState {
  login: (tokens: {
    access_token: string;
    refresh_token: string;
    account_status: string;
    subscription_status: string;
    domain?: string | null;
  }) => Promise<void>;
  logout: () => Promise<void>;
  updateStatus: (accountStatus: string, subscriptionStatus: string) => void;
  refreshAuth: () => Promise<boolean>;
  redirectAfterAuth: (accountStatus: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    accessToken: null,
    refreshToken: null,
    accountStatus: null,
    subscriptionStatus: null,
    customDomain: null,
    isLoading: true,
    isInitialized: false,
  });

  const router = useRouter();
  // Initialize auth state and attempt token refresh
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        if (typeof window === "undefined") return;

        const tokens = platformAuthAPI.getTokens();
        const accountStatus = localStorage.getItem("account_status");
        const subscriptionStatus = localStorage.getItem("subscription_status");

        if (!tokens.accessToken) {
          // No tokens found
          if (mounted) {
            setAuthState({
              isAuthenticated: false,
              accessToken: null,
              refreshToken: null,
              accountStatus: null,
              subscriptionStatus: null,
              customDomain: null,
              isLoading: false,
              isInitialized: true,
            });
          }
          return;
        }

        // For now, just trust the stored tokens since refresh endpoint doesn't exist yet
        if (mounted) {
          const customDomain = localStorage.getItem("custom_domain");
          setAuthState({
            isAuthenticated: true,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            accountStatus,
            subscriptionStatus,
            customDomain,
            isLoading: false,
            isInitialized: true,
          });
        }
      } catch (error) {
        console.error("Auth initialization error:", error);

        if (mounted) {
          setAuthState((prev) => ({
            ...prev,
            isLoading: false,
            isInitialized: true,
          }));
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const login = useCallback(
    async (tokens: {
      access_token: string;
      refresh_token: string;
      account_status: string;
      subscription_status: string;
      domain?: string | null;
    }) => {
      // Store tokens
      localStorage.setItem("access_token", tokens.access_token);
      localStorage.setItem("refresh_token", tokens.refresh_token);
      localStorage.setItem("account_status", tokens.account_status);
      localStorage.setItem("subscription_status", tokens.subscription_status);
      if (tokens.domain) {
        localStorage.setItem("custom_domain", tokens.domain);
      } else {
        localStorage.removeItem("custom_domain");
      }

      setAuthState({
        isAuthenticated: true,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        accountStatus: tokens.account_status,
        subscriptionStatus: tokens.subscription_status,
        customDomain: tokens.domain || null,
        isLoading: false,
        isInitialized: true,
      });
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await platformAuthAPI.logout();
    } catch (error) {
      console.error("Logout error:", error);
    }

    localStorage.removeItem("custom_domain");

    setAuthState({
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      accountStatus: null,
      subscriptionStatus: null,
      customDomain: null,
      isLoading: false,
      isInitialized: true,
    });

    // Redirect to login page
    router.push("/login");
  }, [router]);

  const updateStatus = useCallback(
    (accountStatus: string, subscriptionStatus: string) => {
      localStorage.setItem("account_status", accountStatus);
      localStorage.setItem("subscription_status", subscriptionStatus);

      setAuthState((prev) => ({
        ...prev,
        accountStatus,
        subscriptionStatus,
      }));
    },
    []
  );

  const refreshAuth = useCallback(async (): Promise<boolean> => {
    try {
      const refreshResponse = await platformAuthAPI.refreshToken();

      // Update tokens and status in localStorage
      localStorage.setItem("access_token", refreshResponse.access_token);
      localStorage.setItem("refresh_token", refreshResponse.refresh_token);
      localStorage.setItem("account_status", refreshResponse.account_status);
      localStorage.setItem(
        "subscription_status",
        refreshResponse.subscription_status
      );

      setAuthState((prev) => ({
        ...prev,
        accessToken: refreshResponse.access_token,
        refreshToken: refreshResponse.refresh_token,
        accountStatus: refreshResponse.account_status,
        subscriptionStatus: refreshResponse.subscription_status,
      }));

      return true;
    } catch (error) {
      console.error("Token refresh failed:", error);
      await logout();
      return false;
    }
  }, [logout]);

  const redirectAfterAuth = useCallback(
    (accountStatus: string) => {
      switch (accountStatus?.toLowerCase()) {
        case "onboarding":
          // User has created account but not completed workspace onboarding
          // Redirect to step 2 (WorkspaceOnboarding)
          router.push("/signup?step=2");
          break;
        case "subscription":
          // User has completed onboarding but not subscribed
          // Redirect to step 3 (Payment)
          router.push("/signup?step=3");
          break;
        case "active":
          router.push("/dashboard");
          break;
        default:
          router.push("/dashboard");
          break;
      }
    },
    [router]
  );

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        updateStatus,
        refreshAuth,
        redirectAfterAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
