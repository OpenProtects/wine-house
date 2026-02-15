import { translations } from '@/lib/i18n';
import { db } from '@/lib/db';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const dynamic = 'force-dynamic';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const loc = locale as 'zh' | 'ja' | 'en' | 'it';
  
  const settings = db.prepare('SELECT setting_key, setting_value_zh, setting_value_ja, setting_value_en, setting_value_it FROM site_settings').all() as any[];
  const settingsMap: Record<string, string> = {};
  settings.forEach(s => {
    settingsMap[s.setting_key] = s[`setting_value_${loc}`] || s.setting_value_zh;
  });

  const siteName = settingsMap.site_name || 'Wine House';
  const siteLogo = settingsMap.site_logo;
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header locale={locale} t={translations[loc]} siteName={siteName} siteLogo={siteLogo} />
      <main className="flex-1">{children}</main>
      <Footer locale={locale} settings={settingsMap} />
    </div>
  );
}
