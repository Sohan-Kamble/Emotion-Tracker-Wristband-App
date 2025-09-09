import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Emotion Tracker Wristband - AI-Powered Physiological Monitoring',
  description: 'Real-time emotion tracking using physiological sensor data with machine learning classification. Monitor heart rate, EDA, and temperature for emotional state analysis.',
  keywords: ['emotion tracking', 'physiological monitoring', 'machine learning', 'wearable technology', 'health tech'],
  authors: [{ name: 'Emotion Tracker Team' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#3B82F6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Emotion Tracker" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}