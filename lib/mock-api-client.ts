import { 
  ScanCreate, 
  ScanResponse, 
  ScanDetailResponse, 
  ScanProgressResponse, 
  ScanStatsResponse, 
  ScanTargetValidation,
  SystemValidationReport,
  ScanStatus,
  ScanProfile 
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
 * Mock API Client for development without backend
 */
class MockApiClient {
  private mockDelay = 500; // Simulate network delay

  /**
   * Add artificial delay to responses
   */
  private async delay(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, this.mockDelay));
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
   * Test API connectivity
   */
  async testConnection(): Promise<boolean> {
    await this.delay();
    return true;
  }

  // Scan Management APIs

  /**
   * Create a new vulnerability scan
   */
  async createScan(scanData: ScanCreate): Promise<ApiResponse<ScanResponse>> {
    await this.delay();
    
    const mockScan: ScanResponse = {
      id: Math.random().toString(36).substr(2, 9),
      user_id: 'mock-user',
      targets: scanData.targets,
      scan_profile: scanData.scan_profile,
      custom_options: scanData.custom_options,
      status: ScanStatus.PENDING,
      started_at: new Date().toISOString(),
      hosts_found: 0,
      hosts_up: 0,
      open_ports: 0,
      services_detected: [],
      vulnerabilities_found: 0,
      risk_score: 0,
      cve_references: [],
      success: true,
      created_at: new Date().toISOString(),
    };

    return {
      success: true,
      data: mockScan
    };
  }

  /**
   * Get list of scans with pagination
   */
  async getScans(): Promise<ApiResponse<ScanResponse[]>> {
    await this.delay();
    
    const mockScans: ScanResponse[] = [
      {
        id: '1',
        user_id: 'mock-user',
        targets: '192.168.1.1',
        scan_profile: ScanProfile.QUICK,
        status: ScanStatus.COMPLETED,
        started_at: '2023-01-01T00:00:00Z',
        completed_at: '2023-01-01T00:05:00Z',
        hosts_found: 1,
        hosts_up: 1,
        open_ports: 5,
        services_detected: ['http', 'ssh'],
        vulnerabilities_found: 2,
        risk_score: 4.5,
        cve_references: ['CVE-2023-1234'],
        success: true,
        created_at: '2023-01-01T00:00:00Z',
      }
    ];

    return {
      success: true,
      data: mockScans
    };
  }

  /**
   * Get detailed information about a specific scan
   */
  async getScan(scanId: string): Promise<ApiResponse<ScanDetailResponse>> {
    await this.delay();
    
    const mockScanDetail: ScanDetailResponse = {
      id: scanId,
      user_id: 'mock-user',
      targets: '192.168.1.1',
      scan_profile: ScanProfile.QUICK,
      status: ScanStatus.COMPLETED,
      started_at: '2023-01-01T00:00:00Z',
      completed_at: '2023-01-01T00:05:00Z',
      hosts_found: 1,
      hosts_up: 1,
      open_ports: 5,
      services_detected: ['http', 'ssh'],
      vulnerabilities_found: 2,
      risk_score: 4.5,
      cve_references: ['CVE-2023-1234'],
      success: true,
      created_at: '2023-01-01T00:00:00Z',
      stdout_output: 'Scan completed successfully',
      stderr_output: '',
      parsed_results: {
        scan_info: {},
        hosts: [],
        summary: {
          total_hosts: 1,
          hosts_up: 1,
          hosts_down: 0,
          total_ports_scanned: 1000,
          open_ports: 5,
          closed_ports: 995,
          filtered_ports: 0,
          services_detected: ['http', 'ssh'],
          vulnerabilities_found: 2,
          risk_score: 4.5
        },
        parse_errors: []
      }
    };

    return {
      success: true,
      data: mockScanDetail
    };
  }

  /**
   * Get real-time progress of a running scan
   */
  async getScanProgress(scanId: string): Promise<ApiResponse<ScanProgressResponse>> {
    await this.delay();
    
    const mockProgress: ScanProgressResponse = {
      scan_id: scanId,
      status: ScanStatus.RUNNING,
      progress: 50,
      message: 'Scanning in progress...',
      started_at: new Date().toISOString()
    };

    return {
      success: true,
      data: mockProgress
    };
  }

  /**
   * Cancel a running scan
   */
  async cancelScan(scanId: string): Promise<ApiResponse<{ message: string }>> {
    await this.delay();
    
    return {
      success: true,
      data: { message: 'Scan cancelled successfully' }
    };
  }

  /**
   * Delete a scan
   */
  async deleteScan(scanId: string): Promise<ApiResponse<{ message: string }>> {
    await this.delay();
    
    return {
      success: true,
      data: { message: 'Scan deleted successfully' }
    };
  }

  /**
   * Get scan statistics
   */
  async getScanStats(): Promise<ApiResponse<ScanStatsResponse>> {
    await this.delay();
    
    const mockStats: ScanStatsResponse = {
      total_scans: 10,
      scans_completed: 8,
      scans_failed: 1,
      scans_running: 1,
      total_hosts_scanned: 15,
      total_vulnerabilities: 25,
      average_risk_score: 4.2,
      last_scan_date: new Date().toISOString(),
      scans_last_24h: 3,
      scans_last_7d: 7,
      scans_last_30d: 10
    };

    return {
      success: true,
      data: mockStats
    };
  }

  /**
   * Validate scan targets before creating a scan
   */
  async validateTargets(targets: string): Promise<ApiResponse<ScanTargetValidation>> {
    await this.delay();
    
    const mockValidation: ScanTargetValidation = {
      target: targets,
      is_valid: true,
      message: 'Targets are valid',
      resolved_ips: [targets],
      warnings: []
    };

    return {
      success: true,
      data: mockValidation
    };
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
    await this.delay();
    
    return {
      success: true,
      data: {
        profiles: [
          {
            name: 'Quick Scan',
            description: 'Fast scan of common ports',
            nmap_options: '-T4 --top-ports 100'
          },
          {
            name: 'Full Scan',
            description: 'Comprehensive port scan',
            nmap_options: '-T4 -p-'
          }
        ]
      }
    };
  }

  /**
   * Get system validation report
   */
  async getSystemValidation(): Promise<ApiResponse<SystemValidationReport>> {
    await this.delay();
    
    const mockReport: SystemValidationReport = {
      overall_status: 'healthy',
      timestamp: new Date().toISOString(),
      is_healthy: true,
      has_errors: false,
      has_warnings: false,
      checks: [
        {
          component: 'system',
          status: 'healthy',
          message: 'All systems operational'
        }
      ],
      recommendations: []
    };

    return {
      success: true,
      data: mockReport
    };
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
    await this.delay();
    
    return {
      success: true,
      data: {
        status: 'healthy',
        services: [
          {
            name: 'scanner',
            status: 'up',
            message: 'Scanner service is running'
          }
        ],
        last_check: new Date().toISOString()
      }
    };
  }
}

// Export singleton instance
export const apiClient = new MockApiClient();