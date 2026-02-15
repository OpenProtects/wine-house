import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { locales, defaultLocale, type Locale } from './lib/i18n';

function getLocale(request: NextRequest): Locale {
  const pathname = request.nextUrl.pathname;
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  if (pathnameIsMissingLocale) {
    const browserLocale = request.headers.get('accept-language');
    if (browserLocale) {
      const preferredLocale = browserLocale
        .split(',')
        .map((lang) => lang.split(';')[0].trim().toLowerCase());
      
      for (const lang of preferredLocale) {
        if (lang.startsWith('zh')) return 'zh';
        if (lang.startsWith('ja')) return 'ja';
        if (lang.startsWith('en')) return 'en';
        if (lang.startsWith('it')) return 'it';
      }
    }
    return defaultLocale;
  }

  const locale = pathname.split('/')[1] as Locale;
  return locales.includes(locale) ? locale : defaultLocale;
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  if (pathnameIsMissingLocale) {
    const locale = getLocale(request);
    return NextResponse.redirect(
      new URL(`/${locale}${pathname}`, request.url)
    );
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
