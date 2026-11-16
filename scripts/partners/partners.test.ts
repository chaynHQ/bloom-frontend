/**
 * @jest-environment node
 */
import { execFile } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import { AddressInfo } from 'node:net';
import os from 'node:os';
import path from 'node:path';

// The scripts are ES modules, which this Jest setup can't import, so each test runs a script
// as Node would, against this in-memory stand-in for Storyblok's Management API.

type Json = Record<string, any>;
type Request = { method: string; path: string; body: Json | null };
type Story = {
  id: number;
  name: string;
  slug: string;
  full_slug: string;
  parent_id: number;
  is_folder: boolean;
  default_root?: string;
  published: boolean;
  unpublished_changes: boolean;
  content: Json;
};
type Asset = { id: number; filename: string; asset_folder_id: number };

const SPACE_ID = '123';
const PARTNERS_ASSET_FOLDER_ID = 133253;

class FakeStoryblok {
  components: Json[] = [{ id: 1, name: 'page', schema: { title: { type: 'text' } } }];
  stories: Story[] = [];
  datasources = [{ id: 7, slug: 'partners' }];
  entries = [
    { name: 'public', value: 'Public' },
    { name: 'badoo', value: 'Badoo' },
    { name: 'fruitz', value: 'Fruitz' },
    { name: 'bumble', value: 'Bumble' },
  ];
  assets: Asset[] = [];
  requests: Request[] = [];
  failUploads = false;
  url = '';
  private nextId = 1000;
  private server = http.createServer((req, res) => {
    let raw = '';
    req.on('data', (chunk) => (raw += chunk));
    req.on('end', () => {
      const url = new URL(req.url!, this.url);
      const route = url.pathname.replace(`/v1/spaces/${SPACE_ID}`, '');
      const isJson = req.headers['content-type'] === 'application/json';
      this.requests.push({
        method: req.method!,
        path: route,
        body: isJson && raw ? JSON.parse(raw) : null,
      });
      const [status, body] = this.route(req.method!, route, url.searchParams, raw);
      res.writeHead(status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(body));
    });
  });

  start() {
    return new Promise<void>((resolve) =>
      this.server.listen(0, '127.0.0.1', () => {
        this.url = `http://127.0.0.1:${(this.server.address() as AddressInfo).port}`;
        resolve();
      }),
    );
  }

  stop() {
    return new Promise((resolve) => this.server.close(resolve));
  }

  addFolder(slug: string) {
    const folder = this.addStory({ name: slug, slug, parent_id: 0, is_folder: true });
    return folder.id;
  }

  story(fullSlug: string) {
    return this.stories.find((s) => s.full_slug === fullSlug);
  }

  component(name: string) {
    return this.components.find((c) => c.name === name);
  }

  writes() {
    return this.requests
      .filter((r) => r.method !== 'GET' || /\/(publish|finish_upload)$/.test(r.path))
      .map((r) => `${r.method} ${r.path}`);
  }

  private addStory(story: Json): Story {
    const parent = this.stories.find((s) => s.id === story.parent_id);
    const created: Story = {
      is_folder: false,
      published: false,
      unpublished_changes: false,
      content: {},
      ...story,
      id: this.nextId++,
      full_slug: parent ? `${parent.full_slug}/${story.slug}` : story.slug,
    } as Story;
    this.stories.push(created);
    return created;
  }

  private route(
    method: string,
    route: string,
    query: URLSearchParams,
    raw: string,
  ): [number, Json] {
    const body = method !== 'GET' && route !== '/upload' && raw ? JSON.parse(raw) : {};
    const id = Number(route.split('/')[2]);
    const key = `${method} ${route.replace(/\/\d+/, '/:id')}`;
    switch (key) {
      case 'GET /components':
        return [200, { components: this.components }];
      case 'POST /components': {
        const component = { ...body.component, id: this.nextId++ };
        this.components.push(component);
        return [201, { component }];
      }
      case 'PUT /components/:id': {
        const i = this.components.findIndex((c) => c.id === id);
        this.components[i] = body.component;
        return [200, { component: body.component }];
      }
      case 'GET /stories':
        return [
          200,
          { stories: this.stories.filter((s) => s.full_slug === query.get('with_slug')) },
        ];
      case 'POST /stories':
        return [201, { story: this.addStory(body.story) }];
      case 'GET /stories/:id':
        return [200, { story: this.stories.find((s) => s.id === id) }];
      case 'GET /stories/:id/publish': {
        const story = this.stories.find((s) => s.id === id)!;
        Object.assign(story, { published: true, unpublished_changes: false });
        return [200, { story }];
      }
      case 'GET /datasources':
        return [200, { datasources: this.datasources }];
      case 'GET /datasource_entries':
        return [200, { datasource_entries: this.entries }];
      case 'GET /assets': {
        const folder = Number(query.get('in_folder'));
        const search = query.get('search') ?? '';
        const assets = this.assets.filter(
          (a) => a.asset_folder_id === folder && a.filename.includes(search),
        );
        return [200, { assets }];
      }
      case 'POST /assets': {
        const asset = {
          id: this.nextId++,
          asset_folder_id: body.asset_folder_id,
          filename: `https://s3.amazonaws.com/a.storyblok.com/f/${SPACE_ID}/${body.size}/abc/${body.filename}`,
        };
        this.assets.push(asset);
        return [200, { id: asset.id, post_url: `${this.url}/upload`, fields: { key: 'k' } }];
      }
      case 'POST /upload':
        return this.failUploads ? [500, { error: 'upload failed' }] : [204, {}];
      case 'GET /assets/:id/finish_upload':
        return [200, {}];
      case 'GET /assets/:id':
        return [200, this.assets.find((a) => a.id === id)!];
      case 'DELETE /assets/:id':
        this.assets = this.assets.filter((a) => a.id !== id);
        return [200, {}];
      default:
        return [404, { error: `fake has no route ${key}` }];
    }
  }
}

// The migration's inputs as they were on develop before phase 3 deleted them, cut down to what
// the scripts read. Each illustration paints its circle a different way: a CSS class with a
// viewBox-only size, an uppercase hex fill, and a gradient whose first stop is the colour.
const SOURCE_FILES: Record<string, string> = {
  'lib/constants/partners.ts': `import badooLogo from '@/public/badoo_logo.svg';
import bloomBadooLogo from '@/public/bloom_badoo_logo.svg';
import bloomBumbleLogo from '@/public/bloom_bumble_logo.svg';
import bloomFruitzLogo from '@/public/bloom_fruitz_logo.svg';
import bumbleLogo from '@/public/bumble_logo.svg';
import fruitzLogo from '@/public/fruitz_logo.svg';
import illustrationBloomHeadPink from '@/public/illustration_bloom_head_pink.svg';
import illustrationBloomHeadPurple from '@/public/illustration_bloom_head_purple.svg';
import illustrationBloomHeadYellow from '@/public/illustration_bloom_head_yellow.svg';

const bumbleContent: PartnerContent = {
  name: 'Bumble',
  logo: bumbleLogo,
  partnershipLogo: bloomBumbleLogo,
  bloomGirlIllustration: illustrationBloomHeadYellow,
  website: 'https://bumble.com',
  instagram: 'https://www.instagram.com/bumble',
  youtube: 'https://www.youtube.com/channel/UCERo8J7mug7cVcwIKaoJLww',
  tiktok: 'https://www.tiktok.com/@bumble',
};

const badooContent: PartnerContent = {
  name: 'Badoo',
  logo: badooLogo,
  partnershipLogo: bloomBadooLogo,
  bloomGirlIllustration: illustrationBloomHeadPurple,
  website: 'https://badoo.com',
  facebook: 'https://www.facebook.com/badoo/',
};

const fruitzContent: PartnerContent = {
  name: 'Fruitz',
  logo: fruitzLogo,
  partnershipLogo: bloomFruitzLogo,
  bloomGirlIllustration: illustrationBloomHeadPink,
  website: 'https://fruitz.io',
};
`,
  'i18n/messages/shared/en.json': JSON.stringify({
    Shared: {
      footer: {
        bumbleLine2: 'BUMBLE HOLDING LTD',
        badooLine2: 'BADOO LTD',
        fruitzLine2: 'FRUITZ LTD',
      },
    },
  }),
  'public/bumble_logo.svg': '<svg width="1062" height="187" viewBox="0 0 1062 187"></svg>',
  'public/bloom_bumble_logo.svg': '<svg width="400" height="232" viewBox="0 0 400 232"></svg>',
  'public/illustration_bloom_head_yellow.svg':
    '<svg viewBox="0 0 987.8 988.02"><defs><style>.cls-1{fill:none;}.cls-2{fill:#f6c651;}</style></defs>' +
    '<rect class="cls-1" width="987.8" height="987.8"/><circle class="cls-2" r="431.9"/><path d="M0" fill="#000"/></svg>',
  'public/badoo_logo.svg': '<svg width="2168.1252" height="480.18524"></svg>',
  'public/bloom_badoo_logo.svg': '<svg width="400" height="232"></svg>',
  'public/illustration_bloom_head_purple.svg':
    '<svg width="988" height="989" fill="none"><g><path d="M503" fill="#E9D8FF"/><path d="M487" fill="black"/></g></svg>',
  'public/fruitz_logo.svg': '<svg width="400" height="95"></svg>',
  'public/bloom_fruitz_logo.svg': '<svg width="300" height="174"></svg>',
  'public/illustration_bloom_head_pink.svg':
    '<svg width="250" height="286"><path d="M125" fill="url(#paint0)"/><path d="M120" fill="black"/>' +
    '<defs><linearGradient id="paint0"><stop stop-color="#E063FF"/><stop offset="1" stop-color="#F9B666"/></linearGradient></defs></svg>',
};

let sourceRoot: string;
let fake: FakeStoryblok;

beforeAll(() => {
  sourceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'partner-sources-'));
  for (const [file, content] of Object.entries(SOURCE_FILES)) {
    fs.mkdirSync(path.dirname(path.join(sourceRoot, file)), { recursive: true });
    fs.writeFileSync(path.join(sourceRoot, file), content);
  }
});

afterAll(() => fs.rmSync(sourceRoot, { recursive: true, force: true }));

const run = (script: string, ...args: string[]) =>
  new Promise<{ code: number; stdout: string; stderr: string }>((resolve) => {
    execFile(
      process.execPath,
      [path.join(__dirname, script), ...args],
      {
        env: {
          ...process.env,
          STORYBLOK_MAPI_BASE: `${fake.url}/v1`,
          STORYBLOK_OAUTH_TOKEN: 'test-token',
          STORYBLOK_SPACE_ID: SPACE_ID,
          PARTNERS_SOURCE_ROOT: sourceRoot,
        },
      },
      (error, stdout, stderr) => resolve({ code: error ? 1 : 0, stdout, stderr }),
    );
  });

beforeEach(async () => {
  fake = new FakeStoryblok();
  await fake.start();
});

afterEach(() => fake.stop());

describe('createPartnerSchema.mjs', () => {
  it('writes nothing without --apply', async () => {
    const { code, stdout } = await run('createPartnerSchema.mjs');

    expect(code).toBe(0);
    expect(stdout).toContain('DRY RUN');
    expect(fake.writes()).toEqual([]);
  });

  it("creates the partner content type from the plan's field table, and a partners/ folder", async () => {
    expect((await run('createPartnerSchema.mjs', '--apply')).code).toBe(0);

    const { schema, is_root } = fake.component('partner')!;
    const fieldsWhere = (test: (field: Json) => boolean) =>
      Object.keys(schema).filter((k) => test(schema[k]));
    expect(is_root).toBe(true);
    expect(Object.keys(schema)).toEqual([
      'name',
      'legal_name',
      'logo',
      'brand_color',
      'partnership_logo',
      'illustration',
      'website',
      'facebook',
      'instagram',
      'twitter',
      'youtube',
      'tiktok',
    ]);
    expect(fieldsWhere((f) => f.required)).toEqual(['name', 'legal_name', 'logo', 'brand_color']);
    expect(fieldsWhere((f) => f.translatable)).toEqual(['partnership_logo']);
    expect(fieldsWhere((f) => f.type === 'asset')).toEqual([
      'logo',
      'partnership_logo',
      'illustration',
    ]);
    expect(fieldsWhere((f) => f.type === 'asset' && f.filetypes.join() === 'images')).toHaveLength(
      3,
    );
    expect(schema.brand_color.regex).toBe('^#[0-9a-fA-F]{6}$');

    expect(fake.story('partners')).toMatchObject({
      is_folder: true,
      parent_id: 0,
      default_root: 'partner',
    });
    expect(fake.writes()).toEqual(['POST /components', 'POST /stories']);
  });

  it('changes nothing when run again', async () => {
    await run('createPartnerSchema.mjs', '--apply');
    fake.requests = [];

    const { stdout } = await run('createPartnerSchema.mjs', '--apply');

    expect(stdout).toContain('up to date');
    expect(fake.writes()).toEqual([]);
  });

  it('restores its own field settings and keeps a field an editor added', async () => {
    await run('createPartnerSchema.mjs', '--apply');
    const partner = fake.component('partner')!;
    partner.schema.brand_color.regex = '';
    partner.schema.notes = { type: 'text' };
    fake.requests = [];

    await run('createPartnerSchema.mjs', '--apply');

    expect(fake.writes()).toEqual([`PUT /components/${partner.id}`]);
    expect(fake.component('partner')!.schema).toMatchObject({
      brand_color: { regex: '^#[0-9a-fA-F]{6}$' },
      notes: { type: 'text' },
    });
  });
});

describe('migratePartners.mjs', () => {
  let folderId: number;
  const asset = (size: string, file: string) => ({
    fieldtype: 'asset',
    filename: `https://a.storyblok.com/f/${SPACE_ID}/${size}/abc/${file}`,
  });

  beforeEach(() => {
    folderId = fake.addFolder('partners');
  });

  it('writes nothing without --apply', async () => {
    const { code } = await run('migratePartners.mjs');

    expect(code).toBe(0);
    expect(fake.writes()).toEqual([]);
  });

  it('creates Bumble as a draft from the constants, footer strings and files', async () => {
    expect((await run('migratePartners.mjs', '--apply')).code).toBe(0);

    expect(fake.story('partners/bumble')).toMatchObject({
      name: 'Bumble',
      parent_id: folderId,
      published: false,
      content: {
        component: 'partner',
        name: 'Bumble',
        legal_name: 'BUMBLE HOLDING LTD',
        brand_color: '#f6c651',
        logo: asset('1062x187', 'bumble_logo.svg'),
        partnership_logo: asset('400x232', 'bloom_bumble_logo.svg'),
        illustration: asset('988x988', 'illustration_bloom_head_yellow.svg'),
        website: 'https://bumble.com',
        facebook: '',
        instagram: 'https://www.instagram.com/bumble',
        twitter: '',
        youtube: 'https://www.youtube.com/channel/UCERo8J7mug7cVcwIKaoJLww',
        tiktok: 'https://www.tiktok.com/@bumble',
      },
    });
  });

  it.each([
    // Each illustration paints its circle differently: a CSS class, a hex fill, a gradient.
    ['bumble', 'Bumble', 'BUMBLE HOLDING LTD', '#f6c651'],
    ['badoo', 'Badoo', 'BADOO LTD', '#e9d8ff'],
    ['fruitz', 'Fruitz', 'FRUITZ LTD', '#e063ff'],
  ])("reads %s's name, legal name and brand colour", async (slug, name, legalName, color) => {
    await run('migratePartners.mjs', '--apply');

    expect(fake.story(`partners/${slug}`)!.content).toMatchObject({
      name,
      legal_name: legalName,
      brand_color: color,
    });
  });

  it('uploads each file once to the Partners asset folder, keeping its filename', async () => {
    await run('migratePartners.mjs', '--apply');

    const uploads = fake.requests.filter((r) => r.method === 'POST' && r.path === '/assets');
    expect(uploads.map((r) => r.body!.filename)).toEqual([
      'bumble_logo.svg',
      'bloom_bumble_logo.svg',
      'illustration_bloom_head_yellow.svg',
      'badoo_logo.svg',
      'bloom_badoo_logo.svg',
      'illustration_bloom_head_purple.svg',
      'fruitz_logo.svg',
      'bloom_fruitz_logo.svg',
      'illustration_bloom_head_pink.svg',
    ]);
    expect(uploads.every((r) => r.body!.asset_folder_id === PARTNERS_ASSET_FOLDER_ID)).toBe(true);
  });

  it('never publishes and never writes to the partners datasource', async () => {
    await run('migratePartners.mjs', '--apply');

    const created = fake.requests.filter((r) => r.method === 'POST' && r.path === '/stories');
    expect(created).toHaveLength(3);
    expect(created.every((r) => !('publish' in r.body!))).toBe(true);
    expect(fake.writes().filter((w) => /publish|datasource/.test(w))).toEqual([]);
  });

  it('reuses assets and leaves an edited story alone when run again', async () => {
    await run('migratePartners.mjs', '--apply');
    fake.story('partners/bumble')!.content.website = 'https://bumble.com/en';
    fake.requests = [];

    const { stdout } = await run('migratePartners.mjs', '--apply');

    expect(fake.writes()).toEqual([]);
    expect(stdout).toContain('differs: website');
    expect(fake.story('partners/bumble')!.content.website).toBe('https://bumble.com/en');
  });

  it('writes nothing when a name differs from the partners datasource', async () => {
    fake.entries = fake.entries.map((e) => (e.name === 'badoo' ? { ...e, value: 'Badoo Ltd' } : e));

    const { code, stderr } = await run('migratePartners.mjs', '--apply');

    expect(code).toBe(1);
    expect(stderr).toContain('badoo: datasource value "Badoo Ltd"');
    expect(fake.writes()).toEqual([]);
  });

  it('writes nothing without the partners/ folder', async () => {
    fake.stories = [];

    const { code, stderr } = await run('migratePartners.mjs', '--apply');

    expect(code).toBe(1);
    expect(stderr).toContain('createPartnerSchema.mjs --apply');
    expect(fake.writes()).toEqual([]);
  });

  it('removes the asset record when its upload fails, so a re-run uploads it again', async () => {
    fake.failUploads = true;

    expect((await run('migratePartners.mjs', '--apply')).code).toBe(1);
    expect(fake.assets).toEqual([]);
    expect(fake.story('partners/bumble')).toBeUndefined();
  });

  describe('--publish', () => {
    it('publishes nothing unless all three stories exist', async () => {
      await run('migratePartners.mjs', '--apply');
      fake.stories = fake.stories.filter((s) => s.full_slug !== 'partners/fruitz');
      fake.requests = [];

      const { code, stderr } = await run('migratePartners.mjs', '--publish', '--apply');

      expect(code).toBe(1);
      expect(stderr).toContain('partners/fruitz not found');
      expect(fake.writes()).toEqual([]);
    });

    it('publishes nothing without --apply', async () => {
      await run('migratePartners.mjs', '--apply');
      fake.requests = [];

      const { stdout } = await run('migratePartners.mjs', '--publish');

      expect(stdout).toContain('would publish');
      expect(fake.writes()).toEqual([]);
    });

    it('publishes the three partner stories, and only once', async () => {
      await run('migratePartners.mjs', '--apply');
      fake.requests = [];

      await run('migratePartners.mjs', '--publish', '--apply');
      const ids = ['bumble', 'badoo', 'fruitz'].map((s) => fake.story(`partners/${s}`)!.id);
      expect(fake.writes()).toEqual(ids.map((id) => `GET /stories/${id}/publish`));

      fake.requests = [];
      await run('migratePartners.mjs', '--publish', '--apply');
      expect(fake.writes()).toEqual([]);
    });
  });
});
