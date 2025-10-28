'use client';

import { useState, useEffect } from 'react';
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
import { ScanStatus, ScanProfile, SCAN_STATUS_COLORS, SCAN_PROFILE_CONFIGS } from '@/types/api';

export default function Dashboard() {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  // API hooks
  const { scans, loading: scansLoading, error: scansError, refreshScans, createScan } = useScans();
  const { stats, loading: statsLoading, error: statsError } = useScanStats();

  // Handle authentication state
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

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
    const defaultTargets = '127.0.0.1';
    const newScan = await createScan({
      targets: defaultTargets,
      scan_profile: ScanProfile.QUICK
    });

    if (newScan) {
      router.push('/dashboard/scanning');
    }
  };

  // Filter scans by status
  const recentScans = scans.slice(0, 5);

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
                  {statsLoading ? (
                    <div className="h-7 w-16 bg-gray-700 animate-pulse rounded"></div>
                  ) : (
                    <p className="text-2xl font-bold text-white">{stats?.total_vulnerabilities || 0}</p>
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
                  {statsLoading ? (
                    <div className="h-7 w-8 bg-gray-700 animate-pulse rounded"></div>
                  ) : (
                    <p className="text-2xl font-bold text-white">{stats?.scans_running || 0}</p>
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
                  {statsLoading ? (
                    <div className="h-7 w-8 bg-gray-700 animate-pulse rounded"></div>
                  ) : (
                    <p className="text-2xl font-bold text-white">{stats?.scans_completed || 0}</p>
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
                  {statsLoading ? (
                    <div className="h-7 w-8 bg-gray-700 animate-pulse rounded"></div>
                  ) : (
                    <p className="text-2xl font-bold text-white">{stats?.average_risk_score?.toFixed(1) || '0.0'}</p>
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
                  {recentScans.map((scan) => (
                    <div key={scan.id} className="flex items-center justify-between py-3 border-b border-gray-700 last:border-0">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(scan.status)}
                        <div>
                          <p className="text-white font-medium">{scan.targets}</p>
                          <p className="text-sm text-gray-400">
                            {SCAN_PROFILE_CONFIGS[scan.scan_profile]?.name || scan.scan_profile}
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
                  ))}
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