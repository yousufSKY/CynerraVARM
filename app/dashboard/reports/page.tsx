'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, 
  Download, 
  Calendar, 
  Clock, 
  Send, 
  Plus,
  BarChart3,
  Shield,
  CheckCircle,
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  Settings,
  RefreshCw,
  Globe,
  Network,
  Terminal,
  Activity,
  Loader2,
  ChevronRight,
  XCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useScans } from '@/hooks/use-scans';
import { ScanResponse, ScanStatus, Finding, SCAN_PROFILE_CONFIGS } from '@/types/api';
import { generateScanReportPDF, generateExecutiveSummaryPDF } from '@/lib/pdf-generator';
import { PDF_TEMPLATES, PDFTemplate } from '@/lib/pdf-templates';

export default function ReportsCompliance() {
  const [selectedReport, setSelectedReport] = useState('');
  const [scanFilter, setScanFilter] = useState<'all' | 'port' | 'web'>('all');
  const [selectedScan, setSelectedScan] = useState<ScanResponse | null>(null);
  const [showScanDetails, setShowScanDetails] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<PDFTemplate>(PDF_TEMPLATES[0]);
  const [showTemplatePreview, setShowTemplatePreview] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<PDFTemplate | null>(null);
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  
  // Fetch scans from database
  const { scans, loading: scansLoading, error: scansError, refreshScans, fetchScans } = useScans();
  
  // Loading state for scan details
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Handle authentication state
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);
  
  // Fetch scans on mount
  useEffect(() => {
    if (isSignedIn) {
      fetchScans();
    }
  }, [isSignedIn, fetchScans]);

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

  const reportTemplates = [
    {
      id: 1,
      name: 'Executive Security Dashboard',
      description: 'High-level security metrics for executive leadership',
      category: 'Executive',
      schedule: 'Weekly',
      lastGenerated: '2024-01-07 09:00',
      format: 'PDF',
      recipients: 'C-Suite, Board Members'
    },
    {
      id: 2,
      name: 'Vulnerability Assessment Report',
      description: 'Detailed technical vulnerability findings and remediation',
      category: 'Technical',
      schedule: 'Daily',
      lastGenerated: '2024-01-07 18:00',
      format: 'PDF, Excel',
      recipients: 'Security Team, IT Operations'
    },
    {
      id: 3,
      name: 'Compliance Audit Report',
      description: 'Regulatory compliance status and gap analysis',
      category: 'Compliance',
      schedule: 'Monthly',
      lastGenerated: '2024-01-01 10:00',
      format: 'PDF',
      recipients: 'Compliance Team, Auditors'
    },
    {
      id: 4,
      name: 'Incident Response Summary',
      description: 'Security incident analysis and response metrics',
      category: 'Operational',
      schedule: 'Weekly',
      lastGenerated: '2024-01-06 14:00',
      format: 'PDF, Word',
      recipients: 'CISO, Incident Response Team'
    }
  ];

  const complianceFrameworks = [
    {
      name: 'NIST Cybersecurity Framework',
      version: '1.1',
      lastAssessment: '2024-01-01',
      score: 78,
      status: 'In Progress',
      controls: {
        total: 108,
        implemented: 84,
        partial: 15,
        notImplemented: 9
      }
    },
    {
      name: 'ISO 27001',
      version: '2013',
      lastAssessment: '2023-12-15',
      score: 85,
      status: 'Compliant',
      controls: {
        total: 114,
        implemented: 97,
        partial: 12,
        notImplemented: 5
      }
    },
    {
      name: 'SOC 2 Type II',
      version: '2017',
      lastAssessment: '2023-11-30',
      score: 92,
      status: 'Compliant',
      controls: {
        total: 64,
        implemented: 59,
        partial: 4,
        notImplemented: 1
      }
    },
    {
      name: 'PCI DSS',
      version: '4.0',
      lastAssessment: '2024-01-05',
      score: 68,
      status: 'Needs Attention',
      controls: {
        total: 321,
        implemented: 218,
        partial: 67,
        notImplemented: 36
      }
    }
  ];

  const recentReports = [
    {
      id: 1,
      title: 'Q4 2023 Security Posture Review',
      type: 'Executive Summary',
      createdBy: 'Security Team',
      createdAt: '2024-01-02 10:30',
      size: '2.4 MB',
      format: 'PDF',
      status: 'completed'
    },
    {
      id: 2,
      title: 'January Vulnerability Scan Results',
      type: 'Technical Report',
      createdBy: 'Automated System',
      createdAt: '2024-01-07 18:00',
      size: '15.8 MB',
      format: 'Excel',
      status: 'completed'
    },
    {
      id: 3,
      title: 'PCI DSS Compliance Assessment',
      type: 'Compliance Report',
      createdBy: 'Compliance Officer',
      createdAt: '2024-01-05 14:20',
      size: '8.7 MB',
      format: 'PDF',
      status: 'completed'
    },
    {
      id: 4,
      title: 'Risk Management Dashboard',
      type: 'Risk Report',
      createdBy: 'Risk Analyst',
      createdAt: '2024-01-07 09:15',
      size: '1.9 MB',
      format: 'PDF',
      status: 'generating'
    }
  ];

  const getComplianceColor = (score: number) => {
    if (score >= 90) return 'text-green-400 bg-green-500/20';
    if (score >= 75) return 'text-blue-400 bg-blue-500/20';
    if (score >= 60) return 'text-yellow-400 bg-yellow-500/20';
    return 'text-red-400 bg-red-500/20';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Compliant':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Compliant</Badge>;
      case 'In Progress':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">In Progress</Badge>;
      case 'Needs Attention':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Needs Attention</Badge>;
      default:
        return <Badge variant="secondary" className="bg-slate-500/20 text-slate-400 border-slate-500/30">{status}</Badge>;
    }
  };

  // Scan report helpers
  const getScanStatusBadge = (status: ScanStatus) => {
    switch (status) {
      case ScanStatus.COMPLETED:
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case ScanStatus.RUNNING:
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30"><Loader2 className="h-3 w-3 mr-1 animate-spin" />Running</Badge>;
      case ScanStatus.PENDING:
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case ScanStatus.FAILED:
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      case ScanStatus.CANCELLED:
        return <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getScannerTypeBadge = (scan: ScanResponse) => {
    const isWebScan = scan.profile?.startsWith('ai-') || 
                      ['ai-zap-analysis', 'ai-nikto-analysis', 'ai-sqlmap-analysis'].includes(scan.profile);
    
    if (isWebScan) {
      return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30"><Globe className="h-3 w-3 mr-1" />Web 🤖</Badge>;
    }
    return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30"><Network className="h-3 w-3 mr-1" />Network</Badge>;
  };

  const getSeverityBadge = (severity: string) => {
    const colors: Record<string, string> = {
      critical: 'bg-red-500/20 text-red-400 border-red-500/30',
      high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      info: 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    };
    return <Badge className={colors[severity?.toLowerCase()] || colors.info}>{severity}</Badge>;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const getProfileName = (profile: string) => {
    const config = SCAN_PROFILE_CONFIGS[profile as keyof typeof SCAN_PROFILE_CONFIGS];
    return config?.name || profile;
  };

  // Filter scans based on type
  const filteredScans = scans.filter(scan => {
    if (scanFilter === 'all') return true;
    const isWebScan = scan.profile?.startsWith('ai-') || 
                      ['ai-zap-analysis', 'ai-nikto-analysis', 'ai-sqlmap-analysis'].includes(scan.profile);
    return scanFilter === 'web' ? isWebScan : !isWebScan;
  });

  // Calculate stats
  const portScans = scans.filter(s => !s.profile?.startsWith('ai-'));
  const webScans = scans.filter(s => s.profile?.startsWith('ai-'));
  const completedScans = scans.filter(s => s.status === ScanStatus.COMPLETED);

  // Handle view scan details
  const handleViewScan = (scan: ScanResponse) => {
    setSelectedScan(scan);
    setShowScanDetails(true);
    // Scan data already includes parsed_results, no need to fetch again
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Reports & Compliance</h1>
            <p className="text-slate-300">Generate reports and track compliance status</p>
          </div>
          <div className="flex items-center gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:text-white">
                  <Settings className="h-4 w-4 mr-2" />
                  Configure Reports
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Report Configuration</DialogTitle>
                  <DialogDescription>Set up automated report generation and distribution</DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="reportName">Report Name</Label>
                      <Input id="reportName" placeholder="Custom Security Report" />
                    </div>
                    <div>
                      <Label htmlFor="reportType">Report Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="executive">Executive Summary</SelectItem>
                          <SelectItem value="technical">Technical Report</SelectItem>
                          <SelectItem value="compliance">Compliance Report</SelectItem>
                          <SelectItem value="operational">Operational Report</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" placeholder="Describe the report content and purpose" rows={3} />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="schedule">Schedule</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="format">Format</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pdf">PDF</SelectItem>
                          <SelectItem value="excel">Excel</SelectItem>
                          <SelectItem value="word">Word</SelectItem>
                          <SelectItem value="html">HTML</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="delivery">Delivery</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="portal">Portal</SelectItem>
                          <SelectItem value="both">Both</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="recipients">Recipients (comma-separated emails)</Label>
                    <Input id="recipients" placeholder="user@company.com, manager@company.com" />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button className="flex-1">Create Report Template</Button>
                    <Button variant="outline" className="flex-1 border-slate-600 text-slate-300 hover:text-white">Cancel</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Generate New Report</DialogTitle>
                  <DialogDescription>Create a one-time or scheduled report</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="template">Report Template</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select template" />
                      </SelectTrigger>
                      <SelectContent>
                        {reportTemplates.map(template => (
                          <SelectItem key={template.id} value={template.id.toString()}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="dateRange">Date Range</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="last7days">Last 7 days</SelectItem>
                          <SelectItem value="last30days">Last 30 days</SelectItem>
                          <SelectItem value="lastquarter">Last quarter</SelectItem>
                          <SelectItem value="custom">Custom range</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="format">Format</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Output format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pdf">PDF</SelectItem>
                          <SelectItem value="excel">Excel</SelectItem>
                          <SelectItem value="word">Word</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button className="flex-1">Generate Now</Button>
                    <Button variant="outline" className="flex-1 border-slate-600 text-slate-300 hover:text-white">Schedule</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Summary Cards - Real Scan Data */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Total Scans</p>
                  <p className="text-2xl md:text-3xl font-bold text-white">
                    {scansLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : scans.length}
                  </p>
                </div>
                <Activity className="h-6 w-6 md:h-8 md:w-8 text-cyan-500" />
              </div>
              <div className="mt-2 flex gap-2 text-xs">
                <span className="text-blue-400">{portScans.length} Port</span>
                <span className="text-slate-500">•</span>
                <span className="text-purple-400">{webScans.length} Web</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Completed Scans</p>
                  <p className="text-2xl md:text-3xl font-bold text-green-400">
                    {scansLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : completedScans.length}
                  </p>
                </div>
                <CheckCircle className="h-6 w-6 md:h-8 md:w-8 text-green-500" />
              </div>
              <div className="mt-2 text-xs text-slate-400">
                {scans.length > 0 ? `${Math.round((completedScans.length / scans.length) * 100)}% completion rate` : 'No scans yet'}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Total Findings</p>
                  <p className="text-2xl md:text-3xl font-bold text-orange-400">
                    {scansLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : 
                      completedScans.reduce((sum, s) => sum + (s.parsed_results?.summary?.total_findings || 0), 0)
                    }
                  </p>
                </div>
                <AlertTriangle className="h-6 w-6 md:h-8 md:w-8 text-orange-500" />
              </div>
              <div className="mt-2 flex gap-2 text-xs">
                <span className="text-red-400">
                  {completedScans.reduce((sum, s) => sum + (s.parsed_results?.summary?.critical || 0), 0)} Critical
                </span>
                <span className="text-orange-400">
                  {completedScans.reduce((sum, s) => sum + (s.parsed_results?.summary?.high || 0), 0)} High
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Avg Risk Score</p>
                  <p className="text-2xl md:text-3xl font-bold text-purple-400">
                    {scansLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : 
                      completedScans.length > 0 
                        ? Math.round(completedScans.reduce((sum, s) => sum + (s.parsed_results?.summary?.risk_score || 0), 0) / completedScans.length)
                        : 0
                    }
                  </p>
                </div>
                <Shield className="h-6 w-6 md:h-8 md:w-8 text-purple-500" />
              </div>
              <div className="mt-2 text-xs text-slate-400">
                {completedScans.length > 0 ? 'Based on completed scans' : 'No data yet'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="scans" className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 bg-slate-800/30 p-1 rounded-lg mb-6 gap-1">
            <TabsTrigger 
              value="scans" 
              className="text-slate-300 data-[state=active]:bg-slate-700/70 data-[state=active]:text-cyan-400 data-[state=active]:shadow-sm hover:text-cyan-100 hover:bg-slate-700/30 transition-all duration-200 rounded-md text-xs md:text-sm px-2 py-2"
            >
              🔍 Scan Reports
            </TabsTrigger>
            <TabsTrigger 
              value="templates" 
              className="text-slate-300 data-[state=active]:bg-slate-700/70 data-[state=active]:text-cyan-400 data-[state=active]:shadow-sm hover:text-cyan-100 hover:bg-slate-700/30 transition-all duration-200 rounded-md text-xs md:text-sm px-2 py-2"
            >
              🎨 Templates
            </TabsTrigger>
            <TabsTrigger 
              value="reports" 
              className="text-slate-300 data-[state=active]:bg-slate-700/70 data-[state=active]:text-cyan-400 data-[state=active]:shadow-sm hover:text-cyan-100 hover:bg-slate-700/30 transition-all duration-200 rounded-md text-xs md:text-sm px-2 py-2"
            >
              Download
            </TabsTrigger>
            <TabsTrigger 
              value="recent" 
              className="text-slate-300 data-[state=active]:bg-slate-700/70 data-[state=active]:text-cyan-400 data-[state=active]:shadow-sm hover:text-cyan-100 hover:bg-slate-700/30 transition-all duration-200 rounded-md text-xs md:text-sm px-2 py-2"
            >
              Recent
            </TabsTrigger>
            <TabsTrigger 
              value="compliance" 
              className="text-slate-300 data-[state=active]:bg-slate-700/70 data-[state=active]:text-cyan-400 data-[state=active]:shadow-sm hover:text-cyan-100 hover:bg-slate-700/30 transition-all duration-200 rounded-md text-xs md:text-sm px-2 py-2"
            >
              Security
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="text-slate-300 data-[state=active]:bg-slate-700/70 data-[state=active]:text-cyan-400 data-[state=active]:shadow-sm hover:text-cyan-100 hover:bg-slate-700/30 transition-all duration-200 rounded-md text-xs md:text-sm px-2 py-2"
            >
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Scan Reports Tab */}
          <TabsContent value="scans" className="space-y-6">
            {/* Scan Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-400">Total Scans</p>
                      <p className="text-2xl font-bold text-white">{scans.length}</p>
                    </div>
                    <Activity className="h-8 w-8 text-cyan-500" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-400">Port Scans</p>
                      <p className="text-2xl font-bold text-blue-400">{portScans.length}</p>
                    </div>
                    <Network className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-400">Web Scans</p>
                      <p className="text-2xl font-bold text-purple-400">{webScans.length}</p>
                    </div>
                    <Globe className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-400">Completed</p>
                      <p className="text-2xl font-bold text-green-400">{completedScans.length}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Scan Reports Table */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle className="text-white">Scan Reports</CardTitle>
                    <CardDescription className="text-slate-300">
                      View and analyze security scan results from the database
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Filter Select */}
                    <Select value={scanFilter} onValueChange={(value: 'all' | 'port' | 'web') => setScanFilter(value)}>
                      <SelectTrigger className="w-[140px] bg-slate-700/50 border-slate-600 text-white">
                        <SelectValue placeholder="Filter by type" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="all" className="text-white hover:bg-slate-700">All Scans</SelectItem>
                        <SelectItem value="port" className="text-white hover:bg-slate-700">Port Scans</SelectItem>
                        <SelectItem value="web" className="text-white hover:bg-slate-700">Web Scans</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => refreshScans()}
                      disabled={scansLoading}
                      className="border-slate-600 text-slate-300 hover:text-white"
                    >
                      <RefreshCw className={`h-4 w-4 mr-1 ${scansLoading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {scansLoading && scans.length === 0 ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
                    <span className="ml-2 text-slate-400">Loading scans...</span>
                  </div>
                ) : scansError ? (
                  <div className="flex items-center justify-center py-12 text-red-400">
                    <AlertCircle className="h-6 w-6 mr-2" />
                    <span>{scansError}</span>
                  </div>
                ) : filteredScans.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                    <FileText className="h-12 w-12 mb-4 opacity-30" />
                    <p>No scan reports found</p>
                    <p className="text-sm">Run a scan from the Scanning page to generate reports</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-slate-700">
                          <TableHead className="text-slate-300">Target</TableHead>
                          <TableHead className="text-slate-300">Type</TableHead>
                          <TableHead className="text-slate-300">Profile</TableHead>
                          <TableHead className="text-slate-300">Status</TableHead>
                          <TableHead className="text-slate-300 hidden md:table-cell">Findings</TableHead>
                          <TableHead className="text-slate-300 hidden lg:table-cell">Date</TableHead>
                          <TableHead className="text-slate-300">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredScans.map((scan) => (
                          <TableRow key={scan.scan_id} className="border-slate-700 hover:bg-slate-700/30">
                            <TableCell className="font-medium text-white max-w-[200px] truncate">
                              {scan.target}
                            </TableCell>
                            <TableCell>{getScannerTypeBadge(scan)}</TableCell>
                            <TableCell className="text-slate-300 text-sm">
                              {getProfileName(scan.profile)}
                            </TableCell>
                            <TableCell>{getScanStatusBadge(scan.status)}</TableCell>
                            <TableCell className="hidden md:table-cell">
                              {scan.parsed_results?.summary ? (
                                <div className="flex items-center gap-1">
                                  {scan.parsed_results.summary.critical > 0 && (
                                    <Badge className="bg-red-500/20 text-red-400 text-xs">{scan.parsed_results.summary.critical} C</Badge>
                                  )}
                                  {scan.parsed_results.summary.high > 0 && (
                                    <Badge className="bg-orange-500/20 text-orange-400 text-xs">{scan.parsed_results.summary.high} H</Badge>
                                  )}
                                  {scan.parsed_results.summary.medium > 0 && (
                                    <Badge className="bg-yellow-500/20 text-yellow-400 text-xs">{scan.parsed_results.summary.medium} M</Badge>
                                  )}
                                  {(scan.parsed_results.summary.critical === 0 && scan.parsed_results.summary.high === 0 && scan.parsed_results.summary.medium === 0) && (
                                    <span className="text-slate-400 text-sm">{scan.parsed_results.summary.total_findings} total</span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-slate-500">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-slate-400 text-sm hidden lg:table-cell">
                              {formatDate(scan.created_at)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-slate-300 hover:text-white"
                                  onClick={() => handleViewScan(scan)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-slate-300 hover:text-white"
                                  onClick={() => generateScanReportPDF(scan, { templateId: selectedTemplate.id })}
                                  title="Download PDF Report"
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Scan Details Dialog */}
            <Dialog open={showScanDetails} onOpenChange={setShowScanDetails}>
              <DialogContent className="max-w-4xl max-h-[90vh] bg-slate-900 border-slate-700">
                <DialogHeader>
                  <DialogTitle className="text-white flex items-center gap-2">
                    <Shield className="h-5 w-5 text-cyan-400" />
                    Scan Report Details
                  </DialogTitle>
                  <DialogDescription className="text-slate-400">
                    {selectedScan?.target} - {getProfileName(selectedScan?.profile || '')}
                  </DialogDescription>
                </DialogHeader>
                
                {detailsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
                    <span className="ml-2 text-slate-400">Loading scan details...</span>
                  </div>
                ) : (
                  <ScrollArea className="max-h-[60vh]">
                    <div className="space-y-6 pr-4">
                      {/* Scan Summary */}
                      {(selectedScan?.parsed_results?.summary ) && (
                        <Card className="bg-slate-800/50 border-slate-700">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-white text-lg">Summary</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="text-center p-3 bg-red-500/10 rounded-lg">
                                <div className="text-2xl font-bold text-red-400">
                                  {selectedScan?.parsed_results?.summary?.critical ?.critical || 0}
                                </div>
                                <div className="text-xs text-slate-400">Critical</div>
                              </div>
                              <div className="text-center p-3 bg-orange-500/10 rounded-lg">
                                <div className="text-2xl font-bold text-orange-400">
                                  {selectedScan?.parsed_results?.summary?.high ?.high || 0}
                                </div>
                                <div className="text-xs text-slate-400">High</div>
                              </div>
                              <div className="text-center p-3 bg-yellow-500/10 rounded-lg">
                                <div className="text-2xl font-bold text-yellow-400">
                                  {selectedScan?.parsed_results?.summary?.medium ?.medium || 0}
                                </div>
                                <div className="text-xs text-slate-400">Medium</div>
                              </div>
                              <div className="text-center p-3 bg-blue-500/10 rounded-lg">
                                <div className="text-2xl font-bold text-blue-400">
                                  {selectedScan?.parsed_results?.summary?.low ?.low || 0}
                                </div>
                                <div className="text-xs text-slate-400">Low</div>
                              </div>
                            </div>
                            
                            {/* AI Risk Assessment */}
                            {(selectedScan?.parsed_results?.summary?.ai_risk_assessment ?.ai_risk_assessment) && (
                              <div className="mt-4 p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
                                <div className="flex items-center gap-2 text-purple-400 font-semibold mb-2">
                                  <span>🤖</span> AI Risk Assessment
                                </div>
                                <p className="text-slate-300 text-sm">
                                  {selectedScan?.parsed_results?.summary?.ai_risk_assessment ?.ai_risk_assessment}
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}

                      {/* Findings List */}
                      {(selectedScan?.parsed_results?.parsed_json?.findings ) && (
                        <Card className="bg-slate-800/50 border-slate-700">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-white text-lg">
                              Findings ({(selectedScan?.parsed_results?.parsed_json?.findings )?.length || 0})
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {(selectedScan?.parsed_results?.parsed_json?.findings  || []).map((finding: Finding, index: number) => (
                              <div key={finding.finding_id || index} className="p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                                <div className="flex items-start justify-between mb-2">
                                  <h4 className="font-semibold text-white">{finding.title}</h4>
                                  {getSeverityBadge(finding.severity)}
                                </div>
                                <p className="text-sm text-slate-300 mb-2">{finding.description}</p>
                                {finding.affected_component && (
                                  <p className="text-xs text-slate-400">
                                    <span className="font-semibold">Affected:</span> {finding.affected_component}
                                  </p>
                                )}
                                {finding.solution && (
                                  <div className="mt-2 p-2 bg-green-500/10 rounded border border-green-500/30">
                                    <p className="text-xs text-green-400">
                                      <span className="font-semibold">Solution:</span> {finding.solution}
                                    </p>
                                  </div>
                                )}
                                {finding.cwe_id && (
                                  <Badge className="mt-2 bg-slate-600/50 text-slate-300 text-xs">
                                    CWE: {finding.cwe_id}
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </CardContent>
                        </Card>
                      )}

                      {/* Recommendations */}
                      {(selectedScan?.parsed_results?.parsed_json?.recommendations ) && (
                        <Card className="bg-slate-800/50 border-slate-700">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-white text-lg flex items-center gap-2">
                              <Info className="h-4 w-4 text-cyan-400" />
                              Recommendations
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-2">
                              {(selectedScan?.parsed_results?.parsed_json?.recommendations  || []).map((rec: string, index: number) => (
                                <li key={index} className="flex items-start gap-2 text-sm text-slate-300">
                                  <ChevronRight className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                                  {rec}
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </ScrollArea>
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle className="text-white">Report Templates</CardTitle>
                    <CardDescription className="text-slate-300">
                      Choose a template style for your PDF reports
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                      Selected: {selectedTemplate.name}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {PDF_TEMPLATES.map((template) => (
                    <div
                      key={template.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedTemplate.id === template.id
                          ? 'border-cyan-500 bg-cyan-500/10 ring-2 ring-cyan-500/50'
                          : 'border-slate-600 bg-slate-700/30 hover:border-slate-500'
                      }`}
                      onClick={() => setSelectedTemplate(template)}
                    >
                      {/* Template Preview Header */}
                      <div 
                        className="h-24 rounded-lg mb-3 relative overflow-hidden"
                        style={{ 
                          background: `linear-gradient(135deg, rgb(${template.colors.dark.join(',')}) 0%, rgb(${template.colors.secondary.join(',')}) 100%)`
                        }}
                      >
                        {/* Mock header bar */}
                        <div 
                          className="absolute bottom-0 left-0 right-0 h-1"
                          style={{ backgroundColor: `rgb(${template.colors.primary.join(',')})` }}
                        />
                        {/* Mock content */}
                        <div className="p-3">
                          <div className="w-20 h-2 bg-white/80 rounded mb-2" />
                          <div className="w-32 h-1 rounded mb-3" style={{ backgroundColor: `rgb(${template.colors.primary.join(',')})` }} />
                          <div className="flex gap-2">
                            <div className="w-8 h-8 rounded" style={{ backgroundColor: `rgba(${template.colors.primary.join(',')}, 0.3)` }} />
                            <div className="w-8 h-8 rounded" style={{ backgroundColor: `rgba(${template.colors.accent.join(',')}, 0.3)` }} />
                            <div className="w-8 h-8 rounded bg-white/10" />
                          </div>
                        </div>
                        {/* Selected checkmark */}
                        {selectedTemplate.id === template.id && (
                          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                      
                      {/* Template Info */}
                      <h3 className="font-semibold text-white mb-1">{template.name}</h3>
                      <p className="text-xs text-slate-400 mb-3">{template.description}</p>
                      
                      {/* Features */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {template.features.slice(0, 3).map((feature, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs border-slate-600 text-slate-400">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                      
                      {/* Preview Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-slate-600 text-slate-300 hover:text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewTemplate(template);
                          setShowTemplatePreview(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Preview Template
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Template Preview Dialog */}
            <Dialog open={showTemplatePreview} onOpenChange={setShowTemplatePreview}>
              <DialogContent className="max-w-3xl bg-slate-900 border-slate-700">
                <DialogHeader>
                  <DialogTitle className="text-white flex items-center gap-2">
                    🎨 Template Preview: {previewTemplate?.name}
                  </DialogTitle>
                  <DialogDescription className="text-slate-400">
                    {previewTemplate?.description}
                  </DialogDescription>
                </DialogHeader>
                
                {previewTemplate && (
                  <div className="space-y-4">
                    {/* Large Preview */}
                    <div 
                      className="h-64 rounded-lg relative overflow-hidden"
                      style={{ 
                        background: `linear-gradient(135deg, rgb(${previewTemplate.colors.dark.join(',')}) 0%, rgb(${previewTemplate.colors.secondary.join(',')}) 100%)`
                      }}
                    >
                      {/* Mock PDF layout */}
                      <div className="absolute inset-0 p-6">
                        {/* Header */}
                        <div className="mb-4">
                          <div className="w-32 h-4 bg-white/90 rounded mb-2" />
                          <div className="w-48 h-2 rounded" style={{ backgroundColor: `rgb(${previewTemplate.colors.primary.join(',')})` }} />
                        </div>
                        
                        {/* Accent line */}
                        <div className="h-1 w-full mb-4" style={{ backgroundColor: `rgb(${previewTemplate.colors.primary.join(',')})` }} />
                        
                        {/* Content blocks */}
                        <div className="grid grid-cols-3 gap-3 mb-4">
                          <div className="h-16 rounded p-2" style={{ backgroundColor: `rgba(${previewTemplate.colors.light.join(',')}, 0.1)` }}>
                            <div className="w-full h-2 bg-white/20 rounded mb-2" />
                            <div className="w-3/4 h-2 bg-white/10 rounded" />
                          </div>
                          <div className="h-16 rounded p-2" style={{ backgroundColor: `rgba(${previewTemplate.colors.primary.join(',')}, 0.2)` }}>
                            <div className="w-full h-2 bg-white/30 rounded mb-2" />
                            <div className="w-2/3 h-2 bg-white/20 rounded" />
                          </div>
                          <div className="h-16 rounded p-2" style={{ backgroundColor: `rgba(${previewTemplate.colors.accent.join(',')}, 0.2)` }}>
                            <div className="w-full h-2 bg-white/30 rounded mb-2" />
                            <div className="w-1/2 h-2 bg-white/20 rounded" />
                          </div>
                        </div>
                        
                        {/* Severity boxes */}
                        <div className="flex gap-2 mb-4">
                          <div className="w-12 h-10 rounded bg-red-500/60 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">C</span>
                          </div>
                          <div className="w-12 h-10 rounded bg-orange-500/60 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">H</span>
                          </div>
                          <div className="w-12 h-10 rounded bg-yellow-500/60 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">M</span>
                          </div>
                          <div className="w-12 h-10 rounded bg-blue-500/60 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">L</span>
                          </div>
                        </div>
                        
                        {/* Table mock */}
                        <div className="space-y-1">
                          <div className="h-4 rounded" style={{ backgroundColor: `rgb(${previewTemplate.colors.secondary.join(',')})` }} />
                          <div className="h-3 bg-white/5 rounded" />
                          <div className="h-3 bg-white/5 rounded" />
                        </div>
                      </div>
                    </div>
                    
                    {/* Features */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-semibold text-white mb-2">Features</h4>
                        <ul className="space-y-1">
                          {previewTemplate.features.map((feature, idx) => (
                            <li key={idx} className="text-sm text-slate-400 flex items-center gap-2">
                              <CheckCircle className="w-3 h-3 text-cyan-400" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white mb-2">Color Palette</h4>
                        <div className="flex gap-2">
                          <div 
                            className="w-10 h-10 rounded-lg border border-slate-600" 
                            style={{ backgroundColor: `rgb(${previewTemplate.colors.primary.join(',')})` }}
                            title="Primary"
                          />
                          <div 
                            className="w-10 h-10 rounded-lg border border-slate-600" 
                            style={{ backgroundColor: `rgb(${previewTemplate.colors.secondary.join(',')})` }}
                            title="Secondary"
                          />
                          <div 
                            className="w-10 h-10 rounded-lg border border-slate-600" 
                            style={{ backgroundColor: `rgb(${previewTemplate.colors.accent.join(',')})` }}
                            title="Accent"
                          />
                          <div 
                            className="w-10 h-10 rounded-lg border border-slate-600" 
                            style={{ backgroundColor: `rgb(${previewTemplate.colors.dark.join(',')})` }}
                            title="Dark"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex gap-2 pt-4">
                      <Button
                        className="flex-1"
                        onClick={() => {
                          setSelectedTemplate(previewTemplate);
                          setShowTemplatePreview(false);
                        }}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Use This Template
                      </Button>
                      <Button
                        variant="outline"
                        className="border-slate-600 text-slate-300"
                        onClick={() => setShowTemplatePreview(false)}
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle className="text-white">Download Reports</CardTitle>
                    <CardDescription className="text-slate-300">Generate reports using the selected template</CardDescription>
                  </div>
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                    Template: {selectedTemplate.name}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Port Scan Report */}
                  <div className="p-4 border border-slate-600 rounded-lg bg-slate-700/30 hover:border-blue-500/50 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <Network className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">Port Scan Report</h3>
                        <p className="text-xs text-slate-400">Network vulnerability assessment</p>
                      </div>
                    </div>
                    <div className="text-sm text-slate-400 mb-3">
                      Available scans: <span className="text-blue-400 font-semibold">{portScans.filter(s => s.status === 'COMPLETED').length}</span>
                    </div>
                    <Select 
                      disabled={portScans.filter(s => s.status === 'COMPLETED').length === 0}
                      onValueChange={(scanId) => {
                        const scan = portScans.find(s => s.scan_id === scanId);
                        if (scan) generateScanReportPDF(scan, { title: 'Network Security Scan Report', templateId: selectedTemplate.id });
                      }}
                    >
                      <SelectTrigger className="w-full bg-blue-600 hover:bg-blue-700 text-white border-0">
                        <div className="flex items-center gap-2">
                          <Download className="h-4 w-4" />
                          <span>Download Report</span>
                        </div>
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {portScans.filter(s => s.status === 'COMPLETED').map(scan => (
                          <SelectItem key={scan.scan_id} value={scan.scan_id || ''} className="text-white hover:bg-slate-700">
                            {scan.target} - {formatDate(scan.created_at)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Web Scan Report */}
                  <div className="p-4 border border-slate-600 rounded-lg bg-slate-700/30 hover:border-purple-500/50 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-purple-500/20 rounded-lg">
                        <Globe className="h-5 w-5 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">Web Scan Report</h3>
                        <p className="text-xs text-slate-400">AI-powered web vulnerability analysis</p>
                      </div>
                    </div>
                    <div className="text-sm text-slate-400 mb-3">
                      Available scans: <span className="text-purple-400 font-semibold">{webScans.filter(s => s.status === 'COMPLETED').length}</span>
                    </div>
                    <Select 
                      disabled={webScans.filter(s => s.status === 'COMPLETED').length === 0}
                      onValueChange={(scanId) => {
                        const scan = webScans.find(s => s.scan_id === scanId);
                        if (scan) generateScanReportPDF(scan, { title: 'Web Security Scan Report', templateId: selectedTemplate.id });
                      }}
                    >
                      <SelectTrigger className="w-full bg-purple-600 hover:bg-purple-700 text-white border-0">
                        <div className="flex items-center gap-2">
                          <Download className="h-4 w-4" />
                          <span>Download Report</span>
                        </div>
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {webScans.filter(s => s.status === 'COMPLETED').map(scan => (
                          <SelectItem key={scan.scan_id} value={scan.scan_id || ''} className="text-white hover:bg-slate-700">
                            {scan.target} - {formatDate(scan.created_at)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Executive Summary */}
                  <div className="p-4 border border-slate-600 rounded-lg bg-slate-700/30 hover:border-cyan-500/50 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-cyan-500/20 rounded-lg">
                        <BarChart3 className="h-5 w-5 text-cyan-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">Executive Summary</h3>
                        <p className="text-xs text-slate-400">High-level security overview</p>
                      </div>
                    </div>
                    <div className="text-sm text-slate-400 mb-3">
                      Total findings: <span className="text-cyan-400 font-semibold">
                        {completedScans.reduce((sum, s) => sum + (s.parsed_results?.summary?.total_findings || 0), 0)}
                      </span>
                    </div>
                    <Button 
                      size="sm" 
                      className="w-full bg-cyan-600 hover:bg-cyan-700"
                      disabled={completedScans.length === 0}
                      onClick={() => generateExecutiveSummaryPDF(scans, 'CYNERRA', selectedTemplate.id)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Summary
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recent" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Recent Scan Reports</CardTitle>
                <CardDescription className="text-slate-300">Latest completed scans available for analysis</CardDescription>
              </CardHeader>
              <CardContent>
                {scansLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
                    <span className="ml-2 text-slate-400">Loading reports...</span>
                  </div>
                ) : completedScans.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                    <FileText className="h-12 w-12 mb-4 opacity-30" />
                    <p>No completed scans yet</p>
                    <p className="text-sm">Run a scan to generate reports</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {completedScans.slice(0, 10).map((scan) => (
                      <div key={scan.scan_id} className="flex items-center justify-between p-4 border border-slate-600 rounded-lg bg-slate-700/30 hover:border-slate-500 transition-colors">
                        <div className="flex items-start gap-3">
                          {scan.profile?.startsWith('ai-') ? (
                            <Globe className="h-5 w-5 text-purple-400 mt-1" />
                          ) : (
                            <Network className="h-5 w-5 text-blue-400 mt-1" />
                          )}
                          <div>
                            <h3 className="font-medium text-white">{scan.target}</h3>
                            <div className="flex flex-wrap items-center gap-2 md:gap-4 text-sm text-slate-400 mt-1">
                              <span>{getProfileName(scan.profile)}</span>
                              <span className="hidden sm:inline">•</span>
                              <span className="hidden sm:inline">{formatDate(scan.finished_at || scan.created_at)}</span>
                              <span className="hidden md:inline">•</span>
                              <span className="hidden md:inline">
                                {scan.parsed_results?.summary?.total_findings || 0} findings
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {scan.parsed_results?.summary && (
                            <div className="hidden sm:flex items-center gap-1">
                              {scan.parsed_results.summary.critical > 0 && (
                                <Badge className="bg-red-500/20 text-red-400 text-xs">{scan.parsed_results.summary.critical}C</Badge>
                              )}
                              {scan.parsed_results.summary.high > 0 && (
                                <Badge className="bg-orange-500/20 text-orange-400 text-xs">{scan.parsed_results.summary.high}H</Badge>
                              )}
                              {scan.parsed_results.summary.medium > 0 && (
                                <Badge className="bg-yellow-500/20 text-yellow-400 text-xs">{scan.parsed_results.summary.medium}M</Badge>
                              )}
                            </div>
                          )}
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                            Ready
                          </Badge>
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-slate-300 hover:text-white"
                              onClick={() => handleViewScan(scan)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-slate-300 hover:text-white"
                              onClick={() => generateScanReportPDF(scan)}
                              title="Download PDF Report"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Security Posture Overview</CardTitle>
                <CardDescription className="text-slate-300">Security status based on scan findings</CardDescription>
              </CardHeader>
              <CardContent>
                {scansLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
                  </div>
                ) : completedScans.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                    <Shield className="h-12 w-12 mb-4 opacity-30" />
                    <p>No scan data available</p>
                    <p className="text-sm">Run scans to assess your security posture</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Overall Security Score */}
                    <div className="border border-slate-600 rounded-lg p-6 bg-slate-700/30">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-white">Overall Security Score</h3>
                          <p className="text-sm text-slate-400">Based on {completedScans.length} completed scans</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className={`px-4 py-2 rounded-full text-lg font-bold ${
                            (() => {
                              const avgRisk = completedScans.length > 0 
                                ? Math.round(completedScans.reduce((sum, s) => sum + (s.parsed_results?.summary?.risk_score || 0), 0) / completedScans.length)
                                : 0;
                              const securityScore = 100 - avgRisk;
                              if (securityScore >= 80) return 'bg-green-500/20 text-green-400';
                              if (securityScore >= 60) return 'bg-yellow-500/20 text-yellow-400';
                              return 'bg-red-500/20 text-red-400';
                            })()
                          }`}>
                            {(() => {
                              const avgRisk = completedScans.length > 0 
                                ? Math.round(completedScans.reduce((sum, s) => sum + (s.parsed_results?.summary?.risk_score || 0), 0) / completedScans.length)
                                : 0;
                              return 100 - avgRisk;
                            })()}%
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <Progress 
                          value={(() => {
                            const avgRisk = completedScans.length > 0 
                              ? Math.round(completedScans.reduce((sum, s) => sum + (s.parsed_results?.summary?.risk_score || 0), 0) / completedScans.length)
                              : 0;
                            return 100 - avgRisk;
                          })()} 
                          className="h-3" 
                        />
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                        <div className="text-center p-3 bg-red-500/10 rounded-lg">
                          <div className="text-2xl font-bold text-red-400">
                            {completedScans.reduce((sum, s) => sum + (s.parsed_results?.summary?.critical || 0), 0)}
                          </div>
                          <div className="text-slate-400">Critical</div>
                        </div>
                        <div className="text-center p-3 bg-orange-500/10 rounded-lg">
                          <div className="text-2xl font-bold text-orange-400">
                            {completedScans.reduce((sum, s) => sum + (s.parsed_results?.summary?.high || 0), 0)}
                          </div>
                          <div className="text-slate-400">High</div>
                        </div>
                        <div className="text-center p-3 bg-yellow-500/10 rounded-lg">
                          <div className="text-2xl font-bold text-yellow-400">
                            {completedScans.reduce((sum, s) => sum + (s.parsed_results?.summary?.medium || 0), 0)}
                          </div>
                          <div className="text-slate-400">Medium</div>
                        </div>
                        <div className="text-center p-3 bg-blue-500/10 rounded-lg">
                          <div className="text-2xl font-bold text-blue-400">
                            {completedScans.reduce((sum, s) => sum + (s.parsed_results?.summary?.low || 0), 0)}
                          </div>
                          <div className="text-slate-400">Low</div>
                        </div>
                        <div className="text-center p-3 bg-slate-500/10 rounded-lg">
                          <div className="text-2xl font-bold text-slate-300">
                            {completedScans.reduce((sum, s) => sum + (s.parsed_results?.summary?.info || 0), 0)}
                          </div>
                          <div className="text-slate-400">Info</div>
                        </div>
                      </div>
                    </div>

                    {/* Scanner Coverage */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border border-slate-600 rounded-lg p-4 bg-slate-700/30">
                        <div className="flex items-center gap-3 mb-3">
                          <Network className="h-5 w-5 text-blue-400" />
                          <h4 className="font-semibold text-white">Network Security</h4>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Scans completed</span>
                            <span className="text-white">{portScans.filter(s => s.status === 'COMPLETED').length}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Vulnerabilities found</span>
                            <span className="text-orange-400">
                              {portScans.filter(s => s.status === 'COMPLETED').reduce((sum, s) => sum + (s.parsed_results?.summary?.total_findings || 0), 0)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="border border-slate-600 rounded-lg p-4 bg-slate-700/30">
                        <div className="flex items-center gap-3 mb-3">
                          <Globe className="h-5 w-5 text-purple-400" />
                          <h4 className="font-semibold text-white">Web Security</h4>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Scans completed</span>
                            <span className="text-white">{webScans.filter(s => s.status === 'COMPLETED').length}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Vulnerabilities found</span>
                            <span className="text-orange-400">
                              {webScans.filter(s => s.status === 'COMPLETED').reduce((sum, s) => sum + (s.parsed_results?.summary?.total_findings || 0), 0)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Scan Activity</CardTitle>
                  <CardDescription className="text-slate-300">Breakdown by scanner type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Network className="h-4 w-4 text-blue-400" />
                        <span className="text-sm text-slate-300">Port Scans (Nmap)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-600 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${scans.length > 0 ? (portScans.length / scans.length) * 100 : 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold w-8 text-white">{portScans.length}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-purple-400" />
                        <span className="text-sm text-slate-300">Web Scans (AI)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-600 rounded-full h-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full" 
                            style={{ width: `${scans.length > 0 ? (webScans.length / scans.length) * 100 : 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold w-8 text-white">{webScans.length}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <span className="text-sm text-slate-300">Completed</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-600 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${scans.length > 0 ? (completedScans.length / scans.length) * 100 : 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold w-8 text-white">{completedScans.length}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Vulnerability Breakdown</CardTitle>
                  <CardDescription className="text-slate-300">Findings by severity level</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span className="text-sm text-white">Critical</span>
                      </div>
                      <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                        {completedScans.reduce((sum, s) => sum + (s.parsed_results?.summary?.critical || 0), 0)} issues
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                        <span className="text-sm text-white">High</span>
                      </div>
                      <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                        {completedScans.reduce((sum, s) => sum + (s.parsed_results?.summary?.high || 0), 0)} issues
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <span className="text-sm text-white">Medium</span>
                      </div>
                      <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                        {completedScans.reduce((sum, s) => sum + (s.parsed_results?.summary?.medium || 0), 0)} issues
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="text-sm text-white">Low</span>
                      </div>
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                        {completedScans.reduce((sum, s) => sum + (s.parsed_results?.summary?.low || 0), 0)} issues
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Most Scanned Targets</CardTitle>
                <CardDescription className="text-slate-300">Top targets by scan frequency</CardDescription>
              </CardHeader>
              <CardContent>
                {scans.length === 0 ? (
                  <div className="text-center text-slate-400 py-8">
                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p>No scan data available</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(() => {
                      // Group scans by target
                      const targetCounts = scans.reduce((acc, scan) => {
                        const target = scan.target || scan.targets || 'Unknown';
                        acc[target] = (acc[target] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>);
                      
                      // Sort by count and take top 5
                      return Object.entries(targetCounts)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5)
                        .map(([target, count], index) => (
                          <div key={target} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                            <div className="flex items-center gap-3">
                              <span className="text-slate-500 font-mono">#{index + 1}</span>
                              <span className="text-sm text-white truncate max-w-[200px] md:max-w-[400px]">{target}</span>
                            </div>
                            <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                              {count} {count === 1 ? 'scan' : 'scans'}
                            </Badge>
                          </div>
                        ));
                    })()}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}