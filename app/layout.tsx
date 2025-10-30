import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { SessionManager } from '@/components/SessionManager';
import { ApiProvider } from '@/components/providers/api-provider';
import { NotificationProvider } from '@/contexts/NotificationContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Cynerra - Vulnerability Assessment & Risk Management Platform',
  description: 'Enterprise-grade cybersecurity vulnerability assessment and risk management SaaS platform',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <ApiProvider>
            <NotificationProvider>
              <SessionManager />
              {children}
            </NotificationProvider>
          </ApiProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}