import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { translations } from '@/lib/i18n';
import { db } from '@/lib/db';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { defaultWinePlaceholder } from '@/lib/defaults';

export async function generateStaticParams() {
  const locales = ['zh', 'ja', 'en', 'it'];
  const wines = db.prepare('SELECT id FROM wines').all() as { id: number }[];
  const params = [];
  for (const locale of locales) {
    for (const wine of wines) {
      params.push({ locale, id: String(wine.id) });
    }
  }
  return params;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; id: string }> }): Promise<Metadata> {
  const { locale, id } = await params;
  const loc = locale as 'zh' | 'ja' | 'en' | 'it';
  const wine = db.prepare('SELECT * FROM wines WHERE id = ?').get(id) as any;
  
  if (!wine) {
    return { title: 'Wine Not Found' };
  }

  const name = wine[`name_${loc}`] || wine.name_zh;
  return {
    title: `${name} - Wine House`,
    description: wine[`description_${loc}`] || wine.description_zh,
  };
}

export default async function WineDetailPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  const loc = locale as 'zh' | 'ja' | 'en' | 'it';
  const t = translations[loc];

  const wine = db.prepare('SELECT * FROM wines WHERE id = ?').get(id) as any;
  
  if (!wine) {
    notFound();
  }

  const prices = db.prepare('SELECT * FROM wine_prices WHERE wine_id = ?').all(wine.id);
  const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(wine.category_id) as any;

  const getName = (item: any) => item[`name_${loc}`] || item.name_zh;
  const getDesc = (item: any) => item[`description_${loc}`] || item.description_zh;
  const getCategoryName = (cat: any) => cat[`name_${loc}`] || cat.name_zh;
  const getRegion = (wine: any) => wine[`region_${loc}`] || wine.region_zh;
  const getGrape = (wine: any) => wine[`grape_variety_${loc}`] || wine.grape_variety_zh;

  const priceMap: Record<string, { price: number; currency: string }> = {};
  (prices as any[]).forEach(p => {
    priceMap[p.country_code] = { price: p.price, currency: p.currency };
  });

  const countryNames: Record<string, Record<string, string>> = {
    zh: { CN: '中国', JP: '日本', US: '美国', IT: '意大利', FR: '法国', GB: '英国', AU: '澳大利亚' },
    ja: { CN: '中国', JP: '日本', US: 'アメリカ', IT: 'イタリア', FR: 'フランス', GB: 'イギリス', AU: 'オーストラリア' },
    en: { CN: 'China', JP: 'Japan', US: 'USA', IT: 'Italy', FR: 'France', GB: 'UK', AU: 'Australia' },
    it: { CN: 'Cina', JP: 'Giappone', US: 'USA', IT: 'Italia', FR: 'Francia', GB: 'Regno Unito', AU: 'Australia' },
  };

  const labels = {
    zh: { details: '产品详情', year: '年份', region: '产区', grape: '葡萄品种', alcohol: '酒精度', category: '分类', prices: '各国价格', addToCart: '联系销售' },
    ja: { details: '商品詳細', year: 'ヴィンテージ', region: '産地', grape: '葡萄品種', alcohol: 'アルコール', category: 'カテゴリー', prices: '各国価格', addToCart: 'お問い合わせ' },
    en: { details: 'Product Details', year: 'Year', region: 'Region', grape: 'Grape Variety', alcohol: 'Alcohol', category: 'Category', prices: 'Country Prices', addToCart: 'Contact Sales' },
    it: { details: 'Dettagli Prodotto', year: 'Anno', region: 'Regione', grape: 'Vitigno', alcohol: 'Alcool', category: 'Categoria', prices: 'Prezzi per Paese', addToCart: 'Contatta Vendite' },
  };

  const l = labels[loc] || labels.zh;
  const cNames = countryNames[loc] || countryNames.zh;

  return (
    <div className="flex flex-col">
      <div className="bg-stone-900 text-white py-12">
        <div className="container mx-auto px-4">
          <Breadcrumb className="text-stone-400">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href={`/${loc}/`} className="text-stone-400">{t.nav.home}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-stone-600" />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/${loc}/wines/${category?.slug}`} className="text-stone-400">{getCategoryName(category)}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-stone-600" />
              <BreadcrumbPage className="text-white">{getName(wine)}</BreadcrumbPage>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-12">
          <div className="relative aspect-square rounded-lg overflow-hidden">
            <Image
              src={wine.image || defaultWinePlaceholder}
              alt={getName(wine)}
              fill
              className="object-cover"
              priority
            />
            {wine.featured === 1 && (
              <Badge className="absolute top-4 right-4 bg-red-700 text-lg px-4 py-1">{t.wines.featured}</Badge>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-stone-800 mb-2">{getName(wine)}</h1>
              {category && (
                <Badge variant="outline" className="text-sm">{getCategoryName(category)}</Badge>
              )}
            </div>

            <p className="text-stone-600 text-lg leading-relaxed">{getDesc(wine)}</p>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 text-stone-800">{l.details}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-stone-500 text-sm">{l.year}</span>
                    <p className="font-medium">{wine.year}</p>
                  </div>
                  <div>
                    <span className="text-stone-500 text-sm">{l.region}</span>
                    <p className="font-medium">{getRegion(wine) || '-'}</p>
                  </div>
                  <div>
                    <span className="text-stone-500 text-sm">{l.grape}</span>
                    <p className="font-medium">{getGrape(wine) || '-'}</p>
                  </div>
                  <div>
                    <span className="text-stone-500 text-sm">{l.alcohol}</span>
                    <p className="font-medium">{wine.alcohol_content ? `${wine.alcohol_content}%` : '-'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {prices && (prices as any[]).length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4 text-stone-800">{l.prices}</h3>
                  <div className="space-y-2">
                    {(prices as any[]).map((p) => (
                      <div key={p.id} className="flex justify-between items-center">
                        <span className="text-stone-600">{cNames[p.country_code] || p.country_code}</span>
                        <span className="font-semibold">{p.currency} {p.price}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="pt-4">
              <Link href={`/${loc}/contact`}>
                <Button size="lg" className="w-full bg-red-700 hover:bg-red-800 text-lg py-6">
                  {l.addToCart}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
