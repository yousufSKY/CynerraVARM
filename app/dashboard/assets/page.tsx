'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Server, 
  Monitor, 
  Smartphone, 
  Cloud, 
  Router, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  Trash2,
  Edit
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function AssetManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
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

  const assetTypes = {
    server: { icon: Server, label: 'Server', color: 'bg-blue-100 text-blue-800' },
    workstation: { icon: Monitor, label: 'Workstation', color: 'bg-green-100 text-green-800' },
    mobile: { icon: Smartphone, label: 'Mobile', color: 'bg-purple-100 text-purple-800' },
    cloud: { icon: Cloud, label: 'Cloud', color: 'bg-sky-100 text-sky-800' },
    network: { icon: Router, label: 'Network', color: 'bg-orange-100 text-orange-800' },
  };

  const mockAssets = [
    {
      id: 1,
      name: 'WEB-SERVER-01',
      type: 'server',
      ip: '192.168.1.10',
      os: 'Ubuntu 20.04',
      owner: 'IT Team',
      location: 'Data Center A',
      lastScan: '2024-01-07 14:30',
      vulnerabilities: { critical: 3, high: 8, medium: 15, low: 22 },
      riskScore: 8.5,
      status: 'active'
    },
    {
      id: 2,
      name: 'DB-CLUSTER-01',
      type: 'server',
      ip: '192.168.1.20',
      os: 'CentOS 8',
      owner: 'Database Team',
      location: 'Data Center B',
      lastScan: '2024-01-07 12:15',
      vulnerabilities: { critical: 1, high: 4, medium: 8, low: 12 },
      riskScore: 6.2,
      status: 'active'
    },
    {
      id: 3,
      name: 'OFFICE-WS-001',
      type: 'workstation',
      ip: '192.168.2.45',
      os: 'Windows 11',
      owner: 'John Smith',
      location: 'Office Floor 2',
      lastScan: '2024-01-06 16:00',
      vulnerabilities: { critical: 0, high: 2, medium: 6, low: 18 },
      riskScore: 4.1,
      status: 'active'
    },
    {
      id: 4,
      name: 'CLOUD-INSTANCE-A',
      type: 'cloud',
      ip: '10.0.1.5',
      os: 'Amazon Linux 2',
      owner: 'DevOps Team',
      location: 'AWS us-east-1',
      lastScan: '2024-01-07 18:00',
      vulnerabilities: { critical: 2, high: 5, medium: 12, low: 8 },
      riskScore: 7.3,
      status: 'active'
    },
    {
      id: 5,
      name: 'FIREWALL-MAIN',
      type: 'network',
      ip: '192.168.1.1',
      os: 'pfSense 2.6',
      owner: 'Network Team',
      location: 'Data Center A',
      lastScan: '2024-01-05 10:30',
      vulnerabilities: { critical: 0, high: 1, medium: 3, low: 5 },
      riskScore: 3.8,
      status: 'maintenance'
    },
    {
      id: 6,
      name: 'DEV-SERVER-03',
      type: 'server',
      ip: '192.168.3.15',
      os: 'Ubuntu 22.04',
      owner: 'Development Team',
      location: 'Office Floor 1',
      lastScan: 'Never',
      vulnerabilities: { critical: 0, high: 0, medium: 0, low: 0 },
      riskScore: 0,
      status: 'inactive'
    }
  ];

  const filteredAssets = mockAssets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         asset.ip.includes(searchQuery) ||
                         asset.owner.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || asset.type === filterType;
    const matchesStatus = filterStatus === 'all' || asset.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getRiskScoreColor = (score: number) => {
    if (score >= 8) return 'text-red-600';
    if (score >= 6) return 'text-orange-600';
    if (score >= 4) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
      case 'inactive':
        return <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30"><Clock className="w-3 h-3 mr-1" />Inactive</Badge>;
      case 'maintenance':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30"><AlertTriangle className="w-3 h-3 mr-1" />Maintenance</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const totalVulnerabilities = filteredAssets.reduce((sum, asset) => 
    sum + asset.vulnerabilities.critical + asset.vulnerabilities.high + 
    asset.vulnerabilities.medium + asset.vulnerabilities.low, 0);

  const criticalAssets = filteredAssets.filter(asset => asset.riskScore >= 8).length;
  const activeAssets = filteredAssets.filter(asset => asset.status === 'active').length;

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Asset Management</h1>
            <p className="text-slate-300">Manage and monitor your digital assets</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Asset
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Asset</DialogTitle>
                  <DialogDescription>
                    Add a new asset to your inventory for vulnerability monitoring.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Input placeholder="Asset Name" />
                  <Input placeholder="IP Address" />
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Asset Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="server">Server</SelectItem>
                      <SelectItem value="workstation">Workstation</SelectItem>
                      <SelectItem value="mobile">Mobile Device</SelectItem>
                      <SelectItem value="cloud">Cloud Instance</SelectItem>
                      <SelectItem value="network">Network Device</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input placeholder="Operating System" />
                  <Input placeholder="Owner" />
                  <Input placeholder="Location" />
                  <div className="flex gap-2 pt-4">
                    <Button className="flex-1">Add Asset</Button>
                    <Button variant="outline" className="flex-1">Cancel</Button>
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
                  <p className="text-sm font-medium text-slate-300">Total Assets</p>
                  <p className="text-3xl font-bold text-white">{filteredAssets.length}</p>
                </div>
                <Server className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-300">Active Assets</p>
                  <p className="text-3xl font-bold text-white">{activeAssets}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-300">Critical Risk</p>
                  <p className="text-3xl font-bold text-white">{criticalAssets}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-300">Total Vulnerabilities</p>
                  <p className="text-3xl font-bold text-white">{totalVulnerabilities}</p>
                </div>
                <Eye className="h-8 w-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Asset Inventory</CardTitle>
            <CardDescription className="text-slate-300">View and manage all your monitored assets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search assets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Asset Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="server">Servers</SelectItem>
                  <SelectItem value="workstation">Workstations</SelectItem>
                  <SelectItem value="mobile">Mobile Devices</SelectItem>
                  <SelectItem value="cloud">Cloud Instances</SelectItem>
                  <SelectItem value="network">Network Devices</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Assets Table */}
            <div className="border border-slate-600 rounded-lg bg-slate-700/30">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-600">
                    <TableHead className="text-slate-300">Asset</TableHead>
                    <TableHead className="text-slate-300">Type</TableHead>
                    <TableHead className="text-slate-300">Location</TableHead>
                    <TableHead className="text-slate-300">Owner</TableHead>
                    <TableHead className="text-slate-300">Vulnerabilities</TableHead>
                    <TableHead className="text-slate-300">Risk Score</TableHead>
                    <TableHead className="text-slate-300">Status</TableHead>
                    <TableHead className="text-slate-300">Last Scan</TableHead>
                    <TableHead className="text-slate-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssets.map((asset) => {
                    const AssetIcon = assetTypes[asset.type as keyof typeof assetTypes].icon;
                    const totalVulns = asset.vulnerabilities.critical + asset.vulnerabilities.high + 
                                     asset.vulnerabilities.medium + asset.vulnerabilities.low;
                    
                    return (
                      <TableRow key={asset.id} className="border-slate-600 hover:bg-slate-700/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <AssetIcon className="h-5 w-5 text-slate-400" />
                            <div>
                              <p className="font-medium text-white">{asset.name}</p>
                              <p className="text-sm text-slate-400">{asset.ip}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={assetTypes[asset.type as keyof typeof assetTypes].color} variant="secondary">
                            {assetTypes[asset.type as keyof typeof assetTypes].label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-slate-300">{asset.location}</TableCell>
                        <TableCell className="text-sm text-slate-300">{asset.owner}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-white">{totalVulns}</span>
                            {asset.vulnerabilities.critical > 0 && (
                              <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs px-1 py-0">
                                {asset.vulnerabilities.critical}C
                              </Badge>
                            )}
                            {asset.vulnerabilities.high > 0 && (
                              <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs px-1 py-0">
                                {asset.vulnerabilities.high}H
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`font-semibold ${getRiskScoreColor(asset.riskScore)}`}>
                            {asset.riskScore.toFixed(1)}
                          </span>
                        </TableCell>
                        <TableCell>{getStatusBadge(asset.status)}</TableCell>
                        <TableCell className="text-sm text-slate-300">{asset.lastScan}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}