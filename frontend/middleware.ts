import { NextRequest, NextResponse } from 'next/server';
import { supportedLanguages, defaultLanguage } from '@/lib/i18n';

export function middleware(request: NextRequest) {
  // Get the pathname from the request
  const pathname = request.nextUrl.pathname;

  // Check if the pathname already has a locale
  const pathnameHasLocale = supportedLanguages.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return;

  // Get the preferred locale from the request headers
  const acceptLanguage = request.headers.get('accept-language');
  let locale = defaultLanguage;

  if (acceptLanguage) {
    // Parse the accept-language header
    const preferredLocales = acceptLanguage
      .split(',')
      .map((lang) => lang.split(';')[0].trim().toLowerCase())
      .map((lang) => lang.split('-')[0]); // Get the base language code

    // Find the first supported locale
    for (const preferredLocale of preferredLocales) {
      if (supportedLanguages.includes(preferredLocale as any)) {
        locale = preferredLocale as any;
        break;
      }
    }
  }

  // Redirect to the locale-specific path
  const newUrl = new URL(`/${locale}${pathname}`, request.url);
  return NextResponse.redirect(newUrl);
}

export const config = {
  matcher: [
    // Skip all internal paths (_next)
    '/((?!_next|api|favicon.ico|locales).*)',
  ],
}; 