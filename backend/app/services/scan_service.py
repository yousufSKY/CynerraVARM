"""
Scan Service
Business logic for managing vulnerability scans with Nmap integration
"""

import logging
import re
import ipaddress
import socket
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Optional, Tuple
from uuid import uuid4

from ..database import FirebaseManager
from ..models import Scan, ScanStatus, ScanProfile, NmapHost, ScanSchedule
from ..schemas import ScanCreate, ScanUpdate, ScanTargetValidation, ScanStatsResponse
from ..utils.nmap_runner import nmap_runner
from ..utils.nmap_worker import celery_app, execute_nmap_scan

logger = logging.getLogger(__name__)

class ScanService:
    """
    Service for managing vulnerability scans and related operations
    """
    
    # RFC 1918 private address ranges
    PRIVATE_RANGES = [
        ipaddress.IPv4Network('10.0.0.0/8'),
        ipaddress.IPv4Network('172.16.0.0/12'),
        ipaddress.IPv4Network('192.168.0.0/16'),
        ipaddress.IPv4Network('127.0.0.0/8'),  # Loopback
    ]
    
    # Forbidden target patterns for security
    FORBIDDEN_PATTERNS = [
        r'0\.0\.0\.0',  # Default route
        r'255\.255\.255\.255',  # Broadcast
        r'224\.\d+\.\d+\.\d+',  # Multicast
        r'169\.254\.\d+\.\d+',  # Link-local
    ]
    
    def __init__(self, db_manager: FirebaseManager):
        """
        Initialize scan service
        
        Args:
            db_manager: Firebase database manager instance
        """
        self.db = db_manager
    
    async def create_scan(self, scan_data: ScanCreate, user_id: str) -> str:
        """
        Create and initiate a new vulnerability scan
        
        Args:
            scan_data: Scan creation data
            user_id: Clerk user ID
            
        Returns:
            Scan ID of the created scan
            
        Raises:
            ValueError: If target validation fails
            RuntimeError: If scan creation fails
        """
        logger.info(f"🔍 Creating new scan for user {user_id}, targets: {scan_data.targets}")
        
        # Validate targets
        validation_result = self.validate_targets(scan_data.targets)
        if not validation_result.is_valid:
            raise ValueError(f"Target validation failed: {validation_result.message}")
        
        # Generate unique scan ID
        scan_id = str(uuid4())
        
        # Create scan record
        scan = Scan(
            id=scan_id,
            user_id=user_id,
            targets=scan_data.targets,
            scan_profile=scan_data.scan_profile,
            custom_options=scan_data.custom_options,
            status=ScanStatus.PENDING,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        
        try:
            # Save to database
            self.db.create_document('scans', scan_id, scan.model_dump(exclude_none=True))
            
            # Queue background task
            task = execute_nmap_scan.delay(
                scan_id=scan_id,
                targets=scan_data.targets,
                scan_profile=scan_data.scan_profile.value,
                user_id=user_id,
                custom_options=scan_data.custom_options
            )
            
            # Update with task ID
            self.db.update_document('scans', scan_id, {
                'task_id': task.id,
                'updated_at': datetime.now(timezone.utc)
            })
            
            logger.info(f"✅ Scan {scan_id} created and queued with task {task.id}")
            return scan_id
            
        except Exception as e:
            logger.error(f"❌ Failed to create scan: {str(e)}")
            # Cleanup on failure
            try:
                self.db.delete_document('scans', scan_id)
            except:
                pass
            raise RuntimeError(f"Failed to create scan: {str(e)}")
    
    def validate_targets(self, targets: str) -> ScanTargetValidation:
        """
        Validate scan targets for security and correctness
        
        Args:
            targets: Target specification string
            
        Returns:
            ScanTargetValidation with validation results
        """
        targets = targets.strip()
        resolved_ips = []
        warnings = []
        
        # Check for forbidden patterns
        for pattern in self.FORBIDDEN_PATTERNS:
            if re.search(pattern, targets):
                return ScanTargetValidation(
                    target=targets,
                    is_valid=False,
                    message=f"Forbidden target pattern detected: {pattern}",
                    resolved_ips=[],
                    warnings=[]
                )
        
        # Parse target types
        target_list = [t.strip() for t in targets.replace(',', ' ').split() if t.strip()]
        
        for target in target_list:
            try:
                # Check if it's an IP address
                if self._is_ip_address(target):
                    ip = ipaddress.ip_address(target)
                    
                    # Check if it's in a private range (recommended)
                    if not any(ip in network for network in self.PRIVATE_RANGES):
                        warnings.append(f"Public IP address detected: {target}")
                    
                    resolved_ips.append(str(ip))
                
                # Check if it's a CIDR range
                elif '/' in target:
                    network = ipaddress.ip_network(target, strict=False)
                    
                    # Limit network size for safety
                    if network.num_addresses > 1024:
                        return ScanTargetValidation(
                            target=targets,
                            is_valid=False,
                            message=f"Network too large: {target} ({network.num_addresses} addresses)",
                            resolved_ips=[],
                            warnings=warnings
                        )
                    
                    # Add first few IPs as examples
                    for i, ip in enumerate(network.hosts()):
                        if i >= 3:  # Limit examples
                            break
                        resolved_ips.append(str(ip))
                
                # Check if it's a hostname
                elif self._is_hostname(target):
                    try:
                        ip = socket.gethostbyname(target)
                        resolved_ips.append(ip)
                    except socket.gaierror:
                        warnings.append(f"Could not resolve hostname: {target}")
                
                # Check if it's an IP range (e.g., 192.168.1.1-10)
                elif '-' in target and '.' in target:
                    if not self._validate_ip_range(target):
                        return ScanTargetValidation(
                            target=targets,
                            is_valid=False,
                            message=f"Invalid IP range format: {target}",
                            resolved_ips=[],
                            warnings=warnings
                        )
                    warnings.append(f"IP range format: {target}")
                
                else:
                    return ScanTargetValidation(
                        target=targets,
                        is_valid=False,
                        message=f"Unrecognized target format: {target}",
                        resolved_ips=[],
                        warnings=warnings
                    )
                    
            except (ValueError, ipaddress.AddressValueError) as e:
                return ScanTargetValidation(
                    target=targets,
                    is_valid=False,
                    message=f"Invalid target: {target} - {str(e)}",
                    resolved_ips=[],
                    warnings=warnings
                )
        
        return ScanTargetValidation(
            target=targets,
            is_valid=True,
            message="Targets are valid",
            resolved_ips=resolved_ips,
            warnings=warnings
        )
    
    def get_scan(self, scan_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Get scan details by ID
        
        Args:
            scan_id: Scan identifier
            user_id: User ID for authorization
            
        Returns:
            Scan data or None if not found
        """
        try:
            scan_doc = self.db.get_document('scans', scan_id)
            if not scan_doc:
                return None
            
            # Check ownership
            if scan_doc.get('user_id') != user_id:
                logger.warning(f"⚠️ User {user_id} attempted to access scan {scan_id} owned by {scan_doc.get('user_id')}")
                return None
            
            return scan_doc
            
        except Exception as e:
            logger.error(f"❌ Failed to get scan {scan_id}: {str(e)}")
            return None
    
    def get_user_scans(
        self, 
        user_id: str, 
        limit: int = 50, 
        offset: int = 0,
        status_filter: Optional[ScanStatus] = None
    ) -> List[Dict[str, Any]]:
        """
        Get scans for a specific user
        
        Args:
            user_id: User ID
            limit: Maximum number of results
            offset: Number of results to skip
            status_filter: Optional status filter
            
        Returns:
            List of scan documents
        """
        try:
            scans_ref = self.db.db.collection('scans')
            query = scans_ref.where('user_id', '==', user_id)
            
            if status_filter:
                query = query.where('status', '==', status_filter.value)
            
            # Order by creation date (newest first)
            query = query.order_by('created_at', direction='DESCENDING')
            
            # Apply pagination
            if offset > 0:
                query = query.offset(offset)
            query = query.limit(limit)
            
            docs = query.get()
            return [{'id': doc.id, **doc.to_dict()} for doc in docs]
            
        except Exception as e:
            logger.error(f"❌ Failed to get user scans: {str(e)}")
            return []
    
    def get_scan_progress(self, scan_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Get real-time scan progress information
        
        Args:
            scan_id: Scan identifier
            user_id: User ID for authorization
            
        Returns:
            Progress information or None if not found
        """
        scan_doc = self.get_scan(scan_id, user_id)
        if not scan_doc:
            return None
        
        progress_info = {
            'scan_id': scan_id,
            'status': scan_doc.get('status', 'pending'),
            'progress': 0,
            'message': None,
            'started_at': scan_doc.get('started_at'),
            'estimated_completion': None
        }
        
        # Get Celery task progress if available
        task_id = scan_doc.get('task_id')
        if task_id:
            try:
                task_result = celery_app.AsyncResult(task_id)
                
                if task_result.state == 'PROGRESS':
                    meta = task_result.info or {}
                    progress_info.update({
                        'progress': meta.get('progress', 0),
                        'message': meta.get('status', '')
                    })
                elif task_result.state == 'SUCCESS':
                    progress_info['progress'] = 100
                    progress_info['message'] = 'Scan completed successfully'
                elif task_result.state == 'FAILURE':
                    progress_info['message'] = 'Scan failed'
                    
            except Exception as e:
                logger.warning(f"⚠️ Could not get task progress for {task_id}: {str(e)}")
        
        # Estimate completion time for running scans
        if scan_doc.get('status') == 'running' and scan_doc.get('started_at'):
            try:
                started_at = scan_doc['started_at']
                if isinstance(started_at, str):
                    started_at = datetime.fromisoformat(started_at.replace('Z', '+00:00'))
                
                elapsed = datetime.now(timezone.utc) - started_at
                
                # Rough estimation based on scan profile
                profile = scan_doc.get('scan_profile', 'quick')
                estimated_duration = {
                    'quick': 300,      # 5 minutes
                    'full': 1800,      # 30 minutes
                    'service_detection': 900,  # 15 minutes
                    'vuln_scan': 3600,   # 1 hour
                    'udp_scan': 2400     # 40 minutes
                }.get(profile, 600)
                
                if elapsed.total_seconds() < estimated_duration:
                    completion_time = started_at + timedelta(seconds=estimated_duration)
                    progress_info['estimated_completion'] = completion_time
                    
            except Exception as e:
                logger.warning(f"⚠️ Could not estimate completion time: {str(e)}")
        
        return progress_info
    
    def cancel_scan(self, scan_id: str, user_id: str) -> bool:
        """
        Cancel a running scan
        
        Args:
            scan_id: Scan identifier
            user_id: User ID for authorization
            
        Returns:
            True if successfully cancelled, False otherwise
        """
        scan_doc = self.get_scan(scan_id, user_id)
        if not scan_doc:
            return False
        
        current_status = scan_doc.get('status')
        if current_status in ['completed', 'failed', 'cancelled']:
            logger.warning(f"⚠️ Cannot cancel scan {scan_id} with status {current_status}")
            return False
        
        try:
            # Cancel Celery task if available
            task_id = scan_doc.get('task_id')
            if task_id:
                celery_app.control.revoke(task_id, terminate=True)
                logger.info(f"🚫 Cancelled Celery task {task_id}")
            
            # Update scan status
            self.db.update_document('scans', scan_id, {
                'status': ScanStatus.CANCELLED.value,
                'completed_at': datetime.now(timezone.utc),
                'updated_at': datetime.now(timezone.utc),
                'error_message': 'Scan cancelled by user'
            })
            
            logger.info(f"🚫 Scan {scan_id} cancelled by user {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to cancel scan {scan_id}: {str(e)}")
            return False
    
    def get_scan_statistics(self, user_id: str) -> ScanStatsResponse:
        """
        Get aggregate scan statistics for a user
        
        Args:
            user_id: User ID
            
        Returns:
            Aggregate scan statistics
        """
        try:
            scans_ref = self.db.db.collection('scans')
            user_scans = scans_ref.where('user_id', '==', user_id).get()
            
            stats = ScanStatsResponse(
                total_scans=0,
                scans_completed=0,
                scans_failed=0,
                scans_running=0,
                total_hosts_scanned=0,
                total_vulnerabilities=0,
                average_risk_score=0.0,
                last_scan_date=None,
                scans_last_24h=0,
                scans_last_7d=0,
                scans_last_30d=0
            )
            
            now = datetime.now(timezone.utc)
            risk_scores = []
            
            for scan_doc in user_scans:
                scan_data = scan_doc.to_dict()
                stats.total_scans += 1
                
                # Count by status
                status = scan_data.get('status', 'pending')
                if status == 'completed':
                    stats.scans_completed += 1
                elif status == 'failed':
                    stats.scans_failed += 1
                elif status == 'running':
                    stats.scans_running += 1
                
                # Aggregate metrics
                stats.total_hosts_scanned += scan_data.get('hosts_found', 0)
                stats.total_vulnerabilities += scan_data.get('vulnerabilities_found', 0)
                
                risk_score = scan_data.get('risk_score', 0.0)
                if risk_score > 0:
                    risk_scores.append(risk_score)
                
                # Time-based statistics
                created_at = scan_data.get('created_at')
                if created_at:
                    if isinstance(created_at, str):
                        created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
                    
                    if not stats.last_scan_date or created_at > stats.last_scan_date:
                        stats.last_scan_date = created_at
                    
                    time_diff = now - created_at
                    if time_diff.days <= 1:
                        stats.scans_last_24h += 1
                    if time_diff.days <= 7:
                        stats.scans_last_7d += 1
                    if time_diff.days <= 30:
                        stats.scans_last_30d += 1
            
            # Calculate average risk score
            if risk_scores:
                stats.average_risk_score = sum(risk_scores) / len(risk_scores)
            
            return stats
            
        except Exception as e:
            logger.error(f"❌ Failed to get scan statistics: {str(e)}")
            return ScanStatsResponse(
                total_scans=0,
                scans_completed=0,
                scans_failed=0,
                scans_running=0,
                total_hosts_scanned=0,
                total_vulnerabilities=0,
                average_risk_score=0.0,
                last_scan_date=None,
                scans_last_24h=0,
                scans_last_7d=0,
                scans_last_30d=0
            )
    
    def delete_scan(self, scan_id: str, user_id: str) -> bool:
        """
        Delete a scan and its results
        
        Args:
            scan_id: Scan identifier
            user_id: User ID for authorization
            
        Returns:
            True if successfully deleted, False otherwise
        """
        scan_doc = self.get_scan(scan_id, user_id)
        if not scan_doc:
            return False
        
        try:
            # Cancel if running
            if scan_doc.get('status') in ['pending', 'running']:
                self.cancel_scan(scan_id, user_id)
            
            # Delete scan document
            self.db.delete_document('scans', scan_id)
            
            # Delete related host documents
            hosts_ref = self.db.db.collection('nmap_hosts')
            host_docs = hosts_ref.where('scan_id', '==', scan_id).get()
            for host_doc in host_docs:
                host_doc.reference.delete()
            
            logger.info(f"🗑️ Deleted scan {scan_id} and related data")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to delete scan {scan_id}: {str(e)}")
            return False
    
    # Helper methods
    def _is_ip_address(self, target: str) -> bool:
        """Check if target is a valid IP address"""
        try:
            ipaddress.ip_address(target)
            return True
        except ValueError:
            return False
    
    def _is_hostname(self, target: str) -> bool:
        """Check if target looks like a hostname"""
        # Basic hostname validation
        if not target or len(target) > 253:
            return False
        
        # Check for valid hostname characters
        allowed = re.match(r'^[a-zA-Z0-9.-]+$', target)
        if not allowed:
            return False
        
        # Must not start or end with dots/hyphens
        if target.startswith('.') or target.endswith('.'):
            return False
        if target.startswith('-') or target.endswith('-'):
            return False
        
        return True
    
    def _validate_ip_range(self, target: str) -> bool:
        """Validate IP range format (e.g., 192.168.1.1-10)"""
        try:
            if target.count('-') != 1:
                return False
            
            base_ip, end_part = target.split('-')
            
            # Validate base IP
            ipaddress.ip_address(base_ip)
            
            # Validate end part (should be just the last octet)
            if not end_part.isdigit() or int(end_part) > 255:
                return False
            
            # Ensure range is reasonable
            base_parts = base_ip.split('.')
            start_last = int(base_parts[-1])
            end_last = int(end_part)
            
            if end_last <= start_last or (end_last - start_last) > 254:
                return False
            
            return True
            
        except (ValueError, IndexError):
            return False

# Create global service instance (will be initialized with db_manager in routes)
scan_service: Optional[ScanService] = None