'use client';

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Activity,
  RefreshCw,
  AlertCircle,
  Loader2,
  Play
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import DashboardLayout from '@/components/layout/DashboardLayout';

// Import our custom hooks and types
import { useScans, useScanStats } from '@/hooks/use-scans';
import { useScanStatusMonitor } from '@/hooks/use-scan-status-monitor';
import { ScanStatus, ScanProfile, SCAN_STATUS_COLORS, SCAN_PROFILE_CONFIGS } from '@/types/api';

export default function Dashboard() {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  // API hooks
  const { scans, loading: scansLoading, error: scansError, refreshScans, createScan } = useScans();
  
  // Monitor scan status changes and emit notifications
  useScanStatusMonitor(scans);
  const { stats, loading: statsLoading, error: statsError } = useScanStats();

  // Handle authentication state
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  // Auto-refresh scans when there are active scans
  useEffect(() => {
    if (!isSignedIn || scansLoading) return;

    // Check if there are any running scans
    const hasRunningScans = scans.some(scan => 
      scan.status === ScanStatus.RUNNING || 
      scan.status === ScanStatus.PENDING
    );

    if (hasRunningScans) {
      // Poll every 5 seconds when there are active scans
      const interval = setInterval(() => {
        refreshScans();
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [isSignedIn, scans, scansLoading, refreshScans]);

  // Show loading state while user data is loading
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#151528] to-[#1a1a2e] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  // Redirect if not signed in
  if (!isSignedIn) {
    return null;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'running': return <Activity className="h-4 w-4 text-blue-400 animate-pulse" />;
      case 'failed': return <AlertTriangle className="h-4 w-4 text-red-400" />;
      case 'pending': return <Activity className="h-4 w-4 text-yellow-400" />;
      default: return <Activity className="h-4 w-4 text-slate-400" />;
    }
  };

  const startQuickScan = async () => {
    // Redirect to scanning page where users can configure targets
    router.push('/dashboard/scanning');
  };

  // Filter scans by status
  const recentScans = scans.slice(0, 5);
  
  // Filter scans by status for calculations
  const runningScans = scans.filter(scan => 
    scan.status === ScanStatus.RUNNING || 
    scan.status === ScanStatus.PENDING
  );
  
  const completedScans = scans.filter(scan => 
    scan.status === ScanStatus.COMPLETED ||
    scan.status === ScanStatus.FAILED ||
    scan.status === ScanStatus.CANCELLED
  );

  // Debug logging for overview
  console.log('🏠 Dashboard Overview Debug:', {
    totalScans: scans.length,
    recentScans: recentScans.length,
    runningScans: runningScans.length,
    completedScans: completedScans.length,
    scansLoading,
    scansError,
    rawScans: scans.map(scan => ({
      id: scan.id,
      status: scan.status,
      targets: scan.targets,
      created_at: scan.created_at
    }))
  });

  // Calculate statistics from actual scan data
  const calculatedStats = {
    scans_running: runningScans.length,
    scans_completed: completedScans.filter(scan => scan.status === ScanStatus.COMPLETED).length, // Only count successful completions
    total_vulnerabilities: completedScans
      .filter(scan => scan.status === ScanStatus.COMPLETED) // Only count vulnerabilities from successful scans
      .reduce((sum, scan) => {
        // Try multiple sources for vulnerability count
        let vulnCount = 0;
        
        console.log(`🔍 [Overview] Checking vulnerabilities for scan ${(scan as any).scan_id || scan.id}:`, {
          direct_field: scan.vulnerabilities_found,
          parsed_results: (scan as any).parsed_results?.summary,
          findings: (scan as any).parsed_results?.findings,
          hosts: (scan as any).parsed_results?.parsed_json?.hosts
        });
        
        // First try the direct field
        if (scan.vulnerabilities_found) {
          vulnCount = scan.vulnerabilities_found;
          console.log(`✅ [Overview] Using direct field: ${vulnCount}`);
        }
        // Then try parsed results summary
        else if ((scan as any).parsed_results?.summary?.total_findings) {
          vulnCount = (scan as any).parsed_results.summary.total_findings;
          console.log(`✅ [Overview] Using parsed results total_findings: ${vulnCount}`);
        }
        // Then try counting findings array
        else if ((scan as any).parsed_results?.findings && Array.isArray((scan as any).parsed_results.findings)) {
          vulnCount = (scan as any).parsed_results.findings.length;
          console.log(`✅ [Overview] Using findings array count: ${vulnCount}`);
        }
        // For detailed scan results, check individual host findings
        else if ((scan as any).parsed_results?.parsed_json?.hosts) {
          vulnCount = (scan as any).parsed_results.parsed_json.hosts.reduce((hostSum: number, host: any) => {
            if (host.findings && Array.isArray(host.findings)) {
              return hostSum + host.findings.length;
            }
            return hostSum;
          }, 0);
          console.log(`✅ [Overview] Using host findings count: ${vulnCount}`);
        }
        else {
          console.log(`⚠️ [Overview] No vulnerability data found for scan`);
        }
        
        console.log(`📊 [Overview] Final vulnerability count for this scan: ${vulnCount}`);
        return sum + vulnCount;
      }, 0),
    average_risk_score: completedScans.filter(scan => scan.status === ScanStatus.COMPLETED).length > 0 
      ? completedScans
          .filter(scan => scan.status === ScanStatus.COMPLETED)
          .reduce((sum, scan) => sum + (scan.risk_score || 0), 0) / completedScans.filter(scan => scan.status === ScanStatus.COMPLETED).length
      : 0,
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Welcome back, {user?.firstName || 'User'}!
            </h1>
            <p className="text-gray-400 mt-2">Here's your security overview</p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={startQuickScan} 
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
              disabled={scansLoading}
            >
              {scansLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Quick Scan
            </Button>
            <Button 
              variant="outline" 
              onClick={refreshScans}
              disabled={scansLoading}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${scansLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Show errors if any */}
        {(scansError || statsError) && (
          <Alert className="border-red-500/50 bg-red-500/10">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-400">
              {scansError || statsError}
            </AlertDescription>
          </Alert>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Total Vulnerabilities</p>
                  {scansLoading ? (
                    <div className="h-7 w-16 bg-gray-700 animate-pulse rounded"></div>
                  ) : (
                    <p className="text-2xl font-bold text-white">{calculatedStats.total_vulnerabilities}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Activity className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Active Scans</p>
                  {scansLoading ? (
                    <div className="h-7 w-8 bg-gray-700 animate-pulse rounded"></div>
                  ) : (
                    <p className="text-2xl font-bold text-white">{calculatedStats.scans_running}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Completed Scans</p>
                  {scansLoading ? (
                    <div className="h-7 w-8 bg-gray-700 animate-pulse rounded"></div>
                  ) : (
                    <p className="text-2xl font-bold text-white">{calculatedStats.scans_completed}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <Shield className="h-6 w-6 text-orange-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Risk Score</p>
                  {scansLoading ? (
                    <div className="h-7 w-8 bg-gray-700 animate-pulse rounded"></div>
                  ) : (
                    <p className="text-2xl font-bold text-white">{calculatedStats.average_risk_score.toFixed(1)}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Scans */}
          <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white">Recent Scans</CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={refreshScans}
                disabled={scansLoading}
                className="text-gray-400 hover:text-white"
              >
                <RefreshCw className={`h-4 w-4 ${scansLoading ? 'animate-spin' : ''}`} />
              </Button>
            </CardHeader>
            <CardContent>
              {scansLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <div className="h-4 w-4 bg-gray-700 animate-pulse rounded"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-700 animate-pulse rounded w-3/4"></div>
                        <div className="h-3 bg-gray-700 animate-pulse rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentScans.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No scans found</p>
                  <p className="text-sm">Create your first scan to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentScans.map((scan) => {
                    const scanId = (scan as any).scan_id || scan.id;
                    const target = (scan as any).target || scan.targets;
                    const profile = (scan as any).profile || scan.scan_profile;
                    const profileConfig = SCAN_PROFILE_CONFIGS[profile as ScanProfile];
                    return (
                    <div key={scanId} className="flex items-center justify-between py-3 border-b border-gray-700 last:border-0">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(scan.status)}
                        <div>
                          <p className="text-white font-medium">{target}</p>
                          <p className="text-sm text-gray-400">
                            {profileConfig?.name || profile}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge 
                          className={`${SCAN_STATUS_COLORS[scan.status]} border`}
                        >
                          {scan.status}
                        </Badge>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(scan.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )})}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
              <CardDescription className="text-gray-400">
                Common security assessment tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={startQuickScan}
                className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white"
                disabled={scansLoading}
              >
                <Play className="h-4 w-4 mr-2" />
                Start Quick Network Scan
              </Button>
              <Button 
                onClick={() => router.push('/dashboard/scanning')}
                variant="outline" 
                className="w-full justify-start border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                <Activity className="h-4 w-4 mr-2" />
                View All Scans
              </Button>
              <Button 
                onClick={() => router.push('/dashboard/reports')}
                variant="outline" 
                className="w-full justify-start border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
              <Button 
                onClick={() => router.push('/dashboard/assets')}
                variant="outline" 
                className="w-full justify-start border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                <Shield className="h-4 w-4 mr-2" />
                Manage Assets
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">System Status</CardTitle>
            <CardDescription className="text-gray-400">
              Current system health and statistics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Scanner Status</span>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                  <span className="text-green-400 text-sm">Online</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Last Update</span>
                <span className="text-white text-sm">
                  {stats?.last_scan_date ? new Date(stats.last_scan_date).toLocaleDateString() : 'Never'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Total Hosts Scanned</span>
                <span className="text-white text-sm">{stats?.total_hosts_scanned || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}