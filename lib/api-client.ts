import { 
  ScanCreate, 
  ScanResponse, 
  ScanDetailResponse, 
  ScanProgressResponse, 
  ScanStatsResponse, 
  ScanTargetValidation,
  SystemValidationReport 
} from '@/types/api';

/**
 * API Response wrapper
 */
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
}

/**
 * API Error wrapper
 */
export interface ApiError {
  message: string;
  status?: number;
  details?: any;
}

/**
 * API Client for VARM backend communication
 */
class ApiClient {
  private baseURL: string;
  private authToken: string | null = null;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
  }

  /**
   * Set authentication token for API requests
   */
  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  /**
   * Check if authentication token is available
   */
  hasAuthToken(): boolean {
    return !!this.authToken;
  }

  /**
   * Generic request wrapper with error handling
   */
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers as Record<string, string>,
      };

      // Add authorization header if token is available
      if (this.authToken) {
        headers['Authorization'] = `Bearer ${this.authToken}`;
      } else {
        console.warn('⚠️  API Request without auth:', options.method || 'GET', url.split('/').pop());
      }

      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage: string;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.detail || errorData.message || `HTTP ${response.status}`;
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }

        return {
          success: false,
          error: errorMessage,
        };
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  /**
   * Format API error for display
   */
  formatError(error: any): string {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    if (error?.detail) return error.detail;
    return 'An unexpected error occurred';
  }

  /**
   * Test API connectivity (alias for backward compatibility)
   */
  async ping(): Promise<boolean> {
    return this.testConnection();
  }

  /**
   * Test API connectivity
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }

  // Scan Management APIs

  /**
   * Create a new vulnerability scan
   */
  async createScan(scanData: ScanCreate): Promise<ApiResponse<ScanResponse>> {
    return this.request<ScanResponse>('/scans', {
      method: 'POST',
      body: JSON.stringify(scanData),
    });
  }

  /**
   * Get list of scans with pagination
   */
  async getScans(params?: {
    skip?: number;
    limit?: number;
    status?: string;
  }): Promise<ApiResponse<ScanResponse[]>> {
    const queryParams = new URLSearchParams();
    if (params?.skip !== undefined) queryParams.set('skip', params.skip.toString());
    if (params?.limit !== undefined) queryParams.set('limit', params.limit.toString());
    if (params?.status) queryParams.set('status', params.status);
    
    const queryString = queryParams.toString();
    const url = queryString ? `/scans?${queryString}` : '/scans';
    return this.request<ScanResponse[]>(url);
  }

  /**
   * Get detailed information about a specific scan
   */
  async getScan(scanId: string): Promise<ApiResponse<ScanDetailResponse>> {
    return this.request<ScanDetailResponse>(`/scans/${scanId}`);
  }

  /**
   * Get real-time progress of a running scan
   */
  async getScanProgress(scanId: string): Promise<ApiResponse<ScanProgressResponse>> {
    return this.request<ScanProgressResponse>(`/scans/${scanId}/progress`);
  }

  /**
   * Cancel a running scan
   */
  async cancelScan(scanId: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/scans/${scanId}/cancel`, {
      method: 'POST',
    });
  }

  /**
   * Delete a scan
   */
  async deleteScan(scanId: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/scans/${scanId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Get scan statistics
   */
  async getScanStats(): Promise<ApiResponse<ScanStatsResponse>> {
    return this.request<ScanStatsResponse>('/scans/statistics');
  }

  /**
   * Validate scan targets before creating a scan
   */
  async validateTargets(targets: string): Promise<ApiResponse<ScanTargetValidation>> {
    return this.request<ScanTargetValidation>('/scans/validate-targets', {
      method: 'POST',
      body: JSON.stringify({ targets }),
    });
  }

  /**
   * Get available scan profiles
   */
  async getScanProfiles(): Promise<ApiResponse<{
    profiles: Array<{
      name: string;
      description: string;
      nmap_options: string;
    }>;
  }>> {
    return this.request('/scan-profiles');
  }

  // System Health APIs

  /**
   * Get system validation report
   */
  async getSystemValidation(): Promise<ApiResponse<SystemValidationReport>> {
    return this.request<SystemValidationReport>('/system/validate');
  }

  /**
   * Get system health status
   */
  async getSystemHealth(): Promise<ApiResponse<{
    status: 'healthy' | 'warning' | 'critical';
    services: Array<{
      name: string;
      status: 'up' | 'down';
      message?: string;
    }>;
    last_check: string;
  }>> {
    return this.request('/system/health');
  }
}

// Export singleton instance
export const apiClient = new ApiClient();