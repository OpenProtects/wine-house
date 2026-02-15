import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { translations } from '@/lib/i18n';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { ArrowRight, Wine, Award, Clock, ChevronRight } from 'lucide-react';
import { defaultWinePlaceholder, defaultCategoryPlaceholder } from '@/lib/defaults';

// -----------------------------------------------------------------------------
// 配置与元数据
// -----------------------------------------------------------------------------

export async function generateStaticParams() {
  return [{ locale: 'zh' }, { locale: 'ja' }, { locale: 'en' }, { locale: 'it' }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const loc = locale as 'zh' | 'ja' | 'en' | 'it';
  const t = translations[loc];
  return {
    title: `${t.home.heroTitle} - Wine House`,
    description: t.home.heroSubtitle,
  };
}

// -----------------------------------------------------------------------------
// 主页面组件
// -----------------------------------------------------------------------------

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const loc = locale as 'zh' | 'ja' | 'en' | 'it';
  const t = translations[loc];

  // 数据获取
  const settings = db.prepare('SELECT setting_key, setting_value_zh, setting_value_ja, setting_value_en, setting_value_it FROM site_settings').all() as any[];
  const settingsMap: Record<string, string> = {};
  settings.forEach(s => {
    settingsMap[s.setting_key] = s[`setting_value_${loc}`] || s.setting_value_zh;
  });

  const featuredWines = db.prepare('SELECT * FROM wines WHERE featured = 1 ORDER BY sort_order LIMIT 6').all();
  const categories = db.prepare('SELECT * FROM categories ORDER BY sort_order').all();
  const heroes = db.prepare('SELECT * FROM home_heroes ORDER BY sort_order').all();

  // 辅助函数
  const getWineName = (wine: any) => wine[`name_${loc}`] || wine.name_zh;
  const getWineDesc = (wine: any) => wine[`description_${loc}`] || wine.description_zh;
  const getCategoryName = (cat: any) => cat[`name_${loc}`] || cat.name_zh;
  const getImage = (item: any) => item.image || defaultWinePlaceholder;
  const getHeroTitle = (hero: any) => hero[`title_${loc}`] || hero.title_zh;
  const getHeroSubtitle = (hero: any) => hero[`subtitle_${loc}`] || hero.subtitle_zh;

  return (
    <div className="flex flex-col bg-stone-50 min-h-screen font-sans selection:bg-red-900 selection:text-white">
      
      {/* Section 1: Split Hero Carousel 
        设计思路：左右分栏布局。
        左侧：优雅的衬线体文案。
        右侧：巨大的酒瓶特写（使用 Placeholder），配合聚光灯背景，营造高端陈列感。
      */}
      <section className="relative h-[85vh] min-h-[600px] w-full bg-stone-950 overflow-hidden">
        <Carousel className="w-full h-full" opts={{ loop: true, duration: 60 }}>
          <CarouselContent className="h-full ml-0"> 
            {heroes.map((hero: any, index: number) => (
              <CarouselItem key={index} className="h-full pl-0 relative">
                {/* 动态背景层 */}
                <div className={`absolute inset-0 bg-gradient-to-br ${hero.theme || 'from-stone-900 to-stone-950'} opacity-90`} />
                
                {/* 装饰性背景纹理 */}
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-overlay" />
                
                {/* 聚光灯效果 - 投射在右侧酒瓶后方 */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-900/30 rounded-full blur-[100px] opacity-60" />

                <div className="container mx-auto h-full px-4 md:px-12 relative z-10">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full items-center">
                    
                    {/* 左侧：文字内容 */}
                    <div className="flex flex-col justify-center items-start text-left space-y-8 max-w-2xl pt-20 lg:pt-0 animate-in fade-in slide-in-from-left-8 duration-1000">
                      <div className="flex items-center gap-3">
                         <div className="h-[1px] w-12 bg-red-500/50"></div>
                         <span className="text-red-200/80 text-sm tracking-[0.3em] uppercase font-light">Est. 1892</span>
                      </div>
                      
                      <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-medium text-white leading-[1.1] tracking-wide drop-shadow-xl">
                        {getHeroTitle(hero)}
                      </h1>
                      
                      <p className="text-lg md:text-xl text-stone-300 font-light leading-relaxed max-w-lg border-l-2 border-red-900/50 pl-6">
                        {getHeroSubtitle(hero)}
                      </p>
                      
                      <div className="pt-4">
                        <Link href={hero.link || `/${loc}/wines/red`}>
                          <Button 
                            size="lg" 
                            className="bg-white text-stone-900 hover:bg-stone-200 hover:text-red-900 rounded-sm px-10 py-7 text-base tracking-widest uppercase transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                          >
                            {t.home.exploreBtn} <ArrowRight className="ml-2 w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>

                    {/* 右侧：图片展示 */}
                    <div className="hidden lg:flex items-center justify-center relative h-full animate-in fade-in zoom-in-95 duration-1000 delay-200">
                      {/* 后景圆环装饰 */}
                      <div className="absolute w-[450px] h-[450px] border border-white/5 rounded-full" />
                      <div className="absolute w-[350px] h-[350px] border border-white/10 rounded-full" />
                      
                      {/* 主图：使用 hero.image 或者 defaultWinePlaceholder 作为特写 */}
                      <div className="relative w-[300px] h-[500px] drop-shadow-2xl filter brightness-110 contrast-110">
                         {/* 这里的图片如果不合适全屏背景，作为独立元素展示会非常合适 */}
                         <Image 
                           src={hero.image || defaultWinePlaceholder} 
                           alt={getHeroTitle(hero)} 
                           fill
                           className="object-contain hover:scale-105 transition-transform duration-700 ease-in-out"
                           priority
                         />
                      </div>
                    </div>

                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          
          {/* 导航按钮：移至左下角或更显眼的位置 */}
          <div className="absolute bottom-8 right-8 md:bottom-12 md:right-12 flex gap-4 z-20">
            <CarouselPrevious className="static translate-y-0 h-12 w-12 bg-transparent border border-white/20 text-white hover:bg-white hover:text-stone-900 rounded-sm transition-colors" />
            <CarouselNext className="static translate-y-0 h-12 w-12 bg-transparent border border-white/20 text-white hover:bg-white hover:text-stone-900 rounded-sm transition-colors" />
          </div>
        </Carousel>
      </section>

      {/* Section 2: Trust Indicators / Value Props
        设计思路：极简的图标+文字，建立品牌信任感，作为Hero和内容的过渡。
      */}
      <section className="py-12 border-b border-stone-200 bg-white">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="flex flex-col items-center space-y-3 group">
            <div className="p-4 bg-stone-50 rounded-full text-stone-400 group-hover:text-red-900 group-hover:bg-red-50 transition-colors duration-300">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg text-stone-900">Premium Quality</h3>
            <p className="text-sm text-stone-500 max-w-xs mx-auto">Hand-picked grapes from the finest vineyards.</p>
          </div>
          <div className="flex flex-col items-center space-y-3 group">
            <div className="p-4 bg-stone-50 rounded-full text-stone-400 group-hover:text-red-900 group-hover:bg-red-50 transition-colors duration-300">
              <Wine className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg text-stone-900">Master Winemakers</h3>
            <p className="text-sm text-stone-500 max-w-xs mx-auto">Crafted with passion and centuries of tradition.</p>
          </div>
          <div className="flex flex-col items-center space-y-3 group">
            <div className="p-4 bg-stone-50 rounded-full text-stone-400 group-hover:text-red-900 group-hover:bg-red-50 transition-colors duration-300">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg text-stone-900">Heritage</h3>
            <p className="text-sm text-stone-500 max-w-xs mx-auto">A legacy of excellence dating back to 1892.</p>
          </div>
        </div>
      </section>

      {/* Section 3: Elegant Categories 
        设计思路：图片主导，文字悬浮或置于下方，增加点击欲望。
      */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16">
            <div>
              <h2 className="text-4xl md:text-5xl font-serif text-stone-900 mb-4">
                {t.home.categories}
              </h2>
              <div className="h-1 w-20 bg-red-900"></div>
            </div>
            <Link href={`/${loc}/collections`} className="hidden md:flex items-center text-stone-600 hover:text-red-900 transition-colors mt-4 md:mt-0 group">
              VIEW ALL COLLECTIONS <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10">
            {categories.map((category: any) => (
              <Link key={category.id} href={`/${loc}/wines/${category.slug}`} className="group block">
                <div className="relative overflow-hidden aspect-[3/4] rounded-sm bg-stone-100">
                  <Image
                    src={getImage(category)}
                    alt={getCategoryName(category)}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                  {/* 渐变遮罩，让文字更清晰 */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-70 transition-opacity" />
                  
                  <div className="absolute bottom-0 left-0 p-8 w-full text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                    <h3 className="font-serif text-3xl mb-2 italic">
                      {getCategoryName(category)}
                    </h3>
                    <p className="text-stone-200 text-sm line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                      {category[`description_${loc}`] || category.description_zh}
                    </p>
                    <div className="mt-4 flex items-center text-xs tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200 text-red-200">
                      Explore <ChevronRight className="ml-1 w-3 h-3" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: Featured Wines (Clean Grid)
        设计思路：去卡片化设计。让瓶身图片“呼吸”，重点突出价格和年份。
      */}
      <section className="py-24 bg-stone-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-red-900 font-bold tracking-widest text-sm uppercase mb-3 block">Sommelier's Choice</span>
            <h2 className="text-4xl md:text-5xl font-serif text-stone-900 mb-6">
              {t.home.featured}
            </h2>
            <p className="text-stone-600 font-light text-lg">
              {loc === 'zh' ? '不仅是酒，更是凝固的时间与风土。' : 'More than wine, it is time and terroir captured in a bottle.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            {featuredWines.map((wine: any) => (
              <div key={wine.id} className="group relative flex flex-col items-center">
                {/* 图片区域 - 瓶身稍微超出容器增加立体感 */}
                <Link href={`/${loc}/wines/detail/${wine.id}`} className="w-full relative aspect-[3/4] mb-6 overflow-visible bg-white shadow-sm hover:shadow-xl transition-all duration-500 rounded-sm flex items-center justify-center p-8 group-hover:-translate-y-2">
                  <div className="relative w-full h-full">
                    <Image
                      src={getImage(wine)}
                      alt={getWineName(wine)}
                      fill
                      className="object-contain drop-shadow-lg group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  {wine.featured === 1 && (
                    <Badge className="absolute top-4 left-4 bg-red-900 text-white hover:bg-red-800 rounded-none px-3 py-1 text-xs tracking-wider">
                      FEATURED
                    </Badge>
                  )}
                </Link>

                {/* 信息区域 */}
                <div className="text-center w-full px-4">
                  <div className="text-xs text-stone-500 mb-2 uppercase tracking-wide">
                    {wine.year} • {wine.region}
                  </div>
                  <Link href={`/${loc}/wines/detail/${wine.id}`}>
                    <h3 className="text-xl font-serif text-stone-900 mb-2 group-hover:text-red-900 transition-colors line-clamp-1">
                      {getWineName(wine)}
                    </h3>
                  </Link>
                  <div className="h-px w-10 bg-stone-300 mx-auto my-3 group-hover:w-20 group-hover:bg-red-900 transition-all duration-300"></div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-lg font-medium text-stone-900">
                      ${wine.price}
                    </span>
                  </div>
                  
                  <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -translate-y-2 group-hover:translate-y-0">
                    <Button variant="outline" size="sm" className="border-stone-300 hover:border-red-900 hover:text-red-900 rounded-full">
                      {t.common.learnMore}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-20">
            <Link href={`/${loc}/wines/red`}>
              <Button size="lg" className="bg-stone-900 text-white hover:bg-red-900 px-8 py-6 rounded-none transition-colors duration-300">
                {t.home.exploreBtn}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}