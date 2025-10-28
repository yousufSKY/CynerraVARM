"""
Nmap Scanning API Routes
Advanced vulnerability scanning endpoints with Nmap integration
Firebase/Firestore integration with background processing
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query, Path
from typing import List, Optional, Dict, Any
from datetime import datetime
import logging

from app.database import get_db, FirebaseManager, firebase_manager
from app.models import ScanStatus, ScanProfile
from app.schemas import (
    ScanCreate, ScanUpdate, ScanResponse, ScanDetailResponse, 
    ScanProgressResponse, ScanTargetValidation, ScanStatsResponse,
    MessageResponse, ErrorResponse
)
from app.utils.clerk_auth import get_current_user
from app.services.scan_service import ScanService
from app.utils.nmap_runner import nmap_runner
from app.utils.system_validator import system_validator

logger = logging.getLogger(__name__)
router = APIRouter()

# Initialize scan service (will be set up in main.py)
scan_service: Optional[ScanService] = None

def get_scan_service() -> ScanService:
    """Dependency to get scan service instance"""
    global scan_service
    if scan_service is None:
        scan_service = ScanService(firebase_manager)
    return scan_service

@router.post("/scans", response_model=Dict[str, str], status_code=status.HTTP_201_CREATED)
async def create_scan(
    scan_data: ScanCreate,
    current_user: Dict[str, Any] = Depends(get_current_user),
    service: ScanService = Depends(get_scan_service),
):
    """
    Create and initiate a new Nmap vulnerability scan
    
    The scan will be executed in the background and you can monitor
    progress using the scan ID returned by this endpoint.
    """
    try:
        user_id = current_user.get("user_id")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User ID not found in token"
            )
        
        scan_id = await service.create_scan(scan_data, user_id)
        
        logger.info(f"✅ Created scan {scan_id} for user {user_id}")
        return {
            "scan_id": scan_id,
            "message": "Scan created and queued for execution"
        }
        
    except ValueError as e:
        logger.warning(f"⚠️ Validation error creating scan: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"❌ Error creating scan: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create scan"
        )

@router.get("/scans", response_model=List[ScanResponse])
async def get_scans(
    skip: int = Query(0, ge=0, description="Number of scans to skip"),
    limit: int = Query(50, ge=1, le=200, description="Number of scans to return"),
    status_filter: Optional[ScanStatus] = Query(None, description="Filter by scan status"),
    current_user: Dict[str, Any] = Depends(get_current_user),
    service: ScanService = Depends(get_scan_service),
):
    """
    Get user's scans with optional filtering and pagination
    """
    try:
        user_id = current_user.get("user_id")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User ID not found in token"
            )
        
        scans = service.get_user_scans(
            user_id=user_id,
            limit=limit,
            offset=skip,
            status_filter=status_filter
        )
        
        return scans
        
    except Exception as e:
        logger.error(f"❌ Error getting scans: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve scans"
        )

@router.get("/scans/statistics", response_model=ScanStatsResponse)
async def get_scan_statistics(
    current_user: Dict[str, Any] = Depends(get_current_user),
    service: ScanService = Depends(get_scan_service),
):
    """
    Get aggregate scan statistics for the current user
    """
    try:
        user_id = current_user.get("user_id")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User ID not found in token"
            )
        
        stats = service.get_scan_statistics(user_id)
        return stats
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error getting scan statistics: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve scan statistics"
        )

@router.get("/scans/{scan_id}", response_model=ScanResponse)
async def get_scan(
    scan_id: str = Path(..., description="Scan ID"),
    current_user: Dict[str, Any] = Depends(get_current_user),
    service: ScanService = Depends(get_scan_service),
):
    """
    Get a specific scan by ID
    """
    try:
        user_id = current_user.get("user_id")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User ID not found in token"
            )
        
        scan_doc = service.get_scan(scan_id, user_id)
        if not scan_doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Scan not found"
            )
        
        return scan_doc
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error getting scan {scan_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve scan"
        )

@router.get("/scans/{scan_id}/details", response_model=ScanDetailResponse)
async def get_scan_details(
    scan_id: str = Path(..., description="Scan ID"),
    current_user: Dict[str, Any] = Depends(get_current_user),
    service: ScanService = Depends(get_scan_service),
):
    """
    Get detailed scan results including full output and parsed results
    """
    try:
        user_id = current_user.get("user_id")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User ID not found in token"
            )
        
        scan_doc = service.get_scan(scan_id, user_id)
        if not scan_doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Scan not found"
            )
        
        return scan_doc
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error getting scan details {scan_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve scan details"
        )

@router.get("/scans/{scan_id}/progress", response_model=ScanProgressResponse)
async def get_scan_progress(
    scan_id: str = Path(..., description="Scan ID"),
    current_user: Dict[str, Any] = Depends(get_current_user),
    service: ScanService = Depends(get_scan_service),
):
    """
    Get real-time scan progress and status information
    """
    try:
        user_id = current_user.get("user_id")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User ID not found in token"
            )
        
        progress_info = service.get_scan_progress(scan_id, user_id)
        if not progress_info:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Scan not found"
            )
        
        return progress_info
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error getting scan progress {scan_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve scan progress"
        )

@router.post("/scans/{scan_id}/cancel", response_model=MessageResponse)
async def cancel_scan(
    scan_id: str = Path(..., description="Scan ID"),
    current_user: Dict[str, Any] = Depends(get_current_user),
    service: ScanService = Depends(get_scan_service),
):
    """
    Cancel a running scan
    """
    try:
        user_id = current_user.get("user_id")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User ID not found in token"
            )
        
        success = service.cancel_scan(scan_id, user_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot cancel scan (not found or already completed)"
            )
        
        return {"message": f"Scan {scan_id} cancelled successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error cancelling scan {scan_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to cancel scan"
        )

@router.delete("/scans/{scan_id}", response_model=MessageResponse)
async def delete_scan(
    scan_id: str = Path(..., description="Scan ID"),
    current_user: Dict[str, Any] = Depends(get_current_user),
    service: ScanService = Depends(get_scan_service),
):
    """
    Delete a scan and all its data
    """
    try:
        user_id = current_user.get("user_id")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User ID not found in token"
            )
        
        success = service.delete_scan(scan_id, user_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Scan not found"
            )
        
        return {"message": f"Scan {scan_id} deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error deleting scan {scan_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete scan"
        )

@router.post("/scans/validate-targets", response_model=ScanTargetValidation)
async def validate_scan_targets(
    targets: str = Query(..., description="Target specification to validate"),
    current_user: Dict[str, Any] = Depends(get_current_user),
    service: ScanService = Depends(get_scan_service),
):
    """
    Validate scan targets before creating a scan
    
    Checks target format, security restrictions, and provides warnings
    """
    try:
        validation_result = service.validate_targets(targets)
        return validation_result
        
    except Exception as e:
        logger.error(f"❌ Error validating targets: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to validate targets"
        )



@router.get("/scan-profiles", response_model=List[Dict[str, Any]])
async def get_scan_profiles(
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Get available scan profiles and their descriptions
    """
    profiles = [
        {
            "id": ScanProfile.QUICK.value,
            "name": "Quick Scan",
            "description": "Fast scan of most common ports (top 1000)",
            "estimated_duration": "2-5 minutes",
            "nmap_options": "-T4 --top-ports 1000",
            "use_cases": ["Quick network discovery", "Basic port enumeration"]
        },
        {
            "id": ScanProfile.FULL.value,
            "name": "Full Scan",
            "description": "Comprehensive scan of all 65535 ports",
            "estimated_duration": "30-60 minutes",
            "nmap_options": "-T4 -p-",
            "use_cases": ["Complete port discovery", "Thorough security assessment"]
        },
        {
            "id": ScanProfile.SERVICE_DETECTION.value,
            "name": "Service Detection",
            "description": "Port scan with service version detection",
            "estimated_duration": "10-20 minutes",
            "nmap_options": "-T4 -sV -sC --top-ports 1000",
            "use_cases": ["Service enumeration", "Version identification"]
        },
        {
            "id": ScanProfile.VULN_SCAN.value,
            "name": "Vulnerability Scan",
            "description": "Service detection with vulnerability scripts",
            "estimated_duration": "20-45 minutes",
            "nmap_options": "-T4 -sV -sC --script vuln --top-ports 1000",
            "use_cases": ["Vulnerability assessment", "Security testing"]
        },
        {
            "id": ScanProfile.UDP_SCAN.value,
            "name": "UDP Scan",
            "description": "UDP port scan for common services",
            "estimated_duration": "15-30 minutes",
            "nmap_options": "-T4 -sU --top-ports 200",
            "use_cases": ["UDP service discovery", "Network protocol analysis"]
        }
    ]
    
    return profiles

@router.get("/system/validation", response_model=Dict[str, Any])
async def get_system_validation(
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Perform comprehensive system validation for scanning infrastructure
    
    Checks all system requirements, dependencies, and configuration
    """
    try:
        validation_report = system_validator.validate_system()
        
        return {
            "overall_status": validation_report.overall_status,
            "timestamp": validation_report.timestamp.isoformat(),
            "is_healthy": validation_report.is_healthy(),
            "has_errors": validation_report.has_errors(),
            "has_warnings": validation_report.has_warnings(),
            "checks": [
                {
                    "component": check.component,
                    "status": check.status,
                    "message": check.message,
                    "details": check.details
                }
                for check in validation_report.checks
            ],
            "recommendations": validation_report.recommendations
        }
        
    except Exception as e:
        logger.error(f"❌ Error performing system validation: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to perform system validation"
        )

@router.get("/system/health", response_model=Dict[str, Any])
async def get_system_health(
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """
    Get system health status for scanning infrastructure
    """
    try:
        # Check Nmap binary availability
        nmap_available = nmap_runner.check_nmap_binary()
        
        health_status = {
            "timestamp": datetime.now().isoformat(),
            "overall_status": "healthy" if nmap_available else "unhealthy",
            "components": {
                "nmap_binary": {
                    "status": "healthy" if nmap_available else "unhealthy",
                    "message": "Nmap binary available" if nmap_available else "Nmap binary not found"
                },
                "scan_profiles": {
                    "status": "healthy",
                    "available_profiles": len(ScanProfile),
                    "profiles": [profile.value for profile in ScanProfile]
                }
            }
        }
        
        return health_status
        
    except Exception as e:
        logger.error(f"❌ Error checking system health: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to check system health"
        )