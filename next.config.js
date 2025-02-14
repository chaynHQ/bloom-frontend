/**
 * @type {import('next').NextConfig}
 */
const runtimeCaching = require('next-pwa/cache');
const withNextIntl = require('next-intl/plugin')();

const withPWA = require('next-pwa')({
  dest: 'public',
  runtimeCaching,
  buildExcludes: ['app-build-manifest.json'],
  disable: process.env.NODE_ENV === 'development',
});

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(
  withNextIntl(
    withPWA({
      reactStrictMode: true,
      publicRuntimeConfig: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
        NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
        NEXT_PUBLIC_VERCEL_BRANCH_URL: process.env.NEXT_PUBLIC_VERCEL_BRANCH_URL,
        NEXT_PUBLIC_ENV: process.env.NEXT_PUBLIC_ENV,
        NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
        NEXT_PUBLIC_ROLLBAR_CLIENT_TOKEN: process.env.NEXT_PUBLIC_ROLLBAR_CLIENT_TOKEN,
        NEXT_PUBLIC_SIMPLYBOOK_WIDGET_URL: process.env.NEXT_PUBLIC_SIMPLYBOOK_WIDGET_URL,
        NEXT_PUBLIC_CRISP_WEBSITE_ID: process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID,
        NEXT_PUBLIC_HOTJAR_ID: process.env.NEXT_PUBLIC_HOTJAR_ID,
        NEXT_PUBLIC_GOOGLE_ANALYTICS_ID: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID,
        NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID: process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID,
      },
      compiler: {
        emotion: true,
      },
      images: {
        domains: ['a.storyblok.com'],
      },
      serverExternalPackages: ['newrelic'],
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
          {
            source: '/partnership/:path*',
            destination: '/welcome/:path*',
            permanent: true,
          },
          {
            source: '/chat',
            destination: '/messaging',
            permanent: true,
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
      // Content-Security-Policy Header: The Content-Security-Policy header is updated to include the necessary directives for Firebase API, Crisp iframes, Rollbar, SimplyBook, and Zapier.
      // script-src: Allows scripts from the same origin, inline scripts, Google's APIs, Hotjar, Storyblok, and Crisp.
      // style-src: Allows styles from the same origin, inline styles, Google's Fonts API, Hotjar, Storyblok, and Crisp.
      // font-src: Allows fonts from the same origin and Google's Fonts API.
      // img-src: Allows images from the same origin, data URIs, Hotjar, Storyblok, and Crisp.
      // connect-src: Allows connections to the same origin, a specified API endpoint, Hotjar, Storyblok, Crisp, Firebase, Rollbar, SimplyBook, and Zapier.
      // frame-src: Allows frames from the same origin, Hotjar, Storyblok, and Crisp.
      // object-src: Disallows all object sources.
      // base-uri: Restricts the base URI to the same origin.
      // form-action: Restricts form actions to the same origin.
      // frame-ancestors: Restricts embedding to the same origin.
      async headers() {
        const headers = [
          {
            source: '/:path',
            headers: [
              {
                key: 'Content-Security-Policy',
                value: `
                  default-src 'self';
                  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://apis.google.com https://static.hotjar.com https://script.hotjar.com https://app.storyblok.com https://widget.crisp.chat https://js-agent.newrelic.com *.nr-data.net;
                  child-src 'self';
                  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://static.hotjar.com https://app.storyblok.com https://widget.crisp.chat;
                  font-src 'self' https://fonts.gstatic.com;
                  img-src 'self' data: https://static.hotjar.com https://app.storyblok.com https://image.storyblok.com https://widget.crisp.chat;
                  connect-src 'self' https://*.hotjar.com wss://*.hotjar.com https://api.storyblok.com https://app.storyblok.com https://connect.crisp.chat https://*.firebaseapp.com https://api.rollbar.com https://*.simplybook.it https://hooks.zapier.com *.nr-data.net ${process.env.NEXT_PUBLIC_API_URL};
                  frame-src 'self' https://vars.hotjar.com https://app.storyblok.com https://widget.crisp.chat https://*.crisp.chat https://*.simplybook.it;
                  object-src 'none';
                  base-uri 'self';
                  form-action 'self';
                  frame-ancestors 'self';
                `
                  .replace(/\s{2,}/g, ' ')
                  .trim(),
              },
              {
                key: 'Referrer-Policy',
                value: 'origin-when-cross-origin',
              },
              {
                key: 'X-Content-Type-Options',
                value: 'nosniff',
              },
            ],
          },
        ];
        // This enforces HTTPS for all requests so we don't want this for local development
        if (process.env.NODE_ENV === 'production') {
          headers[0].headers.push({
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          });
        }

        return headers;
      },
    }),
  ),
);
