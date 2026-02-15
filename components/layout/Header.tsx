'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Globe } from 'lucide-react';
import { locales, localeNames } from '@/lib/i18n';

interface HeaderProps {
  locale: string;
  t: {
    nav: {
      home: string;
      wines: string;
      story: string;
      contact: string;
    };
  };
  siteName?: string;
  siteLogo?: string;
}

export function Header({ locale, t, siteName = 'Wine House', siteLogo }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { href: `/${locale}/`, label: t.nav.home },
    { href: `/${locale}/wines/red`, label: t.nav.wines },
    { href: `/${locale}/story`, label: t.nav.story },
    { href: `/${locale}/contact`, label: t.nav.contact },
  ];

  const switchLocale = (newLocale: string) => {
    const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/';
    router.push(`/${newLocale}${pathWithoutLocale}`);
  };

  const currentPath = pathname;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href={`/${locale}/`} className="flex items-center space-x-2">
          {siteLogo ? (
            <img src={siteLogo} alt={siteName} className="h-10 w-auto object-contain" />
          ) : (
            <>
              <span className="text-xl font-bold text-red-800">W</span>
              <span className="text-xl font-bold hidden sm:inline-block">{siteName}</span>
            </>
          )}
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium transition-colors hover:text-red-800 ${
                currentPath === item.href || (item.href !== `/${locale}/` && currentPath.startsWith(item.href))
                  ? 'text-red-800'
                  : 'text-muted-foreground'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Globe className="h-5 w-5" />
                <span className="sr-only">Switch language</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {locales.map((loc) => (
                <DropdownMenuItem
                  key={loc}
                  onClick={() => switchLocale(loc)}
                  className={locale === loc ? 'bg-accent' : ''}
                >
                  {localeNames[loc]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col space-y-4 mt-8">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`text-lg font-medium ${currentPath === item.href ? 'text-red-800' : ''}`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
