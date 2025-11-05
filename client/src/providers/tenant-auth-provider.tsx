"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
// import { tenantAuthAPI } from "@/lib/api";
import { useRouter } from "next/navigation";

// MOCK VERSION FOR PEER REVIEW - No backend required

// Tenant auth state interface
export interface TenantAuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  userRole: string | null;
  userId: string | null;
  isLoading: boolean;
  isInitialized: boolean;
}

// Tenant auth context type
interface TenantAuthContextType extends TenantAuthState {
  login: (tokens: {
    access_token: string;
    refresh_token: string;
    role?: string;
    user_id?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<boolean>;
  redirectAfterAuth: (role: string) => void;
}

const TenantAuthContext = createContext<TenantAuthContextType | undefined>(
  undefined
);

interface TenantAuthProviderProps {
  children: React.ReactNode;
}

/**
 * TenantAuthProvider - Manages tenant user authentication
 *
 * Responsibilities:
 * - Manage tenant user authentication state
 * - Store tenant-specific tokens (separate from platform tokens)
 * - Handle token refresh
 * - Role-based redirects
 */
export function TenantAuthProvider({ children }: TenantAuthProviderProps) {
  const [authState, setAuthState] = useState<TenantAuthState>({
    isAuthenticated: false,
    accessToken: null,
    refreshToken: null,
    userRole: null,
    userId: null,
    isLoading: true,
    isInitialized: false,
  });

  const router = useRouter();

  // Initialize auth state - MOCK version always returns authenticated
  useEffect(() => {
    // Mock authenticated state for peer review as recruiter
    setAuthState({
      isAuthenticated: true,
      accessToken: "mock-tenant-access-token",
      refreshToken: "mock-tenant-refresh-token",
      userRole: "recruiter", // Default role for demo
      userId: "mock-user-123",
      isLoading: false,
      isInitialized: true,
    });
  }, []);

  const login = useCallback(
    async (tokens: {
      access_token: string;
      refresh_token: string;
      role?: string;
      user_id?: string;
    }) => {
      // Mock login - just log
      console.log("Mock tenant login", tokens);
    },
    []
  );

  const logout = useCallback(async () => {
    // Mock logout - no backend call, stay authenticated
    console.log("Mock tenant logout - staying authenticated for peer review");
  }, []);

  const refreshAuth = useCallback(async (): Promise<boolean> => {
    // Mock refresh - always succeeds
    return true;
  }, []);

  const redirectAfterAuth = useCallback(
    (role: string) => {
      switch (role?.toLowerCase()) {
        case "employee":
          router.push("/employee-portal");
          break;
        case "manager":
          router.push("/manager-portal");
          break;
        case "recruiter":
          router.push("/recruiter-portal");
          break;
        case "applicant":
          router.push("/careers");
          break;
        default:
          router.push("/");
          break;
      }
    },
    [router]
  );

  return (
    <TenantAuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        refreshAuth,
        redirectAfterAuth,
      }}
    >
      {children}
    </TenantAuthContext.Provider>
  );
}

/**
 * Hook to access tenant auth context
 * MOCK: Returns default authenticated state if used outside provider (for peer review)
 */
export function useTenantAuth(): TenantAuthContextType {
  const context = useContext(TenantAuthContext);
  const router = useRouter();

  // MOCK: Return default authenticated state if used outside provider (for peer review)
  if (context === undefined) {
    console.warn(
      "useTenantAuth used outside TenantAuthProvider - returning mock data for peer review"
    );

    return {
      isAuthenticated: true,
      accessToken: "mock-tenant-access-token",
      refreshToken: "mock-tenant-refresh-token",
      userRole: "recruiter",
      userId: "mock-user-123",
      isLoading: false,
      isInitialized: true,
      login: async () => {},
      logout: async () => {},
      refreshAuth: async () => true,
      redirectAfterAuth: (role: string) => {
        switch (role?.toLowerCase()) {
          case "employee":
            router.push("/employee-portal");
            break;
          case "manager":
            router.push("/manager-portal");
            break;
          case "recruiter":
            router.push("/recruiter-portal");
            break;
          case "applicant":
            router.push("/careers");
            break;
          default:
            router.push("/");
            break;
        }
      },
    };
  }

  return context;
}
