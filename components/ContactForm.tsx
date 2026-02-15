'use client';

import { useState } from 'react';
import { translations } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

interface ContactFormProps {
  locale: string;
  settings?: Record<string, string>;
}

export default function ContactForm({ locale, settings = {} }: ContactFormProps) {
  const t = translations[locale as keyof typeof translations];
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      message: formData.get('message'),
      language: locale,
    };

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setIsSuccess(true);
        (e.target as HTMLFormElement).reset();
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const email = settings.contact_email || 'info@winehouse.com';
  const phone = settings.contact_phone || '';
  const address = settings.contact_address || '';

  return (
    <div className="flex flex-col">
      <div className="bg-stone-900 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t.contact.title}</h1>
          <p className="text-xl text-stone-300">{t.contact.subtitle}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">{t.contact.title}</CardTitle>
            </CardHeader>
            <CardContent>
              {isSuccess ? (
                <div className="text-center py-8">
                  <div className="text-5xl mb-4">OK</div>
                  <h3 className="text-xl font-semibold mb-2">{t.contact.success}</h3>
                  <Button onClick={() => setIsSuccess(false)} variant="outline" className="mt-4">
                    {locale === 'zh' ? '发送另一条' : locale === 'ja' ? '別のメッセージ' : locale === 'en' ? 'Send Another' : 'Invia un altro'}
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t.contact.name} *</Label>
                    <Input id="name" name="name" required className="w-full" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t.contact.email} *</Label>
                    <Input id="email" name="email" type="email" required className="w-full" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t.contact.phone}</Label>
                    <Input id="phone" name="phone" type="tel" className="w-full" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">{t.contact.message} *</Label>
                    <Textarea id="message" name="message" required rows={5} className="w-full" />
                  </div>
                  <Button type="submit" className="w-full bg-red-700 hover:bg-red-800" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        ...
                        {locale === 'zh' ? '提交中...' : locale === 'ja' ? '送信中...' : locale === 'en' ? 'Sending...' : 'Invio...'}
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Send className="h-4 w-4" />
                        {t.contact.submit}
                      </span>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          <div className="space-y-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Mail className="h-5 w-5 text-red-700" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Email</h3>
                      <p className="text-stone-600">{email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Phone className="h-5 w-5 text-red-700" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{t.contact.phone}</h3>
                      <p className="text-stone-600">{phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-5 w-5 text-red-700" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{locale === 'zh' ? '地址' : locale === 'ja' ? '住所' : locale === 'en' ? 'Address' : 'Indirizzo'}</h3>
                      <p className="text-stone-600">{address}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
