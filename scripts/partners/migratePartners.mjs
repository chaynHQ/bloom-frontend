/**
 * Creates draft partners/bumble, partners/badoo and partners/fruitz from
 * lib/constants/partners.ts, the files in public/ and the English footer strings.
 *
 *   node scripts/partners/migratePartners.mjs                      # dry run
 *   node scripts/partners/migratePartners.mjs --apply
 *   node scripts/partners/migratePartners.mjs --publish            # dry run of the publish
 *   node scripts/partners/migratePartners.mjs --publish --apply    # only after staging sign-off
 *
 * A publish fires both backends' and both frontends' webhooks.
 */
import fs from 'node:fs';
import path from 'node:path';
import {
  APPLY,
  assetOrPlaceholder,
  ensureAsset,
  ensureStory,
  findStory,
  logMode,
  mapi,
  PARTNER_COMPONENT,
  PARTNERS_FOLDER_SLUG,
  PUBLISH,
  requireFolder,
  SOURCE_ROOT,
} from './lib.mjs';

const SLUGS = ['bumble', 'badoo', 'fruitz'];
const SOCIALS = ['website', 'facebook', 'instagram', 'twitter', 'youtube', 'tiktok'];

function readConstants() {
  const src = fs.readFileSync(path.join(SOURCE_ROOT, 'lib/constants/partners.ts'), 'utf8');
  const files = Object.fromEntries(
    [...src.matchAll(/^import (\w+) from '@\/public\/([^']+)';$/gm)].map((m) => [m[1], m[2]]),
  );
  const partners = {};
  for (const [, key, body] of src.matchAll(
    /const (\w+)Content: PartnerContent = \{([\s\S]*?)\n\};/g,
  )) {
    const entries = [...body.matchAll(/^\s*(\w+): (?:'([^']*)'|(\w+)),?$/gm)].map(
      ([, k, str, ident]) => [k, str ?? files[ident]],
    );
    partners[key] = Object.fromEntries(entries);
  }
  return partners;
}

/** The illustration's background circle: its first filled shape, or a gradient's first stop. */
function circleFill(svg) {
  const classFills = Object.fromEntries(
    [...svg.matchAll(/\.([\w-]+)\{[^}]*?fill:\s*([^;}]+)/g)].map((m) => [m[1], m[2].trim()]),
  );
  for (const [, attrs] of svg.matchAll(/<(?:circle|ellipse|path|rect|polygon)\b([^>]*)>/g)) {
    const fill =
      attrs.match(/\sfill="([^"]+)"/)?.[1] ??
      attrs.match(/style="[^"]*fill:\s*([^;"]+)/)?.[1] ??
      classFills[attrs.match(/class="([^"]+)"/)?.[1]];
    if (!fill || fill === 'none' || fill === 'transparent') continue;
    const gradientId = fill.match(/^url\(#([^)]+)\)$/)?.[1];
    const color = gradientId
      ? svg
          .match(new RegExp(`<(?:linear|radial)Gradient[^>]*id="${gradientId}"[\\s\\S]*?</`))?.[0]
          .match(/<stop[^>]*stop-color="([^"]+)"/)?.[1]
      : fill;
    if (!/^#[0-9a-fA-F]{6}$/.test(color ?? '')) throw new Error(`Unreadable circle fill: ${fill}`);
    return color.toLowerCase();
  }
  throw new Error('No filled shape found');
}

async function datasourceNames() {
  const { datasources } = await mapi('GET', '/datasources');
  const ds = datasources.find((d) => d.slug === 'partners');
  if (!ds) throw new Error('No "partners" datasource');
  const { datasource_entries } = await mapi(
    'GET',
    `/datasource_entries?datasource_id=${ds.id}&per_page=100`,
  );
  return Object.fromEntries(datasource_entries.map((e) => [e.name, e.value]));
}

// Everything is read and checked before the first write, so a bad partner can't leave the
// others half-migrated.
async function readPartners() {
  const constants = readConstants();
  const footer = JSON.parse(
    fs.readFileSync(path.join(SOURCE_ROOT, 'i18n/messages/shared/en.json'), 'utf8'),
  ).Shared.footer;
  const names = await datasourceNames();

  return SLUGS.map((slug) => {
    const c = constants[slug] ?? {};
    if (names[slug] !== c.name) {
      throw new Error(`${slug}: datasource value "${names[slug]}" ≠ constants name "${c.name}"`);
    }
    const files = {
      logo: c.logo,
      partnership_logo: c.partnershipLogo,
      illustration: c.bloomGirlIllustration,
    };
    const legalName = footer[`${slug}Line2`];
    const missing = Object.entries({ ...files, legal_name: legalName, website: c.website })
      .filter(([, v]) => !v)
      .map(([k]) => k);
    if (missing.length) throw new Error(`${slug}: missing ${missing.join(', ')}`);
    return {
      slug,
      files,
      fields: {
        component: PARTNER_COMPONENT,
        name: c.name,
        legal_name: legalName,
        brand_color: circleFill(
          fs.readFileSync(path.join(SOURCE_ROOT, 'public', files.illustration), 'utf8'),
        ),
        ...Object.fromEntries(SOCIALS.map((k) => [k, c[k] ?? ''])),
      },
    };
  });
}

async function create() {
  const partners = await readPartners();
  const folder = await requireFolder(PARTNERS_FOLDER_SLUG);

  for (const { slug, files, fields } of partners) {
    const assets = {};
    for (const [field, file] of Object.entries(files)) {
      const result = await ensureAsset(file);
      assets[field] = assetOrPlaceholder(result, file);
      console.log(`  ${slug}.${field}: ${result.note}`);
    }
    const content = { ...fields, ...assets };
    if (!APPLY) console.log(JSON.stringify(content, null, 2).replace(/^/gm, '    '));
    await ensureStory({
      fullSlug: `${PARTNERS_FOLDER_SLUG}/${slug}`,
      name: fields.name,
      parentId: folder.id,
      content,
    });
  }
}

async function publish() {
  const stories = [];
  for (const slug of SLUGS) {
    const fullSlug = `${PARTNERS_FOLDER_SLUG}/${slug}`;
    const story = await findStory(fullSlug);
    if (!story) throw new Error(`${fullSlug} not found. Run without --publish first.`);
    stories.push(story);
  }
  for (const story of stories) {
    if (story.published && !story.unpublished_changes) {
      console.log(`  ${story.full_slug}: already published`);
      continue;
    }
    console.log(`  ${story.full_slug}: would publish #${story.id}`);
    if (APPLY) {
      await mapi('GET', `/stories/${story.id}/publish`);
      console.log('    published');
    }
  }
}

logMode();
await (PUBLISH ? publish() : create());
