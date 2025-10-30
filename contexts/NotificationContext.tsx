'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ScanStatus } from '@/types/api';

export interface Notification {
  id: string;
  title: string;
  type: 'success' | 'error' | 'info' | 'warning';
  time: string;
  scanId?: string;
  read: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'time' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  clearAllNotifications: () => void;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Load notifications from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('cynerra_notifications');
    if (stored) {
      try {
        setNotifications(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to load notifications:', error);
      }
    }
  }, []);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('cynerra_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'time' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `${Date.now()}-${Math.random()}`,
      time: getRelativeTime(new Date()),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev].slice(0, 50)); // Keep only last 50 notifications
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(notif => (notif.id === id ? { ...notif, read: true } : notif))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  }, []);

  const clearNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotification,
        clearAllNotifications,
        unreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

// Helper function to get relative time
function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hour${Math.floor(diffInSeconds / 3600) > 1 ? 's' : ''} ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} day${Math.floor(diffInSeconds / 86400) > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}

// Helper to create scan status notification
export function createScanNotification(
  scanId: string,
  status: ScanStatus,
  target: string
): Omit<Notification, 'id' | 'time' | 'read'> {
  switch (status) {
    case ScanStatus.COMPLETED:
      return {
        title: `Scan completed: ${target}`,
        type: 'success',
        scanId,
      };
    case ScanStatus.FAILED:
      return {
        title: `Scan failed: ${target}`,
        type: 'error',
        scanId,
      };
    case ScanStatus.CANCELLED:
      return {
        title: `Scan cancelled: ${target}`,
        type: 'warning',
        scanId,
      };
    case ScanStatus.RUNNING:
      return {
        title: `Scan started: ${target}`,
        type: 'info',
        scanId,
      };
    default:
      return {
        title: `Scan status updated: ${target}`,
        type: 'info',
        scanId,
      };
  }
}
