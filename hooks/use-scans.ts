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
    if (!isSignedIn || !apiClient.hasAuthToken()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.getScans(params);
      if (response.error) {
        setError(apiClient.formatError(response.error));
      } else if (response.data) {
        setScans(response.data);
      }
    } catch (err) {
      setError('Failed to fetch scans');
      console.error('Error fetching scans:', err);
    } finally {
      setLoading(false);
    }
  }, [isSignedIn]);

  const refreshScans = useCallback(async () => {
    if (!isSignedIn || loading) return;

    setRefreshing(true);
    await fetchScans();
    setRefreshing(false);
  }, [isSignedIn, loading, fetchScans]);

  const createScan = useCallback(async (scanData: ScanCreate): Promise<ScanResponse | null> => {
    if (!isSignedIn) return null;

    setError(null);

    try {
      const response = await apiClient.createScan(scanData);
      if (response.error) {
        setError(apiClient.formatError(response.error));
        return null;
      } else if (response.data) {
        // Add new scan to the list
        setScans(prev => [response.data!, ...prev]);
        return response.data;
      }
    } catch (err) {
      setError('Failed to create scan');
      console.error('Error creating scan:', err);
    }

    return null;
  }, [isSignedIn]);

  const cancelScan = useCallback(async (scanId: string): Promise<boolean> => {
    if (!isSignedIn) return false;

    try {
      const response = await apiClient.cancelScan(scanId);
      if (response.error) {
        setError(apiClient.formatError(response.error));
        return false;
      } else {
        // Update scan status in the list
        setScans(prev => prev.map(scan => 
          scan.id === scanId 
            ? { ...scan, status: ScanStatus.CANCELLED }
            : scan
        ));
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

  // Auto-refresh scans on mount and when user signs in
  useEffect(() => {
    if (isSignedIn) {
      // Wait a bit for the auth token to be set by ApiProvider
      const timer = setTimeout(() => {
        if (apiClient.hasAuthToken()) {
          fetchScans();
        } else {
          // Retry after another brief delay
          setTimeout(() => {
            if (apiClient.hasAuthToken()) {
              fetchScans();
            }
          }, 500);
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isSignedIn, fetchScans]);

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
    if (!enabled || !scanId || pollIntervalRef.current) return;

    // Initial fetch
    fetchProgress();

    // Start polling every 2 seconds
    pollIntervalRef.current = setInterval(fetchProgress, 2000);
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
    if (isSignedIn) {
      // Wait a bit for the auth token to be set by ApiProvider
      const timer = setTimeout(() => {
        if (apiClient.hasAuthToken()) {
          fetchStats();
        } else {
          // Retry after another brief delay
          setTimeout(() => {
            if (apiClient.hasAuthToken()) {
              fetchStats();
            }
          }, 500);
        }
      }, 100);
      
      return () => clearTimeout(timer);
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
          typical_ports: config.typical_ports,
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
    checkHealth();
    
    // Check every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    
    return () => clearInterval(interval);
  }, [checkHealth]);

  return {
    isOnline,
    lastCheck,
    recheckHealth: checkHealth
  };
}