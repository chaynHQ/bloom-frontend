const scriptSrcUrls = [
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

const childSrcUrls = ['blob:'];

const workerSrcUrls = ['blob:', 'https://*.youtube.com'];
const styleSrcUrls = [
  'https://fonts.googleapis.com',
  'https://static.hotjar.com',
  'https://app.storyblok.com',
  'https://client.crisp.chat',
  'https://*.google-analytics.com',
];
const fontSrcUrls = [
  'https://fonts.gstatic.com',
  'https://*.hotjar.com',
  'https://*.crisp.chat',
  'https://*.youtube.com',
];
const imgSrcUrls = [
  'data:',
  'https://*.hotjar.com',
  'https://*.storyblok.com',
  'https://*.crisp.chat',
  'https://*.googletagmanager.com',
];
const connectSrcUrls = [
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
const frameSrcUrls = [
  'https://*.hotjar.com',
  'https://*.storyblok.com',
  'https://*.crisp.chat',
  'https://*.simplybook.it',
  'https://*.youtube.com',
];
const objectSrcUrls = ['none'];
const baseUriUrls = ['self'];
const formActionUrls = ['self'];
const frameAncestorsUrls = ['self'];

module.exports = {
  scriptSrcUrls,
  childSrcUrls,
  workerSrcUrls,
  styleSrcUrls,
  fontSrcUrls,
  imgSrcUrls,
  connectSrcUrls,
  frameSrcUrls,
  objectSrcUrls,
  baseUriUrls,
  formActionUrls,
  frameAncestorsUrls,
};
