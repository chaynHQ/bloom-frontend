import type { ISbStoryData } from '@storyblok/react/rsc';
import { render } from '@testing-library/react';
import {
  breadcrumbJsonLd,
  courseJsonLd,
  JsonLd,
  resourceJsonLd,
  siteJsonLd,
  videoJsonLd,
} from './structuredData';

jest.mock('@/i18n/routing', () => ({
  routing: { locales: ['en', 'de', 'fr', 'es', 'pt', 'hi', 'ar', 'tr'], defaultLocale: 'en' },
}));
jest.mock('next-intl/server', () => ({
  getTranslations: async () => (key: string) => key,
}));

const story = (content: Record<string, unknown>) =>
  ({
    first_published_at: '2025-09-02T00:00:00Z',
    published_at: '2025-10-01T00:00:00Z',
    content,
  }) as unknown as ISbStoryData;

describe('siteJsonLd', () => {
  it('names Chayn once, as the publisher of the Bloom website', () => {
    const [organization, website] = siteJsonLd['@graph'];

    expect(organization).toMatchObject({
      '@type': 'NGO',
      name: 'Chayn',
      sameAs: expect.arrayContaining(['https://twitter.com/ChaynHQ']),
    });
    expect(website).toMatchObject({
      '@type': 'WebSite',
      name: 'Bloom',
      publisher: { '@id': organization['@id'] },
    });
  });
});

describe('courseJsonLd', () => {
  it('describes the course from its SEO description, falling back to its description', () => {
    const data = courseJsonLd(
      story({ name: 'Managing anxiety', description: 'A course.' }),
      'de',
      '/courses/managing-anxiety',
    );

    expect(data).toMatchObject({
      '@type': 'Course',
      name: 'Managing anxiety',
      description: 'A course.',
      inLanguage: 'de',
      provider: { '@id': siteJsonLd['@graph'][0]['@id'], name: 'Chayn' },
      hasCourseInstance: { courseMode: 'Online' },
    });
    expect(data?.url).toMatch(/\/de\/courses\/managing-anxiety$/);
  });

  it('leaves out a course that is coming soon', () => {
    expect(courseJsonLd(story({ name: 'Soon', coming_soon: true }), 'en', '/courses/soon')).toBe(
      null,
    );
  });
});

describe('videoJsonLd', () => {
  it("uses YouTube's thumbnail and player when the story has no preview image", () => {
    const data = videoJsonLd(
      story({ name: 'Boundaries', video: { url: 'https://youtu.be/x2qbP4hxpN8?si=tracking' } }),
      'en',
      '/video/what-are-boundaries',
    );

    expect(data).toMatchObject({
      thumbnailUrl: 'https://i.ytimg.com/vi/x2qbP4hxpN8/hqdefault.jpg',
      embedUrl: 'https://www.youtube.com/embed/x2qbP4hxpN8',
    });
  });

  it('needs a thumbnail, which Google requires for a video result', () => {
    expect(
      videoJsonLd(
        story({ name: 'Elsewhere', video: { url: 'https://example.com/video.mp4' } }),
        'en',
        '/video/elsewhere',
      ),
    ).toBeNull();
  });

  it('reads the duration Storyblok stores in minutes', () => {
    const data = videoJsonLd(
      story({
        name: 'Qigong',
        duration: '10',
        video: { url: 'https://youtu.be/Yp6aPPQd1GU' },
        preview_image: { filename: 'https://a.storyblok.com/f/1/qigong.png' },
      }),
      'en',
      '/video/qigong',
    );

    expect(data).toMatchObject({
      '@type': 'VideoObject',
      thumbnailUrl: 'https://a.storyblok.com/f/1/qigong.png',
      duration: 'PT10M',
      uploadDate: '2025-09-02T00:00:00Z',
    });
  });
});

describe('resourceJsonLd', () => {
  it('gives an article a headline and author', () => {
    const data = resourceJsonLd(
      'Article',
      story({ name: 'Tools for healing' }),
      'tr',
      '/written/x',
    );

    expect(data).toMatchObject({
      '@type': 'Article',
      headline: 'Tools for healing',
      author: { name: 'Chayn' },
      datePublished: '2025-09-02T00:00:00Z',
      dateModified: '2025-10-01T00:00:00Z',
    });
  });

  it('gives audio a duration and other resources a time required, skipping SVG images', () => {
    const content = {
      name: 'A',
      duration: '15',
      header_image: { filename: 'https://a.storyblok.com/f/1/a.svg' },
    };

    expect(resourceJsonLd('AudioObject', story(content), 'en', '/audio/a')).toMatchObject({
      duration: 'PT15M',
      image: undefined,
    });
    expect(resourceJsonLd('LearningResource', story(content), 'en', '/activity/a')).toMatchObject({
      timeRequired: 'PT15M',
    });
  });
});

describe('breadcrumbJsonLd', () => {
  it('starts at the library and leaves the current page unlinked', async () => {
    const data = await breadcrumbJsonLd('de', [
      { name: 'Managing anxiety', path: '/courses/managing-anxiety' },
      { name: 'What is anxiety?' },
    ]);

    expect(data.itemListElement).toEqual([
      {
        '@type': 'ListItem',
        position: 1,
        name: 'library',
        item: expect.stringMatching(/\/de\/library$/),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Managing anxiety',
        item: expect.stringMatching(/\/de\/courses\/managing-anxiety$/),
      },
      { '@type': 'ListItem', position: 3, name: 'What is anxiety?' },
    ]);
  });
});

describe('JsonLd', () => {
  it('escapes "<" so CMS text cannot close the script tag', () => {
    const { container } = render(<JsonLd data={{ name: '</script><b>hi</b>' }} />);

    expect(container.querySelector('script')?.innerHTML).not.toContain('</script>');
    expect(JSON.parse(container.querySelector('script')!.innerHTML).name).toBe(
      '</script><b>hi</b>',
    );
  });
});
