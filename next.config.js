/**
 * @type {import('next').NextConfig}
 */
const runtimeCaching = require('next-pwa/cache');
const {
  scriptSrcUrls,
  workerSrcUrls,
  styleSrcUrls,
  fontSrcUrls,
  imgSrcUrls,
  connectSrcUrls,
  frameSrcUrls,
  mediaSrcUrls,
} = require('./scriptUrls');
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
      compiler: {
        emotion: true,
      },
      images: {
        remotePatterns: [{ protocol: 'https', hostname: 'a.storyblok.com' }],
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
            source: '/:locale(en|es|de|fr|pt|hi)/welcome',
            destination: '/:locale/courses',
            permanent: false,
          },
          {
            source: '/login',
            destination: '/courses',
            permanent: false,
          },
          {
            source: '/:locale(en|es|de|fr|pt|hi)/login',
            destination: '/:locale/courses',
            permanent: false,
          },
          {
            source: '/partnership/:path*',
            destination: '/welcome/:path*',
            permanent: true,
          },
          {
            source: '/:locale(en|es|de|fr|pt|hi)/partnership/:path*',
            destination: '/:locale/welcome/:path*',
            permanent: true,
          },
          {
            source: '/chat',
            destination: '/messaging',
            permanent: true,
          },
          {
            source: '/:locale(en|es|de|fr|pt|hi)/chat',
            destination: '/:locale/messaging',
            permanent: true,
          },
          {
            source: '/about-our-courses',
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
        return [
          {
            source: '/(.*)',
            headers: [
              {
                key: 'Content-Security-Policy',
                value: `
                  default-src 'self';
                  script-src 'self' 'unsafe-inline' ${scriptSrcUrls.join(' ')};
                  child-src 'self' blob:;
                  worker-src 'self' ${workerSrcUrls.join(' ')};
                  style-src 'self' 'unsafe-inline' ${styleSrcUrls.join(' ')};
                  font-src 'self' ${fontSrcUrls.join(' ')};
                  img-src 'self' data: ${imgSrcUrls.join(' ')};
                  media-src 'self' ${mediaSrcUrls.join(' ')};
                  connect-src 'self' ${connectSrcUrls.join(' ')};
                  frame-src 'self' ${frameSrcUrls.join(' ')};
                  object-src 'none';
                  base-uri 'self';
                  form-action 'self';
                  frame-ancestors 'self';
                  upgrade-insecure-requests;
                `
                  .replace(/\s{2,}/g, ' ')
                  .trim(),
              },
              {
                key: 'Referrer-Policy',
                value: 'strict-origin-when-cross-origin',
              },
              {
                key: 'X-Content-Type-Options',
                value: 'nosniff',
              },
              {
                key: 'X-Frame-Options',
                value: 'DENY',
              },
              {
                key: 'X-XSS-Protection',
                value: '1; mode=block',
              },
              {
                key: 'Permissions-Policy',
                value:
                  'camera=(), microphone=(), geolocation=(), usb=(), bluetooth=(), payment=(), accelerometer=(), gyroscope=(), magnetometer=(), ambient-light-sensor=(), autoplay=(self "https://www.youtube-nocookie.com" "https://www.youtube.com")',
              },
              {
                key: 'Cross-Origin-Opener-Policy',
                value: 'same-origin-allow-popups',
              },
              ...(process.env.NODE_ENV === 'production'
                ? [
                    {
                      key: 'Strict-Transport-Security',
                      value: 'max-age=31536000; includeSubDomains; preload',
                    },
                  ]
                : []),
            ],
          },
        ];
      },
    }),
  ),
);
