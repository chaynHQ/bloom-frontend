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
  frameAncestorsUrls,
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
      // Content-Security-Policy Header: The Content-Security-Policy header is updated to include the necessary directives for Firebase API, Trengo widget, Rollbar, SimplyBook, and Zapier.
      // script-src: Allows scripts from the same origin, inline scripts, Google's APIs, Hotjar, Storyblok, and Trengo.
      // style-src: Allows styles from the same origin, inline styles, Google's Fonts API, Hotjar, Storyblok, and Trengo.
      // font-src: Allows fonts from the same origin and Google's Fonts API.
      // img-src: Allows images from the same origin, data URIs, Hotjar, Storyblok, and Trengo.
      // connect-src: Allows connections to the same origin, a specified API endpoint, Hotjar, Storyblok, Trengo, Firebase, Rollbar, SimplyBook, and Zapier.
      // frame-src: Allows frames from the same origin, Hotjar, Storyblok, and Trengo.
      // object-src: Disallows all object sources.
      // base-uri: Restricts the base URI to the same origin.
      // form-action: Restricts form actions to the same origin.
      // frame-ancestors: Restricts embedding to the same origin.
      async headers() {
        const buildCsp = ({ unsafeEval } = {}) =>
          `
            default-src 'self';
            script-src 'self' 'unsafe-inline' ${unsafeEval ? "'unsafe-eval' " : ''}${scriptSrcUrls.join(' ')};
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
            frame-ancestors ${frameAncestorsUrls.join(' ')};
            upgrade-insecure-requests;
          `
            .replace(/\s{2,}/g, ' ')
            .trim();

        const sharedHeaders = [
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
            value: 'SAMEORIGIN',
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
        ];

        return [
          {
            source: '/(.*)',
            headers: [
              { key: 'Content-Security-Policy', value: buildCsp() },
              ...sharedHeaders,
            ],
          },
          {
            // Trengo's widget uses Vue's standalone build, which requires 'unsafe-eval'.
            // The widget runs inside an iframe that loads /trengo.html, so the relaxed
            // CSP must apply there as well as on /messaging routes that host the iframe.
            // These rules must come AFTER the catch-all so they override it for matching paths.
            source: '/trengo.html',
            headers: [
              { key: 'Content-Security-Policy', value: buildCsp({ unsafeEval: true }) },
              ...sharedHeaders,
            ],
          },
          {
            source: '/:locale(en|es|de|fr|pt|hi)?/messaging/:path*',
            headers: [
              { key: 'Content-Security-Policy', value: buildCsp({ unsafeEval: true }) },
              ...sharedHeaders,
            ],
          },
          {
            source: '/:locale(en|es|de|fr|pt|hi)?/messaging',
            headers: [
              { key: 'Content-Security-Policy', value: buildCsp({ unsafeEval: true }) },
              ...sharedHeaders,
            ],
          },
        ];
      },
    }),
  ),
);
