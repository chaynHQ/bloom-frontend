#!/usr/bin/env node
/**
 * 01-create-blocks.mjs — Step 1 of the resource-types migration (docs/resource-type-rename-plan.md).
 *
 * Creates the format-based resource content types and their folders in Storyblok, and widens
 * the three existing resource blocks so later steps can populate the new relation fields.
 * Everything here is ADDITIVE and invisible to the running frontend: no existing component
 * field is renamed or removed, no existing story is touched, no old folder or flat page is moved.
 *
 * WHAT IT DOES
 *   1. POST /components — five new content types (is_root, not nestable), in the "Pages" group:
 *        · resource_video     superset of resource_short_video + resource_single_video
 *                             (subtitle / references / team_members_section stay optional).
 *        · resource_audio     clone of resource_conversation.
 *        · resource_written   clone of resource_conversation with audio + audio_transcript
 *        · resource_activity  replaced by a single `body` richtext field.
 *        · resource_grounding minimal: name, description, body, languages,
 *                             included_for_partners, seo_description. No relations, no gating,
 *                             no progress — grounding never gets a backend `resource` row.
 *      All except resource_grounding also get: login_required (boolean, default true),
 *      related_content (video/audio/written/activity + the old types, for the transition) and
 *      related_grounding (resource_grounding refs only).
 *   2. POST /stories (is_folder) — video/ audio/ written/ activity/ and grounding-exercises/.
 *      The grounding folder uses a TEMP slug: the live flat `grounding` page still owns
 *      `grounding` until step 6's post-verify delete, and Storyblok slugs are unique among
 *      siblings. Step 5/6 renames grounding-exercises/ → grounding/ once the flat page is gone.
 *      related_grounding refs are by uuid, so that later rename is transparent to them.
 *   3. PUT /components — on resource_short_video, resource_single_video, resource_conversation:
 *      add related_grounding, and add resource_activity to related_content's content-type
 *      filter (step 3 fills related_grounding; step 6 backfills the activity refs).
 *
 * Idempotent: a component / folder / field that already exists is left as-is and reported as
 * "skip". Safe to re-run.
 *
 * SAFETY
 *   · Dry-run by default. Nothing is written unless you pass BOTH --write and --yes.
 *   · Before any PUT, every component it will modify is snapshotted to .storyblok-provision/.
 *   · Every run writes a manifest (planned + performed changes, full request payloads) to
 *     .storyblok-provision/01-create-blocks.<timestamp>.json — diff it before the live run.
 *   · Requests are sequential with a short pace delay; 429s retry with backoff.
 *
 * USAGE
 *   node scripts/storyblok/01-create-blocks.mjs                 # dry-run: print + write manifest
 *   node scripts/storyblok/01-create-blocks.mjs --write --yes   # apply to the Storyblok space
 *
 * ENV (.env.local is auto-loaded):
 *   STORYBLOK_OAUTH_TOKEN   Management API token (Personal access token or OAuth) with write
 *                           scope for this space. NOT the public NEXT_PUBLIC_STORYBLOK_TOKEN.
 *   STORYBLOK_SPACE_ID      Numeric space id.
 *   STORYBLOK_MAPI_BASE     Optional. Default https://mapi.storyblok.com/v1 (EU).
 *   STORYBLOK_AUTH_SCHEME   Optional. Set to "bearer" to skip the raw-token attempt.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.join(__dirname, '..', '..');
const OUT_DIR = path.join(REPO_ROOT, '.storyblok-provision');

const PAGES_GROUP_UUID = '1188f7f4-5755-45f6-9efd-59be3905a022';

// The grounding folder can't take the slug `grounding` yet — see the header note.
const GROUNDING_FOLDER_SLUG = 'grounding-exercises';

// related_content on the NEW blocks accepts new + old resource types plus courses/sessions,
// so editors can cross-link freely during the migration. Old types are trimmed in step 7d/8.
const RELATED_CONTENT_FILTER = [
  'Course',
  'Session',
  'session_iba',
  'resource_video',
  'resource_audio',
  'resource_written',
  'resource_activity',
  'resource_short_video',
  'resource_single_video',
  'resource_conversation',
];

// Only the three that need it get pointed at resource_grounding.
const RELATED_GROUNDING_FILTER = ['resource_grounding'];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const PACE_MS = 350;

// ----------------------------- args & env ------------------------------

function parseArgs(argv) {
  const args = { write: false, yes: false };
  for (const a of argv) {
    if (a === '--write') args.write = true;
    else if (a === '--yes') args.yes = true;
    else if (a === '--dry-run') args.write = false;
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
  const v = process.env[name];
  if (!v) {
    console.error(`Missing required env var: ${name}`);
    process.exit(1);
  }
  return v;
}

// ----------------------------- Storyblok Management API ------------------------------

function mapiBase() {
  return (process.env.STORYBLOK_MAPI_BASE || 'https://mapi.storyblok.com/v1').replace(/\/$/, '');
}

// Personal access tokens use the raw token; OAuth tokens need a "Bearer " prefix. Try raw
// first, fall back to Bearer once on a 401, and remember which worked. Retry on HTTP 429.
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

  for (let attempt = 0; attempt < 6; attempt++) {
    let res = await send(authPrefix);
    if (res.status === 401 && authPrefix === '') {
      const alt = await send('Bearer ');
      if (alt.ok) {
        authPrefix = 'Bearer ';
        res = alt;
      }
    }
    if (res.status === 429) {
      await sleep(1000 * (attempt + 1));
      continue;
    }
    if (!res.ok) {
      const text = await res.text();
      const hint =
        res.status === 401
          ? '\n  → 401 means STORYBLOK_OAUTH_TOKEN is not a Management API token with access ' +
            'to this space (it must be a Personal access token or OAuth token — NOT the public ' +
            'delivery token), or STORYBLOK_SPACE_ID / region (STORYBLOK_MAPI_BASE) is wrong.'
          : '';
      throw new Error(`Storyblok ${method} ${route} → ${res.status}: ${text}${hint}`);
    }
    return res.status === 204 ? null : res.json();
  }
  throw new Error(`Storyblok ${method} ${route} → too many rate-limit retries`);
}

async function listComponents() {
  const out = [];
  for (let page = 1; page < 20; page++) {
    const data = await mapi('GET', `/components?per_page=100&page=${page}`);
    const batch = data.components || [];
    out.push(...batch);
    if (batch.length < 100) break;
  }
  return out;
}

async function findFolderBySlug(slug) {
  const data = await mapi('GET', `/stories?by_slugs=${encodeURIComponent(slug)}`);
  return (data.stories || []).find((s) => s.is_folder && s.slug === slug);
}

// ----------------------------- schema helpers ------------------------------

const clone = (v) => JSON.parse(JSON.stringify(v));

/**
 * Take field `key` from a fetched component's schema, deep-clone it, drop the source `id`
 * (Storyblok mints a fresh one per component) and `pos` (re-assigned by buildSchema), and
 * apply overrides.
 */
function field(sourceSchema, key, overrides = {}) {
  const src = sourceSchema[key];
  if (!src) throw new Error(`expected field "${key}" on source component schema`);
  const f = clone(src);
  delete f.id;
  delete f.pos;
  return { ...f, ...overrides };
}

const loginRequiredField = () => ({
  type: 'boolean',
  default_value: true,
  description:
    'When enabled, logged-out visitors see a preview with a login prompt instead of the ' +
    'full resource. Leave enabled unless this resource is intentionally public.',
});

const relatedGroundingField = () => ({
  type: 'options',
  is_reference_type: true,
  source: 'internal_stories',
  entry_appearance: 'card',
  allow_advanced_search: true,
  filter_content_type: [...RELATED_GROUNDING_FILTER],
  translatable: false,
  description: 'Grounding exercises related to this resource, shown as cards. Ordered here.',
});

// A rich main-content field for the text-first resource types (written / activity / grounding).
const bodyField = (required = true) => ({
  type: 'richtext',
  translatable: true,
  required,
  description: 'The main content of this resource.',
  customize_toolbar: true,
  toolbar: [
    'bold',
    'italic',
    'underline',
    'strike',
    'h2',
    'h3',
    'h4',
    'list',
    'olist',
    'hrule',
    'link',
    'blok',
    'paragraph',
    'undo',
    'redo',
    'copy',
    'cut',
    'paste-action',
    'ai-translate',
    'ai-spelling',
  ],
  restrict_type: '',
  restrict_components: true,
  component_whitelist: [
    'image',
    'video',
    'audio',
    'row',
    'row_new',
    'quote',
    'quote_card',
    'button',
    'statement',
    'accordion',
    'card',
    'link_card',
    'spacer',
    'testimonial_card',
    'avatar_group',
    'icon_feature',
  ],
});

// Turn an ordered [name, def] list into a Storyblok schema object with sequential `pos`.
function buildSchema(entries) {
  const schema = {};
  entries.forEach(([name, def], i) => {
    schema[name] = { ...def, pos: i };
  });
  return schema;
}

// ----------------------------- new component schemas ------------------------------

function buildNewComponents(src) {
  const short = src.resource_short_video.schema;
  const single = src.resource_single_video.schema;
  const conv = src.resource_conversation.schema;

  const relatedContentForNew = (from, key) =>
    field(from, key, {
      filter_content_type: [...RELATED_CONTENT_FILTER],
      description: 'Related courses, sessions and resources, shown as cards. Ordered here.',
    });

  // resource_video — union of short + single. related_session / related_exercises dropped
  // (decision 3). subtitle / references / team_members_section stay optional.
  const resource_video = buildSchema([
    ['name', field(single, 'name')],
    ['subtitle', field(single, 'subtitle')],
    ['description', field(single, 'description')],
    ['seo_description', field(single, 'seo_description')],
    ['included_for_partners', field(single, 'included_for_partners')],
    ['languages', field(single, 'languages')],
    ['login_required', loginRequiredField()],
    ['video', field(single, 'video')],
    ['preview_image', field(single, 'preview_image')],
    ['duration', field(single, 'duration')],
    ['video_transcript', field(single, 'video_transcript')],
    ['references', field(single, 'references')],
    ['team_members_section', field(single, 'team_members_section')],
    ['page_sections', field(single, 'page_sections')],
    ['related_content', relatedContentForNew(single, 'related_content')],
    ['related_grounding', relatedGroundingField()],
    ['themes', field(single, 'themes')],
    ['contributor_images', field(single, 'contributor_images')],
    ['contributors_description', field(single, 'contributors_description')],
  ]);
  void short; // short adds nothing single lacks except related_session, which is dropped.

  // resource_audio — clone of resource_conversation. related_exercises dropped.
  const resource_audio = buildSchema([
    ['name', field(conv, 'name')],
    ['description', field(conv, 'description')],
    ['seo_description', field(conv, 'seo_description')],
    ['header_image', field(conv, 'header_image')],
    ['included_for_partners', field(conv, 'included_for_partners')],
    ['languages', field(conv, 'languages')],
    ['login_required', loginRequiredField()],
    ['audio', field(conv, 'audio')],
    ['duration', field(conv, 'duration')],
    ['audio_transcript', field(conv, 'audio_transcript')],
    ['page_sections', field(conv, 'page_sections')],
    ['related_content', relatedContentForNew(conv, 'related_content')],
    ['related_grounding', relatedGroundingField()],
    ['themes', field(conv, 'themes')],
    ['contributor_images', field(conv, 'contributor_images')],
    ['contributors_description', field(conv, 'contributors_description')],
    ['team_members_section', field(conv, 'team_members_section')],
  ]);

  // resource_written / resource_activity — clone of resource_conversation with
  // audio + audio_transcript swapped for a single `body` richtext field.
  const textResource = () =>
    buildSchema([
      ['name', field(conv, 'name')],
      ['description', field(conv, 'description')],
      ['seo_description', field(conv, 'seo_description')],
      ['header_image', field(conv, 'header_image')],
      ['included_for_partners', field(conv, 'included_for_partners')],
      ['languages', field(conv, 'languages')],
      ['login_required', loginRequiredField()],
      ['body', bodyField()],
      ['duration', field(conv, 'duration')],
      ['page_sections', field(conv, 'page_sections')],
      ['related_content', relatedContentForNew(conv, 'related_content')],
      ['related_grounding', relatedGroundingField()],
      ['themes', field(conv, 'themes')],
      ['contributor_images', field(conv, 'contributor_images')],
      ['contributors_description', field(conv, 'contributors_description')],
      ['team_members_section', field(conv, 'team_members_section')],
    ]);

  // resource_grounding — minimal. No relations, no login_required, no progress fields.
  const resource_grounding = buildSchema([
    ['name', field(conv, 'name')],
    ['description', field(conv, 'description', { required: false })],
    ['body', bodyField()],
    ['duration', field(conv, 'duration', { required: false })],
    ['seo_description', field(conv, 'seo_description')],
    ['languages', field(conv, 'languages')],
    ['included_for_partners', field(conv, 'included_for_partners')],
  ]);

  return {
    resource_video: {
      schema: resource_video,
      description: 'Video resource (shorts + somatic videos merge here in step 7).',
    },
    resource_audio: {
      schema: resource_audio,
      description: 'Audio resource (conversations become this in step 7).',
    },
    resource_written: { schema: textResource(), description: 'Written resource.' },
    resource_activity: { schema: textResource(), description: 'Activity resource.' },
    resource_grounding: {
      schema: resource_grounding,
      description: 'Grounding exercise. Not in the library; produces no backend resource row.',
    },
  };
}

// ----------------------------- folders ------------------------------

const FOLDERS = [
  { name: 'Video', slug: 'video', root: 'resource_video' },
  { name: 'Audio', slug: 'audio', root: 'resource_audio' },
  { name: 'Written', slug: 'written', root: 'resource_written' },
  { name: 'Activity', slug: 'activity', root: 'resource_activity' },
  { name: 'Grounding exercises', slug: GROUNDING_FOLDER_SLUG, root: 'resource_grounding' },
];

const folderStoryPayload = (f) => ({
  story: {
    name: f.name,
    slug: f.slug,
    is_folder: true,
    parent_id: 0,
    default_root: f.root,
    content: { content_types: [f.root], lock_subfolders_content_types: false },
  },
});

// ----------------------------- existing-component widening ------------------------------

/**
 * Return a shallow-cloned component with related_grounding added and resource_activity
 * appended to related_content's filter — or null if it already has both (nothing to do).
 */
function planWiden(component) {
  const schema = clone(component.schema);
  let changed = false;

  if (!schema.related_grounding) {
    const maxPos = Math.max(-1, ...Object.values(schema).map((f) => f.pos ?? 0));
    schema.related_grounding = { ...relatedGroundingField(), pos: maxPos + 1 };
    changed = true;
  }

  const rc = schema.related_content;
  if (
    rc &&
    Array.isArray(rc.filter_content_type) &&
    !rc.filter_content_type.includes('resource_activity')
  ) {
    rc.filter_content_type = [...rc.filter_content_type, 'resource_activity'];
    changed = true;
  }

  return changed ? { ...component, schema } : null;
}

/**
 * Ensure the `body` field's component whitelist on a text resource type is a superset of
 * `bodyField().component_whitelist` — union only, never removes. Returns a cloned component
 * to PUT, or null if nothing is missing. Runs for components that already exist so a
 * whitelist widened after first creation (e.g. `audio`, needed by grounding exercises)
 * still lands. Safe/idempotent.
 */
function planBodyWhitelist(component) {
  const want = bodyField().component_whitelist;
  const body = component.schema?.body;
  if (!body || !Array.isArray(body.component_whitelist)) return null;
  const missing = want.filter((c) => !body.component_whitelist.includes(c));
  if (!missing.length) return null;
  const schema = clone(component.schema);
  schema.body.component_whitelist = [...body.component_whitelist, ...missing];
  return { payload: { component: { ...component, schema } }, missing };
}

/**
 * Add the `duration` field to an already-created `resource_grounding` component (it was missing
 * from the original schema — added later once the grounding cards needed it). Values are left
 * blank; the content team fills them in per-item. Returns null if the field already exists.
 */
function planGroundingDuration(component, convSchema) {
  if (component.schema?.duration) return null;
  const schema = clone(component.schema);
  const maxPos = Math.max(-1, ...Object.values(schema).map((f) => f.pos ?? 0));
  schema.duration = { ...field(convSchema, 'duration', { required: false }), pos: maxPos + 1 };
  return { component: { ...component, schema } };
}

// ----------------------------- run ------------------------------

async function main() {
  loadDotEnv();
  const args = parseArgs(process.argv.slice(2));
  const live = args.write && args.yes;
  if (args.write && !args.yes) {
    console.error('--write requires --yes (safety confirmation). Aborting.');
    process.exit(1);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const manifest = {
    script: '01-create-blocks',
    startedAt: new Date().toISOString(),
    mode: live ? 'write' : 'dry-run',
    space: process.env.STORYBLOK_SPACE_ID,
    components: { created: [], skipped: [], widened: [], widenSkipped: [], bodyWhitelist: [] },
    folders: { created: [], skipped: [] },
    payloads: {},
  };

  console.log(`\nMode: ${live ? 'WRITE' : 'DRY-RUN'} | space ${process.env.STORYBLOK_SPACE_ID}\n`);

  const existing = await listComponents();
  const byName = Object.fromEntries(existing.map((c) => [c.name, c]));

  for (const name of ['resource_short_video', 'resource_single_video', 'resource_conversation']) {
    if (!byName[name]) throw new Error(`source component "${name}" not found in this space`);
  }

  // Snapshot the components we may modify, before anything.
  const snapshot = {
    takenAt: new Date().toISOString(),
    components: Object.fromEntries(
      ['resource_short_video', 'resource_single_video', 'resource_conversation'].map((n) => [
        n,
        byName[n],
      ]),
    ),
  };
  const snapPath = path.join(OUT_DIR, `01-create-blocks.snapshot.${stamp}.json`);
  fs.writeFileSync(snapPath, JSON.stringify(snapshot, null, 2));
  console.log(`Snapshot of source components → ${path.relative(REPO_ROOT, snapPath)}`);

  const newComponents = buildNewComponents(byName);

  // 1) Create new components.
  for (const [name, { schema, description }] of Object.entries(newComponents)) {
    const payload = {
      component: {
        name,
        display_name: null,
        is_root: true,
        is_nestable: false,
        component_group_uuid: PAGES_GROUP_UUID,
        description,
        schema,
      },
    };
    manifest.payloads[`POST /components ${name}`] = payload;

    if (byName[name]) {
      console.log(`  component  skip    ${name} (already exists, id ${byName[name].id})`);
      manifest.components.skipped.push(name);
      continue;
    }
    if (!live) {
      console.log(`  component  plan    ${name} (${Object.keys(schema).length} fields)`);
      manifest.components.created.push({ name, planned: true });
      continue;
    }
    const res = await mapi('POST', '/components', payload);
    console.log(`  component  created ${name} (id ${res.component.id})`);
    manifest.components.created.push({ name, id: res.component.id });
    await sleep(PACE_MS);
  }

  // 2) Create folders.
  for (const f of FOLDERS) {
    const payload = folderStoryPayload(f);
    manifest.payloads[`POST /stories folder ${f.slug}`] = payload;

    const found = await findFolderBySlug(f.slug);
    if (found) {
      console.log(`  folder     skip    ${f.slug}/ (already exists, id ${found.id})`);
      manifest.folders.skipped.push(f.slug);
      continue;
    }
    if (!live) {
      console.log(`  folder     plan    ${f.slug}/  (default_root ${f.root})`);
      manifest.folders.created.push({ slug: f.slug, planned: true });
      continue;
    }
    const res = await mapi('POST', '/stories', payload);
    console.log(`  folder     created ${f.slug}/ (id ${res.story.id})`);
    manifest.folders.created.push({ slug: f.slug, id: res.story.id });
    await sleep(PACE_MS);
  }

  // 3) Widen the three existing resource blocks.
  for (const name of ['resource_short_video', 'resource_single_video', 'resource_conversation']) {
    // Re-fetch so we PUT back the current definition plus our additions only.
    const { component } = await mapi('GET', `/components/${byName[name].id}`);
    const widened = planWiden(component);
    if (!widened) {
      console.log(`  widen      skip    ${name} (already has related_grounding + activity filter)`);
      manifest.components.widenSkipped.push(name);
      continue;
    }
    const payload = { component: widened };
    manifest.payloads[`PUT /components ${name}`] = payload;
    const addedFilter = widened.schema.related_content?.filter_content_type || [];
    if (!live) {
      console.log(
        `  widen      plan    ${name} (+related_grounding, related_content filter → [${addedFilter.join(', ')}])`,
      );
      manifest.components.widened.push({ name, planned: true });
      continue;
    }
    const res = await mapi('PUT', `/components/${byName[name].id}`, payload);
    console.log(`  widen      done    ${name} (id ${res.component.id})`);
    manifest.components.widened.push({ name, id: res.component.id });
    await sleep(PACE_MS);
  }

  // 4) Converge the `body` whitelist on the text resource types (picks up entries added to
  //    bodyField() after the components were first created — e.g. `audio` for grounding).
  for (const name of ['resource_written', 'resource_activity', 'resource_grounding']) {
    const id = byName[name]?.id;
    if (!id) continue; // just created above in the same run — already has the current whitelist
    const { component } = await mapi('GET', `/components/${id}`);
    const plan = planBodyWhitelist(component);
    if (!plan) {
      console.log(`  body-wl    skip    ${name} (whitelist already complete)`);
      continue;
    }
    manifest.payloads[`PUT /components ${name} (body whitelist)`] = plan.payload;
    if (!live) {
      console.log(`  body-wl    plan    ${name} (+[${plan.missing.join(', ')}])`);
      manifest.components.bodyWhitelist.push({ name, missing: plan.missing, planned: true });
      continue;
    }
    const res = await mapi('PUT', `/components/${id}`, plan.payload);
    console.log(`  body-wl    done    ${name} (+[${plan.missing.join(', ')}])`);
    manifest.components.bodyWhitelist.push({ name, missing: plan.missing, id: res.component.id });
    await sleep(PACE_MS);
  }

  // 5) Add the `duration` field to resource_grounding if it's missing (blank values — the
  //    content team fills them in per-item).
  {
    const id = byName.resource_grounding?.id;
    if (id) {
      const { component } = await mapi('GET', `/components/${id}`);
      const plan = planGroundingDuration(component, byName.resource_conversation.schema);
      if (!plan) {
        console.log('  duration   skip    resource_grounding (field already exists)');
      } else {
        manifest.payloads['PUT /components resource_grounding (duration field)'] = {
          component: plan.component,
        };
        if (!live) {
          console.log('  duration   plan    resource_grounding (+duration)');
        } else {
          const res = await mapi('PUT', `/components/${id}`, { component: plan.component });
          console.log(`  duration   done    resource_grounding (id ${res.component.id})`);
          await sleep(PACE_MS);
        }
      }
    }
  }

  manifest.finishedAt = new Date().toISOString();
  const manifestPath = path.join(OUT_DIR, `01-create-blocks.${stamp}.json`);
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  console.log(`\nManifest → ${path.relative(REPO_ROOT, manifestPath)}`);
  if (!live) {
    console.log(
      '\nDRY-RUN — nothing was written. Review the manifest payloads, then re-run with --write --yes.',
    );
  } else {
    console.log('\nDone. Verify the new components/folders in the Storyblok editor.');
  }
}

main().catch((err) => {
  console.error(`\n✗ ${err.message}`);
  process.exit(1);
});
