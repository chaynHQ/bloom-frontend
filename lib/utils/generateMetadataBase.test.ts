import {
  generateMetadataBasic,
  generateMetadataTitle,
  storyblokShareImage,
  storyLocales,
} from './generateMetadataBase';

jest.mock('@/i18n/routing', () => ({
  routing: { locales: ['en', 'de', 'fr', 'es', 'pt', 'hi', 'ar', 'tr'], defaultLocale: 'en' },
}));
jest.mock('next-intl/server', () => ({
  getTranslations: async () => (key: string) => key,
}));

describe('generateMetadataTitle', () => {
  it('leads with the page title, so search results show the topic first', () => {
    expect(generateMetadataTitle('Anger', 'Healing from sexual trauma')).toBe(
      'Anger • Healing from sexual trauma • Bloom',
    );
    expect(generateMetadataTitle('Library')).toBe('Library • Bloom');
  });
});

describe('storyLocales', () => {
  it('reads Storyblok "default" as English, and no languages as English only', () => {
    expect(storyLocales(['tr', 'ar'])).toEqual(['ar', 'tr']);
    expect(storyLocales(['default', 'de'])).toEqual(['en', 'de']);
    expect(storyLocales([])).toEqual(['en']);
  });
});

describe('generateMetadataBasic', () => {
  it('gives a page its own canonical URL and hreflang links for its languages only', async () => {
    const metadata = await generateMetadataBasic({
      title: 'Coercive control',
      locale: 'tr',
      path: '/audio/coercive-control',
      languages: ['tr', 'ar'],
    });

    expect(metadata.alternates).toEqual({
      canonical: '/tr/audio/coercive-control',
      languages: {
        ar: '/ar/audio/coercive-control',
        tr: '/tr/audio/coercive-control',
        'x-default': '/ar/audio/coercive-control',
      },
    });
    expect(metadata.robots).toBeUndefined();
  });

  it('keeps a locale the story is not published in out of the index', async () => {
    const metadata = await generateMetadataBasic({
      title: 'Qigong',
      locale: 'de',
      path: '/video/qigong',
      languages: ['default'],
    });

    expect(metadata.alternates?.canonical).toBe('/video/qigong');
    expect(metadata.robots).toEqual({ index: false, follow: true });
  });

  it('keeps a private page out of the index', async () => {
    const metadata = await generateMetadataBasic({
      title: 'Settings',
      locale: 'en',
      noIndex: true,
    });

    expect(metadata.robots).toEqual({ index: false, follow: true });
  });

  it('sets no canonical without a path, rather than pointing at the homepage', async () => {
    const metadata = await generateMetadataBasic({ title: 'Log in', locale: 'en' });

    expect(metadata.alternates).toBeUndefined();
  });

  it('trims a description to a whole word', async () => {
    const long = `${'Healing takes time and looks different for everyone. '.repeat(5)}`;
    const metadata = await generateMetadataBasic({ title: 'A', description: long });

    expect(metadata.description?.length).toBeLessThanOrEqual(160);
    expect(metadata.description).toMatch(/\w…$/);
  });

  // Resources store their page description as rich text; it is the usual fallback when
  // seo_description is empty.
  it('reads a rich-text description as plain text', async () => {
    const richText = {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Draw a timeline.' }] }],
    };

    expect((await generateMetadataBasic({ title: 'A', description: richText })).description).toBe(
      'Draw a timeline.',
    );
    expect((await generateMetadataBasic({ title: 'A', description: '' })).description).toBe(
      undefined,
    );
  });

  it('keeps the share image, URL and locale, and skips SVG images social sites cannot show', async () => {
    const metadata = await generateMetadataBasic({
      title: 'Qigong',
      locale: 'en',
      path: '/video/qigong',
      image: 'https://a.storyblok.com/f/1/illustration.svg',
    });

    expect(metadata.openGraph).toMatchObject({
      url: '/video/qigong',
      locale: 'en_GB',
      images: [{ url: '/preview.png' }],
    });
  });
});

describe('storyblokShareImage', () => {
  it('crops a large Storyblok image to the share card shape', () => {
    expect(
      storyblokShareImage('https://a.storyblok.com/f/142459/1920x1080/88f7f39d58/points.png'),
    ).toEqual({
      url: 'https://a.storyblok.com/f/142459/1920x1080/88f7f39d58/points.png/m/1200x630/smart',
      width: 1200,
      height: 630,
    });
  });

  it('skips images too small for a share card, SVGs and unknown sizes', () => {
    expect(storyblokShareImage('https://a.storyblok.com/f/142459/337x180/98999e9c90/4.png')).toBe(
      undefined,
    );
    expect(storyblokShareImage('https://a.storyblok.com/f/142459/1200x800/ab/i.svg')).toBe(
      undefined,
    );
    expect(storyblokShareImage('https://example.com/image.png')).toBe(undefined);
    expect(storyblokShareImage(undefined)).toBe(undefined);
  });
});
