'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Bell, 
  Shield, 
  Moon, 
  Sun, 
  Globe, 
  Key,
  Smartphone,
  Mail,
  AlertTriangle,
  Trash2,
  Download,
  Eye,
  EyeOff,
  ArrowLeft
} from 'lucide-react';
import { useState, useEffect } from 'react';

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  
  const [settings, setSettings] = useState({
    // Notification Settings
    emailNotifications: true,
    pushNotifications: true,
    securityAlerts: true,
    vulnerabilityReports: true,
    weeklyDigest: false,
    
    // Privacy Settings
    profileVisibility: 'private',
    dataSharing: false,
    analyticsTracking: true,
    
    // Security Settings
    twoFactorEnabled: false,
    sessionTimeout: '5',
    loginAlerts: true,
    
    // Display Settings
    theme: 'dark',
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY'
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    
    if (!user) {
      router.push('/sign-in');
      return;
    }

    // Load user settings from metadata
    const userSettings = user.unsafeMetadata?.settings as typeof settings;
    if (userSettings) {
      setSettings(prev => ({ ...prev, ...userSettings }));
    }
  }, [user, isLoaded, router]);

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveSettings = async () => {
    try {
      await user?.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          settings: settings
        }
      });
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const exportData = () => {
    const data = {
      profile: {
        name: user?.fullName,
        email: user?.primaryEmailAddress?.emailAddress,
        joinDate: user?.createdAt
      },
      settings: settings,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cynerra-account-data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6 bg-slate-900 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Settings</h1>
          <p className="text-slate-400 mt-1 text-sm sm:text-base">Manage your account preferences and security settings</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button
            onClick={() => router.push('/dashboard')}
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-cyan-400 hover:bg-slate-800/50 transition-colors w-full sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <Button
            onClick={saveSettings}
            className="bg-cyan-600 hover:bg-cyan-700 text-white w-full sm:w-auto"
            size="sm"
          >
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Notification Settings */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2 text-lg">
              <Bell className="w-5 h-5" />
              Notifications
            </CardTitle>
            <CardDescription className="text-slate-400 text-sm">
              Configure how you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 md:space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0 pr-3">
                <Label className="text-slate-300 text-sm">Email Notifications</Label>
                <p className="text-xs text-slate-500">Receive updates via email</p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0 pr-3">
                <Label className="text-slate-300 text-sm">Push Notifications</Label>
                <p className="text-xs text-slate-500">Browser notifications</p>
              </div>
              <Switch
                checked={settings.pushNotifications}
                onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0 pr-3">
                <Label className="text-slate-300 text-sm">Security Alerts</Label>
                <p className="text-xs text-slate-500">Critical security notifications</p>
              </div>
              <Switch
                checked={settings.securityAlerts}
                onCheckedChange={(checked) => handleSettingChange('securityAlerts', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0 pr-3">
                <Label className="text-slate-300 text-sm">Vulnerability Reports</Label>
                <p className="text-xs text-slate-500">Weekly vulnerability summaries</p>
              </div>
              <Switch
                checked={settings.vulnerabilityReports}
                onCheckedChange={(checked) => handleSettingChange('vulnerabilityReports', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2 text-lg">
              <Shield className="w-5 h-5" />
              Security
            </CardTitle>
            <CardDescription className="text-slate-400 text-sm">
              Manage your account security preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 md:space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0 pr-3">
                <Label className="text-slate-300 text-sm">Two-Factor Authentication</Label>
                <p className="text-xs text-slate-500">Add extra security to your account</p>
              </div>
              <Badge variant={settings.twoFactorEnabled ? "default" : "secondary"} className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                {settings.twoFactorEnabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <Label className="text-slate-300 text-sm">Session Timeout</Label>
              <Select value={settings.sessionTimeout} onValueChange={(value) => handleSettingChange('sessionTimeout', value)}>
                <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0 pr-3">
                <Label className="text-slate-300 text-sm">Login Alerts</Label>
                <p className="text-xs text-slate-500">Notify on new device logins</p>
              </div>
              <Switch
                checked={settings.loginAlerts}
                onCheckedChange={(checked) => handleSettingChange('loginAlerts', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Display Settings */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2 text-lg">
              <Settings className="w-5 h-5" />
              Display & Language
            </CardTitle>
            <CardDescription className="text-slate-400 text-sm">
              Customize your interface preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 md:space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-300 text-sm">Theme</Label>
              <Select value={settings.theme} onValueChange={(value) => handleSettingChange('theme', value)}>
                <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-slate-300 text-sm">Language</Label>
              <Select value={settings.language} onValueChange={(value) => handleSettingChange('language', value)}>
                <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-slate-300 text-sm">Date Format</Label>
              <Select value={settings.dateFormat} onValueChange={(value) => handleSettingChange('dateFormat', value)}>
                <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Data & Privacy */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2 text-lg">
              <Eye className="w-5 h-5" />
              Data & Privacy
            </CardTitle>
            <CardDescription className="text-slate-400 text-sm">
              Control your data and privacy settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 md:space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0 pr-3">
                <Label className="text-slate-300 text-sm">Analytics Tracking</Label>
                <p className="text-xs text-slate-500">Help improve our service</p>
              </div>
              <Switch
                checked={settings.analyticsTracking}
                onCheckedChange={(checked) => handleSettingChange('analyticsTracking', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0 pr-3">
                <Label className="text-slate-300 text-sm">Data Sharing</Label>
                <p className="text-xs text-slate-500">Share anonymized data</p>
              </div>
              <Switch
                checked={settings.dataSharing}
                onCheckedChange={(checked) => handleSettingChange('dataSharing', checked)}
              />
            </div>
            
            <Separator className="bg-slate-700" />
            
            <Button
              onClick={exportData}
              variant="outline"
              className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 text-sm"
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Export My Data
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Danger Zone */}
      <Card className="bg-red-900/20 border-red-800/50">
        <CardHeader>
          <CardTitle className="text-red-400 flex items-center gap-2 text-lg">
            <AlertTriangle className="w-5 h-5" />
            Danger Zone
          </CardTitle>
          <CardDescription className="text-red-300/70 text-sm">
            Irreversible and destructive actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex-1">
              <h3 className="text-red-400 font-medium text-sm">Delete Account</h3>
              <p className="text-xs text-red-300/70">Permanently delete your account and all data</p>
            </div>
            <Button
              onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
              variant="destructive"
              className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
              size="sm"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Account
            </Button>
          </div>
          
          {showDeleteConfirm && (
            <div className="mt-4 p-3 md:p-4 bg-red-900/30 border border-red-800/50 rounded-lg">
              <p className="text-red-300 text-xs sm:text-sm mb-3">
                This action cannot be undone. This will permanently delete your account and remove all associated data.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
                >
                  Yes, Delete My Account
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="border-slate-600 text-slate-300 w-full sm:w-auto"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}