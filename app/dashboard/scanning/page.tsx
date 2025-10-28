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
  AlertCircle
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import DashboardLayout from '@/components/layout/DashboardLayout';

// Import our custom hooks and types
import { useScans, useScanStats, useScanProgress } from '@/hooks/use-scans';
import { ScanProfile, ScanStatus, SCAN_STATUS_COLORS, SCAN_PROFILE_CONFIGS } from '@/types/api';

export default function VulnerabilityScanning() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [activeScanId, setActiveScanId] = useState<string | null>(null);
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  // API hooks
  const { scans, loading: scansLoading, error: scansError, refreshScans, createScan, cancelScan, deleteScan } = useScans();
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

  const handleCreateScan = async () => {
    if (!scanForm.targets.trim()) {
      setFormError('Please enter scan targets');
      return;
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
    const success = await cancelScan(scanId);
    if (success && activeScanId === scanId) {
      setActiveScanId(null);
    }
  };

  const startQuickScan = async () => {
    const defaultTargets = '127.0.0.1';
    const newScan = await createScan({
      targets: defaultTargets,
      scan_profile: ScanProfile.QUICK
    });

    if (newScan) {
      setActiveScanId(newScan.id);
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

  // Filter scans by status
  const runningScans = scans.filter(scan => scan.status === ScanStatus.RUNNING);
  const completedScans = scans.filter(scan => scan.status === ScanStatus.COMPLETED);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Vulnerability Scanning</h1>
            <p className="text-gray-400 mt-2">
              Comprehensive network and application security assessment
            </p>
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
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                  <Plus className="h-4 w-4 mr-2" />
                  New Scan
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Scan</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Configure a new vulnerability scan
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
                  <div>
                    <Label htmlFor="targets" className="text-gray-300">Scan Targets</Label>
                    <Textarea
                      id="targets"
                      placeholder="Enter IP addresses, hostnames, or networks (one per line)&#10;Examples:&#10;192.168.1.1&#10;example.com&#10;192.168.1.0/24"
                      value={scanForm.targets}
                      onChange={(e) => setScanForm(prev => ({ ...prev, targets: e.target.value }))}
                      className="bg-gray-800 border-gray-600 text-white placeholder-gray-500 mt-2"
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor="scan_profile" className="text-gray-300">Scan Profile</Label>
                    <Select 
                      value={scanForm.scan_profile} 
                      onValueChange={(value) => setScanForm(prev => ({ ...prev, scan_profile: value as ScanProfile }))}
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        {Object.entries(SCAN_PROFILE_CONFIGS).map(([profile, config]) => (
                          <SelectItem key={profile} value={profile} className="text-white hover:bg-gray-700">
                            <div>
                              <div className="font-medium">{config.name}</div>
                              <div className="text-xs text-gray-400">{config.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="custom_options" className="text-gray-300">Custom Nmap Options (Optional)</Label>
                    <Input
                      id="custom_options"
                      placeholder="e.g., -p 1-1000 --script vuln"
                      value={scanForm.custom_options}
                      onChange={(e) => setScanForm(prev => ({ ...prev, custom_options: e.target.value }))}
                      className="bg-gray-800 border-gray-600 text-white placeholder-gray-500 mt-2"
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleCreateScan}
                      className="bg-cyan-600 hover:bg-cyan-700 text-white flex-1"
                      disabled={isCreating}
                    >
                      {isCreating ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Play className="h-4 w-4 mr-2" />
                      )}
                      Start Scan
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
                  <p className="text-sm font-medium text-gray-400">Completed Today</p>
                  {statsLoading ? (
                    <div className="h-7 w-8 bg-gray-700 animate-pulse rounded"></div>
                  ) : (
                    <p className="text-2xl font-bold text-white">{stats?.scans_last_24h || 0}</p>
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
                  {statsLoading ? (
                    <div className="h-7 w-8 bg-gray-700 animate-pulse rounded"></div>
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
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Settings className="h-6 w-6 text-purple-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Total Scans</p>
                  {statsLoading ? (
                    <div className="h-7 w-8 bg-gray-700 animate-pulse rounded"></div>
                  ) : (
                    <p className="text-2xl font-bold text-white">{stats?.total_scans || 0}</p>
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
                  ) : scans.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No scans found</p>
                      <p className="text-sm">Create your first scan to get started</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {scans.slice(0, 5).map((scan) => (
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
                    <div className="space-y-4">
                      {runningScans.map((scan) => (
                        <div key={scan.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-white font-medium">{scan.targets}</span>
                            <span className="text-sm text-gray-400">
                              {scanProgress && activeScanId === scan.id ? `${scanProgress.progress}%` : 'Running...'}
                            </span>
                          </div>
                          <Progress 
                            value={scanProgress && activeScanId === scan.id ? scanProgress.progress : 0} 
                            className="h-2"
                          />
                          <div className="flex items-center justify-between text-sm text-gray-400">
                            <span>
                              {scanProgress && activeScanId === scan.id ? (scanProgress.message || 'Running...') : 'Initializing...'}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCancelScan(scan.id)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Square className="h-3 w-3 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
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
                        <TableHead className="text-gray-300">Target</TableHead>
                        <TableHead className="text-gray-300">Profile</TableHead>
                        <TableHead className="text-gray-300">Progress</TableHead>
                        <TableHead className="text-gray-300">Started</TableHead>
                        <TableHead className="text-gray-300">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {runningScans.map((scan) => (
                        <TableRow key={scan.id} className="border-gray-700">
                          <TableCell className="text-white font-medium">{scan.targets}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="border-blue-500/50 text-blue-400">
                              {SCAN_PROFILE_CONFIGS[scan.scan_profile]?.name || scan.scan_profile}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-2">
                              <Progress 
                                value={scanProgress && activeScanId === scan.id ? scanProgress.progress : 0} 
                                className="h-2"
                              />
                              <span className="text-sm text-gray-400">
                                {scanProgress && activeScanId === scan.id ? (scanProgress.message || 'Running...') : 'Initializing...'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-400">
                            {new Date(scan.created_at).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setActiveScanId(scan.id)}
                                className="text-blue-400 hover:text-blue-300"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCancelScan(scan.id)}
                                className="text-red-400 hover:text-red-300"
                              >
                                <Square className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
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
                <CardTitle className="text-white">Scan History</CardTitle>
                <CardDescription className="text-gray-400">
                  Completed vulnerability scans and their results
                </CardDescription>
              </CardHeader>
              <CardContent>
                {completedScans.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No completed scans</p>
                    <p className="text-sm">Scan history will appear here once scans are completed</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700">
                        <TableHead className="text-gray-300">Target</TableHead>
                        <TableHead className="text-gray-300">Profile</TableHead>
                        <TableHead className="text-gray-300">Status</TableHead>
                        <TableHead className="text-gray-300">Vulnerabilities</TableHead>
                        <TableHead className="text-gray-300">Completed</TableHead>
                        <TableHead className="text-gray-300">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {completedScans.map((scan) => (
                        <TableRow key={scan.id} className="border-gray-700">
                          <TableCell className="text-white font-medium">{scan.targets}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="border-green-500/50 text-green-400">
                              {SCAN_PROFILE_CONFIGS[scan.scan_profile]?.name || scan.scan_profile}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${SCAN_STATUS_COLORS[scan.status]} border`}>
                              {scan.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {scan.vulnerabilities_found > 0 ? (
                              <span className="text-red-400 font-medium">{scan.vulnerabilities_found}</span>
                            ) : (
                              <span className="text-green-400">None</span>
                            )}
                          </TableCell>
                          <TableCell className="text-gray-400">
                            {scan.completed_at ? new Date(scan.completed_at).toLocaleString() : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-blue-400 hover:text-blue-300"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-400 hover:text-green-300"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}