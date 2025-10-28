"""
Scan Service
Business logic for managing vulnerability scans with Nmap integration
"""

import logging
import re
import ipaddress
import socket
import asyncio
import threading
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Optional, Tuple
from uuid import uuid4

from ..database import FirebaseManager
from ..models import Scan, ScanStatus, ScanProfile, NmapHost, ScanSchedule
from ..schemas import ScanCreate, ScanUpdate, ScanTargetValidation, ScanStatsResponse
from ..utils.nmap_runner import nmap_runner, ScanProfile as NmapScanProfile, ScanResult
from ..utils.nmap_parser import nmap_parser

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
            
            # Start scan in background thread to avoid blocking the API response
            scan_thread = threading.Thread(
                target=self._execute_scan_background,
                args=(scan_id, scan_data.targets, scan_data.scan_profile, user_id, scan_data.custom_options),
                daemon=True
            )
            scan_thread.start()
            
            logger.info(f"✅ Scan {scan_id} created and started in background")
            return scan_id
            
        except Exception as e:
            logger.error(f"❌ Failed to create scan: {str(e)}")
            # Cleanup on failure
            try:
                self.db.delete_document('scans', scan_id)
            except:
                pass
            raise RuntimeError(f"Failed to create scan: {str(e)}")
    
    def _execute_scan_background(self, scan_id: str, targets: str, scan_profile: ScanProfile, user_id: str, custom_options: Optional[str] = None):
        """
        Execute scan in background thread
        
        Args:
            scan_id: Scan identifier
            targets: Target specification
            scan_profile: Scan profile to use
            user_id: User ID
            custom_options: Custom scan options (ignored for now)
        """
        try:
            # Update status to running
            self.db.update_document('scans', scan_id, {
                'status': ScanStatus.RUNNING.value,
                'started_at': datetime.now(timezone.utc),
                'updated_at': datetime.now(timezone.utc)
            })
            
            logger.info(f"🚀 Starting scan execution for {scan_id}")
            
            # Convert scan profile to nmap profile
            nmap_profile_map = {
                ScanProfile.QUICK: NmapScanProfile.QUICK,
                ScanProfile.FULL: NmapScanProfile.FULL,
                ScanProfile.SERVICE_DETECTION: NmapScanProfile.SERVICE_DETECTION,
                ScanProfile.VULN_SCAN: NmapScanProfile.VULN_SCAN,
                ScanProfile.UDP_SCAN: NmapScanProfile.UDP_SCAN
            }
            
            nmap_profile = nmap_profile_map.get(scan_profile, NmapScanProfile.QUICK)
            
            # Parse targets and scan each one
            target_list = [t.strip() for t in targets.replace(',', ' ').split() if t.strip()]
            all_hosts = []
            hosts_found = 0
            vulnerabilities_found = 0
            
            for target in target_list:
                logger.info(f"🎯 Scanning target: {target}")
                
                # Execute nmap scan
                result = nmap_runner.execute_scan(target, nmap_profile)
                
                if result.status == ScanResult.SUCCESS and result.xml_output:
                    # Parse XML output
                    try:
                        parsed_result = nmap_parser.parse_xml(result.xml_output)
                        hosts = self._convert_parsed_hosts_to_models(parsed_result, scan_id)
                        all_hosts.extend(hosts)
                        hosts_found += len(hosts)
                        
                        # Count vulnerabilities (open ports)
                        for host in hosts:
                            vulnerabilities_found += len([p for p in host.ports if p.get('state') == 'open'])
                        
                        logger.info(f"✅ Target {target} scanned successfully: {len(hosts)} hosts found")
                        
                    except Exception as parse_error:
                        logger.error(f"❌ Failed to parse scan results for {target}: {str(parse_error)}")
                        
                else:
                    logger.error(f"❌ Scan failed for target {target}: {result.error_message}")
            
            # Save host results to database
            for host in all_hosts:
                try:
                    host_id = str(uuid4())
                    host_data = host.model_dump(exclude_none=True)
                    host_data['id'] = host_id
                    self.db.create_document('nmap_hosts', host_id, host_data)
                except Exception as e:
                    logger.error(f"❌ Failed to save host data: {str(e)}")
            
            # Calculate basic risk score (simplified)
            risk_score = min(100.0, (vulnerabilities_found * 10.0) + (hosts_found * 5.0))
            
            # Update scan as completed
            self.db.update_document('scans', scan_id, {
                'status': ScanStatus.COMPLETED.value,
                'completed_at': datetime.now(timezone.utc),
                'updated_at': datetime.now(timezone.utc),
                'hosts_found': hosts_found,
                'vulnerabilities_found': vulnerabilities_found,
                'risk_score': risk_score,
                'scan_results': {
                    'hosts_scanned': len(target_list),
                    'hosts_up': hosts_found,
                    'total_ports_found': sum(len(h.ports) for h in all_hosts),
                    'open_ports': sum(len([p for p in h.ports if p.get('state') == 'open']) for h in all_hosts)
                }
            })
            
            logger.info(f"✅ Scan {scan_id} completed successfully")
            
        except Exception as e:
            logger.error(f"❌ Scan {scan_id} failed: {str(e)}")
            
            # Update scan as failed
            try:
                self.db.update_document('scans', scan_id, {
                    'status': ScanStatus.FAILED.value,
                    'completed_at': datetime.now(timezone.utc),
                    'updated_at': datetime.now(timezone.utc),
                    'error_message': str(e)
                })
            except Exception as update_error:
                logger.error(f"❌ Failed to update scan status: {str(update_error)}")
    
    def _convert_parsed_hosts_to_models(self, parsed_result, scan_id: str) -> List[NmapHost]:
        """
        Convert parsed nmap result to NmapHost models
        
        Args:
            parsed_result: Parsed nmap XML result
            scan_id: Scan identifier
            
        Returns:
            List of NmapHost models
        """
        hosts = []
        
        for host_data in parsed_result.hosts:
            # Extract host info
            host_info = host_data.get('host_info', {})
            if isinstance(host_info, dict):
                ip_address = host_info.get('ip')
                hostname = host_info.get('hostname')
                status = host_info.get('status', 'unknown')
                mac_address = host_info.get('mac_address')
                vendor = host_info.get('vendor')
            else:
                # host_info might be a HostInfo dataclass instance
                ip_address = getattr(host_info, 'ip', None)
                hostname = getattr(host_info, 'hostname', None)
                status = getattr(host_info, 'status', 'unknown')
                mac_address = getattr(host_info, 'mac_address', None)
                vendor = getattr(host_info, 'vendor', None)
            
            # Convert ports - handle both dict and PortInfo dataclass instances
            ports = []
            for port_data in host_data.get('ports', []):
                if isinstance(port_data, dict):
                    # It's already a dict
                    port = {
                        'port': port_data.get('port', 0),
                        'protocol': port_data.get('protocol', 'tcp'),
                        'state': port_data.get('state', 'unknown'),
                        'service': port_data.get('service'),
                        'version': port_data.get('version'),
                        'product': port_data.get('product'),
                        'reason': port_data.get('reason'),
                        'confidence': port_data.get('confidence')
                    }
                else:
                    # It's a PortInfo dataclass instance
                    port = {
                        'port': getattr(port_data, 'port', 0),
                        'protocol': getattr(port_data, 'protocol', 'tcp'),
                        'state': getattr(port_data, 'state', 'unknown'),
                        'service': getattr(port_data, 'service', None),
                        'version': getattr(port_data, 'version', None),
                        'product': getattr(port_data, 'product', None),
                        'reason': getattr(port_data, 'reason', None),
                        'confidence': getattr(port_data, 'confidence', None)
                    }
                ports.append(port)
            
            # Handle OS detection
            os_detection = host_data.get('os_detection', {})
            if isinstance(os_detection, dict):
                os_name = os_detection.get('name')
                os_family = os_detection.get('family')
                os_accuracy = os_detection.get('accuracy')
            else:
                os_name = getattr(os_detection, 'name', None)
                os_family = getattr(os_detection, 'family', None)
                os_accuracy = getattr(os_detection, 'accuracy', None)
            
            # Create NmapHost model
            nmap_host = NmapHost(
                scan_id=scan_id,
                ip_address=ip_address,
                hostname=hostname,
                status=status,
                mac_address=mac_address,
                vendor=vendor,
                os_name=os_name,
                os_family=os_family,
                os_accuracy=os_accuracy,
                ports=ports,
                scripts=host_data.get('scripts', []),
                scan_time=datetime.now(timezone.utc)
            )
            
            hosts.append(nmap_host)
        
        return hosts
    
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
            
            # Temporarily remove ordering to avoid index requirement
            # TODO: Create composite index in Firebase console for user_id + created_at
            # query = query.order_by('created_at', direction='DESCENDING')
            
            # Apply pagination
            if offset > 0:
                query = query.offset(offset)
            query = query.limit(limit)
            
            docs = query.get()
            results = [{'id': doc.id, **doc.to_dict()} for doc in docs]
            
            # Sort in Python for now
            results.sort(key=lambda x: x.get('created_at', datetime.min), reverse=True)
            
            return results
            
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
        
        status = scan_doc.get('status', 'pending')
        progress_info = {
            'scan_id': scan_id,
            'status': status,
            'progress': 0,
            'message': None,
            'started_at': scan_doc.get('started_at'),
            'estimated_completion': None
        }
        
        # Calculate progress based on status
        if status == 'pending':
            progress_info['progress'] = 0
            progress_info['message'] = 'Scan is queued and waiting to start'
        elif status == 'running':
            progress_info['progress'] = 50  # Assume 50% when running (no detailed progress tracking yet)
            progress_info['message'] = 'Scan is currently running'
        elif status == 'completed':
            progress_info['progress'] = 100
            progress_info['message'] = 'Scan completed successfully'
        elif status == 'failed':
            progress_info['progress'] = 0
            progress_info['message'] = scan_doc.get('error_message', 'Scan failed')
        elif status == 'cancelled':
            progress_info['progress'] = 0
            progress_info['message'] = 'Scan was cancelled'
        
        # Estimate completion time for running scans
        if status == 'running' and scan_doc.get('started_at'):
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
                    # Update progress based on elapsed time
                    progress_info['progress'] = min(90, int((elapsed.total_seconds() / estimated_duration) * 100))
                    
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
            # Note: With direct execution, we can't easily interrupt running scans
            # For now, just mark as cancelled - in production you'd want to implement
            # proper cancellation mechanisms (process groups, etc.)
            
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