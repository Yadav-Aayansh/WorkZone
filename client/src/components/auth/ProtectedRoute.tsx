"use client";

import { useEffect } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { useRouter } from 'next/navigation';
import { Loader } from '@/components/ui/loader';
import { Logo } from '@/components/logo';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredStatus?: string[];
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  requiredStatus = [], 
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, isInitialized, accountStatus } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isInitialized || isLoading) return;

    if (!isAuthenticated) {
      router.push(redirectTo);
      return;
    }

    // Check if user has required status
    if (requiredStatus.length > 0 && accountStatus && !requiredStatus.includes(accountStatus)) {
      // Redirect based on current status
      switch (accountStatus) {
        case 'ONBOARDING':
          router.push('/signup');
          break;
        case 'SUBSCRIPTION':
          router.push('/subscription');
          break;
        case 'ACTIVE':
          // Only redirect if not already on dashboard
          if (window.location.pathname !== '/dashboard') {
            router.push('/dashboard');
          }
          break;
        default:
          // Only redirect if not already on dashboard
          if (window.location.pathname !== '/dashboard') {
            router.push('/dashboard');
          }
          break;
      }
    }
  }, [isAuthenticated, isLoading, isInitialized, accountStatus, requiredStatus, redirectTo, router]);

  // Show loading while initializing
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Logo className="w-24 mx-auto" />
          <div className="flex items-center justify-center gap-2">
            <Loader size="md" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show loading while redirecting
  if (!isAuthenticated || (requiredStatus.length > 0 && accountStatus && !requiredStatus.includes(accountStatus))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Logo className="w-24 mx-auto" />
          <div className="flex items-center justify-center gap-2">
            <Loader size="md" />
            <p className="text-muted-foreground">Redirecting...</p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Convenience components for different protection levels
export function RequireAuth({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}

export function RequireOnboarding({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredStatus={['ONBOARDING']}>
      {children}
    </ProtectedRoute>
  );
}

export function RequireSubscription({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredStatus={['SUBSCRIPTION']}>
      {children}
    </ProtectedRoute>
  );
}

export function RequireActive({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredStatus={['ACTIVE']}>
      {children}
    </ProtectedRoute>
  );
}