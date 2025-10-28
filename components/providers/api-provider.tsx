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
    const updateApiToken = async () => {
      if (isLoaded && isSignedIn) {
        try {
          const token = await getToken();
          apiClient.setAuthToken(token);
        } catch (error) {
          console.error('❌ Failed to get auth token:', error);
          apiClient.setAuthToken(null);
        }
      } else {
        apiClient.setAuthToken(null);
      }
    };

    updateApiToken();
  }, [getToken, isSignedIn, isLoaded]);

  return <>{children}</>;
}