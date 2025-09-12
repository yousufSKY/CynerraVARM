'use client';

import { useState } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
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
  Download
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function VulnerabilityScanning() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');

  const scanTemplates = [
    {
      id: 1,
      name: 'Full Network Scan',
      description: 'Comprehensive vulnerability scan across all network assets',
      targets: '192.168.1.0/24',
      schedule: 'Weekly',
      lastRun: '2024-01-07 14:30',
      nextRun: '2024-01-14 14:30',
      status: 'active'
    },
    {
      id: 2,
      name: 'Web Application Scan',
      description: 'OWASP Top 10 and web-specific vulnerability assessment',
      targets: 'https://app.company.com',
      schedule: 'Daily',
      lastRun: '2024-01-07 20:00',
      nextRun: '2024-01-08 20:00',
      status: 'active'
    },
    {
      id: 3,
      name: 'Critical Infrastructure',
      description: 'High-priority servers and database systems',
      targets: 'DB-*, WEB-*, MAIL-*',
      schedule: 'Daily',
      lastRun: '2024-01-07 02:00',
      nextRun: '2024-01-08 02:00',
      status: 'active'
    }
  ];

  const recentScans = [
    {
      id: 1,
      name: 'Production Network Scan',
      target: '192.168.1.0/24',
      status: 'completed',
      progress: 100,
      vulnerabilities: {
        critical: 3,
        high: 12,
        medium: 25,
        low: 45
      },
      startTime: '2024-01-07 14:00:00',
      endTime: '2024-01-07 16:15:30',
      duration: '2h 15m 30s'
    },
    {
      id: 2,
      name: 'Web Server Assessment',
      target: '192.168.1.10',
      status: 'running',
      progress: 67,
      vulnerabilities: null,
      startTime: '2024-01-07 18:00:00',
      endTime: null,
      duration: '1h 23m'
    },
    {
      id: 3,
      name: 'Database Security Audit',
      target: '192.168.1.20-25',
      status: 'failed',
      progress: 23,
      vulnerabilities: null,
      startTime: '2024-01-07 12:00:00',
      endTime: '2024-01-07 12:45:00',
      duration: '45m'
    },
    {
      id: 4,
      name: 'Office Workstations',
      target: '192.168.2.0/24',
      status: 'completed',
      progress: 100,
      vulnerabilities: {
        critical: 0,
        high: 5,
        medium: 18,
        low: 32
      },
      startTime: '2024-01-06 16:00:00',
      endTime: '2024-01-06 18:30:00',
      duration: '2h 30m'
    }
  ];

  const vulnerabilityDetails = [
    {
      id: 'CVE-2024-0001',
      title: 'Remote Code Execution in Apache HTTP Server',
      severity: 'Critical',
      cvss: 9.8,
      affected: 3,
      description: 'A critical vulnerability allowing remote code execution through crafted HTTP requests.',
      solution: 'Upgrade Apache HTTP Server to version 2.4.58 or later',
      references: ['https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2024-0001']
    },
    {
      id: 'CVE-2024-0002',
      title: 'SQL Injection in Web Application',
      severity: 'High',
      cvss: 8.5,
      affected: 1,
      description: 'SQL injection vulnerability in user authentication module.',
      solution: 'Apply security patch v1.2.3 and implement input validation',
      references: ['https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2024-0002']
    },
    {
      id: 'CVE-2024-0003',
      title: 'Cross-Site Scripting (XSS)',
      severity: 'Medium',
      cvss: 6.1,
      affected: 5,
      description: 'Stored XSS vulnerability in user comment system.',
      solution: 'Sanitize user input and implement Content Security Policy',
      references: ['https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2024-0003']
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'running': return <Activity className="h-4 w-4 text-blue-600 animate-pulse" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const startQuickScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    
    // Simulate scan progress
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          return 100;
        }
        return prev + Math.random() * 10;
      });
    }, 500);
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Vulnerability Scanning</h1>
            <p className="text-gray-500">Discover and assess security vulnerabilities</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Scan
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Scan</DialogTitle>
                  <DialogDescription>
                    Configure a new vulnerability scan for your assets.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="scanName">Scan Name</Label>
                      <Input id="scanName" placeholder="My Vulnerability Scan" />
                    </div>
                    <div>
                      <Label htmlFor="scanType">Scan Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select scan type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="network">Network Scan</SelectItem>
                          <SelectItem value="web">Web Application Scan</SelectItem>
                          <SelectItem value="database">Database Scan</SelectItem>
                          <SelectItem value="custom">Custom Scan</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="targets">Scan Targets</Label>
                    <Textarea 
                      id="targets" 
                      placeholder="192.168.1.0/24&#10;10.0.0.1-10.0.0.100&#10;https://example.com"
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="schedule">Schedule</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select schedule" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="once">Run Once</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Scan Options</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="portScan" defaultChecked />
                        <Label htmlFor="portScan">Port Scanning</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="serviceScan" defaultChecked />
                        <Label htmlFor="serviceScan">Service Detection</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="vulnScan" defaultChecked />
                        <Label htmlFor="vulnScan">Vulnerability Assessment</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="complianceScan" />
                        <Label htmlFor="complianceScan">Compliance Checking</Label>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button className="flex-1">Create Scan</Button>
                    <Button variant="outline" className="flex-1">Cancel</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Quick Scan</CardTitle>
              <CardDescription>Start an immediate vulnerability scan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input placeholder="Target IP or range" defaultValue="192.168.1.0/24" />
                <div className="flex gap-2">
                  <Button 
                    className="flex-1" 
                    onClick={startQuickScan}
                    disabled={isScanning}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {isScanning ? 'Scanning...' : 'Start Scan'}
                  </Button>
                  {isScanning && (
                    <Button variant="outline" size="sm" onClick={() => setIsScanning(false)}>
                      <Square className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {isScanning && (
                  <div className="space-y-2">
                    <Progress value={scanProgress} className="w-full" />
                    <p className="text-sm text-gray-600 text-center">
                      {Math.round(scanProgress)}% complete
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Scan Statistics</CardTitle>
              <CardDescription>Recent scanning activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Scans Today</span>
                  <span className="font-semibold">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Active Scans</span>
                  <span className="font-semibold text-blue-600">2</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">New Vulnerabilities</span>
                  <span className="font-semibold text-red-600">15</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Scan Templates</span>
                  <span className="font-semibold">{scanTemplates.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Next Scheduled</CardTitle>
              <CardDescription>Upcoming automated scans</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>Web App Scan - Today 20:00</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>Critical Infrastructure - Tomorrow 02:00</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>Full Network - Jan 14 14:30</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="scans">Recent Scans</TabsTrigger>
            <TabsTrigger value="vulnerabilities">Vulnerabilities</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Active Scans</CardTitle>
                  <CardDescription>Currently running vulnerability scans</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentScans.filter(scan => scan.status === 'running').map((scan) => (
                      <div key={scan.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Activity className="h-4 w-4 text-blue-600 animate-pulse" />
                            <span className="font-medium">{scan.name}</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{scan.target}</p>
                          <Progress value={scan.progress} className="w-full mb-2" />
                          <div className="flex justify-between text-sm text-gray-500">
                            <span>{scan.progress}% complete</span>
                            <span>Running for {scan.duration}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button variant="ghost" size="sm">
                            <Pause className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Square className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    {recentScans.filter(scan => scan.status === 'running').length === 0 && (
                      <p className="text-center text-gray-500 py-8">No active scans</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Findings</CardTitle>
                  <CardDescription>Latest vulnerability discoveries</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {vulnerabilityDetails.map((vuln) => (
                      <div key={vuln.id} className="flex items-start gap-3 p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={getSeverityColor(vuln.severity)} variant="secondary">
                              {vuln.severity}
                            </Badge>
                            <span className="text-sm font-medium">CVSS {vuln.cvss}</span>
                          </div>
                          <h4 className="font-medium text-gray-900 mb-1">{vuln.title}</h4>
                          <p className="text-sm text-gray-600">{vuln.affected} assets affected</p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="scans" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Scan History</CardTitle>
                <CardDescription>All vulnerability scanning activities</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Scan Name</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Vulnerabilities</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Start Time</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentScans.map((scan) => (
                      <TableRow key={scan.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(scan.status)}
                            <span className="font-medium">{scan.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{scan.target}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge 
                              className={
                                scan.status === 'completed' ? 'bg-green-100 text-green-800' :
                                scan.status === 'running' ? 'bg-blue-100 text-blue-800' :
                                scan.status === 'failed' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }
                              variant="secondary"
                            >
                              {scan.status}
                            </Badge>
                            {scan.status === 'running' && (
                              <span className="text-sm text-gray-500">{scan.progress}%</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {scan.vulnerabilities ? (
                            <div className="flex items-center gap-1">
                              {scan.vulnerabilities.critical > 0 && (
                                <Badge className="bg-red-100 text-red-800 text-xs px-1 py-0">
                                  {scan.vulnerabilities.critical}C
                                </Badge>
                              )}
                              {scan.vulnerabilities.high > 0 && (
                                <Badge className="bg-orange-100 text-orange-800 text-xs px-1 py-0">
                                  {scan.vulnerabilities.high}H
                                </Badge>
                              )}
                              {scan.vulnerabilities.medium > 0 && (
                                <Badge className="bg-yellow-100 text-yellow-800 text-xs px-1 py-0">
                                  {scan.vulnerabilities.medium}M
                                </Badge>
                              )}
                              {scan.vulnerabilities.low > 0 && (
                                <Badge className="bg-green-100 text-green-800 text-xs px-1 py-0">
                                  {scan.vulnerabilities.low}L
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">{scan.duration}</TableCell>
                        <TableCell className="text-sm">{scan.startTime}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vulnerabilities" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Vulnerability Details</CardTitle>
                <CardDescription>Detailed information about discovered vulnerabilities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {vulnerabilityDetails.map((vuln) => (
                    <div key={vuln.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge className={getSeverityColor(vuln.severity)} variant="secondary">
                            {vuln.severity}
                          </Badge>
                          <Badge variant="outline" className="font-mono">
                            {vuln.id}
                          </Badge>
                          <span className="text-sm font-semibold">CVSS {vuln.cvss}</span>
                        </div>
                        <Badge className="bg-gray-100 text-gray-800" variant="secondary">
                          {vuln.affected} affected
                        </Badge>
                      </div>
                      
                      <h3 className="font-semibold text-lg text-gray-900 mb-2">{vuln.title}</h3>
                      <p className="text-gray-700 mb-3">{vuln.description}</p>
                      
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                        <h4 className="font-medium text-blue-900 mb-1">Recommended Solution</h4>
                        <p className="text-blue-800 text-sm">{vuln.solution}</p>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                          <Button variant="outline" size="sm">
                            Create Ticket
                          </Button>
                        </div>
                        <Button variant="ghost" size="sm" className="text-gray-500">
                          Mark as False Positive
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Scan Templates</CardTitle>
                <CardDescription>Pre-configured scan templates for different scenarios</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {scanTemplates.map((template) => (
                    <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900">{template.name}</h3>
                          <Badge 
                            className={template.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                            variant="secondary"
                          >
                            {template.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Targets:</span>
                            <p className="font-mono">{template.targets}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Schedule:</span>
                            <p>{template.schedule}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Last Run:</span>
                            <p>{template.lastRun}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Next Run:</span>
                            <p>{template.nextRun}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button variant="outline" size="sm">
                          <Play className="h-4 w-4 mr-1" />
                          Run Now
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}