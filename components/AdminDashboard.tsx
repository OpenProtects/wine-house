'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { translations } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2, Eye, LogOut, Save, Lock, Users, BookOpen, Upload, Loader2 } from 'lucide-react';
import { defaultWinePlaceholder, defaultStoryPlaceholder } from '@/lib/defaults';

interface Wine {
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
}

interface Category {
  id: number;
  slug: string;
  name_zh: string;
  name_ja: string;
  name_en: string;
  name_it: string;
}

interface Country {
  id: number;
  code: string;
  name_zh: string;
  name_en: string;
  currency: string;
  symbol: string;
}

interface WinePrice {
  id: number;
  wine_id: number;
  country_code: string;
  price: number;
  currency: string;
}

interface Setting {
  setting_key: string;
  setting_value_zh: string;
  setting_value_ja: string;
  setting_value_en: string;
  setting_value_it: string;
}

interface Admin {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

interface Story {
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

const TRANSLATIONS = {
  ja: { name: '日本語', code: 'ja' },
  en: { name: 'English', code: 'en' },
  it: { name: 'Italiano', code: 'it' },
};

export default function AdminDashboard({ locale }: { locale: string }) {
  const router = useRouter();
  const t = translations[locale as keyof typeof translations];
  const [wines, setWines] = useState<Wine[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [settings, setSettings] = useState<Setting[]>([]);
  const [winePrices, setWinePrices] = useState<WinePrice[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [heroes, setHeroes] = useState<any[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [translating, setTranslating] = useState(false);

  const [wineDialogOpen, setWineDialogOpen] = useState(false);
  const [priceDialogOpen, setPriceDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [storyDialogOpen, setStoryDialogOpen] = useState(false);
  const [heroDialogOpen, setHeroDialogOpen] = useState(false);
  const [selectedHero, setSelectedHero] = useState<any>(null);
  const [selectedWine, setSelectedWine] = useState<Wine | null>(null);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [selectedWineId, setSelectedWineId] = useState<number | null>(null);

  const [wineForm, setWineForm] = useState({
    category_id: 1,
    name_zh: '', name_ja: '', name_en: '', name_it: '',
    description_zh: '', description_ja: '', description_en: '', description_it: '',
    image: '',
    region_zh: '', region_ja: '', region_en: '', region_it: '',
    grape_variety_zh: '', grape_variety_ja: '', grape_variety_en: '', grape_variety_it: '',
    price: 0, year: 2024, alcohol_content: 13,
    featured: 0, sort_order: 0
  });

  const [storyForm, setStoryForm] = useState({
    title_zh: '', title_ja: '', title_en: '', title_it: '',
    content_zh: '', content_ja: '', content_en: '', content_it: '',
    image: '', sort_order: 0
  });

  const [heroForm, setHeroForm] = useState({
    title_zh: '', title_ja: '', title_en: '', title_it: '',
    subtitle_zh: '', subtitle_ja: '', subtitle_en: '', subtitle_it: '',
    image: '', theme: 'from-stone-900 to-stone-950', link: '/wines/red', sort_order: 0
  });

  const [priceForm, setPriceForm] = useState({
    country_code: 'CN', price: 0, currency: 'CNY'
  });

  const [settingsForms, setSettingsForms] = useState<Record<string, { zh: string; ja: string; en: string; it: string }>>({});

  const [adminForm, setAdminForm] = useState({ username: '', password: '', email: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [adminError, setAdminError] = useState('');
  const [adminSuccess, setAdminSuccess] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const faviconFileInputRef = useRef<HTMLInputElement>(null);
  const storyFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/admin/auth');
      const data = await res.json();
      if (data.authenticated) {
        setIsAuthenticated(true);
        loadData();
      }
    } catch (e) {
      console.error('Auth check failed:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    const [winesRes, categoriesRes, countriesRes, messagesRes, settingsRes, adminsRes, storiesRes, heroesRes] = await Promise.all([
      fetch('/api/wines').then(r => r.json()),
      fetch('/api/categories').then(r => r.json()),
      fetch('/api/admin/prices').then(r => r.json()),
      fetch('/api/contact').then(r => r.json()),
      fetch('/api/admin/settings').then(r => r.json()),
      fetch('/api/admin/manage').then(r => r.json()),
      fetch('/api/admin/stories').then(r => r.json()),
      fetch('/api/admin/heroes').then(r => r.json())
    ]);
    setWines(winesRes);
    setCategories(categoriesRes);
    setCountries(countriesRes);
    setMessages(messagesRes);
    setSettings(settingsRes);
    setAdmins(adminsRes);
    setStories(storiesRes);
    setHeroes(heroesRes);

    const settingsMap: Record<string, { zh: string; ja: string; en: string; it: string }> = {};
    settingsRes.forEach((s: Setting) => {
      settingsMap[s.setting_key] = {
        zh: s.setting_value_zh || '',
        ja: s.setting_value_ja || '',
        en: s.setting_value_en || '',
        it: s.setting_value_it || ''
      };
    });
    setSettingsForms(settingsMap);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'wine' | 'story') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      
      if (data.success) {
        if (type === 'wine') {
          setWineForm({ ...wineForm, image: data.url });
        } else {
          setStoryForm({ ...storyForm, image: data.url });
        }
      }
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const translateText = async (text: string, targetLang: string): Promise<string> => {
    try {
      const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=zh|${targetLang}`);
      const data = await res.json();
      return data.responseData?.translatedText || text;
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    }
  };

  const autoTranslate = async (type: 'wine' | 'story') => {
    setTranslating(true);
    
    try {
      if (type === 'wine' && wineForm.name_zh) {
        const [jaName, enName, itName] = await Promise.all([
          translateText(wineForm.name_zh, 'ja'),
          translateText(wineForm.name_zh, 'en'),
          translateText(wineForm.name_zh, 'it'),
        ]);

        const [jaDesc, enDesc, itDesc] = await Promise.all([
          translateText(wineForm.description_zh, 'ja'),
          translateText(wineForm.description_zh, 'en'),
          translateText(wineForm.description_zh, 'it'),
        ]);

        const [jaRegion, enRegion, itRegion] = wineForm.region_zh ? await Promise.all([
          translateText(wineForm.region_zh, 'ja'),
          translateText(wineForm.region_zh, 'en'),
          translateText(wineForm.region_zh, 'it'),
        ]) : ['', '', ''];

        const [jaGrape, enGrape, itGrape] = wineForm.grape_variety_zh ? await Promise.all([
          translateText(wineForm.grape_variety_zh, 'ja'),
          translateText(wineForm.grape_variety_zh, 'en'),
          translateText(wineForm.grape_variety_zh, 'it'),
        ]) : ['', '', ''];

        setWineForm({
          ...wineForm,
          name_ja: jaName, name_en: enName, name_it: itName,
          description_ja: jaDesc, description_en: enDesc, description_it: itDesc,
          region_ja: jaRegion, region_en: enRegion, region_it: itRegion,
          grape_variety_ja: jaGrape, grape_variety_en: enGrape, grape_variety_it: itGrape,
        });
      }

      if (type === 'story' && storyForm.title_zh) {
        const [jaTitle, enTitle, itTitle] = await Promise.all([
          translateText(storyForm.title_zh, 'ja'),
          translateText(storyForm.title_zh, 'en'),
          translateText(storyForm.title_zh, 'it'),
        ]);

        const [jaContent, enContent, itContent] = await Promise.all([
          translateText(storyForm.content_zh, 'ja'),
          translateText(storyForm.content_zh, 'en'),
          translateText(storyForm.content_zh, 'it'),
        ]);

        setStoryForm({
          ...storyForm,
          title_ja: jaTitle, title_en: enTitle, title_it: itTitle,
          content_ja: jaContent, content_en: enContent, content_it: itContent,
        });
      }
    } catch (error) {
      console.error('Auto-translate error:', error);
    } finally {
      setTranslating(false);
    }
  };

  const handleLogout = async () => {
    document.cookie = 'admin_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    router.push(`/${locale}/admin/login`);
  };

  const handleSaveWine = async () => {
    const method = selectedWine ? 'PUT' : 'POST';
    const body = selectedWine ? { ...wineForm, id: selectedWine.id } : wineForm;
    
    await fetch('/api/wines', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    setWineDialogOpen(false);
    loadData();
  };

  const handleDeleteWine = async (id: number) => {
    if (confirm('Are you sure you want to delete this wine?')) {
      await fetch(`/api/wines?id=${id}`, { method: 'DELETE' });
      loadData();
    }
  };

  const openWineDialog = (wine?: Wine) => {
    if (wine) {
      setSelectedWine(wine);
      setWineForm({
        category_id: wine.category_id,
        name_zh: wine.name_zh, name_ja: wine.name_ja || '', name_en: wine.name_en || '', name_it: wine.name_it || '',
        description_zh: wine.description_zh, description_ja: wine.description_ja || '', description_en: wine.description_en || '', description_it: wine.description_it || '',
        image: wine.image || '',
        region_zh: wine.region_zh || '', region_ja: wine.region_ja || '', region_en: wine.region_en || '', region_it: wine.region_it || '',
        grape_variety_zh: wine.grape_variety_zh || '', grape_variety_ja: wine.grape_variety_ja || '', grape_variety_en: wine.grape_variety_en || '', grape_variety_it: wine.grape_variety_it || '',
        price: wine.price, year: wine.year, alcohol_content: wine.alcohol_content,
        featured: wine.featured, sort_order: wine.sort_order
      });
    } else {
      setSelectedWine(null);
      setWineForm({
        category_id: 1,
        name_zh: '', name_ja: '', name_en: '', name_it: '',
        description_zh: '', description_ja: '', description_en: '', description_it: '',
        image: '',
        region_zh: '', region_ja: '', region_en: '', region_it: '',
        grape_variety_zh: '', grape_variety_ja: '', grape_variety_en: '', grape_variety_it: '',
        price: 0, year: 2024, alcohol_content: 13,
        featured: 0, sort_order: 0
      });
    }
    setWineDialogOpen(true);
  };

  const openPriceDialog = async (wineId: number) => {
    setSelectedWineId(wineId);
    const res = await fetch(`/api/admin/prices?wine_id=${wineId}`);
    const prices = await res.json();
    setWinePrices(prices);
    setPriceDialogOpen(true);
  };

  const handleSavePrice = async () => {
    if (!selectedWineId) return;
    await fetch('/api/admin/prices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wine_id: selectedWineId, ...priceForm })
    });
    const res = await fetch(`/api/admin/prices?wine_id=${selectedWineId}`);
    setWinePrices(await res.json());
  };

  const handleSaveSettings = async () => {
    for (const [key, value] of Object.entries(settingsForms)) {
      const existingSetting = settings.find(s => s.setting_key === key);
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          setting_key: key, 
          setting_value_zh: value.zh || existingSetting?.setting_value_zh || '',
          setting_value_ja: value.ja || existingSetting?.setting_value_ja || '',
          setting_value_en: value.en || existingSetting?.setting_value_en || '',
          setting_value_it: value.it || existingSetting?.setting_value_it || ''
        })
      });
    }
    setSettingsDialogOpen(false);
  };

  const handleAddAdmin = async () => {
    setAdminError('');
    setAdminSuccess('');
    
    if (!adminForm.username || !adminForm.password) {
      setAdminError('Username and password are required');
      return;
    }

    const res = await fetch('/api/admin/manage', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...adminForm, type: 'addAdmin' })
    });

    const data = await res.json();
    if (res.ok) {
      setAdminSuccess('Admin added successfully');
      setAdminForm({ username: '', password: '', email: '' });
      loadData();
    } else {
      setAdminError(data.error);
    }
  };

  const handleDeleteAdmin = async (id: number) => {
    if (confirm('Are you sure you want to delete this admin?')) {
      await fetch('/api/admin/manage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, type: 'deleteAdmin' })
      });
      loadData();
    }
  };

  const handleChangePassword = async () => {
    setAdminError('');
    setAdminSuccess('');

    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setAdminError('All password fields are required');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setAdminError('Passwords do not match');
      return;
    }

    const res = await fetch('/api/admin/manage', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword, type: 'changePassword' })
    });

    const data = await res.json();
    if (res.ok) {
      setAdminSuccess('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordDialogOpen(false), 1500);
    } else {
      setAdminError(data.error);
    }
  };

  const handleSaveStory = async () => {
    const method = selectedStory ? 'PUT' : 'POST';
    const body = selectedStory ? { ...storyForm, id: selectedStory.id } : storyForm;
    
    await fetch('/api/admin/stories', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    setStoryDialogOpen(false);
    loadData();
  };

  const handleDeleteStory = async (id: number) => {
    if (confirm('Are you sure you want to delete this story?')) {
      await fetch(`/api/admin/stories?id=${id}`, { method: 'DELETE' });
      loadData();
    }
  };

  const handleDeleteHero = async (id: number) => {
    if (confirm('Are you sure you want to delete this hero?')) {
      await fetch(`/api/admin/heroes?id=${id}`, { method: 'DELETE' });
      loadData();
    }
  };

  const openHeroDialog = (hero?: any) => {
    if (hero) {
      setSelectedHero(hero);
      setHeroForm({
        title_zh: hero.title_zh, title_ja: hero.title_ja || '', title_en: hero.title_en || '', title_it: hero.title_it || '',
        subtitle_zh: hero.subtitle_zh, subtitle_ja: hero.subtitle_ja || '', subtitle_en: hero.subtitle_en || '', subtitle_it: hero.subtitle_it || '',
        image: hero.image || '', theme: hero.theme || 'from-stone-900 to-stone-950', link: hero.link || '/wines/red', sort_order: hero.sort_order
      });
    } else {
      setSelectedHero(null);
      setHeroForm({
        title_zh: '', title_ja: '', title_en: '', title_it: '',
        subtitle_zh: '', subtitle_ja: '', subtitle_en: '', subtitle_it: '',
        image: '', theme: 'from-stone-900 to-stone-950', link: '/wines/red', sort_order: heroes.length
      });
    }
    setHeroDialogOpen(true);
  };

  const handleSaveHero = async () => {
    const method = selectedHero ? 'PUT' : 'POST';
    await fetch('/api/admin/heroes', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(selectedHero ? { id: selectedHero.id, ...heroForm } : heroForm)
    });
    setHeroDialogOpen(false);
    loadData();
  };

  const openStoryDialog = (story?: Story) => {
    if (story) {
      setSelectedStory(story);
      setStoryForm({
        title_zh: story.title_zh, title_ja: story.title_ja || '', title_en: story.title_en || '', title_it: story.title_it || '',
        content_zh: story.content_zh, content_ja: story.content_ja || '', content_en: story.content_en || '', content_it: story.content_it || '',
        image: story.image || '', sort_order: story.sort_order
      });
    } else {
      setSelectedStory(null);
      setStoryForm({
        title_zh: '', title_ja: '', title_en: '', title_it: '',
        content_zh: '', content_ja: '', content_en: '', content_it: '',
        image: '', sort_order: 0
      });
    }
    setStoryDialogOpen(true);
  };

  const getCategoryName = (categoryId: number) => {
    const cat = categories.find(c => c.id === categoryId);
    if (!cat) return '-';
    return (cat as any)[`name_${locale}`] || cat.name_zh;
  };

  const getCountryName = (code: string) => {
    const country = countries.find(c => c.code === code);
    if (!country) return code;
    return (country as any)[`name_${locale}`] || country.name_zh;
  };

  const labels = {
    zh: { title: 'Admin Dashboard', logout: 'Logout', wines: 'Wines', messages: 'Messages', settings: 'Settings', admins: 'Admins', stories: 'Stories', hero: 'Hero' },
    ja: { title: '管理ダッシュボード', logout: 'ログアウト', wines: 'ワイン', messages: 'メッセージ', settings: '設定', admins: '管理者', stories: 'ストーリー', hero: 'ヒーロー' },
    en: { title: 'Admin Dashboard', logout: 'Logout', wines: 'Wines', messages: 'Messages', settings: 'Settings', admins: 'Admins', stories: 'Stories', hero: 'Hero' },
    it: { title: 'Dashboard Admin', logout: 'Esci', wines: 'Vini', messages: 'Messaggi', settings: 'Impostazioni', admins: 'Amministratori', stories: 'Storie', hero: 'Eroe' }
  };

  const l = labels[locale as keyof typeof labels] || labels.zh;

  if (loading || !isAuthenticated) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="bg-stone-900 text-white py-4 px-6 flex justify-between items-center">
        <h1 className="text-xl font-bold">{l.title}</h1>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" className="border-white text-white bg-transparent" onClick={() => setPasswordDialogOpen(true)}>
            <Lock className="h-4 w-4 mr-2" />
            Password
          </Button>
          <Link href={`/${locale}/`}>
            <Button variant="outline" size="sm" className="border-white text-white bg-transparent">
              <Eye className="h-4 w-4 mr-2" />
              View Site
            </Button>
          </Link>
          <Button variant="outline" size="sm" className="border-white text-white bg-transparent" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            {l.logout}
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="wines" className="w-full">
          <TabsList className="mb-6 flex flex-wrap">
            <TabsTrigger value="heroes">{l.hero || 'Hero'}</TabsTrigger>
            <TabsTrigger value="wines">{l.wines}</TabsTrigger>
            <TabsTrigger value="stories">{l.stories}</TabsTrigger>
            <TabsTrigger value="messages">{l.messages}</TabsTrigger>
            <TabsTrigger value="settings">{l.settings}</TabsTrigger>
            <TabsTrigger value="admins">{l.admins}</TabsTrigger>
          </TabsList>

          <TabsContent value="heroes">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{l.hero || 'Hero'}</CardTitle>
                <Button className="bg-red-700 hover:bg-red-800" onClick={() => openHeroDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Hero
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Image</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Theme</TableHead>
                      <TableHead>Sort</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {heroes.map((hero) => (
                      <TableRow key={hero.id}>
                        <TableCell>{hero.id}</TableCell>
                        <TableCell>
                          <div className="w-12 h-12 relative rounded overflow-hidden">
                            <Image src={hero.image || defaultWinePlaceholder} alt={hero.title_zh} fill className="object-cover" />
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{locale === 'zh' ? hero.title_zh : locale === 'ja' ? hero.title_ja : locale === 'en' ? hero.title_en : hero.title_it}</TableCell>
                        <TableCell><Badge variant="outline">{hero.theme}</Badge></TableCell>
                        <TableCell>{hero.sort_order}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openHeroDialog(hero)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-red-600" onClick={() => handleDeleteHero(hero.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wines">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{l.wines}</CardTitle>
                <Button className="bg-red-700 hover:bg-red-800" onClick={() => openWineDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Wine
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Image</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Year</TableHead>
                      <TableHead>Prices</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {wines.map((wine) => (
                      <TableRow key={wine.id}>
                        <TableCell>{wine.id}</TableCell>
                        <TableCell>
                          <div className="w-12 h-12 relative rounded overflow-hidden">
                            <Image src={wine.image || defaultWinePlaceholder} alt={wine.name_zh} fill className="object-cover" />
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{locale === 'zh' ? wine.name_zh : locale === 'ja' ? wine.name_ja : locale === 'en' ? wine.name_en : wine.name_it}</TableCell>
                        <TableCell><Badge variant="outline">{getCategoryName(wine.category_id)}</Badge></TableCell>
                        <TableCell>${wine.price}</TableCell>
                        <TableCell>{wine.year}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => openPriceDialog(wine.id)}>
                            Manage
                          </Button>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openWineDialog(wine)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-red-600" onClick={() => handleDeleteWine(wine.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stories">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{l.stories}</CardTitle>
                <Button className="bg-red-700 hover:bg-red-800" onClick={() => openStoryDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Story
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Image</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Sort Order</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stories.map((story) => (
                      <TableRow key={story.id}>
                        <TableCell>{story.id}</TableCell>
                        <TableCell>
                          <div className="w-12 h-12 relative rounded overflow-hidden">
                            <Image src={story.image || defaultStoryPlaceholder} alt={story.title_zh} fill className="object-cover" />
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{locale === 'zh' ? story.title_zh : locale === 'ja' ? story.title_ja : locale === 'en' ? story.title_en : story.title_it}</TableCell>
                        <TableCell>{story.sort_order}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openStoryDialog(story)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-red-600" onClick={() => handleDeleteStory(story.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages">
            <Card>
              <CardHeader><CardTitle>{l.messages}</CardTitle></CardHeader>
              <CardContent>
                {messages.length === 0 ? (
                  <p className="text-stone-500 text-center py-8">No messages</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {messages.map((msg) => (
                        <TableRow key={msg.id}>
                          <TableCell>{msg.id}</TableCell>
                          <TableCell>{msg.name}</TableCell>
                          <TableCell>{msg.email}</TableCell>
                          <TableCell className="max-w-md truncate">{msg.message}</TableCell>
                          <TableCell>{new Date(msg.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="text-red-600" onClick={async () => {
                              if (confirm('Are you sure you want to delete this message?')) {
                                await fetch(`/api/contact?id=${msg.id}`, { method: 'DELETE' });
                                loadData();
                              }
                            }}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{l.settings}</CardTitle>
                <Button className="bg-red-700 hover:bg-red-800" onClick={() => setSettingsDialogOpen(true)}>
                  <Save className="h-4 w-4 mr-2" />
                  Edit Settings
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {settings.map((s) => (
                  <div key={s.setting_key} className="p-4 bg-white rounded-lg border">
                    <Label className="font-semibold">{s.setting_key}</Label>
                    <p className="text-stone-600 mt-1">{(s as any)[`setting_value_${locale}`] || s.setting_value_zh}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="admins">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{l.admins}</CardTitle>
                <Button className="bg-red-700 hover:bg-red-800" onClick={() => setAdminDialogOpen(true)}>
                  <Users className="h-4 w-4 mr-2" />
                  Add Admin
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {admins.map((admin) => (
                      <TableRow key={admin.id}>
                        <TableCell>{admin.id}</TableCell>
                        <TableCell className="font-medium">{admin.username}</TableCell>
                        <TableCell>{admin.email || '-'}</TableCell>
                        <TableCell>{new Date(admin.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="text-red-600" onClick={() => handleDeleteAdmin(admin.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={wineDialogOpen} onOpenChange={setWineDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedWine ? 'Edit Wine' : 'Add New Wine'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={String(wineForm.category_id)} onValueChange={(v) => setWineForm({ ...wineForm, category_id: Number(v) })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={String(cat.id)}>{cat.name_zh}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Year</Label>
                <Input type="number" value={wineForm.year} onChange={(e) => setWineForm({ ...wineForm, year: Number(e.target.value) })} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Name (Chinese) *</Label>
                <Button type="button" variant="outline" size="sm" onClick={() => autoTranslate('wine')} disabled={translating || !wineForm.name_zh}>
                  {translating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Auto Translate
                </Button>
              </div>
              <Input value={wineForm.name_zh} onChange={(e) => setWineForm({ ...wineForm, name_zh: e.target.value })} placeholder="Chinese name" />
              <Input value={wineForm.name_ja} onChange={(e) => setWineForm({ ...wineForm, name_ja: e.target.value })} placeholder="Japanese name" />
              <Input value={wineForm.name_en} onChange={(e) => setWineForm({ ...wineForm, name_en: e.target.value })} placeholder="English name" />
              <Input value={wineForm.name_it} onChange={(e) => setWineForm({ ...wineForm, name_it: e.target.value })} placeholder="Italian name" />
            </div>

            <div className="space-y-2">
              <Label>Description (Chinese)</Label>
              <Textarea value={wineForm.description_zh} onChange={(e) => setWineForm({ ...wineForm, description_zh: e.target.value })} rows={3} placeholder="Chinese description" />
              <Textarea value={wineForm.description_ja} onChange={(e) => setWineForm({ ...wineForm, description_ja: e.target.value })} rows={3} placeholder="Japanese description" />
              <Textarea value={wineForm.description_en} onChange={(e) => setWineForm({ ...wineForm, description_en: e.target.value })} rows={3} placeholder="English description" />
              <Textarea value={wineForm.description_it} onChange={(e) => setWineForm({ ...wineForm, description_it: e.target.value })} rows={3} placeholder="Italian description" />
            </div>

            <div className="space-y-2">
              <Label>Region</Label>
              <Input value={wineForm.region_zh} onChange={(e) => setWineForm({ ...wineForm, region_zh: e.target.value })} placeholder="Region (Chinese)" />
              <Input value={wineForm.region_ja} onChange={(e) => setWineForm({ ...wineForm, region_ja: e.target.value })} placeholder="Region (Japanese)" />
              <Input value={wineForm.region_en} onChange={(e) => setWineForm({ ...wineForm, region_en: e.target.value })} placeholder="Region (English)" />
              <Input value={wineForm.region_it} onChange={(e) => setWineForm({ ...wineForm, region_it: e.target.value })} placeholder="Region (Italian)" />
            </div>

            <div className="space-y-2">
              <Label>Grape Variety</Label>
              <Input value={wineForm.grape_variety_zh} onChange={(e) => setWineForm({ ...wineForm, grape_variety_zh: e.target.value })} placeholder="Grape (Chinese)" />
              <Input value={wineForm.grape_variety_ja} onChange={(e) => setWineForm({ ...wineForm, grape_variety_ja: e.target.value })} placeholder="Grape (Japanese)" />
              <Input value={wineForm.grape_variety_en} onChange={(e) => setWineForm({ ...wineForm, grape_variety_en: e.target.value })} placeholder="Grape (English)" />
              <Input value={wineForm.grape_variety_it} onChange={(e) => setWineForm({ ...wineForm, grape_variety_it: e.target.value })} placeholder="Grape (Italian)" />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Price (CNY)</Label>
                <Input type="number" value={wineForm.price} onChange={(e) => setWineForm({ ...wineForm, price: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>Alcohol %</Label>
                <Input type="number" step="0.1" value={wineForm.alcohol_content} onChange={(e) => setWineForm({ ...wineForm, alcohol_content: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>Sort Order</Label>
                <Input type="number" value={wineForm.sort_order} onChange={(e) => setWineForm({ ...wineForm, sort_order: Number(e.target.value) })} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Image</Label>
              <div className="flex gap-2">
                <Input value={wineForm.image} onChange={(e) => setWineForm({ ...wineForm, image: e.target.value })} placeholder="Image URL" className="flex-1" />
                <input type="file" ref={fileInputRef} onChange={(e) => handleImageUpload(e, 'wine')} accept="image/*" className="hidden" />
                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </div>
              {wineForm.image && (
                <div className="mt-2 w-24 h-24 relative rounded overflow-hidden">
                  <Image src={wineForm.image} alt="Preview" fill className="object-cover" />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="featured" checked={wineForm.featured === 1} onChange={(e) => setWineForm({ ...wineForm, featured: e.target.checked ? 1 : 0 })} />
              <Label htmlFor="featured">Featured</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWineDialogOpen(false)}>Cancel</Button>
            <Button className="bg-red-700 hover:bg-red-800" onClick={handleSaveWine}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={storyDialogOpen} onOpenChange={setStoryDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedStory ? 'Edit Story' : 'Add New Story'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Title (Chinese) *</Label>
                <Button type="button" variant="outline" size="sm" onClick={() => autoTranslate('story')} disabled={translating || !storyForm.title_zh}>
                  {translating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Auto Translate
                </Button>
              </div>
              <Input value={storyForm.title_zh} onChange={(e) => setStoryForm({ ...storyForm, title_zh: e.target.value })} placeholder="Chinese title" />
              <Input value={storyForm.title_ja} onChange={(e) => setStoryForm({ ...storyForm, title_ja: e.target.value })} placeholder="Japanese title" />
              <Input value={storyForm.title_en} onChange={(e) => setStoryForm({ ...storyForm, title_en: e.target.value })} placeholder="English title" />
              <Input value={storyForm.title_it} onChange={(e) => setStoryForm({ ...storyForm, title_it: e.target.value })} placeholder="Italian title" />
            </div>

            <div className="space-y-2">
              <Label>Content (Chinese) *</Label>
              <Textarea value={storyForm.content_zh} onChange={(e) => setStoryForm({ ...storyForm, content_zh: e.target.value })} rows={4} placeholder="Chinese content" />
              <Textarea value={storyForm.content_ja} onChange={(e) => setStoryForm({ ...storyForm, content_ja: e.target.value })} rows={4} placeholder="Japanese content" />
              <Textarea value={storyForm.content_en} onChange={(e) => setStoryForm({ ...storyForm, content_en: e.target.value })} rows={4} placeholder="English content" />
              <Textarea value={storyForm.content_it} onChange={(e) => setStoryForm({ ...storyForm, content_it: e.target.value })} rows={4} placeholder="Italian content" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Image</Label>
                <div className="flex gap-2">
                  <Input value={storyForm.image} onChange={(e) => setStoryForm({ ...storyForm, image: e.target.value })} placeholder="Image URL" className="flex-1" />
                  <input type="file" ref={storyFileInputRef} onChange={(e) => handleImageUpload(e, 'story')} accept="image/*" className="hidden" />
                  <Button type="button" variant="outline" onClick={() => storyFileInputRef.current?.click()}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                </div>
                {storyForm.image && (
                  <div className="mt-2 w-24 h-24 relative rounded overflow-hidden">
                    <Image src={storyForm.image} alt="Preview" fill className="object-cover" />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label>Sort Order</Label>
                <Input type="number" value={storyForm.sort_order} onChange={(e) => setStoryForm({ ...storyForm, sort_order: Number(e.target.value) })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStoryDialogOpen(false)}>Cancel</Button>
            <Button className="bg-red-700 hover:bg-red-800" onClick={handleSaveStory}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={heroDialogOpen} onOpenChange={setHeroDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedHero ? 'Edit Hero' : 'Add New Hero'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title (Chinese) *</Label>
              <Input value={heroForm.title_zh} onChange={(e) => setHeroForm({ ...heroForm, title_zh: e.target.value })} placeholder="Chinese title" />
              <Input value={heroForm.title_ja} onChange={(e) => setHeroForm({ ...heroForm, title_ja: e.target.value })} placeholder="Japanese title" />
              <Input value={heroForm.title_en} onChange={(e) => setHeroForm({ ...heroForm, title_en: e.target.value })} placeholder="English title" />
              <Input value={heroForm.title_it} onChange={(e) => setHeroForm({ ...heroForm, title_it: e.target.value })} placeholder="Italian title" />
            </div>

            <div className="space-y-2">
              <Label>Subtitle (Chinese) *</Label>
              <Textarea value={heroForm.subtitle_zh} onChange={(e) => setHeroForm({ ...heroForm, subtitle_zh: e.target.value })} rows={3} placeholder="Chinese subtitle" />
              <Textarea value={heroForm.subtitle_ja} onChange={(e) => setHeroForm({ ...heroForm, subtitle_ja: e.target.value })} rows={3} placeholder="Japanese subtitle" />
              <Textarea value={heroForm.subtitle_en} onChange={(e) => setHeroForm({ ...heroForm, subtitle_en: e.target.value })} rows={3} placeholder="English subtitle" />
              <Textarea value={heroForm.subtitle_it} onChange={(e) => setHeroForm({ ...heroForm, subtitle_it: e.target.value })} rows={3} placeholder="Italian subtitle" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Image</Label>
                <div className="flex gap-2">
                  <Input value={heroForm.image} onChange={(e) => setHeroForm({ ...heroForm, image: e.target.value })} placeholder="Image URL" className="flex-1" />
                  <input type="file" ref={fileInputRef} onChange={(e) => handleImageUpload(e, 'wine')} accept="image/*" className="hidden" />
                  <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                </div>
                {heroForm.image && (
                  <div className="mt-2 w-24 h-24 relative rounded overflow-hidden">
                    <Image src={heroForm.image} alt="Preview" fill className="object-cover" />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label>Sort Order</Label>
                <Input type="number" value={heroForm.sort_order} onChange={(e) => setHeroForm({ ...heroForm, sort_order: Number(e.target.value) })} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Theme (CSS gradient)</Label>
                <Input value={heroForm.theme} onChange={(e) => setHeroForm({ ...heroForm, theme: e.target.value })} placeholder="from-stone-900 to-stone-950" />
              </div>
              <div className="space-y-2">
                <Label>Link URL</Label>
                <Input value={heroForm.link} onChange={(e) => setHeroForm({ ...heroForm, link: e.target.value })} placeholder="/wines/red" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setHeroDialogOpen(false)}>Cancel</Button>
            <Button className="bg-red-700 hover:bg-red-800" onClick={handleSaveHero}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={priceDialogOpen} onOpenChange={setPriceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Country Prices</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex gap-2">
              <Select value={priceForm.country_code} onValueChange={(v) => setPriceForm({ ...priceForm, country_code: v })}>
                <SelectTrigger className="flex-1"><SelectValue placeholder="Country" /></SelectTrigger>
                <SelectContent>
                  {countries.map(c => (
                    <SelectItem key={c.code} value={c.code}>{c.name_zh} ({c.code})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input type="number" placeholder="Price" className="flex-1" value={priceForm.price} onChange={(e) => setPriceForm({ ...priceForm, price: Number(e.target.value) })} />
              <Button onClick={handleSavePrice}>Add</Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Country</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {winePrices.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{getCountryName(p.country_code)}</TableCell>
                    <TableCell>{p.price}</TableCell>
                    <TableCell>{p.currency}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="text-red-600" onClick={async () => {
                        await fetch(`/api/admin/prices?id=${p.id}`, { method: 'DELETE' });
                        const res = await fetch(`/api/admin/prices?wine_id=${selectedWineId}`);
                        setWinePrices(await res.json());
                      }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <DialogFooter>
            <Button onClick={() => setPriceDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Site Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            {Object.entries(settingsForms).map(([key, values]) => (
              <div key={key} className="space-y-2 p-4 bg-stone-50 rounded-lg">
                <Label className="font-semibold">{key}</Label>
                {(key === 'site_logo' || key === 'site_favicon') ? (
                  <div className="flex gap-2">
                    <Input placeholder="Image URL" value={values.zh} onChange={(e) => setSettingsForms({ ...settingsForms, [key]: { ...values, zh: e.target.value, ja: e.target.value, en: e.target.value, it: e.target.value } })} className="flex-1" />
                    <input 
                      type="file" 
                      ref={key === 'site_logo' ? logoFileInputRef : faviconFileInputRef} 
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const formData = new FormData();
                        formData.append('file', file);
                        const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
                        const data = await res.json();
                        if (data.url) {
                          setSettingsForms({ ...settingsForms, [key]: { ...values, zh: data.url, ja: data.url, en: data.url, it: data.url } });
                        }
                      }} 
                      accept="image/*" 
                      className="hidden" 
                    />
                    <Button type="button" variant="outline" onClick={() => (key === 'site_logo' ? logoFileInputRef : faviconFileInputRef).current?.click()}>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                  </div>
                ) : (
                  <>
                    <Input placeholder="Chinese" value={values.zh} onChange={(e) => setSettingsForms({ ...settingsForms, [key]: { ...values, zh: e.target.value } })} />
                    <Input placeholder="Japanese" value={values.ja} onChange={(e) => setSettingsForms({ ...settingsForms, [key]: { ...values, ja: e.target.value } })} />
                    <Input placeholder="English" value={values.en} onChange={(e) => setSettingsForms({ ...settingsForms, [key]: { ...values, en: e.target.value } })} />
                    <Input placeholder="Italian" value={values.it} onChange={(e) => setSettingsForms({ ...settingsForms, [key]: { ...values, it: e.target.value } })} />
                  </>
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSettingsDialogOpen(false)}>Cancel</Button>
            <Button className="bg-red-700 hover:bg-red-800" onClick={handleSaveSettings}>Save All</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={adminDialogOpen} onOpenChange={setAdminDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Admin</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {adminError && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">{adminError}</div>}
            {adminSuccess && <div className="p-3 text-sm text-green-600 bg-green-50 rounded-md">{adminSuccess}</div>}
            <div className="space-y-2">
              <Label>Username *</Label>
              <Input value={adminForm.username} onChange={(e) => setAdminForm({ ...adminForm, username: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Password *</Label>
              <Input type="password" value={adminForm.password} onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={adminForm.email} onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdminDialogOpen(false)}>Cancel</Button>
            <Button className="bg-red-700 hover:bg-red-800" onClick={handleAddAdmin}>Add Admin</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {adminError && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">{adminError}</div>}
            {adminSuccess && <div className="p-3 text-sm text-green-600 bg-green-50 rounded-md">{adminSuccess}</div>}
            <div className="space-y-2">
              <Label>Current Password *</Label>
              <Input type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>New Password *</Label>
              <Input type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Confirm New Password *</Label>
              <Input type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPasswordDialogOpen(false)}>Cancel</Button>
            <Button className="bg-red-700 hover:bg-red-800" onClick={handleChangePassword}>Change Password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
