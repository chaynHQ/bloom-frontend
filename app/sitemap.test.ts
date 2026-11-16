/**
 * @jest-environment node
 */
import { getPartnerSets } from '@/lib/partners/loader';
import { brandedPartners, launchedPartners } from '@/lib/partners/testPartners';
import { getStoryblokApi, getStoryblokStory } from '@/lib/storyblok';
import { expect } from '@jest/globals';
import { notFound } from 'next/navigation';
import type { ReactElement } from 'react';
import WelcomeRoute, {
  generateMetadata,
  generateStaticParams,
} from './[locale]/welcome/[partnerName]/page';
import sitemap from './sitemap';

jest.mock('@/i18n/routing', () => ({
  routing: { locales: ['en', 'de'], defaultLocale: 'en', localePrefix: 'as-needed' },
}));
jest.mock('next-intl/server', () => ({ getTranslations: jest.fn() }));
jest.mock('@/lib/partners/loader', () => ({ getPartnerSets: jest.fn() }));
jest.mock('@/lib/storyblok', () => ({ getStoryblokApi: jest.fn(), getStoryblokStory: jest.fn() }));
jest.mock('@/lib/utils/getLibraryStories', () => ({
  getLibraryStories: jest.fn(() =>
    Promise.resolve({ courses: [], courseSessions: [], resources: [] }),
  ),
}));
jest.mock('@/components/pages/WelcomePage', () => function WelcomePage() {});
jest.mock('next/navigation', () => ({
  notFound: jest.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

const link = (slug: string) => ({ slug, is_folder: false, published: true });

beforeEach(() => {
  jest.clearAllMocks();
  (getPartnerSets as jest.Mock).mockResolvedValue({
    branded: brandedPartners,
    launched: launchedPartners,
  });
  (getStoryblokApi as jest.Mock).mockReturnValue({
    get: jest.fn(() =>
      Promise.resolve({
        data: {
          links: Object.fromEntries(
            [
              'policies/terms-of-service',
              'welcome/bumble',
              'welcome/badoo',
              'welcome/fruitz',
              'welcome/retired-partner',
              'welcome/test-partner',
              'welcome/test-partner-plus',
            ].map((slug) => [slug, link(slug)]),
          ),
        },
      }),
    ),
  });
  (getStoryblokStory as jest.Mock).mockImplementation((slug: string) =>
    Promise.resolve({ slug, content: { title: 'Welcome' } }),
  );
});

const welcomeSlugs = (urls: string[]) =>
  [...new Set(urls.map((url) => url.match(/\/welcome\/([^/?]+)$/)?.[1]).filter(Boolean))].sort();

const launchedSlugs = ['badoo', 'bumble', 'test-partner', 'test-partner-plus'];

describe('sitemap', () => {
  it('lists welcome pages for launched partners only', async () => {
    const urls = (await sitemap()).map((entry) => entry.url);

    expect(welcomeSlugs(urls)).toEqual(launchedSlugs);
    expect(urls).toContain('https://bloom.chayn.co/de/welcome/bumble');
  });

  it('still lists other folder pages', async () => {
    const urls = (await sitemap()).map((entry) => entry.url);
    expect(urls).toContain('https://bloom.chayn.co/policies/terms-of-service');
  });
});

describe('welcome page', () => {
  const params = (partnerName: string, locale = 'en') =>
    ({ params: Promise.resolve({ locale, partnerName }) }) as const;

  it('generateStaticParams lists launched partners only, in every locale', async () => {
    const paths = await generateStaticParams();

    expect([...new Set(paths.map((path) => path.partnerName))].sort()).toEqual(launchedSlugs);
    expect(paths).toContainEqual({ partnerName: 'test-partner', locale: 'de' });
  });

  it('renders for a launched partner, with the partner resolved once from the slug', async () => {
    const element = (await WelcomeRoute(params('test-partner'))) as ReactElement<{
      partner: { name: string; slug: string };
    }>;

    expect(getStoryblokStory).toHaveBeenCalledWith('welcome/test-partner', 'en', expect.anything());
    expect(element.props.partner).toMatchObject({ name: 'Test Partner', slug: 'test-partner' });
  });

  it.each(['retired-partner', 'fruitz', 'old-partner', 'nonsense'])(
    'is not found for %s',
    async (slug) => {
      await expect(WelcomeRoute(params(slug))).rejects.toThrow('NEXT_NOT_FOUND');
      expect(notFound).toHaveBeenCalled();
      expect(getStoryblokStory).not.toHaveBeenCalled();
    },
  );

  it('has no metadata for a partner that is not launched', async () => {
    expect(await generateMetadata(params('retired-partner'))).toBeUndefined();
    expect(getStoryblokStory).not.toHaveBeenCalled();
  });

  it('lets a loader failure through rather than rendering not found', async () => {
    (getPartnerSets as jest.Mock).mockRejectedValue(new Error('backend down'));

    await expect(WelcomeRoute(params('bumble'))).rejects.toThrow('backend down');
    await expect(generateStaticParams()).rejects.toThrow('backend down');
    expect(notFound).not.toHaveBeenCalled();
  });
});
