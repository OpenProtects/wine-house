import type { Metadata } from 'next';
import Image from 'next/image';
import { translations } from '@/lib/i18n';
import { db } from '@/lib/db';
import { Separator } from '@/components/ui/separator';
import { defaultStoryPlaceholder } from '@/lib/defaults';

export async function generateStaticParams() {
  return [{ locale: 'zh' }, { locale: 'ja' }, { locale: 'en' }, { locale: 'it' }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const loc = locale as 'zh' | 'ja' | 'en' | 'it';
  const t = translations[loc];
  return {
    title: `${t.story.title} - Wine House`,
    description: t.story.subtitle,
  };
}

export default async function StoryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const loc = locale as 'zh' | 'ja' | 'en' | 'it';
  const t = translations[loc];

  const stories = db.prepare('SELECT * FROM stories ORDER BY sort_order').all();
  
  const settings = db.prepare('SELECT setting_key, setting_value_zh, setting_value_ja, setting_value_en, setting_value_it FROM site_settings').all() as any[];
  const settingsMap: Record<string, string> = {};
  settings.forEach(s => {
    settingsMap[s.setting_key] = s[`setting_value_${loc}`] || s.setting_value_zh;
  });

  const getTitle = (story: any) => story[`title_${loc}`] || story.title_zh;
  const getContent = (story: any) => story[`content_${loc}`] || story.content_zh;
  const getImage = (story: any) => story.image || defaultStoryPlaceholder;

  return (
    <div className="flex flex-col bg-[#fdfcfb] text-stone-900">
      

      {/* Main Content */}
      <div className="container mx-auto px-6 py-24 max-w-6xl">
        {stories.map((story: any, index: number) => (
          <div key={story.id} className="mb-32 last:mb-16">
            <div className={`flex flex-col ${index % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'} gap-12 md:gap-24 items-center`}>
              
              {/* Image Section - 加入装饰性阴影和比例 */}
              <div className="w-full md:w-1/2">
                <div className="relative group">
                  <div className="absolute -inset-4 bg-stone-100 rounded-sm -z-10 group-hover:bg-stone-200 transition-colors duration-500" />
                  <div className="aspect-[3/4] relative overflow-hidden shadow-2xl">
                    <Image
                      src={getImage(story)}
                      alt={getTitle(story)}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  {/* 装饰性数字序号 */}
                  <span className="absolute -bottom-8 -left-4 text-8xl font-serif text-stone-100 font-bold -z-20">
                    0{index + 1}
                  </span>
                </div>
              </div>

              {/* Text Section - 增强排版细节 */}
              <div className="w-full md:w-1/2 space-y-6">
                <h2 className="text-3xl md:text-4xl font-serif text-stone-800 leading-tight">
                  {getTitle(story)}
                </h2>
                <div className="w-8 h-[1px] bg-red-900" />
                <p className="text-stone-600 leading-relaxed text-lg font-light">
                  {getContent(story)}
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* Call to Action - 极简主义设计 */}
        <div className="mt-32 border-t border-stone-200 pt-24 pb-12 text-center">
          <div className="inline-block px-8 py-16 bg-white border border-stone-100 shadow-sm rounded-full aspect-square flex flex-col justify-center items-center max-w-md mx-auto transform hover:scale-105 transition-transform duration-500">
            <h2 className="text-2xl font-serif mb-4 text-stone-800">
              {settingsMap['story_cta_title'] || (locale === 'zh' ? '欢迎品鉴' : locale === 'ja' ? 'お試しください' : locale === 'en' ? 'Welcome to Taste' : 'Benvenuti a Assaggiare')}
            </h2>
            <p className="text-stone-500 text-sm max-w-xs leading-relaxed italic">
              {settingsMap['story_cta_content'] || (locale === 'zh' ? '每一瓶红酒都是一段故事，我们邀请您来品味这份跨越百年的醇香。'
                : locale === 'ja' ? '每本のワインは一つの物語です。百年以上の醇香をお持ちください。'
                : locale === 'en' ? 'Every bottle of wine tells a story. We invite you to taste this century-old aroma.'
                : 'Ogni bottiglia di vino racconta una storia. Vi invitiamo a assaporare questo aroma secolare.')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}