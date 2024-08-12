import { getStoryblokApi } from '@storyblok/react';
import createMiddleware from 'next-intl/middleware';
import { ResponseCookies } from 'next/dist/compiled/@edge-runtime/cookies';
import { NextRequest, NextResponse } from 'next/server';
import { storyblok } from './config/storyblok';
import {
  COOKIE_LOCALE_NAME,
  COOKIE_LOCALE_PATH,
  defaultLocale,
  Locale,
  locales,
} from './i18n/config';

// Init storyblok
storyblok;

function getLocaleAndRouteSegment(locales: Array<string>, currentLocale: string, pathname: string) {
  let locale;

  let [, urlLocale, ...rest] = pathname.split('/');

  let routeSegment = rest.join('/');

  if (urlLocale && locales.includes(urlLocale)) {
    locale = urlLocale;
  }

  if (!locale) {
    locale = currentLocale;
    routeSegment = urlLocale;
  }

  if (!routeSegment) {
    routeSegment = '/';
  }

  const routeSegmentWithoutQueryParams = routeSegment.split('?')[0];

  return [locale, routeSegmentWithoutQueryParams];
}

function isParentWithoutPageRoute(routeSegment: string) {
  return [
    'account',
    'admin',
    'auth',
    'partner-admin',
    'partnership',
    'subscription',
    'therapy',
  ].includes(routeSegment);
}

function isNonStoryblokRoute(routeSegment: string) {
  const isValid = [
    '500',
    '404',
    '/',
    'account/about-you',
    'account/apply-a-code',
    'account/disable-service-emails',
    'account/settings',
    'admin/dashboard',
    'auth/login',
    'auth/register',
    'auth/reset-password',
    'partner-admin/create-access-code',
    'therapy/book-session',
    'therapy/confirmed-session',
    'action-handler',
  ].includes(routeSegment);
  return isValid;
}

async function isStoryblokRoute(routeSegment: string) {
  const storyblokApi = getStoryblokApi();
  const { data } = await storyblokApi.get('cdn/links/', { published: true });

  const links = Object.values(data.links);
  const isValid = links.some((link) => (link as any).slug === routeSegment);
  return isValid;
}
// This is temporary until all segments are migrated to app router
// Not found nextjs logic doesn't work due to having two different intl approaches/configurations
// we need to check if the page is valid to redirect to 404
async function isValidRoute(routeSegment: string) {
  if (isParentWithoutPageRoute(routeSegment)) return false;
  if (isNonStoryblokRoute(routeSegment)) return true;

  const isValid = await isStoryblokRoute(routeSegment);
  return isValid;
}

// This is temporal until all segements are migrated to app router
// Any segment migrated to app router needs to be included here
const isAnAppRoute = (routeSegment: string) => {
  const appRoutes = ['meet-the-team'];
  return appRoutes.includes(routeSegment);
};

const setCookie = (cookies: ResponseCookies, locale: Locale) => {
  cookies.set(COOKIE_LOCALE_NAME, locale, { path: COOKIE_LOCALE_PATH });
};

// We need to handle the locale here as we cannot use a [locale] segment as it colides
// with the [slug] one that is in pages throwing an next.js error
export default async function middleware(request: NextRequest) {
  const currentLocale = request.cookies.get(COOKIE_LOCALE_NAME)?.value || defaultLocale;

  const pathname = request.nextUrl.href.replace(request.nextUrl.origin, '');

  const [locale, routeSegment] = getLocaleAndRouteSegment(locales, currentLocale, pathname);

  const isValid = await isValidRoute(routeSegment as string);
  if (!isValid) {
    const url = request.nextUrl.clone();
    url.locale = locale;
    url.pathname = '404';
    const response = NextResponse.redirect(url);
    setCookie(response.cookies, locale);
    return response;
  }

  if (!isAnAppRoute(routeSegment as string) && !pathname.startsWith(`/${locale}`)) {
    const url = request.nextUrl.clone();
    url.locale = locale;
    const response = NextResponse.redirect(url);
    setCookie(response.cookies, locale);
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
  }

  // Also handle the cookie to be consistent with next approach
  const hasOutdatedCookie = currentLocale !== locale;

  if (hasOutdatedCookie) {
    setCookie(response.cookies, locale);
  }

  return response;
}

export const config = {
  // Skip all paths that should not be internationalized
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)', '/'],
};
