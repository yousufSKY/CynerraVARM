/**
 * API Client exports
 * Switch between mock and real implementations
 */

// Import both implementations
import { apiClient as realApiClient } from './api-client';
import { apiClient as mockApiClient } from './mock-api-client';

// Export the mock client by default
export const apiClient = mockApiClient;

// Export type definitions
export type { ApiResponse } from './mock-api-client';