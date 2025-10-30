/**
 * API Provider Component
 * Manages authentication state for API client
 */

'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect, ReactNode } from 'react';
import { apiClient } from '@/lib/api-client';

interface ApiProviderProps {
  children: ReactNode;
}

export function ApiProvider({ children }: ApiProviderProps) {
  const { getToken, isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    // Set up token refresh callback
    (apiClient as any).setTokenRefreshCallback(async () => {
      if (isSignedIn) {
        try {
          return await getToken();
        } catch (error) {
          console.error('❌ Token refresh callback failed:', error);
          return null;
        }
      }
      return null;
    });

    const updateApiToken = async () => {
      if (isLoaded && isSignedIn) {
        try {
          const token = await getToken();
          (apiClient as any).setAuthToken(token);
        } catch (error) {
          console.error('❌ Failed to get auth token:', error);
          (apiClient as any).setAuthToken(null);
        }
      } else {
        (apiClient as any).setAuthToken(null);
      }
    };

    updateApiToken();
    
    // Set up periodic token refresh (every 30 seconds)
    const interval = setInterval(() => {
      if (isLoaded && isSignedIn) {
        updateApiToken();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [getToken, isSignedIn, isLoaded]);

  return <>{children}</>;
}