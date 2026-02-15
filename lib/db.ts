import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'wines.db');

export const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    name_zh TEXT NOT NULL,
    name_ja TEXT,
    name_en TEXT,
    name_it TEXT,
    description_zh TEXT,
    description_ja TEXT,
    description_en TEXT,
    description_it TEXT,
    image TEXT,
    sort_order INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS home_heroes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title_zh TEXT NOT NULL,
    title_ja TEXT,
    title_en TEXT,
    title_it TEXT,
    subtitle_zh TEXT,
    subtitle_ja TEXT,
    subtitle_en TEXT,
    subtitle_it TEXT,
    image TEXT,
    theme TEXT DEFAULT 'from-stone-900 to-stone-950',
    link TEXT DEFAULT '/wines/red',
    sort_order INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS wines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL,
    name_zh TEXT NOT NULL,
    name_ja TEXT,
    name_en TEXT,
    name_it TEXT,
    description_zh TEXT,
    description_ja TEXT,
    description_en TEXT,
    description_it TEXT,
    image TEXT,
    price REAL DEFAULT 0,
    year INTEGER,
    region_zh TEXT,
    region_ja TEXT,
    region_en TEXT,
    region_it TEXT,
    grape_variety_zh TEXT,
    grape_variety_ja TEXT,
    grape_variety_en TEXT,
    grape_variety_it TEXT,
    alcohol_content REAL,
    featured INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
  );

  CREATE TABLE IF NOT EXISTS wine_prices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    wine_id INTEGER NOT NULL,
    country_code TEXT NOT NULL,
    price REAL NOT NULL,
    currency TEXT DEFAULT 'CNY',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (wine_id) REFERENCES wines(id),
    UNIQUE(wine_id, country_code)
  );

  CREATE TABLE IF NOT EXISTS contact_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT NOT NULL,
    language TEXT DEFAULT 'zh',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS stories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title_zh TEXT NOT NULL,
    title_ja TEXT,
    title_en TEXT,
    title_it TEXT,
    content_zh TEXT NOT NULL,
    content_ja TEXT,
    content_en TEXT,
    content_it TEXT,
    image TEXT,
    sort_order INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    email TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS site_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    setting_key TEXT NOT NULL UNIQUE,
    setting_value_zh TEXT,
    setting_value_ja TEXT,
    setting_value_en TEXT,
    setting_value_it TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS countries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    name_zh TEXT NOT NULL,
    name_ja TEXT,
    name_en TEXT,
    name_it TEXT,
    currency TEXT DEFAULT 'CNY',
    symbol TEXT,
    exchange_rate REAL DEFAULT 1,
    active INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS uploads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

const categoryCount = db.prepare('SELECT COUNT(*) as count FROM categories').get() as { count: number };
if (categoryCount.count === 0) {
  const insertCategory = db.prepare(`
    INSERT INTO categories (slug, name_zh, name_ja, name_en, name_it, description_zh, description_ja, description_en, description_it, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertCategory.run('red', '红葡萄酒', '赤ワイン', 'Red Wine', 'Vino Rosso', '精选优质红葡萄酒', '最高品質赤ワイン', 'Premium red wines', 'Vini rossi premium', 1);
  insertCategory.run('white', '白葡萄酒', '白ワイン', 'White Wine', 'Vino Bianco', '清爽优雅的白葡萄酒', '爽やかでエレガントな白ワイン', 'Refreshing and elegant white wines', 'Vini bianchi raffinati', 2);
  insertCategory.run('sparkling', '起泡酒', 'スパークリングワイン', 'Sparkling Wine', 'Vino Spumante', '欢庆时刻的气泡佳酿', '祝日のスパークリングワイン', 'Celebration sparkling wines', 'Vini spumanti per festeggiare', 3);

  const insertWine = db.prepare(`
    INSERT INTO wines (category_id, name_zh, name_ja, name_en, name_it, description_zh, description_ja, description_en, description_it, image, price, year, region_zh, region_ja, region_en, region_it, grape_variety_zh, grape_variety_ja, grape_variety_en, grape_variety_it, alcohol_content, featured, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertWine.run(1, '古典赤霞珠', '古典カベルネソーヴィニヨン', 'Classic Cabernet Sauvignon', 'Cabernet Sauvignon Classico', '深沉的紫红色泽，散发出浓郁的黑醋栗和香草香气。单宁柔和，余味悠长。', '深い紫がかった赤色。黒いカシスとバニラのノート。タンニンは穏やかで、後味が長い。', 'Deep ruby red with rich blackcurrant and vanilla notes. Soft tannins, long finish.', 'Colore rosso rubino intenso con sentori di ribes nero e vaniglia. Tannini morbili, finale lungo.', '', 688, 2018, '波尔多, 法国', 'ボルドー, フランス', 'Bordeaux, France', 'Bordeaux, Francia', '赤霞珠', 'カベルネソーヴィニヨン', 'Cabernet Sauvignon', 'Cabernet Sauvignon', 14.5, 1, 1);
  insertWine.run(1, '珍藏梅洛', 'リザーブメルロー', 'Reserve Merlot', 'Merlot Riserva', '柔和的果香与细腻的单宁完美平衡。带有樱桃和巧克力的风味。', '穏やかな果実感と细腻なタンニンのバランス。さくらんとチョコレートの風味。', 'Well-balanced fruit and refined tannins with cherry and chocolate notes.', 'Frutta delicata e tannini raffinati con note di ciliegia e cioccolato.', '', 458, 2019, '勃艮第, 法国', 'ブルゴーニュ, フランス', 'Burgundy, France', ' Borgogna, Francia', '梅洛', 'メルロー', 'Merlot', 'Merlot', 13.5, 1, 2);
  insertWine.run(1, '经典黑皮诺', 'クラシックピノノワール', 'Classic Pinot Noir', 'Pinot Noir Classico', '优雅细腻的勃艮第风格，带有草莓和玫瑰的香气。', 'エレガントで细腻なブルゴーニュスタイル。いちご玫瑰のノート。', 'Elegant Burgundy style with strawberry and rose notes.', 'Stile Borgogna elegante con fragola e rosa.', '', 528, 2020, '勃艮第, 法国', 'ブルゴーニュ, フランス', 'Burgundy, France', ' Borgogna, Francia', '黑皮诺', 'ピノノワール', 'Pinot Noir', 'Pinot Noir', 13.0, 1, 3);
  insertWine.run(1, '托斯卡纳西拉', 'トスカーナシラー', 'Tuscan Syrah', 'Syrah Toscano', '浓郁的深色水果风味，伴有胡椒和皮革的复杂香气。', '濃厚なダークフルーツの風味。ペッパーやレザーの複雑なノート。', 'Intense dark fruit with pepper and leather notes.', 'Frutta scura intensa con pepe e pelle.', '', 758, 2017, '托斯卡纳, 意大利', 'トスカーナ, イタリア', 'Tuscany, Italy', 'Toscana, Italia', '西拉', 'シラー', 'Syrah', 'Syrah', 14.0, 0, 4);

  insertWine.run(2, '霞多丽干白', 'シャルドネ', 'Chardonnay', 'Chardonnay', '金黄色泽，带有柑橘和热带水果的香气，酸度适中。', 'ゴールデンイエロー。柑橘やトロピカルフルーティなノート。酸味はバランス良く。', 'Golden yellow with citrus and tropical fruit notes, balanced acidity.', 'Colore dorato con note agrumi e frutta tropicale, acidità equilibrata.', '', 368, 2021, '勃艮第, 法国', 'ブルゴーニュ, フランス', 'Burgundy, France', ' Borgogna, Francia', '霞多丽', 'シャルドネ', 'Chardonnay', 'Chardonnay', 12.5, 1, 1);
  insertWine.run(2, '长相思白', 'ソーヴィニヨンブラン', 'Sauvignon Blanc', 'Sauvignon Blanc', '清新爽脆，带有青苹果和百香果的香气。', '新鮮でシャキっとした口感。青いリンゴやパッションフルーツのノート。', 'Fresh and crisp with green apple and passion fruit notes.', 'Fresco e croccante con mela verde e frutto della passione.', '', 328, 2022, '卢瓦尔河谷, 法国', 'ロワール渓谷, フランス', 'Loire Valley, France', 'Valle della Loira, Francia', '长相思', 'ソーヴィニヨンブラン', 'Sauvignon Blanc', 'Sauvignon Blanc', 12.0, 1, 2);
  insertWine.run(2, '雷司令半干', 'リースリング', 'Riesling', 'Riesling', '优雅的矿物风味，带有桃子和蜂蜜的甜香。', 'エレガントなミネラル感。桃やハニースイートな香り。', 'Elegant mineral notes with peach and honey sweetness.', 'Note minerali eleganti con pesca e miele.', '', 428, 2021, '阿尔萨斯, 法国', 'アルザス, フランス', 'Alsace, France', 'Alsazia, Francia', '雷司令', 'リースリング', 'Riesling', 'Riesling', 12.5, 0, 3);

  insertWine.run(3, '年份香槟', 'ヴィンテージシャンパン', 'Vintage Champagne', 'Champagne Vintage', '细腻的气泡，烤面包和坚果的复杂风味。', '细腻な泡。ナッツやトーストの複雑な風味。', 'Fine bubbles with complex toasted bread and nut flavors.', 'Bollicine fini con complessi sentori di pane toastato e noci.', '', 1288, 2015, '香槟区, 法国', 'シャンパーニュ, フランス', 'Champagne Region, France', 'Regione Champagne, Francia', '霞多丽/黑皮诺', 'シャルドネ/ピノノワール', 'Chardonnay/Pinot Noir', 'Chardonnay/Pinot Noir', 12.0, 1, 1);
  insertWine.run(3, '普罗赛克起泡', 'プロセッコ', 'Prosecco', 'Prosecco', '清新果香，带有梨子和白花的香气。', '新鮮なフルーティさ。梨や白花のノート。', 'Fresh fruit aromas with pear and white flower notes.', 'Fruttato fresco con pera e fiori bianchi.', '', 268, 2022, '威尼托, 意大利', 'ヴェネト, イタリア', 'Veneto, Italy', 'Veneto, Italia', '格雷拉', 'プロセッコ', 'Glera', 'Glera', 11.0, 1, 2);
  insertWine.run(3, '卡瓦特酿', ' cava ', 'Cava Reserva', 'Cava Reserva', '坚果风味与清新酸度完美结合。', 'ナッツの風味と新鲜な酸度の完璧なバランス。', 'Perfect balance of nut flavors and fresh acidity.', 'Perfetto equilibrio tra note di noci e acidità fresca.', '', 198, 2020, '加泰罗尼亚, 西班牙', 'カタルーニャ, スペイン', 'Catalonia, Spain', 'Catalogna, Spagna', '马家婆/帕雷亚达', 'マカベオ/パレ亚达', 'Macabeo/Parellada', 'Macabeo/Parellada', 11.5, 0, 3);

  const insertStory = db.prepare(`
    INSERT INTO stories (title_zh, title_ja, title_en, title_it, content_zh, content_ja, content_en, content_it, image, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertStory.run('酒庄历史', 'ワイナリーの歴史', 'History', 'Storia della Cantina', '我们的酒庄创立于1892年，历经四代传承，始终坚持手工酿造的理念。每一瓶葡萄酒都承载着我们对大自然的敬畏和对品质的追求。', '私たちのワイナリーは1892年に設立されました。4世代にわたり継承され、常に手ディズ酿造の哲学を坚持しています。', 'Founded in 1892, our winery has been passed down through four generations, adhering to the philosophy of handcrafted winemaking.', 'La nostra cantina è stata fondata nel 1892, tramandata attraverso quattro generazioni, aderendo alla filosofia della vinificazione artigianale.', '', 1);
  insertStory.run('酿酒理念', '酿造理念', 'Winemaking Philosophy', 'Filosofia di Produzione', '我们相信好葡萄酒是种出来的。从葡萄园到酒瓶，每一个环节都倾注了我们的热情和专业。我们尊重风土条件，让葡萄自然表达其特色。', '良いワインは葡萄からできると信じています。葡萄園からボトルまで、すべての工程に情熱と専門知識を注いでいます。', 'We believe great wine is made in the vineyard. From vine to bottle, we pour passion and expertise into every step.', 'Crediamo che il grande vino si faccia in vigna. Dal vigneto alla bottiglia, mettiamo passione ed esperienza in ogni fase.', '', 2);
  
  const insertHero = db.prepare(`
    INSERT INTO home_heroes (title_zh, title_ja, title_en, title_it, subtitle_zh, subtitle_ja, subtitle_en, subtitle_it, image, theme, link, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertHero.run('岁月的馈赠', '歳月の贈り物', 'Gift of Time', 'Dono del Tempo', '源自百年酒庄的醇香佳酿，每一滴都诉说着时光的故事。', '百年ワイナリーから届いた極上の味、一滴一滴が時の物語を語る。', 'Premium vintages from a century-old winery, telling the story of time in every drop.', 'Vini pregiati da una cantina secolare.', '', 'from-stone-900 to-stone-950', '/wines/red', 1);
  insertHero.run('红韵流金', '深紅の輝き', 'Velvet & Gold', 'Velluto e Oro', '品味深邃与优雅的交响曲，感受单宁在舌尖的丝滑舞动。', '深みとエレガントのシンフォニー、舌の上で踊るタンニンを感じて。', 'A symphony of depth and elegance, feel the tannins dance on your palate.', 'Una sinfonia di profondità ed eleganza.', '', 'from-red-950 to-stone-950', '/wines/red', 2);
  insertHero.run('清冽之白', '清冽な白', 'Crisp & Pure', 'Fresco e Puro', '唤醒味蕾的清新果香，如山间清泉般纯净透亮。', '味覚を目覚めさせるフルーティさ、山の湧き水のように純粋で透明。', 'Fresh notes that awaken the palate, pure and clear like a mountain spring.', 'Note fresche che risvegliano il palato.', '', 'from-stone-800 to-slate-900', '/wines/white', 3);
}

const adminCount = db.prepare('SELECT COUNT(*) as count FROM admins').get() as { count: number };
if (adminCount.count === 0) {
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  try {
    db.prepare('INSERT INTO admins (username, password, email) VALUES (?, ?, ?)').run('admin', hashedPassword, 'admin@winehouse.com');
  } catch (e) {
    // Admin may already exist
  }
}

const countryCount = db.prepare('SELECT COUNT(*) as count FROM countries').get() as { count: number };
if (countryCount.count === 0) {
  const insertCountry = db.prepare(`
    INSERT INTO countries (code, name_zh, name_ja, name_en, name_it, currency, symbol, exchange_rate, active, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertCountry.run('CN', '中国', '中国', 'China', 'Cina', 'CNY', '¥', 1, 1, 1);
  insertCountry.run('JP', '日本', '日本', 'Japan', 'Giappone', 'JPY', '¥', 0.05, 1, 2);
  insertCountry.run('US', '美国', 'アメリカ', 'USA', 'USA', 'USD', '$', 0.14, 1, 3);
  insertCountry.run('IT', '意大利', 'イタリア', 'Italy', 'Italia', 'EUR', '€', 0.12, 1, 4);
  insertCountry.run('FR', '法国', 'フランス', 'France', 'Francia', 'EUR', '€', 0.12, 1, 5);
  insertCountry.run('GB', '英国', 'イギリス', 'UK', 'Regno Unito', 'GBP', '£', 0.10, 1, 6);
  insertCountry.run('AU', '澳大利亚', 'オーストラリア', 'Australia', 'Australia', 'AUD', 'A$', 0.15, 1, 7);
}

const settingsCount = db.prepare('SELECT COUNT(*) as count FROM site_settings').get() as { count: number };
if (settingsCount.count === 0) {
  const insertSetting = db.prepare(`
    INSERT INTO site_settings (setting_key, setting_value_zh, setting_value_ja, setting_value_en, setting_value_it)
    VALUES (?, ?, ?, ?, ?)
  `);
  insertSetting.run('site_name', 'Wine House', 'Wine House', 'Wine House', 'Wine House');
  insertSetting.run('site_description', '源自1892年的百年酒庄，传承匠心酿造', '1892年からの百年ワイナリー', 'Premium wines since 1892', 'Vini premium dal 1892');
  insertSetting.run('contact_email', 'info@winehouse.com', 'info@winehouse.jp', 'info@winehouse.com', 'info@winehouse.it');
  insertSetting.run('contact_phone', '+86 400-888-8888', '+81 3-1234-5678', '+1 555-123-4567', '+39 02 1234567');
  insertSetting.run('contact_address', '中国上海市静安区南京西路1888号', '東京都渋谷区神南1-2-3', '123 Wine Street, Napa Valley, CA', 'Via del Vino 123, Milano');
  insertSetting.run('footer_description', '源自1892年的百年酒庄，传承匠心酿造', '1892年からの百年ワイナリー、手ディズ酿造の伝統', 'Premium wines from a century-old winery since 1892', 'Vini premium da una cantina secolare dal 1892');
  insertSetting.run('site_logo', '/images/logo.png', '/images/logo.png', '/images/logo.png', '/images/logo.png');
  insertSetting.run('site_favicon', '/images/favicon.ico', '/images/favicon.ico', '/images/favicon.ico', '/images/favicon.ico');
}

export interface Wine {
  id: number;
  category_id: number;
  name_zh: string;
  name_ja: string;
  name_en: string;
  name_it: string;
  description_zh: string;
  description_ja: string;
  description_en: string;
  description_it: string;
  image: string;
  price: number;
  year: number;
  region_zh: string;
  region_ja: string;
  region_en: string;
  region_it: string;
  grape_variety_zh: string;
  grape_variety_ja: string;
  grape_variety_en: string;
  grape_variety_it: string;
  alcohol_content: number;
  featured: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  slug: string;
  name_zh: string;
  name_ja: string;
  name_en: string;
  name_it: string;
  description_zh: string;
  description_ja: string;
  description_en: string;
  description_it: string;
  image: string;
  sort_order: number;
}

export interface Hero {
  id: number;
  title_zh: string;
  title_ja: string;
  title_en: string;
  title_it: string;
  subtitle_zh: string;
  subtitle_ja: string;
  subtitle_en: string;
  subtitle_it: string;
  image: string;
  theme: string;
  link: string;
  sort_order: number;
}

export interface Story {
  id: number;
  title_zh: string;
  title_ja: string;
  title_en: string;
  title_it: string;
  content_zh: string;
  content_ja: string;
  content_en: string;
  content_it: string;
  image: string;
  sort_order: number;
}

export interface SiteSetting {
  id: number;
  setting_key: string;
  setting_value_zh: string;
  setting_value_ja: string;
  setting_value_en: string;
  setting_value_it: string;
  updated_at: string;
}

export interface Country {
  id: number;
  code: string;
  name_zh: string;
  name_ja: string;
  name_en: string;
  name_it: string;
  currency: string;
  symbol: string;
  exchange_rate: number;
  active: number;
  sort_order: number;
}

export interface Admin {
  id: number;
  username: string;
  password: string;
  email: string;
  created_at: string;
}

export interface Upload {
  id: number;
  filename: string;
  original_name: string;
  mime_type: string;
  size: number;
  created_at: string;
}
