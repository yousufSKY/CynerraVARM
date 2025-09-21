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
  Settings
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function ReportsCompliance() {
  const [selectedReport, setSelectedReport] = useState('');
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();

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

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Active Reports</p>
                  <p className="text-3xl font-bold text-white">{reportTemplates.length}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Generated This Month</p>
                  <p className="text-3xl font-bold text-white">47</p>
                </div>
                <BarChart3 className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Compliance Score</p>
                  <p className="text-3xl font-bold text-white">81%</p>
                </div>
                <Shield className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Scheduled Reports</p>
                  <p className="text-3xl font-bold text-white">12</p>
                </div>
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="reports" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="reports">Report Templates</TabsTrigger>
            <TabsTrigger value="recent">Recent Reports</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Report Templates</CardTitle>
                <CardDescription className="text-slate-300">Manage automated report generation templates</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700">
                      <TableHead className="text-slate-300">Report Name</TableHead>
                      <TableHead className="text-slate-300">Category</TableHead>
                      <TableHead className="text-slate-300">Schedule</TableHead>
                      <TableHead className="text-slate-300">Format</TableHead>
                      <TableHead className="text-slate-300">Last Generated</TableHead>
                      <TableHead className="text-slate-300">Recipients</TableHead>
                      <TableHead className="text-slate-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportTemplates.map((template) => (
                      <TableRow key={template.id} className="border-slate-700">
                        <TableCell>
                          <div>
                            <p className="font-medium text-white">{template.name}</p>
                            <p className="text-sm text-slate-400">{template.description}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-slate-600 text-slate-300">{template.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-slate-400" />
                            <span className="text-slate-300">{template.schedule}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-slate-300">{template.format}</TableCell>
                        <TableCell className="text-sm text-slate-400">{template.lastGenerated}</TableCell>
                        <TableCell className="text-sm text-slate-400 max-w-xs truncate">
                          {template.recipients}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
                              <Send className="h-4 w-4" />
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

          <TabsContent value="recent" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Recent Reports</CardTitle>
                <CardDescription className="text-slate-300">Generated reports available for download</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentReports.map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-4 border border-slate-600 rounded-lg bg-slate-700/30">
                      <div className="flex items-start gap-3">
                        <FileText className="h-5 w-5 text-slate-400 mt-1" />
                        <div>
                          <h3 className="font-medium text-white">{report.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-slate-400 mt-1">
                            <span>{report.type}</span>
                            <span>•</span>
                            <span>{report.createdBy}</span>
                            <span>•</span>
                            <span>{report.createdAt}</span>
                            <span>•</span>
                            <span>{report.size}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          className={
                            report.status === 'completed' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                            report.status === 'generating' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                            'bg-slate-500/20 text-slate-400 border-slate-500/30'
                          }
                          variant="secondary"
                        >
                          {report.status === 'generating' ? 'Generating...' : 'Ready'}
                        </Badge>
                        {report.status === 'completed' && (
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Compliance Framework Status</CardTitle>
                <CardDescription className="text-slate-300">Track compliance across different regulatory frameworks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {complianceFrameworks.map((framework, index) => (
                    <div key={index} className="border border-slate-600 rounded-lg p-6 bg-slate-700/30">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-white">{framework.name}</h3>
                          <p className="text-sm text-slate-400">Version {framework.version} • Last assessed {framework.lastAssessment}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getComplianceColor(framework.score)}`}>
                            {framework.score}%
                          </div>
                          {getStatusBadge(framework.status)}
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <Progress value={framework.score} className="h-2" />
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-400">{framework.controls.implemented}</div>
                          <div className="text-slate-400">Implemented</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-yellow-400">{framework.controls.partial}</div>
                          <div className="text-slate-400">Partially Implemented</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-400">{framework.controls.notImplemented}</div>
                          <div className="text-slate-400">Not Implemented</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white">{framework.controls.total}</div>
                          <div className="text-slate-400">Total Controls</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-600">
                        <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:text-white">View Details</Button>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:text-white">
                            <Download className="h-4 w-4 mr-1" />
                            Export Report
                          </Button>
                          <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:text-white">
                            Schedule Assessment
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Report Generation Trends</CardTitle>
                  <CardDescription className="text-slate-300">Monthly report generation activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-300">Executive Reports</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-600 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: '80%' }}></div>
                        </div>
                        <span className="text-sm font-semibold w-8 text-white">12</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-300">Technical Reports</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-600 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: '95%' }}></div>
                        </div>
                        <span className="text-sm font-semibold w-8 text-white">31</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-300">Compliance Reports</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-600 rounded-full h-2">
                          <div className="bg-orange-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                        </div>
                        <span className="text-sm font-semibold w-8 text-white">4</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Most Requested Reports</CardTitle>
                  <CardDescription className="text-slate-300">Popular reports by download count</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white">Vulnerability Assessment</span>
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">147 downloads</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white">Executive Dashboard</span>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">89 downloads</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white">Risk Assessment</span>
                      <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">76 downloads</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white">Compliance Status</span>
                      <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">65 downloads</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Compliance Score Trends</CardTitle>
                <CardDescription className="text-slate-300">6-month compliance score history across frameworks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center text-slate-400 py-12">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <p>Compliance trend chart would be displayed here</p>
                  <p className="text-sm">Showing improvement across all frameworks</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}