import type { Metadata } from 'next';
import AdminDashboard from '@/components/AdminDashboard';

export async function generateStaticParams() {
  return [{ locale: 'zh' }, { locale: 'ja' }, { locale: 'en' }, { locale: 'it' }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  return {
    title: 'Admin - Wine House',
  };
}

export default async function AdminPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <AdminDashboard locale={locale} />;
}
