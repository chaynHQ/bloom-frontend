/**
 * Creates the `partner` content type and the partners/ folder.
 *
 *   node scripts/partners/createPartnerSchema.mjs            # dry run
 *   node scripts/partners/createPartnerSchema.mjs --apply
 *
 * Schema changes are live for editors at once: one space serves staging and production.
 */
import {
  APPLY,
  findStory,
  logMode,
  mapi,
  PARTNER_COMPONENT,
  PARTNERS_FOLDER_SLUG,
} from './lib.mjs';

const text = (display_name, extra = {}) => ({
  type: 'text',
  display_name,
  required: false,
  translatable: false,
  ...extra,
});
const image = (display_name, extra = {}) => ({
  type: 'asset',
  display_name,
  required: false,
  translatable: false,
  filetypes: ['images'],
  allow_external_url: false,
  ...extra,
});

const fields = {
  name: text('Name', {
    required: true,
    description: 'Display name. Must equal the value used in "Included for partners".',
  }),
  legal_name: text('Legal name', {
    required: true,
    description: "The footer's second line, e.g. BUMBLE HOLDING LTD",
  }),
  logo: image('Logo', {
    required: true,
    description: "The partner's own logo, SVG or transparent PNG",
  }),
  brand_color: text('Brand colour', {
    required: true,
    regex: '^#[0-9a-fA-F]{6}$',
    description: 'Hex colour, e.g. #F6C651',
  }),
  partnership_logo: image('Partnership logo', {
    translatable: true,
    description: 'The "Bloom × partner" lockup, one per language',
  }),
  illustration: image('Illustration', {
    description: "The Bloom-head illustration in the partner's colour",
  }),
  website: text('Website'),
  facebook: text('Facebook'),
  instagram: text('Instagram'),
  twitter: text('Twitter'),
  youtube: text('YouTube'),
  tiktok: text('TikTok'),
};

const schema = Object.fromEntries(
  Object.entries(fields).map(([key, def], pos) => [key, { ...def, pos }]),
);

const settings = {
  name: PARTNER_COMPONENT,
  display_name: 'Partner',
  is_root: true,
  is_nestable: false,
  preview_field: 'name',
};
const component = { ...settings, schema };

async function ensureComponent() {
  const { components } = await mapi('GET', '/components?per_page=100');
  const existing = components.find((c) => c.name === PARTNER_COMPONENT);
  if (!existing) {
    console.log(
      `Component "${PARTNER_COMPONENT}": would create with fields ${Object.keys(schema).join(', ')}`,
    );
    if (APPLY) {
      const { component: created } = await mapi('POST', '/components', { component });
      console.log(`  created #${created.id}`);
    }
    return;
  }
  // Only the fields and properties set here are compared and written. Storyblok adds its own
  // defaults to stored fields, and an editor may have added fields of their own.
  const differs = (stored, wanted) =>
    Object.entries(wanted).some(([k, v]) => JSON.stringify(stored?.[k]) !== JSON.stringify(v));
  const changed = Object.keys(schema).filter((k) => differs(existing.schema[k], schema[k]));
  if (!changed.length && !differs(existing, settings)) {
    console.log(`Component "${PARTNER_COMPONENT}" (#${existing.id}): up to date`);
    return;
  }
  console.log(
    `Component "${PARTNER_COMPONENT}" (#${existing.id}): would update ${changed.join(', ') || 'settings'}`,
  );
  if (APPLY) {
    const merged = { ...existing.schema };
    for (const [k, def] of Object.entries(schema)) merged[k] = { ...existing.schema[k], ...def };
    await mapi('PUT', `/components/${existing.id}`, {
      component: { ...component, id: existing.id, schema: merged },
    });
    console.log('  updated');
  }
}

async function ensureFolder() {
  const existing = await findStory(PARTNERS_FOLDER_SLUG);
  if (existing) {
    console.log(`Folder ${PARTNERS_FOLDER_SLUG}/ (#${existing.id}): exists`);
    return;
  }
  console.log(
    `Folder ${PARTNERS_FOLDER_SLUG}/: would create, new stories default to "${PARTNER_COMPONENT}"`,
  );
  if (APPLY) {
    const { story } = await mapi('POST', '/stories', {
      story: {
        name: 'Partners',
        slug: PARTNERS_FOLDER_SLUG,
        is_folder: true,
        parent_id: 0,
        default_root: PARTNER_COMPONENT,
      },
    });
    console.log(`  created #${story.id}`);
  }
}

logMode();
await ensureComponent();
await ensureFolder();
