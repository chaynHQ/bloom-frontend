/**
 * Creates draft partners/ and welcome/ stories for the plan's three test partners.
 *
 *   node scripts/partners/createTestPartners.mjs                                # dry run
 *   node scripts/partners/createTestPartners.mjs --apply
 *   node scripts/partners/createTestPartners.mjs --publish-partners             # dry run
 *   node scripts/partners/createTestPartners.mjs --publish-partners --apply [--wait=30]
 *
 * --publish-partners briefly publishes the three partners/ stories so the staging backend's
 * webhook creates their rows, then unpublishes them. Run it only once PR 1 is on staging.
 * Their welcome stories are never published, so a test partner can never launch in production.
 * Never add them to the partners datasource: editors would see them in every
 * "Included for partners" picker.
 */
import {
  APPLY,
  assetOrPlaceholder,
  ensureAsset,
  ensureStory,
  findStory,
  getStory,
  logMode,
  mapi,
  PARTNER_COMPONENT,
  PARTNERS_FOLDER_SLUG,
  requireFolder,
} from './lib.mjs';

const TEST_PARTNERS = [
  { slug: 'test-partner', name: 'Test Partner', legal_name: 'TEST PARTNER LTD' },
  { slug: 'test-partner-plus', name: 'Test Partner Plus', legal_name: 'TEST PARTNER PLUS LTD' },
  { slug: 'retired-partner', name: 'Retired Partner', legal_name: 'RETIRED PARTNER LTD' },
];
const WELCOME_FOLDER_SLUG = 'welcome';
const LOGO_FILE = 'bloom_logo.svg';
// Bloom's primary palette colour; brand_color is required.
const BRAND_COLOR = '#f3d6d8';
const WAIT_SECONDS = Number(process.argv.find((a) => a.startsWith('--wait='))?.split('=')[1] ?? 30);

async function create() {
  const partnersFolder = await requireFolder(PARTNERS_FOLDER_SLUG);
  const welcomeFolder = await requireFolder(WELCOME_FOLDER_SLUG);
  const bumbleWelcome = await findStory(`${WELCOME_FOLDER_SLUG}/bumble`);
  if (!bumbleWelcome) throw new Error('welcome/bumble not found');
  // The Management API returns the draft, which is what the test welcome pages copy.
  const welcomeContent = (await getStory(bumbleWelcome.id)).content;

  const logoResult = await ensureAsset(LOGO_FILE);
  console.log(`  logo: ${logoResult.note}`);
  const logo = assetOrPlaceholder(logoResult, LOGO_FILE);

  for (const { slug, name, legal_name } of TEST_PARTNERS) {
    const content = {
      component: PARTNER_COMPONENT,
      name,
      legal_name,
      logo,
      brand_color: BRAND_COLOR,
    };
    if (!APPLY) console.log(`    ${JSON.stringify(content)}`);
    await ensureStory({
      fullSlug: `${PARTNERS_FOLDER_SLUG}/${slug}`,
      name: `${name} (test)`,
      parentId: partnersFolder.id,
      content,
    });
    await ensureStory({
      fullSlug: `${WELCOME_FOLDER_SLUG}/${slug}`,
      name: `${name} (test)`,
      parentId: welcomeFolder.id,
      content: welcomeContent,
    });
  }
}

async function publishPartners() {
  const stories = [];
  for (const { slug } of TEST_PARTNERS) {
    const fullSlug = `${PARTNERS_FOLDER_SLUG}/${slug}`;
    const story = await findStory(fullSlug);
    if (!story) throw new Error(`${fullSlug} not found. Run with --apply first.`);
    stories.push(story);
  }
  console.log(
    `Would publish ${stories.map((s) => s.full_slug).join(', ')}, ` +
      `wait ${WAIT_SECONDS}s for the webhooks, then unpublish them`,
  );
  if (!APPLY) return;
  const published = [];
  try {
    for (const story of stories) {
      await mapi('GET', `/stories/${story.id}/publish`);
      published.push(story);
      console.log(`  published ${story.full_slug}`);
    }
    await new Promise((resolve) => setTimeout(resolve, WAIT_SECONDS * 1000));
  } finally {
    // Also after a failed publish: none of them should stay published in the shared space.
    for (const story of published) {
      await mapi('GET', `/stories/${story.id}/unpublish`);
      console.log(`  unpublished ${story.full_slug}`);
    }
  }
}

logMode();
await (process.argv.includes('--publish-partners') ? publishPartners() : create());
