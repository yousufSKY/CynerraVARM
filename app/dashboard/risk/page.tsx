'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Shield, 
  Activity, 
  Target,
  BarChart3,
  PieChart,
  Filter,
  Download,
  Eye,
  Calendar
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  Pie,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function RiskAssessment() {
  const [timeRange, setTimeRange] = useState('30d');
  const [riskFilter, setRiskFilter] = useState('all');

  const riskTrends = [
    { date: '2024-01-01', critical: 45, high: 120, medium: 230, low: 450 },
    { date: '2024-01-02', critical: 42, high: 115, medium: 235, low: 465 },
    { date: '2024-01-03', critical: 48, high: 125, medium: 220, low: 440 },
    { date: '2024-01-04', critical: 35, high: 110, medium: 245, low: 480 },
    { date: '2024-01-05', critical: 52, high: 135, medium: 210, low: 425 },
    { date: '2024-01-06', critical: 40, high: 105, medium: 250, low: 490 },
    { date: '2024-01-07', critical: 55, high: 140, medium: 200, low: 405 },
  ];

  const riskMatrix = [
    { impact: 'Critical', probability: 'High', value: 15, color: '#dc2626' },
    { impact: 'Critical', probability: 'Medium', value: 8, color: '#ea580c' },
    { impact: 'Critical', probability: 'Low', value: 3, color: '#f97316' },
    { impact: 'High', probability: 'High', value: 25, color: '#ea580c' },
    { impact: 'High', probability: 'Medium', value: 35, color: '#f97316' },
    { impact: 'High', probability: 'Low', value: 12, color: '#eab308' },
    { impact: 'Medium', probability: 'High', value: 45, color: '#f97316' },
    { impact: 'Medium', probability: 'Medium', value: 85, color: '#eab308' },
    { impact: 'Medium', probability: 'Low', value: 120, color: '#84cc16' },
    { impact: 'Low', probability: 'High', value: 35, color: '#eab308' },
    { impact: 'Low', probability: 'Medium', value: 180, color: '#84cc16' },
    { impact: 'Low', probability: 'Low', value: 350, color: '#22c55e' },
  ];

  const businessImpactData = [
    { category: 'Financial Loss', value: 850000, risks: 23 },
    { category: 'Operational Disruption', value: 650000, risks: 18 },
    { category: 'Data Breach', value: 1200000, risks: 12 },
    { category: 'Regulatory Compliance', value: 450000, risks: 8 },
    { category: 'Reputation Damage', value: 950000, risks: 15 },
  ];

  const topRisks = [
    {
      id: 1,
      title: 'Unpatched Critical Vulnerabilities in Production Servers',
      category: 'Infrastructure',
      riskScore: 9.2,
      probability: 'High',
      impact: 'Critical',
      assets: 12,
      businessImpact: '$1.2M',
      owner: 'Infrastructure Team',
      lastUpdated: '2024-01-07',
      trend: 'up'
    },
    {
      id: 2,
      title: 'Weak Authentication Controls in Customer Portal',
      category: 'Application',
      riskScore: 8.7,
      probability: 'Medium',
      impact: 'Critical',
      assets: 1,
      businessImpact: '$850K',
      owner: 'Development Team',
      lastUpdated: '2024-01-06',
      trend: 'stable'
    },
    {
      id: 3,
      title: 'Outdated Firewall Rules Allowing Unnecessary Access',
      category: 'Network',
      riskScore: 8.1,
      probability: 'High',
      impact: 'High',
      assets: 5,
      businessImpact: '$650K',
      owner: 'Network Team',
      lastUpdated: '2024-01-05',
      trend: 'down'
    },
    {
      id: 4,
      title: 'Sensitive Data Stored in Unencrypted Databases',
      category: 'Data',
      riskScore: 7.9,
      probability: 'Medium',
      impact: 'High',
      assets: 8,
      businessImpact: '$950K',
      owner: 'Database Team',
      lastUpdated: '2024-01-07',
      trend: 'up'
    },
    {
      id: 5,
      title: 'Lack of Multi-Factor Authentication for Admin Accounts',
      category: 'Identity',
      riskScore: 7.6,
      probability: 'High',
      impact: 'Medium',
      assets: 15,
      businessImpact: '$450K',
      owner: 'IT Security',
      lastUpdated: '2024-01-04',
      trend: 'stable'
    }
  ];

  const complianceFrameworks = [
    { name: 'NIST Cybersecurity Framework', score: 78, total: 100, status: 'improving' },
    { name: 'ISO 27001', score: 85, total: 100, status: 'compliant' },
    { name: 'SOC 2 Type II', score: 92, total: 100, status: 'compliant' },
    { name: 'PCI DSS', score: 68, total: 100, status: 'needs_attention' },
    { name: 'GDPR', score: 81, total: 100, status: 'compliant' },
  ];

  const getRiskScoreColor = (score: number) => {
    if (score >= 8.5) return 'text-red-600 bg-red-50';
    if (score >= 7.0) return 'text-orange-600 bg-orange-50';
    if (score >= 5.0) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-green-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getComplianceStatus = (status: string, score: number) => {
    switch (status) {
      case 'compliant':
        return <Badge className="bg-green-100 text-green-800">Compliant</Badge>;
      case 'improving':
        return <Badge className="bg-blue-100 text-blue-800">Improving</Badge>;
      case 'needs_attention':
        return <Badge className="bg-red-100 text-red-800">Needs Attention</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Risk Assessment</h1>
            <p className="text-gray-500">Analyze and prioritize security risks across your organization</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 Days</SelectItem>
                <SelectItem value="30d">30 Days</SelectItem>
                <SelectItem value="90d">90 Days</SelectItem>
                <SelectItem value="1y">1 Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Risk Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Overall Risk Score</p>
                  <p className="text-3xl font-bold text-red-600">8.2</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="h-4 w-4 text-red-500 mr-1" />
                    <span className="text-sm text-red-500">+0.3 this week</span>
                  </div>
                </div>
                <div className="bg-red-100 p-3 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Critical Risks</p>
                  <p className="text-3xl font-bold text-gray-900">15</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="h-4 w-4 text-red-500 mr-1" />
                    <span className="text-sm text-red-500">+3 this week</span>
                  </div>
                </div>
                <div className="bg-red-100 p-3 rounded-full">
                  <Shield className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Business Impact</p>
                  <p className="text-3xl font-bold text-gray-900">$4.1M</p>
                  <div className="flex items-center mt-1">
                    <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-500">-5% this month</span>
                  </div>
                </div>
                <div className="bg-orange-100 p-3 rounded-full">
                  <Target className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg. Resolution Time</p>
                  <p className="text-3xl font-bold text-gray-900">12d</p>
                  <div className="flex items-center mt-1">
                    <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-500">-2 days improved</span>
                  </div>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Risk Trends Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Trend Analysis</CardTitle>
            <CardDescription>Risk level distribution over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={riskTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="critical" stroke="#dc2626" strokeWidth={3} />
                  <Line type="monotone" dataKey="high" stroke="#ea580c" strokeWidth={2} />
                  <Line type="monotone" dataKey="medium" stroke="#f59e0b" strokeWidth={2} />
                  <Line type="monotone" dataKey="low" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="risks" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="risks">Top Risks</TabsTrigger>
            <TabsTrigger value="matrix">Risk Matrix</TabsTrigger>
            <TabsTrigger value="impact">Business Impact</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
          </TabsList>

          <TabsContent value="risks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Prioritized Risk Register</CardTitle>
                <CardDescription>Risks ranked by score and business impact</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Risk</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Risk Score</TableHead>
                      <TableHead>Probability</TableHead>
                      <TableHead>Impact</TableHead>
                      <TableHead>Business Impact</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Trend</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topRisks.map((risk) => (
                      <TableRow key={risk.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-900">{risk.title}</p>
                            <p className="text-sm text-gray-500">{risk.assets} assets affected</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{risk.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${getRiskScoreColor(risk.riskScore)}`}>
                            {risk.riskScore}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={
                              risk.probability === 'High' ? 'bg-red-100 text-red-800' :
                              risk.probability === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }
                            variant="secondary"
                          >
                            {risk.probability}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={
                              risk.impact === 'Critical' ? 'bg-red-100 text-red-800' :
                              risk.impact === 'High' ? 'bg-orange-100 text-orange-800' :
                              risk.impact === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }
                            variant="secondary"
                          >
                            {risk.impact}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold">{risk.businessImpact}</TableCell>
                        <TableCell className="text-sm text-gray-700">{risk.owner}</TableCell>
                        <TableCell>{getTrendIcon(risk.trend)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
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

          <TabsContent value="matrix" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Risk Heat Map</CardTitle>
                  <CardDescription>Probability vs Impact distribution</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          type="category" 
                          dataKey="probability" 
                          domain={['Low', 'Medium', 'High']}
                          axisLine={false}
                        />
                        <YAxis 
                          type="category" 
                          dataKey="impact" 
                          domain={['Low', 'Medium', 'High', 'Critical']}
                          axisLine={false}
                        />
                        <Tooltip />
                        <Scatter data={riskMatrix} fill="#8884d8">
                          {riskMatrix.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Scatter>
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Risk Distribution</CardTitle>
                  <CardDescription>Risk count by severity level</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Critical Risk</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-red-600 h-2 rounded-full" style={{ width: '15%' }}></div>
                        </div>
                        <span className="text-sm font-semibold w-8">26</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">High Risk</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-orange-600 h-2 rounded-full" style={{ width: '35%' }}></div>
                        </div>
                        <span className="text-sm font-semibold w-8">72</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Medium Risk</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                        </div>
                        <span className="text-sm font-semibold w-8">250</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Low Risk</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{ width: '80%' }}></div>
                        </div>
                        <span className="text-sm font-semibold w-8">565</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="impact" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Business Impact Analysis</CardTitle>
                <CardDescription>Potential financial impact by risk category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={businessImpactData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [`$${(value as number / 1000).toFixed(0)}K`, 'Impact']}
                      />
                      <Bar dataKey="value" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Risk Categories</CardTitle>
                  <CardDescription>Financial exposure by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {businessImpactData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{item.category}</p>
                          <p className="text-sm text-gray-500">{item.risks} active risks</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">
                            ${(item.value / 1000).toFixed(0)}K
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Risk Appetite vs Exposure</CardTitle>
                  <CardDescription>Current risk levels compared to tolerance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Financial Risk</span>
                        <span>85% of tolerance</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Operational Risk</span>
                        <span>92% of tolerance</span>
                      </div>
                      <Progress value={92} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Compliance Risk</span>
                        <span>67% of tolerance</span>
                      </div>
                      <Progress value={67} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Reputational Risk</span>
                        <span>78% of tolerance</span>
                      </div>
                      <Progress value={78} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Dashboard</CardTitle>
                <CardDescription>Regulatory framework compliance status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {complianceFrameworks.map((framework, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-gray-900">{framework.name}</h3>
                          {getComplianceStatus(framework.status, framework.score)}
                        </div>
                        <div className="flex items-center gap-4">
                          <Progress value={framework.score} className="flex-1" />
                          <span className="text-sm font-semibold text-gray-700">
                            {framework.score}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Compliance Gaps</CardTitle>
                  <CardDescription>Areas requiring immediate attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-red-900">PCI DSS - Data Encryption</h4>
                        <p className="text-sm text-red-700">Card data not encrypted at rest in 3 databases</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-900">NIST - Access Controls</h4>
                        <p className="text-sm text-yellow-700">Missing multi-factor authentication for privileged accounts</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-orange-900">GDPR - Data Retention</h4>
                        <p className="text-sm text-orange-700">Customer data retained beyond required period</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Compliance Trends</CardTitle>
                  <CardDescription>Progress over the last 6 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={[
                        { month: 'Aug', nist: 72, iso: 78, soc: 88, pci: 62, gdpr: 75 },
                        { month: 'Sep', nist: 74, iso: 80, soc: 89, pci: 64, gdpr: 77 },
                        { month: 'Oct', nist: 75, iso: 82, soc: 90, pci: 65, gdpr: 78 },
                        { month: 'Nov', nist: 76, iso: 83, soc: 91, pci: 66, gdpr: 79 },
                        { month: 'Dec', nist: 77, iso: 84, soc: 91, pci: 67, gdpr: 80 },
                        { month: 'Jan', nist: 78, iso: 85, soc: 92, pci: 68, gdpr: 81 },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis domain={[60, 100]} />
                        <Tooltip />
                        <Line type="monotone" dataKey="nist" stroke="#3b82f6" name="NIST" />
                        <Line type="monotone" dataKey="iso" stroke="#10b981" name="ISO 27001" />
                        <Line type="monotone" dataKey="soc" stroke="#8b5cf6" name="SOC 2" />
                        <Line type="monotone" dataKey="pci" stroke="#f59e0b" name="PCI DSS" />
                        <Line type="monotone" dataKey="gdpr" stroke="#ef4444" name="GDPR" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}