'use client';

import { useUser, useClerk } from '@clerk/nextjs';
import { useRouter, usePathname } from 'next/navigation';
import {
  Bell,
  Search,
  Menu,
  X,
  Shield,
  BarChart3,
  FileText,
  Scan,
  Home,
  Settings,
  ChevronDown,
  Users,
  Activity,
  TrendingUp,
  LogOut
} from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Auto logout functionality
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes in milliseconds
  const SESSION_KEY = 'cynerra_varm_session';
  const LAST_ACTIVITY_KEY = 'cynerra_varm_last_activity';

  const handleSignOut = async () => {
    // Clear session data
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(LAST_ACTIVITY_KEY);
    await signOut();
    router.push('/');
  };

  // Check if session has expired
  const isSessionExpired = useCallback(() => {
    const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);
    const sessionExists = localStorage.getItem(SESSION_KEY);
    
    if (!lastActivity || !sessionExists) {
      return true;
    }
    
    const timeSinceLastActivity = Date.now() - parseInt(lastActivity);
    return timeSinceLastActivity > INACTIVITY_TIMEOUT;
  }, [INACTIVITY_TIMEOUT]);

  // Update last activity timestamp
  const updateActivity = useCallback(() => {
    localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
    localStorage.setItem(SESSION_KEY, 'active');
  }, []);

  // Reset the inactivity timer
  const resetTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    updateActivity();
    
    timeoutRef.current = setTimeout(() => {
      handleSignOut();
    }, INACTIVITY_TIMEOUT);
  }, [updateActivity, INACTIVITY_TIMEOUT]);

  // Handle user activity events
  const handleUserActivity = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  // Check session validity on component mount and page visibility change
  useEffect(() => {
    if (!isLoaded || !user) return;

    // Check if session has expired when component loads
    if (isSessionExpired()) {
      handleSignOut();
      return;
    }

    // Initialize session
    updateActivity();

    // Handle page visibility change (when user switches tabs or comes back)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // User came back to the tab, check if session expired
        if (isSessionExpired()) {
          handleSignOut();
          return;
        }
        // Reset timer if session is still valid
        resetTimer();
      }
    };

    // Handle beforeunload (when user closes browser/tab)
    const handleBeforeUnload = () => {
      // Clear session when browser is closed
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(LAST_ACTIVITY_KEY);
    };

    // Add visibility change listener
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Add beforeunload listener
    window.addEventListener('beforeunload', handleBeforeUnload);

    // List of events that indicate user activity
    const activityEvents = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    // Add event listeners for user activity
    activityEvents.forEach(event => {
      document.addEventListener(event, handleUserActivity, true);
    });

    // Start the initial timer
    resetTimer();

    // Cleanup function
    return () => {
      // Remove all event listeners
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleUserActivity, true);
      });

      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);

      // Clear the timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isLoaded, user, handleUserActivity, resetTimer, isSessionExpired, updateActivity]);

  const navigationItems = [
    { name: 'Overview', href: '/dashboard', icon: Home },
    { name: 'Assets', href: '/dashboard/assets', icon: Shield },
    { name: 'Risk Assessment', href: '/dashboard/risk', icon: BarChart3 },
    { name: 'Scanning', href: '/dashboard/scanning', icon: Scan },
    { name: 'Reports', href: '/dashboard/reports', icon: FileText },
    { name: 'Profile', href: '/dashboard/profile', icon: Users },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  const quickActions = [
    { name: 'Start Security Scan', action: () => router.push('/dashboard/scanning') },
    { name: 'Generate Report', action: () => router.push('/dashboard/reports') },
    { name: 'View Assets', action: () => router.push('/dashboard/assets') },
  ];

  const notifications = [
    { id: 1, title: 'Critical vulnerability detected', type: 'critical', time: '2 min ago' },
    { id: 2, title: 'Security scan completed', type: 'success', time: '1 hour ago' },
    { id: 3, title: 'New assets discovered', type: 'info', time: '3 hours ago' },
  ];

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 fixed top-0 left-0 right-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left section */}
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden text-slate-100 hover:text-cyan-100 hover:bg-slate-700/50 transition-colors"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xl font-bold text-white">Cynerra</span>
                </div>
              </div>
            </div>

            {/* Center section - Search */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search assets, vulnerabilities, reports..."
                  className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                />
              </div>
            </div>

            {/* Right section */}
            <div className="flex items-center space-x-4">
              {/* Quick Actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="hidden sm:flex text-slate-100 hover:text-cyan-100 hover:bg-slate-700/50 transition-colors">
                    Quick Actions
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-slate-800 border-slate-700">
                  <DropdownMenuLabel className="text-cyan-100 font-semibold">Quick Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-700" />
                  {quickActions.map((action) => (
                    <DropdownMenuItem 
                      key={action.name}
                      onClick={action.action}
                      className="text-slate-100 hover:bg-slate-700/80 hover:text-cyan-100 cursor-pointer transition-colors"
                    >
                      {action.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative text-slate-100 hover:text-cyan-100 hover:bg-slate-700/50 transition-colors">
                    <Bell className="h-5 w-5" />
                    {notifications.length > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 bg-red-500 text-white text-xs flex items-center justify-center">
                        {notifications.length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 bg-slate-800 border-slate-700">
                  <DropdownMenuLabel className="text-cyan-100 font-semibold">Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-700" />
                  {notifications.map((notification) => (
                    <DropdownMenuItem key={notification.id} className="p-4 hover:bg-slate-700/80 transition-colors">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm text-slate-100 font-medium">{notification.title}</p>
                        <p className="text-xs text-slate-300">{notification.time}</p>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.imageUrl} alt={user?.fullName || 'User'} />
                      <AvatarFallback className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white">
                        {user?.firstName?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-slate-800 border-slate-700" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none text-cyan-100">
                        {user?.fullName || 'User'}
                      </p>
                      <p className="text-xs leading-none text-slate-300">
                        {user?.primaryEmailAddress?.emailAddress}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-700" />
                  <DropdownMenuItem 
                    className="text-slate-100 hover:bg-slate-700/80 hover:text-cyan-100 transition-colors cursor-pointer"
                    onClick={() => router.push('/dashboard/profile')}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-slate-100 hover:bg-slate-700/80 hover:text-cyan-100 transition-colors cursor-pointer"
                    onClick={() => router.push('/dashboard/settings')}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-700" />
                  <DropdownMenuItem 
                    className="text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors cursor-pointer"
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className={`
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0 fixed lg:fixed inset-y-0 left-0 z-40 w-64 
          bg-slate-800/50 backdrop-blur-sm border-r border-slate-700/50 
          transition-transform duration-300 ease-in-out lg:transition-none
          top-16
        `}>
          <div className="flex flex-col h-full overflow-hidden">
            <div className="flex-1 overflow-y-auto">
              <nav className="px-4 py-6 space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Button
                      key={item.name}
                      variant="ghost"
                      className={`w-full justify-start transition-colors ${
                        isActive 
                          ? 'bg-cyan-600/20 text-cyan-300 border-l-4 border-cyan-400' 
                          : 'text-slate-100 hover:text-cyan-100 hover:bg-slate-700/50'
                      }`}
                      onClick={() => {
                        router.push(item.href);
                        setIsSidebarOpen(false);
                      }}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Button>
                  );
                })}
              </nav>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 lg:ml-64 overflow-y-auto">
          <div className="p-6 mt-16">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}