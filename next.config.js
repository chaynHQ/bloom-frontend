/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  publicRuntimeConfig: {
    API_URL: process.env.API_URL,
    BASE_URL: process.env.BASE_URL,
    NEXT_PUBLIC_ROLLBAR_CLIENT_TOKEN: process.env.NEXT_PUBLIC_ROLLBAR_CLIENT_TOKEN,
    NEXT_PUBLIC_ROLLBAR_ENVIRONMENT: process.env.NEXT_PUBLIC_ROLLBAR_ENVIRONMENT,
  },
  i18n: {
    locales: ['en', 'es'],
    defaultLocale: 'en',
    localeDetection: false,
  },
};
