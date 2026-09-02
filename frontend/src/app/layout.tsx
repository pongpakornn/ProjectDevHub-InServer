import React from 'react';
import './globals.css';
import { ToastProvider } from '@/lib/toast-context';

export const metadata = {
  title: 'ProjectDev Hub',
  description: 'Full-Stack Project Development Hub',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className="bg-[#1e1e1e] text-white antialiased min-h-screen">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}