import type { Metadata } from 'next';
import { translations } from '@/lib/i18n';
import { db } from '@/lib/db';
import ContactForm from '@/components/ContactForm';

export async function generateStaticParams() {
  return [{ locale: 'zh' }, { locale: 'ja' }, { locale: 'en' }, { locale: 'it' }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const loc = locale as 'zh' | 'ja' | 'en' | 'it';
  const t = translations[loc];
  return {
    title: `${t.contact.title} - Wine House`,
    description: t.contact.subtitle,
  };
}

export default async function ContactPageWrapper({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const loc = locale as 'zh' | 'ja' | 'en' | 'it';
  
  const settings = db.prepare('SELECT setting_key, setting_value_zh, setting_value_ja, setting_value_en, setting_value_it FROM site_settings').all() as any[];
  const settingsMap: Record<string, string> = {};
  settings.forEach(s => {
    settingsMap[s.setting_key] = s[`setting_value_${loc}`] || s.setting_value_zh;
  });
  
  return <ContactForm locale={locale} settings={settingsMap} />;
}
