import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { COOKIE_LOCALE_NAME, defaultLocale, locales } from './i18n.config';

function getLocaleAndRouteSegment(locales: Array<string>, currentLocale: string, pathname: string) {
  let locale;

  let [, urlLocale, routeSegment] = pathname.split('/');

  if (urlLocale && locales.includes(urlLocale)) {
    locale = urlLocale;
  }

  if (!locale) {
    locale = currentLocale;
    routeSegment = urlLocale;
  }

  return [locale, routeSegment];
}

// This is temporal until all segements are migrated to app router
// Any segment migrated to app router needs to be included here
const isAnAppRoute = (routeSegment: string) => {
  const appRoutes = ['approutetest'];
  return appRoutes.includes(routeSegment);
};

// We need to handle the locale here as we cannot use a [locale] segment as it colides
// with the [slug] one that is in pages throwing an next.js error
// Using a header as it detects the locale in the first request
export default async function middleware(request: NextRequest) {
  const currentLocale = request.cookies.get(COOKIE_LOCALE_NAME)?.value || defaultLocale;

  const pathname = request.nextUrl.href.replace(request.nextUrl.origin, '');

  const [locale, routeSegment] = getLocaleAndRouteSegment(locales, currentLocale, pathname);

  if (!isAnAppRoute(routeSegment as string) && !pathname.startsWith(`/${locale}`)) {
    const url = request.nextUrl.clone();
    url.locale = locale;
    const response = NextResponse.redirect(url);
    response.cookies.set(COOKIE_LOCALE_NAME, locale);
    return response;
  }

  let response = NextResponse.next();

  // Create and call the next-intl middleware only if we are in an app route segment
  // so the next-intl app route configuration is applied
  if (isAnAppRoute(routeSegment as string)) {
    const handleI18nRouting = createMiddleware({
      locales,
      defaultLocale: 'null',
      localeDetection: true,
      localePrefix: 'never',
    });

    response = handleI18nRouting(request);

    // Also handle the cookie to be consistent with next approach
    const hasOutdatedCookie = request.cookies.get(COOKIE_LOCALE_NAME)?.value !== locale;

    if (hasOutdatedCookie) {
      response.cookies.set(COOKIE_LOCALE_NAME, locale ?? currentLocale);
    }
  }

  return response;
}

export const config = {
  // Skip all paths that should not be internationalized
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)', '/'],
};
