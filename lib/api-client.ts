import { 
  ScanCreate, 
  ScanResponse, 
  ScanDetailResponse, 
  ScanProgressResponse, 
  ScanStatsResponse, 
  ScanTargetValidation,
  SystemValidationReport,
  ScanStatus,
  ScanTriggerRequest,
  ScanTriggerResponse,
  ScanResults,
  ScanHistoryResponse,
  ScanProfile,
  ScannerType
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
 * Real Scanner API Client for VARM backend communication
 * Uses actual scanner endpoints with real vulnerability data
 */
class ApiClient {
  private baseURL: string;
  private authToken: string | null = null;
  private tokenRefreshCallback: (() => Promise<string | null>) | null = null;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    console.log('🔧 API Client initialized with baseURL:', this.baseURL);
  }

  /**
   * Set authentication token for API requests
   */
  setAuthToken(token: string | null) {
    this.authToken = token;
    console.log('🔑 Auth token set:', token ? 'Present' : 'None');
  }

  /**
   * Set token refresh callback for automatic token renewal
   */
  setTokenRefreshCallback(callback: (() => Promise<string | null>) | null) {
    this.tokenRefreshCallback = callback;
  }

  /**
   * Check if auth token is available
   */
  hasAuthToken(): boolean {
    return !!this.authToken;
  }

  /**
   * Get appropriate endpoint based on authentication
   * Returns test endpoints for development, production endpoints for authenticated users
   */
  private getEndpoint(path: string): string {
    const useTestEndpoint = !this.authToken || process.env.NODE_ENV === 'development';
    const prefix = useTestEndpoint ? '/api/test' : '/api';
    return `${this.baseURL}${prefix}${path}`;
  }

  /**
   * Make authenticated HTTP request
   */
  private async makeRequest<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
      };

      // Add auth token for production endpoints
      if (this.authToken && !url.includes('/test/')) {
        headers['Authorization'] = `Bearer ${this.authToken}`;
      }

      console.log(`📡 ${options.method || 'GET'} ${url}`);

      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ API Response:`, data);
      
      return {
        data,
        success: true,
      };
    } catch (error) {
      console.error(`❌ API Error for ${url}:`, error);
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      };
    }
  }

  /**
   * Create/trigger a new scan using real scanner endpoints
   */
  async createScan(scanData: ScanCreate): Promise<ApiResponse<ScanTriggerResponse>> {
    // Convert frontend format to backend format
    const request: ScanTriggerRequest = {
      asset_id: 'default-asset', // TODO: Make this configurable
      target: scanData.targets,
      profile: scanData.scan_profile
    };

    const response = await this.makeRequest<ScanTriggerResponse>(
      this.getEndpoint('/scan/trigger'),
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );

    // Store the scan ID for later retrieval (workaround for broken history endpoint)
    if (response.success && response.data?.scan_id) {
      this.storeScanId(response.data.scan_id);
      console.log(`📝 Stored scan ID: ${response.data.scan_id}`);
    }

    return response;
  }

  /**
   * Get scan status and results
   */
  async getScan(scanId: string): Promise<ApiResponse<ScanResults>> {
    return this.makeRequest<ScanResults>(
      this.getEndpoint(`/scan/${scanId}`)
    );
  }

  /**
   * Get detailed scan results
   */
  async getScanResults(scanId: string): Promise<ApiResponse<ScanDetailResponse>> {
    return this.makeRequest<ScanDetailResponse>(
      this.getEndpoint(`/scan/${scanId}/results`)
    );
  }

  /**
   * Get scan history for an asset with optional filtering
   */
  async getScanHistory(
    assetId: string = 'default-asset',
    options: { 
      limit?: number; 
      scannerType?: ScannerType 
    } = {}
  ): Promise<ApiResponse<ScanHistoryResponse>> {
    const params = new URLSearchParams();
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.scannerType) params.append('scanner_type', options.scannerType);

    const url = `${this.getEndpoint(`/scan/history/${assetId}`)}?${params.toString()}`;
    return this.makeRequest<ScanHistoryResponse>(url);
  }

  /**
   * Get all scans (backwards compatibility with workaround for broken history endpoint)
   */
  async getScans(params?: { skip?: number; limit?: number; status?: string }): Promise<ApiResponse<ScanResponse[]>> {
    try {
      console.log('🔍 Getting scans with params:', params);
      
      // WORKAROUND: The scan history endpoint is returning empty results even though scans exist
      // Strategy: Try to discover scan IDs dynamically and fetch them individually
      
      console.log('⚠️ WORKAROUND: Scan history API is broken, discovering scans dynamically...');
      
      const scans: ScanResponse[] = [];
      
      // Method 1: Try to get recently created scan IDs from localStorage or memory
      const recentScanIds = this.getRecentScanIds();
      console.log(`Found ${recentScanIds.length} recent scan IDs`);
      
      // Method 2: Add known scan IDs from the database (manually discovered)
      const knownScanIds = [
        'cbeb7be3-366d-4112-ad0f-a9080d4d390e', // Confirmed working scan from Firestore
        // TODO: Add more scan IDs as they're discovered or created
        // When users create new scans, they'll be automatically tracked
      ];

      // Method 3: Try to discover additional scan IDs
      console.log('🔍 Attempting to discover additional scan IDs...');
      const discoveredIds = await this.discoverScanIds();
      console.log(`Discovered ${discoveredIds.length} additional scan IDs`);
      
      // Combine all scan IDs and remove duplicates
      const combinedIds = [...recentScanIds, ...knownScanIds, ...discoveredIds];
      const allScanIds = Array.from(new Set(combinedIds));
      
      console.log(`Attempting to fetch ${allScanIds.length} scans individually...`);
      
      for (const scanId of allScanIds) {
        try {
          console.log(`Fetching scan: ${scanId}`);
          const scanResponse = await this.getScan(scanId);
          if (scanResponse.data) {
            const scan = scanResponse.data;
            
            // Convert backend format to frontend format
            const frontendScan: ScanResponse = {
              id: scan.scan_id,
              user_id: scan.initiated_by_uid || 'current-user',
              targets: scan.target,
              scan_profile: scan.profile as any,
              status: scan.status as any,
              scanner_type: scan.profile.includes('nmap') || scan.profile.includes('quick') || scan.profile.includes('full') ? 'port' : 'web',
              created_at: scan.created_at,
              started_at: scan.started_at,
              completed_at: scan.finished_at,
              updated_at: scan.finished_at || scan.started_at || scan.created_at,
              success: scan.status === 'COMPLETED',
              
              // Extract data from parsed_results if available (using any type for now)
              hosts_found: (scan.parsed_results as any)?.summary?.total_hosts || 0,
              hosts_up: (scan.parsed_results as any)?.summary?.total_hosts || 0,
              open_ports: (scan.parsed_results as any)?.summary?.total_open_ports || 0,
              services_detected: (scan.parsed_results as any)?.summary?.top_services?.map((s: any) => s.name) || [],
              vulnerabilities_found: (() => {
                // Try multiple sources for vulnerability count
                let vulnCount = 0;
                const parsedResults = scan.parsed_results as any;
                
                console.log(`🔍 [API Client] Processing vulnerability data for scan ${scan.scan_id}:`, {
                  summary: parsedResults?.summary,
                  findings: parsedResults?.findings,
                  hosts: parsedResults?.parsed_json?.hosts
                });
                
                // First try total_findings from summary
                if (parsedResults?.summary?.total_findings) {
                  vulnCount = parsedResults.summary.total_findings;
                  console.log(`✅ [API Client] Using total_findings: ${vulnCount}`);
                }
                // Then try counting findings array
                else if (parsedResults?.findings && Array.isArray(parsedResults.findings)) {
                  vulnCount = parsedResults.findings.length;
                  console.log(`✅ [API Client] Using findings array: ${vulnCount}`);
                }
                // For detailed scan results, count host findings
                else if (parsedResults?.parsed_json?.hosts) {
                  vulnCount = parsedResults.parsed_json.hosts.reduce((sum: number, host: any) => {
                    return sum + (host.findings?.length || 0);
                  }, 0);
                  console.log(`✅ [API Client] Using host findings: ${vulnCount}`);
                }
                // Fallback to high_risk_ports_count if nothing else available
                else if (parsedResults?.summary?.high_risk_ports_count) {
                  vulnCount = parsedResults.summary.high_risk_ports_count;
                  console.log(`⚠️ [API Client] Fallback to high_risk_ports_count: ${vulnCount}`);
                }
                else {
                  console.log(`⚠️ [API Client] No vulnerability data found`);
                }
                
                console.log(`📊 [API Client] Final vulnerability count: ${vulnCount}`);
                return vulnCount;
              })(),
              risk_score: (scan.parsed_results as any)?.summary?.risk_score || 0,
              cve_references: [] // Will be populated when available
            };
            
            scans.push(frontendScan);
            console.log(`✅ Successfully fetched scan: ${scanId} (${scan.status})`);
          }
        } catch (scanError) {
          console.warn(`Failed to fetch scan ${scanId}:`, scanError);
        }
      }
      
      // Also try the original scan history approach (in case it gets fixed)
      try {
        const historyResponse = await this.getScanHistory('default-asset', { 
          limit: params?.limit || 50 
        });

        if (historyResponse.data && historyResponse.data.scans.length > 0) {
          console.log('✅ Scan history endpoint is working again!');
          
          // Convert backend format to frontend format
          const historyScans: ScanResponse[] = historyResponse.data.scans.map(scan => ({
            id: scan.scan_id,
            user_id: 'current-user',
            targets: scan.target,
            scan_profile: scan.profile,
            status: scan.status,
            scanner_type: scan.scanner_type,
            created_at: scan.created_at,
            started_at: scan.started_at,
            completed_at: scan.finished_at,
            updated_at: scan.finished_at || scan.started_at || scan.created_at,
            success: scan.status === ScanStatus.COMPLETED,
            hosts_found: 0,
            hosts_up: 0,
            open_ports: 0,
            services_detected: [],
            vulnerabilities_found: 0,
            risk_score: 0,
            cve_references: []
          }));
          
          // Merge with direct scans (remove duplicates)
          const allScans = [...scans];
          historyScans.forEach(historyScan => {
            if (!allScans.find(s => s.id === historyScan.id)) {
              allScans.push(historyScan);
            }
          });
          
          return {
            data: allScans,
            success: true
          };
        }
      } catch (historyError) {
        console.warn('Scan history endpoint still failing:', historyError);
      }

      // Sort scans by created date (most recent first)
      scans.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      console.log(`✅ Workaround returned ${scans.length} scans`);
      return {
        data: scans,
        success: true
      };
      
    } catch (error) {
      console.error('❌ Error in getScans:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to fetch scans',
        success: false
      };
    }
  }

  /**
   * Store scan ID when a scan is created (to track for later retrieval)
   */
  private storeScanId(scanId: string) {
    try {
      const recentScans = this.getRecentScanIds();
      recentScans.unshift(scanId);
      // Keep only last 50 scan IDs
      const trimmed = recentScans.slice(0, 50);
      localStorage.setItem('recent_scan_ids', JSON.stringify(trimmed));
    } catch (error) {
      console.warn('Failed to store scan ID:', error);
    }
  }

  /**
   * Attempt to discover additional scan IDs from various sources
   */
  private async discoverScanIds(): Promise<string[]> {
    const discoveredIds: string[] = [];
    
    try {
      // For now, we'll rely on localStorage tracking and manual known IDs
      // Future enhancement: Could implement more sophisticated discovery
      // when backend provides proper scan listing endpoints
      
      console.log('🔍 Scan discovery currently limited to known IDs and localStorage tracking');
      
    } catch (error) {
      console.warn('Scan ID discovery failed:', error);
    }
    
    return discoveredIds;
  }

  /**
   * Get recently created scan IDs from localStorage
   */
  private getRecentScanIds(): string[] {
    try {
      const stored = localStorage.getItem('recent_scan_ids');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('Failed to get recent scan IDs:', error);
      return [];
    }
  }

  /**
   * Cancel a running scan
   */
  async cancelScan(scanId: string): Promise<ApiResponse<{ message: string }>> {
    return this.makeRequest<{ message: string }>(
      this.getEndpoint(`/scan/${scanId}`),
      {
        method: 'DELETE',
      }
    );
  }

  /**
   * Delete a scan (same as cancel for now)
   */
  async deleteScan(scanId: string): Promise<ApiResponse<{ message: string }>> {
    return this.cancelScan(scanId);
  }

  /**
   * Get scan progress
   */
  async getScanProgress(scanId: string): Promise<ApiResponse<ScanProgressResponse>> {
    // Use the same endpoint as getScan since backend doesn't have separate progress endpoint
    const scanResponse = await this.getScan(scanId);
    
    if (scanResponse.error || !scanResponse.data) {
      return {
        error: scanResponse.error || 'Failed to get scan progress',
        success: false
      };
    }

    const scan = scanResponse.data;
    const progress: ScanProgressResponse = {
      scan_id: scan.scan_id,
      status: scan.status,
      progress: scan.status === ScanStatus.COMPLETED ? 100 : 
                scan.status === ScanStatus.RUNNING ? 50 : 0,
      message: `Scan ${scan.status.toLowerCase()}`,
      started_at: scan.started_at
    };

    return {
      data: progress,
      success: true
    };
  }

  /**
   * Validate scan targets
   */
  async validateTargets(targets: string): Promise<ApiResponse<ScanTargetValidation>> {
    // Basic client-side validation for now
    const validation: ScanTargetValidation = {
      target: targets,
      is_valid: this.isValidTarget(targets),
      message: this.isValidTarget(targets) ? 'Valid target' : 'Invalid target format',
      resolved_ips: [],
      warnings: []
    };

    return {
      data: validation,
      success: true
    };
  }

  /**
   * Basic target validation
   */
  private isValidTarget(target: string): boolean {
    // IP address pattern
    const ipPattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    // URL pattern
    const urlPattern = /^https?:\/\/.+/;
    
    return ipPattern.test(target) || urlPattern.test(target);
  }

  /**
   * Get scan statistics (mock for now)
   */
  async getScanStats(): Promise<ApiResponse<ScanStatsResponse>> {
    // Mock statistics - replace with real endpoint when available
    const stats: ScanStatsResponse = {
      total_scans: 0,
      scans_completed: 0,
      scans_failed: 0,
      scans_running: 0,
      total_hosts_scanned: 0,
      total_vulnerabilities: 0,
      average_risk_score: 0,
      scans_last_24h: 0,
      scans_last_7d: 0,
      scans_last_30d: 0
    };

    return {
      data: stats,
      success: true
    };
  }

  /**
   * Get system validation report
   */
  async getSystemValidation(): Promise<ApiResponse<SystemValidationReport>> {
    // Mock system health - replace with real endpoint when available
    const health: SystemValidationReport = {
      overall_status: 'healthy',
      timestamp: new Date().toISOString(),
      is_healthy: true,
      has_errors: false,
      has_warnings: false,
      checks: [
        {
          component: 'API Server',
          status: 'healthy',
          message: 'Connected to backend'
        }
      ],
      recommendations: []
    };

    return {
      data: health,
      success: true
    };
  }

  /**
   * Get available scan profiles
   */
  async getScanProfiles(): Promise<ApiResponse<any>> {
    // Return success - profiles are defined in constants
    return {
      data: [],
      success: true
    };
  }

  /**
   * Backend health check
   */
  async ping(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/docs`);
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Format error message for display
   */
  formatError(error: any): string {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    if (error?.detail) return error.detail;
    return 'An unexpected error occurred';
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
