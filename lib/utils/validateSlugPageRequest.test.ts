import { describe, expect, it, jest } from '@jest/globals';

jest.mock('@/i18n/routing', () => ({
  routing: { locales: ['en', 'de', 'fr', 'es', 'pt', 'hi', 'ar', 'tr'], defaultLocale: 'en' },
}));

import { isInvalidSlugPageRequest, isSlugPageLink } from './validateSlugPageRequest';

describe('isInvalidSlugPageRequest', () => {
  it('allows a page slug in a supported locale', () => {
    expect(isInvalidSlugPageRequest('en', 'staying-safe-online')).toBe(false);
    expect(isInvalidSlugPageRequest('tr', 'page_2')).toBe(false);
  });

  it('rejects an unsupported locale', () => {
    expect(isInvalidSlugPageRequest('.well-known', 'assetlinks.json')).toBe(true);
    expect(isInvalidSlugPageRequest('xx', 'staying-safe-online')).toBe(true);
  });

  it('rejects slugs Storyblok cannot produce', () => {
    expect(isInvalidSlugPageRequest('en', 'wp-login.php')).toBe(true);
    expect(isInvalidSlugPageRequest('en', 'Staying-Safe')).toBe(true);
    expect(isInvalidSlugPageRequest('en', '')).toBe(true);
  });

  it('rejects stories served by their own route', () => {
    expect(isInvalidSlugPageRequest('en', 'home')).toBe(true);
    expect(isInvalidSlugPageRequest('en', 'library')).toBe(true);
  });
});

describe('isSlugPageLink', () => {
  it('only includes published top-level stories without a route of their own', () => {
    expect(isSlugPageLink({ slug: 'about', is_folder: false, published: true })).toBe(true);
    expect(isSlugPageLink({ slug: 'about', is_folder: false, published: false })).toBe(false);
    expect(isSlugPageLink({ slug: 'home', is_folder: false, published: true })).toBe(false);
    expect(
      isSlugPageLink({ slug: 'subscription/whatsapp', is_folder: false, published: true }),
    ).toBe(false);
  });
});
