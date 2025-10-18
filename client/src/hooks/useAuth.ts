"use client";

import { useEffect, useCallback } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { APIError } from '@/lib/api';
import { useToast } from '@/providers/toast-provider';

export function useTokenRefresh() {
  const { isAuthenticated, refreshAuth, logout } = useAuth();
  const { showToast } = useToast();

  const handleTokenRefresh = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const success = await refreshAuth();
      if (!success) {
        showToast({
          type: 'warning',
          title: 'Session expired',
          message: 'Please log in again to continue.',
        });
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      showToast({
        type: 'error',
        title: 'Authentication error',
        message: 'Your session has expired. Please log in again.',
      });
      await logout();
    }
  }, [isAuthenticated, refreshAuth, logout, showToast]);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Set up automatic token refresh every 45 minutes
    const refreshInterval = setInterval(() => {
      handleTokenRefresh();
    }, 45 * 60 * 1000); // 45 minutes

    // Set up visibility change handler to refresh when tab becomes active
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isAuthenticated) {
        handleTokenRefresh();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(refreshInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, handleTokenRefresh]);

  return { refreshToken: handleTokenRefresh };
}

// Hook for handling API errors with automatic retry and logout
export function useAuthenticatedRequest() {
  const { refreshAuth, logout } = useAuth();
  const { showToast } = useToast();

  const makeRequest = useCallback(async <T>(
    requestFn: () => Promise<T>,
    showErrorToast: boolean = true
  ): Promise<T | null> => {
    try {
      return await requestFn();
    } catch (error) {
      if (error instanceof APIError && error.isTokenExpired) {
        try {
          // Try to refresh token and retry
          const success = await refreshAuth();
          if (success) {
            return await requestFn();
          } else {
            throw new Error('Token refresh failed');
          }
        } catch (refreshError) {
          if (showErrorToast) {
            showToast({
              type: 'warning',
              title: 'Session expired',
              message: 'Please log in again to continue.',
            });
          }
          await logout();
          return null;
        }
      } else {
        // Handle other API errors
        if (showErrorToast && error instanceof APIError) {
          showToast({
            type: 'error',
            title: 'Request failed',
            message: error.message,
          });
        }
        throw error;
      }
    }
  }, [refreshAuth, logout, showToast]);

  return { makeRequest };
}