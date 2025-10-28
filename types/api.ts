/**
 * TypeScript Types for VARM API
 * Matches the backend Pydantic schemas
 */

// Enums matching backend models
export enum ScanStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum ScanProfile {
  QUICK = 'quick',
  FULL = 'full',
  SERVICE_DETECTION = 'service_detection',
  VULN_SCAN = 'vuln_scan',
  UDP_SCAN = 'udp_scan'
}

export enum RiskLevel {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  INFO = 'info'
}

// Scan-related types
export interface ScanCreate {
  targets: string;
  scan_profile: ScanProfile;
  custom_options?: string;
}

export interface ScanUpdate {
  status?: ScanStatus;
  success?: boolean;
  error_message?: string;
  hosts_found?: number;
  hosts_up?: number;
  open_ports?: number;
  vulnerabilities_found?: number;
  risk_score?: number;
}

export interface ScanResponse {
  id: string;
  user_id: string;
  targets: string;
  scan_profile: ScanProfile;
  custom_options?: string;
  status: ScanStatus;
  started_at?: string;
  completed_at?: string;
  duration_seconds?: number;
  
  // Execution details
  task_id?: string;
  nmap_command?: string;
  exit_code?: number;
  success: boolean;
  error_message?: string;
  
  // Results summary
  hosts_found: number;
  hosts_up: number;
  open_ports: number;
  services_detected: string[];
  vulnerabilities_found: number;
  risk_score: number;
  cve_references: string[];
  
  // Metadata
  created_at: string;
  updated_at?: string;
}

export interface ScanDetailResponse extends ScanResponse {
  stdout_output?: string;
  stderr_output?: string;
  parsed_results?: {
    scan_info: Record<string, any>;
    hosts: Array<{
      host_info: {
        ip?: string;
        hostname?: string;
        mac_address?: string;
        vendor?: string;
        status: string;
        reason?: string;
      };
      ports: Array<{
        port: number;
        protocol: string;
        state: string;
        service?: string;
        version?: string;
        product?: string;
        extrainfo?: string;
        reason?: string;
        confidence?: number;
      }>;
      scripts: Array<{
        id: string;
        output: string;
        elements?: Record<string, any>;
      }>;
      os_detection: Record<string, any>;
    }>;
    summary: {
      total_hosts: number;
      hosts_up: number;
      hosts_down: number;
      total_ports_scanned: number;
      open_ports: number;
      closed_ports: number;
      filtered_ports: number;
      services_detected: string[];
      vulnerabilities_found: number;
      risk_score: number;
    };
    parse_errors: string[];
  };
}

export interface ScanProgressResponse {
  scan_id: string;
  status: ScanStatus;
  progress: number; // 0-100
  message?: string;
  started_at?: string;
  estimated_completion?: string;
}

export interface ScanTargetValidation {
  target: string;
  is_valid: boolean;
  message: string;
  resolved_ips: string[];
  warnings: string[];
}

export interface ScanStatsResponse {
  total_scans: number;
  scans_completed: number;
  scans_failed: number;
  scans_running: number;
  total_hosts_scanned: number;
  total_vulnerabilities: number;
  average_risk_score: number;
  last_scan_date?: string;
  
  // Time-based statistics
  scans_last_24h: number;
  scans_last_7d: number;
  scans_last_30d: number;
}

// Nmap Host types
export interface NmapHostResponse {
  id: string;
  scan_id: string;
  ip_address?: string;
  hostname?: string;
  mac_address?: string;
  vendor?: string;
  status: string;
  reason?: string;
  os_info?: Record<string, any>;
  ports: Array<Record<string, any>>;
  scripts: Array<Record<string, any>>;
  risk_score: number;
  vulnerability_count: number;
  scanned_at?: string;
}

// System validation types
export interface ValidationResult {
  component: string;
  status: 'healthy' | 'warning' | 'error';
  message: string;
  details?: Record<string, any>;
}

export interface SystemValidationReport {
  overall_status: 'healthy' | 'warning' | 'error';
  timestamp: string;
  is_healthy: boolean;
  has_errors: boolean;
  has_warnings: boolean;
  checks: ValidationResult[];
  recommendations: string[];
}

// Asset types (for future integration)
export enum AssetType {
  SERVER = 'server',
  WORKSTATION = 'workstation',
  NETWORK_DEVICE = 'network_device',
  DATABASE = 'database',
  WEB_APPLICATION = 'web_application',
  MOBILE_DEVICE = 'mobile_device',
  IOT_DEVICE = 'iot_device',
  CLOUD_SERVICE = 'cloud_service'
}

export interface Asset {
  id?: string;
  name: string;
  ip_address: string;
  type: AssetType;
  owner?: string;
  description?: string;
  risk_level: RiskLevel;
  
  // Metadata
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  is_active: boolean;
  
  // Additional asset information
  operating_system?: string;
  version?: string;
  location?: string;
  business_unit?: string;
}

// Risk assessment types
export interface RiskAssessment {
  id?: string;
  asset_id: string;
  
  // Risk scoring
  vulnerability_score: number; // 0-10
  threat_score: number; // 0-10
  business_impact_score: number; // 0-10
  overall_risk_score: number; // 0-10
  risk_level: RiskLevel;
  
  // Risk details
  category: string;
  severity: string;
  description?: string;
  mitigation_status: string;
  
  // Metadata
  assessed_at?: string;
  assessed_by?: string;
}

// Generic API response types
export interface MessageResponse {
  message: string;
  success: boolean;
}

export interface ErrorResponse {
  error: string;
  detail?: string;
  success: false;
}

export interface PaginationParams {
  skip?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  skip: number;
  limit: number;
  has_next: boolean;
  has_previous: boolean;
}

// Scan profile information for UI
export interface ScanProfileInfo {
  name: string;
  value: ScanProfile;
  description: string;
  estimated_duration: string;
  typical_ports: number;
  icon?: string;
  color?: string;
}

// Vulnerability information
export interface VulnerabilityInfo {
  id: string;
  title: string;
  severity: RiskLevel;
  cvss?: number;
  description: string;
  affected_hosts: number;
  cve_references: string[];
  solution?: string;
  first_seen: string;
  last_seen: string;
  status: 'open' | 'confirmed' | 'false_positive' | 'resolved';
}

// Notification types for real-time updates
export interface ScanNotification {
  type: 'scan_started' | 'scan_completed' | 'scan_failed' | 'scan_progress' | 'vulnerability_found';
  scan_id: string;
  message: string;
  timestamp: string;
  data?: Record<string, any>;
}

// Chart data types for dashboard
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface TimeSeriesDataPoint {
  timestamp: string;
  value: number;
  label?: string;
}

export interface ScanTrendData {
  date: string;
  scans_completed: number;
  vulnerabilities_found: number;
  average_risk_score: number;
}

// Form validation types
export interface ScanFormErrors {
  targets?: string;
  scan_profile?: string;
  custom_options?: string;
  general?: string;
}

export interface TargetValidationResult {
  target: string;
  valid: boolean;
  message: string;
  warnings: string[];
}

// UI state types
export interface ScanUIState {
  isLoading: boolean;
  error?: string;
  selectedScan?: string;
  showDetails: boolean;
  refreshInterval?: NodeJS.Timeout;
}

export interface ProgressUIState {
  scanId: string;
  progress: number;
  status: ScanStatus;
  message?: string;
  estimatedTimeLeft?: string;
}

// Constants for UI configuration
export const SCAN_STATUS_COLORS = {
  [ScanStatus.PENDING]: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
  [ScanStatus.RUNNING]: 'text-blue-400 bg-blue-500/20 border-blue-500/30',
  [ScanStatus.COMPLETED]: 'text-green-400 bg-green-500/20 border-green-500/30',
  [ScanStatus.FAILED]: 'text-red-400 bg-red-500/20 border-red-500/30',
  [ScanStatus.CANCELLED]: 'text-gray-400 bg-gray-500/20 border-gray-500/30',
};

export const RISK_LEVEL_COLORS = {
  [RiskLevel.CRITICAL]: 'text-red-400 bg-red-500/20 border-red-500/30',
  [RiskLevel.HIGH]: 'text-orange-400 bg-orange-500/20 border-orange-500/30',
  [RiskLevel.MEDIUM]: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
  [RiskLevel.LOW]: 'text-green-400 bg-green-500/20 border-green-500/30',
  [RiskLevel.INFO]: 'text-blue-400 bg-blue-500/20 border-blue-500/30',
};

export const SCAN_PROFILE_CONFIGS: Record<ScanProfile, ScanProfileInfo> = {
  [ScanProfile.QUICK]: {
    name: 'Quick Scan',
    value: ScanProfile.QUICK,
    description: 'Fast port scan for common services',
    estimated_duration: '2-5 minutes',
    typical_ports: 1000,
    icon: 'Zap',
    color: 'text-green-400'
  },
  [ScanProfile.FULL]: {
    name: 'Full Scan',
    value: ScanProfile.FULL,
    description: 'Comprehensive port and service detection',
    estimated_duration: '15-30 minutes',
    typical_ports: 65535,
    icon: 'Search',
    color: 'text-blue-400'
  },
  [ScanProfile.SERVICE_DETECTION]: {
    name: 'Service Detection',
    value: ScanProfile.SERVICE_DETECTION,
    description: 'Detailed service and version identification',
    estimated_duration: '5-15 minutes',
    typical_ports: 1000,
    icon: 'Eye',
    color: 'text-purple-400'
  },
  [ScanProfile.VULN_SCAN]: {
    name: 'Vulnerability Scan',
    value: ScanProfile.VULN_SCAN,
    description: 'Security vulnerability assessment',
    estimated_duration: '30-60 minutes',
    typical_ports: 1000,
    icon: 'Shield',
    color: 'text-red-400'
  },
  [ScanProfile.UDP_SCAN]: {
    name: 'UDP Scan',
    value: ScanProfile.UDP_SCAN,
    description: 'UDP port and service discovery',
    estimated_duration: '20-45 minutes',
    typical_ports: 1000,
    icon: 'Radio',
    color: 'text-orange-400'
  }
};