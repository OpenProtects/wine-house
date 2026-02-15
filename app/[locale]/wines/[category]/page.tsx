import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { translations } from '@/lib/i18n';
import { db } from '@/lib/db';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { defaultWinePlaceholder } from '@/lib/defaults';

export async function generateStaticParams() {
  const locales = ['zh', 'ja', 'en', 'it'];
  const categories = ['red', 'white', 'sparkling'];
  const params = [];
  for (const locale of locales) {
    for (const category of categories) {
      params.push({ locale, category });
    }
  }
  return params;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; category: string }> }): Promise<Metadata> {
  const { locale, category } = await params;
  const loc = locale as 'zh' | 'ja' | 'en' | 'it';
  const t = translations[loc];
  const categoryData = db.prepare('SELECT * FROM categories WHERE slug = ?').get(category) as any;
  
  if (!categoryData) {
    return { title: 'Wines - Wine House' };
  }

  const categoryName = categoryData[`name_${loc}`] || categoryData.name_zh;
  return {
    title: `${categoryName} - Wine House`,
    description: categoryData[`description_${loc}`] || categoryData.description_zh,
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ locale: string; category: string }> }) {
  const { locale, category } = await params;
  const loc = locale as 'zh' | 'ja' | 'en' | 'it';
  const t = translations[loc];

  const categoryData = db.prepare('SELECT * FROM categories WHERE slug = ?').get(category) as any;
  
  if (!categoryData) {
    notFound();
  }

  const wines = db.prepare('SELECT * FROM wines WHERE category_id = ? ORDER BY sort_order').all(categoryData.id);

  const getWineName = (wine: any) => wine[`name_${loc}`] || wine.name_zh;
  const getWineDesc = (wine: any) => wine[`description_${loc}`] || wine.description_zh;
  const getCategoryName = (cat: any) => cat[`name_${loc}`] || cat.name_zh;
  const getRegion = (wine: any) => wine[`region_${loc}`] || wine.region_zh;
  const getImage = (item: any) => item.image || defaultWinePlaceholder;

  return (
    <div className="flex flex-col">
      <div className="bg-stone-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{getCategoryName(categoryData)}</h1>
          <p className="text-stone-300 max-w-2xl mx-auto">{categoryData[`description_${loc}`] || categoryData.description_zh}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href={`/${loc}/`}>{t.nav.home}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{getCategoryName(categoryData)}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="container mx-auto px-4 pb-16">
        <h2 className="text-2xl font-semibold mb-8 text-stone-800">{t.wines.title}</h2>
        
        {wines.length === 0 ? (
          <div className="text-center py-16 text-stone-500">
            <p>No wines available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wines.map((wine: any) => (
              <Card key={wine.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
                <div className="aspect-square relative">
                  <Image
                    src={getImage(wine)}
                    alt={getWineName(wine)}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {wine.featured === 1 && (
                    <Badge className="absolute top-3 right-3 bg-red-700">{t.wines.featured}</Badge>
                  )}
                </div>
                <CardContent className="p-5">
                  <h3 className="text-lg font-semibold mb-2 text-stone-800 group-hover:text-red-800 transition-colors">
                    {getWineName(wine)}
                  </h3>
                  <p className="text-stone-600 text-sm mb-4 line-clamp-2">
                    {getWineDesc(wine)}
                  </p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-stone-500">{t.wines.year}</span>
                      <span className="font-medium">{wine.year}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-stone-500">{t.wines.region}</span>
                      <span className="font-medium">{getRegion(wine) || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-stone-500">{t.wines.grape}</span>
                      <span className="font-medium">{wine[`grape_variety_${loc}`] || wine.grape_variety_zh || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-stone-500">{t.wines.alcohol}</span>
                      <span className="font-medium">{wine.alcohol_content ? `${wine.alcohol_content}%` : '-'}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t">
                    <span className="text-xl font-bold text-red-700">${wine.price}</span>
                    <Link href={`/${loc}/wines/${category}/${wine.id}`}>
                      <Button size="sm" className="bg-red-700 hover:bg-red-800">
                        {t.wines.viewDetails}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
