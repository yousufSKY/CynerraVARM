"""
Pydantic schemas for request/response serialization
Input validation and output formatting for Cynerra VARM API
"""

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

from app.models import AssetType, RiskLevel, ScanStatus, ScanProfile

# Asset Schemas
class AssetBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Asset name")
    ip_address: str = Field(..., description="IP address (IPv4 or IPv6)")
    type: AssetType = Field(default=AssetType.SERVER, description="Asset type")
    owner: Optional[str] = Field(None, max_length=255, description="Asset owner")
    description: Optional[str] = Field(None, description="Asset description")
    operating_system: Optional[str] = Field(None, max_length=100, description="Operating system")
    version: Optional[str] = Field(None, max_length=50, description="OS/software version")
    location: Optional[str] = Field(None, max_length=255, description="Physical location")
    business_unit: Optional[str] = Field(None, max_length=255, description="Business unit")

class AssetCreate(AssetBase):
    pass

class AssetUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    ip_address: Optional[str] = None
    type: Optional[AssetType] = None
    owner: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    operating_system: Optional[str] = Field(None, max_length=100)
    version: Optional[str] = Field(None, max_length=50)
    location: Optional[str] = Field(None, max_length=255)
    business_unit: Optional[str] = Field(None, max_length=255)
    is_active: Optional[bool] = None

class AssetResponse(AssetBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    risk_level: RiskLevel
    created_at: datetime
    updated_at: Optional[datetime]
    created_by: Optional[str]
    is_active: bool

# Risk Assessment Schemas
class RiskAssessmentBase(BaseModel):
    vulnerability_score: float = Field(..., ge=0.0, le=10.0, description="Vulnerability score (0-10)")
    threat_score: float = Field(..., ge=0.0, le=10.0, description="Threat score (0-10)")
    business_impact_score: float = Field(..., ge=0.0, le=10.0, description="Business impact score (0-10)")
    category: str = Field(..., max_length=100, description="Risk category")
    severity: RiskLevel = Field(..., description="Risk severity level")
    description: Optional[str] = Field(None, description="Risk description")
    mitigation_status: str = Field(default="open", description="Mitigation status")

class RiskAssessmentCreate(RiskAssessmentBase):
    asset_id: int = Field(..., description="Asset ID")

class RiskAssessmentUpdate(BaseModel):
    vulnerability_score: Optional[float] = Field(None, ge=0.0, le=10.0)
    threat_score: Optional[float] = Field(None, ge=0.0, le=10.0)
    business_impact_score: Optional[float] = Field(None, ge=0.0, le=10.0)
    category: Optional[str] = Field(None, max_length=100)
    severity: Optional[RiskLevel] = None
    description: Optional[str] = None
    mitigation_status: Optional[str] = None

class RiskAssessmentResponse(RiskAssessmentBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    asset_id: int
    overall_risk_score: float
    risk_level: RiskLevel
    assessed_at: datetime
    assessed_by: Optional[str]

# Scan Schemas
class ScanBase(BaseModel):
    targets: str = Field(..., description="Target specification (IP, range, hostname)")
    scan_profile: ScanProfile = Field(..., description="Scan profile to use")
    custom_options: Optional[str] = Field(None, description="Custom Nmap options")

class ScanCreate(ScanBase):
    pass

class ScanUpdate(BaseModel):
    status: Optional[ScanStatus] = None
    success: Optional[bool] = None
    error_message: Optional[str] = None
    hosts_found: Optional[int] = Field(None, ge=0)
    hosts_up: Optional[int] = Field(None, ge=0)
    open_ports: Optional[int] = Field(None, ge=0)
    vulnerabilities_found: Optional[int] = Field(None, ge=0)
    risk_score: Optional[float] = Field(None, ge=0.0, le=10.0)

class ScanResponse(ScanBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    user_id: str
    status: ScanStatus
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    duration_seconds: Optional[float]
    
    # Execution details
    task_id: Optional[str]
    nmap_command: Optional[str]
    exit_code: Optional[int]
    success: bool
    error_message: Optional[str]
    
    # Results summary
    hosts_found: int
    hosts_up: int
    open_ports: int
    services_detected: List[str]
    vulnerabilities_found: int
    risk_score: float
    cve_references: List[str]
    
    # Metadata
    created_at: datetime
    updated_at: Optional[datetime]

class ScanDetailResponse(ScanResponse):
    """Extended scan response with full results"""
    stdout_output: Optional[str]
    stderr_output: Optional[str]
    parsed_results: Optional[Dict[str, Any]]

class ScanProgressResponse(BaseModel):
    """Real-time scan progress information"""
    scan_id: str
    status: ScanStatus
    progress: int = Field(..., ge=0, le=100, description="Progress percentage")
    message: Optional[str] = None
    started_at: Optional[datetime]
    estimated_completion: Optional[datetime]

# Nmap Host Schemas
class NmapHostResponse(BaseModel):
    """Individual host scan results"""
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    scan_id: str
    ip_address: Optional[str]
    hostname: Optional[str]
    mac_address: Optional[str]
    vendor: Optional[str]
    status: str
    reason: Optional[str]
    os_info: Optional[Dict[str, Any]]
    ports: List[Dict[str, Any]]
    scripts: List[Dict[str, Any]]
    risk_score: float
    vulnerability_count: int
    scanned_at: Optional[datetime]

# Scan Schedule Schemas
class ScanScheduleBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Schedule name")
    description: Optional[str] = Field(None, description="Schedule description")
    targets: str = Field(..., description="Target specification")
    scan_profile: ScanProfile = Field(..., description="Scan profile to use")
    custom_options: Optional[str] = Field(None, description="Custom Nmap options")
    cron_expression: str = Field(..., description="Cron expression for scheduling")
    timezone: str = Field(default="UTC", description="Timezone for schedule")
    is_active: bool = Field(default=True, description="Whether schedule is active")

class ScanScheduleCreate(ScanScheduleBase):
    pass

class ScanScheduleUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    targets: Optional[str] = None
    scan_profile: Optional[ScanProfile] = None
    custom_options: Optional[str] = None
    cron_expression: Optional[str] = None
    timezone: Optional[str] = None
    is_active: Optional[bool] = None

class ScanScheduleResponse(ScanScheduleBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    user_id: str
    last_run_at: Optional[datetime]
    next_run_at: Optional[datetime]
    run_count: int
    failure_count: int
    created_at: datetime
    updated_at: Optional[datetime]

# Scan Statistics Schemas
class ScanStatsResponse(BaseModel):
    """Aggregate scan statistics"""
    total_scans: int
    scans_completed: int
    scans_failed: int
    scans_running: int
    total_hosts_scanned: int
    total_vulnerabilities: int
    average_risk_score: float
    last_scan_date: Optional[datetime]
    
    # Time-based statistics
    scans_last_24h: int
    scans_last_7d: int
    scans_last_30d: int

class ScanTargetValidation(BaseModel):
    """Target validation result"""
    target: str
    is_valid: bool
    message: str
    resolved_ips: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)

# Report Schemas
class ReportBase(BaseModel):
    title: str = Field(..., max_length=255, description="Report title")
    report_type: str = Field(..., max_length=50, description="Type of report")
    format: str = Field(..., max_length=10, description="Report format (json, csv, pdf)")
    filters: Optional[Dict[str, Any]] = Field(None, description="Filters applied to generate report")

class ReportCreate(ReportBase):
    pass

class ReportResponse(ReportBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    data: Optional[Dict[str, Any]]
    file_path: Optional[str]
    generated_at: datetime
    generated_by: Optional[str]
    expires_at: Optional[datetime]
    is_downloaded: bool
    download_count: int

# Generic Response Schemas
class MessageResponse(BaseModel):
    message: str
    success: bool = True

class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
    success: bool = False

# Pagination Schema
class PaginationParams(BaseModel):
    skip: int = Field(default=0, ge=0, description="Number of records to skip")
    limit: int = Field(default=100, ge=1, le=1000, description="Number of records to return")

class PaginatedResponse(BaseModel):
    items: List[Any]
    total: int
    skip: int
    limit: int
    has_next: bool
    has_previous: bool