/**
 * @jest-environment node
 */
import { PARTNERS_CACHE_TAG } from '@/lib/constants/common';
import { getStoryblokApi } from '@/lib/storyblok';
import { expect } from '@jest/globals';
import { unstable_cache } from 'next/cache';
import { getPartnerSets, loadPartnerSets } from './loader';
import { resolveLaunchedPartner } from './resolve';
import { activePartners, partnerStories, welcomeLinks } from './testPartners';

jest.mock('next/cache', () => ({ unstable_cache: jest.fn((fn) => fn) }));
jest.mock('@/lib/storyblok', () => ({ getStoryblokApi: jest.fn() }));

// Recorded at import, before beforeEach clears the mocks.
const [cachedFunction, cacheKeyParts, cacheOptions] = (unstable_cache as jest.Mock).mock.calls[0];

const storyblokGet = jest.fn();
const fetchMock = jest.fn();

const respond = (body: unknown, status = 200) =>
  Promise.resolve({ ok: status < 400, status, json: () => Promise.resolve(body) });

function mockSources({
  stories = partnerStories,
  links = welcomeLinks as Record<string, unknown>,
  active = respond(activePartners) as Promise<unknown>,
} = {}) {
  storyblokGet.mockImplementation((path: string) => {
    if (path === 'cdn/stories') return Promise.resolve({ data: { stories } });
    if (path === 'cdn/links') return Promise.resolve({ data: { links } });
    return Promise.reject(new Error(`unexpected ${path}`));
  });
  fetchMock.mockImplementation(() => active);
}

beforeEach(() => {
  jest.clearAllMocks();
  (getStoryblokApi as jest.Mock).mockReturnValue({ get: storyblokGet });
  global.fetch = fetchMock as unknown as typeof fetch;
});

const slugs = (partners: { slug?: string }[]) => partners.map((partner) => partner.slug);

describe('loadPartnerSets', () => {
  it('brands every partner story and launches only active partners with a welcome story', async () => {
    mockSources();
    const { branded, launched } = await loadPartnerSets('en');

    expect(slugs(branded)).toEqual([
      'bumble',
      'badoo',
      'fruitz',
      'test-partner',
      'test-partner-plus',
      'retired-partner',
    ]);
    expect(slugs(launched)).toEqual(['bumble', 'badoo', 'test-partner', 'test-partner-plus']);
    expect(launched.find((partner) => partner.slug === 'test-partner')?.id).toBe('id-test-partner');
  });

  it('reads stories and welcome pages in STORYBLOK_ENVIRONMENT, so drafts count', async () => {
    mockSources();
    const { launched } = await loadPartnerSets('de');

    expect(storyblokGet).toHaveBeenCalledWith(
      'cdn/stories',
      expect.objectContaining({ version: 'draft', starts_with: 'partners/', language: 'de' }),
    );
    expect(storyblokGet).toHaveBeenCalledWith(
      'cdn/links',
      expect.objectContaining({ version: 'draft', starts_with: 'welcome/' }),
    );
    // Test Partner's partner and welcome stories are both drafts.
    expect(slugs(launched)).toContain('test-partner');
  });

  it('asks the backend for active partners', async () => {
    mockSources();
    await loadPartnerSets('en');
    expect(fetchMock).toHaveBeenCalledWith(expect.stringMatching(/\/partner\/active$/));
  });

  describe('throws rather than returning partial or empty sets', () => {
    it('when GET /v1/partner/active returns an error', async () => {
      mockSources({ active: respond({ message: 'oops' }, 500) });
      await expect(loadPartnerSets('en')).rejects.toThrow();
    });

    it('when GET /v1/partner/active is not a list (a backend without PR 1)', async () => {
      mockSources({ active: respond({ id: 'x', name: 'Bumble', partnerFeature: [] }) });
      await expect(loadPartnerSets('en')).rejects.toThrow();
    });

    it('when the backend is unreachable', async () => {
      mockSources({ active: Promise.reject(new TypeError('fetch failed')) });
      await expect(loadPartnerSets('en')).rejects.toThrow();
    });

    it('when the partner stories request fails', async () => {
      mockSources();
      storyblokGet.mockImplementation((path: string) =>
        path === 'cdn/stories'
          ? Promise.reject({ status: 429 })
          : Promise.resolve({ data: { links: welcomeLinks } }),
      );
      await expect(loadPartnerSets('en')).rejects.toBeDefined();
    });

    it('when the welcome links request fails', async () => {
      mockSources();
      storyblokGet.mockImplementation((path: string) =>
        path === 'cdn/links'
          ? Promise.reject({ status: 500 })
          : Promise.resolve({ data: { stories: partnerStories } }),
      );
      await expect(loadPartnerSets('en')).rejects.toBeDefined();
    });
  });

  it('keeps nothing from a failed call: the next call fetches again', async () => {
    mockSources({ active: Promise.reject(new TypeError('fetch failed')) });
    await expect(loadPartnerSets('en')).rejects.toThrow();

    mockSources();
    const { launched } = await loadPartnerSets('en');

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(storyblokGet).toHaveBeenCalledTimes(4);
    expect(slugs(launched)).toContain('bumble');
  });
});

describe('getPartnerSets', () => {
  it('is cached per locale under the partners tag for 4 hours', async () => {
    expect(cachedFunction).toBe(loadPartnerSets);
    expect(cacheKeyParts).toContain('partners');
    expect(cacheOptions).toEqual({ revalidate: 14400, tags: [PARTNERS_CACHE_TAG] });
    mockSources();
    await expect(getPartnerSets('en')).resolves.toHaveProperty('launched');
  });
});

describe('the welcome gate', () => {
  const gate = async (slug: string) => {
    mockSources();
    return resolveLaunchedPartner((await loadPartnerSets('en')).launched, slug);
  };

  it('opens for a launched partner', async () => {
    expect((await gate('bumble'))?.name).toBe('Bumble');
    expect((await gate('test-partner'))?.name).toBe('Test Partner');
  });

  it.each([
    ['inactive', 'retired-partner'],
    ['no welcome story', 'fruitz'],
    ['no partner story', 'old-partner'],
    ['unknown slug', 'nonsense'],
  ])('is closed for a partner with %s', async (_, slug) => {
    expect(await gate(slug)).toBeUndefined();
  });
});
