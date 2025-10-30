/**
 * Hook for monitoring scan status changes and emitting notifications
 */

import { useEffect, useRef } from 'react';
import { ScanResponse, ScanStatus } from '@/types/api';
import { useNotifications, createScanNotification } from '@/contexts/NotificationContext';

export function useScanStatusMonitor(scans: ScanResponse[]) {
  const { addNotification } = useNotifications();
  const previousScansRef = useRef<Map<string, ScanStatus>>(new Map());

  useEffect(() => {
    // Create a map of current scan statuses
    const currentScans = new Map<string, ScanStatus>();
    
    scans.forEach(scan => {
      const scanId = (scan as any).scan_id || scan.id;
      const target = (scan as any).target || scan.targets;
      
      if (!scanId) return;
      
      currentScans.set(scanId, scan.status);
      
      // Check if this scan's status has changed
      const previousStatus = previousScansRef.current.get(scanId);
      
      if (previousStatus && previousStatus !== scan.status) {
        // Status has changed - create notification
        const shouldNotify = 
          scan.status === ScanStatus.COMPLETED ||
          scan.status === ScanStatus.FAILED ||
          scan.status === ScanStatus.CANCELLED;
        
        if (shouldNotify) {
          const notification = createScanNotification(scanId, scan.status, target);
          addNotification(notification);
        }
      }
    });
    
    // Update the reference for next comparison
    previousScansRef.current = currentScans;
  }, [scans, addNotification]);
}
