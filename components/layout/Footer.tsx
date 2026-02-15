import Link from 'next/link';

interface FooterProps {
  locale: string;
  settings?: Record<string, string>;
}

export function Footer({ locale, settings = {} }: FooterProps) {
  const footerLinks = {
    zh: [
      { label: '首页', href: `/${locale}/` },
      { label: '红葡萄酒', href: `/${locale}/wines/red` },
      { label: '白葡萄酒', href: `/${locale}/wines/white` },
      { label: '起泡酒', href: `/${locale}/wines/sparkling` },
      { label: '品牌故事', href: `/${locale}/story` },
      { label: '联系我们', href: `/${locale}/contact` },
    ],
    ja: [
      { label: 'ホーム', href: `/${locale}/` },
      { label: '赤ワイン', href: `/${locale}/wines/red` },
      { label: '白ワイン', href: `/${locale}/wines/white` },
      { label: 'スパークリング', href: `/${locale}/wines/sparkling` },
      { label: 'ストーリー', href: `/${locale}/story` },
      { label: 'お問い合わせ', href: `/${locale}/contact` },
    ],
    en: [
      { label: 'Home', href: `/${locale}/` },
      { label: 'Red Wine', href: `/${locale}/wines/red` },
      { label: 'White Wine', href: `/${locale}/wines/white` },
      { label: 'Sparkling', href: `/${locale}/wines/sparkling` },
      { label: 'Our Story', href: `/${locale}/story` },
      { label: 'Contact', href: `/${locale}/contact` },
    ],
    it: [
      { label: 'Home', href: `/${locale}/` },
      { label: 'Vino Rosso', href: `/${locale}/wines/red` },
      { label: 'Vino Bianco', href: `/${locale}/wines/white` },
      { label: 'Spumante', href: `/${locale}/wines/sparkling` },
      { label: 'Storia', href: `/${locale}/story` },
      { label: 'Contatti', href: `/${locale}/contact` },
    ],
  };

  const labels = {
    zh: { quickLinks: '快速链接', followUs: '关注我们' },
    ja: { quickLinks: 'クイックリンク', followUs: 'フォローする' },
    en: { quickLinks: 'Quick Links', followUs: 'Follow Us' },
    it: { quickLinks: 'Link Rapidi', followUs: 'Seguici' },
  };

  const t = labels[locale as keyof typeof labels] || labels.zh;
  const links = footerLinks[locale as keyof typeof footerLinks] || footerLinks.zh;
  const siteName = settings.site_name || 'Wine House';
  const footerDesc = settings.footer_description || settings.site_description || '';

  return (
    <footer className="bg-stone-900 text-stone-100">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold">W</span>
              <span className="text-xl font-bold">{siteName}</span>
            </div>
            {footerDesc && <p className="text-stone-400 text-sm">{footerDesc}</p>}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t.quickLinks}</h3>
            <ul className="space-y-2">
              {links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-stone-400 hover:text-red-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t.followUs}</h3>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-stone-800 text-center text-stone-500 text-sm">
          {new Date().getFullYear()} {siteName}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
