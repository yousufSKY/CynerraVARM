"""
Nmap XML Parser
Safe parsing of Nmap XML output into structured JSON data
"""

import logging
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from datetime import datetime
import re

try:
    from defusedxml import ElementTree as ET
except ImportError:
    # Fallback to standard library with warning
    import xml.etree.ElementTree as ET
    logging.warning("⚠️ defusedxml not available, using standard xml.etree.ElementTree (less secure)")

logger = logging.getLogger(__name__)

@dataclass
class HostInfo:
    """Information about a scanned host"""
    ip: Optional[str] = None
    hostname: Optional[str] = None
    mac_address: Optional[str] = None
    vendor: Optional[str] = None
    status: str = "unknown"
    reason: Optional[str] = None

@dataclass
class PortInfo:
    """Information about a scanned port"""
    port: int
    protocol: str
    state: str
    service: Optional[str] = None
    version: Optional[str] = None
    product: Optional[str] = None
    extrainfo: Optional[str] = None
    reason: Optional[str] = None
    confidence: Optional[int] = None

@dataclass
class ScriptResult:
    """Nmap script execution result"""
    id: str
    output: str
    elements: Optional[Dict[str, Any]] = None

@dataclass
class ScanSummary:
    """Summary of scan results for quick analysis"""
    total_hosts: int = 0
    hosts_up: int = 0
    hosts_down: int = 0
    total_ports_scanned: int = 0
    open_ports: int = 0
    closed_ports: int = 0
    filtered_ports: int = 0
    services_detected: List[str] = None
    vulnerabilities_found: int = 0
    risk_score: float = 0.0
    
    def __post_init__(self):
        if self.services_detected is None:
            self.services_detected = []

@dataclass
class ParsedNmapResult:
    """Complete parsed Nmap scan result"""
    scan_info: Dict[str, Any]
    hosts: List[Dict[str, Any]]
    summary: ScanSummary
    raw_xml: str
    parse_errors: List[str] = None
    
    def __post_init__(self):
        if self.parse_errors is None:
            self.parse_errors = []

class NmapXMLParser:
    """
    Parser for Nmap XML output with security and error handling
    """
    
    # High-risk ports that increase security score
    HIGH_RISK_PORTS = {
        21: "FTP",
        22: "SSH", 
        23: "Telnet",
        25: "SMTP",
        53: "DNS",
        80: "HTTP",
        110: "POP3",
        135: "RPC",
        139: "NetBIOS",
        143: "IMAP",
        389: "LDAP",
        443: "HTTPS",
        445: "SMB",
        993: "IMAPS",
        995: "POP3S",
        1433: "MSSQL",
        1521: "Oracle",
        3306: "MySQL",
        3389: "RDP",
        5432: "PostgreSQL",
        5900: "VNC",
        6379: "Redis",
        27017: "MongoDB"
    }
    
    # Services that typically indicate vulnerabilities or require attention
    VULNERABLE_SERVICES = [
        "ftp", "telnet", "rsh", "rlogin", "finger", "netbios-ssn",
        "microsoft-ds", "msrpc", "ms-wbt-server"
    ]
    
    def __init__(self):
        """Initialize the parser"""
        pass
    
    def parse_xml(self, xml_content: str) -> ParsedNmapResult:
        """
        Parse Nmap XML output into structured data
        
        Args:
            xml_content: Raw XML content from nmap -oX output
            
        Returns:
            ParsedNmapResult with structured scan data
        """
        parse_errors = []
        
        try:
            # Parse XML with defusedxml for security
            root = ET.fromstring(xml_content)
            
            # Extract scan information
            scan_info = self._parse_scan_info(root)
            
            # Extract host information
            hosts = []
            for host_elem in root.findall('.//host'):
                try:
                    host_data = self._parse_host(host_elem)
                    hosts.append(host_data)
                except Exception as e:
                    parse_errors.append(f"Error parsing host: {str(e)}")
                    logger.warning(f"⚠️ Error parsing host: {str(e)}")
            
            # Generate summary
            summary = self._generate_summary(hosts)
            
            return ParsedNmapResult(
                scan_info=scan_info,
                hosts=hosts,
                summary=summary,
                raw_xml=xml_content,
                parse_errors=parse_errors
            )
            
        except ET.ParseError as e:
            error_msg = f"XML parsing error: {str(e)}"
            logger.error(f"❌ {error_msg}")
            return ParsedNmapResult(
                scan_info={},
                hosts=[],
                summary=ScanSummary(),
                raw_xml=xml_content,
                parse_errors=[error_msg]
            )
            
        except Exception as e:
            error_msg = f"Unexpected parsing error: {str(e)}"
            logger.error(f"❌ {error_msg}")
            return ParsedNmapResult(
                scan_info={},
                hosts=[],
                summary=ScanSummary(),
                raw_xml=xml_content,
                parse_errors=[error_msg]
            )
    
    def _parse_scan_info(self, root) -> Dict[str, Any]:
        """Extract scan metadata"""
        scan_info = {}
        
        try:
            # Basic scan info
            nmaprun = root
            scan_info.update({
                'nmap_version': nmaprun.get('version', ''),
                'xml_version': nmaprun.get('xmloutputversion', ''),
                'args': nmaprun.get('args', ''),
                'start_time': nmaprun.get('start', ''),
                'start_str': nmaprun.get('startstr', '')
            })
            
            # Scan arguments and timing
            scaninfo = root.find('.//scaninfo')
            if scaninfo is not None:
                scan_info.update({
                    'scan_type': scaninfo.get('type', ''),
                    'protocol': scaninfo.get('protocol', ''),
                    'num_services': scaninfo.get('numservices', ''),
                    'services': scaninfo.get('services', '')
                })
            
            # Run statistics
            runstats = root.find('.//runstats')
            if runstats is not None:
                finished = runstats.find('finished')
                if finished is not None:
                    scan_info.update({
                        'end_time': finished.get('time', ''),
                        'end_str': finished.get('timestr', ''),
                        'elapsed': finished.get('elapsed', ''),
                        'summary': finished.get('summary', '')
                    })
                
                hosts_elem = runstats.find('hosts')
                if hosts_elem is not None:
                    scan_info.update({
                        'hosts_up': int(hosts_elem.get('up', 0)),
                        'hosts_down': int(hosts_elem.get('down', 0)),
                        'hosts_total': int(hosts_elem.get('total', 0))
                    })
            
        except Exception as e:
            logger.warning(f"⚠️ Error parsing scan info: {str(e)}")
        
        return scan_info
    
    def _parse_host(self, host_elem) -> Dict[str, Any]:
        """Parse individual host information"""
        host_data = {
            'host_info': {},
            'ports': [],
            'scripts': [],
            'os_detection': {}
        }
        
        # Host information
        host_info = self._parse_host_info(host_elem)
        host_data['host_info'] = asdict(host_info)
        
        # Port information
        ports_elem = host_elem.find('ports')
        if ports_elem is not None:
            for port_elem in ports_elem.findall('port'):
                port_info = self._parse_port(port_elem)
                host_data['ports'].append(asdict(port_info))
        
        # Host scripts
        hostscript = host_elem.find('hostscript')
        if hostscript is not None:
            for script_elem in hostscript.findall('script'):
                script_info = self._parse_script(script_elem)
                host_data['scripts'].append(asdict(script_info))
        
        # OS detection
        os_elem = host_elem.find('os')
        if os_elem is not None:
            host_data['os_detection'] = self._parse_os_detection(os_elem)
        
        return host_data
    
    def _parse_host_info(self, host_elem) -> HostInfo:
        """Parse host identification information"""
        host_info = HostInfo()
        
        # Host status
        status_elem = host_elem.find('status')
        if status_elem is not None:
            host_info.status = status_elem.get('state', 'unknown')
            host_info.reason = status_elem.get('reason', '')
        
        # Address information
        for address_elem in host_elem.findall('address'):
            addr_type = address_elem.get('addrtype', '')
            addr = address_elem.get('addr', '')
            
            if addr_type == 'ipv4':
                host_info.ip = addr
            elif addr_type == 'mac':
                host_info.mac_address = addr
                host_info.vendor = address_elem.get('vendor', '')
        
        # Hostname information
        hostnames_elem = host_elem.find('hostnames')
        if hostnames_elem is not None:
            hostname_elem = hostnames_elem.find('hostname')
            if hostname_elem is not None:
                host_info.hostname = hostname_elem.get('name', '')
        
        return host_info
    
    def _parse_port(self, port_elem) -> PortInfo:
        """Parse port and service information"""
        port_info = PortInfo(
            port=int(port_elem.get('portid', 0)),
            protocol=port_elem.get('protocol', 'tcp')
        )
        
        # Port state
        state_elem = port_elem.find('state')
        if state_elem is not None:
            port_info.state = state_elem.get('state', 'unknown')
            port_info.reason = state_elem.get('reason', '')
        
        # Service information
        service_elem = port_elem.find('service')
        if service_elem is not None:
            port_info.service = service_elem.get('name', '')
            port_info.product = service_elem.get('product', '')
            port_info.version = service_elem.get('version', '')
            port_info.extrainfo = service_elem.get('extrainfo', '')
            
            # Service confidence
            conf = service_elem.get('conf')
            if conf:
                try:
                    port_info.confidence = int(conf)
                except ValueError:
                    pass
        
        return port_info
    
    def _parse_script(self, script_elem) -> ScriptResult:
        """Parse script execution results"""
        script_result = ScriptResult(
            id=script_elem.get('id', ''),
            output=script_elem.get('output', '')
        )
        
        # Parse script elements if present
        elements = {}
        for elem in script_elem.findall('.//elem'):
            key = elem.get('key', '')
            value = elem.text or ''
            if key:
                elements[key] = value
        
        if elements:
            script_result.elements = elements
        
        return script_result
    
    def _parse_os_detection(self, os_elem) -> Dict[str, Any]:
        """Parse OS detection results"""
        os_info = {}
        
        # OS matches
        os_matches = []
        for osmatch in os_elem.findall('osmatch'):
            match_info = {
                'name': osmatch.get('name', ''),
                'accuracy': osmatch.get('accuracy', ''),
                'line': osmatch.get('line', '')
            }
            
            # OS classes
            os_classes = []
            for osclass in osmatch.findall('osclass'):
                class_info = {
                    'type': osclass.get('type', ''),
                    'vendor': osclass.get('vendor', ''),
                    'osfamily': osclass.get('osfamily', ''),
                    'osgen': osclass.get('osgen', ''),
                    'accuracy': osclass.get('accuracy', '')
                }
                os_classes.append(class_info)
            
            if os_classes:
                match_info['os_classes'] = os_classes
            
            os_matches.append(match_info)
        
        if os_matches:
            os_info['matches'] = os_matches
        
        return os_info
    
    def _generate_summary(self, hosts: List[Dict[str, Any]]) -> ScanSummary:
        """Generate scan summary statistics"""
        summary = ScanSummary()
        
        summary.total_hosts = len(hosts)
        
        all_services = set()
        vulnerability_indicators = 0
        risk_factors = []
        
        for host in hosts:
            host_info = host.get('host_info', {})
            
            # Count host status
            if host_info.get('status') == 'up':
                summary.hosts_up += 1
            else:
                summary.hosts_down += 1
            
            # Analyze ports
            for port_data in host.get('ports', []):
                summary.total_ports_scanned += 1
                
                state = port_data.get('state', '')
                if state == 'open':
                    summary.open_ports += 1
                elif state == 'closed':
                    summary.closed_ports += 1
                elif state == 'filtered':
                    summary.filtered_ports += 1
                
                # Collect service information
                service = port_data.get('service', '')
                if service:
                    all_services.add(service)
                    
                    # Check for vulnerable services
                    if service.lower() in self.VULNERABLE_SERVICES:
                        vulnerability_indicators += 1
                        risk_factors.append(f"Vulnerable service: {service}")
                
                # Check for high-risk ports
                port_num = port_data.get('port', 0)
                if port_num in self.HIGH_RISK_PORTS and state == 'open':
                    risk_factors.append(f"High-risk port open: {port_num} ({self.HIGH_RISK_PORTS[port_num]})")
            
            # Check scripts for vulnerability indicators
            for script_data in host.get('scripts', []):
                script_id = script_data.get('id', '')
                if 'vuln' in script_id or 'cve' in script_id.lower():
                    vulnerability_indicators += 1
                    risk_factors.append(f"Vulnerability script: {script_id}")
        
        summary.services_detected = list(all_services)
        summary.vulnerabilities_found = vulnerability_indicators
        
        # Calculate basic risk score (0-10 scale)
        summary.risk_score = self._calculate_risk_score(summary, risk_factors)
        
        return summary
    
    def _calculate_risk_score(self, summary: ScanSummary, risk_factors: List[str]) -> float:
        """
        Calculate a basic risk score based on scan results
        
        Args:
            summary: Scan summary statistics
            risk_factors: List of identified risk factors
            
        Returns:
            Risk score from 0.0 (low risk) to 10.0 (high risk)
        """
        base_score = 0.0
        
        # Factor in open ports (more open ports = higher risk)
        if summary.open_ports > 0:
            # Cap at 20 ports for scoring purposes
            port_score = min(summary.open_ports / 20.0, 1.0) * 3.0
            base_score += port_score
        
        # Factor in vulnerable services
        if summary.vulnerabilities_found > 0:
            vuln_score = min(summary.vulnerabilities_found / 5.0, 1.0) * 4.0
            base_score += vuln_score
        
        # Factor in number of services (attack surface)
        service_count = len(summary.services_detected)
        if service_count > 0:
            service_score = min(service_count / 10.0, 1.0) * 2.0
            base_score += service_score
        
        # Additional risk factors
        risk_factor_score = min(len(risk_factors) / 10.0, 1.0) * 1.0
        base_score += risk_factor_score
        
        # Ensure score is within bounds
        return min(max(base_score, 0.0), 10.0)
    
    def extract_cve_references(self, parsed_result: ParsedNmapResult) -> List[str]:
        """
        Extract CVE references from scan results
        
        Args:
            parsed_result: Parsed Nmap scan result
            
        Returns:
            List of CVE identifiers found in scan output
        """
        cve_pattern = re.compile(r'CVE-\d{4}-\d{4,}', re.IGNORECASE)
        cves = set()
        
        # Search in script outputs
        for host in parsed_result.hosts:
            for script in host.get('scripts', []):
                output = script.get('output', '')
                cves.update(cve_pattern.findall(output))
        
        return sorted(list(cves))
    
    def to_dict(self, parsed_result: ParsedNmapResult) -> Dict[str, Any]:
        """Convert parsed result to dictionary format"""
        return asdict(parsed_result)
    
    def to_json_safe(self, parsed_result: ParsedNmapResult) -> Dict[str, Any]:
        """Convert to JSON-safe dictionary (without raw XML)"""
        result_dict = asdict(parsed_result)
        # Remove raw XML to save space in database
        result_dict.pop('raw_xml', None)
        return result_dict

# Global parser instance
nmap_parser = NmapXMLParser()