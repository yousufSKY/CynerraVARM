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
  
  // AI-Enhanced Network Scans (Nmap + AI Analysis) - Target: IP Address
  QUICK_AI = 'quick-ai',
  FULL_AI = 'full-ai',
  SERVICE_DETECTION_AI = 'service-detect-ai',
  VULNERABILITY_AI = 'vulnerability-ai',
  UDP_AI = 'udp-ai',
  
  // Web Application Scans (AI-Powered ZAP Analysis) - Target: URL
  // All map to 'ai-zap-analysis' backend profile
  ZAP_BASELINE = 'zap-baseline',
  ZAP_FULL = 'zap-full',
  ZAP_API = 'zap-api',
  
  // Web Server Scans (AI-Powered Nikto Analysis) - Target: URL
  // All map to 'ai-nikto-analysis' backend profile
  NIKTO_BASIC = 'nikto-basic',
  NIKTO_FULL = 'nikto-full',
  NIKTO_FAST = 'nikto-fast',
  
  // SQL Injection Scans (AI-Powered SQLMap Analysis) - Target: URL with params
  // All map to 'ai-sqlmap-analysis' backend profile
  SQLMAP_BASIC = 'sqlmap-basic',
  SQLMAP_THOROUGH = 'sqlmap-thorough',
  SQLMAP_AGGRESSIVE = 'sqlmap-aggressive'
}

// Map frontend profiles to backend API profiles
export const PROFILE_TO_API_MAP: Record<ScanProfile, string> = {
  [ScanProfile.QUICK]: 'quick',
  [ScanProfile.FULL]: 'full',
  [ScanProfile.SERVICE_DETECTION]: 'service-detect',
  [ScanProfile.VULNERABILITY]: 'vulnerability',
  [ScanProfile.UDP]: 'udp',
  // AI-Enhanced Network profiles map to their backend equivalents
  [ScanProfile.QUICK_AI]: 'quick-ai',
  [ScanProfile.FULL_AI]: 'full-ai',
  [ScanProfile.SERVICE_DETECTION_AI]: 'service-detect-ai',
  [ScanProfile.VULNERABILITY_AI]: 'vulnerability-ai',
  [ScanProfile.UDP_AI]: 'udp-ai',
  // Web profiles all map to their respective AI backend endpoints
  [ScanProfile.ZAP_BASELINE]: 'ai-zap-analysis',
  [ScanProfile.ZAP_FULL]: 'ai-zap-analysis',
  [ScanProfile.ZAP_API]: 'ai-zap-analysis',
  [ScanProfile.NIKTO_BASIC]: 'ai-nikto-analysis',
  [ScanProfile.NIKTO_FULL]: 'ai-nikto-analysis',
  [ScanProfile.NIKTO_FAST]: 'ai-nikto-analysis',
  [ScanProfile.SQLMAP_BASIC]: 'ai-sqlmap-analysis',
  [ScanProfile.SQLMAP_THOROUGH]: 'ai-sqlmap-analysis',
  [ScanProfile.SQLMAP_AGGRESSIVE]: 'ai-sqlmap-analysis',
};

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
  // AI-Enhanced Network Scan fields
  affected_service?: string;    // Service identifier (e.g., "ssh on 192.168.1.100:22")
  potential_impact?: string;    // Impact description
  cve_ids?: string[];           // Array of CVE IDs
  evidence?: string;            // Evidence for the finding
  remediation?: string;         // Same as solution (alias)
}

// AI Vulnerability Analysis for Network Scans
export interface AIVulnerabilityAnalysis {
  ai_analysis_available: boolean;
  model: string;                    // e.g., "gpt-4o"
  scan_id: string;
  
  analysis_summary: {
    target: string;
    total_services_analyzed: number;
    overall_risk_assessment: string;  // LOW|MEDIUM|HIGH|CRITICAL
    confidence_level: string;         // HIGH|MEDIUM|LOW
  };
  
  vulnerability_findings?: Array<{
    finding_id: string;
    title: string;
    severity: Severity;
    affected_service: string;
    description: string;
    potential_impact: string;
    cve_ids: string[];
    remediation: string;
  }>;
  
  standardized_findings: Finding[];  // Uses the extended Finding interface
  
  security_recommendations: string[];
  analysis_notes: string;
}

export interface ScanSummary {
  total_findings: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  info: number;
  risk_score: number;           // 0-100
  risk_level: string;           // CRITICAL|HIGH|MEDIUM|LOW|MINIMAL
  scanner: string;              // nmap|zap|nikto|sqlmap|ai
  scanner_version: string;
  scan_duration_seconds?: number;
  
  // AI-Enhanced Network Scan fields (for real Nmap + AI analysis)
  ai_enhanced?: boolean;         // true if AI analysis was performed
  ai_findings_count?: number;    // Number of vulnerabilities found by AI
  combined_risk_score?: number;  // Combined Nmap + AI risk (0-100)
  combined_risk_level?: string;  // MINIMAL|LOW|MEDIUM|HIGH|CRITICAL
  ai_error?: string;             // Error message if AI analysis failed
  
  // AI Web Scan fields (for simulated web vulnerability reports)
  ai_risk_assessment?: string;   // AI's assessment of overall risk
  tool_simulated?: string;       // Which tool's output was simulated (zap-baseline, nikto, sqlmap, etc.)
  scan_level?: string;           // quick|basic|detailed
  
  // Nmap-specific fields (for network scans)
  total_hosts?: number;
  hosts_up?: number;
  total_open_ports?: number;
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
      // AI Web Scan fields
      recommendations?: string[];
      tool_notes?: string;
      // AI-Enhanced Network Scan fields
      ai_vulnerability_analysis?: AIVulnerabilityAnalysis;
      hosts?: any[];  // Nmap host data
    };
  };
}

export interface ScanDetailResponse {
  scan_id: string;
  scan_info: ScanInfo;
  summary: ScanSummary;
  parsed_json: {
    findings: Finding[];
    // AI Web Scan fields
    recommendations?: string[];
    tool_notes?: string;
    // AI-Enhanced Network Scan fields
    ai_vulnerability_analysis?: AIVulnerabilityAnalysis;
    hosts?: any[];  // Nmap host data
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
  scan_id?: string;             // Direct scan_id from backend
  user_id: string;              // Maps to initiated_by_uid
  targets: string;              // Maps to target
  target?: string;              // Direct target from backend
  scan_profile: ScanProfile;    // Maps to profile
  profile?: string;             // Direct profile from backend
  status: ScanStatus;
  scanner_type?: ScannerType;   // NEW
  created_at: string;
  updated_at?: string;
  started_at?: string;
  completed_at?: string;
  finished_at?: string;         // Direct finished_at from backend
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
  parsed_results?: {            // Scan results from backend
    summary?: ScanSummary;
    scan_info?: ScanInfo;
    parsed_json?: {
      findings?: Finding[];
      recommendations?: string[];
      tool_notes?: string;
      ai_vulnerability_analysis?: AIVulnerabilityAnalysis;
      hosts?: any[];
    };
  };
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
  isAI?: boolean;              // Whether this is an AI-powered scan (web scans or AI-enhanced)
  aiEnhanced?: boolean;        // Whether this is a real scan with AI enhancement (network scans only)
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
    icon: 'ðŸ”',
    color: 'text-blue-400 bg-blue-500/20 border-blue-500/30'
  },
  zap: {
    name: 'OWASP ZAP',
    icon: 'ðŸ•·ï¸',
    color: 'text-purple-400 bg-purple-500/20 border-purple-500/30',
    aiPowered: true
  },
  nikto: {
    name: 'Nikto',
    icon: 'ðŸ”§',
    color: 'text-green-400 bg-green-500/20 border-green-500/30',
    aiPowered: true
  },
  sqlmap: {
    name: 'SQLMap',
    icon: 'ðŸ’‰',
    color: 'text-red-400 bg-red-500/20 border-red-500/30',
    aiPowered: true
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
  
  // AI-Enhanced Network Scans (Real Nmap + AI Vulnerability Analysis)
  [ScanProfile.QUICK_AI]: {
    name: 'Quick Scan + AI Analysis',
    value: ScanProfile.QUICK_AI,
    description: 'Fast port scan with AI vulnerability analysis',
    estimated_duration: '~2 minutes',
    typical_ports: 1000,
    scanner: 'nmap',
    targetType: 'ip',
    targetPlaceholder: '192.168.1.1',
    icon: 'Zap',
    color: 'text-cyan-400',
    isAI: true,
    aiEnhanced: true
  },
  [ScanProfile.FULL_AI]: {
    name: 'Full Scan + AI Analysis',
    value: ScanProfile.FULL_AI,
    description: 'Comprehensive port scan with AI vulnerability analysis',
    estimated_duration: '5-15 minutes',
    typical_ports: 65535,
    scanner: 'nmap',
    targetType: 'ip',
    targetPlaceholder: '192.168.1.1',
    icon: 'ShieldCheck',
    color: 'text-cyan-400',
    isAI: true,
    aiEnhanced: true
  },
  [ScanProfile.SERVICE_DETECTION_AI]: {
    name: 'Service Detection + AI',
    value: ScanProfile.SERVICE_DETECTION_AI,
    description: 'Service version detection with AI vulnerability analysis',
    estimated_duration: '~5 minutes',
    typical_ports: 1000,
    scanner: 'nmap',
    targetType: 'ip',
    targetPlaceholder: '192.168.1.1',
    icon: 'Eye',
    color: 'text-cyan-400',
    isAI: true,
    aiEnhanced: true
  },
  [ScanProfile.VULNERABILITY_AI]: {
    name: 'Vulnerability Scan + AI',
    value: ScanProfile.VULNERABILITY_AI,
    description: 'NSE vulnerability scripts with AI vulnerability analysis',
    estimated_duration: '15-30 minutes',
    typical_ports: 1000,
    scanner: 'nmap',
    targetType: 'ip',
    targetPlaceholder: '192.168.1.1',
    icon: 'Shield',
    color: 'text-cyan-400',
    isAI: true,
    aiEnhanced: true
  },
  [ScanProfile.UDP_AI]: {
    name: 'UDP Scan + AI',
    value: ScanProfile.UDP_AI,
    description: 'UDP port scan with AI vulnerability analysis',
    estimated_duration: '2-5 minutes',
    typical_ports: 1000,
    scanner: 'nmap',
    targetType: 'ip',
    targetPlaceholder: '192.168.1.1',
    icon: 'Radio',
    color: 'text-cyan-400',
    isAI: true,
    aiEnhanced: true
  },
  
  // Web Application Scans (AI-Powered OWASP ZAP Analysis)
  [ScanProfile.ZAP_BASELINE]: {
    name: 'ZAP Baseline',
    value: ScanProfile.ZAP_BASELINE,
    description: 'AI-powered passive web app analysis',
    estimated_duration: '~20 seconds',
    scanner: 'zap',
    targetType: 'url',
    targetPlaceholder: 'https://example.com',
    icon: 'Globe',
    color: 'text-purple-400',
    isAI: true
  },
  [ScanProfile.ZAP_FULL]: {
    name: 'ZAP Full Active Scan',
    value: ScanProfile.ZAP_FULL,
    description: 'AI-powered comprehensive web vulnerability analysis',
    estimated_duration: '~25 seconds',
    scanner: 'zap',
    targetType: 'url',
    targetPlaceholder: 'https://example.com',
    icon: 'AlertTriangle',
    color: 'text-red-500',
    isAI: true
  },
  [ScanProfile.ZAP_API]: {
    name: 'ZAP API Scan',
    value: ScanProfile.ZAP_API,
    description: 'AI-powered API security testing',
    estimated_duration: '~20 seconds',
    scanner: 'zap',
    targetType: 'url',
    targetPlaceholder: 'https://api.example.com',
    icon: 'Code',
    color: 'text-blue-400',
    isAI: true
  },
  
  // Web Server Scans (AI-Powered Nikto Analysis)
  [ScanProfile.NIKTO_BASIC]: {
    name: 'Nikto Basic',
    value: ScanProfile.NIKTO_BASIC,
    description: 'AI-powered basic server vulnerability checks',
    estimated_duration: '~20 seconds',
    scanner: 'nikto',
    targetType: 'url',
    targetPlaceholder: 'https://example.com',
    icon: 'Server',
    color: 'text-green-400',
    isAI: true
  },
  [ScanProfile.NIKTO_FULL]: {
    name: 'Nikto Comprehensive',
    value: ScanProfile.NIKTO_FULL,
    description: 'AI-powered comprehensive server analysis',
    estimated_duration: '~25 seconds',
    scanner: 'nikto',
    targetType: 'url',
    targetPlaceholder: 'https://example.com',
    icon: 'ServerCog',
    color: 'text-blue-400',
    isAI: true
  },
  [ScanProfile.NIKTO_FAST]: {
    name: 'Nikto Fast',
    value: ScanProfile.NIKTO_FAST,
    description: 'AI-powered quick server scan',
    estimated_duration: '~15 seconds',
    scanner: 'nikto',
    targetType: 'url',
    targetPlaceholder: 'https://example.com',
    icon: 'Zap',
    color: 'text-cyan-400',
    isAI: true
  },
  
  // SQL Injection Scans (AI-Powered SQLMap Analysis)
  [ScanProfile.SQLMAP_BASIC]: {
    name: 'SQLMap Basic',
    value: ScanProfile.SQLMAP_BASIC,
    description: 'AI-powered basic SQL injection analysis',
    estimated_duration: '~20 seconds',
    scanner: 'sqlmap',
    targetType: 'url-with-params',
    targetPlaceholder: 'http://example.com/page.php?id=1',
    icon: 'Database',
    color: 'text-yellow-400',
    isAI: true
  },
  [ScanProfile.SQLMAP_THOROUGH]: {
    name: 'SQLMap Thorough',
    value: ScanProfile.SQLMAP_THOROUGH,
    description: 'AI-powered extensive SQL injection testing',
    estimated_duration: '~25 seconds',
    scanner: 'sqlmap',
    targetType: 'url-with-params',
    targetPlaceholder: 'http://example.com/page.php?id=1',
    icon: 'Database',
    color: 'text-orange-400',
    isAI: true
  },
[ScanProfile.SQLMAP_AGGRESSIVE]: {
    name: 'SQLMap Aggressive',
    value: ScanProfile.SQLMAP_AGGRESSIVE,
    description: 'AI-powered comprehensive SQL injection analysis',
    estimated_duration: '~30 seconds',
    scanner: 'sqlmap',
    targetType: 'url-with-params',
    targetPlaceholder: 'http://example.com/page.php?id=1',
    icon: 'AlertTriangle',
    color: 'text-red-500',
    isAI: true
  }
};

