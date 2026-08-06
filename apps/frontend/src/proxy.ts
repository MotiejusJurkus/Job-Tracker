import { NextResponse, type NextRequest } from 'next/server';

import { getSafeLng, LANGUAGES } from '@/core/i18n/language';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocale = LANGUAGES.some((lng) => pathname === `/${lng}` || pathname.startsWith(`/${lng}/`));

  if (hasLocale) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();

  url.pathname = `/${getSafeLng('')}${pathname}`;

  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!_next|api|.*\\..*).*)'],
};
