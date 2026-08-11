#!/usr/bin/env node
/**
 * provisionStoryblokComponents.mjs — set up the Storyblok side of the redesigned home page:
 * the `link_card`, `quote_card` and `avatar_group` bloks, the `home_page` content type, and
 * (optionally) a `home-redesign` story composed from them.
 *
 * The three bloks are the CMS face of components the app already ships:
 *   link_card    → components/common/LinkCard.tsx     (also used by the "Get support" section)
 *   quote_card   → components/common/QuoteCard.tsx
 *   avatar_group → components/common/AvatarGroup.tsx
 * Placed inside a `row_new`, they give an editor the same cards the app renders, so section
 * layout lives in Storyblok rather than in code.
 *
 * SAFETY MODEL (read before running):
 *   1. Dry-run by default. Nothing is written unless you pass --write --yes.
 *   2. The existing `home` story is never read for writing, modified, or published. The redesign
 *      goes to a NEW story (`home-redesign`), so production keeps serving the current page.
 *   3. Stories are created unpublished. Publishing is a deliberate act in the editor.
 *   4. Idempotent. Components and the story are matched by name/slug and updated in place.
 *   5. Whitelists are only ever EXTENDED — existing allowed components are preserved.
 *   6. Everything touched is snapshotted to ./.storyblok-provision/ first, and Storyblok keeps its
 *      own version history, so rollback is always possible.
 *
 * USAGE:
 *   # 1. See the plan (no writes; snapshots the current schemas to disk):
 *   node scripts/provisionStoryblokComponents.mjs
 *
 *   # 2. Create the bloks, the content type, and extend the page_section whitelist:
 *   node scripts/provisionStoryblokComponents.mjs --write --yes
 *
 *   # 3. Also create the `home-redesign` story and its sections:
 *   node scripts/provisionStoryblokComponents.mjs --content --write --yes
 *
 *   # Review the composed sections as JSON without contacting Storyblok:
 *   node scripts/provisionStoryblokComponents.mjs --print-content
 *
 * CUTOVER (manual, once the redesign is signed off):
 *   Delete the old `home` story, rename `home-redesign` to `home`, then point HOME_SLUG in
 *   app/[locale]/page.tsx back at `home`.
 *
 * ENV (.env.local is auto-loaded if present):
 *   STORYBLOK_OAUTH_TOKEN   Management API token with write scope. REQUIRED.
 *   STORYBLOK_SPACE_ID      Numeric space id. REQUIRED.
 *   STORYBLOK_MAPI_BASE     Management API base. Default https://mapi.storyblok.com/v1 (EU).
 *
 * FLAGS:
 *   --content        Also create/update the `home-redesign` story.
 *   --print-content  Print the composed story content as JSON and exit. Needs no token.
 *   --write          Actually write to Storyblok. Requires --yes.
 *   --yes            Confirm writes (guards against an accidental --write).
 *   --slug <s>       Story slug to compose. Default `home-redesign`.
 *   --help           Show this header.
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SNAPSHOT_DIR = path.join(REPO_ROOT, '.storyblok-provision');

const DEFAULT_SLUG = 'home-redesign';

// ------------------------------------ CLI + env ------------------------------------

function parseArgs(argv) {
  const args = {
    content: false,
    printContent: false,
    write: false,
    yes: false,
    slug: DEFAULT_SLUG,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--content') args.content = true;
    else if (a === '--print-content') args.printContent = true;
    else if (a === '--write') args.write = true;
    else if (a === '--yes') args.yes = true;
    else if (a === '--slug') args.slug = argv[++i];
    else if (a === '--help' || a === '-h') {
      console.log(
        fs
          .readFileSync(fileURLToPath(import.meta.url), 'utf8')
          .split('*/')[0]
          .slice(3),
      );
      process.exit(0);
    } else {
      console.error(`Unknown argument: ${a}`);
      process.exit(1);
    }
  }
  return args;
}

// Minimal .env.local loader (no dependency). Only fills vars that aren't already set.
function loadDotEnv() {
  const file = path.join(REPO_ROOT, '.env.local');
  if (!fs.existsSync(file)) return;
  for (const raw of fs.readFileSync(file, 'utf8').split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    if (process.env[key] !== undefined) continue;
    let val = line.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    process.env[key] = val;
  }
}

function required(name) {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing required env var ${name} (set it in .env.local).`);
    process.exit(1);
  }
  return value;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ------------------------- Storyblok Management API -------------------------

function mapiBase() {
  return (process.env.STORYBLOK_MAPI_BASE || 'https://mapi.storyblok.com/v1').replace(/\/$/, '');
}

// Personal access tokens authenticate with the raw token; OAuth tokens need a "Bearer " prefix.
// Try raw first, fall back to Bearer once, and remember which worked.
let authPrefix = process.env.STORYBLOK_AUTH_SCHEME === 'bearer' ? 'Bearer ' : '';

async function mapi(method, route, body) {
  const token = required('STORYBLOK_OAUTH_TOKEN');
  const spaceId = required('STORYBLOK_SPACE_ID');
  const url = `${mapiBase()}/spaces/${spaceId}${route}`;

  const send = (prefix) =>
    fetch(url, {
      method,
      headers: { Authorization: `${prefix}${token}`, 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });

  for (let attempt = 0; attempt < 5; attempt++) {
    let res = await send(authPrefix);

    if (res.status === 401 && authPrefix === '') {
      const alt = await send('Bearer ');
      if (alt.ok) {
        authPrefix = 'Bearer ';
        res = alt;
      }
    }

    if (res.status === 429) {
      const wait = 1000 * (attempt + 1);
      console.warn(`  rate limited, retrying in ${wait}ms…`);
      await sleep(wait);
      continue;
    }
    if (!res.ok) {
      const text = await res.text();
      const hint =
        res.status === 401
          ? '\n  → 401 usually means STORYBLOK_OAUTH_TOKEN is missing, expired, or is the public ' +
            'delivery token rather than a Management API token. Create a fresh one under ' +
            'My Account → Personal access tokens, and confirm STORYBLOK_SPACE_ID and the region ' +
            '(set STORYBLOK_MAPI_BASE, e.g. https://api-us.storyblok.com/v1 for US).'
          : '';
      throw new Error(`Storyblok ${method} ${route} → ${res.status}: ${text}${hint}`);
    }
    return res.status === 204 ? null : res.json();
  }
  throw new Error(`Storyblok ${method} ${route} → too many rate-limit retries`);
}

function snapshot(name, data) {
  fs.mkdirSync(SNAPSHOT_DIR, { recursive: true });
  const file = path.join(SNAPSHOT_DIR, `${name}.json`);
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
  return path.relative(REPO_ROOT, file);
}

// ------------------------------- Component schemas -------------------------------

// Colour, size and alignment fields across this space read from internal datasources rather than
// inline options, so the new components use the same ones.
const fromDatasource = (slug, extra = {}) => ({
  type: 'option',
  source: 'internal',
  datasource_slug: slug,
  ...extra,
});

// The group nestable content bloks live in ("General"); resolved by name at run time.
const NESTABLE_GROUP = 'General';
const PAGES_GROUP = 'Pages';

// Field order is the editor's form order. `translatable: true` is what translateStoryblok.mjs
// picks up when filling in the non-English locales, so every visible string carries it.
const componentSchemas = (groupUuid, pagesGroupUuid) => ({
  link_card: {
    name: 'link_card',
    display_name: 'Link card',
    is_root: false,
    is_nestable: true,
    component_group_uuid: groupUuid,
    schema: {
      title: {
        type: 'text',
        pos: 0,
        required: true,
        translatable: true,
        description: 'The card heading, e.g. "I need help right now".',
      },
      description: {
        type: 'textarea',
        pos: 1,
        translatable: true,
        description: 'One supporting line under the title. Leave blank for a title-only card.',
      },
      link: {
        type: 'multilink',
        pos: 2,
        required: true,
        description:
          'Where the card leads. A page inside Bloom keeps the reader’s language; a link elsewhere opens in a new tab.',
      },
      icon: {
        type: 'asset',
        pos: 3,
        filetypes: ['images'],
        description:
          'Optional small illustration shown beside the title. Leave empty for a card with no icon.',
      },
      size: {
        type: 'option',
        pos: 4,
        default_value: 'small',
        options: [
          { name: 'Small — fits three across a row', value: 'small' },
          { name: 'Large — taller, fits two across a row', value: 'large' },
        ],
        description: 'How tall the card is. Set the column widths in the row to match.',
      },
      background: {
        ...fromDatasource('colors', { default_value: 'common.white' }),
        pos: 5,
        description: 'The card’s background colour.',
      },
      hide_arrow: {
        type: 'boolean',
        pos: 6,
        description: 'Tick to leave off the arrow panel on the end of the card.',
      },
      arrow_color: {
        ...fromDatasource('colors', { default_value: 'secondary.light' }),
        pos: 7,
        description: 'The colour of the panel holding the arrow.',
      },
      event_name: {
        type: 'text',
        pos: 8,
        description:
          'Optional. A short label for analytics that stays the same when the title is reworded or translated. Defaults to the title.',
      },
    },
  },
  quote_card: {
    name: 'quote_card',
    display_name: 'Quote card',
    is_root: false,
    is_nestable: true,
    component_group_uuid: groupUuid,
    schema: {
      text: {
        type: 'richtext',
        pos: 0,
        required: true,
        translatable: true,
        description: 'What the person said, in their own words.',
      },
      attribution: {
        type: 'text',
        pos: 1,
        translatable: true,
        description:
          'Optional. Who said it. Survivor quotes are usually anonymous — leave blank unless consent is explicit.',
      },
      text_size: {
        ...fromDatasource('sizes', { default_value: 'small' }),
        pos: 2,
        description: 'How large the quote reads.',
      },
      background: {
        ...fromDatasource('colors', { default_value: 'primary.light' }),
        pos: 3,
        description: 'The card’s background colour.',
      },
    },
  },
  avatar_group: {
    name: 'avatar_group',
    display_name: 'Avatar group',
    is_root: false,
    is_nestable: true,
    component_group_uuid: groupUuid,
    schema: {
      images: {
        type: 'multiasset',
        pos: 0,
        required: true,
        filetypes: ['images'],
        description: 'Portraits, shown as circles in the order you add them.',
      },
      size: {
        type: 'option',
        pos: 1,
        default_value: 'medium',
        options: [
          { name: 'Small', value: 'small' },
          { name: 'Medium', value: 'medium' },
          { name: 'Large', value: 'large' },
        ],
        description: 'How big each circle is.',
      },
      layout: {
        type: 'option',
        pos: 2,
        default_value: 'row',
        options: [
          { name: 'Row — side by side', value: 'row' },
          { name: 'Cluster — one leading portrait with two beneath', value: 'cluster' },
        ],
        description: 'Cluster suits exactly three portraits; more than that fall back to a row.',
      },
      alignment: {
        ...fromDatasource('alignments', { default_value: 'left' }),
        pos: 3,
        description: 'Where the group sits in its column.',
      },
      separate: {
        type: 'boolean',
        pos: 4,
        description:
          'Row layout only. Tick to space the portraits out instead of overlapping them.',
      },
    },
  },
  home_page: {
    name: 'home_page',
    display_name: 'Home page',
    is_root: true,
    is_nestable: false,
    component_group_uuid: pagesGroupUuid,
    schema: {
      title: {
        type: 'text',
        pos: 0,
        required: true,
        translatable: true,
        description: 'The headline in the hero section.',
      },
      introduction: {
        type: 'richtext',
        pos: 1,
        required: true,
        translatable: true,
        description: 'The paragraph under the headline.',
      },
      header_image: {
        type: 'asset',
        pos: 2,
        filetypes: ['images'],
        description: 'The illustration beside the headline.',
      },
      top_sections: {
        type: 'bloks',
        pos: 3,
        restrict_components: true,
        component_whitelist: ['page_section', 'notes_from_bloom_promo'],
        description:
          'Sections between the hero and the courses and sessions sections — e.g. "What brings you here today?".',
      },
      bottom_sections: {
        type: 'bloks',
        pos: 4,
        restrict_components: true,
        component_whitelist: ['page_section', 'notes_from_bloom_promo'],
        description:
          'Sections below the courses and sessions sections, closing the page — e.g. "Get support" or "What Bloom users say".',
      },
      featured_sessions: {
        type: 'options',
        pos: 5,
        source: 'internal_stories',
        use_uuid: true,
        description:
          'Up to three single sessions to feature — a short, a conversation, a somatic video, or a session from inside a course. Leave empty to show the first three automatically.',
      },
      featured_courses: {
        type: 'options',
        pos: 6,
        source: 'internal_stories',
        folder_slug: 'courses',
        use_uuid: true,
        description:
          'Up to three courses to feature. Leave empty to show the first three automatically.',
      },
      seo_description: {
        type: 'text',
        pos: 7,
        translatable: true,
        description: 'Meta description for search results.',
      },
    },
  },
});

// These bloks are placed inside rows, and a row's columns hold unrestricted rich text — so the
// only whitelist that has to change is the one on the section wrapper.
// Fields added to components that already exist. Merged into the live schema — never a whole-schema
// PUT, which would drop every field these shared components already have. Both default to today's
// behaviour, so other pages are unaffected.
const SCHEMA_ADDITIONS = {
  button: {
    variant: {
      type: 'option',
      pos: 4,
      default_value: 'contained',
      options: [
        { name: 'Filled', value: 'contained' },
        { name: 'Outlined', value: 'outlined' },
      ],
      description: 'Filled for a primary action, outlined for a secondary one.',
    },
  },
  row_new: {
    mobile_stack_order: {
      type: 'option',
      pos: 5,
      default_value: '',
      options: [
        { name: 'Default — source order', value: '' },
        { name: 'Reverse — last column first', value: 'reverse' },
      ],
      description: 'Reverse lets a media column lead once the row stacks on mobile.',
    },
  },
  page_section: {
    divider: {
      type: 'boolean',
      pos: 7,
      description: 'Draws a hairline above the section, for sections that share a background.',
    },
    spacing: {
      type: 'option',
      pos: 6,
      default_value: 'default',
      options: [
        { name: 'Default', value: 'default' },
        { name: 'Compact', value: 'compact' },
      ],
      description: 'Compact reduces the space above and below the section.',
    },
    width: {
      type: 'option',
      pos: 8,
      default_value: 'default',
      options: [
        { name: 'Default — page width', value: 'default' },
        { name: 'Wide', value: 'wide' },
        { name: 'Full bleed — no gutters', value: 'full' },
      ],
      description: 'How far the section content spreads. Full bleed removes its padding entirely.',
    },
  },
};

// Property tweaks to fields that already exist. Only the listed properties are touched; the rest of
// each field definition is preserved. `button.text` capped at 30 characters, which several
// translations of "Join Bloom, always free" exceed (Portuguese is 34), blocking saves in the editor.
const SCHEMA_FIELD_PATCHES = {
  button: { text: { max_length: 60 } },
};

async function patchSchemaFields(byName, { write }) {
  for (const [name, fields] of Object.entries(SCHEMA_FIELD_PATCHES)) {
    const component = byName.get(name);
    if (!component) {
      console.warn(`  ⚠ "${name}" not in this space — skipping`);
      continue;
    }
    const stale = Object.entries(fields).filter(([field, props]) =>
      Object.entries(props).some(([k, v]) => component.schema?.[field]?.[k] !== v),
    );
    if (!stale.length) {
      console.log(`  "${name}" field properties already match`);
      continue;
    }
    for (const [field, props] of stale) {
      console.log(`  "${name}.${field}": set ${JSON.stringify(props)}`);
    }
    if (!write) continue;

    snapshot(`component-${name}.before`, component);
    const schema = structuredClone(component.schema);
    for (const [field, props] of stale) schema[field] = { ...schema[field], ...props };
    const updated = await mapi('PUT', `/components/${component.id}`, {
      component: { ...component, schema },
    });
    byName.set(name, updated.component);
    console.log('    updated');
  }
}

async function addSchemaFields(byName, { write }) {
  for (const [name, fields] of Object.entries(SCHEMA_ADDITIONS)) {
    const component = byName.get(name);
    if (!component) {
      console.warn(`  ⚠ "${name}" not in this space — skipping`);
      continue;
    }
    const missing = Object.keys(fields).filter((f) => !component.schema?.[f]);
    if (!missing.length) {
      console.log(`  "${name}" already has ${Object.keys(fields).join(', ')}`);
      continue;
    }
    console.log(`  "${name}": add ${missing.join(', ')}`);
    if (!write) continue;

    snapshot(`component-${name}.before`, component);
    const schema = { ...structuredClone(component.schema) };
    for (const field of missing) schema[field] = fields[field];
    const updated = await mapi('PUT', `/components/${component.id}`, {
      component: { ...component, schema },
    });
    byName.set(name, updated.component);
    console.log('    updated');
  }
}

const SECTION_BLOKS = ['link_card', 'quote_card', 'avatar_group'];

async function ensureComponents(components, schemas, { write }) {
  const byName = new Map(components.map((c) => [c.name, c]));

  for (const [name, desired] of Object.entries(schemas)) {
    const existing = byName.get(name);
    if (existing) {
      console.log(`  "${name}": exists (id ${existing.id}) → update schema in place`);
      if (!write) continue;
      snapshot(`component-${name}.before`, existing);
      const updated = await mapi('PUT', `/components/${existing.id}`, {
        component: { ...desired, id: existing.id },
      });
      byName.set(name, updated.component);
      console.log('    updated');
    } else {
      console.log(`  "${name}": missing → create`);
      if (!write) continue;
      const created = await mapi('POST', '/components', { component: desired });
      byName.set(name, created.component);
      console.log(`    created (id ${created.component.id})`);
    }
  }
  return byName;
}

// A richtext/bloks field only accepts specific components when `restrict_components` is on. Where
// it is, the card bloks have to be added or editors cannot insert them.
async function extendSectionWhitelist(byName, { write }) {
  const pageSection = byName.get('page_section');
  if (!pageSection) {
    console.warn('  ⚠ no `page_section` component in this space — skipping');
    return;
  }

  const field = pageSection.schema?.content;
  if (!field?.restrict_components) {
    console.log('  `page_section.content` is unrestricted — nothing to do');
    return;
  }

  const whitelist = field.component_whitelist || [];
  const missing = SECTION_BLOKS.filter((name) => !whitelist.includes(name));
  if (!missing.length) {
    console.log('  `page_section.content` already accepts the new bloks');
    return;
  }

  console.log(`  \`page_section.content\`: allow ${missing.join(', ')}`);
  if (!write) return;

  snapshot('component-page_section.before', pageSection);
  const schema = structuredClone(pageSection.schema);
  schema.content.component_whitelist = [...whitelist, ...missing];
  await mapi('PUT', `/components/${pageSection.id}`, {
    component: { ...pageSection, schema },
  });
  console.log('    updated');
}

// ---------------------------------- Story content ----------------------------------

const uid = () => crypto.randomUUID();

// Assets already in the space, reused so the story needs no uploads.
const HERO_IMAGE = {
  id: 13212668,
  filename: 'https://a.storyblok.com/f/142459/411x401/27f8994191/landing_page_illustration.svg',
  alt: 'bloomHomeIllustration',
};
const QUOTE_IMAGE = {
  id: 7155985,
  filename: 'https://a.storyblok.com/f/142459/x/481d1f2336/illustration_person4_peach.svg',
  alt: '',
};
// Portraits for the team section, from the meet-the-team story's core team.
const TEAM_PORTRAITS = [
  {
    id: 13457352,
    filename: 'https://a.storyblok.com/f/142459/1585x1632/8be9649252/hera2.jpeg',
    alt: 'Hera Hussain',
  },
  {
    id: 10975617,
    filename: 'https://a.storyblok.com/f/142459/2048x1536/f98f1767b3/img-20220609-wa0009.jpg',
    alt: 'Francesca Jarvis',
  },
  {
    id: 15546423,
    filename: 'https://a.storyblok.com/f/142459/1280x958/b6b9cbea06/carolina-headshot.jpg',
    alt: 'Carolina Cal',
  },
];

const asset = ({ id, filename, alt }) => ({ id, filename, alt, fieldtype: 'asset', name: '' });

const paragraph = (text) => ({ type: 'paragraph', content: [{ type: 'text', text }] });

const heading = (text, level = 2) => ({
  type: 'heading',
  attrs: { level },
  content: [{ type: 'text', text }],
});

const blokNode = (blok) => ({ type: 'blok', attrs: { id: uid(), body: [blok] } });

const doc = (nodes) => ({ type: 'doc', content: nodes });

const linkCard = ({
  title,
  description,
  url,
  size = 'small',
  background = 'panelSurface',
  arrowColor = 'secondary.light',
  icon,
  eventName,
}) => ({
  _uid: uid(),
  component: 'link_card',
  title,
  description,
  size,
  background,
  arrow_color: arrowColor,
  hide_arrow: false,
  event_name: eventName,
  icon: icon ? asset(icon) : { fieldtype: 'asset', filename: '', alt: '', name: '', id: null },
  link: { id: '', url, linktype: 'url', fieldtype: 'multilink', cached_url: url },
});

const quoteCard = (quote) => ({
  _uid: uid(),
  component: 'quote_card',
  attribution: '',
  text_size: 'medium',
  background: 'pageBackground',
  text: doc([paragraph(quote)]),
});

const avatarGroup = (images) => ({
  _uid: uid(),
  component: 'avatar_group',
  images: images.map(asset),
  size: 'large',
  layout: 'cluster',
  alignment: 'center',
  separate: false,
});

const button = (text, url, variant = 'contained') => ({
  _uid: uid(),
  component: 'button',
  text,
  color: 'primary.dark',
  size: 'medium',
  variant,
  link: { id: '', url, linktype: 'url', fieldtype: 'multilink', cached_url: url },
});

// A column's width is its share of the row rather than a fixed percentage (see
// components/common/Column.tsx), so equal widths tile evenly: three `small-medium` columns are
// thirds, and `medium` beside `large` splits 40/60.
const column = (width, nodes, overrides = {}) => ({
  _uid: uid(),
  component: 'row_column',
  width,
  horizontal_alignment: 'left',
  content: doc(nodes),
  ...overrides,
});

const row = (columns, overrides = {}) => ({
  _uid: uid(),
  component: 'row_new',
  columns,
  horizontal_alignment: 'left',
  vertical_alignment: '',
  gap: 'small',
  ...overrides,
});

const pageSection = (color, nodes, overrides = {}) => ({
  _uid: uid(),
  component: 'page_section',
  color,
  alignment: 'left',
  width: 'default',
  spacing: 'compact',
  authenticated_hide: false,
  unauthenticated_hide: false,
  content: doc(nodes),
  ...overrides,
});

// The redesigned home page's editor-composed sections. English only — the other locales are filled
// in afterwards by scripts/translateStoryblok.mjs.
function homeStoryContent() {
  const introSection = pageSection('common.white', [
    heading('What brings you here today?'),
    blokNode(
      row([
        column('small-medium', [
          blokNode(
            linkCard({
              title: 'I need help right now',
              description: 'Find immediate help and crisis resources',
              url: 'https://www.chayn.co/help',
              eventName: 'entry_point_help',
            }),
          ),
        ]),
        column('small-medium', [
          blokNode(
            linkCard({
              title: 'I want to look around',
              description: 'Browse sessions at your own pace',
              url: '/library',
              eventName: 'entry_point_browse',
            }),
          ),
        ]),
        column('small-medium', [
          blokNode(
            linkCard({
              title: 'I want a guided experience',
              description: 'Follow a curated healing course',
              url: '/library?type=course',
              eventName: 'entry_point_guided',
            }),
          ),
        ]),
      ]),
    ),
  ]);

  const teamSection = pageSection(
    'primary.light',
    [
      blokNode(
        // On mobile the design leads with the portraits and centres the block; from `md` the copy
        // sits on the left with the portraits alongside it.
        row(
          [
            column(
              'large',
              [
                heading('The team behind Bloom'),
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Built by a global team of advocates and survivors, united by care for the people who come to Bloom.',
                    },
                  ],
                },
                blokNode(button('Meet the team', '/meet-the-team', 'outlined')),
              ],
              { horizontal_alignment: 'mobile-center-desktop-left' },
            ),
            column('small-medium', [blokNode(avatarGroup(TEAM_PORTRAITS))], {
              horizontal_alignment: 'mobile-center-desktop-left',
            }),
          ],
          { horizontal_alignment: 'mobile-center-desktop-left', mobile_stack_order: 'reverse' },
        ),
      ),
    ],
    { divider: true, alignment: 'mobile-center-desktop-left' },
  );

  const quotesSection = pageSection('secondary.light', [
    heading('What Bloom users say'),
    blokNode(
      row([
        column('large', [
          blokNode(
            quoteCard(
              'It has brought so much clarity to my past experiences, putting words, labels, researched proof to what I didn’t know how to explain or process, I just knew the feelings.',
            ),
          ),
          blokNode(
            quoteCard(
              'Bloom has been a great experience for me. The course has made me reflect a lot on what it means to “work on yourself” and how that looks like. And through Bloom, I’ve realized that working on yourself is similar to school or hobbies — it takes commitment, time, and studying.',
            ),
          ),
        ]),
        column('small-medium', [
          blokNode({
            _uid: uid(),
            component: 'image',
            image: asset(QUOTE_IMAGE),
            size: 'medium',
            alignment: 'center',
          }),
          blokNode(button('Join Bloom, always free', '/auth/register')),
        ]),
      ]),
    ),
  ]);

  return {
    component: 'home_page',
    title: 'A free, safe space to heal from gender-based violence',
    introduction: doc([
      paragraph(
        'Bloom is a free place to learn, heal, and find support at whatever pace feels right for you.',
      ),
    ]),
    header_image: asset(HERO_IMAGE),
    featured_sessions: [],
    featured_courses: [],
    top_sections: [introSection],
    bottom_sections: [teamSection, quotesSection],
    seo_description:
      'Bloom is a free, trauma-informed space from Chayn for survivors of gender-based violence — courses, single sessions and 1-to-1 support, in your own time.',
  };
}

async function upsertStory(slug, { write }) {
  const found = await mapi('GET', `/stories/?by_slugs=${encodeURIComponent(slug)}`);
  const match = (found.stories || []).find((s) => s.full_slug === slug || s.slug === slug);
  const content = homeStoryContent();

  if (match) {
    const { story } = await mapi('GET', `/stories/${match.id}`);
    console.log(`  "${slug}" exists (id ${story.id}) → replace its content`);
    console.log(`    snapshotted → ${snapshot(`story-${slug}.before`, story)}`);
    if (!write) return;
    await mapi('PUT', `/stories/${story.id}`, {
      story: { ...story, content },
      publish: 0,
    });
    console.log('    updated (still unpublished)');
    return;
  }

  console.log(`  "${slug}" missing → create as an unpublished story`);
  if (!write) return;
  const created = await mapi('POST', '/stories', {
    story: { name: 'Home (redesign)', slug, content, is_folder: false, parent_id: 0 },
    publish: 0,
  });
  console.log(`    created (id ${created.story.id}), unpublished`);
}

// -------------------------------------- main --------------------------------------

async function main() {
  const args = parseArgs(process.argv.slice(2));
  loadDotEnv();

  // Review path: shows exactly what --content would write, without contacting Storyblok.
  if (args.printContent) {
    console.log(JSON.stringify(homeStoryContent(), null, 2));
    return;
  }

  if (args.write && !args.yes) {
    console.error('--write requires --yes as confirmation.');
    process.exit(1);
  }
  const write = args.write && args.yes;
  console.log(write ? 'MODE: WRITE (stories stay unpublished)' : 'MODE: DRY RUN (no writes)');

  const { component_groups: groups } = await mapi('GET', '/component_groups/');
  const groupUuid = groups.find((g) => g.name === NESTABLE_GROUP)?.uuid;
  const pagesGroupUuid = groups.find((g) => g.name === PAGES_GROUP)?.uuid;
  const schemas = componentSchemas(groupUuid, pagesGroupUuid);

  const { components } = await mapi('GET', '/components/?per_page=100');
  snapshot('components.before', components);

  console.log(`\nComponents (${components.length} in space):`);
  const byName = await ensureComponents(components, schemas, { write });

  console.log('\nExisting components:');
  await addSchemaFields(byName, { write });
  await patchSchemaFields(byName, { write });

  console.log('\nWhitelists:');
  await extendSectionWhitelist(byName, { write });

  if (args.content) {
    console.log(`\nStory ("${args.slug}"):`);
    await upsertStory(args.slug, { write });
  } else {
    console.log('\nStory: skipped (pass --content to create it).');
  }

  console.log(
    write
      ? '\nDone. Review in the Storyblok editor, then publish manually when ready.'
      : '\nDry run complete. Re-run with --write --yes to apply.',
  );
}

main().catch((error) => {
  console.error(`\n${error.message}`);
  process.exit(1);
});
