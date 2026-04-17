import type { Metadata, Viewport } from 'next';
import { Kanit, Sarabun } from 'next/font/google';
import './globals.css';

const kanit = Kanit({
  subsets: ['thai', 'latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-kanit',
  display: 'swap',
});

const sarabun = Sarabun({
  subsets: ['thai', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sarabun',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'TLC-mission CRM',
  description: 'ระบบติดตามพันธกิจคริสตจักรแบบครบวงจร สำหรับทีมพันธกิจกาฬสินธุ์',
  keywords: ['CRM', 'คริสตจักร', 'พันธกิจ', 'Kalasin', 'Mission'],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#050d1a',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${kanit.variable} ${sarabun.variable}`}>
      <body className="antialiased min-h-screen bg-ink-deep text-text-main">
        {children}
      </body>
    </html>
  );
}
