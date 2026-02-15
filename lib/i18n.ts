export const locales = ['zh', 'ja', 'en', 'it'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'zh';

export const localeNames: Record<Locale, string> = {
  zh: '中文',
  ja: '日本語',
  en: 'English',
  it: 'Italiano',
};

export const localeFlags: Record<Locale, string> = {
  zh: '🇨🇳',
  ja: '🇯🇵',
  en: '🇬🇧',
  it: '🇮🇹',
};

export const translations = {
  zh: {
    nav: {
      home: '首页',
      wines: '红酒',
      story: '品牌故事',
      contact: '联系我们',
    },
    home: {
      heroTitle: '品鉴非凡红酒',
      heroSubtitle: '源自百年酒庄的醇香佳酿',
      exploreBtn: '探索我们的红酒',
      featured: '精选佳酿',
      categories: '探索分类',
      redWine: '红葡萄酒',
      whiteWine: '白葡萄酒',
      sparkling: '起泡酒',
    },
    wines: {
      title: '红酒列表',
      price: '价格',
      year: '年份',
      region: '产区',
      grape: '葡萄品种',
      alcohol: '酒精度',
      featured: '精选',
      viewDetails: '查看详情',
    },
    story: {
      title: '品牌故事',
      subtitle: '百年传承，匠心酿造',
    },
    contact: {
      title: '联系我们',
      subtitle: '期待与您的交流',
      name: '姓名',
      email: '邮箱',
      phone: '电话',
      message: '留言',
      submit: '提交',
      success: '提交成功！',
    },
    common: {
      learnMore: '了解更多',
    },
  },
  ja: {
    nav: {
      home: 'ホーム',
      wines: 'ワイン',
      story: 'ブランドストーリー',
      contact: 'お問い合わせ',
    },
    home: {
      heroTitle: '極上のワインを',
      heroSubtitle: '百年ワイナリーから届いた極上の味',
      exploreBtn: 'ワインを探す',
      featured: 'おすすめのワイン',
      categories: 'カテゴリー',
      redWine: '赤ワイン',
      whiteWine: '白ワイン',
      sparkling: 'スパークリング',
    },
    wines: {
      title: 'ワインリスト',
      price: '価格',
      year: 'ヴィンテージ',
      region: '産地',
      grape: 'ブドウ品種',
      alcohol: 'アルコール度数',
      featured: 'おすすめ',
      viewDetails: '詳細を見る',
    },
    story: {
      title: 'ブランドストーリー',
      subtitle: '百年传承、匠の酿造',
    },
    contact: {
      title: 'お問い合わせ',
      subtitle: '皆様からのご要望をお待ち致しております',
      name: 'お名前',
      email: 'メール',
      phone: '電話番号',
      message: 'メッセージ',
      submit: '送信',
      success: '送信完了！',
    },
    common: {
      learnMore: '詳細を見る',
    },
  },
  en: {
    nav: {
      home: 'Home',
      wines: 'Wines',
      story: 'Story',
      contact: 'Contact',
    },
    home: {
      heroTitle: 'Exceptional Wines',
      heroSubtitle: 'Premium vintages from a century-old winery',
      exploreBtn: 'Explore Our Wines',
      featured: 'Featured Wines',
      categories: 'Categories',
      redWine: 'Red Wine',
      whiteWine: 'White Wine',
      sparkling: 'Sparkling',
    },
    wines: {
      title: 'Wine List',
      price: 'Price',
      year: 'Vintage',
      region: 'Region',
      grape: 'Grape Variety',
      alcohol: 'Alcohol',
      featured: 'Featured',
      viewDetails: 'View Details',
    },
    story: {
      title: 'Our Story',
      subtitle: 'A century of heritage, crafted with passion',
    },
    contact: {
      title: 'Contact Us',
      subtitle: "We'd love to hear from you",
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      message: 'Message',
      submit: 'Submit',
      success: 'Submitted successfully!',
    },
    common: {
      learnMore: 'Learn More',
    },
  },
  it: {
    nav: {
      home: 'Home',
      wines: 'Vini',
      story: 'La Nostra Storia',
      contact: 'Contatti',
    },
    home: {
      heroTitle: 'Vini Straordinari',
      heroSubtitle: 'Vini pregiati da una cantina secolare',
      exploreBtn: 'Esplora i Nostri Vini',
      featured: 'Vini in Evidenza',
      categories: 'Categorie',
      redWine: 'Vino Rosso',
      whiteWine: 'Vino Bianco',
      sparkling: 'Spumante',
    },
    wines: {
      title: 'Elenco Vini',
      price: 'Prezzo',
      year: 'Annata',
      region: 'Regione',
      grape: 'Vitigno',
      alcohol: 'Gradazione',
      featured: 'In Evidenza',
      viewDetails: 'Dettagli',
    },
    story: {
      title: 'La Nostra Storia',
      subtitle: 'Un secolo di tradizione, creato con passione',
    },
    contact: {
      title: 'Contattaci',
      subtitle: 'Saremmo lieti di sentirvi',
      name: 'Nome',
      email: 'Email',
      phone: 'Telefono',
      message: 'Messaggio',
      submit: 'Invia',
      success: 'Inviato con successo!',
    },
    common: {
      learnMore: 'Scopri di più',
    },
  },
} as const;

export type TranslationKeys = typeof translations.zh;
