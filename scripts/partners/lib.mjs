import fs from 'node:fs';
import path from 'node:path';
import { loadDotEnv, mapi, REPO_ROOT } from '../storyblokLokalise.lib.mjs';

export { mapi };

loadDotEnv();

// Where the migration's inputs (constants, public/ files, footer strings) are read from. Phase 3
// deletes those files once the stories exist, so the tests point this at their own copies.
export const SOURCE_ROOT = process.env.PARTNERS_SOURCE_ROOT || REPO_ROOT;

export const APPLY = process.argv.includes('--apply');
export const PUBLISH = process.argv.includes('--publish');

export const PARTNER_COMPONENT = 'partner';
export const PARTNERS_FOLDER_SLUG = 'partners';
// Storyblok's existing "Partners" asset folder, already used for welcome page images.
export const PARTNERS_ASSET_FOLDER_ID = 133253;

export function logMode() {
  console.log(
    APPLY
      ? 'APPLY: writing to Storyblok\n'
      : 'DRY RUN: nothing is written. Re-run with --apply to write.\n',
  );
}

export async function findStory(fullSlug) {
  const { stories } = await mapi('GET', `/stories?with_slug=${encodeURIComponent(fullSlug)}`);
  return stories[0] || null;
}

export async function getStory(id) {
  const { story } = await mapi('GET', `/stories/${id}`);
  return story;
}

function svgSize(svg, file) {
  const root = svg.match(/<svg\b[^>]*>/)[0];
  const attr = (name) => root.match(new RegExp(`\\s${name}="([\\d.]+)(px)?"`))?.[1];
  let w = attr('width');
  let h = attr('height');
  if (!w || !h) {
    const vb = root.match(/viewBox="[\d.-]+[\s,]+[\d.-]+[\s,]+([\d.]+)[\s,]+([\d.]+)"/);
    if (!vb) throw new Error(`${file}: no width/height or viewBox`);
    [w, h] = [vb[1], vb[2]];
  }
  return `${Math.round(Number(w))}x${Math.round(Number(h))}`;
}

function toCdnUrl(filename) {
  return filename.replace(
    /^https?:\/\/s3\.amazonaws\.com\/a\.storyblok\.com\//,
    'https://a.storyblok.com/',
  );
}

function assetField(asset) {
  return {
    id: asset.id,
    alt: '',
    name: '',
    focus: '',
    title: '',
    source: '',
    filename: toCdnUrl(asset.filename),
    copyright: '',
    fieldtype: 'asset',
    meta_data: {},
    is_external_url: false,
  };
}

const assetCache = new Map();

async function findAsset(basename) {
  const { assets } = await mapi(
    'GET',
    `/assets?per_page=100&in_folder=${PARTNERS_ASSET_FOLDER_ID}&search=${encodeURIComponent(basename)}`,
  );
  return assets.find((a) => !a.deleted_at && a.filename.split('/').pop() === basename) || null;
}

/**
 * Reuses an asset of the same filename in the Partners folder, so re-runs don't duplicate
 * uploads. The size goes into the asset URL (/f/<space>/<w>x<h>/…), which the frontend reads
 * for next/image's width and height.
 */
export async function ensureAsset(publicFile) {
  if (assetCache.has(publicFile)) return assetCache.get(publicFile);
  const filePath = path.join(SOURCE_ROOT, 'public', publicFile);
  const body = fs.readFileSync(filePath);
  const size = svgSize(body.toString('utf8'), publicFile);
  const existing = await findAsset(publicFile);
  let result;
  if (existing) {
    result = { asset: existing, note: `reuse asset #${existing.id}` };
  } else if (!APPLY) {
    result = { asset: null, note: `upload ${publicFile} (${size})` };
  } else {
    const signed = await mapi('POST', '/assets', {
      filename: publicFile,
      size,
      asset_folder_id: PARTNERS_ASSET_FOLDER_ID,
    });
    const form = new FormData();
    for (const [k, v] of Object.entries(signed.fields)) form.append(k, v);
    form.append('file', new Blob([body], { type: 'image/svg+xml' }), publicFile);
    const res = await fetch(signed.post_url, { method: 'POST', body: form });
    if (!res.ok) {
      // The asset record already exists; left behind, a re-run would reuse it with no file.
      await mapi('DELETE', `/assets/${signed.id}`);
      throw new Error(`S3 upload of ${publicFile} → ${res.status}: ${await res.text()}`);
    }
    await mapi('GET', `/assets/${signed.id}/finish_upload`);
    const asset = await mapi('GET', `/assets/${signed.id}`);
    result = { asset, note: `uploaded ${publicFile} as asset #${asset.id}` };
  }
  assetCache.set(publicFile, result);
  return result;
}

export function assetOrPlaceholder({ asset }, publicFile) {
  return asset ? assetField(asset) : `<asset ${publicFile}>`;
}

/**
 * Creates the story if its slug is free. An existing story is never overwritten (editors may
 * have changed it); the fields that differ from what this script would write are listed instead.
 */
export async function ensureStory({ fullSlug, name, parentId, content }) {
  const existing = await findStory(fullSlug);
  if (existing) {
    const current = (await getStory(existing.id)).content;
    const diffs = Object.keys(content).filter(
      (k) => JSON.stringify(normalise(current[k])) !== JSON.stringify(normalise(content[k])),
    );
    console.log(`  ${fullSlug}: exists (#${existing.id}), left as is`);
    for (const k of diffs) console.log(`    differs: ${k}`);
    return existing;
  }
  if (!APPLY) {
    console.log(`  ${fullSlug}: would create draft "${name}"`);
    return null;
  }
  const { story } = await mapi('POST', '/stories', {
    story: { name, slug: fullSlug.split('/').pop(), parent_id: parentId, content },
  });
  console.log(`  ${fullSlug}: created draft #${story.id}`);
  return story;
}

function normalise(v) {
  if (v && typeof v === 'object' && v.fieldtype === 'asset') return v.filename;
  return v ?? '';
}

export async function requireFolder(slug) {
  const folder = await findStory(slug);
  if (!folder?.is_folder) {
    if (!APPLY) return { id: `<${slug}/ folder>` };
    throw new Error(`Folder ${slug}/ not found. Run createPartnerSchema.mjs --apply first.`);
  }
  return folder;
}
