"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { tenantConfigAPI, TenantAPIError } from "@/lib/api";

// Tenant configuration interface
export interface TenantConfig {
  id: string;
  subdomain: string;
  brandName: string;
  logo: string;
  domain?: string;
  theme?: {
    primaryColor: string;
    secondaryColor: string;
  };
}

// Tenant context type
interface TenantContextType {
  tenant: TenantConfig | null;
  isLoading: boolean;
  isTenantRoute: boolean;
  error: string | null;
  refreshTenant: () => Promise<void>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

interface TenantProviderProps {
  children: ReactNode;
}

/**
 * TenantProvider - Manages tenant context and configuration
 *
 * Responsibilities:
 * - Detect if current route is a tenant subdomain
 * - Fetch tenant configuration from backend
 * - Provide tenant branding and settings to components
 * - Handle tenant not found errors
 */
export function TenantProvider({ children }: TenantProviderProps) {
  const [tenant, setTenant] = useState<TenantConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTenantRoute, setIsTenantRoute] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTenantConfig = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get subdomain from current URL
      const subdomain = getTenantSubdomainFromUrl();

      // Check if it's a tenant subdomain
      if (!subdomain || subdomain === "www") {
        // Platform route - not a tenant
        setIsTenantRoute(false);
        setTenant(null);
        setIsLoading(false);
        return;
      }

      setIsTenantRoute(true);

      // Fetch tenant configuration from backend
      // The backend validates tenant exists via Host header
      const configResponse = await tenantConfigAPI.getConfig();

      // Create tenant config with real backend data
      const config: TenantConfig = {
        id: configResponse.tenant_id,
        subdomain: subdomain,
        brandName: configResponse.brand_name,
        logo: configResponse.logo || "/assets/logos/default-tenant-logo.png",
        domain: configResponse.domain || undefined,
        theme: {
          primaryColor: "#6366f1",
          secondaryColor: "#8b5cf6",
        },
      };

      setTenant(config);
    } catch (err) {
      let errorMessage = "Unknown error";

      if (err instanceof TenantAPIError) {
        errorMessage = err.message;
        // 404 means tenant not found
        if (err.status === 404) {
          errorMessage = "Tenant not found";
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      console.error("Error fetching tenant config:", err);

      // Don't redirect - let the tenant route handle displaying "not found" page
      // The tenant layout will check error state and show appropriate UI
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTenantConfig();
  }, []);

  const refreshTenant = async () => {
    await fetchTenantConfig();
  };

  return (
    <TenantContext.Provider
      value={{
        tenant,
        isLoading,
        isTenantRoute,
        error,
        refreshTenant,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}

/**
 * Hook to access tenant context
 * Must be used within TenantProvider
 */
export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error("useTenant must be used within TenantProvider");
  }
  return context;
}

/**
 * Extract subdomain from current URL
 * Client-side version of subdomain detection
 */
function getTenantSubdomainFromUrl(): string | null {
  if (typeof window === "undefined") return null;

  const hostname = window.location.hostname;
  const host = hostname.split(":")[0];

  // localhost or company.localhost
  if (host.includes("localhost")) {
    const parts = host.split(".");
    return parts.length >= 2 ? parts[0] : null;
  }

  // Production: workzone.tech or company.workzone.tech
  const parts = host.split(".");
  return parts.length >= 3 ? parts[0] : null;
}
