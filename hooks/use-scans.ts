/**
 * React Hooks for Scan Management
 * Custom hooks for handling scan operations and state
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { apiClient } from '@/lib/api-client';
import { 
  ScanResponse, 
  ScanDetailResponse, 
  ScanProgressResponse, 
  ScanStatsResponse,
  ScanCreate,
  ScanStatus,
  ScanProfile,
  ScanTargetValidation,
  SystemValidationReport,
  SCAN_PROFILE_CONFIGS,
  ScanProfileInfo
} from '@/types/api';

// Hook for managing scan list
export function useScans() {
  const { isSignedIn } = useUser();
  const [scans, setScans] = useState<ScanResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchScans = useCallback(async (params?: { skip?: number; limit?: number; status?: string }) => {
    console.log('🔵 fetchScans called:', { params });
    
    // For test endpoints, we don't need authentication
    setLoading(true);
    setError(null);

    try {
      console.log('📡 Calling apiClient.getScans...');
      const response = await apiClient.getScans(params);
      console.log('📡 apiClient.getScans response:', response);
      
      if (response.error) {
        setError(apiClient.formatError(response.error));
        console.error('❌ getScans error:', response.error);
      } else if (response.data) {
        console.log(`✅ fetchScans success: ${response.data.length} scans`);
        setScans(response.data);
      } else {
        console.warn('⚠️ getScans returned no data');
        setScans([]);
      }
    } catch (err) {
      setError('Failed to fetch scans');
      console.error('❌ Error fetching scans:', err);
    } finally {
      setLoading(false);
    }
  }, []); // Remove dependencies

  const refreshScans = useCallback(async () => {
    // Always allow refresh for test endpoints
    if (loading) return;

    setRefreshing(true);
    await fetchScans();
    setRefreshing(false);
  }, [loading, fetchScans]);

  const createScan = useCallback(async (scanData: ScanCreate): Promise<ScanResponse | null> => {
    // Always allow scan creation for test endpoints
    setError(null);

    try {
      const response = await apiClient.createScan(scanData);
      if (response.error) {
        setError(apiClient.formatError(response.error));
        return null;
      } else if (response.data) {
        console.log('✅ Scan created:', response.data);
        // Refresh the scan list to get the updated scans
        await fetchScans();
        
        // Create a basic scan response object for immediate return
        const basicScanResponse: ScanResponse = {
          id: response.data.scan_id,
          user_id: 'test-user',
          targets: scanData.targets,
          scan_profile: scanData.scan_profile,
          status: response.data.status as any,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          started_at: undefined,
          completed_at: undefined,
          duration_seconds: undefined,
          success: true,
          hosts_found: 0,
          hosts_up: 0,
          open_ports: 0,
          services_detected: [],
          vulnerabilities_found: 0,
          risk_score: 0,
          cve_references: []
        };
        
        return basicScanResponse;
      }
    } catch (err) {
      setError('Failed to create scan');
      console.error('Error creating scan:', err);
    }

    return null;
  }, [fetchScans]);

  const cancelScan = useCallback(async (scanId: string): Promise<boolean> => {
    if (!isSignedIn) return false;

    try {
      const response = await apiClient.cancelScan(scanId);
      if (response.error) {
        setError(apiClient.formatError(response.error));
        return false;
      } else {
        // Update scan status in the list - handle both scan_id and id
        setScans(prev => prev.map(scan => {
          const currentScanId = (scan as any).scan_id || scan.id;
          return currentScanId === scanId 
            ? { ...scan, status: ScanStatus.CANCELLED }
            : scan;
        }));
        return true;
      }
    } catch (err) {
      setError('Failed to cancel scan');
      console.error('Error cancelling scan:', err);
      return false;
    }
  }, [isSignedIn]);

  const deleteScan = useCallback(async (scanId: string): Promise<boolean> => {
    if (!isSignedIn) return false;

    try {
      const response = await apiClient.deleteScan(scanId);
      if (response.error) {
        setError(apiClient.formatError(response.error));
        return false;
      } else {
        // Remove scan from the list
        setScans(prev => prev.filter(scan => scan.id !== scanId));
        return true;
      }
    } catch (err) {
      setError('Failed to delete scan');
      console.error('Error deleting scan:', err);
      return false;
    }
  }, [isSignedIn]);

  // Auto-refresh scans on mount
  useEffect(() => {
    console.log('🔵 useScans effect triggered - fetching scans immediately');
    
    // Always fetch on mount for test endpoints
    fetchScans();
  }, [fetchScans]);

  return {
    scans,
    loading,
    error,
    refreshing,
    fetchScans,
    refreshScans,
    createScan,
    cancelScan,
    deleteScan,
    clearError: () => setError(null)
  };
}

// Hook for managing individual scan details
export function useScanDetails(scanId: string | null) {
  const { isSignedIn } = useUser();
  const [scanDetails, setScanDetails] = useState<ScanDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchScanDetails = useCallback(async () => {
    if (!isSignedIn || !scanId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.getScan(scanId);
      if (response.error) {
        setError(apiClient.formatError(response.error));
      } else if (response.data) {
        setScanDetails(response.data);
      }
    } catch (err) {
      setError('Failed to fetch scan details');
      console.error('Error fetching scan details:', err);
    } finally {
      setLoading(false);
    }
  }, [isSignedIn, scanId]);

  useEffect(() => {
    if (scanId) {
      fetchScanDetails();
    } else {
      setScanDetails(null);
    }
  }, [scanId, fetchScanDetails]);

  return {
    scanDetails,
    loading,
    error,
    refetch: fetchScanDetails,
    clearError: () => setError(null)
  };
}

// Hook for real-time scan progress tracking
export function useScanProgress(scanId: string | null, enabled: boolean = true) {
  const { isSignedIn } = useUser();
  const [progress, setProgress] = useState<ScanProgressResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  const fetchProgress = useCallback(async () => {
    if (!isSignedIn || !scanId || !enabled) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.getScanProgress(scanId);
      if (response.error) {
        setError(apiClient.formatError(response.error));
      } else if (response.data && mountedRef.current) {
        setProgress(response.data);

        // Stop polling if scan is complete
        if (['completed', 'failed', 'cancelled'].includes(response.data.status)) {
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
        }
      }
    } catch (err) {
      if (mountedRef.current) {
        setError('Failed to fetch scan progress');
        console.error('Error fetching scan progress:', err);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [isSignedIn, scanId, enabled]);

  const startPolling = useCallback(() => {
    // Removed automatic polling to reduce backend load
    // Users can manually refresh progress if needed
    if (!enabled || !scanId) return;

    // Only do initial fetch, no continuous polling
    fetchProgress();
  }, [enabled, scanId, fetchProgress]);

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (enabled && scanId) {
      startPolling();
    } else {
      stopPolling();
    }

    return () => {
      mountedRef.current = false;
      stopPolling();
    };
  }, [enabled, scanId, startPolling, stopPolling]);

  return {
    progress,
    loading,
    error,
    startPolling,
    stopPolling,
    clearError: () => setError(null)
  };
}

// Hook for scan statistics
export function useScanStats() {
  const { isSignedIn } = useUser();
  const [stats, setStats] = useState<ScanStatsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!isSignedIn || !apiClient.hasAuthToken()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.getScanStats();
      if (response.error) {
        setError(apiClient.formatError(response.error));
      } else if (response.data) {
        setStats(response.data);
      }
    } catch (err) {
      setError('Failed to fetch scan statistics');
      console.error('Error fetching scan stats:', err);
    } finally {
      setLoading(false);
    }
  }, [isSignedIn]);

  useEffect(() => {
    // Only fetch stats on mount if user is signed in and has auth token
    if (isSignedIn && apiClient.hasAuthToken()) {
      fetchStats();
    }
  }, [isSignedIn, fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
    clearError: () => setError(null)
  };
}

// Hook for target validation
export function useTargetValidation() {
  const { isSignedIn } = useUser();
  const [validation, setValidation] = useState<ScanTargetValidation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateTargets = useCallback(async (targets: string): Promise<ScanTargetValidation | null> => {
    if (!isSignedIn || !targets.trim()) return null;

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.validateTargets(targets);
      if (response.error) {
        setError(apiClient.formatError(response.error));
        return null;
      } else if (response.data) {
        setValidation(response.data);
        return response.data;
      }
    } catch (err) {
      setError('Failed to validate targets');
      console.error('Error validating targets:', err);
    } finally {
      setLoading(false);
    }

    return null;
  }, [isSignedIn]);

  return {
    validation,
    loading,
    error,
    validateTargets,
    clearValidation: () => setValidation(null),
    clearError: () => setError(null)
  };
}

// Hook for system health monitoring
export function useSystemHealth() {
  const [health, setHealth] = useState<SystemValidationReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSystemHealth = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.getSystemValidation();
      if (response.error) {
        setError(apiClient.formatError(response.error));
      } else if (response.data) {
        setHealth(response.data);
      }
    } catch (err) {
      setError('Failed to fetch system health');
      console.error('Error fetching system health:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSystemHealth();
  }, [fetchSystemHealth]);

  return {
    health,
    loading,
    error,
    refetch: fetchSystemHealth,
    clearError: () => setError(null)
  };
}

// Hook for scan profiles
export function useScanProfiles() {
  const [profiles, setProfiles] = useState<Array<{
    name: string;
    value: ScanProfile;
    description: string;
    estimated_duration: string;
    typical_ports: number;
  }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.getScanProfiles();
      if (response.error) {
        setError(apiClient.formatError(response.error));
      } else if (response.data) {
        // Map backend profiles to frontend format (use constants for now)
        setProfiles(Object.entries(SCAN_PROFILE_CONFIGS).map(([key, config]) => ({
          name: config.name,
          value: key as ScanProfile,
          description: config.description,
          estimated_duration: config.estimated_duration,
          typical_ports: config.typical_ports || 0,
        })));
      }
    } catch (err) {
      setError('Failed to fetch scan profiles');
      console.error('Error fetching scan profiles:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  return {
    profiles,
    loading,
    error,
    refetch: fetchProfiles,
    clearError: () => setError(null)
  };
}

// Hook for backend connectivity check
export function useBackendHealth() {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkHealth = useCallback(async () => {
    try {
      const healthy = await apiClient.ping();
      setIsOnline(healthy);
      setLastCheck(new Date());
    } catch (err) {
      setIsOnline(false);
      setLastCheck(new Date());
      console.error('Backend health check failed:', err);
    }
  }, []);

  useEffect(() => {
    // Initial health check only, no continuous polling to reduce backend load
    checkHealth();
  }, [checkHealth]);

  return {
    isOnline,
    lastCheck,
    recheckHealth: checkHealth
  };
}