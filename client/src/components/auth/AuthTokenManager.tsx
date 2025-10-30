"use client";

import { useTokenRefresh } from '@/lib/hooks/useAuth';

export function AuthTokenManager() {
  useTokenRefresh();
  return null;
}