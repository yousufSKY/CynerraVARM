"""
Nmap Background Worker
Celery worker for executing Nmap scans asynchronously
"""

import logging
import json
import traceback
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from celery import Celery
from celery.signals import worker_ready, worker_shutdown

from ..database import FirebaseManager
from .nmap_runner import nmap_runner, ScanProfile
from .nmap_parser import nmap_parser

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Celery app
celery_app = Celery(
    'nmap_worker',
    broker='redis://localhost:6379/0',
    backend='redis://localhost:6379/0'
)

# Celery configuration
celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    task_track_started=True,
    task_time_limit=3600,  # 1 hour max per task
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=50,
    result_expires=3600,  # Results expire after 1 hour
)

# Global database manager
db_manager: Optional[FirebaseManager] = None

@worker_ready.connect
def worker_ready_handler(sender=None, **kwargs):
    """Initialize database connection when worker starts"""
    global db_manager
    try:
        db_manager = FirebaseManager()
        logger.info("✅ Nmap worker initialized with database connection")
    except Exception as e:
        logger.error(f"❌ Failed to initialize database in worker: {str(e)}")

@worker_shutdown.connect
def worker_shutdown_handler(sender=None, **kwargs):
    """Cleanup when worker shuts down"""
    global db_manager
    if db_manager:
        db_manager.close()
        logger.info("🔒 Database connection closed")

@celery_app.task(bind=True, name='nmap_scan')
def execute_nmap_scan(
    self,
    scan_id: str,
    targets: str,
    scan_profile: str,
    user_id: str,
    custom_options: Optional[str] = None
) -> Dict[str, Any]:
    """
    Execute an Nmap scan in the background
    
    Args:
        self: Celery task instance
        scan_id: Unique identifier for this scan
        targets: Target specification (IP, range, hostname)
        scan_profile: Scan profile name (QUICK, FULL, etc.)
        user_id: ID of user who initiated the scan
        custom_options: Optional custom Nmap parameters
        
    Returns:
        Dict containing scan results and metadata
    """
    global db_manager
    
    if not db_manager:
        db_manager = FirebaseManager()
    
    start_time = datetime.now(timezone.utc)
    
    # Update scan status to running
    try:
        db_manager.update_document('scans', scan_id, {
            'status': 'running',
            'started_at': start_time,
            'updated_at': start_time,
            'task_id': self.request.id,
            'progress': 10
        })
        logger.info(f"🏃 Starting scan {scan_id} for user {user_id}")
    except Exception as e:
        logger.error(f"❌ Failed to update scan status to running: {str(e)}")
    
    try:
        # Validate scan profile
        try:
            profile = ScanProfile[scan_profile.upper()]
        except KeyError:
            raise ValueError(f"Invalid scan profile: {scan_profile}")
        
        # Update progress
        self.update_state(state='PROGRESS', meta={'progress': 20, 'status': 'Validating targets'})
        
        # Execute the scan
        logger.info(f"🔍 Executing {profile.name} scan on targets: {targets}")
        
        self.update_state(state='PROGRESS', meta={'progress': 30, 'status': 'Starting Nmap execution'})
        
        scan_result = nmap_runner.run_scan(
            targets=targets,
            profile=profile,
            custom_options=custom_options
        )
        
        self.update_state(state='PROGRESS', meta={'progress': 60, 'status': 'Scan completed, parsing results'})
        
        # Parse XML results if successful
        parsed_result = None
        if scan_result.success and scan_result.xml_output:
            try:
                parsed_result = nmap_parser.parse_xml(scan_result.xml_output)
                logger.info(f"✅ Parsed scan results: {parsed_result.summary.total_hosts} hosts, {parsed_result.summary.open_ports} open ports")
            except Exception as e:
                logger.warning(f"⚠️ Failed to parse XML output: {str(e)}")
        
        self.update_state(state='PROGRESS', meta={'progress': 80, 'status': 'Saving results to database'})
        
        end_time = datetime.now(timezone.utc)
        duration = (end_time - start_time).total_seconds()
        
        # Prepare result data
        result_data = {
            'scan_id': scan_id,
            'user_id': user_id,
            'targets': targets,
            'scan_profile': scan_profile,
            'status': 'completed' if scan_result.success else 'failed',
            'started_at': start_time,
            'completed_at': end_time,
            'duration_seconds': duration,
            'nmap_command': scan_result.command,
            'exit_code': scan_result.exit_code,
            'success': scan_result.success,
            'error_message': scan_result.error_message,
            'stdout_output': scan_result.stdout_output,
            'stderr_output': scan_result.stderr_output,
            'updated_at': end_time,
            'task_id': self.request.id
        }
        
        # Add parsed results if available
        if parsed_result:
            result_data.update({
                'parsed_results': nmap_parser.to_json_safe(parsed_result),
                'hosts_found': parsed_result.summary.total_hosts,
                'hosts_up': parsed_result.summary.hosts_up,
                'open_ports': parsed_result.summary.open_ports,
                'services_detected': parsed_result.summary.services_detected,
                'vulnerabilities_found': parsed_result.summary.vulnerabilities_found,
                'risk_score': parsed_result.summary.risk_score,
                'cve_references': nmap_parser.extract_cve_references(parsed_result)
            })
        
        # Store results in database
        try:
            db_manager.update_document('scans', scan_id, result_data)
            logger.info(f"✅ Scan {scan_id} completed and saved to database")
        except Exception as e:
            logger.error(f"❌ Failed to save scan results: {str(e)}")
            # Still return results even if database save fails
        
        self.update_state(state='SUCCESS', meta={'progress': 100, 'status': 'Scan completed successfully'})
        
        return {
            'scan_id': scan_id,
            'success': scan_result.success,
            'message': 'Scan completed successfully' if scan_result.success else 'Scan failed',
            'duration_seconds': duration,
            'hosts_found': parsed_result.summary.total_hosts if parsed_result else 0,
            'open_ports': parsed_result.summary.open_ports if parsed_result else 0,
            'risk_score': parsed_result.summary.risk_score if parsed_result else 0.0
        }
        
    except Exception as e:
        error_msg = str(e)
        error_traceback = traceback.format_exc()
        end_time = datetime.now(timezone.utc)
        duration = (end_time - start_time).total_seconds()
        
        logger.error(f"❌ Scan {scan_id} failed: {error_msg}")
        logger.error(f"Traceback: {error_traceback}")
        
        # Update scan status to failed
        try:
            db_manager.update_document('scans', scan_id, {
                'status': 'failed',
                'completed_at': end_time,
                'duration_seconds': duration,
                'error_message': error_msg,
                'error_traceback': error_traceback,
                'updated_at': end_time,
                'task_id': self.request.id
            })
        except Exception as db_error:
            logger.error(f"❌ Failed to update scan status to failed: {str(db_error)}")
        
        # Update task state
        self.update_state(
            state='FAILURE',
            meta={
                'progress': 0,
                'status': f'Scan failed: {error_msg}',
                'error': error_msg,
                'traceback': error_traceback
            }
        )
        
        # Re-raise the exception so Celery marks the task as failed
        raise

@celery_app.task(name='cleanup_old_scans')
def cleanup_old_scans(days_old: int = 30) -> Dict[str, Any]:
    """
    Cleanup old scan results from database
    
    Args:
        days_old: Delete scans older than this many days
        
    Returns:
        Dict with cleanup statistics
    """
    global db_manager
    
    if not db_manager:
        db_manager = FirebaseManager()
    
    try:
        from datetime import timedelta
        
        cutoff_date = datetime.now(timezone.utc) - timedelta(days=days_old)
        
        # Query old scans
        scans_ref = db_manager.db.collection('scans')
        old_scans = scans_ref.where('created_at', '<', cutoff_date).get()
        
        deleted_count = 0
        errors = []
        
        for scan_doc in old_scans:
            try:
                scan_doc.reference.delete()
                deleted_count += 1
            except Exception as e:
                errors.append(f"Failed to delete scan {scan_doc.id}: {str(e)}")
        
        logger.info(f"🧹 Cleanup completed: {deleted_count} old scans deleted")
        
        return {
            'deleted_count': deleted_count,
            'cutoff_date': cutoff_date.isoformat(),
            'errors': errors
        }
        
    except Exception as e:
        error_msg = f"Cleanup failed: {str(e)}"
        logger.error(f"❌ {error_msg}")
        raise

@celery_app.task(name='system_health_check')
def system_health_check() -> Dict[str, Any]:
    """
    Perform system health checks for the scanning infrastructure
    
    Returns:
        Dict with health check results
    """
    global db_manager
    
    health_status = {
        'timestamp': datetime.now(timezone.utc).isoformat(),
        'overall_status': 'healthy',
        'checks': {}
    }
    
    # Database connectivity check
    try:
        if not db_manager:
            db_manager = FirebaseManager()
        
        # Test database connection
        test_result = db_manager.health_check()
        health_status['checks']['database'] = {
            'status': 'healthy' if test_result else 'unhealthy',
            'message': 'Database connection successful' if test_result else 'Database connection failed'
        }
    except Exception as e:
        health_status['checks']['database'] = {
            'status': 'unhealthy',
            'message': f'Database check failed: {str(e)}'
        }
        health_status['overall_status'] = 'unhealthy'
    
    # Nmap binary check
    try:
        from .nmap_runner import nmap_runner
        binary_available = nmap_runner.check_nmap_binary()
        health_status['checks']['nmap_binary'] = {
            'status': 'healthy' if binary_available else 'unhealthy',
            'message': 'Nmap binary available' if binary_available else 'Nmap binary not found'
        }
        if not binary_available:
            health_status['overall_status'] = 'unhealthy'
    except Exception as e:
        health_status['checks']['nmap_binary'] = {
            'status': 'unhealthy',
            'message': f'Nmap check failed: {str(e)}'
        }
        health_status['overall_status'] = 'unhealthy'
    
    # Redis connectivity check
    try:
        celery_app.backend.get('health_check_test')
        health_status['checks']['redis'] = {
            'status': 'healthy',
            'message': 'Redis connection successful'
        }
    except Exception as e:
        health_status['checks']['redis'] = {
            'status': 'unhealthy',
            'message': f'Redis check failed: {str(e)}'
        }
        health_status['overall_status'] = 'unhealthy'
    
    logger.info(f"🏥 Health check completed: {health_status['overall_status']}")
    
    return health_status

# Export celery app for worker startup
__all__ = ['celery_app', 'execute_nmap_scan', 'cleanup_old_scans', 'system_health_check']