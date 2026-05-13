import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#f97316',
};

export const metadata: Metadata = {
  title: 'SmartMeal - 智能膳食计划',
  description: '基于 AI 的个性化膳食计划应用',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'SmartMeal',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    apple: [{ url: '/icon-192.png', sizes: '192x192' }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
