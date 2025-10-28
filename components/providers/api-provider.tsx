/**
 * API Provider Component
 * Mock implementation without backend integration
 */

'use client';

import { ReactNode } from 'react';

interface ApiProviderProps {
  children: ReactNode;
}

export function ApiProvider({ children }: ApiProviderProps) {
  return <>{children}</>;
}