/** @type {import('next').NextConfig} */

const withPWA = require('next-pwa');

module.exports = withPWA({
  reactStrictMode: true,
  publicRuntimeConfig: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    NEXT_PUBLIC_ENV: process.env.NEXT_PUBLIC_ENV,
    NEXT_PUBLIC_ROLLBAR_CLIENT_TOKEN: process.env.NEXT_PUBLIC_ROLLBAR_CLIENT_TOKEN,
    NEXT_PUBLIC_ROLLBAR_ENVIRONMENT: process.env.NEXT_PUBLIC_ROLLBAR_ENVIRONMENT,
    NEXT_PUBLIC_SIMPLYBOOK_WIDGET_URL: process.env.NEXT_PUBLIC_SIMPLYBOOK_WIDGET_URL,
    NEXT_PUBLIC_CRISP_WEBSITE_ID: process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID,
    NEXT_PUBLIC_HOTJAR_ID: process.env.NEXT_PUBLIC_HOTJAR_ID,
  },
  images: {
    domains: ['a.storyblok.com'],
  },
  i18n: {
    locales: ['en', 'es'],
    defaultLocale: 'en',
    localeDetection: false,
  },
  pwa: {
    dest: 'public',
    skipWaiting: true,
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/therapy/book-session',
        permanent: false,
      },
    ];
  },
});
