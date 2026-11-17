/**
 * @jest-environment node
 */
import { PARTNERS_CACHE_TAG } from '@/lib/constants/common';
import { getStoryblokApi } from '@/lib/storyblok';
import { expect } from '@jest/globals';
import { unstable_cache } from 'next/cache';
import { getPartnerSets, loadPartnerSets } from './loader';
import { resolveLaunchedPartner } from './resolve';
import {
  activePartners,
  activePartnersWithBff,
  launchedPartnersWithBff,
  partnerStories,
  welcomeLinks,
} from './partnerFixtures';

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

    expect(slugs(branded)).toEqual(['bumble', 'badoo', 'fruitz', 'bff']);
    // Fruitz has no welcome page; Bumble For Friends isn't active yet.
    expect(slugs(launched)).toEqual(['bumble', 'badoo']);
    expect(launched.find((partner) => partner.slug === 'bumble')?.id).toBe('id-bumble');
  });

  it('launches a partner once a super admin activates it', async () => {
    mockSources({ active: respond(activePartnersWithBff) });
    const { launched } = await loadPartnerSets('en');

    expect(slugs(launched)).toEqual(['bumble', 'badoo', 'bff']);
    expect(launched.find((partner) => partner.slug === 'bff')?.name).toBe('Bumble For Friends');
  });

  it('gives a sub-brand its parent’s slug from the backend’s parentId', async () => {
    mockSources({ active: respond(activePartnersWithBff) });
    const { branded, launched } = await loadPartnerSets('en');

    expect(launched).toEqual(launchedPartnersWithBff);
    expect(branded.find((partner) => partner.slug === 'bff')?.parentSlug).toBe('bumble');
    expect(branded.find((partner) => partner.slug === 'bumble')).not.toHaveProperty('parentSlug');
  });

  it('leaves a sub-brand on its own when its parent is not active', async () => {
    const bffOnly = activePartnersWithBff.filter((partner) => partner.slug !== 'bumble');
    mockSources({ active: respond(bffOnly) });
    const { launched } = await loadPartnerSets('en');

    expect(launched.find((partner) => partner.slug === 'bff')).not.toHaveProperty('parentSlug');
  });

  it('reads stories and welcome pages in STORYBLOK_ENVIRONMENT, so drafts count', async () => {
    mockSources({ active: respond(activePartnersWithBff) });
    const { launched } = await loadPartnerSets('de');

    expect(storyblokGet).toHaveBeenCalledWith(
      'cdn/stories',
      expect.objectContaining({ version: 'draft', starts_with: 'partners/', language: 'de' }),
    );
    expect(storyblokGet).toHaveBeenCalledWith(
      'cdn/links',
      expect.objectContaining({ version: 'draft', starts_with: 'welcome/' }),
    );
    // Bumble For Friends' partner and welcome stories are both drafts.
    expect(slugs(launched)).toContain('bff');
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
  const gate = async (slug: string, sources: Parameters<typeof mockSources>[0] = {}) => {
    mockSources(sources);
    return resolveLaunchedPartner((await loadPartnerSets('en')).launched, slug);
  };
  const bffActive = { active: respond(activePartnersWithBff) };

  it('opens for a launched partner', async () => {
    expect((await gate('bumble'))?.name).toBe('Bumble');
    expect((await gate('bff', bffActive))?.name).toBe('Bumble For Friends');
  });

  it('is closed for an inactive partner', async () => {
    expect(await gate('bff')).toBeUndefined();
  });

  it('is closed for a partner with no welcome story', async () => {
    expect(await gate('fruitz')).toBeUndefined();
  });

  it('is closed for an active partner with a welcome story but no partner story', async () => {
    const stories = partnerStories.filter((story) => story.slug !== 'bff');
    expect(await gate('bff', { ...bffActive, stories })).toBeUndefined();
  });

  it('is closed for an unknown slug', async () => {
    expect(await gate('nonsense')).toBeUndefined();
  });
});
