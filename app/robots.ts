import { ENVIRONMENT, SITE_URL } from '@/lib/constants/common';
import { ENVIRONMENTS } from '@/lib/constants/enums';
import type { MetadataRoute } from 'next';

// Private pages carry a noindex tag rather than a Disallow rule: a disallowed page is never crawled,
// so its noindex goes unseen and the bare URL can still be indexed from links to it.
export default function robots(): MetadataRoute.Robots {
  // Staging and preview builds serve draft content.
  if (ENVIRONMENT !== ENVIRONMENTS.PRODUCTION) {
    return { rules: { userAgent: '*', disallow: '/' } };
  }

  return {
    rules: { userAgent: '*', allow: '/', disallow: '/api/' },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
