"""
Data Models for Cynerra VARM
Pydantic models for Firebase integration
"""

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Dict, Any, List
from enum import Enum

class AssetType(str, Enum):
    SERVER = "server"
    WORKSTATION = "workstation"
    NETWORK_DEVICE = "network_device"
    DATABASE = "database"
    WEB_APPLICATION = "web_application"
    MOBILE_DEVICE = "mobile_device"
    IOT_DEVICE = "iot_device"
    CLOUD_SERVICE = "cloud_service"

class RiskLevel(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"

class ScanStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class ScanProfile(str, Enum):
    QUICK = "quick"
    FULL = "full"
    SERVICE_DETECTION = "service_detection"
    VULN_SCAN = "vuln_scan"
    UDP_SCAN = "udp_scan"

class Asset(BaseModel):
    """Asset model representing IT assets to be scanned"""
    id: Optional[str] = None
    name: str = Field(..., min_length=1, max_length=255)
    ip_address: str = Field(..., min_length=7, max_length=45)
    type: AssetType = AssetType.SERVER
    owner: Optional[str] = None
    description: Optional[str] = None
    risk_level: RiskLevel = RiskLevel.MEDIUM
    
    # Metadata
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    created_by: Optional[str] = None  # Clerk user ID
    is_active: bool = True
    
    # Additional asset information
    operating_system: Optional[str] = None
    version: Optional[str] = None
    location: Optional[str] = None
    business_unit: Optional[str] = None

class RiskAssessment(BaseModel):
    """Risk assessment model for tracking asset risks"""
    id: Optional[str] = None
    asset_id: str
    
    # Risk scoring
    vulnerability_score: float = Field(ge=0, le=10)
    threat_score: float = Field(ge=0, le=10)
    business_impact_score: float = Field(ge=0, le=10)
    overall_risk_score: float = Field(ge=0, le=10)
    risk_level: RiskLevel = RiskLevel.MEDIUM
    
    # Risk details
    category: str
    severity: str
    description: Optional[str] = None
    mitigation_status: str = "open"
    
    # Metadata
    assessed_at: Optional[datetime] = None
    assessed_by: Optional[str] = None  # Clerk user ID

class Scan(BaseModel):
    """Vulnerability scan model"""
    id: Optional[str] = None
    user_id: str = Field(..., description="Clerk user ID who initiated the scan")
    
    # Target information
    targets: str = Field(..., description="Target specification (IP, range, hostname)")
    scan_profile: ScanProfile = Field(..., description="Scan profile used")
    custom_options: Optional[str] = Field(None, description="Custom Nmap options")
    
    # Scan status and timing
    status: ScanStatus = ScanStatus.PENDING
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    duration_seconds: Optional[float] = None
    
    # Execution details
    task_id: Optional[str] = Field(None, description="Celery task ID")
    nmap_command: Optional[str] = Field(None, description="Actual nmap command executed")
    exit_code: Optional[int] = Field(None, description="Nmap exit code")
    
    # Results
    success: bool = False
    error_message: Optional[str] = None
    stdout_output: Optional[str] = None
    stderr_output: Optional[str] = None
    
    # Parsed results summary
    hosts_found: int = 0
    hosts_up: int = 0
    open_ports: int = 0
    services_detected: List[str] = Field(default_factory=list)
    vulnerabilities_found: int = 0
    risk_score: float = Field(default=0.0, ge=0.0, le=10.0)
    cve_references: List[str] = Field(default_factory=list)
    
    # Detailed results
    parsed_results: Optional[Dict[str, Any]] = Field(None, description="Full parsed scan results")
    
    # Metadata
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class NmapHost(BaseModel):
    """Individual host results from Nmap scan"""
    id: Optional[str] = None
    scan_id: str = Field(..., description="Parent scan ID")
    
    # Host identification
    ip_address: Optional[str] = None
    hostname: Optional[str] = None
    mac_address: Optional[str] = None
    vendor: Optional[str] = None
    status: str = "unknown"
    reason: Optional[str] = None
    
    # OS detection
    os_info: Optional[Dict[str, Any]] = None
    
    # Port information
    ports: List[Dict[str, Any]] = Field(default_factory=list)
    
    # Script results
    scripts: List[Dict[str, Any]] = Field(default_factory=list)
    
    # Risk assessment
    risk_score: float = Field(default=0.0, ge=0.0, le=10.0)
    vulnerability_count: int = 0
    
    # Metadata
    scanned_at: Optional[datetime] = None

class ScanSchedule(BaseModel):
    """Scheduled scan configuration"""
    id: Optional[str] = None
    user_id: str = Field(..., description="Clerk user ID who created the schedule")
    
    # Schedule information
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    
    # Scan configuration
    targets: str = Field(..., description="Target specification")
    scan_profile: ScanProfile = Field(..., description="Scan profile to use")
    custom_options: Optional[str] = None
    
    # Schedule configuration
    cron_expression: str = Field(..., description="Cron expression for scheduling")
    timezone: str = Field(default="UTC", description="Timezone for schedule")
    is_active: bool = True
    
    # Execution tracking
    last_run_at: Optional[datetime] = None
    next_run_at: Optional[datetime] = None
    run_count: int = 0
    failure_count: int = 0
    
    # Metadata
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class Report(BaseModel):
    """Report model for generated reports"""
    id: Optional[str] = None
    
    # Report information
    title: str
    report_type: str  # asset_summary, risk_analysis, scan_report
    format: str  # json, csv, pdf
    
    # Content
    data: Optional[Dict[str, Any]] = None
    file_path: Optional[str] = None
    
    # Filters applied
    filters: Optional[Dict[str, Any]] = None
    
    # Metadata
    generated_at: Optional[datetime] = None
    generated_by: Optional[str] = None  # Clerk user ID
    expires_at: Optional[datetime] = None
    
    # Status
    is_downloaded: bool = False
    download_count: int = 0