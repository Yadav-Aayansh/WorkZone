"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
// import { platformAuthAPI } from "@/lib/api";
import { useRouter } from "next/navigation";

// MOCK VERSION FOR PEER REVIEW - No backend required

export interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  accountStatus: string | null;
  subscriptionStatus: string | null;
  isLoading: boolean;
  isInitialized: boolean;
}

interface AuthContextType extends AuthState {
  login: (tokens: {
    access_token: string;
    refresh_token: string;
    account_status: string;
    subscription_status: string;
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
    isLoading: true,
    isInitialized: false,
  });

  const router = useRouter();
  // Initialize auth state - MOCK version always returns authenticated
  useEffect(() => {
    // Mock authenticated state for peer review
    setAuthState({
      isAuthenticated: true,
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
      accountStatus: "ACTIVE",
      subscriptionStatus: "ACTIVE",
      isLoading: false,
      isInitialized: true,
    });
  }, []);

  const login = useCallback(
    async (tokens: {
      access_token: string;
      refresh_token: string;
      account_status: string;
      subscription_status: string;
    }) => {
      // Store tokens
      localStorage.setItem("access_token", tokens.access_token);
      localStorage.setItem("refresh_token", tokens.refresh_token);
      localStorage.setItem("account_status", tokens.account_status);
      localStorage.setItem("subscription_status", tokens.subscription_status);

      setAuthState({
        isAuthenticated: true,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        accountStatus: tokens.account_status,
        subscriptionStatus: tokens.subscription_status,
        isLoading: false,
        isInitialized: true,
      });
    },
    []
  );

  const logout = useCallback(async () => {
    // Mock logout - no backend call
    console.log("Mock logout - staying authenticated for peer review");
    // Don't actually log out for peer review
  }, []);

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
    // Mock refresh - always succeeds
    return true;
  }, []);

  const redirectAfterAuth = useCallback(
    (accountStatus: string) => {
      switch (accountStatus?.toLowerCase()) {
        case "onboarding":
          router.push("/signup");
          break;
        case "subscription":
          // Redirect directly to payment step (step 3) in signup
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

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  const router = useRouter();

  // MOCK: Return default authenticated state if used outside provider (for peer review)
  if (context === undefined) {
    console.warn(
      "useAuth used outside AuthProvider - returning mock data for peer review"
    );

    return {
      isAuthenticated: true,
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
      accountStatus: "ACTIVE",
      subscriptionStatus: "ACTIVE",
      isLoading: false,
      isInitialized: true,
      login: async () => {},
      logout: async () => {},
      updateStatus: () => {},
      refreshAuth: async () => true,
      redirectAfterAuth: (accountStatus: string) => {
        switch (accountStatus?.toLowerCase()) {
          case "onboarding":
            router.push("/signup");
            break;
          case "subscription":
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
    };
  }

  return context;
}
