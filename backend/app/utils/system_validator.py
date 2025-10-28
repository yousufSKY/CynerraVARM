"""
System Validation Utility
Validates system requirements and configuration for Nmap scanning
"""

import os
import sys
import shutil
import subprocess
import logging
from typing import Dict, Any, List, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime

logger = logging.getLogger(__name__)

@dataclass
class ValidationResult:
    """Result of a system validation check"""
    component: str
    status: str  # "healthy", "warning", "error"
    message: str
    details: Optional[Dict[str, Any]] = None

@dataclass
class SystemValidationReport:
    """Complete system validation report"""
    overall_status: str  # "healthy", "warning", "error"
    timestamp: datetime
    checks: List[ValidationResult]
    recommendations: List[str]
    
    def is_healthy(self) -> bool:
        """Check if system is healthy overall"""
        return self.overall_status == "healthy"
    
    def has_errors(self) -> bool:
        """Check if there are any error-level issues"""
        return any(check.status == "error" for check in self.checks)
    
    def has_warnings(self) -> bool:
        """Check if there are any warnings"""
        return any(check.status == "warning" for check in self.checks)

class SystemValidator:
    """
    Validates system requirements for Nmap scanning functionality
    """
    
    def __init__(self):
        """Initialize system validator"""
        pass
    
    def validate_system(self) -> SystemValidationReport:
        """
        Perform comprehensive system validation
        
        Returns:
            SystemValidationReport with all validation results
        """
        logger.info("🔍 Starting system validation for Nmap scanning")
        
        checks = []
        recommendations = []
        
        # Check Python version
        python_check = self._check_python_version()
        checks.append(python_check)
        
        # Check Nmap binary
        nmap_check = self._check_nmap_binary()
        checks.append(nmap_check)
        
        # Check required Python packages
        packages_check = self._check_python_packages()
        checks.append(packages_check)
        
        # Check Redis connectivity
        redis_check = self._check_redis_connection()
        checks.append(redis_check)
        
        # Check system permissions
        permissions_check = self._check_system_permissions()
        checks.append(permissions_check)
        
        # Check disk space
        disk_check = self._check_disk_space()
        checks.append(disk_check)
        
        # Check network connectivity
        network_check = self._check_network_connectivity()
        checks.append(network_check)
        
        # Check environment variables
        env_check = self._check_environment_variables()
        checks.append(env_check)
        
        # Determine overall status
        error_count = sum(1 for check in checks if check.status == "error")
        warning_count = sum(1 for check in checks if check.status == "warning")
        
        if error_count > 0:
            overall_status = "error"
            recommendations.append("Critical issues found - scanning functionality may not work properly")
        elif warning_count > 0:
            overall_status = "warning"
            recommendations.append("Some warnings detected - review and address if needed")
        else:
            overall_status = "healthy"
            recommendations.append("System is ready for Nmap scanning operations")
        
        # Generate specific recommendations
        recommendations.extend(self._generate_recommendations(checks))
        
        report = SystemValidationReport(
            overall_status=overall_status,
            timestamp=datetime.now(),
            checks=checks,
            recommendations=recommendations
        )
        
        logger.info(f"✅ System validation completed: {overall_status}")
        return report
    
    def _check_python_version(self) -> ValidationResult:
        """Check Python version requirements"""
        try:
            version = sys.version_info
            version_str = f"{version.major}.{version.minor}.{version.micro}"
            
            # Check if Python version is sufficient (3.8+)
            if version >= (3, 8):
                return ValidationResult(
                    component="python_version",
                    status="healthy",
                    message=f"Python {version_str} is supported",
                    details={"version": version_str, "executable": sys.executable}
                )
            else:
                return ValidationResult(
                    component="python_version",
                    status="error",
                    message=f"Python {version_str} is too old (minimum: 3.8)",
                    details={"version": version_str, "required": "3.8+"}
                )
                
        except Exception as e:
            return ValidationResult(
                component="python_version",
                status="error",
                message=f"Could not determine Python version: {str(e)}"
            )
    
    def _check_nmap_binary(self) -> ValidationResult:
        """Check if Nmap binary is available and working"""
        try:
            # Try to find nmap binary
            nmap_path = shutil.which("nmap")
            if not nmap_path:
                return ValidationResult(
                    component="nmap_binary",
                    status="error",
                    message="Nmap binary not found in PATH",
                    details={"path_checked": os.environ.get("PATH", "")}
                )
            
            # Try to run nmap --version
            try:
                result = subprocess.run(
                    [nmap_path, "--version"],
                    capture_output=True,
                    text=True,
                    timeout=10
                )
                
                if result.returncode == 0:
                    version_output = result.stdout.strip()
                    # Extract version number
                    version_line = version_output.split('\n')[0]
                    
                    return ValidationResult(
                        component="nmap_binary",
                        status="healthy",
                        message=f"Nmap is available and working",
                        details={
                            "path": nmap_path,
                            "version": version_line,
                            "full_output": version_output
                        }
                    )
                else:
                    return ValidationResult(
                        component="nmap_binary",
                        status="error",
                        message=f"Nmap binary failed with exit code {result.returncode}",
                        details={
                            "path": nmap_path,
                            "stderr": result.stderr,
                            "exit_code": result.returncode
                        }
                    )
                    
            except subprocess.TimeoutExpired:
                return ValidationResult(
                    component="nmap_binary",
                    status="error",
                    message="Nmap binary timeout (unresponsive)",
                    details={"path": nmap_path}
                )
                
        except Exception as e:
            return ValidationResult(
                component="nmap_binary",
                status="error",
                message=f"Error checking Nmap binary: {str(e)}"
            )
    
    def _check_python_packages(self) -> ValidationResult:
        """Check if required Python packages are installed"""
        required_packages = [
            ("celery", "5.0.0"),
            ("redis", "4.0.0"),
            ("defusedxml", "0.7.0"),
            ("firebase-admin", "6.0.0"),
            ("fastapi", "0.100.0"),
            ("pydantic", "2.0.0")
        ]
        
        missing_packages = []
        outdated_packages = []
        installed_packages = {}
        
        for package_name, min_version in required_packages:
            try:
                import importlib.metadata
                version = importlib.metadata.version(package_name)
                installed_packages[package_name] = version
                
                # Simple version comparison (not comprehensive)
                if self._compare_versions(version, min_version) < 0:
                    outdated_packages.append(f"{package_name} {version} (minimum: {min_version})")
                    
            except importlib.metadata.PackageNotFoundError:
                missing_packages.append(f"{package_name} (minimum: {min_version})")
            except Exception as e:
                missing_packages.append(f"{package_name} (error: {str(e)})")
        
        if missing_packages:
            return ValidationResult(
                component="python_packages",
                status="error",
                message=f"Missing required packages: {', '.join(missing_packages)}",
                details={
                    "missing": missing_packages,
                    "outdated": outdated_packages,
                    "installed": installed_packages
                }
            )
        elif outdated_packages:
            return ValidationResult(
                component="python_packages",
                status="warning",
                message=f"Outdated packages detected: {', '.join(outdated_packages)}",
                details={
                    "missing": missing_packages,
                    "outdated": outdated_packages,
                    "installed": installed_packages
                }
            )
        else:
            return ValidationResult(
                component="python_packages",
                status="healthy",
                message="All required packages are installed",
                details={"installed": installed_packages}
            )
    
    def _check_redis_connection(self) -> ValidationResult:
        """Check Redis connectivity for Celery"""
        try:
            import redis
            
            # Try to connect to Redis
            r = redis.Redis(host='localhost', port=6379, db=0, socket_timeout=5)
            
            # Test connection
            r.ping()
            
            # Get Redis info
            info = r.info()
            
            return ValidationResult(
                component="redis_connection",
                status="healthy",
                message="Redis connection successful",
                details={
                    "host": "localhost",
                    "port": 6379,
                    "version": info.get("redis_version", "unknown"),
                    "memory_usage": info.get("used_memory_human", "unknown")
                }
            )
            
        except ImportError:
            return ValidationResult(
                component="redis_connection",
                status="error",
                message="Redis package not installed"
            )
        except redis.ConnectionError as e:
            return ValidationResult(
                component="redis_connection",
                status="error",
                message=f"Could not connect to Redis: {str(e)}",
                details={"error_type": "ConnectionError"}
            )
        except Exception as e:
            return ValidationResult(
                component="redis_connection",
                status="error",
                message=f"Redis connection failed: {str(e)}"
            )
    
    def _check_system_permissions(self) -> ValidationResult:
        """Check system permissions for network scanning"""
        try:
            # Check if running as root (needed for some Nmap features)
            is_root = os.geteuid() == 0 if hasattr(os, 'geteuid') else False
            
            # Check if can create temporary files
            import tempfile
            try:
                with tempfile.NamedTemporaryFile() as tmp:
                    tmp.write(b"test")
                temp_file_ok = True
            except Exception:
                temp_file_ok = False
            
            details = {
                "is_root": is_root,
                "temp_file_access": temp_file_ok,
                "platform": sys.platform
            }
            
            if not temp_file_ok:
                return ValidationResult(
                    component="system_permissions",
                    status="error",
                    message="Cannot create temporary files",
                    details=details
                )
            elif not is_root and sys.platform.startswith("linux"):
                return ValidationResult(
                    component="system_permissions",
                    status="warning",
                    message="Not running as root - some Nmap features may be limited",
                    details=details
                )
            else:
                return ValidationResult(
                    component="system_permissions",
                    status="healthy",
                    message="System permissions are adequate",
                    details=details
                )
                
        except Exception as e:
            return ValidationResult(
                component="system_permissions",
                status="error",
                message=f"Error checking permissions: {str(e)}"
            )
    
    def _check_disk_space(self) -> ValidationResult:
        """Check available disk space"""
        try:
            import shutil
            
            # Check disk space in current directory
            total, used, free = shutil.disk_usage(".")
            
            # Convert to MB
            free_mb = free // (1024 * 1024)
            total_mb = total // (1024 * 1024)
            used_percent = (used / total) * 100
            
            details = {
                "free_mb": free_mb,
                "total_mb": total_mb,
                "used_percent": round(used_percent, 1)
            }
            
            if free_mb < 100:  # Less than 100MB
                return ValidationResult(
                    component="disk_space",
                    status="error",
                    message=f"Low disk space: {free_mb}MB free",
                    details=details
                )
            elif free_mb < 500:  # Less than 500MB
                return ValidationResult(
                    component="disk_space",
                    status="warning",
                    message=f"Limited disk space: {free_mb}MB free",
                    details=details
                )
            else:
                return ValidationResult(
                    component="disk_space",
                    status="healthy",
                    message=f"Adequate disk space: {free_mb}MB free",
                    details=details
                )
                
        except Exception as e:
            return ValidationResult(
                component="disk_space",
                status="warning",
                message=f"Could not check disk space: {str(e)}"
            )
    
    def _check_network_connectivity(self) -> ValidationResult:
        """Check basic network connectivity"""
        try:
            import socket
            
            # Test DNS resolution
            try:
                socket.gethostbyname("google.com")
                dns_ok = True
            except Exception:
                dns_ok = False
            
            # Test local network interface
            try:
                # Create a socket and connect to a dummy address
                s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
                s.settimeout(5)
                s.connect(("8.8.8.8", 80))
                local_ip = s.getsockname()[0]
                s.close()
                network_ok = True
            except Exception:
                local_ip = "unknown"
                network_ok = False
            
            details = {
                "dns_resolution": dns_ok,
                "network_interface": network_ok,
                "local_ip": local_ip
            }
            
            if not dns_ok or not network_ok:
                return ValidationResult(
                    component="network_connectivity",
                    status="warning",
                    message="Network connectivity issues detected",
                    details=details
                )
            else:
                return ValidationResult(
                    component="network_connectivity",
                    status="healthy",
                    message="Network connectivity is good",
                    details=details
                )
                
        except Exception as e:
            return ValidationResult(
                component="network_connectivity",
                status="warning",
                message=f"Could not check network connectivity: {str(e)}"
            )
    
    def _check_environment_variables(self) -> ValidationResult:
        """Check required environment variables"""
        required_env_vars = [
            "FIREBASE_CREDENTIALS_PATH",
            "CLERK_SECRET_KEY"
        ]
        
        missing_vars = []
        present_vars = []
        
        for var in required_env_vars:
            if os.environ.get(var):
                present_vars.append(var)
            else:
                missing_vars.append(var)
        
        details = {
            "required": required_env_vars,
            "present": present_vars,
            "missing": missing_vars
        }
        
        if missing_vars:
            return ValidationResult(
                component="environment_variables",
                status="warning",
                message=f"Missing environment variables: {', '.join(missing_vars)}",
                details=details
            )
        else:
            return ValidationResult(
                component="environment_variables",
                status="healthy",
                message="All required environment variables are set",
                details=details
            )
    
    def _generate_recommendations(self, checks: List[ValidationResult]) -> List[str]:
        """Generate recommendations based on validation results"""
        recommendations = []
        
        for check in checks:
            if check.status == "error":
                if check.component == "nmap_binary":
                    recommendations.append("Install Nmap: https://nmap.org/download.html")
                elif check.component == "python_packages":
                    recommendations.append("Run: pip install -r requirements.txt")
                elif check.component == "redis_connection":
                    recommendations.append("Install and start Redis server")
                elif check.component == "disk_space":
                    recommendations.append("Free up disk space before running scans")
            
            elif check.status == "warning":
                if check.component == "system_permissions":
                    recommendations.append("Consider running with elevated privileges for full Nmap functionality")
                elif check.component == "environment_variables":
                    recommendations.append("Set missing environment variables in .env file")
        
        return recommendations
    
    def _compare_versions(self, version1: str, version2: str) -> int:
        """
        Simple version comparison
        Returns: -1 if version1 < version2, 0 if equal, 1 if version1 > version2
        """
        try:
            v1_parts = [int(x) for x in version1.split('.')]
            v2_parts = [int(x) for x in version2.split('.')]
            
            # Pad shorter version with zeros
            max_len = max(len(v1_parts), len(v2_parts))
            v1_parts.extend([0] * (max_len - len(v1_parts)))
            v2_parts.extend([0] * (max_len - len(v2_parts)))
            
            for i in range(max_len):
                if v1_parts[i] < v2_parts[i]:
                    return -1
                elif v1_parts[i] > v2_parts[i]:
                    return 1
            
            return 0
            
        except Exception:
            # If version parsing fails, assume they're equal
            return 0

# Global validator instance
system_validator = SystemValidator()