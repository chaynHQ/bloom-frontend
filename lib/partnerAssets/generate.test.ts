/**
 * @jest-environment node
 */
import { fieldsToGenerate, fillEmptyFields, generatePartnerAssets } from './generate';

const SPACE = '142459';
const MAPI = `https://mapi.storyblok.com/v1/spaces/${SPACE}`;
const LOGO_URL = 'https://a.storyblok.com/f/142459/1062x187/abc/logo.svg';
const PARTNERS_FOLDER = 133253;
const PARTNERS_DATASOURCE = 63394;

const asset = (filename: string, id = 1) => ({
  id,
  alt: '',
  name: '',
  focus: '',
  title: '',
  source: '',
  filename,
  copyright: '',
  fieldtype: 'asset',
  meta_data: {},
  is_external_url: false,
});
const emptyAsset = { ...asset(''), id: null };

const content = (slug: string, name: string, assets: Record<string, unknown>) => ({
  _uid: `uid-${slug}`,
  component: 'partner',
  name,
  legal_name: 'BUMBLE HOLDING LTD',
  logo: asset(LOGO_URL, 10),
  brand_color: '#f6c651',
  website: 'https://bumble.com',
  instagram: `https://www.instagram.com/${slug}`,
  facebook: '',
  twitter: '',
  youtube: '',
  tiktok: '',
  ...assets,
});

const bumbleLockup = asset('https://a.storyblok.com/f/142459/400x232/a/bloom_bumble_logo.svg', 20);
const bumbleIllustration = asset('https://a.storyblok.com/f/142459/988x988/b/yellow.svg', 21);
const germanLockup = asset('https://a.storyblok.com/f/142459/1200x696/c/bloom_bumble_de.png', 22);

// Bumble as it is in Storyblok today: an English lockup, no translations, an illustration.
const bumble = {
  id: 1,
  slug: 'bumble',
  content: content('bumble', 'Bumble', {
    partnership_logo: bumbleLockup,
    illustration: bumbleIllustration,
  }),
};

// A new partner: nothing generated yet, and not in the partners datasource.
const bumbleForFriends = {
  id: 2,
  slug: 'bumble-for-friends',
  content: content('bumble-for-friends', 'Bumble For Friends', {}),
};

const otherLanguages = ['de', 'fr', 'es', 'pt', 'hi'];
const lockupFields = [
  'partnership_logo',
  ...otherLanguages.map((l) => `partnership_logo__i18n__${l}`),
];

const json = (body: unknown) => Response.json(body);

// An in-memory Management API: one story, the partners datasource and S3 uploads.
function fakeStoryblok(story: { id: number; slug: string; content: Record<string, any> }) {
  const state = {
    story: structuredClone(story),
    entries: [
      { id: 1, name: 'public', value: 'Public' },
      { id: 2, name: 'bumble', value: 'Bumble' },
    ],
    created: [] as any[],
    uploaded: [] as string[],
    finished: [] as number[],
    puts: [] as any[],
    newEntries: [] as any[],
    requests: [] as string[],
    // Lets a test change the story between generation's two reads.
    beforeSecondRead: undefined as undefined | ((content: Record<string, any>) => void),
    reads: 0,
  };
  let nextAssetId = 100;

  global.fetch = jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    const method = init?.method ?? 'GET';
    state.requests.push(`${method} ${url}`);

    if (url === LOGO_URL) {
      return new Response(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1062 187"><rect width="1062" height="187" fill="#333"/></svg>',
      );
    }
    if (url === 'https://s3.example/upload' && method === 'POST') {
      const form = init!.body as FormData;
      state.uploaded.push(form.get('key') as string);
      expect(form.get('file')).toBeInstanceOf(Blob);
      return new Response(null, { status: 204 });
    }
    if (!url.startsWith(MAPI)) throw new Error(`Unexpected request ${method} ${url}`);
    expect(new Headers(init?.headers).get('Authorization')).toBe('mapi-token');

    const route = url.slice(MAPI.length);
    const body = init?.body ? JSON.parse(init.body as string) : undefined;

    if (route === `/stories/${story.id}` && method === 'GET') {
      state.reads += 1;
      if (state.reads === 2) state.beforeSecondRead?.(state.story.content);
      return json({ story: state.story });
    }
    if (route === `/stories/${story.id}` && method === 'PUT') {
      state.puts.push(body);
      state.story.content = body.story.content;
      return json({ story: state.story });
    }
    if (route === '/assets/10' && method === 'GET') {
      return json({ id: 10, asset_folder_id: PARTNERS_FOLDER });
    }
    if (route === '/assets' && method === 'POST') {
      state.created.push(body);
      const id = nextAssetId++;
      return json({
        id,
        post_url: 'https://s3.example/upload',
        fields: { key: `f/${SPACE}/${body.size}/h${id}/${body.filename}`, policy: 'p' },
      });
    }
    const finish = route.match(/^\/assets\/(\d+)\/finish_upload$/);
    if (finish && method === 'GET') {
      state.finished.push(Number(finish[1]));
      return json({});
    }
    if (route === '/datasources?search=partners' && method === 'GET') {
      return json({ datasources: [{ id: PARTNERS_DATASOURCE, slug: 'partners' }] });
    }
    if (
      route === `/datasource_entries?datasource_id=${PARTNERS_DATASOURCE}&per_page=1000` &&
      method === 'GET'
    ) {
      return json({ datasource_entries: state.entries });
    }
    if (route === '/datasource_entries' && method === 'POST') {
      state.newEntries.push(body.datasource_entry);
      state.entries.push({ id: 3, ...body.datasource_entry });
      return json({ datasource_entry: body.datasource_entry });
    }
    throw new Error(`Unexpected request ${method} ${route}`);
  }) as jest.Mock;

  return state;
}

beforeEach(() => {
  process.env.STORYBLOK_OAUTH_TOKEN = 'mapi-token';
  process.env.STORYBLOK_SPACE_ID = SPACE;
});

describe('fieldsToGenerate', () => {
  it('lists every lockup language and the illustration for a new partner', () => {
    expect(fieldsToGenerate(bumbleForFriends.content)).toEqual([...lockupFields, 'illustration']);
  });

  it('lists nothing for Bumble today: its English lockup stands in for every language', () => {
    expect(fieldsToGenerate(bumble.content)).toEqual([]);
  });

  it('lists only the empty lockups once the English one is cleared', () => {
    const cleared = {
      ...bumble.content,
      partnership_logo: emptyAsset,
      partnership_logo__i18n__de: germanLockup,
    };
    expect(fieldsToGenerate(cleared)).toEqual(lockupFields.filter((f) => !f.endsWith('__de')));
  });

  it('lists only the illustration when only it is cleared', () => {
    expect(fieldsToGenerate({ ...bumble.content, illustration: emptyAsset })).toEqual([
      'illustration',
    ]);
  });
});

describe('fillEmptyFields', () => {
  it('fills empty fields and keeps everything else, including filled generated fields', () => {
    const current = {
      ...bumble.content,
      partnership_logo: emptyAsset,
      partnership_logo__i18n__de: germanLockup,
      partnership_logo__i18n__ar: asset('https://a.storyblok.com/f/142459/1x1/d/ar.png', 23),
    };
    const generated = {
      partnership_logo: asset('new-en.png', 30),
      partnership_logo__i18n__de: asset('new-de.png', 31),
    };

    expect(fillEmptyFields(current, generated)).toEqual({
      ...current,
      partnership_logo: generated.partnership_logo,
    });
  });
});

describe('generatePartnerAssets', () => {
  it('fills Bumble For Friends’ empty fields in its draft and adds it to the partners datasource', async () => {
    const storyblok = fakeStoryblok(bumbleForFriends);

    await generatePartnerAssets(bumbleForFriends.id);

    expect(storyblok.created).toEqual([
      ...['en', ...otherLanguages].map((lang) => ({
        filename: `bloom_bumble-for-friends_logo_${lang}.png`,
        size: '1200x696',
        asset_folder_id: PARTNERS_FOLDER,
      })),
      {
        filename: 'illustration_bloom_head_bumble-for-friends.svg',
        size: '988x988',
        asset_folder_id: PARTNERS_FOLDER,
      },
    ]);
    expect(storyblok.finished).toEqual([100, 101, 102, 103, 104, 105, 106]);

    expect(storyblok.puts).toHaveLength(1);
    const saved = storyblok.puts[0].story.content;
    const url = (id: number, size: string, file: string) =>
      `https://a.storyblok.com/f/${SPACE}/${size}/h${id}/${file}`;
    expect(saved).toEqual({
      ...bumbleForFriends.content,
      partnership_logo: asset(url(100, '1200x696', 'bloom_bumble-for-friends_logo_en.png'), 100),
      ...Object.fromEntries(
        otherLanguages.map((lang, i) => [
          `partnership_logo__i18n__${lang}`,
          asset(url(101 + i, '1200x696', `bloom_bumble-for-friends_logo_${lang}.png`), 101 + i),
        ]),
      ),
      illustration: asset(
        url(106, '988x988', 'illustration_bloom_head_bumble-for-friends.svg'),
        106,
      ),
    });

    expect(storyblok.newEntries).toEqual([
      {
        name: 'bumble-for-friends',
        value: 'Bumble For Friends',
        datasource_id: PARTNERS_DATASOURCE,
      },
    ]);
  });

  it('never publishes', async () => {
    const storyblok = fakeStoryblok(bumbleForFriends);

    await generatePartnerAssets(bumbleForFriends.id);

    expect(storyblok.requests.filter((r) => /publish/.test(r))).toEqual([]);
    expect(Object.keys(storyblok.puts[0])).toEqual(['story']);
    expect(Object.keys(storyblok.puts[0].story)).toEqual(['content']);
  });

  it('changes nothing on a second run', async () => {
    const storyblok = fakeStoryblok(bumbleForFriends);

    await generatePartnerAssets(bumbleForFriends.id);
    const requestsAfterFirstRun = storyblok.requests.length;
    await generatePartnerAssets(bumbleForFriends.id);

    expect(storyblok.puts).toHaveLength(1);
    expect(storyblok.created).toHaveLength(7);
    expect(storyblok.newEntries).toHaveLength(1);
    expect(storyblok.requests.slice(requestsAfterFirstRun)).toEqual([
      `GET ${MAPI}/stories/${bumbleForFriends.id}`,
    ]);
  });

  it('regenerates only Bumble’s cleared lockups and keeps its German one and illustration', async () => {
    const cleared = {
      ...bumble,
      content: {
        ...bumble.content,
        partnership_logo: emptyAsset,
        partnership_logo__i18n__de: germanLockup,
      },
    };
    const storyblok = fakeStoryblok(cleared);

    await generatePartnerAssets(cleared.id);

    expect(storyblok.created.map((c) => c.filename)).toEqual(
      ['en', 'fr', 'es', 'pt', 'hi'].map((lang) => `bloom_bumble_logo_${lang}.png`),
    );
    const saved = storyblok.puts[0].story.content;
    expect(saved.partnership_logo__i18n__de).toEqual(germanLockup);
    expect(saved.illustration).toEqual(bumbleIllustration);
    expect(saved.partnership_logo.filename).toMatch(/bloom_bumble_logo_en\.png$/);
    expect(storyblok.newEntries).toEqual([]);
  });

  it('does nothing for Bumble today', async () => {
    const storyblok = fakeStoryblok(bumble);

    await generatePartnerAssets(bumble.id);

    expect(storyblok.requests).toEqual([`GET ${MAPI}/stories/${bumble.id}`]);
  });

  it('keeps a field an editor filled while generation ran', async () => {
    const storyblok = fakeStoryblok(bumbleForFriends);
    const designersIllustration = asset('https://a.storyblok.com/f/142459/500x500/e/mine.svg', 40);
    storyblok.beforeSecondRead = (current) => {
      current.illustration = designersIllustration;
      current.website = 'https://bumble.com/bff';
    };

    await generatePartnerAssets(bumbleForFriends.id);

    const saved = storyblok.puts[0].story.content;
    expect(saved.illustration).toEqual(designersIllustration);
    expect(saved.website).toBe('https://bumble.com/bff');
    expect(saved.partnership_logo.filename).toMatch(/_en\.png$/);
  });

  it('throws when the Management API refuses a request, before writing anything', async () => {
    fakeStoryblok(bumbleForFriends);
    const fakeFetch = global.fetch as jest.Mock;
    const realImpl = fakeFetch.getMockImplementation()!;
    fakeFetch.mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) =>
      String(input).endsWith('/assets')
        ? new Response('nope', { status: 422 })
        : realImpl(input, init),
    );

    await expect(generatePartnerAssets(bumbleForFriends.id)).rejects.toThrow('422');
    expect(fakeFetch.mock.calls.some(([, init]) => init?.method === 'PUT')).toBe(false);
  });
});
