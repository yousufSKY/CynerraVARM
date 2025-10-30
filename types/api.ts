/**
 * TypeScript Types for VARM API
 * Matches the real backend scanner schema
 */

// Enums matching backend models
export enum ScanStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING', 
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export enum ScanProfile {
  // Network Scans (Nmap) - Target: IP Address
  QUICK = 'quick',
  FULL = 'full',
  SERVICE_DETECTION = 'service-detect',
  VULNERABILITY = 'vulnerability',
  UDP = 'udp',
  
  // Web Application Scans (OWASP ZAP) - Target: URL
  ZAP_BASELINE = 'zap-baseline',
  ZAP_FULL = 'zap-full',
  ZAP_API = 'zap-api',
  
  // Web Server Scans (Nikto) - Target: URL
  NIKTO_BASIC = 'nikto-basic',
  NIKTO_FULL = 'nikto-full',
  NIKTO_FAST = 'nikto-fast',
  
  // SQL Injection Scans (SQLMap) - Target: URL with params
  SQLMAP_BASIC = 'sqlmap-basic',
  SQLMAP_THOROUGH = 'sqlmap-thorough',
  SQLMAP_AGGRESSIVE = 'sqlmap-aggressive'
}

export type ScannerType = 'port' | 'web';
export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

// Real backend API types
export interface ScanTriggerRequest {
  asset_id: string;
  target: string;
  profile: ScanProfile;
}

export interface ScanTriggerResponse {
  scan_id: string;
  status: string;
  message: string;
  status_url: string;
}

export interface Finding {
  finding_id: string;
  title: string;
  severity: Severity;
  description: string;
  affected_component: string;
  solution?: string;
  references?: string[];
  cwe_id?: string;
  cvss_score?: number;
  confidence?: string;          // ZAP specific
  osvdb_id?: string;            // Nikto specific  
  injection_types?: string[];   // SQLMap specific
}

export interface ScanSummary {
  total_findings: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  info: number;
  risk_score: number;           // 0-100
  risk_level: string;           // CRITICAL|HIGH|MEDIUM|LOW
  scanner: string;              // nmap|zap|nikto|sqlmap
  scanner_version: string;
  scan_duration_seconds?: number;
}

export interface ScanInfo {
  target: string;
  profile: ScanProfile;
  start_time: string;
  end_time: string;
}

export interface ScanResults {
  scan_id: string;
  asset_id: string;
  target: string;
  profile: ScanProfile;
  status: ScanStatus;
  scanner_type: ScannerType;     // NEW: port or web
  initiated_by_uid: string;
  started_at?: string;
  finished_at?: string;
  created_at: string;
  raw_xml_path?: string;
  error_message?: string;
  parsed_results?: {
    summary: ScanSummary;
    scan_info: ScanInfo;
    parsed_json: {
      findings: Finding[];
    };
  };
}

export interface ScanDetailResponse {
  scan_id: string;
  scan_info: ScanInfo;
  summary: ScanSummary;
  parsed_json: {
    findings: Finding[];
  };
  created_at: string;
}

export interface ScanHistoryItem {
  scan_id: string;
  target: string;
  profile: ScanProfile;
  status: ScanStatus;
  scanner_type: ScannerType;    // NEW: helps with filtering
  started_at?: string;
  finished_at?: string;
  created_at: string;
}

export interface ScanHistoryResponse {
  asset_id: string;
  scans: ScanHistoryItem[];
  total: number;
}

export interface ScanProgressResponse {
  scan_id: string;
  status: ScanStatus;
  progress?: number;        // 0-100
  message?: string;
  started_at?: string;
  estimated_completion?: string;
}

// Frontend-specific types for compatibility
export interface ScanCreate {
  targets: string;              // Maps to 'target' in backend
  scan_profile: ScanProfile;    // Maps to 'profile' in backend
  custom_options?: string;      // Not used in real backend
}

export interface ScanResponse {
  id: string;                   // Maps to scan_id
  user_id: string;              // Maps to initiated_by_uid
  targets: string;              // Maps to target
  scan_profile: ScanProfile;    // Maps to profile
  status: ScanStatus;
  scanner_type?: ScannerType;   // NEW
  created_at: string;
  updated_at?: string;
  started_at?: string;
  completed_at?: string;
  duration_seconds?: number;
  success: boolean;
  hosts_found: number;
  hosts_up: number;
  open_ports: number;
  services_detected: string[];
  vulnerabilities_found: number;
  risk_score: number;
  cve_references: string[];
  error_message?: string;
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

// Scan profile information for UI
export interface ScanProfileInfo {
  name: string;
  value: ScanProfile;
  description: string;
  estimated_duration: string;
  typical_ports?: number;
  scanner: 'nmap' | 'zap' | 'nikto' | 'sqlmap';
  targetType: 'ip' | 'url' | 'url-with-params';
  targetPlaceholder: string;
  icon?: string;
  color?: string;
  isAggressive?: boolean;
  warningMessage?: string;
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
  'CRITICAL': 'text-red-400 bg-red-500/20 border-red-500/30',
  'HIGH': 'text-orange-400 bg-orange-500/20 border-orange-500/30',
  'MEDIUM': 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
  'LOW': 'text-green-400 bg-green-500/20 border-green-500/30',
};

export const SCANNER_INFO = {
  nmap: {
    name: 'Nmap',
    icon: '🔍',
    color: 'text-blue-400 bg-blue-500/20 border-blue-500/30'
  },
  zap: {
    name: 'OWASP ZAP',
    icon: '🕷️',
    color: 'text-purple-400 bg-purple-500/20 border-purple-500/30'
  },
  nikto: {
    name: 'Nikto',
    icon: '🔧',
    color: 'text-green-400 bg-green-500/20 border-green-500/30'
  },
  sqlmap: {
    name: 'SQLMap',
    icon: '💉',
    color: 'text-red-400 bg-red-500/20 border-red-500/30'
  }
};

export const SCAN_PROFILE_CONFIGS: Record<ScanProfile, ScanProfileInfo> = {
  // Network Scans (Nmap)
  [ScanProfile.QUICK]: {
    name: 'Quick Port Scan',
    value: ScanProfile.QUICK,
    description: 'Fast port scan (1-1024)',
    estimated_duration: '~30 seconds',
    typical_ports: 1024,
    scanner: 'nmap',
    targetType: 'ip',
    targetPlaceholder: '192.168.1.1',
    icon: 'Zap',
    color: 'text-green-400'
  },
  [ScanProfile.FULL]: {
    name: 'Full Port Scan',
    value: ScanProfile.FULL,
    description: 'All ports (1-65535)',
    estimated_duration: '~5 minutes',
    typical_ports: 65535,
    scanner: 'nmap',
    targetType: 'ip',
    targetPlaceholder: '192.168.1.1',
    icon: 'Search',
    color: 'text-blue-400'
  },
  [ScanProfile.SERVICE_DETECTION]: {
    name: 'Service Detection',
    value: ScanProfile.SERVICE_DETECTION,
    description: 'Service version detection',
    estimated_duration: '~5 minutes',
    typical_ports: 1000,
    scanner: 'nmap',
    targetType: 'ip',
    targetPlaceholder: '192.168.1.1',
    icon: 'Eye',
    color: 'text-purple-400'
  },
  [ScanProfile.VULNERABILITY]: {
    name: 'Vulnerability Scan',
    value: ScanProfile.VULNERABILITY,
    description: 'NSE vulnerability scripts',
    estimated_duration: '15-30 minutes',
    typical_ports: 1000,
    scanner: 'nmap',
    targetType: 'ip',
    targetPlaceholder: '192.168.1.1',
    icon: 'Shield',
    color: 'text-red-400'
  },
  [ScanProfile.UDP]: {
    name: 'UDP Scan',
    value: ScanProfile.UDP,
    description: 'UDP port scan',
    estimated_duration: '2-5 minutes',
    typical_ports: 1000,
    scanner: 'nmap',
    targetType: 'ip',
    targetPlaceholder: '192.168.1.1',
    icon: 'Radio',
    color: 'text-orange-400'
  },
  
  // Web Application Scans (OWASP ZAP)
  [ScanProfile.ZAP_BASELINE]: {
    name: 'ZAP Baseline',
    value: ScanProfile.ZAP_BASELINE,
    description: 'Passive web app scan',
    estimated_duration: '~10 minutes',
    scanner: 'zap',
    targetType: 'url',
    targetPlaceholder: 'https://example.com',
    icon: 'Globe',
    color: 'text-purple-400'
  },
  [ScanProfile.ZAP_FULL]: {
    name: 'ZAP Full Active Scan',
    value: ScanProfile.ZAP_FULL,
    description: 'AGGRESSIVE active scan',
    estimated_duration: '~60 minutes',
    scanner: 'zap',
    targetType: 'url',
    targetPlaceholder: 'https://example.com',
    icon: 'AlertTriangle',
    color: 'text-red-500',
    isAggressive: true,
    warningMessage: '⚠️ WARNING: This is an AGGRESSIVE scan that may:\n• Exploit vulnerabilities\n• Affect system performance\n• Trigger security alerts\n\nOnly proceed with explicit authorization!'
  },
  [ScanProfile.ZAP_API]: {
    name: 'ZAP API Scan',
    value: ScanProfile.ZAP_API,
    description: 'API security testing',
    estimated_duration: '~30 minutes',
    scanner: 'zap',
    targetType: 'url',
    targetPlaceholder: 'https://api.example.com',
    icon: 'Code',
    color: 'text-blue-400'
  },
  
  // Web Server Scans (Nikto)
  [ScanProfile.NIKTO_BASIC]: {
    name: 'Nikto Basic',
    value: ScanProfile.NIKTO_BASIC,
    description: 'Basic server checks',
    estimated_duration: '~10 minutes',
    scanner: 'nikto',
    targetType: 'url',
    targetPlaceholder: 'https://example.com',
    icon: 'Server',
    color: 'text-green-400'
  },
  [ScanProfile.NIKTO_FULL]: {
    name: 'Nikto Comprehensive',
    value: ScanProfile.NIKTO_FULL,
    description: 'Comprehensive scan',
    estimated_duration: '~30 minutes',
    scanner: 'nikto',
    targetType: 'url',
    targetPlaceholder: 'https://example.com',
    icon: 'ServerCog',
    color: 'text-blue-400'
  },
  [ScanProfile.NIKTO_FAST]: {
    name: 'Nikto Fast',
    value: ScanProfile.NIKTO_FAST,
    description: 'Quick server scan',
    estimated_duration: '~5 minutes',
    scanner: 'nikto',
    targetType: 'url',
    targetPlaceholder: 'https://example.com',
    icon: 'Zap',
    color: 'text-cyan-400'
  },
  
  // SQL Injection Scans (SQLMap)
  [ScanProfile.SQLMAP_BASIC]: {
    name: 'SQLMap Basic',
    value: ScanProfile.SQLMAP_BASIC,
    description: 'Basic SQL injection test',
    estimated_duration: '~10 minutes',
    scanner: 'sqlmap',
    targetType: 'url-with-params',
    targetPlaceholder: 'http://example.com/page.php?id=1',
    icon: 'Database',
    color: 'text-yellow-400'
  },
  [ScanProfile.SQLMAP_THOROUGH]: {
    name: 'SQLMap Thorough',
    value: ScanProfile.SQLMAP_THOROUGH,
    description: 'Extensive testing',
    estimated_duration: '~30 minutes',
    scanner: 'sqlmap',
    targetType: 'url-with-params',
    targetPlaceholder: 'http://example.com/page.php?id=1',
    icon: 'Database',
    color: 'text-orange-400'
  },
  [ScanProfile.SQLMAP_AGGRESSIVE]: {
    name: 'SQLMap Aggressive',
    value: ScanProfile.SQLMAP_AGGRESSIVE,
    description: 'AGGRESSIVE - may exploit!',
    estimated_duration: '~60 minutes',
    scanner: 'sqlmap',
    targetType: 'url-with-params',
    targetPlaceholder: 'http://example.com/page.php?id=1',
    icon: 'AlertTriangle',
    color: 'text-red-500',
    isAggressive: true,
    warningMessage: '⚠️ WARNING: This is an AGGRESSIVE scan that may:\n• Exploit vulnerabilities\n• Modify database data\n• Affect system performance\n• Trigger security alerts\n\nOnly proceed with explicit authorization!'
  }
};
