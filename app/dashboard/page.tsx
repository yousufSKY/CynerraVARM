'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  Server, 
  Globe, 
  Activity,
  Eye,
  Download,
  Filter,
  RefreshCw
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
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState('7d');
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#151528] to-[#1a1a2e] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  // Mock data for demonstrations
  const vulnerabilityTrends = [
    { date: '2024-01-01', critical: 12, high: 25, medium: 45, low: 78 },
    { date: '2024-01-02', critical: 8, high: 30, medium: 42, low: 80 },
    { date: '2024-01-03', critical: 15, high: 28, medium: 38, low: 72 },
    { date: '2024-01-04', critical: 6, high: 22, medium: 40, low: 85 },
    { date: '2024-01-05', critical: 10, high: 35, medium: 48, low: 90 },
    { date: '2024-01-06', critical: 4, high: 20, medium: 35, low: 68 },
    { date: '2024-01-07', critical: 7, high: 26, medium: 43, low: 75 },
  ];

  const riskDistribution = [
    { name: 'Critical', value: 52, color: '#dc2626' },
    { name: 'High', value: 186, color: '#ea580c' },
    { name: 'Medium', value: 291, color: '#ca8a04' },
    { name: 'Low', value: 526, color: '#16a34a' },
  ];

  const assetTypes = [
    { type: 'Servers', vulnerabilities: 145, assets: 24 },
    { type: 'Workstations', vulnerabilities: 298, assets: 156 },
    { type: 'Network Devices', vulnerabilities: 78, assets: 12 },
    { type: 'Cloud Resources', vulnerabilities: 234, assets: 45 },
    { type: 'IoT Devices', vulnerabilities: 89, assets: 67 },
  ];

  const recentScans = [
    { 
      id: 1, 
      target: 'Production Network', 
      status: 'completed', 
      vulnerabilities: 45, 
      timestamp: '2024-01-07 14:30',
      duration: '2h 15m'
    },
    { 
      id: 2, 
      target: 'Web Servers', 
      status: 'running', 
      vulnerabilities: null, 
      timestamp: '2024-01-07 16:00',
      duration: '45m'
    },
    { 
      id: 3, 
      target: 'Database Cluster', 
      status: 'completed', 
      vulnerabilities: 12, 
      timestamp: '2024-01-07 12:15',
      duration: '1h 30m'
    },
  ];

  const threatIntelligence = [
    {
      id: 1,
      cve: 'CVE-2024-0001',
      severity: 'Critical',
      score: 9.8,
      description: 'Remote code execution vulnerability in Apache HTTP Server',
      affected: 12,
      published: '2024-01-07'
    },
    {
      id: 2,
      cve: 'CVE-2024-0002',
      severity: 'High',
      score: 8.5,
      description: 'SQL injection vulnerability in PostgreSQL',
      affected: 5,
      published: '2024-01-06'
    },
    {
      id: 3,
      cve: 'CVE-2024-0003',
      severity: 'High',
      score: 8.2,
      description: 'Cross-site scripting in React components',
      affected: 18,
      published: '2024-01-05'
    },
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Welcome back, {user?.firstName || 'User'}!
            </h1>
            <p className="text-slate-300">Here's your comprehensive security overview</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-300">Total Vulnerabilities</p>
                  <p className="text-3xl font-bold text-white">1,055</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="h-4 w-4 text-red-400 mr-1" />
                    <span className="text-sm text-red-400">+12% from last week</span>
                  </div>
                </div>
                <div className="bg-red-500/20 p-3 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-300">Critical Risks</p>
                  <p className="text-3xl font-bold text-white">52</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="h-4 w-4 text-red-400 mr-1" />
                    <span className="text-sm text-red-400">+3 new today</span>
                  </div>
                </div>
                <div className="bg-red-500/20 p-3 rounded-full">
                  <Shield className="h-6 w-6 text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-300">Remediated</p>
                  <p className="text-3xl font-bold text-white">234</p>
                  <div className="flex items-center mt-1">
                    <CheckCircle className="h-4 w-4 text-green-400 mr-1" />
                    <span className="text-sm text-green-400">+18 this week</span>
                  </div>
                </div>
                <div className="bg-green-500/20 p-3 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-300">Risk Score</p>
                  <p className="text-3xl font-bold text-white">7.2</p>
                  <div className="flex items-center mt-1">
                    <Activity className="h-4 w-4 text-orange-400 mr-1" />
                    <span className="text-sm text-orange-400">High Risk</span>
                  </div>
                </div>
                <div className="bg-orange-500/20 p-3 rounded-full">
                  <Activity className="h-6 w-6 text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Vulnerability Trends */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Vulnerability Trends</CardTitle>
              <CardDescription className="text-slate-300">7-day vulnerability discovery and remediation trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={vulnerabilityTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="critical" stackId="1" stroke="#dc2626" fill="#dc2626" />
                    <Area type="monotone" dataKey="high" stackId="1" stroke="#ea580c" fill="#ea580c" />
                    <Area type="monotone" dataKey="medium" stackId="1" stroke="#ca8a04" fill="#ca8a04" />
                    <Area type="monotone" dataKey="low" stackId="1" stroke="#16a34a" fill="#16a34a" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Risk Distribution */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Risk Distribution</CardTitle>
              <CardDescription className="text-slate-300">Current vulnerability severity breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {riskDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-4 mt-4">
                {riskDistribution.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-slate-300">{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Asset Vulnerabilities */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Asset Vulnerability Summary</CardTitle>
            <CardDescription className="text-slate-300">Vulnerabilities by asset type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={assetTypes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="vulnerabilities" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Scans */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Eye className="h-5 w-5" />
                Recent Scans
              </CardTitle>
              <CardDescription className="text-slate-300">Latest vulnerability scanning activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentScans.map((scan) => (
                  <div key={scan.id} className="flex items-center justify-between p-4 border border-slate-600 rounded-lg bg-slate-700/30">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-white">{scan.target}</h4>
                        <Badge className={getStatusColor(scan.status)} variant="secondary">
                          {scan.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-300">{scan.timestamp}</p>
                      <p className="text-sm text-slate-300">Duration: {scan.duration}</p>
                    </div>
                    <div className="text-right">
                      {scan.vulnerabilities !== null && (
                        <p className="text-lg font-semibold text-white">{scan.vulnerabilities}</p>
                      )}
                      {scan.status === 'running' && (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin h-4 w-4 border-2 border-cyan-400 border-t-transparent rounded-full" />
                          <span className="text-sm text-cyan-400">Scanning...</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Threat Intelligence */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Globe className="h-5 w-5" />
                Latest Threat Intelligence
              </CardTitle>
              <CardDescription className="text-slate-300">Recent CVE discoveries affecting your assets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {threatIntelligence.map((threat) => (
                  <div key={threat.id} className="p-4 border border-slate-600 rounded-lg bg-slate-700/30">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono text-xs border-slate-500 text-slate-300">
                          {threat.cve}
                        </Badge>
                        <Badge className={getSeverityColor(threat.severity)} variant="secondary">
                          {threat.severity}
                        </Badge>
                      </div>
                      <span className="text-sm font-semibold text-white">
                        CVSS {threat.score}
                      </span>
                    </div>
                    <p className="text-sm text-slate-200 mb-2">{threat.description}</p>
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>{threat.affected} assets affected</span>
                      <span>Published: {threat.published}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}