"""
Nmap Runner Utility
Safe subprocess execution of Nmap commands with validation and security controls
"""

import subprocess
import shutil
import logging
import re
import ipaddress
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass
from enum import Enum

logger = logging.getLogger(__name__)

class ScanProfile(str, Enum):
    """Predefined scan profiles with safe command templates"""
    QUICK = "quick"
    FULL = "full"
    SERVICE_DETECTION = "service_detection"
    VULN_SCAN = "vuln_scan"
    UDP_SCAN = "udp_scan"

class ScanResult(str, Enum):
    """Scan execution result status"""
    SUCCESS = "success"
    TIMEOUT = "timeout"
    ERROR = "error"
    INVALID_TARGET = "invalid_target"
    NMAP_NOT_FOUND = "nmap_not_found"

@dataclass
class NmapExecutionResult:
    """Result of Nmap execution"""
    status: ScanResult
    xml_output: Optional[str] = None
    stderr_output: Optional[str] = None
    return_code: Optional[int] = None
    execution_time: Optional[float] = None
    error_message: Optional[str] = None

class NmapRunner:
    """
    Safe Nmap execution with security controls and validation
    """
    
    # Predefined command templates for each scan profile
    SCAN_PROFILES = {
        ScanProfile.QUICK: {
            "args": ["-sT", "-Pn", "-p1-1024", "-T3", "--min-rate", "100"],
            "timeout": 300,  # 5 minutes
            "description": "Quick TCP connect scan on common ports"
        },
        ScanProfile.FULL: {
            "args": ["-sT", "-Pn", "-p-", "-T4"],
            "timeout": 1800,  # 30 minutes
            "description": "Full TCP scan on all ports"
        },
        ScanProfile.SERVICE_DETECTION: {
            "args": ["-sT", "-sV", "-Pn", "-p1-65535", "-T4"],
            "timeout": 2400,  # 40 minutes
            "description": "Port and service version detection"
        },
        ScanProfile.VULN_SCAN: {
            "args": ["-sT", "-sV", "-sC", "-Pn", "-p1-1024", "-T3", "--script", "vuln"],
            "timeout": 1800,  # 30 minutes
            "description": "Vulnerability detection with NSE scripts"
        },
        ScanProfile.UDP_SCAN: {
            "args": ["-sU", "-Pn", "-p53,67,68,69,123,161,162,500,514,1434", "-T4"],
            "timeout": 900,   # 15 minutes
            "description": "UDP scan on common ports"
        }
    }
    
    # Private IP ranges (RFC 1918)
    PRIVATE_IP_RANGES = [
        ipaddress.ip_network('10.0.0.0/8'),
        ipaddress.ip_network('172.16.0.0/12'),
        ipaddress.ip_network('192.168.0.0/16'),
        ipaddress.ip_network('127.0.0.0/8'),  # localhost
    ]
    
    # Dangerous/forbidden targets
    FORBIDDEN_TARGETS = [
        # Broadcast addresses
        '255.255.255.255',
        '0.0.0.0',
        # Multicast ranges
        '224.0.0.0/4',
        # Reserved ranges
        '240.0.0.0/4',
    ]
    
    def __init__(self, nmap_path: Optional[str] = None):
        """
        Initialize NmapRunner
        
        Args:
            nmap_path: Custom path to nmap binary, if None will search in PATH
        """
        self.nmap_path = nmap_path or self._find_nmap_binary()
        self.is_available = self.nmap_path is not None
        
        if not self.is_available:
            logger.error("❌ Nmap binary not found in system PATH")
        else:
            logger.info(f"✅ Nmap found at: {self.nmap_path}")
    
    def _find_nmap_binary(self) -> Optional[str]:
        """Find nmap binary in system PATH"""
        return shutil.which("nmap")
    
    def validate_target(self, target: str) -> Tuple[bool, str]:
        """
        Validate scan target for security and safety
        
        Args:
            target: IP address, hostname, or CIDR range to validate
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        try:
            # Remove any whitespace
            target = target.strip()
            
            # Check for empty target
            if not target:
                return False, "Target cannot be empty"
            
            # Check for dangerous characters (command injection prevention)
            if re.search(r'[;&|`$(){}<>]', target):
                return False, "Target contains forbidden characters"
            
            # Check if it's a valid IP address
            try:
                ip = ipaddress.ip_address(target)
                
                # Check if it's in forbidden ranges
                for forbidden in self.FORBIDDEN_TARGETS:
                    if '/' in forbidden:
                        if ip in ipaddress.ip_network(forbidden):
                            return False, f"Target {target} is in forbidden range {forbidden}"
                    elif str(ip) == forbidden:
                        return False, f"Target {target} is forbidden"
                
                # For production, you might want to restrict to private networks only
                # Uncomment the following lines if you want to restrict to private IPs
                # is_private = any(ip in network for network in self.PRIVATE_IP_RANGES)
                # if not is_private:
                #     return False, f"Target {target} is not in allowed private network ranges"
                
                return True, "Valid IP address"
                
            except ValueError:
                # Not a valid IP, check if it's a hostname
                if self._is_valid_hostname(target):
                    return True, "Valid hostname"
                else:
                    return False, "Invalid hostname format"
                    
        except Exception as e:
            return False, f"Validation error: {str(e)}"
    
    def _is_valid_hostname(self, hostname: str) -> bool:
        """Validate hostname format"""
        if len(hostname) > 253:
            return False
        
        # Allow alphanumeric characters, hyphens, and dots
        if not re.match(r'^[a-zA-Z0-9.-]+$', hostname):
            return False
        
        # Split by dots and validate each part
        parts = hostname.split('.')
        for part in parts:
            if not part:  # Empty part (e.g., double dots)
                return False
            if len(part) > 63:
                return False
            if part.startswith('-') or part.endswith('-'):
                return False
        
        return True
    
    def get_scan_command(self, target: str, profile: ScanProfile) -> List[str]:
        """
        Build nmap command for given target and profile
        
        Args:
            target: Validated target to scan
            profile: Scan profile to use
            
        Returns:
            Complete nmap command as list of arguments
        """
        if profile not in self.SCAN_PROFILES:
            raise ValueError(f"Unknown scan profile: {profile}")
        
        profile_config = self.SCAN_PROFILES[profile]
        
        # Build command: nmap [profile_args] -oX - target
        command = [self.nmap_path] + profile_config["args"] + ["-oX", "-", target]
        
        return command
    
    def execute_scan(self, target: str, profile: ScanProfile = ScanProfile.QUICK) -> NmapExecutionResult:
        """
        Execute nmap scan with safety controls
        
        Args:
            target: Target to scan (IP or hostname)
            profile: Scan profile to use
            
        Returns:
            NmapExecutionResult with scan output or error information
        """
        import time
        
        start_time = time.time()
        
        # Check if nmap is available
        if not self.is_available:
            return NmapExecutionResult(
                status=ScanResult.NMAP_NOT_FOUND,
                error_message="Nmap binary not found on system"
            )
        
        # Validate target
        is_valid, validation_message = self.validate_target(target)
        if not is_valid:
            return NmapExecutionResult(
                status=ScanResult.INVALID_TARGET,
                error_message=f"Invalid target: {validation_message}"
            )
        
        # Build command
        try:
            command = self.get_scan_command(target, profile)
            timeout = self.SCAN_PROFILES[profile]["timeout"]
            
            logger.info(f"🔍 Executing nmap scan: {' '.join(command)}")
            
            # Execute nmap with timeout and capture output
            result = subprocess.run(
                command,
                capture_output=True,
                text=True,
                timeout=timeout,
                check=False  # Don't raise on non-zero exit codes
            )
            
            execution_time = time.time() - start_time
            
            # Process results
            if result.returncode == 0:
                logger.info(f"✅ Nmap scan completed successfully in {execution_time:.2f}s")
                return NmapExecutionResult(
                    status=ScanResult.SUCCESS,
                    xml_output=result.stdout,
                    stderr_output=result.stderr,
                    return_code=result.returncode,
                    execution_time=execution_time
                )
            else:
                logger.warning(f"⚠️ Nmap scan completed with non-zero exit code: {result.returncode}")
                return NmapExecutionResult(
                    status=ScanResult.ERROR,
                    xml_output=result.stdout if result.stdout else None,
                    stderr_output=result.stderr,
                    return_code=result.returncode,
                    execution_time=execution_time,
                    error_message=f"Nmap exited with code {result.returncode}: {result.stderr}"
                )
                
        except subprocess.TimeoutExpired:
            execution_time = time.time() - start_time
            logger.error(f"⏰ Nmap scan timed out after {execution_time:.2f}s")
            return NmapExecutionResult(
                status=ScanResult.TIMEOUT,
                execution_time=execution_time,
                error_message=f"Scan timed out after {timeout} seconds"
            )
            
        except Exception as e:
            execution_time = time.time() - start_time
            logger.error(f"❌ Nmap scan failed: {str(e)}")
            return NmapExecutionResult(
                status=ScanResult.ERROR,
                execution_time=execution_time,
                error_message=f"Scan execution failed: {str(e)}"
            )
    
    def get_available_profiles(self) -> Dict[str, Dict[str, Any]]:
        """Get information about available scan profiles"""
        return {
            profile.value: {
                "description": config["description"],
                "timeout": config["timeout"],
                "args": config["args"]
            }
            for profile, config in self.SCAN_PROFILES.items()
        }
    
    def test_nmap_installation(self) -> Dict[str, Any]:
        """
        Test nmap installation and return system information
        
        Returns:
            Dictionary with nmap version and capability information
        """
        if not self.is_available:
            return {
                "available": False,
                "error": "Nmap binary not found"
            }
        
        try:
            # Get nmap version
            version_result = subprocess.run(
                [self.nmap_path, "--version"],
                capture_output=True,
                text=True,
                timeout=10,
                check=False
            )
            
            return {
                "available": True,
                "path": self.nmap_path,
                "version_output": version_result.stdout,
                "return_code": version_result.returncode
            }
            
        except Exception as e:
            return {
                "available": False,
                "path": self.nmap_path,
                "error": str(e)
            }

# Global nmap runner instance
nmap_runner = NmapRunner()