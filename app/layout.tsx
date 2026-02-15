import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Wine House - Premium Wines',
  description: 'Discover exceptional wines from our century-old winery. Red, white, and sparkling wines crafted with passion since 1892.',
  keywords: 'wine, red wine, white wine, sparkling wine, winery, vintage',
  openGraph: {
    title: 'Wine House - Premium Wines',
    description: 'Discover exceptional wines from our century-old winery',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <body className="min-h-screen bg-stone-50 font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

export function generateStaticParams() {
  return [{ locale: 'zh' }, { locale: 'ja' }, { locale: 'en' }, { locale: 'it' }];
}
