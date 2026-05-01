const API_URL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:35001'
    : `https://${new URL(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:35001').hostname}`;

const scriptSrcUrls = [
  API_URL,
  'https://*.google-analytics.com',
  'https://identitytoolkit.googleapis.com',
  'https://*.hotjar.com',
  'https://*.storyblok.com',
  'https://*.newrelic.com',
  'https://*.nr-data.net',
  'https://*.googletagmanager.com',
  'https://vercel.live',
  'https://*.noembed.com',
  'https://*.youtube.com',
  'https://www.youtube.com',
  'https://*.googleapis.com',
  'https://noembed.com',
  'https://www.youtube.com',
  'https://i.ytimg.com',
  'https://*.hotjar.io',
  'https://*.rollbar.com',
  'https://*.simplybook.it',
  'https://widget.simplybook.it',
  'https://*.zapier.com',
  'https://fonts.googleapis.com',
  'https://static.hotjar.com',
  'https://app.storyblok.com',
  'https://apis.google.com',
  'https://va.vercel-scripts.com/',
  'https://www.google.com/recaptcha/',
  'https://www.gstatic.com/recaptcha/',
];

const childSrcUrls = ['blob:'];

const workerSrcUrls = ['blob:', 'https://*.youtube.com'];
const styleSrcUrls = [
  'https://fonts.googleapis.com',
  'https://static.hotjar.com',
  'https://app.storyblok.com',
  'https://*.google-analytics.com',
];
const fontSrcUrls = ['https://fonts.gstatic.com', 'https://*.hotjar.com', 'https://*.youtube.com'];
const imgSrcUrls = [
  'blob:',
  'https://*.hotjar.com',
  'https://*.storyblok.com',
  'https://*.googletagmanager.com',
  'https://i.ytimg.com',
  'https://cdnjs.cloudflare.com/',
];
const connectSrcUrls = [
  API_URL,
  process.env.NEXT_PUBLIC_API_URL
    ? `wss://${new URL(process.env.NEXT_PUBLIC_API_URL).hostname}`
    : 'ws://localhost:35001',
  'https://*.hotjar.com',
  'https://*.hotjar.io',
  'wss://ws.hotjar.com',
  'https://*.googletagmanager.com',
  'https://*.googleapis.com',
  'https://*.google-analytics.com',
  'https://identitytoolkit.googleapis.com',
  'https://*.storyblok.com',
  'https://*.rollbar.com',
  'https://*.simplybook.it',
  'https://*.zapier.com',
  'https://*.nr-data.net',
  'ws://localhost:35001',
  'https://sessions.bugsnag.com/',
  'https://*.noembed.com',
  'https://noembed.com',
  'https://*.youtube.com',
  'https://www.youtube.com',
  'https://i.ytimg.com',
  'https://vercel.live',
  'https://cdnjs.cloudflare.com/ajax/libs/twemoji/',
  'https://www.google.com/recaptcha/',
  'https://www.gstatic.com/recaptcha/',
];
const frameSrcUrls = [
  'https://*.hotjar.com',
  'https://*.storyblok.com',
  'https://*.simplybook.it',
  'https://*.youtube.com',
  'https://www.youtube-nocookie.com/',
  'https://vercel.live',
  'https://*.firebaseapp.com',
  'https://www.google.com/recaptcha/',
  'https://www.gstatic.com/recaptcha/',
];
const mediaSrcUrls = ['blob:', 'https://*.storyblok.com', 'https://a.storyblok.com'];
const objectSrcUrls = ['none'];
const baseUriUrls = ['self'];
const formActionUrls = ['self'];
const frameAncestorsUrls = ["'self'", 'https://app.storyblok.com'];

module.exports = {
  scriptSrcUrls,
  childSrcUrls,
  workerSrcUrls,
  styleSrcUrls,
  fontSrcUrls,
  imgSrcUrls,
  connectSrcUrls,
  frameSrcUrls,
  mediaSrcUrls,
  objectSrcUrls,
  baseUriUrls,
  formActionUrls,
  frameAncestorsUrls,
};
