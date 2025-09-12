import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Security utility functions
export function sanitizeInput(input: string): string {
  return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function generateSecureId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Vulnerability assessment utilities
export function calculateRiskScore(cvss: number, businessImpact: number): number {
  return Math.round((cvss * 0.7 + businessImpact * 0.3) * 10) / 10;
}

export function formatVulnerabilityCount(count: number): string {
  if (count < 1000) return count.toString();
  if (count < 1000000) return `${(count / 1000).toFixed(1)}K`;
  return `${(count / 1000000).toFixed(1)}M`;
}

export function getPriorityLevel(score: number): {
  level: string;
  color: string;
  bgColor: string;
} {
  if (score >= 9) return { level: 'Critical', color: 'text-red-400', bgColor: 'bg-red-500/20' };
  if (score >= 7) return { level: 'High', color: 'text-orange-400', bgColor: 'bg-orange-500/20' };
  if (score >= 4) return { level: 'Medium', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' };
  return { level: 'Low', color: 'text-green-400', bgColor: 'bg-green-500/20' };
}

// Date formatting utilities
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}
