import { expect } from '@jest/globals';

// BASE_URL is read at module load, so it is mocked before the import below resolves.
jest.mock('@/lib/constants/common', () => ({ BASE_URL: 'https://bloom.chayn.co' }));

import { isExternalHref, resolveStoryblokLink } from './links';

describe('resolveStoryblokLink', () => {
  // Storyblok stores an internal pick as a story path in `cached_url`, with no leading slash.
  it('turns an internal story path into an app path, which keeps the locale', () => {
    expect(resolveStoryblokLink({ url: '', cached_url: 'library' })).toEqual({
      href: '/library',
      external: false,
    });
  });

  it('leaves an already-rooted internal path alone', () => {
    expect(resolveStoryblokLink({ url: '/library?type=course', cached_url: '' })).toEqual({
      href: '/library?type=course',
      external: false,
    });
  });

  it('treats a link off Bloom as external, so it opens in a new tab', () => {
    expect(resolveStoryblokLink({ url: 'https://www.chayn.co/help', cached_url: '' })).toEqual({
      href: 'https://www.chayn.co/help',
      external: true,
    });
  });

  // An editor pasting the full Bloom url should not get a new tab out of it.
  it('treats an absolute Bloom url as internal', () => {
    expect(
      resolveStoryblokLink({ url: 'https://bloom.chayn.co/messaging', cached_url: '' }),
    ).toEqual({ href: 'https://bloom.chayn.co/messaging', external: false });
  });

  // A card with no link renders nothing rather than a dead anchor.
  it('reports no href for an empty or missing link field', () => {
    expect(resolveStoryblokLink({ url: '', cached_url: '' }).href).toBe('');
    expect(resolveStoryblokLink(undefined).href).toBe('');
  });
});

describe('isExternalHref', () => {
  it.each([
    ['/library', false],
    ['https://bloom.chayn.co/messaging', false],
    ['https://www.chayn.co/help', true],
    ['', false],
  ])('%s -> %s', (href, expected) => {
    expect(isExternalHref(href)).toBe(expected);
  });
});
