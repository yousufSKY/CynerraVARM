'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Play, 
  Pause, 
  Square, 
  Plus, 
  Eye, 
  Calendar, 
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Activity,
  RefreshCw,
  Settings,
  Download,
  Loader2,
  AlertCircle,
  Server,
  Network,
  Shield,
  Terminal,
  Info
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import DashboardLayout from '@/components/layout/DashboardLayout';

// Import our custom hooks and types
import { useScans, useScanStats, useScanProgress } from '@/hooks/use-scans';
import { useScanStatusMonitor } from '@/hooks/use-scan-status-monitor';
import { ScanProfile, ScanStatus, SCAN_STATUS_COLORS, SCAN_PROFILE_CONFIGS, SCANNER_INFO, ScanDetailResponse, ScanResults } from '@/types/api';
import { apiClient } from '@/lib/api-client';

export default function VulnerabilityScanning() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedScanDetails, setSelectedScanDetails] = useState<ScanResults | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [activeScanId, setActiveScanId] = useState<string | null>(null);
  const [cancellingScans, setCancellingScans] = useState<Set<string>>(new Set());
  const [scanType, setScanType] = useState<'network' | 'web'>('network'); // Track which type of scan is being created
  const [scannerFilter, setScannerFilter] = useState<'port' | 'web' | null>(null); // Filter for scan history
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  // API hooks
  const { scans, loading: scansLoading, error: scansError, refreshing, refreshScans, createScan, cancelScan, deleteScan } = useScans();
  
  // Monitor scan status changes and emit notifications
  useScanStatusMonitor(scans);
  const { stats, loading: statsLoading, error: statsError } = useScanStats();
  const { progress: scanProgress } = useScanProgress(activeScanId, !!activeScanId);

  // Form state for creating scans
  const [scanForm, setScanForm] = useState({
    targets: '',
    scan_profile: ScanProfile.QUICK,
    custom_options: ''
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Debug API connectivity
  const testBackendConnection = async () => {
    console.log('🧪 Testing backend connection...');
    
    try {
      // Test 1: Basic ping
      console.log('📡 Testing ping...');
      const pingResult = await apiClient.ping();
      console.log('Ping result:', pingResult);
      
      // Test 2: Direct API call to scan history
      console.log('📡 Testing scan history API...');
      const historyResult = await apiClient.getScanHistory('default-asset');
      console.log('History result:', historyResult);
      
      // Test 3: Test direct fetch call
      console.log('📡 Testing direct fetch to docs...');
      const response = await fetch('http://localhost:8000/docs');
      console.log('Direct fetch result:', response.ok, response.status);
      
      // Test 4: Test direct fetch to test endpoint
      console.log('📡 Testing direct fetch to test scan history...');
      const testResponse = await fetch('http://localhost:8000/api/test/scan/history/default-asset');
      console.log('Test scan history response:', testResponse.ok, testResponse.status);
      
      if (testResponse.ok) {
        const data = await testResponse.json();
        console.log('Test scan history data:', data);
      }
      
    } catch (error) {
      console.error('❌ Backend test failed:', error);
    }
  };

  // Handle authentication state
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  // Removed auto-refresh to reduce backend load
  // Users can manually refresh using the refresh button

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

  const handleCreateScan = async () => {
    if (!scanForm.targets.trim()) {
      setFormError('Please enter scan target');
      return;
    }

    // Validate target format based on scan profile
    const profileConfig = SCAN_PROFILE_CONFIGS[scanForm.scan_profile];
    const target = scanForm.targets.trim();
    
    // Validation
    if (profileConfig.targetType === 'ip') {
      const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
      if (!ipPattern.test(target)) {
        setFormError('Network scans require an IP address (e.g., 192.168.1.1)');
        return;
      }
    } else if (profileConfig.targetType === 'url') {
      if (!target.startsWith('http://') && !target.startsWith('https://')) {
        setFormError('Web scans require a URL (e.g., https://example.com)');
        return;
      }
    } else if (profileConfig.targetType === 'url-with-params') {
      if (!target.includes('?')) {
        setFormError('SQL injection scans require a URL with parameters (e.g., http://example.com/page.php?id=1)');
        return;
      }
      if (!target.startsWith('http://') && !target.startsWith('https://')) {
        setFormError('Please provide a valid URL starting with http:// or https://');
        return;
      }
    }

    // Warning for aggressive scans
    if (profileConfig.isAggressive) {
      const confirmed = confirm(profileConfig.warningMessage || 'This is an aggressive scan. Continue?');
      if (!confirmed) {
        return;
      }
    }

    setIsCreating(true);
    setFormError(null);

    try {
      const newScan = await createScan({
        targets: scanForm.targets,
        scan_profile: scanForm.scan_profile,
        custom_options: scanForm.custom_options || undefined
      });

      if (newScan) {
        setShowCreateDialog(false);
        setScanForm({ targets: '', scan_profile: ScanProfile.QUICK, custom_options: '' });
        setActiveScanId(newScan.id); // Start tracking this scan
      }
    } catch (error) {
      console.error('Failed to create scan:', error);
      setFormError('Failed to create scan. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancelScan = async (scanId: string) => {
    // Confirm before cancelling
    if (!confirm('Are you sure you want to cancel this scan?')) {
      return;
    }
    
    // Mark as cancelling
    setCancellingScans(prev => new Set(prev).add(scanId));
    
    try {
      const success = await cancelScan(scanId);
      if (success) {
        if (activeScanId === scanId) {
          setActiveScanId(null);
        }
        // Refresh scan list to get updated status
        await refreshScans();
      }
    } finally {
      // Remove from cancelling state
      setCancellingScans(prev => {
        const next = new Set(prev);
        next.delete(scanId);
        return next;
      });
    }
  };

  const startQuickScan = async () => {
    // Use the user-entered targets instead of hardcoded 127.0.0.1
    if (!scanForm.targets.trim()) {
      setFormError('Please enter a target IP address first');
      return;
    }

    const newScan = await createScan({
      targets: scanForm.targets.trim(),
      scan_profile: ScanProfile.QUICK
    });

    if (newScan) {
      setActiveScanId(newScan.id);
    }
  };

  const startQuickNetworkScan = async () => {
    // Set default target for network scan if none provided
    const defaultTarget = '127.0.0.1';
    const target = scanForm.targets.trim() || defaultTarget;
    
    const newScan = await createScan({
      targets: target,
      scan_profile: ScanProfile.QUICK
    });

    if (newScan) {
      setActiveScanId(newScan.id);
    }
  };

  const startQuickWebScan = async () => {
    // Set default target for web scan
    const defaultTarget = 'http://testphp.vulnweb.com';
    
    const newScan = await createScan({
      targets: defaultTarget,
      scan_profile: ScanProfile.ZAP_BASELINE
    });

    if (newScan) {
      setActiveScanId(newScan.id);
    }
  };

  const viewScanDetails = async (scanId: string) => {
    console.log('🔍 viewScanDetails called with scanId:', scanId);
    setLoadingDetails(true);
    setShowDetailsDialog(true);
    try {
      const response = await apiClient.getScan(scanId);
      console.log('📡 getScan response:', response);
      if (response.success && response.data) {
        console.log('✅ Setting scan details:', response.data);
        setSelectedScanDetails(response.data);
      } else {
        console.error('❌ Response not successful or no data:', response);
      }
    } catch (error) {
      console.error('💥 Failed to load scan details:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'running': return <Activity className="h-4 w-4 text-blue-400 animate-pulse" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-400" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-400" />;
      default: return <Clock className="h-4 w-4 text-slate-400" />;
    }
  };

  // Filter scans by status and sort by most recent first
  const runningScans = scans
    .filter(scan => 
      scan.status === ScanStatus.RUNNING || 
      scan.status === ScanStatus.PENDING
    )
    .sort((a, b) => {
      const dateA = new Date(a.started_at || a.created_at || 0).getTime();
      const dateB = new Date(b.started_at || b.created_at || 0).getTime();
      return dateB - dateA; // Most recent first
    });
  
  const completedScans = scans
    .filter(scan => 
      scan.status === ScanStatus.COMPLETED ||
      scan.status === ScanStatus.FAILED ||
      scan.status === ScanStatus.CANCELLED
    )
    .sort((a, b) => {
      const dateA = new Date((a as any).finished_at || a.completed_at || a.updated_at || a.created_at || 0).getTime();
      const dateB = new Date((b as any).finished_at || b.completed_at || b.updated_at || b.created_at || 0).getTime();
      return dateB - dateA; // Most recent first
    });

  // Debug logging
  console.log('🔍 Scans Debug Info:', {
    totalScans: scans.length,
    runningScans: runningScans.length,
    completedScans: completedScans.length,
    scansLoading,
    scansError,
    allScans: scans.map(scan => ({
      id: (scan as any).scan_id || scan.id,
      status: scan.status,
      target: (scan as any).target || scan.targets,
      created_at: scan.created_at
    }))
  });

  // Calculate statistics from actual scan data
  const calculatedStats = {
    scans_running: runningScans.length,
    scans_last_24h: completedScans.filter(scan => {
      const completedDate = (scan as any).finished_at || scan.completed_at;
      if (!completedDate) return false;
      const scanDate = new Date(completedDate);
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return scanDate >= oneDayAgo;
    }).length,
    total_vulnerabilities: completedScans
      .filter(scan => scan.status === ScanStatus.COMPLETED) // Only count vulnerabilities from successful scans
      .reduce((sum, scan) => {
        // Try multiple sources for vulnerability count
        let vulnCount = 0;
        
        console.log(`🔍 Checking vulnerabilities for scan ${(scan as any).scan_id || scan.id}:`, {
          direct_field: scan.vulnerabilities_found,
          parsed_results: (scan as any).parsed_results?.summary,
          findings: (scan as any).parsed_results?.findings,
          hosts: (scan as any).parsed_results?.parsed_json?.hosts
        });
        
        // First try the direct field
        if (scan.vulnerabilities_found) {
          vulnCount = scan.vulnerabilities_found;
          console.log(`✅ Using direct field: ${vulnCount}`);
        }
        // Then try parsed results summary
        else if ((scan as any).parsed_results?.summary?.total_findings) {
          vulnCount = (scan as any).parsed_results.summary.total_findings;
          console.log(`✅ Using parsed results total_findings: ${vulnCount}`);
        }
        // Then try counting findings array
        else if ((scan as any).parsed_results?.findings && Array.isArray((scan as any).parsed_results.findings)) {
          vulnCount = (scan as any).parsed_results.findings.length;
          console.log(`✅ Using findings array count: ${vulnCount}`);
        }
        // For detailed scan results, check individual host findings
        else if ((scan as any).parsed_results?.parsed_json?.hosts) {
          vulnCount = (scan as any).parsed_results.parsed_json.hosts.reduce((hostSum: number, host: any) => {
            if (host.findings && Array.isArray(host.findings)) {
              return hostSum + host.findings.length;
            }
            return hostSum;
          }, 0);
          console.log(`✅ Using host findings count: ${vulnCount}`);
        }
        else {
          console.log(`⚠️ No vulnerability data found for scan`);
        }
        
        console.log(`📊 Final vulnerability count for this scan: ${vulnCount}`);
        return sum + vulnCount;
      }, 0),
    total_scans: scans.length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Vulnerability Scanning</h1>
            <p className="text-gray-400 mt-2">
              Network infrastructure and web application security assessment
              {runningScans.length > 0 && (
                <span className="ml-2 inline-flex items-center text-xs text-blue-400">
                  <Activity className="h-3 w-3 mr-1 animate-pulse" />
                  Auto-refreshing ({runningScans.length} active)
                </span>
              )}
            </p>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-2 text-sm">
                <div className="flex items-center gap-1">
                  <Network className="h-4 w-4 text-blue-400" />
                  <span className="text-gray-300">Network Scans</span>
                  <Badge variant="outline" className="border-blue-500/50 text-blue-400 text-xs">
                    Nmap
                  </Badge>
                </div>
                <span className="text-gray-600">|</span>
                <div className="flex items-center gap-1">
                  <Shield className="h-4 w-4 text-purple-400" />
                  <span className="text-gray-300">Web Scans</span>
                  <div className="flex gap-1">
                    <Badge variant="outline" className="border-purple-500/50 text-purple-400 text-xs">ZAP</Badge>
                    <Badge variant="outline" className="border-green-500/50 text-green-400 text-xs">Nikto</Badge>
                    <Badge variant="outline" className="border-yellow-500/50 text-yellow-400 text-xs">SQLMap</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={() => {
                setScanType('network');
                startQuickNetworkScan();
              }} 
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={scansLoading}
            >
              {scansLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Network className="h-4 w-4 mr-2" />
              )}
              Quick Network Scan
            </Button>
            <Button 
              onClick={() => {
                setScanType('web');
                startQuickWebScan();
              }} 
              className="bg-purple-600 hover:bg-purple-700 text-white"
              disabled={scansLoading}
            >
              <Shield className="h-4 w-4 mr-2" />
              Quick Web Scan
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
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
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Network className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Network Scans</p>
                  {scansLoading ? (
                    <div className="h-7 w-8 bg-gray-700 animate-pulse rounded"></div>
                  ) : (
                    <p className="text-2xl font-bold text-white">
                      {scans.filter(scan => {
                        const profile = (scan as any).profile || scan.scan_profile;
                        const config = SCAN_PROFILE_CONFIGS[profile as ScanProfile];
                        return config?.scanner === 'nmap';
                      }).length}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Shield className="h-6 w-6 text-purple-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Web Scans</p>
                  {scansLoading ? (
                    <div className="h-7 w-8 bg-gray-700 animate-pulse rounded"></div>
                  ) : (
                    <p className="text-2xl font-bold text-white">
                      {scans.filter(scan => {
                        const profile = (scan as any).profile || scan.scan_profile;
                        const config = SCAN_PROFILE_CONFIGS[profile as ScanProfile];
                        return config && ['zap', 'nikto', 'sqlmap', 'burpsuite'].includes(config.scanner);
                      }).length}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Total Vulns</p>
                  {scansLoading ? (
                    <div className="h-7 w-8 bg-gray-700 animate-pulse rounded"></div>
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
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Completed Today</p>
                  {scansLoading ? (
                    <div className="h-7 w-8 bg-gray-700 animate-pulse rounded"></div>
                  ) : (
                    <p className="text-2xl font-bold text-white">{calculatedStats.scans_last_24h}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-gray-900/50 border border-gray-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
              Overview
            </TabsTrigger>
            <TabsTrigger value="network-scanning" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
              Network Scanning
            </TabsTrigger>
            <TabsTrigger value="web-scanning" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
              Web Scanning
            </TabsTrigger>
            <TabsTrigger value="active" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
              Active Scans ({runningScans.length})
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
              Scan History
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Scans */}
              <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Recent Scans</CardTitle>
                    <CardDescription className="text-gray-400">
                      Latest scan results and status
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={refreshScans}
                      disabled={scansLoading || refreshing}
                      className="text-gray-400 hover:text-white"
                    >
                      <RefreshCw className={`h-4 w-4 ${scansLoading || refreshing ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={async () => {
                        console.log('🧪 Creating test scan from recent scans...');
                        // Use the user-entered targets or default
                        const targetToUse = scanForm.targets.trim() || '192.168.1.1';
                        await createScan({
                          targets: targetToUse,
                          scan_profile: ScanProfile.QUICK
                        });
                      }}
                      className="text-green-400 hover:text-green-300 text-xs"
                    >
                      + Test
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {scansLoading ? (
                    <div className="space-y-3">
                      <div className="text-center text-blue-400 mb-4">
                        <p className="text-sm">Loading scans...</p>
                      </div>
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
                  ) : scansError ? (
                    <div className="text-center py-8 text-red-400">
                      <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">Error loading scans</p>
                      <p className="text-sm">{scansError}</p>
                      <Button 
                        onClick={refreshScans} 
                        className="mt-4 bg-red-600 hover:bg-red-700"
                        size="sm"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Retry
                      </Button>
                    </div>
                  ) : completedScans.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No completed scans found</p>
                      <p className="text-sm">
                        Create your first scan to get started
                        {scans.length > 0 && ` (${scans.length} total scans, ${runningScans.length} running)`}
                      </p>
                      {/* Debug info */}
                      <div className="mt-4 p-3 bg-gray-800/50 rounded text-xs text-left">
                        <p className="text-blue-400 mb-2">Debug Info:</p>
                        <p>Total scans: {scans.length}</p>
                        <p>Running scans: {runningScans.length}</p>
                        <p>Completed scans: {completedScans.length}</p>
                        <p>Loading: {scansLoading ? 'Yes' : 'No'}</p>
                        <p>Error: {scansError || 'None'}</p>
                        <Button 
                          onClick={async () => {
                            console.log('🧪 Creating test scan...');
                            // Use the user-entered targets or default
                            const targetToUse = scanForm.targets.trim() || '192.168.1.1';
                            await createScan({
                              targets: targetToUse,
                              scan_profile: ScanProfile.QUICK
                            });
                          }}
                          className="mt-2 bg-blue-600 hover:bg-blue-700"
                          size="sm"
                        >
                          🧪 Create Test Scan
                        </Button>
                        <Button 
                          onClick={testBackendConnection}
                          className="mt-2 ml-2 bg-purple-600 hover:bg-purple-700"
                          size="sm"
                        >
                          🔧 Test Backend
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {completedScans.slice(0, 4).map((scan) => (
                        <div key={(scan as any).scan_id || scan.id} className="border border-gray-700 rounded-lg p-4 hover:border-cyan-500/50 transition-colors">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              {getStatusIcon(scan.status)}
                              <div>
                                <p className="text-white font-medium">{(scan as any).target || scan.targets}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <p className="text-sm text-gray-400">
                                    {SCAN_PROFILE_CONFIGS[((scan as any).profile || scan.scan_profile) as ScanProfile]?.name || (scan as any).profile || scan.scan_profile}
                                  </p>
                                  {/* Scanner Badge */}
                                  {(() => {
                                    const profile = (scan as any).profile || scan.scan_profile;
                                    const config = SCAN_PROFILE_CONFIGS[profile as ScanProfile];
                                    if (config) {
                                      const scannerInfo = SCANNER_INFO[config.scanner];
                                      const isNetworkScan = config.scanner === 'nmap';
                                      return (
                                        <div className="flex items-center gap-1">
                                          {/* Scanner Type Badge */}
                                          {isNetworkScan ? (
                                            <Badge variant="outline" className="text-xs border-blue-500/50 text-blue-400">
                                              <Network className="h-3 w-3 mr-1" />
                                              Network
                                            </Badge>
                                          ) : (
                                            <Badge variant="outline" className="text-xs border-purple-500/50 text-purple-400">
                                              <Shield className="h-3 w-3 mr-1" />
                                              Web
                                            </Badge>
                                          )}
                                          {/* Specific Scanner Badge */}
                                          <Badge variant="outline" className={`text-xs ${scannerInfo.color} border`}>
                                            {scannerInfo.icon} {scannerInfo.name}
                                          </Badge>
                                        </div>
                                      );
                                    }
                                    return null;
                                  })()}
                                </div>
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
                          
                          {/* Scan Results Summary */}
                          <div className="grid grid-cols-4 gap-3 pt-3 border-t border-gray-700">
                            <div>
                              <p className="text-xs text-gray-400">Hosts Up</p>
                              <p className="text-white font-medium">
                                {scan.hosts_up || 0}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">Open Ports</p>
                              <p className="text-cyan-400 font-medium">
                                {scan.open_ports || 0}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">Services</p>
                              <p className="text-purple-400 font-medium">
                                {scan.services_detected?.length || 0}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">Risk Score</p>
                              <p className={`font-medium ${
                                (scan.risk_score || 0) >= 70 ? 'text-red-400' :
                                (scan.risk_score || 0) >= 40 ? 'text-yellow-400' :
                                'text-green-400'
                              }`}>
                                {scan.risk_score !== undefined ? `${scan.risk_score}/100` : '0/100'}
                              </p>
                            </div>
                          </div>
                          
                          {/* Action Button */}
                          {scan.status === ScanStatus.COMPLETED && (
                            <div className="mt-3 pt-3 border-t border-gray-700">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => viewScanDetails((scan as any).scan_id || scan.id)}
                                className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 w-full"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Full Details
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Active Scan Progress */}
              <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Scan Progress</CardTitle>
                  <CardDescription className="text-gray-400">
                    Real-time progress of active scans
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {runningScans.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No active scans</p>
                      <p className="text-sm">Start a scan to see progress here</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {runningScans.map((scan) => {
                        const scanId = (scan as any).scan_id || scan.id;
                        const target = (scan as any).target || scan.targets;
                        const profile = ((scan as any).profile || scan.scan_profile) as ScanProfile;
                        const progressValue = scanProgress && activeScanId === scanId ? scanProgress.progress : 0;
                        const progressPercent = Math.min(100, Math.max(0, progressValue || 0));
                        
                        return (
                        <div key={scanId} className="relative p-4 rounded-lg border border-gray-700 bg-gray-800/30 space-y-3">
                          {/* Header with Target and Profile */}
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Activity className="h-4 w-4 text-blue-400 flex-shrink-0" />
                                <span className="text-white font-medium truncate">{target}</span>
                              </div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="outline" className="border-blue-500/50 text-blue-400 text-xs">
                                  {SCAN_PROFILE_CONFIGS[profile]?.name || profile}
                                </Badge>
                                {/* Scanner Type Badge */}
                                {SCAN_PROFILE_CONFIGS[profile]?.scanner === 'nmap' ? (
                                  <Badge variant="outline" className="text-xs border-blue-500/50 text-blue-400">
                                    <Network className="h-3 w-3 mr-1" />
                                    Network
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-xs border-purple-500/50 text-purple-400">
                                    <Shield className="h-3 w-3 mr-1" />
                                    Web
                                  </Badge>
                                )}
                                <span className="text-xs text-gray-500">
                                  {scan.status}
                                </span>
                              </div>
                            </div>
                            
                            {/* Circular Progress Indicator */}
                            <div className="relative flex items-center justify-center">
                              <svg className="w-16 h-16 transform -rotate-90">
                                {/* Background circle */}
                                <circle
                                  cx="32"
                                  cy="32"
                                  r="28"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                  fill="none"
                                  className="text-gray-700"
                                />
                                {/* Progress circle */}
                                <circle
                                  cx="32"
                                  cy="32"
                                  r="28"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                  fill="none"
                                  strokeDasharray={`${2 * Math.PI * 28}`}
                                  strokeDashoffset={`${2 * Math.PI * 28 * (1 - progressPercent / 100)}`}
                                  className="text-blue-500 transition-all duration-500"
                                  strokeLinecap="round"
                                />
                              </svg>
                              {/* Percentage text */}
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-sm font-semibold text-white">
                                  {progressPercent}%
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Linear Progress Bar */}
                          <div className="space-y-1">
                            <Progress 
                              value={progressPercent} 
                              className="h-2"
                            />
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-400">
                                {scanProgress && activeScanId === scanId ? (scanProgress.message || 'Running...') : 'Initializing...'}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCancelScan(scanId)}
                                disabled={cancellingScans.has(scanId)}
                                className="text-red-400 hover:text-red-300 disabled:opacity-50 h-7 text-xs"
                              >
                                {cancellingScans.has(scanId) ? (
                                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                ) : (
                                  <Square className="h-3 w-3 mr-1" />
                                )}
                                {cancellingScans.has(scanId) ? 'Cancelling...' : 'Cancel'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )})}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Network Scanning Tab */}
          <TabsContent value="network-scanning" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {/* Network Scanning Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Network className="h-6 w-6 text-blue-400" />
                    Network Vulnerability Scanning
                  </h2>
                  <p className="text-gray-400 mt-2">
                    Comprehensive network infrastructure security assessment using Nmap
                  </p>
                </div>
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      New Network Scan
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Network className="h-5 w-5 text-blue-400" />
                        Create Network Scan
                      </DialogTitle>
                      <DialogDescription className="text-gray-400">
                        Configure a new network vulnerability scan using Nmap
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      {formError && (
                        <Alert className="border-red-500/50 bg-red-500/10">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="text-red-400">
                            {formError}
                          </AlertDescription>
                        </Alert>
                      )}
                      
                      {/* Network Scan Profile Selection */}
                      <div>
                        <Label htmlFor="scan_profile" className="text-gray-300">Network Scan Type</Label>
                        <Select 
                          value={scanForm.scan_profile} 
                          onValueChange={(value) => setScanForm(prev => ({ ...prev, scan_profile: value as ScanProfile }))}
                        >
                          <SelectTrigger className="bg-gray-800 border-gray-600 text-white mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-600 max-h-[400px]">
                            {/* Network Scans (Nmap) Only */}
                            <SelectGroup>
                              <SelectLabel className="text-blue-400 pl-2">🔍 Network Scans (Nmap)</SelectLabel>
                              {[ScanProfile.QUICK, ScanProfile.FULL, ScanProfile.SERVICE_DETECTION, ScanProfile.VULNERABILITY, ScanProfile.UDP].map((profile) => {
                                const config = SCAN_PROFILE_CONFIGS[profile];
                                return (
                                  <SelectItem key={profile} value={profile} className="text-white hover:bg-gray-700 pl-6">
                                    <div className="py-1">
                                      <div className="font-medium">{config.name}</div>
                                      <div className="text-xs text-gray-400">{config.description}</div>
                                      <div className="text-xs text-gray-500 mt-0.5">⏱️ {config.estimated_duration}</div>
                                    </div>
                                  </SelectItem>
                                );
                              })}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Target IP Input */}
                      <div>
                        <Label htmlFor="targets" className="text-gray-300">Target IP Address</Label>
                        <Input
                          id="targets"
                          placeholder="192.168.1.1 or 192.168.1.0/24"
                          value={scanForm.targets}
                          onChange={(e) => setScanForm(prev => ({ ...prev, targets: e.target.value }))}
                          className="bg-gray-800 border-gray-600 text-white placeholder-gray-500 mt-2"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Enter an IP address or CIDR range (e.g., 192.168.1.1 or 192.168.1.0/24)
                        </p>
                      </div>
                      
                      <div>
                        <Label htmlFor="custom_options" className="text-gray-300">
                          Custom Nmap Options (Optional)
                          <span className="text-xs text-gray-500 ml-2">(e.g., -p 1-1000, --script vuln)</span>
                        </Label>
                        <Input
                          id="custom_options"
                          placeholder="Custom Nmap options"
                          value={scanForm.custom_options}
                          onChange={(e) => setScanForm(prev => ({ ...prev, custom_options: e.target.value }))}
                          className="bg-gray-800 border-gray-600 text-white placeholder-gray-500 mt-2"
                        />
                      </div>
                      
                      {/* Warning for vulnerability scans */}
                      {scanForm.scan_profile === ScanProfile.VULNERABILITY && (
                        <Alert className="border-yellow-500/50 bg-yellow-500/10">
                          <AlertCircle className="h-4 w-4 text-yellow-400" />
                          <AlertDescription className="text-yellow-400 text-sm">
                            <strong>Note:</strong> Vulnerability scans may take longer to complete and perform more intrusive checks.
                          </AlertDescription>
                        </Alert>
                      )}
                      
                      <div className="flex gap-3 pt-4">
                        <Button
                          onClick={handleCreateScan}
                          className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                          disabled={isCreating}
                        >
                          {isCreating ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Play className="h-4 w-4 mr-2" />
                          )}
                          Start Network Scan
                        </Button>
                        <Button
                          onClick={() => setShowCreateDialog(false)}
                          variant="outline"
                          className="border-gray-600 text-gray-300 hover:bg-gray-800"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Network Scan Profiles Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[ScanProfile.QUICK, ScanProfile.FULL, ScanProfile.SERVICE_DETECTION, ScanProfile.VULNERABILITY, ScanProfile.UDP].map((profile) => {
                  const config = SCAN_PROFILE_CONFIGS[profile];
                  return (
                    <Card key={profile} className="bg-gray-900/50 border-gray-700 backdrop-blur-sm hover:border-blue-500/50 transition-colors">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Terminal className="h-5 w-5 text-blue-400" />
                          {config.name}
                        </CardTitle>
                        <CardDescription className="text-gray-400">
                          {config.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Scanner:</span>
                          <Badge variant="outline" className="border-blue-500/50 text-blue-400">
                            <Terminal className="h-3 w-3 mr-1" />
                            Nmap
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Duration:</span>
                          <span className="text-white">{config.estimated_duration}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Target Type:</span>
                          <span className="text-white">IP Address</span>
                        </div>
                        <Button
                          onClick={() => {
                            setScanForm(prev => ({ 
                              ...prev, 
                              scan_profile: profile,
                              targets: prev.targets || '192.168.1.1' 
                            }));
                            setShowCreateDialog(true);
                          }}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Configure & Start
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          {/* Web Scanning Tab */}
          <TabsContent value="web-scanning" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {/* Web Scanning Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Shield className="h-6 w-6 text-purple-400" />
                    Web Application Security Scanning
                  </h2>
                  <p className="text-gray-400 mt-2">
                    Comprehensive web application vulnerability assessment using OWASP ZAP, Nikto, SQLMap, and Burp Suite
                  </p>
                </div>
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      New Web Scan
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-lg">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-purple-400" />
                        Create Web Application Scan
                      </DialogTitle>
                      <DialogDescription className="text-gray-400">
                        Configure a new web application vulnerability scan
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      {formError && (
                        <Alert className="border-red-500/50 bg-red-500/10">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="text-red-400">
                            {formError}
                          </AlertDescription>
                        </Alert>
                      )}
                      
                      {/* Web Scan Profile Selection */}
                      <div>
                        <Label htmlFor="scan_profile" className="text-gray-300">Web Scan Type</Label>
                        <Select 
                          value={scanForm.scan_profile} 
                          onValueChange={(value) => setScanForm(prev => ({ ...prev, scan_profile: value as ScanProfile }))}
                        >
                          <SelectTrigger className="bg-gray-800 border-gray-600 text-white mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-600 max-h-[500px]">
                            {/* Web Application Scans (ZAP) */}
                            <SelectGroup>
                              <SelectLabel className="text-purple-400 pl-2">🕷️ Web Application (OWASP ZAP)</SelectLabel>
                              {[ScanProfile.ZAP_BASELINE, ScanProfile.ZAP_FULL, ScanProfile.ZAP_API].map((profile) => {
                                const config = SCAN_PROFILE_CONFIGS[profile];
                                return (
                                  <SelectItem key={profile} value={profile} className="text-white hover:bg-gray-700 pl-6">
                                    <div className="py-1">
                                      <div className="font-medium flex items-center gap-1">
                                        {config.name}
                                        {config.isAggressive && <span className="text-red-400">⚠️</span>}
                                      </div>
                                      <div className="text-xs text-gray-400">{config.description}</div>
                                      <div className="text-xs text-gray-500 mt-0.5">⏱️ {config.estimated_duration}</div>
                                    </div>
                                  </SelectItem>
                                );
                              })}
                            </SelectGroup>
                            
                            {/* Web Server Scans (Nikto) */}
                            <SelectGroup>
                              <SelectLabel className="text-green-400 pl-2 mt-2">🔧 Web Server (Nikto)</SelectLabel>
                              {[ScanProfile.NIKTO_BASIC, ScanProfile.NIKTO_FULL, ScanProfile.NIKTO_FAST].map((profile) => {
                                const config = SCAN_PROFILE_CONFIGS[profile];
                                return (
                                  <SelectItem key={profile} value={profile} className="text-white hover:bg-gray-700 pl-6">
                                    <div className="py-1">
                                      <div className="font-medium">{config.name}</div>
                                      <div className="text-xs text-gray-400">{config.description}</div>
                                      <div className="text-xs text-gray-500 mt-0.5">⏱️ {config.estimated_duration}</div>
                                    </div>
                                  </SelectItem>
                                );
                              })}
                            </SelectGroup>
                            
                            {/* SQL Injection Scans (SQLMap) */}
                            <SelectGroup>
                              <SelectLabel className="text-yellow-400 pl-2 mt-2">💉 SQL Injection (SQLMap)</SelectLabel>
                              {[ScanProfile.SQLMAP_BASIC, ScanProfile.SQLMAP_THOROUGH, ScanProfile.SQLMAP_AGGRESSIVE].map((profile) => {
                                const config = SCAN_PROFILE_CONFIGS[profile];
                                return (
                                  <SelectItem key={profile} value={profile} className="text-white hover:bg-gray-700 pl-6">
                                    <div className="py-1">
                                      <div className="font-medium flex items-center gap-1">
                                        {config.name}
                                        {config.isAggressive && <span className="text-red-400">⚠️</span>}
                                      </div>
                                      <div className="text-xs text-gray-400">{config.description}</div>
                                      <div className="text-xs text-gray-500 mt-0.5">⏱️ {config.estimated_duration}</div>
                                    </div>
                                  </SelectItem>
                                );
                              })}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Target URL Input */}
                      <div>
                        <Label htmlFor="targets" className="text-gray-300">
                          Target {SCAN_PROFILE_CONFIGS[scanForm.scan_profile]?.targetType === 'url-with-params' ? 'URL with Parameters' : 'URL'}
                        </Label>
                        <Input
                          id="targets"
                          placeholder={SCAN_PROFILE_CONFIGS[scanForm.scan_profile]?.targetPlaceholder || 'https://example.com'}
                          value={scanForm.targets}
                          onChange={(e) => setScanForm(prev => ({ ...prev, targets: e.target.value }))}
                          className="bg-gray-800 border-gray-600 text-white placeholder-gray-500 mt-2"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {SCAN_PROFILE_CONFIGS[scanForm.scan_profile]?.targetType === 'url' && 'Enter a URL (e.g., https://example.com)'}
                          {SCAN_PROFILE_CONFIGS[scanForm.scan_profile]?.targetType === 'url-with-params' && 'Enter a URL with parameters (e.g., http://example.com/page.php?id=1)'}
                        </p>
                        
                        {/* Safe Test Targets */}
                        <div className="mt-2 p-2 bg-blue-500/10 border border-blue-500/30 rounded text-xs">
                          <p className="text-blue-400 font-medium mb-1">🧪 Safe Test Targets:</p>
                          <div className="space-y-1 text-blue-300">
                            {SCAN_PROFILE_CONFIGS[scanForm.scan_profile]?.targetType === 'url' && (
                              <>
                                <p>• http://testphp.vulnweb.com</p>
                                <p>• https://www.webscantest.com</p>
                              </>
                            )}
                            {SCAN_PROFILE_CONFIGS[scanForm.scan_profile]?.targetType === 'url-with-params' && (
                              <p>• http://testphp.vulnweb.com/artists.php?artist=1</p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Warning for aggressive scans */}
                      {SCAN_PROFILE_CONFIGS[scanForm.scan_profile]?.isAggressive && (
                        <Alert className="border-yellow-500/50 bg-yellow-500/10">
                          <AlertCircle className="h-4 w-4 text-yellow-400" />
                          <AlertDescription className="text-yellow-400 text-sm">
                            <strong>⚠️ Aggressive Scan:</strong> This scan may exploit vulnerabilities and affect system performance. Only use with explicit authorization.
                          </AlertDescription>
                        </Alert>
                      )}
                      
                      <div>
                        <Label htmlFor="custom_options" className="text-gray-300">
                          Custom Options (Optional)
                          <span className="text-xs text-gray-500 ml-2">
                            ({SCAN_PROFILE_CONFIGS[scanForm.scan_profile] && `Custom ${SCANNER_INFO[SCAN_PROFILE_CONFIGS[scanForm.scan_profile].scanner]?.name} options`})
                          </span>
                        </Label>
                        <Input
                          id="custom_options"
                          placeholder={`Custom ${SCAN_PROFILE_CONFIGS[scanForm.scan_profile] && SCANNER_INFO[SCAN_PROFILE_CONFIGS[scanForm.scan_profile].scanner]?.name} options`}
                          value={scanForm.custom_options}
                          onChange={(e) => setScanForm(prev => ({ ...prev, custom_options: e.target.value }))}
                          className="bg-gray-800 border-gray-600 text-white placeholder-gray-500 mt-2"
                        />
                      </div>
                      
                      <div className="flex gap-3 pt-4">
                        <Button
                          onClick={handleCreateScan}
                          className="bg-purple-600 hover:bg-purple-700 text-white flex-1"
                          disabled={isCreating}
                        >
                          {isCreating ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Play className="h-4 w-4 mr-2" />
                          )}
                          Start Web Scan
                        </Button>
                        <Button
                          onClick={() => setShowCreateDialog(false)}
                          variant="outline"
                          className="border-gray-600 text-gray-300 hover:bg-gray-800"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Web Scan Profiles Cards */}
              <div className="space-y-8">
                {/* OWASP ZAP Section */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <span className="text-purple-400">🕷️</span>
                    OWASP ZAP - Web Application Scanner
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[ScanProfile.ZAP_BASELINE, ScanProfile.ZAP_FULL, ScanProfile.ZAP_API].map((profile) => {
                      const config = SCAN_PROFILE_CONFIGS[profile];
                      return (
                        <Card key={profile} className="bg-gray-900/50 border-gray-700 backdrop-blur-sm hover:border-purple-500/50 transition-colors">
                          <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                              <Shield className="h-5 w-5 text-purple-400" />
                              {config.name}
                              {config.isAggressive && <span className="text-red-400">⚠️</span>}
                            </CardTitle>
                            <CardDescription className="text-gray-400">
                              {config.description}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-400">Scanner:</span>
                              <Badge variant="outline" className="border-purple-500/50 text-purple-400">
                                <Shield className="h-3 w-3 mr-1" />
                                OWASP ZAP
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-400">Duration:</span>
                              <span className="text-white">{config.estimated_duration}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-400">Target Type:</span>
                              <span className="text-white">Web URL</span>
                            </div>
                            <Button
                              onClick={() => {
                                setScanForm(prev => ({ 
                                  ...prev, 
                                  scan_profile: profile,
                                  targets: 'http://testphp.vulnweb.com' 
                                }));
                                setShowCreateDialog(true);
                              }}
                              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Configure & Start
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>

                {/* Nikto Section */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <span className="text-green-400">🔧</span>
                    Nikto - Web Server Scanner
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[ScanProfile.NIKTO_BASIC, ScanProfile.NIKTO_FULL, ScanProfile.NIKTO_FAST].map((profile) => {
                      const config = SCAN_PROFILE_CONFIGS[profile];
                      return (
                        <Card key={profile} className="bg-gray-900/50 border-gray-700 backdrop-blur-sm hover:border-green-500/50 transition-colors">
                          <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                              <Terminal className="h-5 w-5 text-green-400" />
                              {config.name}
                            </CardTitle>
                            <CardDescription className="text-gray-400">
                              {config.description}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-400">Scanner:</span>
                              <Badge variant="outline" className="border-green-500/50 text-green-400">
                                <Terminal className="h-3 w-3 mr-1" />
                                Nikto
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-400">Duration:</span>
                              <span className="text-white">{config.estimated_duration}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-400">Target Type:</span>
                              <span className="text-white">Web URL</span>
                            </div>
                            <Button
                              onClick={() => {
                                setScanForm(prev => ({ 
                                  ...prev, 
                                  scan_profile: profile,
                                  targets: 'http://testphp.vulnweb.com' 
                                }));
                                setShowCreateDialog(true);
                              }}
                              className="w-full bg-green-600 hover:bg-green-700 text-white"
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Configure & Start
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>

                {/* SQLMap Section */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <span className="text-yellow-400">💉</span>
                    SQLMap - SQL Injection Scanner
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[ScanProfile.SQLMAP_BASIC, ScanProfile.SQLMAP_THOROUGH, ScanProfile.SQLMAP_AGGRESSIVE].map((profile) => {
                      const config = SCAN_PROFILE_CONFIGS[profile];
                      return (
                        <Card key={profile} className="bg-gray-900/50 border-gray-700 backdrop-blur-sm hover:border-yellow-500/50 transition-colors">
                          <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                              <Terminal className="h-5 w-5 text-yellow-400" />
                              {config.name}
                              {config.isAggressive && <span className="text-red-400">⚠️</span>}
                            </CardTitle>
                            <CardDescription className="text-gray-400">
                              {config.description}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-400">Scanner:</span>
                              <Badge variant="outline" className="border-yellow-500/50 text-yellow-400">
                                <Terminal className="h-3 w-3 mr-1" />
                                SQLMap
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-400">Duration:</span>
                              <span className="text-white">{config.estimated_duration}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-400">Target Type:</span>
                              <span className="text-white">URL with Parameters</span>
                            </div>
                            <Button
                              onClick={() => {
                                setScanForm(prev => ({ 
                                  ...prev, 
                                  scan_profile: profile,
                                  targets: 'http://testphp.vulnweb.com/artists.php?artist=1' 
                                }));
                                setShowCreateDialog(true);
                              }}
                              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Configure & Start
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Active Scans Tab */}
          <TabsContent value="active">
            <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Active Scans</CardTitle>
                <CardDescription className="text-gray-400">
                  Currently running vulnerability scans
                </CardDescription>
              </CardHeader>
              <CardContent>
                {runningScans.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Activity className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No active scans</p>
                    <p className="text-sm">All scans are currently completed or idle</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700">
                        <TableHead className="text-gray-300 text-xs font-medium py-2">Target</TableHead>
                        <TableHead className="text-gray-300 text-xs font-medium py-2">Profile</TableHead>
                        <TableHead className="text-gray-300 text-xs font-medium py-2">Progress</TableHead>
                        <TableHead className="text-gray-300 text-xs font-medium py-2">Started</TableHead>
                        <TableHead className="text-gray-300 text-xs font-medium py-2">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {runningScans.map((scan) => {
                        const scanId = (scan as any).scan_id || scan.id;
                        const target = (scan as any).target || scan.targets;
                        const profile = ((scan as any).profile || scan.scan_profile) as ScanProfile;
                        return (
                        <TableRow key={scanId} className="border-gray-700">
                          <TableCell className="text-white text-sm py-2">{target}</TableCell>
                          <TableCell className="py-2">
                            <div className="flex flex-col gap-1">
                              <Badge variant="outline" className="border-blue-500/50 text-blue-400 w-fit text-xs px-2 py-0.5">
                                {SCAN_PROFILE_CONFIGS[profile]?.name || profile}
                              </Badge>
                              <div className="flex items-center gap-1">
                                {/* Scanner Type Badge */}
                                {SCAN_PROFILE_CONFIGS[profile]?.scanner === 'nmap' ? (
                                  <Badge variant="outline" className="text-xs border-blue-500/50 text-blue-400 px-1 py-0.5">
                                    <Network className="h-3 w-3 mr-1" />
                                    Network
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-xs border-purple-500/50 text-purple-400 px-1 py-0.5">
                                    <Shield className="h-3 w-3 mr-1" />
                                    Web
                                  </Badge>
                                )}
                                {/* Specific Scanner Badge */}
                                {SCAN_PROFILE_CONFIGS[profile] && (
                                  <Badge variant="outline" className={`text-xs w-fit ${SCANNER_INFO[SCAN_PROFILE_CONFIGS[profile].scanner].color} border px-1 py-0.5`}>
                                    {SCANNER_INFO[SCAN_PROFILE_CONFIGS[profile].scanner].icon} {SCANNER_INFO[SCAN_PROFILE_CONFIGS[profile].scanner].name}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-2">
                            <div className="space-y-1">
                              <Progress 
                                value={scanProgress && activeScanId === scanId ? scanProgress.progress : 0} 
                                className="h-1.5"
                              />
                              <span className="text-xs text-gray-400">
                                {scanProgress && activeScanId === scanId ? (scanProgress.message || 'Running...') : 'Initializing...'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-400 text-sm py-2">
                            {new Date(scan.created_at).toLocaleDateString('en-US', {
                              month: '2-digit',
                              day: '2-digit',
                              year: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </TableCell>
                          <TableCell className="py-2">
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setActiveScanId(scan.id)}
                                className="text-blue-400 hover:text-blue-300 h-6 w-6 p-0"
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCancelScan(scanId)}
                                disabled={cancellingScans.has(scanId)}
                                className="text-red-400 hover:text-red-300 disabled:opacity-50 h-6 w-6 p-0"
                              >
                                {cancellingScans.has(scanId) ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Square className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )})}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Scan History Tab */}
          <TabsContent value="history">
            <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Scan History</CardTitle>
                    <CardDescription className="text-gray-400">
                      Completed vulnerability scans and their results
                    </CardDescription>
                  </div>
                  
                  {/* Scanner Type Filter */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">Filter by type:</span>
                    <div className="flex rounded-lg border border-gray-600 bg-gray-800/50 p-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setScannerFilter(null)}
                        className={`text-xs px-3 py-1 rounded ${
                          scannerFilter === null 
                            ? 'bg-gray-600 text-white' 
                            : 'text-gray-400 hover:text-white hover:bg-gray-700'
                        }`}
                      >
                        All Scans
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setScannerFilter('port')}
                        className={`text-xs px-3 py-1 rounded ${
                          scannerFilter === 'port' 
                            ? 'bg-blue-600 text-white' 
                            : 'text-gray-400 hover:text-white hover:bg-gray-700'
                        }`}
                      >
                        <Network className="h-3 w-3 mr-1" />
                        Network Scans
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setScannerFilter('web')}
                        className={`text-xs px-3 py-1 rounded ${
                          scannerFilter === 'web' 
                            ? 'bg-purple-600 text-white' 
                            : 'text-gray-400 hover:text-white hover:bg-gray-700'
                        }`}
                      >
                        <Shield className="h-3 w-3 mr-1" />
                        Web Scans
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {(() => {
                  // Filter scans based on scanner type
                  const filteredScans = scannerFilter 
                    ? completedScans.filter(scan => {
                        // Try to determine scanner type from profile
                        const profile = (scan as any).profile || scan.scan_profile;
                        const config = SCAN_PROFILE_CONFIGS[profile as ScanProfile];
                        
                        if (!config) return false;
                        
                        if (scannerFilter === 'port') {
                          return config.scanner === 'nmap';
                        } else if (scannerFilter === 'web') {
                          return ['zap', 'nikto', 'sqlmap', 'burpsuite'].includes(config.scanner);
                        }
                        return false;
                      })
                    : completedScans;

                  if (filteredScans.length === 0) {
                    return (
                      <div className="text-center py-12 text-gray-400">
                        <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg">
                          {scannerFilter 
                            ? `No ${scannerFilter === 'port' ? 'network' : 'web'} scans found` 
                            : 'No completed scans'
                          }
                        </p>
                        <p className="text-sm">
                          {scannerFilter 
                            ? `Try a different filter or create a new ${scannerFilter === 'port' ? 'network' : 'web'} scan`
                            : 'Scan history will appear here once scans are completed'
                          }
                        </p>
                      </div>
                    );
                  }

                  return (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-700">
                          <TableHead className="text-gray-300 text-xs font-medium py-2">Target</TableHead>
                          <TableHead className="text-gray-300 text-xs font-medium py-2">Scanner Type</TableHead>
                          <TableHead className="text-gray-300 text-xs font-medium py-2">Profile</TableHead>
                          <TableHead className="text-gray-300 text-xs font-medium py-2">Status</TableHead>
                          <TableHead className="text-gray-300 text-xs font-medium py-2">Hosts Up</TableHead>
                          <TableHead className="text-gray-300 text-xs font-medium py-2">Open Ports</TableHead>
                          <TableHead className="text-gray-300 text-xs font-medium py-2">Services</TableHead>
                          <TableHead className="text-gray-300 text-xs font-medium py-2">Risk Score</TableHead>
                          <TableHead className="text-gray-300 text-xs font-medium py-2">Completed</TableHead>
                          <TableHead className="text-gray-300 text-xs font-medium py-2">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredScans.map((scan) => {
                          const profile = (scan as any).profile || scan.scan_profile;
                          const config = SCAN_PROFILE_CONFIGS[profile as ScanProfile];
                          const scannerInfo = config ? SCANNER_INFO[config.scanner] : null;
                          const isNetworkScan = config?.scanner === 'nmap';
                          
                          return (
                            <TableRow key={(scan as any).scan_id || scan.id} className="border-gray-700 hover:bg-gray-800/30">
                              <TableCell className="text-white text-sm py-2">
                                {(scan as any).target || scan.targets}
                              </TableCell>
                              <TableCell className="py-2">
                                <div className="flex items-center gap-1">
                                  {isNetworkScan ? (
                                    <Badge variant="outline" className="border-blue-500/50 text-blue-400 bg-blue-500/10 text-xs px-2 py-0.5">
                                      <Network className="h-3 w-3 mr-1" />
                                      Network
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="border-purple-500/50 text-purple-400 bg-purple-500/10 text-xs px-2 py-0.5">
                                      <Shield className="h-3 w-3 mr-1" />
                                      Web
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="py-2">
                                <div className="flex flex-col gap-1">
                                  <Badge variant="outline" className="border-green-500/50 text-green-400 bg-green-500/10 w-fit text-xs px-2 py-0.5">
                                    {config?.name || profile || 'N/A'}
                                  </Badge>
                                  {scannerInfo && (
                                    <Badge variant="outline" className={`text-xs w-fit bg-blue-500/10 border-blue-500/50 text-blue-400 px-2 py-0.5`}>
                                      {scannerInfo.icon} {scannerInfo.name}
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="py-2">
                                <Badge className={`${SCAN_STATUS_COLORS[scan.status]} border text-xs px-2 py-0.5`}>
                                  {scan.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-white text-sm py-2 text-center">
                                {scan.hosts_up > 0 ? (
                                  <span className="text-green-400 font-medium">{scan.hosts_up}</span>
                                ) : (
                                  <span className="text-gray-500">{scan.hosts_up || 0}</span>
                                )}
                              </TableCell>
                              <TableCell className="text-white text-sm py-2 text-center">
                                {scan.open_ports > 0 ? (
                                  <span className="text-cyan-400 font-medium">{scan.open_ports}</span>
                                ) : (
                                  <span className="text-gray-500">{scan.open_ports || 0}</span>
                                )}
                              </TableCell>
                              <TableCell className="py-2">
                                {scan.services_detected && scan.services_detected.length > 0 ? (
                                  <div className="flex flex-wrap gap-1">
                                    {scan.services_detected.slice(0, 2).map((service, idx) => (
                                      <Badge key={idx} variant="outline" className="border-purple-500/50 text-purple-400 bg-purple-500/10 text-xs px-1 py-0.5">
                                        {service}
                                      </Badge>
                                    ))}
                                    {scan.services_detected.length > 2 && (
                                      <Badge variant="outline" className="border-gray-500/50 text-gray-400 bg-gray-500/10 text-xs px-1 py-0.5">
                                        +{scan.services_detected.length - 2}
                                      </Badge>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-gray-500 text-sm">None</span>
                                )}
                              </TableCell>
                              <TableCell className="py-2">
                                <div className="flex items-center gap-1">
                                  <span className={`text-sm font-medium ${
                                    (scan.risk_score || 0) >= 70 ? 'text-red-400' :
                                    (scan.risk_score || 0) >= 40 ? 'text-yellow-400' :
                                    'text-green-400'
                                  }`}>
                                    {scan.risk_score !== undefined ? `${scan.risk_score}/100` : '0/100'}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="text-gray-400 py-2 text-sm">
                                {(() => {
                                  const completedDate = (scan as any).finished_at || scan.completed_at;
                                  return completedDate ? new Date(completedDate).toLocaleDateString('en-US', {
                                    month: '2-digit',
                                    day: '2-digit',
                                    year: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true
                                  }) : 'N/A';
                                })()}
                              </TableCell>
                              <TableCell className="py-2">
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => viewScanDetails((scan as any).scan_id || scan.id)}
                                    className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 h-6 w-6 p-0"
                                    title="View Details"
                                  >
                                    <Eye className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-green-400 hover:text-green-300 hover:bg-green-500/10 h-6 w-6 p-0"
                                    title="Download Report"
                                  >
                                    <Download className="h-3 w-3" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  );
                })()}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Scan Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Scan Details</DialogTitle>
            <DialogDescription className="text-gray-400">
              Detailed information about the selected scan
            </DialogDescription>
          </DialogHeader>
          
          {loadingDetails ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
              <span className="ml-2 text-gray-400">Loading scan details...</span>
            </div>
          ) : selectedScanDetails ? (
            <div className="space-y-6">
              {/* Scan Overview */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Scan Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Scan ID:</span>
                      <span className="font-mono text-xs">{selectedScanDetails.scan_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Target:</span>
                      <span>{selectedScanDetails.target}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Profile:</span>
                      <span className="capitalize">{selectedScanDetails.profile}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      <Badge variant="outline" className={`${
                        selectedScanDetails.status === 'COMPLETED' ? 'text-green-400 border-green-400' :
                        selectedScanDetails.status === 'RUNNING' ? 'text-blue-400 border-blue-400' :
                        selectedScanDetails.status === 'FAILED' ? 'text-red-400 border-red-400' :
                        'text-gray-400 border-gray-400'
                      }`}>
                        {selectedScanDetails.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">Timing</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Created:</span>
                      <span>{new Date(selectedScanDetails.created_at).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Started:</span>
                      <span>{selectedScanDetails.started_at ? new Date(selectedScanDetails.started_at).toLocaleString() : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Finished:</span>
                      <span>{selectedScanDetails.finished_at ? new Date(selectedScanDetails.finished_at).toLocaleString() : 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scan Results */}
              {selectedScanDetails.parsed_results && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Scan Results</h3>
                  
                  {/* Summary */}
                  {(selectedScanDetails.parsed_results as any)?.summary && (
                    <div className="bg-gray-800 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold mb-2">Summary</h4>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Total Hosts:</span>
                          <span className="ml-2 font-semibold">{(selectedScanDetails.parsed_results as any).summary.total_hosts || 0}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Open Ports:</span>
                          <span className="ml-2 font-semibold">{(selectedScanDetails.parsed_results as any).summary.total_open_ports || 0}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Vulnerabilities:</span>
                          <span className="ml-2 font-semibold text-orange-400">
                            {(() => {
                              let vulnCount = 0;
                              // Count from summary
                              if ((selectedScanDetails.parsed_results as any).summary.total_findings) {
                                vulnCount = (selectedScanDetails.parsed_results as any).summary.total_findings;
                              }
                              // Count from findings array
                              else if ((selectedScanDetails.parsed_results as any).findings) {
                                vulnCount = (selectedScanDetails.parsed_results as any).findings.length;
                              }
                              // Count from host findings
                              else if ((selectedScanDetails.parsed_results as any).parsed_json?.hosts) {
                                vulnCount = (selectedScanDetails.parsed_results as any).parsed_json.hosts.reduce((sum: number, host: any) => {
                                  return sum + (host.findings?.length || 0);
                                }, 0);
                              }
                              return vulnCount;
                            })()}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">Risk Score:</span>
                          <span className={`ml-2 font-semibold ${
                            ((selectedScanDetails.parsed_results as any).summary.risk_score || 0) >= 70 ? 'text-red-400' :
                            ((selectedScanDetails.parsed_results as any).summary.risk_score || 0) >= 40 ? 'text-yellow-400' :
                            'text-green-400'
                          }`}>
                            {(selectedScanDetails.parsed_results as any).summary.risk_score || 0}/100
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">Risk Level:</span>
                          <span className={`ml-2 font-semibold ${
                            (selectedScanDetails.parsed_results as any).summary.risk_level === 'HIGH' ? 'text-red-400' :
                            (selectedScanDetails.parsed_results as any).summary.risk_level === 'MEDIUM' ? 'text-yellow-400' :
                            'text-green-400'
                          }`}>
                            {(selectedScanDetails.parsed_results as any).summary.risk_level || 'LOW'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Hosts and Ports */}
                  {(selectedScanDetails.parsed_results as any)?.parsed_json?.hosts && (
                    <div className="space-y-4">
                      <h4 className="font-semibold">Discovered Hosts</h4>
                      {(selectedScanDetails.parsed_results as any).parsed_json.hosts.map((host: any, hostIndex: number) => (
                        <div key={hostIndex} className="bg-gray-800 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="font-semibold">{host.ip_address}</h5>
                            <Badge variant="outline" className={
                              host.state === 'up' ? 'text-green-400 border-green-400' : 'text-red-400 border-red-400'
                            }>
                              {host.state}
                            </Badge>
                          </div>
                          
                          {host.ports && host.ports.length > 0 && (
                            <div>
                              <h6 className="text-sm font-semibold mb-2 text-gray-300">Open Ports</h6>
                              <div className="grid grid-cols-1 gap-2">
                                {host.ports.map((port: any, portIndex: number) => (
                                  <div key={portIndex} className="flex items-center justify-between bg-gray-700 rounded p-2 text-sm">
                                    <div className="flex items-center gap-3">
                                      <span className="font-mono font-semibold text-blue-400">{port.port}</span>
                                      <span className="text-gray-400">{port.protocol}</span>
                                      <span className={`px-2 py-1 rounded text-xs ${
                                        port.state === 'open' ? 'bg-green-500/20 text-green-400' :
                                        port.state === 'closed' ? 'bg-red-500/20 text-red-400' :
                                        'bg-yellow-500/20 text-yellow-400'
                                      }`}>
                                        {port.state}
                                      </span>
                                    </div>
                                    <div className="text-right">
                                      <div className="font-semibold">{port.service?.name || 'Unknown'}</div>
                                      {port.service?.product && (
                                        <div className="text-xs text-gray-400">{port.service.product}</div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Recommendations */}
                  {(selectedScanDetails.parsed_results as any)?.summary?.recommendations && (
                    <div className="mt-4">
                      <h4 className="font-semibold mb-2">Recommendations</h4>
                      <div className="space-y-2">
                        {(selectedScanDetails.parsed_results as any).summary.recommendations.map((rec: string, index: number) => (
                          <div key={index} className="bg-yellow-500/10 border border-yellow-500/30 rounded p-3 text-sm">
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                              <span>{rec}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Security Findings/Vulnerabilities */}
                  {((selectedScanDetails.parsed_results as any)?.findings || 
                    (selectedScanDetails.parsed_results as any)?.parsed_json?.hosts?.some((host: any) => host.findings)) && (
                    <div className="mt-4">
                      <h4 className="font-semibold mb-2">Security Findings</h4>
                      <div className="space-y-3">
                        {/* Direct findings */}
                        {(selectedScanDetails.parsed_results as any)?.findings?.map((finding: any, index: number) => (
                          <div key={index} className={`rounded-lg p-4 border ${
                            finding.severity === 'critical' ? 'bg-red-500/10 border-red-500/30' :
                            finding.severity === 'high' ? 'bg-orange-500/10 border-orange-500/30' :
                            finding.severity === 'medium' ? 'bg-yellow-500/10 border-yellow-500/30' :
                            finding.severity === 'low' ? 'bg-blue-500/10 border-blue-500/30' :
                            'bg-gray-500/10 border-gray-500/30'
                          }`}>
                            <div className="flex items-start justify-between mb-2">
                              <h5 className="font-semibold">{finding.title || finding.name || 'Security Finding'}</h5>
                              <Badge className={`${getSeverityColor(finding.severity || 'info')} text-xs`}>
                                {finding.severity?.toUpperCase() || 'INFO'}
                              </Badge>
                            </div>
                            {finding.description && (
                              <p className="text-sm text-gray-300 mb-2">{finding.description}</p>
                            )}
                            {finding.port && (
                              <p className="text-xs text-gray-400">Port: {finding.port}</p>
                            )}
                            {finding.service && (
                              <p className="text-xs text-gray-400">Service: {finding.service}</p>
                            )}
                          </div>
                        ))}
                        
                        {/* Host-based findings */}
                        {(selectedScanDetails.parsed_results as any)?.parsed_json?.hosts?.map((host: any, hostIndex: number) => 
                          host.findings?.map((finding: any, findingIndex: number) => (
                            <div key={`${hostIndex}-${findingIndex}`} className={`rounded-lg p-4 border ${
                              finding.severity === 'critical' ? 'bg-red-500/10 border-red-500/30' :
                              finding.severity === 'high' ? 'bg-orange-500/10 border-orange-500/30' :
                              finding.severity === 'medium' ? 'bg-yellow-500/10 border-yellow-500/30' :
                              finding.severity === 'low' ? 'bg-blue-500/10 border-blue-500/30' :
                              'bg-gray-500/10 border-gray-500/30'
                            }`}>
                              <div className="flex items-start justify-between mb-2">
                                <h5 className="font-semibold">{finding.title || finding.name || 'Security Finding'}</h5>
                                <div className="flex gap-2">
                                  <Badge variant="outline" className="text-xs border-gray-500/50 text-gray-400">
                                    {host.ip_address}
                                  </Badge>
                                  <Badge className={`${getSeverityColor(finding.severity || 'info')} text-xs`}>
                                    {finding.severity?.toUpperCase() || 'INFO'}
                                  </Badge>
                                </div>
                              </div>
                              {finding.description && (
                                <p className="text-sm text-gray-300 mb-2">{finding.description}</p>
                              )}
                              {finding.port && (
                                <p className="text-xs text-gray-400">Port: {finding.port}</p>
                              )}
                              {finding.service && (
                                <p className="text-xs text-gray-400">Service: {finding.service}</p>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Raw Data (for debugging) */}
              {selectedScanDetails.raw_xml_path && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Technical Details</h3>
                  <div className="bg-gray-800 rounded-lg p-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Raw XML Path:</span>
                      <span className="font-mono text-xs">{selectedScanDetails.raw_xml_path}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              No scan details available
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}