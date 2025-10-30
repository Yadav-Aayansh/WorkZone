"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

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
      // The backend will validate tenant exists via Host header
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tenant/test`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Tenant not found");
        }
        throw new Error("Failed to load tenant configuration");
      }

      const message = await response.text();
      console.log("Tenant test response:", message);

      // Extract tenant_id from response like "Hi from sandesh"
      const tenantIdMatch = message.match(/Hi from (\w+)/);
      const tenantId = tenantIdMatch ? tenantIdMatch[1] : subdomain;

      // TODO: Backend needs to add /api/tenant/config endpoint that returns:
      // - tenant_id
      // - brand_name
      // - logo URL (signed URL from GCS)
      // - theme colors
      //
      // For now, we use the tenant_id and default branding
      // The tenant is verified to exist via the test endpoint above

      // Create tenant config with available data
      const config: TenantConfig = {
        id: tenantId,
        subdomain: subdomain,
        brandName: tenantId.charAt(0).toUpperCase() + tenantId.slice(1), // Capitalize first letter as placeholder
        logo: "/assets/logos/default-tenant-logo.png", // Placeholder until backend provides logo URL
        theme: {
          primaryColor: "#6366f1",
          secondaryColor: "#8b5cf6",
        },
      };

      setTenant(config);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      console.error("Error fetching tenant config:", err);

      // If tenant not found, redirect to platform
      if (errorMessage === "Tenant not found") {
        const platformUrl =
          process.env.NEXT_PUBLIC_PLATFORM_URL || "http://localhost:3000";
        window.location.href = `${platformUrl}?error=tenant-not-found`;
      }
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
