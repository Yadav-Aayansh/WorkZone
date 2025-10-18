"use client";

import { useTokenRefresh } from '@/hooks/useAuth';

export function AuthTokenManager() {
  useTokenRefresh();
  return null;
}