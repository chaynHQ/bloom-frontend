import de from '@/i18n/messages/shared/de.json';
import en from '@/i18n/messages/shared/en.json';
import es from '@/i18n/messages/shared/es.json';
import fr from '@/i18n/messages/shared/fr.json';
import hi from '@/i18n/messages/shared/hi.json';
import pt from '@/i18n/messages/shared/pt.json';
import { Resvg } from '@resvg/resvg-js';
import { renderIllustration } from './illustration';
import { renderLockup } from './lockup';
import {
  ensurePartnersDatasourceEntry,
  getAssetFolderId,
  getStory,
  saveStoryDraft,
  type StoryblokAsset,
  type StoryContent,
  uploadAsset,
} from './storyblok';

// Arabic and Turkish are closed to partners.
const IN_PARTNERSHIP_WITH = {
  en: en.Shared.footer.inPartnershipWith,
  de: de.Shared.footer.inPartnershipWith,
  fr: fr.Shared.footer.inPartnershipWith,
  es: es.Shared.footer.inPartnershipWith,
  pt: pt.Shared.footer.inPartnershipWith,
  hi: hi.Shared.footer.inPartnershipWith,
};
type LockupLanguage = keyof typeof IN_PARTNERSHIP_WITH;
const LOCKUP_LANGUAGES = Object.keys(IN_PARTNERSHIP_WITH) as LockupLanguage[];

const lockupField = (language: LockupLanguage) =>
  language === 'en' ? 'partnership_logo' : `partnership_logo__i18n__${language}`;
const LOCKUP_FIELD_LANGUAGES: Record<string, LockupLanguage> = Object.fromEntries(
  LOCKUP_LANGUAGES.map((language) => [lockupField(language), language]),
);

// Storyblok keeps a cleared asset as one with an empty filename, and an unset translation as no key.
const isEmpty = (value: unknown) => !(value as StoryblokAsset | null | undefined)?.filename;

export function fieldsToGenerate(content: StoryContent) {
  const lockups = LOCKUP_LANGUAGES.map(lockupField).filter((field) => isEmpty(content[field]));
  return isEmpty(content.illustration) ? [...lockups, 'illustration'] : lockups;
}

export function fillEmptyFields(content: StoryContent, generated: Record<string, StoryblokAsset>) {
  const filled = { ...content };
  for (const [field, asset] of Object.entries(generated)) {
    if (isEmpty(content[field])) filled[field] = asset;
  }
  return filled;
}

async function downloadLogo(logo: StoryblokAsset) {
  if (new URL(logo.filename).hostname !== 'a.storyblok.com') {
    throw new Error(`The partner logo isn't a Storyblok asset: ${logo.filename}`);
  }
  const response = await fetch(logo.filename);
  if (!response.ok) throw new Error(`Downloading the partner logo failed with ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}

function renderField(field: string, slug: string, content: StoryContent, logo: Buffer) {
  if (field === 'illustration') {
    const svg = renderIllustration(content.brand_color as string);
    const { width, height } = new Resvg(svg);
    return {
      filename: `illustration_bloom_head_${slug}.svg`,
      contentType: 'image/svg+xml',
      body: svg,
      width: Math.round(width),
      height: Math.round(height),
    };
  }
  const language = LOCKUP_FIELD_LANGUAGES[field];
  const { png, width, height } = renderLockup(logo, IN_PARTNERSHIP_WITH[language]);
  return {
    filename: `bloom_${slug}_logo_${language}.png`,
    contentType: 'image/png',
    body: png,
    width,
    height,
  };
}

export async function generatePartnerAssets(storyId: number) {
  const story = await getStory(storyId);
  const name = story.content.name as string | undefined;
  // On every publish, not only when images are generated: they may have been uploaded by hand.
  if (name) await ensurePartnersDatasourceEntry(story.slug, name);

  const fields = fieldsToGenerate(story.content);
  if (!fields.length) return;

  const logoAsset = story.content.logo as StoryblokAsset | undefined;
  if (!logoAsset?.filename || !story.content.brand_color) {
    console.info(`Partner images for ${story.slug} not generated: no logo or brand_color yet`);
    return;
  }
  const logo = await downloadLogo(logoAsset);
  const folderId = logoAsset.id ? await getAssetFolderId(logoAsset.id) : null;

  const generated: Record<string, StoryblokAsset> = {};
  for (const field of fields) {
    const file = renderField(field, story.slug, story.content, logo);
    generated[field] = await uploadAsset({ ...file, folderId });
  }

  // Read again just before writing: an editor may have saved the story while assets uploaded.
  const current = await getStory(storyId);
  await saveStoryDraft(storyId, fillEmptyFields(current.content, generated));
}
