export const scriptSrcUrls = [
  'https://*.google-analytics.com',
  'https://identitytoolkit.googleapis.com',
  'https://*.hotjar.com',
  'https://*.storyblok.com',
  'https://*.newrelic.com',
  'https://*.nr-data.net',
  'https://*.crisp.chat',
  'https://*.googletagmanager.com',
  'https://vercel.live',
  'https://*.noembed.com',
  'https://*.youtube.com',
  'https://www.youtube.com',
  'https://*.googleapis.com',
  'https://noembed.com',
  'https://www.youtube.com',
  'https://*.hotjar.io',
  'https://*.rollbar.com',
  'https://*.simplybook.it',
  'https://*.zapier.com',
  'https://fonts.googleapis.com',
  'https://static.hotjar.com',
  'https://app.storyblok.com',
  'https://client.crisp.chat',
  process.env.NEXT_PUBLIC_API_URL,
  'wss://client.relay.crisp.chat',
];

export const childSrcUrls = ['blob:'];

export const workerSrcUrls = ['blob:', 'https://*.youtube.com'];
export const styleSrcUrls = [
  'https://fonts.googleapis.com',
  'https://static.hotjar.com',
  'https://app.storyblok.com',
  'https://client.crisp.chat',
  'https://*.google-analytics.com',
];
export const fontSrcUrls = [
  'https://fonts.gstatic.com',
  'https://*.hotjar.com',
  'https://*.crisp.chat',
  'https://*.youtube.com',
];
export const imgSrcUrls = [
  'data:',
  'https://*.hotjar.com',
  'https://*.storyblok.com',
  'https://*.crisp.chat',
  'https://*.googletagmanager.com',
];
export const connectSrcUrls = [
  'https://*.hotjar.io',
  'https://identitytoolkit.googleapis.com',
  'https://*.storyblok.com',
  'https://*.rollbar.com',
  'https://*.simplybook.it',
  'https://*.zapier.com',
  'https://*.nr-data.net',
  'wss://client.relay.crisp.chat',
  'https://*.crisp.chat',
  'https://*.google-analytics.com',
  'https://*.noembed.com',
  'https://*.googletagmanager.com',
  'https://*.googleapis.com',
  'https://*.noembed.com',
];
export const frameSrcUrls = [
  'https://*.hotjar.com',
  'https://*.storyblok.com',
  'https://*.crisp.chat',
  'https://*.simplybook.it',
  'https://*.youtube.com',
];
export const objectSrcUrls = ['none'];
export const baseUriUrls = ['self'];
export const formActionUrls = ['self'];
export const frameAncestorsUrls = ['self'];
//  default-src 'self';
//               script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.google-analytics.com https://identitytoolkit.googleapis.com https://*.hotjar.com https://*.storyblok.com https://*.newrelic.com https://*.nr-data.net https://*.crisp.chat https://*.googletagmanager.com https://vercel.live https://*.noembed.com https://*.youtube.com https://*.googleapis.com https://noembed.com;
//               child-src 'self' blob:;
//               worker-src 'self' blob: https://*.youtube.com;
//               style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://static.hotjar.com https://app.storyblok.com https://client.crisp.chat https://*.google-analytics.com;
//               font-src 'self' https://fonts.gstatic.com https://*.hotjar.com https://*.crisp.chat https://*.youtube.com;
//               img-src 'self' data: https://*.hotjar.com https://*.storyblok.com https://*.crisp.chat https://*.googletagmanager.com;
//               connect-src 'self' https://*.hotjar.io https://identitytoolkit.googleapis.com https://*.storyblok.com https://*.rollbar.com https://*.simplybook.it https://*.zapier.com https://*.nr-data.net ${process.env.NEXT_PUBLIC_API_URL} wss://client.relay.crisp.chat https://*.crisp.chat https://*.google-analytics.com https://*.noembed.com https://*.googletagmanager.com https://*.googleapis.com https://*.noembed.com;
//               frame-src 'self' https://*.hotjar.com https://*.storyblok.com https://*.crisp.chat https://*.simplybook.it https://*.youtube.com;
//               object-src 'none';
//               base-uri 'self';
//               form-action 'self';
//               frame-ancestors 'self';
