"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { tenantAuthAPI } from "@/lib/api";
import { useRouter } from "next/navigation";

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

  // Initialize auth state on mount
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        if (typeof window === "undefined") return;

        const tokens = tenantAuthAPI.getTokens();
        const userRole = localStorage.getItem("tenant_user_role");
        const userId = localStorage.getItem("tenant_user_id");

        if (!tokens.accessToken) {
          // No tokens found
          if (mounted) {
            setAuthState({
              isAuthenticated: false,
              accessToken: null,
              refreshToken: null,
              userRole: null,
              userId: null,
              isLoading: false,
              isInitialized: true,
            });
          }
          return;
        }

        // Tokens found - assume authenticated
        if (mounted) {
          setAuthState({
            isAuthenticated: true,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            userRole,
            userId,
            isLoading: false,
            isInitialized: true,
          });
        }
      } catch (error) {
        console.error("Tenant auth initialization error:", error);

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
      role?: string;
      user_id?: string;
    }) => {
      // Store tenant tokens (separate from platform tokens)
      tenantAuthAPI.setTokens(tokens.access_token, tokens.refresh_token);

      // Store additional user info
      if (tokens.role) {
        localStorage.setItem("tenant_user_role", tokens.role);
      }
      if (tokens.user_id) {
        localStorage.setItem("tenant_user_id", tokens.user_id);
      }

      setAuthState({
        isAuthenticated: true,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        userRole: tokens.role || null,
        userId: tokens.user_id || null,
        isLoading: false,
        isInitialized: true,
      });
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await tenantAuthAPI.logout();
    } catch (error) {
      console.error("Logout error:", error);
    }

    // Clear tenant user info
    localStorage.removeItem("tenant_user_role");
    localStorage.removeItem("tenant_user_id");

    setAuthState({
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      userRole: null,
      userId: null,
      isLoading: false,
      isInitialized: true,
    });

    // Redirect to tenant login page
    router.push("/login");
  }, [router]);

  const refreshAuth = useCallback(async (): Promise<boolean> => {
    try {
      const refreshResponse = await tenantAuthAPI.refreshToken();

      // Update tokens
      tenantAuthAPI.setTokens(
        refreshResponse.access_token,
        refreshResponse.refresh_token
      );

      setAuthState((prev) => ({
        ...prev,
        accessToken: refreshResponse.access_token,
        refreshToken: refreshResponse.refresh_token,
      }));

      return true;
    } catch (error) {
      console.error("Token refresh failed:", error);
      await logout();
      return false;
    }
  }, [logout]);

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
 * Must be used within TenantAuthProvider
 */
export function useTenantAuth() {
  const context = useContext(TenantAuthContext);
  if (context === undefined) {
    throw new Error("useTenantAuth must be used within TenantAuthProvider");
  }
  return context;
}
