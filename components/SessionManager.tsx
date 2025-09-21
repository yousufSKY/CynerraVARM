'use client';

import { useUser, useClerk } from '@clerk/nextjs';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

export function SessionManager() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const pathname = usePathname();
  const hasInitialized = useRef(false);

  const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes in milliseconds
  const SESSION_KEY = 'cynerra_varm_session';
  const LAST_ACTIVITY_KEY = 'cynerra_varm_last_activity';
  const SERVER_SESSION_KEY = 'cynerra_varm_server_session';

  useEffect(() => {
    // Only run on client side
    if (!isLoaded) return;

    // Check if this is a fresh server/browser session
    const serverSession = sessionStorage.getItem(SERVER_SESSION_KEY);
    
    if (!serverSession) {
      // Mark this as a fresh session
      sessionStorage.setItem(SERVER_SESSION_KEY, 'active');
      // Clear any old session data
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(LAST_ACTIVITY_KEY);
      hasInitialized.current = false;
    }

    // For authenticated users on protected routes
    if (user && pathname.startsWith('/dashboard')) {
      
      // If this is a fresh session and user is authenticated, initialize session
      if (!hasInitialized.current) {
        localStorage.setItem(SESSION_KEY, 'active');
        localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
        hasInitialized.current = true;
        return;
      }

      const checkSessionValidity = async () => {
        const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);
        const sessionExists = localStorage.getItem(SESSION_KEY);
        
        // Only check if we have initialized the session
        if (hasInitialized.current && lastActivity && sessionExists) {
          const timeSinceLastActivity = Date.now() - parseInt(lastActivity);
          
          if (timeSinceLastActivity > INACTIVITY_TIMEOUT) {
            // Session expired, clean up and sign out
            localStorage.removeItem(SESSION_KEY);
            localStorage.removeItem(LAST_ACTIVITY_KEY);
            hasInitialized.current = false;
            await signOut();
            router.push('/');
          }
        }
      };

      // Only start checking after session is initialized
      if (hasInitialized.current) {
        // Set up periodic session checks every 30 seconds
        const sessionCheckInterval = setInterval(checkSessionValidity, 30000);

        return () => {
          clearInterval(sessionCheckInterval);
        };
      }
    }
  }, [isLoaded, user, pathname, signOut, router]);

  // This component doesn't render anything
  return null;
}