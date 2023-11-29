/** @type {import('next').NextConfig} */

const runtimeCaching = require('next-pwa/cache');

const withPWA = require('next-pwa')({
  dest: 'public',
  runtimeCaching,
  buildExcludes: [/middleware-manifest.json$/],
});

module.exports = withPWA({
  reactStrictMode: true,
  publicRuntimeConfig: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    NEXT_PUBLIC_VERCEL_BRANCH_URL: process.env.NEXT_PUBLIC_VERCEL_BRANCH_URL,
    NEXT_PUBLIC_ENV: process.env.NEXT_PUBLIC_ENV,
    NEXT_PUBLIC_ROLLBAR_CLIENT_TOKEN: process.env.NEXT_PUBLIC_ROLLBAR_CLIENT_TOKEN,
    NEXT_PUBLIC_SIMPLYBOOK_WIDGET_URL: process.env.NEXT_PUBLIC_SIMPLYBOOK_WIDGET_URL,
    NEXT_PUBLIC_CRISP_WEBSITE_ID: process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID,
    NEXT_PUBLIC_HOTJAR_ID: process.env.NEXT_PUBLIC_HOTJAR_ID,
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID: process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID,
  },
  images: {
    domains: ['a.storyblok.com'],
  },
  i18n: {
    locales: ['en', 'es', 'hi', 'fr', 'pt', 'de'],
    defaultLocale: 'en',
    localeDetection: true,
  },
  async redirects() {
    return [
      {
        source: '/welcome',
        destination: '/courses',
        permanent: false,
      },
      {
        source: '/login',
        destination: '/courses',
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/welcome/(b|B)(a|A)(d|D)(o|O)(o|O)',
        destination: '/welcome/badoo',
      },
      {
        source: '/welcome/(b|B)(u|U)(m|M)(b|B)(l|L)(e|E)',
        destination: '/welcome/bumble',
      },
      {
        source: '/welcome/(f|F)(r|R)(u|U)(i|I)(t|T)(z|Z)',
        destination: '/welcome/fruitz',
      },
    ];
  },
});
